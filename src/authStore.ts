import { create } from 'zustand';
import {
    apiRegister,
    apiLogin,
    apiGetMe,
    apiChangePassword,
    type AuthUser,
} from './cloudStorage';

const TOKEN_KEY = 'taskplanner:token';
const USER_KEY = 'taskplanner:user';

export type AuthMode = 'guest' | 'authenticated';

interface AuthStore {
    mode: AuthMode;
    user: AuthUser | null;
    loading: boolean;
    error: string | null;
    resolved: boolean;
    showAuthModal: boolean;
    showProfileModal: boolean;
    profileSuccess: string | null;

    initAuth: () => Promise<void>;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string) => Promise<void>;
    logout: () => void;
    continueAsGuest: () => void;
    clearError: () => void;
    openAuthModal: () => void;
    closeAuthModal: () => void;
    openProfileModal: () => void;
    closeProfileModal: () => void;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
    mode: 'guest',
    user: null,
    loading: true,
    error: null,
    resolved: false,
    showAuthModal: false,
    showProfileModal: false,
    profileSuccess: null,

    initAuth: async () => {
        const token = localStorage.getItem(TOKEN_KEY);
        const choseGuest = localStorage.getItem('taskplanner:authMode') === 'guest';

        if (!token) {
            set({ loading: false, mode: 'guest', resolved: choseGuest });
            return;
        }

        try {
            const { user } = await apiGetMe();
            set({ mode: 'authenticated', user, loading: false, resolved: true });
        } catch {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            set({ mode: 'guest', user: null, loading: false, resolved: false });
        }
    },

    login: async (username: string, password: string) => {
        set({ error: null, loading: true });
        try {
            const { token, user } = await apiLogin(username, password);
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            set({ mode: 'authenticated', user, loading: false, resolved: true, showAuthModal: false });
        } catch (e: any) {
            const msg = e.message || 'Login failed';
            set({ error: msg.includes('API error') ? 'Server unavailable. Try Guest mode or deploy the backend.' : msg, loading: false });
        }
    },

    register: async (username: string, password: string) => {
        set({ error: null, loading: true });
        try {
            const { token, user } = await apiRegister(username, password);
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            set({ mode: 'authenticated', user, loading: false, resolved: true, showAuthModal: false });
        } catch (e: any) {
            const msg = e.message || 'Registration failed';
            set({ error: msg.includes('API error') ? 'Server unavailable. Try Guest mode or deploy the backend.' : msg, loading: false });
        }
    },

    logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem('taskplanner:authMode');
        set({ mode: 'guest', user: null, error: null, resolved: false });
    },

    continueAsGuest: () => {
        localStorage.setItem('taskplanner:authMode', 'guest');
        set({ mode: 'guest', loading: false, resolved: true });
    },

    clearError: () => set({ error: null }),
    openAuthModal: () => set({ showAuthModal: true, error: null }),
    closeAuthModal: () => set({ showAuthModal: false, error: null }),
    openProfileModal: () => set({ showProfileModal: true, error: null, profileSuccess: null }),
    closeProfileModal: () => set({ showProfileModal: false, error: null, profileSuccess: null }),

    changePassword: async (currentPassword: string, newPassword: string) => {
        set({ error: null, loading: true, profileSuccess: null });
        try {
            await apiChangePassword(currentPassword, newPassword);
            set({ loading: false, profileSuccess: 'Password changed successfully!' });
        } catch (e: any) {
            set({ error: e.message || 'Failed to change password', loading: false });
        }
    },
}));
