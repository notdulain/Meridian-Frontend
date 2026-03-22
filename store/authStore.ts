import { create } from 'zustand';

interface User {
    id: number;
    email: string;
    name?: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
    role: string | null;
    isHydrated: boolean;
    setHydrated: () => void;
    login: (token: string, role: string, user?: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: typeof window !== 'undefined' ? localStorage.getItem('meridian_token') : null,
    user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('meridian_user') || 'null') : null,
    role: typeof window !== 'undefined' ? localStorage.getItem('meridian_role') : null,
    isHydrated: false,
    setHydrated: () => set({ isHydrated: true }),
    login: (token, role, user) => {
        localStorage.setItem('meridian_token', token);
        localStorage.setItem('meridian_role', role);
        if (user) localStorage.setItem('meridian_user', JSON.stringify(user));
        set({ token, role, user: user || null });
    },
    logout: () => {
        localStorage.removeItem('meridian_token');
        localStorage.removeItem('meridian_role');
        localStorage.removeItem('meridian_user');
        set({ token: null, role: null, user: null });
    },
}));
