"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    label?: string;
    className?: string;
    variant?: "underlined" | "ghost";
}

export function CustomSelect({ 
    options, 
    value, 
    onChange, 
    label, 
    className,
    variant = "underlined"
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const selectedOption = options.find(opt => opt.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div 
            ref={containerRef} 
            className={clsx("relative flex flex-col gap-1.5 min-w-[140px]", className)}
        >
            {label && (
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                    {label}
                </span>
            )}
            
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "flex items-center justify-between text-[11px] font-bold uppercase tracking-widest transition-all text-left",
                    variant === "underlined" ? "py-2 border-b border-neutral-200 dark:border-neutral-800" : "py-1 gap-4",
                    isOpen && variant === "underlined" && "border-black dark:border-white"
                )}
            >
                <span>{selectedOption?.label}</span>
                <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform duration-500", isOpen ? "rotate-180" : "rotate-0")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-2xl overflow-hidden"
                    >
                        <div className="py-1">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={clsx(
                                        "w-full px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-left transition-colors",
                                        value === option.value 
                                            ? "bg-neutral-50 dark:bg-neutral-800 text-black dark:text-white" 
                                            : "text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white"
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
