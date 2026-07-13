import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';

type Cat = { id: number; name: string };
type Prod = any;

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

    useEffect(() => {
        fetch('/api/categories').then(r => r.json()).then(d => setCategories(d || []));
    }, []);

    useEffect(() => {
        setLoading(true);
        const q = new URLSearchParams();
        if (category !== 'all') q.set('category', category);
        if (sort !== 'default') q.set('sort', sort);
        if (search) q.set('search', search);
        fetch(`/api/products?${q.toString()}`).then(r => r.json()).then(d => setProducts(d || [])).catch(() => { }).finally(() => setLoading(false));
    }, [category, sort, search]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="mb-8">
                <h1 className="text-4xl font-black mb-2">Shop</h1>
                <p className="text-neutral-500 text-sm">{loading ? 'Loading...' : `${products.length} products`}</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-200">
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setParam('category', 'all')} className={`px-4 py-2 rounded-full text-sm font-medium transition ${category === 'all' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}>All</button>
                    {categories.map(c => (
                        <button key={c.id} onClick={() => setParam('category', String(c.id))} className={`px-4 py-2 rounded-full text-sm font-medium transition ${category === String(c.id) ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}>{c.name}</button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <SlidersHorizontal size={16} className="text-neutral-400" />
                    <select value={sort} onChange={e => setParam('sort', e.target.value)} className="text-sm border border-neutral-300 rounded-full px-4 py-2 outline-none focus:border-black bg-white">
                        <option value="default">Sort: Featured</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="newest">Newest</option>
                    </select>
                </div>
            </div>
            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4] bg-neutral-100 animate-pulse rounded-lg" />)}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 text-neutral-400">
                    <p className="text-lg">No products found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
            )}
        </div>
    );
}
