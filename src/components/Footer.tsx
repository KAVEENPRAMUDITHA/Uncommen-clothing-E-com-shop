import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Instagram,
    Facebook,
    Phone,
    MapPin,
    Clock,
    Mail,
    ArrowUp,
    Sparkles,
    Check,
    ArrowRight,
    ShieldCheck,
    CreditCard,
    Heart
} from 'lucide-react';
import { STORE } from '../lib/utils';

export default function Footer() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setEmail('');
            setTimeout(() => setSubscribed(false), 5000);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-neutral-950 text-neutral-300 relative overflow-hidden border-t border-neutral-800/80">
            {/* Subtle glow circles in background */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-neutral-800/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neutral-800/15 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

            {/* Newsletter / Club Banner */}
            <div className="border-b border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="text-center lg:text-left">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.25em] uppercase text-neutral-400 mb-2">
                            <Sparkles size={13} className="text-yellow-400" />
                            Join the Uncommon Club
                        </span>
                        <h3 className="text-2xl font-bold text-white tracking-tight">
                            Get 10% off your first order & VIP drop alerts.
                        </h3>
                    </div>
                    <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row gap-2 max-w-md">
                        {subscribed ? (
                            <div className="flex items-center gap-2 px-6 py-3 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-sm font-medium rounded-full">
                                <Check size={16} className="text-emerald-400 shrink-0" />
                                <span>Welcome to the club! Check your inbox soon.</span>
                            </div>
                        ) : (
                            <div className="relative flex items-center w-full">
                                <Mail size={16} className="absolute left-4 text-neutral-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="w-full sm:w-80 pl-11 pr-32 py-3 bg-neutral-900 border border-neutral-800 rounded-full text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-1.5 bg-white text-neutral-950 px-5 py-2 rounded-full text-xs font-bold hover:bg-neutral-200 transition-all flex items-center gap-1 group"
                                >
                                    Subscribe
                                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* Main Links Grid */}
            <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                {/* Brand Column (spans 2 on large screens) */}
                <div className="lg:col-span-2 space-y-4">
                    <Link to="/" className="inline-flex items-center gap-2">
                        <span className="text-2xl font-black tracking-tight text-white">UNCOMMON</span>
                        <span className="text-2xl font-light tracking-[0.3em] text-neutral-400">CLOTHING</span>
                    </Link>
                    <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
                        {STORE.tagline}. Handcrafted & curated fashion for individuals who refuse to blend in. Located in Gamma Tower, Kiribathgoda.
                    </p>

                    {/* Trust Badges Minimal */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400 bg-neutral-900/80 px-3 py-1.5 rounded-full border border-neutral-800">
                            <ShieldCheck size={14} className="text-emerald-400" />
                            <span>100% Authentic Quality</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400 bg-neutral-900/80 px-3 py-1.5 rounded-full border border-neutral-800">
                            <CreditCard size={14} className="text-sky-400" />
                            <span>Secure Payment</span>
                        </div>
                    </div>

                    {/* Social links */}
                    <div className="pt-2">
                        <p className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-3">Follow our journey</p>
                        <div className="flex items-center gap-2.5">
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-white hover:text-black border border-neutral-800 flex items-center justify-center transition-all duration-300 group"
                                title="Instagram"
                            >
                                <Instagram size={17} className="transition-transform group-hover:scale-110" />
                            </a>
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-white hover:text-black border border-neutral-800 flex items-center justify-center transition-all duration-300 group"
                                title="Facebook"
                            >
                                <Facebook size={17} className="transition-transform group-hover:scale-110" />
                            </a>
                            <a
                                href={`tel:${STORE.phone}`}
                                className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-white hover:text-black border border-neutral-800 flex items-center justify-center transition-all duration-300 group"
                                title="Direct Line"
                            >
                                <Phone size={17} className="transition-transform group-hover:scale-110" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Shop links */}
                <div>
                    <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-[0.2em]">Collections</h4>
                    <ul className="space-y-2.5 text-sm">
                        <li>
                            <Link to="/shop?category=1" className="text-neutral-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                                Men's Wear
                            </Link>
                        </li>
                        <li>
                            <Link to="/shop?category=2" className="text-neutral-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                                Women's Wear
                            </Link>
                        </li>
                        <li>
                            <Link to="/shop?category=3" className="text-neutral-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                                Accessories
                            </Link>
                        </li>
                        <li>
                            <Link to="/shop" className="text-neutral-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                                New Arrivals
                            </Link>
                        </li>
                        <li>
                            <Link to="/shop" className="text-neutral-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                                All Collections
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Customer Care / Quick Links */}
                <div>
                    <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-[0.2em]">Quick Links</h4>
                    <ul className="space-y-2.5 text-sm">
                        <li>
                            <Link to="/about" className="text-neutral-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                                Our Story
                            </Link>
                        </li>
                        <li>
                            <Link to="/orders" className="text-neutral-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                                Track My Order
                            </Link>
                        </li>
                        <li>
                            <Link to="/account" className="text-neutral-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                                Account & Sign In
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin" className="text-neutral-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                                Admin Portal
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Store Info */}
                <div>
                    <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-[0.2em]">Store & Hours</h4>
                    <ul className="space-y-3.5 text-sm text-neutral-400">
                        <li className="flex items-start gap-2.5">
                            <MapPin size={16} className="text-neutral-400 shrink-0 mt-1" />
                            <span>
                                {STORE.address}<br />
                                <span className="text-xs text-neutral-400">{STORE.addressLine2}</span>
                            </span>
                        </li>
                        <li className="flex items-center gap-2.5">
                            <Phone size={16} className="text-neutral-400 shrink-0" />
                            <a href={`tel:${STORE.phone}`} className="hover:text-white transition">
                                {STORE.phone}
                            </a>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <Clock size={16} className="text-neutral-400 shrink-0 mt-0.5" />
                            <span>{STORE.hours}</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar with Back to Top */}
            <div className="border-t border-neutral-900 bg-neutral-950/80">
                <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
                    <div className="flex items-center gap-1 text-center sm:text-left">
                        <span>© {new Date().getFullYear()} {STORE.name}. All rights reserved.</span>
                        <span className="hidden sm:inline text-neutral-500">•</span>
                        <span className="hidden sm:inline-flex items-center gap-1 text-neutral-400">
                            Crafted with <Heart size={11} className="fill-red-500 text-red-500 inline" /> in Sri Lanka
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <span className="text-neutral-400 tracking-wider font-semibold text-[11px] uppercase">
                            {STORE.tagline}
                        </span>
                        <button
                            onClick={scrollToTop}
                            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white px-3 py-1.5 rounded-full border border-neutral-800 hover:border-neutral-700 bg-neutral-900/60 transition-all duration-200 group"
                            title="Back to top"
                        >
                            <span>Top</span>
                            <ArrowUp size={13} className="group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
