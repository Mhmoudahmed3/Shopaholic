"use client";

import { useEffect, useState } from "react";
import { useSettingsStore, type Theme } from "@/lib/useSettingsStore";

export function SettingsSync() {
    const { theme, language } = useSettingsStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;

        // Sync Language & Direction
        root.lang = language.toLowerCase();
        root.dir = language === "AR" ? "rtl" : "ltr";

        // Sync Theme
        const applyTheme = (t: Theme) => {
            if (t === "dark") {
                root.classList.add("dark");
            } else if (t === "light") {
                root.classList.remove("dark");
            } else {
                const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                if (isDark) root.classList.add("dark");
                else root.classList.remove("dark");
            }
        };

        applyTheme(theme);

        // Watch system theme if in 'system' mode
        if (theme === 'system') {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = (e: MediaQueryListEvent) => {
                if (e.matches) root.classList.add("dark");
                else root.classList.remove("dark");
            };
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
    }, [theme, language, mounted]);

    return null;
}
