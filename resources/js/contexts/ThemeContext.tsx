import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface ThemeContextType {
    dark: boolean;
    toggle: () => void;
    setDark: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getInitial(): boolean {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [dark, setDarkState] = useState(getInitial);

    const apply = useCallback((isDark: boolean) => {
        document.documentElement.classList.toggle('dark', isDark);
    }, []);

    useEffect(() => {
        apply(dark);
    }, [dark, apply]);

    const toggle = useCallback(() => {
        setDarkState((prev) => {
            const next = !prev;
            localStorage.setItem('theme', next ? 'dark' : 'light');
            return next;
        });
    }, []);

    const setDark = useCallback((v: boolean) => {
        setDarkState(v);
        localStorage.setItem('theme', v ? 'dark' : 'light');
    }, []);

    return (
        <ThemeContext.Provider value={{ dark, toggle, setDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
