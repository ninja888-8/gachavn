import { GachaItem } from "./gacha.ts";

const STORAGE_KEY = 'gachavn-characters';

export function getCharacters(): string[] {
    const storedValue = localStorage.getItem(STORAGE_KEY);

    if (storedValue) {
        return storedValue.split(",");
    } else {
        return [];
    }
}

export function setCharacters(names: string[]): string[] {
    const owned = getCharacters();
    owned.push(...names);
    localStorage.setItem(STORAGE_KEY, owned.join(","));
    return owned;
}

export function pullCharacters(results: GachaItem[]): string[] {
    const owned = getCharacters();
    const newCharacters: string[] = [];

    results.forEach(i => {
        if (!owned.includes(i.name) && !newCharacters.includes(i.name)) {
            newCharacters.push(i.name);
        }
    });

    if (newCharacters.length > 0) {
        setCharacters(newCharacters);
    }

    return newCharacters;
}