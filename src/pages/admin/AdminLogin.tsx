import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLogin() {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('admin@uncommonclothing.lk');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { error } = await signIn(email, password);
        setLoading(false);
        if (error) setError(error);
        else navigate('/admin');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="text-2xl font-black text-white">UNCOMMON</Link>
                    <p className="text-neutral-500 text-xs tracking-[0.3em] mt-1">ADMIN PORTAL</p>
                </div>
                <div className="bg-white rounded-2xl p-8">
                    <h1 className="text-2xl font-black mb-2">Welcome back</h1>
                    <p className="text-sm text-neutral-400 mb-6">Sign in to manage your store</p>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Admin email" className="w-full border border-neutral-300 rounded-lg pl-11 pr-4 py-3 text-sm outline-none focus:border-black" />
                        </div>
                        <div className="relative">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full border border-neutral-300 rounded-lg pl-11 pr-4 py-3 text-sm outline-none focus:border-black" />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <button type="submit" disabled={loading} className="w-full bg-black text-white py-3.5 rounded-lg font-semibold text-sm hover:bg-neutral-800 transition flex items-center justify-center gap-2 disabled:opacity-50">{loading ? 'Signing in...' : <>Sign In <ArrowRight size={16} /></>}</button>
                    </form>
                    <div className="mt-6 p-3 bg-neutral-50 rounded-lg text-xs text-neutral-500">
                        <p className="font-semibold mb-1">Demo credentials:</p>
                        <p>Email: admin@uncommonclothing.lk</p>
                        <p>Password: uncommon123</p>
                    </div>
                </div>
                <Link to="/" className="block text-center text-neutral-500 text-sm mt-6 hover:text-white">← Back to store</Link>
            </div>
        </div>
    );
}
