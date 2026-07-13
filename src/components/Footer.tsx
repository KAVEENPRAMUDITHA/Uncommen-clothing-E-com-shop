import { Link } from 'react-router-dom';
import { Instagram, Facebook, Phone, MapPin, Clock } from 'lucide-react';
import { STORE } from '../lib/utils';

export default function Footer() {
    return (
        <footer className="bg-neutral-950 text-neutral-300 mt-20">
            <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
                <div>
                    <h3 className="text-white font-black text-lg mb-3">UNCOMMON CLOTHING</h3>
                    <p className="text-sm text-neutral-400 leading-relaxed">{STORE.tagline}. Curated fashion for the bold, the unique, the uncommon.</p>
                    <div className="flex gap-3 mt-4">
                        <a href="#" className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition"><Instagram size={16} /></a>
                        <a href="#" className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition"><Facebook size={16} /></a>
                    </div>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Shop</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/shop?category=1" className="hover:text-white transition">Men</Link></li>
                        <li><Link to="/shop?category=2" className="hover:text-white transition">Women</Link></li>
                        <li><Link to="/shop?category=3" className="hover:text-white transition">Accessories</Link></li>
                        <li><Link to="/shop" className="hover:text-white transition">All Products</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Company</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                        <li><Link to="/admin" className="hover:text-white transition">Admin Portal</Link></li>
                        <li><a href={`tel:${STORE.phone}`} className="hover:text-white transition">Contact</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Visit Us</h4>
                    <ul className="space-y-3 text-sm text-neutral-400">
                        <li className="flex gap-2"><MapPin size={16} className="shrink-0 mt-0.5" /><span>{STORE.address}<br />{STORE.addressLine2}</span></li>
                        <li className="flex gap-2"><Phone size={16} className="shrink-0 mt-0.5" /><a href={`tel:${STORE.phone}`} className="hover:text-white">{STORE.phone}</a></li>
                        <li className="flex gap-2"><Clock size={16} className="shrink-0 mt-0.5" /><span>{STORE.hours}</span></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-neutral-800 py-5 text-center text-xs text-neutral-500">
                © {new Date().getFullYear()} {STORE.name}. All rights reserved.
            </div>
        </footer>
    );
}
