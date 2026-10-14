import { useEffect, useState } from 'react';
import { X, RefreshCw, Loader2, Search, CheckCircle2 } from 'lucide-react';
import supabase from '../../lib/supabase';
import { formatLKR } from '../../lib/utils';

type Order = any;

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [selected, setSelected] = useState<Order | null>(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const getToken = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) return session.access_token;
        return JSON.parse(localStorage.getItem('uc_session') || '{}').token || '';
    };

    const fetchOrders = async (showFullLoading = true) => {
        if (showFullLoading) setLoading(true);
        else setRefreshing(true);

        try {
            const token = await getToken();
            const res = await fetch('/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const d = await res.json();
                setOrders(Array.isArray(d) ? d : []);
            }
        } catch (e) {
            console.error('Failed to fetch admin orders:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders(true);

        // Realtime subscription for admin orders
        const channel = supabase
            .channel('admin-orders-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    if (payload.eventType === 'UPDATE' && payload.new) {
                        const updated = payload.new as any;
                        setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
                        setSelected(prev => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
                    } else if (payload.eventType === 'INSERT') {
                        fetchOrders(false);
                    } else if (payload.eventType === 'DELETE') {
                        setOrders(prev => prev.filter(o => o.id !== (payload.old as any)?.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const updateStatus = async (id: number, status: string) => {
        setUpdatingId(id);
        try {
            const token = await getToken();
            const res = await fetch('/api/orders', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ id: Number(id), status: status.toLowerCase() })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                alert(err.error || 'Failed to update order status');
                return;
            }

            const updated = await res.json();
            const newStatus = updated.status || status.toLowerCase();

            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
            setSelected(prev => (prev && prev.id === id ? { ...prev, status: newStatus } : prev));
        } catch (err: any) {
            console.error('Update status error:', err);
            alert('Failed to update order status');
        } finally {
            setUpdatingId(null);
        }
    };

    const statusBadgeClass = (s: string) => {
        switch (s) {
            case 'pending': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
            case 'processing': return 'bg-blue-50 text-blue-800 border-blue-200';
            case 'shipped': return 'bg-purple-50 text-purple-800 border-purple-200';
            case 'delivered': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
            case 'cancelled': return 'bg-rose-50 text-rose-800 border-rose-200';
            default: return 'bg-neutral-100 text-neutral-600 border-neutral-200';
        }
    };

    const filtered = orders.filter(o => {
        const matchesFilter = filterStatus === 'all' || o.status === filterStatus;
        const q = search.toLowerCase();
        const matchesSearch = !search ||
            String(o.id).includes(q) ||
            (o.customer_name || '').toLowerCase().includes(q) ||
            (o.customer_email || '').toLowerCase().includes(q) ||
            (o.customer_phone || '').toLowerCase().includes(q);
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black">Orders</h1>
                    <p className="text-neutral-500 text-sm mt-1">Manage customer orders and real-time shipment updates</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchOrders(false)}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition shadow-sm disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-bold text-emerald-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Sync
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search by Order #, Customer Name, Email, or Phone..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-neutral-900 focus:bg-white transition"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 outline-none focus:border-neutral-900 focus:bg-white"
                    >
                        <option value="all">All Statuses ({orders.length})</option>
                        {ORDER_STATUSES.map(s => (
                            <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)} ({orders.filter(o => o.status === s).length})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />)}</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200 text-neutral-400">
                    <p className="font-semibold text-sm">No orders match your filter.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase border-b border-neutral-100">
                            <tr>
                                <th className="text-left p-4">Order #</th>
                                <th className="text-left p-4">Customer</th>
                                <th className="text-left p-4 hidden md:table-cell">Date</th>
                                <th className="text-left p-4">Total</th>
                                <th className="text-left p-4">Status & Quick Update</th>
                                <th className="text-right p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {filtered.map(o => {
                                const isUpdating = updatingId === o.id;
                                return (
                                    <tr key={o.id} className="hover:bg-neutral-50/70 transition-colors">
                                        <td className="p-4 font-mono font-bold text-neutral-900">#{o.id}</td>
                                        <td className="p-4">
                                            <p className="font-bold text-neutral-900 leading-tight">{o.customer_name}</p>
                                            <p className="text-xs text-neutral-400 mt-0.5">{o.customer_email}</p>
                                            <p className="text-xs text-neutral-400">{o.customer_phone}</p>
                                        </td>
                                        <td className="p-4 text-xs text-neutral-500 hidden md:table-cell">
                                            {o.created_at ? new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                        <td className="p-4 font-black text-neutral-900">{formatLKR(o.total)}</td>
                                        <td className="p-4">
                                            <div className="relative inline-flex items-center">
                                                <select
                                                    value={o.status}
                                                    disabled={isUpdating}
                                                    onChange={e => updateStatus(o.id, e.target.value)}
                                                    className={`text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer outline-none transition disabled:opacity-50 ${statusBadgeClass(o.status)}`}
                                                >
                                                    {ORDER_STATUSES.map(s => (
                                                        <option key={s} value={s} className="bg-white text-neutral-900 font-semibold">
                                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                                        </option>
                                                    ))}
                                                </select>
                                                {isUpdating && (
                                                    <Loader2 size={14} className="ml-2 animate-spin text-neutral-500" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setSelected(o)}
                                                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-900 hover:text-white rounded-lg text-xs font-bold transition duration-200"
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Order Details */}
            {selected && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                    <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Order Management</span>
                                <h2 className="text-2xl font-black text-neutral-900">Order #{selected.id}</h2>
                            </div>
                            <button onClick={() => setSelected(null)} className="p-2 hover:bg-neutral-100 rounded-full transition">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Status update box in modal */}
                        <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 mb-6">
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                                Change Order Status
                            </label>
                            <div className="flex items-center gap-3">
                                <select
                                    value={selected.status}
                                    disabled={updatingId === selected.id}
                                    onChange={e => updateStatus(selected.id, e.target.value)}
                                    className={`flex-1 border text-sm font-bold rounded-xl px-4 py-2.5 outline-none transition ${statusBadgeClass(selected.status)}`}
                                >
                                    {ORDER_STATUSES.map(s => (
                                        <option key={s} value={s} className="bg-white text-neutral-900 font-medium">
                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                {updatingId === selected.id && <Loader2 size={18} className="animate-spin text-neutral-600" />}
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-2">
                                Changing the status immediately updates the customer's portal and sends an email notification.
                            </p>
                        </div>

                        <div className="space-y-2.5 text-xs mb-6 bg-white border border-neutral-100 p-4 rounded-2xl">
                            <p><span className="text-neutral-400 font-medium">Customer:</span> <strong className="text-neutral-800">{selected.customer_name}</strong></p>
                            <p><span className="text-neutral-400 font-medium">Email:</span> <strong className="text-neutral-800">{selected.customer_email}</strong></p>
                            <p><span className="text-neutral-400 font-medium">Phone:</span> <strong className="text-neutral-800">{selected.customer_phone}</strong></p>
                            <p><span className="text-neutral-400 font-medium">Delivery Address:</span> <span className="text-neutral-800">{selected.address}, {selected.city}</span></p>
                            <p><span className="text-neutral-400 font-medium">Payment Mode:</span> <span className="font-bold uppercase text-neutral-800">{selected.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 'Card Payment'}</span></p>
                            <p className="pt-2 border-t border-neutral-100 flex items-center justify-between text-sm">
                                <span className="text-neutral-500 font-medium">Total Amount:</span>
                                <span className="font-black text-neutral-900 text-base">{formatLKR(selected.total)}</span>
                            </p>
                        </div>

                        <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-400 mb-3">Order Items</h3>
                        <div className="space-y-2 mb-6">
                            {(selected.order_items || []).map((it: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-xs border border-neutral-100 p-3 rounded-xl bg-neutral-50/50">
                                    <div>
                                        <p className="font-bold text-neutral-900">{it.product_name}</p>
                                        <p className="text-[11px] text-neutral-400 mt-0.5">
                                            {it.size ? `Size: ${it.size}` : ''} {it.color ? `· Color: ${it.color}` : ''} · Qty: {it.quantity}
                                        </p>
                                    </div>
                                    <span className="font-bold text-neutral-900">{formatLKR(it.price * it.quantity)}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setSelected(null)}
                            className="w-full py-3 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition shadow-sm"
                        >
                            Close Details
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
