import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, MapPin, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { STORE, formatLKR } from '../lib/utils';
import ProductCard from '../components/ProductCard';

type Cat = { id: number; name: string; slug: string; image_url: string; description: string };
type Prod = any;

export default function Home() {
    const [categories, setCategories] = useState<Cat[]>([]);
    const [products, setProducts] = useState<Prod[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/categories').then(r => r.json()),
            fetch('/api/products?featured=true').then(r => r.json()),
        ]).then(([c, p]) => { setCategories(c || []); setProducts(p || []); })
            .catch(() => { }).finally(() => setLoading(false));
    }, []);

    return (
        <div>
            {/* Hero */}
            <section className="relative h-[85vh] min-h-[560px] flex items-center overflow-hidden">
                <img src="/images/hero.jpg" alt="Uncommon Clothing" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                <div className="relative max-w-7xl mx-auto px-6 w-full">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-xl text-white">
                        <span className="inline-block text-xs font-semibold tracking-[0.3em] uppercase border border-white/30 px-4 py-1.5 rounded-full mb-6">New Collection 2025</span>
                        <h1 className="text-5xl sm:text-7xl font-black leading-[0.95] mb-6">Wear the<br />Difference.</h1>
                        <p className="text-lg text-neutral-200 mb-8 max-w-md">Bold styles for the uncommon. Discover curated fashion that speaks your language — now in Kiribathgoda.</p>
                        <div className="flex flex-wrap gap-4">
                            <Link to="/shop" className="bg-white text-black px-8 py-4 rounded-full font-semibold text-sm hover:bg-neutral-200 transition flex items-center gap-2">Shop Now <ArrowRight size={16} /></Link>
                            <Link to="/about" className="border border-white/40 text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-white/10 transition">Our Story</Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Trust badges */}
            <section className="border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-neutral-200">
                    {[
                        { icon: Truck, title: 'Free Shipping', sub: 'On orders over Rs. 5,000' },
                        { icon: RefreshCw, title: 'Easy Returns', sub: '7-day exchange policy' },
                        { icon: ShieldCheck, title: 'Secure Payment', sub: 'Card · Cash on Delivery' },
                        { icon: MapPin, title: 'Visit Store', sub: 'Kiribathgoda, Sri Lanka' },
                    ].map((b, i) => (
                        <div key={i} className="flex items-center gap-3 py-6 px-4 first:pl-0 last:pr-0">
                            <b.icon size={22} className="text-neutral-700 shrink-0" />
                            <div><p className="text-sm font-semibold">{b.title}</p><p className="text-xs text-neutral-400">{b.sub}</p></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Categories */}
            <section className="max-w-7xl mx-auto px-6 py-16">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-2">Browse</p>
                        <h2 className="text-3xl font-black">Shop by Category</h2>
                    </div>
                    <Link to="/shop" className="text-sm font-medium underline hidden sm:inline">View all</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {categories.map((c, i) => (
                        <Link key={c.id} to={`/shop?category=${c.id}`} className="group relative h-72 rounded-xl overflow-hidden">
                            <img src={c.image_url} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="absolute bottom-0 left-0 p-6 text-white">
                                <h3 className="text-2xl font-bold">{c.name}</h3>
                                <p className="text-sm text-neutral-300 mt-1">{c.description}</p>
                                <span className="inline-flex items-center gap-1 text-sm font-medium mt-3 group-hover:gap-2 transition-all">Explore <ArrowRight size={14} /></span>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured products */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-2">Handpicked</p>
                        <h2 className="text-3xl font-black">Featured Products</h2>
                    </div>
                    <Link to="/shop" className="text-sm font-medium underline">View all</Link>
                </div>
                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[3/4] bg-neutral-100 animate-pulse rounded-lg" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                )}
            </section>

            {/* Promo banner */}
            <section className="max-w-7xl mx-auto px-6 py-16">
                <div className="relative rounded-2xl overflow-hidden bg-neutral-900 text-white p-12 sm:p-16">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                    <div className="relative max-w-lg">
                        <div className="flex items-center gap-1 mb-4">
                            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)}
                            <span className="ml-2 text-sm text-neutral-300">{STORE.rating} · {STORE.reviewCount} reviews</span>
                        </div>
                        <h2 className="text-4xl font-black mb-4">Become Uncommon.</h2>
                        <p className="text-neutral-300 mb-6">Join thousands who chose to stand out. Exclusive offers, early access to drops, and members-only pricing.</p>
                        <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold text-sm hover:bg-neutral-200 transition">Browse Collection <ArrowRight size={16} /></Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
