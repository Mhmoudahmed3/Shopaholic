import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type Currency = 'EGP' | 'USD' | 'EUR';
export type Language = 'EN' | 'AR';

interface SettingsStore {
    theme: Theme;
    currency: Currency;
    language: Language;
    setTheme: (theme: Theme) => void;
    setCurrency: (currency: Currency) => void;
    setLanguage: (language: Language) => void;
}

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            theme: 'system',
            currency: 'EGP',
            language: 'EN',
            setTheme: (theme) => set({ theme }),
            setCurrency: (currency) => set({ currency }),
            setLanguage: (language) => set({ language }),
        }),
        {
            name: 'shopaholic-settings-storage',
        }
    )
);
