"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, HelpCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import clsx from "clsx";

type ModalVariant = "danger" | "warning" | "info" | "success";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ModalVariant;
    isLoading?: boolean;
    showCancel?: boolean;
}

const VARIANTS: Record<ModalVariant, { icon: any; color: string; bg: string; border: string; btn: string }> = {
    danger: {
        icon: AlertTriangle,
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-950/20",
        border: "border-red-100 dark:border-red-900/50",
        btn: "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20",
    },
    warning: {
        icon: AlertTriangle,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-950/20",
        border: "border-amber-100 dark:border-amber-900/50",
        btn: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20",
    },
    info: {
        icon: HelpCircle,
        color: "text-neutral-900 dark:text-white",
        bg: "bg-neutral-50 dark:bg-neutral-900",
        border: "border-neutral-100 dark:border-neutral-800",
        btn: "bg-black dark:bg-white text-white dark:text-black shadow-black/10",
    },
    success: {
        icon: CheckCircle2,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-950/20",
        border: "border-emerald-100 dark:border-emerald-900/50",
        btn: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20",
    },
};

export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
    isLoading = false,
    showCancel = true,
}: ConfirmModalProps) => {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const { icon: Icon, color, bg, border, btn } = VARIANTS[variant];
    const handleAction = () => {
        if (onConfirm) onConfirm();
        else onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 overflow-x-hidden overflow-y-auto">
                    {/* Backdrop with Glassmorphism */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !isLoading && onClose()}
                        className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-sm bg-white dark:bg-zinc-950 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-neutral-100/50 dark:border-white/5 overflow-hidden"
                    >
                        {/* Header Branding Line */}
                        <div className="absolute top-0 left-0 right-0 h-1 flex">
                            <div className={clsx("h-full", variant === "danger" ? "bg-red-500" : "bg-black dark:bg-white")} style={{ width: "33%" }} />
                            <div className="h-full bg-neutral-200 dark:bg-neutral-800" style={{ width: "67%" }} />
                        </div>

                        <div className="p-8 pt-12">
                            {/* Close Button */}
                            {!isLoading && (
                                <button
                                    onClick={onClose}
                                    className="absolute top-6 right-8 p-2 text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}

                            {/* Icon & Title */}
                            <div className="flex flex-col items-center text-center">
                                <div className={clsx("w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm", bg, border)}>
                                    <Icon className={clsx("w-7 h-7", color)} />
                                </div>

                                <h3 className="text-xl font-serif font-light text-neutral-900 dark:text-white mb-3">
                                    {title}
                                </h3>
                                
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed font-medium uppercase tracking-widest opacity-80 max-w-[280px]">
                                    {description}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleAction}
                                    disabled={isLoading}
                                    className={clsx(
                                        "relative group overflow-hidden w-full py-4 px-6 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 disabled:opacity-50",
                                        btn
                                    )}
                                >
                                    {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span>{confirmText}</span>
                                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                                </button>

                                {showCancel && (
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="w-full py-4 px-6 bg-transparent text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-2xl transition-all disabled:opacity-50"
                                    >
                                        {cancelText}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
