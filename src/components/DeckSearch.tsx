import type {InferEntrySchema, RenderedContent} from "astro:content";
import {useState} from "react";
import {REPO_NAME} from "../consts.ts";
import seedrandom from "seedrandom";

function todaysRandomDecks(quantity: number, max: number): Set<any> | undefined {
    const seed = seedrandom(new Date().toDateString())
    if (max < quantity) {
        return undefined;
    }
    const set = new Set()
    while (set.size < quantity) {
        set.add(Math.floor(seed() * max))
    }
    return set
}

export function DeckSearch(props: Readonly<{
    decks: {
        id: string,
        src: string,
        title: string
    }[]
}>) {
    const [searchBar, setSearchBar] = useState("");
    const randomDecks = Array.from(todaysRandomDecks(3, props.decks.length) ?? [])
        .toSorted((a, b) => a - b)
        .map(value => props.decks[value])
    const filteredDecks = props.decks.filter(value => value.title.toLowerCase().startsWith(searchBar.toLowerCase()));
    return <div className="field prefix round fill active max" style={{marginBottom: 0, width: "100%"}}>
        <i style={{top: '50%'}}>search</i>
        <input placeholder={"Deck Search"} readOnly/>
        <menu className="min round">
            <li className="transparent">
                <div className="field large prefix">
                    <i className="front" style={{top: '50%'}}>search</i>
                    <input placeholder={"Enter a deck name"} value={searchBar} onChange={event => setSearchBar(event.target.value)}/>
                </div>
            </li>
            {searchBar.length < 1 && <div className={"medium-padding"}>Today's Deck Recommendations:</div>}
            {(searchBar.length < 1 ? randomDecks : filteredDecks)
                .map(value => <li key={value.title}>
                    <a href={`/${REPO_NAME}/decks/${value.id}`}>
                        <img className={"shape sided-cookie6 small"} src={value.src} style={{objectFit: 'cover', objectPosition: 'top'}}></img>
                        <div style={{fontSize: "larger"}}>{value.title}</div>
                    </a>
                </li>)}
        </menu>
    </div>

}