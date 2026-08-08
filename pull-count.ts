const STORAGE_KEY = 'gachavn-earned-pulls';

export function getEarnedPulls(): number {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    const parsedValue = Number(storedValue);

    if (Number.isFinite(parsedValue) && parsedValue >= 0) {
        return parsedValue;
    }

    return 0;
}

export function setEarnedPulls(value: number): number {
    const safeValue = Math.max(0, Math.floor(value));
    localStorage.setItem(STORAGE_KEY, safeValue.toString());
    return safeValue;
}

export function incrementEarnedPulls(): number {
    return setEarnedPulls(getEarnedPulls() + 1);
}

export function spendPulls(count: number): number {
    return setEarnedPulls(getEarnedPulls() - count);
}

export function renderPullCount(target: HTMLElement | null): void {
    if (target) {
        target.textContent = getEarnedPulls().toString();
    }
}
