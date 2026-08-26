import { createContext, useContext, useEffect, useState } from 'react';
import useAuthStore from '../store/authStore.js';

const ThemeContext = createContext({ theme: 'dark', toggle: () => { } });

export function ThemeProvider({ children }) {
    const { user } = useAuthStore();

    const [theme, setTheme] = useState(user?.settings?.theme || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'light') document.documentElement.classList.add('light');
        else document.documentElement.classList.remove('light');
    }, [theme]);

    const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

    return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
