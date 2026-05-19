import fs from "node:fs";
import Papa from "papaparse";
import {cardDB} from "./pages/api/_db.json.ts";
import {getCollection} from "astro:content";
import path from "node:path";
import _ from "lodash";
import type {CardDatabaseEntry, DeckCardEntry, DeckCardPricing, DeckPricing} from "./types.ts";
import {quantile} from "simple-statistics";

/**
 * Get entries from the card DB that matches the name parameter, which includes alternate rarities
 * @param name The name of the card to search for
 */
async function getMatchingCards(name: string): Promise<CardDatabaseEntry[]> {
    // TODO Replace with RegExp.replace when available
    const cleanName = name.replaceAll(/[-[\]{}()*+?.,\\^$|]/g, String.raw`\$&`);
    const regex = new RegExp(String.raw`^${cleanName}\s?(\(.+\))?$`)
    return (await cardDB).filter(card => new RegExp(regex).exec(card.name));
}

/**
 * Gets the cheapest listing for a card. If there are no listings available, the output will not have the lowPrice and URL key
 * @param name The name of the card to search for
 */
export async function getCheapestListing(name: string): Promise<CardDatabaseEntry> {
    // TODO Sort rarities by length to get the "base" version so we can at least create a link
    const value = await getMatchingCards(name);
    const cards: (CardDatabaseEntry & { lowPrice: number; })[] = value.filter(card => card.lowPrice) as (CardDatabaseEntry & { lowPrice: number; })[];
    if (cards.length) {
        return cards.reduce((previousValue, currentValue) => currentValue.lowPrice < previousValue.lowPrice ? currentValue : previousValue, cards[0]);
    } else {
        return value.reduce((previousValue, currentValue) => currentValue.name.length < previousValue.name.length ? currentValue : previousValue, value[0]);
    }
}

/**
 * Returns the price objects for a deck, and separates it into core and generic card keys
 * @param deck An array of cards representing a decklist to get prices for
 */
async function getDeckPricing(deck: DeckCardEntry[]): Promise<DeckPricing> {
    const corePricing = await getCardListPricing(deck.filter(value => value.Type === "Core"))
    const genericPricing = await getCardListPricing(deck.filter(value => value.Type === "Generic"))
    return {core: corePricing, generics: genericPricing}
}

/**
 * Checks if a deck has a csv file for pricing
 * @param deck The ID of the deck to check (the ID includes the nation e.g. brandt-gate/eva)
 */
export function doesDeckHavePricingGuide(deck: string) {
    return fs.existsSync(path.join('src/content/prices', `${deck}.csv`));
}

//TODO Clean this up
async function getPricingGuide() {
    const decksWithPricingGuide = (await getCollection("decks")).map(value => value.id)
        .filter(value => doesDeckHavePricingGuide(value));
    return (await Promise.all(decksWithPricingGuide.map(async deck => {
        const deckContents = Papa.parse<DeckCardEntry>(fs.readFileSync(path.join('src/content/prices', `${deck}.csv`)).toString(), {header: true, dynamicTyping: true, skipEmptyLines: true}).data;
        const value = await getDeckPricing(deckContents);
        return ({pricing: value, id: deck});
    }))).reduce((previousValue, currentValue) => ({...previousValue, [currentValue.id]: currentValue.pricing}), {});
}

// Check all the CSVs and get the prices for them
export const pricingGuide: { [p: string]: DeckPricing } = await getPricingGuide()

const deckTotals = Object.values(pricingGuide).map(value => getPricingNumbers(value).total);
const coreTotals = Object.values(pricingGuide).map(value => getPricingNumbers(value).coreCardCosts);
const genericTotals = Object.values(pricingGuide).map(value => getPricingNumbers(value).genericCardCosts);

const rounding = 25
export const deckTotalStats = {
    tier1: Math.round(quantile(deckTotals, 0.25) / rounding) * rounding,
    tier2: Math.round(quantile(deckTotals, 0.5) / rounding) * rounding,
    tier3: Math.round(quantile(deckTotals, 0.75) / rounding) * rounding,
    tier4: Math.round(quantile(deckTotals, 0.91) / rounding) * rounding
}

export const deckCoreStats = {
    tier1: Math.round(quantile(coreTotals, 0.25) / rounding) * rounding,
    tier2: Math.round(quantile(coreTotals, 0.5) / rounding) * rounding,
    tier3: Math.round(quantile(coreTotals, 0.75) / rounding) * rounding,
    tier4: Math.round(quantile(coreTotals, 0.91) / rounding) * rounding
}

export const deckGenericStats = {
    tier1: Math.round(quantile(genericTotals, 0.25) / rounding) * rounding,
    tier2: Math.round(quantile(genericTotals, 0.5) / rounding) * rounding,
    tier3: Math.round(quantile(genericTotals, 0.75) / rounding) * rounding,
    tier4: Math.round(quantile(genericTotals, 0.91) / rounding) * rounding
}

export enum PricingCategory {
    TOTAL, GENERICS, CORE
}

/**
 * Get the pricing tier of the deck's total price
 * @param price The price of the deck
 * @param category
 * Tier 1: ~25th percentile, Tier 2: ~50th percentile, Tier 3: ~75th percentile, Tier 4: ~91st percentile, Tier 5: greater than 91st percentile
 */
export function getPricingTier(price: number, category: PricingCategory = PricingCategory.TOTAL): 1 | 2 | 3 | 4 | 5 {
    let stats;
    switch (category) {
        case PricingCategory.CORE:
            stats = deckCoreStats;
            break;
        case PricingCategory.GENERICS:
            stats = deckGenericStats
            break;
        case PricingCategory.TOTAL:
            stats = deckTotalStats;
            break;
    }
    if (_.inRange(price, 0, stats.tier1)) {
        return 1;
    } else if (_.inRange(price, stats.tier1, stats.tier2)) {
        return 2;
    } else if (_.inRange(price, stats.tier2, stats.tier3)) {
        return 3;
    } else if (_.inRange(price, stats.tier3, stats.tier4)) {
        return 4;
    } else {
        return 5;
    }
}

export async function getCardListPricing(cards: DeckCardEntry[]): Promise<DeckCardPricing[]> {
    return Promise.all(cards.map(value => getCheapestListing(value.Name)
        .then(listing => ({name: value.Name, url: listing.url, lowPrice: listing.lowPrice, quantity: value.Quantity}))))
}

/**
 * Generate a list of statistics for the deck, such as the cost of the core cards, generic cards, number of core cards and generic card, total cost, and if any listings are unavailable.
 * @param pricing The pricing object.
 * @param pricing.core The destructured core card price array.
 * @param pricing.generics The destructured generic card price array.
 */
export function getPricingNumbers({core, generics}: DeckPricing) {
    const coreCardCosts = _.sum(core.map(value => (value.lowPrice ?? 0) * value.quantity));
    const genericCardCosts = _.sum(generics.map(value => (value.lowPrice ?? 0) * value.quantity));
    const coreCardCount = _.sum(core.map(value => value.quantity));
    const genericCardCount = _.sum(generics.map(value => value.quantity));
    const total = coreCardCosts + genericCardCosts
    const isAnyListingUnavailable = core.concat(generics).some(value => !value.lowPrice)
    return {coreCardCosts, genericCardCosts, coreCardCount, genericCardCount, total, isAnyListingUnavailable};
}