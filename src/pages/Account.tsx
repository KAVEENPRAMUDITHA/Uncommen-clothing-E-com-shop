import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    Lock,
    ArrowRight,
    ShoppingBag,
    CheckCircle,
    User,
    Package,
    LogOut,
    Sparkles,
    ShieldCheck,
    Eye,
    EyeOff,
    Phone,
    MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { STORE } from '../lib/utils';

export default function Account() {
    const { user, isAdmin, signIn, signUp, signOut } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
                setSignupSuccess(true);
                setTimeout(async () => {
                    const { error: signInError } = await signIn(email, password);
                    if (signInError) {
                        setSignupSuccess(false);
                        setMode('login');
                        setError('Account created! Please sign in with your credentials.');
                    }
                }, 1500);
            }
        }
    };

    // ─── Logged In State: Account Dashboard ───
    if (user) {
        if (isAdmin) {
            navigate('/admin');
            return null;
        }

        const initial = user.email ? user.email[0].toUpperCase() : 'U';

        return (
            <div className="min-h-[85vh] bg-neutral-50/50 py-12 px-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-sm relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-80 h-80 bg-neutral-900/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative">
                            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                                <div className="w-20 h-20 bg-neutral-900 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-md border-2 border-white">
                                    {initial}
                                </div>
                                <div>
                                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                                        <h1 className="text-2xl font-black text-neutral-900 tracking-tight">My Account</h1>
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-neutral-900 text-white px-2.5 py-0.5 rounded-full">
                                            <Sparkles size={10} className="text-yellow-400" /> Member
                                        </span>
                                    </div>
                                    <p className="text-sm text-neutral-500 font-medium">{user.email}</p>
                                    <p className="text-xs text-neutral-400 mt-1">Uncommon Clothing Club</p>
                                </div>
                            </div>

                            <button
                                onClick={() => signOut()}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-red-600 px-4 py-2 rounded-full border border-neutral-200 hover:border-red-200 hover:bg-red-50/50 transition-all duration-200"
                            >
                                <LogOut size={14} /> Sign Out
                            </button>
                        </div>
                    </motion.div>

                    {/* Quick Access Dashboard Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Link
                                to="/orders"
                                className="group block bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-sm hover:shadow-lg hover:border-neutral-900 transition-all duration-300 h-full flex flex-col justify-between"
                            >
                                <div>
                                    <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Package size={22} />
                                    </div>
                                    <h3 className="text-base font-bold text-neutral-900">My Orders</h3>
                                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                                        Track active shipments, review past orders, and view receipts.
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-900 mt-5 group-hover:gap-2 transition-all">
                                    View Orders <ArrowRight size={13} />
                                </span>
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                        >
                            <Link
                                to="/shop"
                                className="group block bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-sm hover:shadow-lg hover:border-neutral-900 transition-all duration-300 h-full flex flex-col justify-between"
                            >
                                <div>
                                    <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <ShoppingBag size={22} />
                                    </div>
                                    <h3 className="text-base font-bold text-neutral-900">Explore Catalog</h3>
                                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                                        Discover new arrivals, limited-run garments, and member collections.
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-900 mt-5 group-hover:gap-2 transition-all">
                                    Browse Shop <ArrowRight size={13} />
                                </span>
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-sm h-full flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-4">
                                        <MapPin size={22} />
                                    </div>
                                    <h3 className="text-base font-bold text-neutral-900">Flagship Boutique</h3>
                                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                                        {STORE.address}, {STORE.addressLine2}
                                    </p>
                                </div>
                                <a
                                    href={`tel:${STORE.phone}`}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-neutral-900 mt-5 hover:underline"
                                >
                                    <Phone size={13} /> {STORE.phone}
                                </a>
                            </div>
                        </motion.div>
                    </div>

                    {/* Member Privileges Strip */}
                    <div className="bg-neutral-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 text-center sm:text-left">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                <ShieldCheck size={24} className="text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm sm:text-base">Uncommon Club Privileges Active</h4>
                                <p className="text-xs text-neutral-400 mt-0.5">
                                    You enjoy priority order dispatch, 7-day hassle-free exchanges, and private drop access.
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/shop"
                            className="bg-white text-neutral-950 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition shrink-0"
                        >
                            Shop New Drops
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Signup Success Temporary View ───
    if (signupSuccess) {
        return (
            <div className="min-h-[75vh] flex items-center justify-center px-6 py-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white rounded-3xl p-10 border border-neutral-100 shadow-xl text-center"
                >
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={36} />
                    </div>
                    <h2 className="text-2xl font-black text-neutral-900 mb-2">Welcome to Uncommon!</h2>
                    <p className="text-sm text-neutral-500">Signing you into your new account...</p>
                </motion.div>
            </div>
        );
    }

    // ─── Logged Out State: Auth Card ───
    return (
        <div className="min-h-[85vh] flex items-center justify-center px-6 py-16 bg-neutral-50/50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-xl">
                    {/* Header & Logo */}
                    <div className="text-center mb-8">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.25em] uppercase text-neutral-400 mb-2">
                            <Sparkles size={12} className="text-yellow-500" />
                            Uncommon Account
                        </span>
                        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
                            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                        </h1>
                        <p className="text-xs text-neutral-500 mt-2">
                            {mode === 'login'
                                ? 'Sign in to access your orders and member benefits'
                                : 'Join our club for exclusive drops and seamless tracking'}
                        </p>
                    </div>

                    {/* Mode Switcher Tabs */}
                    <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-2xl mb-6 text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => {
                                setMode('login');
                                setError('');
                            }}
                            className={`py-2.5 rounded-xl transition-all duration-200 ${
                                mode === 'login'
                                    ? 'bg-white text-neutral-900 shadow-sm'
                                    : 'text-neutral-500 hover:text-neutral-900'
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMode('signup');
                                setError('');
                            }}
                            className={`py-2.5 rounded-xl transition-all duration-200 ${
                                mode === 'signup'
                                    ? 'bg-white text-neutral-900 shadow-sm'
                                    : 'text-neutral-500 hover:text-neutral-900'
                            }`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Auth Form */}
                    <form onSubmit={submit} className="space-y-4">
                        <div className="relative">
                            <Mail size={17} className="absolute left-4 top-3.5 text-neutral-400" />
                            <input
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                type="email"
                                placeholder="Email address"
                                className="w-full pl-11 pr-4 py-3 bg-neutral-50/60 border border-neutral-200 rounded-xl text-sm outline-none focus:border-neutral-900 focus:bg-white transition"
                            />
                        </div>

                        <div className="relative">
                            <Lock size={17} className="absolute left-4 top-3.5 text-neutral-400" />
                            <input
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password (min 6 characters)"
                                minLength={6}
                                className="w-full pl-11 pr-11 py-3 bg-neutral-50/60 border border-neutral-200 rounded-xl text-sm outline-none focus:border-neutral-900 focus:bg-white transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-neutral-700 transition"
                            >
                                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-neutral-900 text-white rounded-full font-bold text-sm uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group mt-2"
                        >
                            {loading ? (
                                <span>Please wait...</span>
                            ) : (
                                <>
                                    <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Member Benefits Perks */}
                    <div className="mt-8 pt-6 border-t border-neutral-100 grid grid-cols-2 gap-3 text-[11px] text-neutral-500 font-medium">
                        <div className="flex items-center gap-1.5">
                            <CheckCircle size={13} className="text-emerald-600 shrink-0" />
                            <span>1-Click Order Tracking</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle size={13} className="text-emerald-600 shrink-0" />
                            <span>VIP Drop Early Access</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
