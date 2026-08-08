// vn-effects.js
// Purely cosmetic: gives #question-header a visual-novel typewriter reveal
// whenever its text content changes. Does not touch quiz/scoring logic.

const HEADER_SELECTOR = "#question-header";
const CHAR_INTERVAL_MS = 18;

function typewrite(el: HTMLElement, text: string) {
    el.classList.add("typing");
    el.textContent = "";
    let i = 0;

    const tick = () => {
        if (i <= text.length) {
            el.textContent = text.slice(0, i);
            i++;
            requestAnimationFrame(() => setTimeout(tick, CHAR_INTERVAL_MS));
        } else {
            el.classList.remove("typing");
        }
    };
    tick();
}

function watchHeader() {
    const header = document.querySelector(HEADER_SELECTOR) as HTMLElement | null;
    if (!header) return;

    let lastText = header.textContent;

    // Play the typewriter effect on the initial dialogue too, not just
    // on subsequent text changes.
    if (lastText && lastText.trim().length > 0) {
        typewrite(header, lastText);
    }

    const observer = new MutationObserver(() => {
        const newText = header.textContent;
        if (newText !== lastText && !header.classList.contains("typing")) {
            lastText = newText;
            typewrite(header, newText);
        } else {
            lastText = newText;
        }
    });

    observer.observe(header, { childList: true, characterData: true, subtree: true });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watchHeader);
} else {
    watchHeader();
}