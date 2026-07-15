import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import supabase from '../lib/supabase';

type AuthUser = { id: string; email: string } | null;

type AuthCtx = {
    user: AuthUser;
    isAdmin: boolean;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error?: string }>;
    signUp: (email: string, password: string) => Promise<{ error?: string }>;
    signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
    user: null, isAdmin: false, loading: true,
    signIn: async () => ({}), signUp: async () => ({}), signOut: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAdmin = async (u: AuthUser) => {
        if (!u) { setIsAdmin(false); return; }
        // 1. Check user_roles table for role-based admin
        const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', u.id).maybeSingle();
        if (roleData?.role === 'admin') { setIsAdmin(true); return; }
        // 2. Check settings table for admin_email
        const { data: settingData } = await supabase.from('settings').select('value').eq('key', 'admin_email').maybeSingle();
        const dbAdminEmail = settingData?.value || 'admin@uncommonclothing.lk';
        setIsAdmin(u.email === dbAdminEmail);
    };

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            const u = session?.user;
            const authUser = u ? { id: u.id, email: u.email || '' } : null;
            setUser(authUser);
            await checkAdmin(authUser);
            setLoading(false);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
            const u = session?.user;
            const authUser = u ? { id: u.id, email: u.email || '' } : null;
            setUser(authUser);
            await checkAdmin(authUser);
            setLoading(false);
        });
        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return error ? { error: error.message } : {};
    };

    const signUp = async (email: string, password: string) => {
        const res = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) return { error: data.error || 'Failed to create account' };
        return {};
    };

    const signOut = async () => { await supabase.auth.signOut(); };

    return (
        <Ctx.Provider value={{ user, isAdmin, loading, signIn, signUp, signOut }}>
            {children}
        </Ctx.Provider>
    );
}

export const useAuth = () => useContext(Ctx);
