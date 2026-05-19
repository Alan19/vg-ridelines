export type DeckCardEntry = {
    "Name": string;
    "Quantity": number;
    "Type": "Core" | "Generic",
    WhitelistedIDs?: number[]
};
export type CardDatabaseEntry = {
    name: string,
    cleanName: string,
    productId: number,
    groupId: number,
    url: string,
    lowPrice?: number,
}
export type DeckCardPricing = {
    name: string
    url: string
    lowPrice?: number
    quantity: number
};
export type DeckPricing = { core: DeckCardPricing[], generics: DeckCardPricing[] }