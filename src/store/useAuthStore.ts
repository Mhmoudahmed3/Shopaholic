import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    phone?: string;
    address?: string;
    age?: string;
    city?: string;
    profileImage?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string) => Promise<void>;
    logout: () => void;
    signup: (name: string, email: string, phone?: string, address?: string, age?: string, city?: string) => Promise<void>;
    updateProfile: (data: Partial<Omit<User, 'id' | 'role'>>) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signInWithFacebook: () => Promise<void>;
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
            signup: async (name, email, phone, address, age, city) => {
                // Mock API call
                await new Promise(resolve => setTimeout(resolve, 800));
                set({
                    user: { 
                        id: Math.random().toString(36).substr(2, 9), 
                        name, 
                        email, 
                        role: 'user',
                        phone,
                        address,
                        age,
                        city
                    },
                    isAuthenticated: true,
                });
            },
            updateProfile: async (data) => {
                // Mock API call
                await new Promise(resolve => setTimeout(resolve, 500));
                set((state) => ({
                    user: state.user ? { ...state.user, ...data } : null
                }));
            },
            signInWithGoogle: async () => {
                // Simulate redirect/popup
                await new Promise(resolve => setTimeout(resolve, 1000));
                set({
                    user: { id: 'google-1', name: 'Google User', email: 'user@google.com', role: 'user' },
                    isAuthenticated: true,
                });
            },
            signInWithFacebook: async () => {
                // Simulate redirect/popup
                await new Promise(resolve => setTimeout(resolve, 1000));
                set({
                    user: { id: 'fb-1', name: 'Facebook User', email: 'user@fb.com', role: 'user' },
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
