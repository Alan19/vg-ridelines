import type {InferEntrySchema} from "astro:content";
import dragonEmpire from "../assets/flags/Dragon Empire.png"
import keterSanctuary from "../assets/flags/Keter Sanctuary.png"
import brandtGate from "../assets/flags/Brandt Gate.png"
import stoicheia from "../assets/flags/Stoicheia.png"
import darkStates from "../assets/flags/Dark States.png"
import lyricalMonasterio from "../assets/flags/Lyrical Monasterio.png"
import {Nation} from "../content.config.ts";
import type {ReactNode} from "react";
import '../styles/showcase.css'
import type {PricingTiers} from "../pricing.ts";

function getFlag(nation: Nation) {
    switch (nation) {
        case "Keter Sanctuary":
            return keterSanctuary;
        case "Stoicheia":
            return stoicheia;
        case "Dragon Empire":
            return dragonEmpire;
        case "Brandt Gate":
            return brandtGate;
        case "Dark States":
            return darkStates;
        case "Lyrical Monasterio":
            return lyricalMonasterio;
    }
}

export function DeckShowcase(props: InferEntrySchema<"decks"> & { keyCardImages?: ReactNode, genericCardImages?: ReactNode, cardArt?: ReactNode, ridelineCardImages?: ReactNode, content?: ReactNode, pricingTiers?: PricingTiers }) {
    const {nation} = props
    let flag = getFlag(nation);
    const {offense, control, keyCardImages, genericCardImages, value: deckValue, cardArt, ridelineCardImages, disadvantages, title, advantages, content} = props;
    return <div className="responsive" style={{overflowY: "scroll"}}>
        <div className="grid" style={{flex: 10}}>
            <div className="s12 m3 l2">
                {cardArt}
            </div>
            <article className="s12 m9 l7">
                <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                    <h2 className="primary-text">{title}</h2>
                    {flag && <button className="chip fill round large">
                        <span>{nation}</span>
                        <img className="responsive" style={{objectFit: "contain", background: "white"}} src={flag.src}/>
                    </button>}

                </div>
                {content}
                <div>
                    <b>Advantages</b>
                    <div style={{width: "100%", lineHeight: 2.5}}>
                        {advantages.map(value => <button key={value} className="chip no-margin" style={{marginRight: "3px !important"}}>{value}</button>)}
                    </div>
                </div>
                <div className="top-padding">
                    <b>Disadvantages</b>
                    <div style={{width: "100%", lineHeight: 2.5}}>
                        {disadvantages.map(value => <button key={value} className="chip no-margin" style={{marginRight: "3px !important"}}>{value}</button>)}
                    </div>
                </div>
            </article>
            <article className="s12 m4 l3" style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
                <div>
                    <h3>Other Info</h3>
                    <table className="no-space">
                        {props.pricingTiers && <>
                            <thead>
                            <tr>
                                <th>Price Category</th>
                                <th>Rating</th>
                            </tr>
                            </thead>
                            <tr>
                                <td>Core</td>
                                <td>{props.pricingTiers.core}</td>
                            </tr>
                            <tr>
                                <td>Generics</td>
                                <td>{props.pricingTiers.generics}</td>
                            </tr>
                            <tr>
                                <td>Total</td>
                                <td>{props.pricingTiers.total}</td>
                            </tr>
                        </>}
                        <thead>
                        <tr>
                            <th>Viability Category</th>
                            <th>Rating</th>
                        </tr>
                        <tr>
                            <td>Offense</td>
                            <td>{offense}</td>
                        </tr>

                        <tr>
                            <td>Control</td>
                            <td>{control}</td>
                        </tr>

                        <tr>
                            <td>Value</td>
                            <td>{deckValue}</td>
                        </tr>
                        </thead>
                    </table>
                </div>
                <hr/>
                <div>
                    <h6>Deck Building Notes</h6>
                    <ul style={{paddingLeft: "1rem", marginTop: 0}}>
                        {props['deck-notes'].map(note => <li key={note}>{note}</li>)}
                    </ul>
                </div>
                <hr/>
                <div>
                    <h6>Handy Links</h6>
                    <a href={`https://vg-paradox.com/subpage/DeckInfo/ENG/D/${title}Tops`} className="underline">{`${title} on VGParadox`}</a>
                </div>
            </article>
            <div className="grid m8 s12 l12">
                <article className="primary-container s12 l4">
                    <div>
                        <b>Ride Line</b>
                        <div className="grid tinier-space">
                            {ridelineCardImages}
                        </div>
                    </div>
                </article>
                <article className="secondary-container s12 l4">
                    <div>
                        <b>Key Cards</b>
                        <div className="grid tinier-space">
                            {keyCardImages}
                        </div>
                    </div>
                </article>
                <article className="tertiary-container s12 l4">
                    <b>Generic Cards</b>
                    <div className="grid tinier-space">
                        {genericCardImages}
                    </div>
                </article>
            </div>
        </div>
    </div>

}