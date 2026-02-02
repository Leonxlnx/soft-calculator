import React, { createContext, useContext, useState, ReactNode } from 'react';
import { colors, ThemeType, ColorScheme } from './colors';

interface ThemeContextType {
    theme: ThemeType;
    colorScheme: ColorScheme;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setTheme] = useState<ThemeType>('dark');

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const colorScheme = theme === 'dark' ? colors.dark : colors.light;
    const isDark = theme === 'dark';

    return (
        <ThemeContext.Provider value={{ theme, colorScheme, toggleTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
