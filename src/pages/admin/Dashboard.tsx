import { useEffect, useState } from 'react';
import { Package, ShoppingCart, Tag, DollarSign, Star, AlertTriangle, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { formatLKR } from '../../lib/utils';

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const session = JSON.parse(localStorage.getItem('uc_session') || '{}');
        fetch('/api/stats', { headers: { Authorization: `Bearer ${session.token}` } })
            .then(r => r.json()).then(d => setStats(d)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const cards = stats ? [
        { label: 'Total Revenue', value: formatLKR(stats.revenue), icon: DollarSign, color: 'bg-green-100 text-green-600' },
        { label: 'Orders', value: stats.orders, icon: ShoppingCart, color: 'bg-blue-100 text-blue-600' },
        { label: 'Products', value: stats.products, icon: Package, color: 'bg-purple-100 text-purple-600' },
        { label: 'Categories', value: stats.categories, icon: Tag, color: 'bg-orange-100 text-orange-600' },
        { label: 'Avg Rating', value: `${stats.avgRating} ★`, icon: Star, color: 'bg-yellow-100 text-yellow-600' },
        { label: 'Pending Orders', value: stats.pending, icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
        { label: 'Users', value: stats.users ?? '—', icon: Users, color: 'bg-cyan-100 text-cyan-600' },
        { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'bg-amber-100 text-amber-600' },
    ] : [];

    return (
        <div>
            <h1 className="text-3xl font-black mb-2">Dashboard</h1>
            <p className="text-neutral-500 text-sm mb-8">Welcome back, {user?.email}</p>
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-28 bg-white rounded-xl animate-pulse" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {cards.map((c, i) => (
                        <div key={i} className="bg-white rounded-xl p-6 border border-neutral-200">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${c.color}`}><c.icon size={24} /></div>
                            <p className="text-2xl font-black">{c.value}</p>
                            <p className="text-sm text-neutral-400 mt-1">{c.label}</p>
                        </div>
                    ))}
                </div>
            )}
            <div className="mt-8 bg-white rounded-xl p-6 border border-neutral-200">
                <h2 className="font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-sm">
                    {[
                        { label: 'Add Product', to: '/admin/products' },
                        { label: 'Add Category', to: '/admin/categories' },
                        { label: 'Create Discount', to: '/admin/discounts' },
                        { label: 'View Orders', to: '/admin/orders' },
                        { label: 'Manage Users', to: '/admin/users' },
                    ].map(a => (
                        <a key={a.label} href={a.to} className="border border-neutral-200 rounded-lg p-4 text-center hover:border-black hover:bg-neutral-50 transition font-medium">{a.label}</a>
                    ))}
                </div>
            </div>
        </div>
    );
}
