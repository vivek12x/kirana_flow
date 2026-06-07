import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface User {
    id: string;
    email: string;
    role: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    signOut: () => Promise<void>;
    initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    loading: true,
    setUser: (user) => set({ user }),
    setToken: (token) => set({ token }),
    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, token: null });
    },
    initialize: () => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                set({
                    user: {
                        id: session.user.id,
                        email: session.user.email || '',
                        role: session.user.user_metadata?.role || 'owner',
                    },
                    token: session.access_token,
                    loading: false,
                });
            } else {
                set({ user: null, token: null, loading: false });
            }
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                set({
                    user: {
                        id: session.user.id,
                        email: session.user.email || '',
                        role: session.user.user_metadata?.role || 'owner',
                    },
                    token: session.access_token,
                    loading: false,
                });
            } else {
                set({ user: null, token: null, loading: false });
            }
        });
    }
}));

// Initialize immediately
if (typeof window !== 'undefined') {
    useAuthStore.getState().initialize();
}
