"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Settings, Check, Globe, CreditCard, Moon, Sun, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { useSettingsStore, type Theme, type Currency, type Language } from "@/lib/useSettingsStore";
import { useTranslation } from "@/hooks/useTranslation";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function SettingsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme, currency, setCurrency, language, setLanguage } = useSettingsStore();
  const { t } = useTranslation();

  // Handle client-side Hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handled by SettingsSync globally

  const currencies = [
    { code: "EGP" },
    { code: "USD" },
    { code: "EUR" },
  ];

  const languages = [
    { code: "EN", label: "English" },
    { code: "AR", label: "العربية" },
  ];

  if (!mounted) return (
     <div className="relative">
      <button className="p-2 text-gray-500"><Settings className="h-5 w-5" /></button>
    </div>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
        aria-label="Settings"
      >
        <Settings className={cn("h-5 w-5 transition-transform duration-500", isOpen && "rotate-90")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-3xl z-[100] p-5 origin-top-right rounded-2xl"
          >
            <div className="space-y-7">
              
              {/* Currency */}
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">
                  <CreditCard className="h-3 w-3" /> {t('currency')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {currencies.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => setCurrency(c.code as any)}
                      className={cn(
                        "py-2.5 text-[10px] font-black tracking-widest border transition-all duration-300 rounded-lg",
                        currency === c.code 
                          ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black shadow-lg" 
                          : "border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 opacity-60"
                      )}
                    >
                      {c.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">
                  <Globe className="h-3 w-3" /> {t('language')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLanguage(l.code as any)}
                      className={cn(
                        "py-2.5 text-[10px] font-black tracking-widest border transition-all duration-300 rounded-lg",
                        language === l.code 
                          ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black shadow-lg" 
                          : "border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 opacity-60"
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">
                  <Monitor className="h-3 w-3" /> {t('appearance')}
                </label>
                <div className="flex bg-neutral-100 dark:bg-zinc-900 p-1.5 rounded-xl gap-1">
                  <button 
                    onClick={() => setTheme("light")}
                     className={cn(
                      "flex-1 flex items-center justify-center py-2 rounded-lg transition-all duration-500",
                      theme === "light" ? "bg-white dark:bg-zinc-700 shadow-md scale-100" : "opacity-40 hover:opacity-100 scale-95"
                    )}
                    title={t('light')}
                  >
                    <Sun className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setTheme("dark")}
                     className={cn(
                      "flex-1 flex items-center justify-center py-2 rounded-lg transition-all duration-500",
                      theme === "dark" ? "bg-white dark:bg-zinc-700 shadow-md scale-100" : "opacity-40 hover:opacity-100 scale-95"
                    )}
                    title={t('dark')}
                  >
                    <Moon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setTheme("system")}
                     className={cn(
                      "flex-1 flex items-center justify-center py-2 rounded-lg transition-all duration-500",
                      theme === "system" ? "bg-white dark:bg-zinc-700 shadow-md scale-100" : "opacity-40 hover:opacity-100 scale-95"
                    )}
                    title={t('system')}
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Extras */}
              <div className="pt-4 border-t border-black/5 dark:border-white/5 space-y-3">
                <Link 
                  href="/track-order" 
                   onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
                >
                  {t('trackOrder')}
                </Link>
                <Link 
                  href="/contact" 
                   onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
                >
                  {t('helpSupport')}
                </Link>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
