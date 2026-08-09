import { pull } from './canvas.ts';
import { getEarnedPulls, renderPullCount, spendPulls } from './pull-count.ts';

type Rarity = 'Common' | 'Rare' | 'Legendary';

export interface GachaItem {
    name: string;
    rarity: Rarity;
}

const overlay = document.getElementById("gacha-overlay") as HTMLElement;
const pullCountDisplay = document.getElementById('pull-count-display') as HTMLDivElement | null;

// will expand later
const gachaPool: GachaItem[] = [
    { name: '', rarity: 'Common' },
    { name: '', rarity: 'Rare' },
    { name: '', rarity: 'Legendary' },
];

// will change later
const rarityRates: Record<Rarity, number> = {
    Common: 0.85,
    Rare: 0.1,
    Legendary: 0.05,
};

function pickRarity(): Rarity {
    const rarities: Rarity[] = ['Common', 'Rare', 'Legendary'];
    const weights = rarities.map((rarity) => rarityRates[rarity]);

    const randomValue = Math.random();
    if (randomValue <= weights[0]) {
        return 'Common';
    } else if (randomValue <= weights[0] + weights[1]) {
        return 'Rare';
    } else {
        return 'Legendary';
    }
}

function getItemsByRarity(rarity: Rarity): GachaItem[] {
    return gachaPool.filter((item) => item.rarity === rarity);
}

export class Gacha {
    pullOne(): GachaItem {
        const rarity = pickRarity();
        const items = getItemsByRarity(rarity);
        return items[Math.floor(Math.random() * items.length)];
    }

    pull(count = 1): GachaItem[] {
        const results: GachaItem[] = [];
        for (let i = 0; i < count; i++) {
            results.push(this.pullOne());
        }
        return results;
    }
}

function printResults(pulls: GachaItem[]): void {
    console.log('Gacha Pull Results:');
    pulls.forEach((item) => {
        console.log(`${item.name} (${item.rarity})`);
    });

}

function updatePullDisplay() {
    renderPullCount(pullCountDisplay);
}

function makeGachaPull(count = 1): void {    
    const availablePulls = getEarnedPulls();

    if (availablePulls < count) {
        alert(`You need ${count} pull${count > 1 ? 's' : ''} to make that pull.`);
        return;
    }

    const gacha = new Gacha();
    const results = gacha.pull(count);
    spendPulls(count);
    updatePullDisplay();
    pull(count, results);
    printResults(results);

    overlay.style.display = "none";
}

document.getElementById('gamble1')?.addEventListener('click', makeGachaPull.bind(null, 1));
document.getElementById('gamble10')?.addEventListener('click', makeGachaPull.bind(null, 10));
updatePullDisplay();