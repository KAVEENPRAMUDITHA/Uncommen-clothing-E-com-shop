import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    SlidersHorizontal,
    Search,
    X,
    Sparkles,
    Truck,
    ShieldCheck,
    RefreshCw,
    ShoppingBag,
    ArrowRight
} from 'lucide-react';
import ProductCard from '../components/ProductCard';

type Cat = { id: number; name: string };
type Prod = any;

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    }),
};

export default function Shop() {
    const [params, setParams] = useSearchParams();
    const [categories, setCategories] = useState<Cat[]>([]);
    const [products, setProducts] = useState<Prod[]>([]);
    const [loading, setLoading] = useState(true);

    const category = params.get('category') || 'all';
    const sort = params.get('sort') || 'default';
    const search = params.get('search') || '';

    const setParam = (k: string, v: string) => {
        const next = new URLSearchParams(params);
        if (v === 'all' || !v) next.delete(k); else next.set(k, v);
        setParams(next);
    };

    const clearFilters = () => {
        setParams(new URLSearchParams());
    };

    useEffect(() => {
        fetch('/api/categories')
            .then(r => r.json())
            .then(d => setCategories(d || []))
            .catch(() => {});
    }, []);

    useEffect(() => {
        setLoading(true);
        const q = new URLSearchParams();
        if (category !== 'all') q.set('category', category);
        if (sort !== 'default') q.set('sort', sort);
        if (search) q.set('search', search);

        fetch(`/api/products?${q.toString()}`)
            .then(r => r.json())
            .then(d => setProducts(d || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [category, sort, search]);

    const activeCatName =
        category === 'all'
            ? 'All Collections'
            : categories.find(c => String(c.id) === category)?.name || 'Collection';

    return (
        <div className="min-h-screen bg-neutral-50/40">
            {/* ─── Shop Header Banner ─── */}
            <div className="bg-neutral-950 text-white py-12 md:py-16 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-neutral-800/30 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
                <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                <div className="max-w-7xl mx-auto relative">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                    >
                        <div>
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.25em] uppercase text-neutral-400 mb-3 border border-white/10 px-3.5 py-1 rounded-full bg-white/5 backdrop-blur-sm">
                                <Sparkles size={12} className="text-yellow-400" />
                                {search ? 'Search Results' : 'Curated Catalog'}
                            </span>
                            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
                                {search ? `Results for "${search}"` : activeCatName}
                            </h1>
                            <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-md">
                                {search
                                    ? `Showing matching pieces found in our store catalog.`
                                    : `Explore our limited-run drops, premium fits, and essential statements.`}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-neutral-200 border border-white/10">
                                {loading ? 'Fetching...' : `${products.length} Products`}
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ─── Filter & Toolbar Section ─── */}
            <div className="max-w-7xl mx-auto px-6 pt-8 pb-16">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 pb-5 border-b border-neutral-200">
                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setParam('category', 'all')}
                            className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-300 ${
                                category === 'all'
                                    ? 'bg-neutral-900 text-white shadow-md'
                                    : 'bg-white text-neutral-600 border border-neutral-200/80 hover:border-neutral-900 hover:text-neutral-900'
                            }`}
                        >
                            All Pieces
                        </button>
                        {categories.map(c => {
                            const isSelected = category === String(c.id);
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => setParam('category', String(c.id))}
                                    className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-300 ${
                                        isSelected
                                            ? 'bg-neutral-900 text-white shadow-md'
                                            : 'bg-white text-neutral-600 border border-neutral-200/80 hover:border-neutral-900 hover:text-neutral-900'
                                    }`}
                                >
                                    {c.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Active Filter Chips & Sort Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Active Search Pill */}
                        {search && (
                            <div className="inline-flex items-center gap-2 bg-neutral-900 text-white px-3.5 py-1.5 rounded-full text-xs font-medium">
                                <Search size={12} className="text-neutral-400" />
                                <span>"{search}"</span>
                                <button
                                    onClick={() => setParam('search', '')}
                                    className="hover:bg-neutral-800 p-0.5 rounded-full transition"
                                    title="Clear search"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        )}

                        {/* Sort Selector */}
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-neutral-200 shadow-sm">
                            <SlidersHorizontal size={14} className="text-neutral-400 ml-1 shrink-0" />
                            <select
                                value={sort}
                                onChange={e => setParam('sort', e.target.value)}
                                className="text-xs font-semibold text-neutral-800 outline-none bg-transparent pr-2 cursor-pointer py-1"
                            >
                                <option value="default">Sort: Featured</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="newest">Newest First</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* ─── Product Grid ─── */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex flex-col space-y-3">
                                <div className="aspect-[3/4] bg-neutral-200/70 animate-pulse rounded-2xl" />
                                <div className="h-4 bg-neutral-200/70 animate-pulse rounded w-3/4" />
                                <div className="h-4 bg-neutral-200/70 animate-pulse rounded w-1/3" />
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-12 text-center border border-neutral-200/80 shadow-sm max-w-md mx-auto my-8"
                    >
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
                            <ShoppingBag size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 mb-1">No products found</h3>
                        <p className="text-sm text-neutral-500 mb-6">
                            We couldn't find any products matching your current filters.
                        </p>
                        <button
                            onClick={clearFilters}
                            className="bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full hover:bg-neutral-800 transition"
                        >
                            Reset All Filters
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6"
                    >
                        <AnimatePresence>
                            {products.map((p, i) => (
                                <motion.div
                                    key={p.id}
                                    variants={fadeUp}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    custom={i % 8}
                                    layout
                                >
                                    <ProductCard product={p} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* ─── Bottom Perks Bar ─── */}
                <div className="mt-20 pt-10 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
                    <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
                        <div className="w-11 h-11 bg-neutral-900 text-white rounded-xl flex items-center justify-center shrink-0">
                            <Truck size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Islandwide Delivery</p>
                            <p className="text-xs text-neutral-500 mt-0.5">Free on orders above Rs. 5,000</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
                        <div className="w-11 h-11 bg-neutral-900 text-white rounded-xl flex items-center justify-center shrink-0">
                            <RefreshCw size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-neutral-900 uppercase tracking-wider">7-Day Exchanges</p>
                            <p className="text-xs text-neutral-500 mt-0.5">Hassle-free size and style swaps</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
                        <div className="w-11 h-11 bg-neutral-900 text-white rounded-xl flex items-center justify-center shrink-0">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Secure Payment</p>
                            <p className="text-xs text-neutral-500 mt-0.5">Card payments & Cash on Delivery</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
