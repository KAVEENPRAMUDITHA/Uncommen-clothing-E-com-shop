import { useEffect } from 'react';
import supabase from '../lib/supabase';

// Syncs the Supabase session token to localStorage so admin API routes can read it.
export default function SessionSync() {
    useEffect(() => {
        const sync = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
                localStorage.setItem('uc_session', JSON.stringify({ token: session.access_token }));
            } else {
                localStorage.removeItem('uc_session');
            }
        };
        sync();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { sync(); });
        return () => subscription.unsubscribe();
    }, []);
    return null;
}
