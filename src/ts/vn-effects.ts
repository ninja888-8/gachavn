// vn-effects.js
// Purely cosmetic: gives #question-header a visual-novel typewriter reveal
// whenever its text content changes. Does not touch quiz/scoring logic.

const HEADER_SELECTOR = "#question-header";
const QUIZ_MENU_SELECTOR = "#quiz-menu";
const ANSWER_BUTTON_SELECTOR = "#answer-choices button";
const CHAR_INTERVAL_MS = 18;

function setAnswerButtonsDisabled(disabled: boolean) {
    document.querySelectorAll<HTMLButtonElement>(ANSWER_BUTTON_SELECTOR).forEach((button) => {
        button.disabled = disabled;
        button.classList.toggle("disabled-while-typing", disabled);
    });
}

function typewrite(el: HTMLElement, text: string) {
    el.classList.add("typing");
    setAnswerButtonsDisabled(true);
    el.textContent = "";
    let i = 0;

    const tick = () => {
        if (i <= text.length) {
            el.textContent = text.slice(0, i);
            i++;
            requestAnimationFrame(() => setTimeout(tick, CHAR_INTERVAL_MS));
        } else {
            el.classList.remove("typing");
            setAnswerButtonsDisabled(false);
        }
    };
    tick();
}

function isVisible(el: HTMLElement): boolean {
    return getComputedStyle(el).display !== "none";
}

function watchHeader() {
    const header = document.querySelector(HEADER_SELECTOR) as HTMLElement | null;
    if (!header) return;

    let lastText = header.textContent;
    let hasPlayedInitial = false;

    const playInitialIfVisible = () => {
        if (hasPlayedInitial) return;
        const quizMenu = document.querySelector(QUIZ_MENU_SELECTOR) as HTMLElement | null;
        // If there's no #quiz-menu wrapper to wait on, just play immediately.
        const visible = quizMenu ? isVisible(quizMenu) : true;
        if (visible && lastText && lastText.trim().length > 0) {
            hasPlayedInitial = true;
            typewrite(header, lastText);
        }
    };

    // Covers the case where #quiz-menu is already visible by the time
    // this script runs.
    playInitialIfVisible();

    const quizMenu = document.querySelector(QUIZ_MENU_SELECTOR) as HTMLElement | null;
    if (quizMenu && !hasPlayedInitial) {
        const visibilityObserver = new MutationObserver(() => {
            playInitialIfVisible();
            if (hasPlayedInitial) visibilityObserver.disconnect();
        });
        visibilityObserver.observe(quizMenu, { attributes: true, attributeFilter: ["style", "class"] });
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