"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, AlertCircle, Info, CheckCircle, X } from "lucide-react";

export type ConfirmModalType = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    type?: ConfirmModalType;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    type = 'warning',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    isLoading = false
}: ConfirmModalProps) {
    
    // Choose styling based on type
    const getStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: <AlertTriangle className="w-6 h-6 text-rose-500" />,
                    bgIcon: 'bg-rose-500/10 border-rose-500/20',
                    btnConfirm: 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20'
                };
            case 'success':
                return {
                    icon: <CheckCircle className="w-6 h-6 text-emerald-500" />,
                    bgIcon: 'bg-emerald-500/10 border-emerald-500/20',
                    btnConfirm: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                };
            case 'info':
                return {
                    icon: <Info className="w-6 h-6 text-blue-500" />,
                    bgIcon: 'bg-blue-500/10 border-blue-500/20',
                    btnConfirm: 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                };
            case 'warning':
            default:
                return {
                    icon: <AlertCircle className="w-6 h-6 text-amber-500" />,
                    bgIcon: 'bg-amber-500/10 border-amber-500/20',
                    btnConfirm: 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                };
        }
    };

    const styles = getStyles();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" style={{ pointerEvents: 'auto' }}>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
                        onClick={!isLoading ? onCancel : undefined}
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden relative z-10"
                    >
                        {/* Accent line at top */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent opacity-50" />
                        
                        <div className="p-6 md:p-8">
                            <button 
                                onClick={onCancel}
                                disabled={isLoading}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-5 ${styles.bgIcon}`}>
                                    {styles.icon}
                                </div>
                                <h3 className="text-xl font-light tracking-tight text-gray-900 dark:text-white mb-2">{title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-[280px]">
                                    {message}
                                </p>
                            </div>

                            <div className="mt-8 flex items-center gap-3">
                                <button
                                    onClick={onCancel}
                                    disabled={isLoading}
                                    className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-xl transition-all disabled:opacity-50 active:scale-95"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className={`flex-1 flex justify-center items-center py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 active:scale-95 ${styles.btnConfirm}`}
                                >
                                    {isLoading ? (
                                        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                    ) : confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
