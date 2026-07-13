import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShoppingBag, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Account() {
    const { user, isAdmin, signIn, signUp, signOut } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (mode === 'login') {
            const { error } = await signIn(email, password);
            setLoading(false);
            if (error) setError(error);
        } else {
            const { error } = await signUp(email, password);
            setLoading(false);
            if (error) {
                setError(error);
            } else {
                // Signup succeeded — auto sign in
                setSignupSuccess(true);
                setTimeout(async () => {
                    const { error: signInError } = await signIn(email, password);
                    if (signInError) {
                        // If auto sign-in fails, switch to login mode
                        setSignupSuccess(false);
                        setMode('login');
                        setError('Account created! Please sign in with your credentials.');
                    }
                }, 1500);
            }
        }
    };

    // If logged in, show account dashboard
    if (user) {
        if (isAdmin) {
            navigate('/admin');
            return null;
        }
        return (
            <div className="max-w-2xl mx-auto px-6 py-12">
                <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
                    <div className="w-16 h-16 bg-neutral-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black">
                        {user.email[0].toUpperCase()}
                    </div>
                    <h1 className="text-2xl font-black mb-1">My Account</h1>
                    <p className="text-sm text-neutral-500 mb-6">{user.email}</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/orders" className="bg-black text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-neutral-800 transition flex items-center justify-center gap-2"><ShoppingBag size={16} /> My Orders</Link>
                        <Link to="/shop" className="border border-neutral-300 px-6 py-3 rounded-full font-semibold text-sm hover:bg-neutral-50 transition">Continue Shopping</Link>
                    </div>
                    <button onClick={() => signOut()} className="mt-6 text-sm text-neutral-400 hover:text-black underline">Sign Out</button>
                </div>
            </div>
        );
    }

    // Signup success state
    if (signupSuccess) {
        return (
            <div className="max-w-md mx-auto px-6 py-16 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                </div>
                <h1 className="text-2xl font-black mb-2">Account Created!</h1>
                <p className="text-sm text-neutral-500">Signing you in...</p>
            </div>
        );
    }

    // Not logged in — show login/signup form
    return (
        <div className="max-w-md mx-auto px-6 py-16">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-black mb-2">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
                <p className="text-sm text-neutral-500">{mode === 'login' ? 'Sign in to track your orders' : 'Join Uncommon Clothing to shop and track orders'}</p>
            </div>
            <form onSubmit={submit} className="space-y-4">
                <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email address" required className="w-full border border-neutral-300 rounded-lg pl-11 pr-4 py-3 text-sm outline-none focus:border-black" />
                </div>
                <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password (min 6 characters)" required minLength={6} className="w-full border border-neutral-300 rounded-lg pl-11 pr-4 py-3 text-sm outline-none focus:border-black" />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button type="submit" disabled={loading} className="w-full bg-black text-white py-3.5 rounded-lg font-semibold text-sm hover:bg-neutral-800 transition flex items-center justify-center gap-2 disabled:opacity-50">
                    {loading ? 'Please wait...' : <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></>}
                </button>
            </form>
            <div className="text-center mt-6 text-sm text-neutral-500">
                {mode === 'login' ? (
                    <>Don't have an account? <button onClick={() => { setMode('signup'); setError(''); }} className="text-black font-semibold underline">Sign up</button></>
                ) : (
                    <>Already have an account? <button onClick={() => { setMode('login'); setError(''); }} className="text-black font-semibold underline">Sign in</button></>
                )}
            </div>
        </div>
    );
}
