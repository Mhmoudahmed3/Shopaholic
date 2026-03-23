"use client";

import { useSettingsStore } from "@/lib/useSettingsStore";
import { translations, TranslationKey } from "@/lib/translations";
import { useEffect, useState } from "react";

export function useTranslation() {
    const { language } = useSettingsStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Return translation function. If not mounted, default to English to avoid hydration mismatch
    const t = (key: TranslationKey): string => {
        if (!mounted) return translations.EN[key];
        return (translations[language] && translations[language][key]) || translations.EN[key];
    };

    return { t, language, mounted };
}
