import { Star, MapPin, Phone, Clock, Award, Heart, Users } from 'lucide-react';
import { STORE } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function About() {
    return (
        <div>
            <section className="relative h-[50vh] min-h-360 flex items-center overflow-hidden">
                <img src="/images/hero.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative max-w-7xl mx-auto px-6 text-white text-center w-full">
                    <h1 className="text-5xl font-black mb-4">Our Story</h1>
                    <p className="text-neutral-300 max-w-xl mx-auto">From a small boutique in Kiribathgoda to Sri Lanka's destination for uncommon fashion.</p>
                </div>
            </section>
            <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-3">Established 2018</p>
                    <h2 className="text-3xl font-black mb-5">Wear the Difference</h2>
                    <p className="text-neutral-600 leading-relaxed mb-4">{STORE.name} began with a simple idea: fashion should be as unique as the person wearing it. Tired of cookie-cutter styles, we set out to curate pieces that stand out — bold, timeless, and unmistakably you.</p>
                    <p className="text-neutral-600 leading-relaxed mb-4">Located in Gamma Tower on Kandy Road, Kiribathgoda, our boutique brings together the best of men's, women's, and accessories fashion. Every piece is hand-selected for quality, fit, and that uncommon edge.</p>
                    <p className="text-neutral-600 leading-relaxed">Today, we're proud to be rated {STORE.rating} stars by our customers — and we're just getting started.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { icon: Award, label: '5-Star Rated', value: STORE.rating },
                        { icon: Heart, label: 'Happy Customers', value: '2,000+' },
                        { icon: Users, label: 'Products Curated', value: '500+' },
                        { icon: Star, label: 'Reviews', value: String(STORE.reviewCount) },
                    ].map((s, i) => (
                        <div key={i} className="bg-neutral-50 rounded-xl p-6 text-center">
                            <s.icon size={28} className="mx-auto mb-3 text-neutral-700" />
                            <p className="text-2xl font-black">{s.value}</p>
                            <p className="text-xs text-neutral-400 mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>
            <section className="bg-neutral-950 text-white py-16">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex gap-4"><MapPin size={24} className="shrink-0" /><div><h3 className="font-semibold mb-1">Visit Us</h3><p className="text-sm text-neutral-400">{STORE.address}<br />{STORE.addressLine2}</p></div></div>
                    <div className="flex gap-4"><Phone size={24} className="shrink-0" /><div><h3 className="font-semibold mb-1">Call Us</h3><p className="text-sm text-neutral-400">{STORE.phone}</p><a href={`tel:${STORE.phone}`} className="text-sm text-white underline mt-1 inline-block">Call now</a></div></div>
                    <div className="flex gap-4"><Clock size={24} className="shrink-0" /><div><h3 className="font-semibold mb-1">Opening Hours</h3><p className="text-sm text-neutral-400">{STORE.hours}</p></div></div>
                </div>
            </section>
            <section className="max-w-7xl mx-auto px-6 py-16 text-center">
                <h2 className="text-3xl font-black mb-4">Ready to Stand Out?</h2>
                <p className="text-neutral-500 mb-8">Browse our latest collection and find your uncommon style.</p>
                <Link to="/shop" className="inline-block bg-black text-white px-10 py-4 rounded-full font-semibold text-sm hover:bg-neutral-800 transition">Shop Collection</Link>
            </section>
        </div>
    );
}
