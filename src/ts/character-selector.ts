import { getCharacters, setCharacters } from "./characters";
import { toggleUploadMenu } from "./connection.ts";

const selectMenu = document.getElementById('select-menu') as HTMLDivElement | null;
const overlay = document.getElementById('character-overlay') as HTMLDivElement | null;
const overlayBackdrop = document.querySelector('.character-overlay-backdrop') as HTMLDivElement | null;
const characterPicker = document.getElementById('character-picker') as HTMLButtonElement | null;
const selectConfirmBtn = document.getElementById('select-confirm-btn') as HTMLButtonElement | null;
const cancelBtn = document.getElementById('character-cancel-btn') as HTMLButtonElement | null;
const characterGrid = document.getElementById('character-grid') as HTMLDivElement | null;
const previewImage = document.getElementById('select-preview') as HTMLImageElement | null;

const SELECTED_CHARACTER_KEY = 'gachavn-selected';
const previousCharacterIndex = localStorage.getItem(SELECTED_CHARACTER_KEY);

export const characters = [
    { name: 'Amy', src: '../images/amy.png' },
    { name: 'Sparkle', src: '../images/sparkle.png' },
    { name: 'Sparxie', src: '../images/sparxie.png' },
    { name: 'D.Va', src: '../images/dva.png' },
    { name: 'Columbina', src: '../images/columbina.png'},
    { name: 'Ahri', src: '../images/ahri.png' },
    { name: 'Yunyun', src: '../images/yunyun.png' },
];

if (previousCharacterIndex && previewImage) {
    (previewImage as HTMLImageElement).src = characters[parseInt(previousCharacterIndex)].src;
}
let selectedCharacter = previousCharacterIndex ? characters[parseInt(previousCharacterIndex)]: characters[0];
let selectedIndex = 0;

function toggleSelectMenu() {
    if (selectMenu) {
        selectMenu.style.display = selectMenu.style.display == 'none' ? 'block' : 'none';
    }
}

function toggleOverlay() {
    if (overlay) {
        overlay.style.display = overlay.style.display == 'none' ? 'block' : 'none';
    }
}

function renderCharacterOptions() {
    if (!characterGrid) return;
    characterGrid.innerHTML = '';

    let unlockedCharacters = getCharacters();
    if (unlockedCharacters.length == 0) {
        setCharacters(["Amy"]);
        unlockedCharacters = getCharacters();
    }

    characters.forEach((character, index) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'character-option secondary-btn';
        option.innerHTML = `
            <img src="${character.src}" alt="${character.name}" />
            <span>${character.name}</span>
        `;
        option.addEventListener('click', () => {
            selectedCharacter = character;
            selectedIndex = index;
            if (previewImage) {
                previewImage.src = character.src;
            }
            toggleOverlay();
        });
        if (!unlockedCharacters.includes(character.name)) {
            option.disabled = true;
            option.style.filter = "blur(5px)";
        }
        characterGrid.appendChild(option);
    });
}

characterPicker?.addEventListener('click', toggleOverlay);
cancelBtn?.addEventListener('click', toggleOverlay);
overlayBackdrop?.addEventListener('click', toggleOverlay);

selectConfirmBtn?.addEventListener('click', () => {
    if (previewImage && selectedCharacter) {
        previewImage.src = selectedCharacter.src;
    }
    localStorage.setItem(SELECTED_CHARACTER_KEY, selectedIndex.toString());
    const rightSprite = document.getElementById('sprite-right') as HTMLImageElement;
    if (rightSprite) {
        rightSprite.src = selectedCharacter.src;
    }
    toggleSelectMenu();
    toggleUploadMenu();
});

renderCharacterOptions();