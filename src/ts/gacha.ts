import { pull } from './canvas.ts';
import { getEarnedPulls, renderPullCount, spendPulls } from './pull-count.ts';
import { pullCharacters } from './characters.ts';
import { characters } from './character-selector.ts';

type Rarity = 'Common' | 'Rare' | 'Legendary';

export interface GachaItem {
    name: string;
    rarity: Rarity;
}

const overlay = document.getElementById("gacha-overlay") as HTMLElement;
const pullCountDisplay = document.getElementById('pull-count-display') as HTMLDivElement | null;

const gachaPool: GachaItem[] = [
    { name: 'Amy', rarity: 'Common' },
    { name: 'Sparkle', rarity: 'Common' },
    { name: 'Sparxie', rarity: 'Common' },
    { name: 'D.Va', rarity: 'Rare' },
    { name: 'Columbina', rarity: 'Rare' },
    { name: 'Ahri', rarity: 'Legendary' },
    { name: 'Yunyun', rarity: 'Legendary' },
];

const rarityRates: Record<Rarity, number> = {
    Common: 0.85,
    Rare: 0.1,
    Legendary: 0.05,
};

const DEFAULT_FACE_FOCUS = "50% 20%";
const faceFocusByCharacter: Record<string, string> = {
    'Sparkle': '60% 20%',
    'Sparxie': '60% 20%',
    'D.Va': '87% 20%',
    'Columbina': '46% 20%',
    'Ahri': '22% 20%',
    'Yunyun': '32% 20%',
};

function getFaceFocus(name: string): string {
    return faceFocusByCharacter[name] ?? DEFAULT_FACE_FOCUS;
}

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
    pullCharacters(results);
    updatePullDisplay();
    pull(count, results);
    printResults(results);

    overlay.style.display = "none";
}

export function getCharacterId(name: string): number {
    for (let i = 0; i < gachaPool.length; i++) {
        if (name == gachaPool[i].name) return i;
    }

    return -1;
}

export function showPull(results: GachaItem[]) {
    let pullOverlay = document.getElementById("pull-overlay") as HTMLDivElement;
    pullOverlay.style.opacity = "1";

    let splashArt = document.getElementById("character-splash") as HTMLDivElement;
    splashArt.style.display = "block";

    let skipped = false;

    const skipBtn = document.createElement("button");
    skipBtn.type = "button";
    skipBtn.className = "pull-skip-btn";
    skipBtn.innerText = "Skip";
    skipBtn.addEventListener("click", () => {
        if (skipped) return;
        skipped = true;
        skipBtn.remove();
        if (results.length == 10) {
            listChars();
        } else {
            endPulls();
        }
    });
    if (results.length > 1) {
        pullOverlay.appendChild(skipBtn);
    }

    function showSplash(id: number) {
        if (skipped) return;

        let img = document.getElementById("image") as HTMLImageElement;
    
        let desc = document.getElementById("char-desc") as HTMLDivElement;
        let name = document.getElementById("name") as HTMLParagraphElement;
        let rarity = document.getElementById("rarity") as HTMLParagraphElement;

        img.src = characters[getCharacterId(results[id].name)].src;
        // splashArt.style.backgroundImage = `url(${img.src})`;
        img.style.transition = "all 0.5s";
        img.style.left = "5vw";
        img.classList.remove("silhouette");

        if (results[id].rarity == "Common") {
            img.classList.add("common");
            rarity.classList.add("common");
        } else if (results[id].rarity == "Rare") {
            img.classList.add("rare");
            rarity.classList.add("rare");
        } else {
            img.classList.add("legendary");
            rarity.classList.add("legendary");
        }

        name.innerText = results[id].name;
        rarity.innerText = results[id].rarity;

        desc.style = "opacity: 0;";
        setTimeout(() => {
            desc.style = "left: -5vw;"
        }, 100);

        function nextSplash() {
            if (skipped) return;

            img.removeEventListener("click", nextSplash);
            img.src = "";
            img.style.transition = "none";
            img.style.left = "0";
            // splashArt.style.backgroundImage = "";
            img.className = "silhouette";
            desc.style = "transition: none; opacity: 0;";
            rarity.className = "";
            if (id + 1 >= results.length) {
                if (results.length == 10) {
                    listChars();
                } else {
                    endPulls();
                }
            } else {setTimeout(() => showSplash(id + 1), 1);}
        }

        setTimeout(() => {
            if (skipped) return;
            img.addEventListener("click", nextSplash);
        }, 500);
    }

    showSplash(0);

    const rarityColours: Record<Rarity, string> = {
        Common: "rgb(123, 123, 123)",
        Rare: "rgb(186, 19, 186)",
        Legendary: "rgb(237, 198, 57)",
    };

    function listChars() {
        skipBtn.remove();

        let pullList = document.getElementById("pull-list") as HTMLDivElement;

        pullList.innerHTML = "";
        pullList.style.display = "";

        const columnsRow = document.createElement("div");
        columnsRow.className = "pull-columns-row";

        results.forEach((item, index) => {
            const column = document.createElement("div");
            column.className = "pull-column";
            column.style.setProperty("--quality-colour", rarityColours[item.rarity]);
            
            // stagger so columns appear to stack in left to right
            column.style.animationDelay = `${index * 0.12}s`;

            const art = document.createElement("img");
            art.className = "pull-column-img";
            art.src = characters[getCharacterId(item.name)].src;
            art.style.objectPosition = getFaceFocus(item.name);

            column.appendChild(art);
            columnsRow.appendChild(column);
        });

        const continueBtn = document.createElement("button");
        continueBtn.type = "button";
        continueBtn.className = "pull-continue-btn";
        continueBtn.innerText = "Continue";
        // // let the button appear only once the columns have finished stacking in
        // continueBtn.style.animationDelay = `${results.length * 0.12 + 0.15}s`;
        continueBtn.addEventListener("click", () => {
            pullList.style.display = "none";
            endPulls();
        });

        pullList.appendChild(columnsRow);
        pullList.appendChild(continueBtn);

        splashArt.style.display = "none";
    }

    function endPulls() {
        skipBtn.remove();

        splashArt.style.display = "none";
        pullOverlay.style.opacity = "0";

        overlay.style.display = "flex";
    }
}

document.getElementById('gamble1')?.addEventListener('click', makeGachaPull.bind(null, 1));
document.getElementById('gamble10')?.addEventListener('click', makeGachaPull.bind(null, 10));
updatePullDisplay();