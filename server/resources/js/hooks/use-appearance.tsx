import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'appearance';

const prefersDark = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

const applyTheme = (appearance: Appearance) => {
    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());
    document.documentElement.classList.toggle('dark', isDark);
};

const mediaQuery = () =>
    typeof window !== 'undefined'
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : null;

const getStored = (): Appearance => {
    if (typeof localStorage === 'undefined') return 'system';
    const saved = localStorage.getItem(STORAGE_KEY) as Appearance | null;
    return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
};

// Called once at boot (app.tsx) and also keeps 'system' in sync with the OS.
export function initializeTheme() {
    applyTheme(getStored());

    mediaQuery()?.addEventListener('change', () => {
        if (getStored() === 'system') applyTheme('system');
    });
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('system');

    const updateAppearance = useCallback((next: Appearance) => {
        setAppearance(next);
        if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, next);
        applyTheme(next);
    }, []);

    useEffect(() => {
        setAppearance(getStored());
    }, []);

    return { appearance, updateAppearance } as const;
}
