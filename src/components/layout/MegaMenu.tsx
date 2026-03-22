"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { navigationData } from "@/lib/navigationData";

export function MegaMenu() {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Debounce the hover events to prevent flickering
    const handleMouseEnter = (categoryId: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setActiveCategory(categoryId);
        setIsMenuOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsMenuOpen(false);
            setActiveCategory(null);
        }, 150); // 150ms debounce
    };

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const activeData = navigationData.find((cat) => cat.id === activeCategory);

    return (
        <div className="h-full" onMouseLeave={handleMouseLeave}>
            {/* Top Level Nav Links */}
            <nav className="hidden lg:flex items-center gap-8 h-full" aria-label="Main Navigation">
                {navigationData.map((category) => (
                    <Link
                        key={category.id}
                        href={category.href}
                        onMouseEnter={() => handleMouseEnter(category.id)}
                        onFocus={() => handleMouseEnter(category.id)}
                        className={`text-sm font-medium tracking-wide uppercase transition-colors h-16 flex items-center relative
                            ${activeCategory === category.id
                                ? "text-black dark:text-white"
                                : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                            }
                            focus:outline-none focus:text-black dark:focus:text-white
                        `}
                        aria-expanded={activeCategory === category.id}
                        aria-haspopup="menu"
                    >
                        {category.label}
                        {/* Interactive Underline Indicator */}
                        <span
                            className={`absolute bottom-4 left-0 w-full h-0.5 bg-black dark:bg-white inset-x-0 transform origin-left transition-transform duration-300 ease-out
                                ${activeCategory === category.id ? "scale-x-100" : "scale-x-0"}
                            `}
                        />
                    </Link>
                ))}
            </nav>

            {/* Mega Menu Dropdown Panel */}
            <div
                className={`absolute top-16 left-0 w-full bg-[#050505] text-white overflow-hidden transition-all duration-300 ease-in-out border-b border-gray-800/50 shadow-2xl z-40
                    ${isMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2 pointer-events-none"}
                `}
                role="menu"
                onMouseEnter={() => {
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    setIsMenuOpen(true);
                }}
            >
                {activeData && activeData.groups && (
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                        <div className="grid grid-cols-4 gap-12">

                            {/* Link Columns */}
                            {activeData.groups.map((group, index) => (
                                <div key={index} className="flex flex-col">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3] mb-6">
                                        {group.title}
                                    </h3>
                                    <ul className="space-y-4">
                                        {group.links.map((link, linkIndex) => (
                                            <li key={linkIndex} role="none">
                                                <Link
                                                    href={link.href}
                                                    className="group/link flex items-center text-sm text-[#E5E5E5] transition-all duration-300 ease-out hover:text-white hover:translate-x-1 focus:outline-none focus:text-white focus:translate-x-1"
                                                    role="menuitem"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    {link.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}

                            {/* Editorial Image Column (Spans remaining columns if any) */}
                            {activeData.editorial && (
                                <div className="col-span-4 md:col-start-4 md:col-span-1 border-l border-gray-800/50 pl-12 h-full flex flex-col justify-center">
                                    <Link
                                        href={activeData.editorial.href}
                                        className="group/editorial block relative w-full aspect-[4/5] overflow-hidden bg-zinc-900 rounded-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#050505]"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Image
                                            src={activeData.editorial.imageSrc}
                                            alt={activeData.editorial.title}
                                            fill
                                            className="object-cover transition-transform duration-700 ease-in-out group-hover/editorial:scale-105 opacity-80 group-hover/editorial:opacity-100"
                                            sizes="(max-width: 768px) 100vw, 300px"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                                        <div className="absolute bottom-0 left-0 p-6 pointer-events-none">
                                            <h4 className="text-lg font-medium text-white mb-2 translate-y-2 group-hover/editorial:translate-y-0 transition-transform duration-300">
                                                {activeData.editorial.title}
                                            </h4>
                                            <p className="text-xs text-gray-300 opacity-0 group-hover/editorial:opacity-100 translate-y-4 group-hover/editorial:translate-y-0 transition-all duration-300 delay-75">
                                                {activeData.editorial.subtitle}
                                            </p>
                                        </div>
                                    </Link>
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
