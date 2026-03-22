import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string) => Promise<void>;
    logout: () => void;
    signup: (name: string, email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: async (email) => {
                // Mock API call
                await new Promise(resolve => setTimeout(resolve, 800));

                // Mock admin check
                const role = email.includes('admin') ? 'admin' : 'user';

                set({
                    user: { id: '1', name: email.split('@')[0], email, role },
                    isAuthenticated: true,
                });
            },
            signup: async (name, email) => {
                // Mock API call
                await new Promise(resolve => setTimeout(resolve, 800));
                set({
                    user: { id: '1', name, email, role: 'user' },
                    isAuthenticated: true,
                });
            },
            logout: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: 'shopaholic-auth-storage',
        }
    )
);
