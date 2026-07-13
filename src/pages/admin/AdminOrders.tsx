import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { formatLKR } from '../../lib/utils';

type Order = any;

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Order | null>(null);

    const token = () => JSON.parse(localStorage.getItem('uc_session') || '{}').token;

    const fetchOrders = async () => {
        setLoading(true);
        const d = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.json());
        setOrders(d || []);
        setLoading(false);
    };
    useEffect(() => { fetchOrders(); }, []);

    const updateStatus = async (id: number, status: string) => {
        await fetch('/api/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ id, status }) });
        fetchOrders();
        if (selected?.id === id) setSelected({ ...selected, status });
    };

    const statusColor = (s: string) => ({ pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' }[s] || 'bg-neutral-100 text-neutral-500');

    return (
        <div>
            <div className="mb-6"><h1 className="text-3xl font-black">Orders</h1><p className="text-neutral-500 text-sm mt-1">Manage customer orders</p></div>
            {loading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />)}</div> : orders.length === 0 ? (
                <div className="text-center py-20 text-neutral-400"><p>No orders yet.</p></div>
            ) : (
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase"><tr><th className="text-left p-4">Order #</th><th className="text-left p-4 hidden sm:table-cell">Customer</th><th className="text-left p-4">Total</th><th className="text-left p-4">Status</th><th className="text-right p-4">Action</th></tr></thead>
                        <tbody>
                            {orders.map(o => (
                                <tr key={o.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                                    <td className="p-4 font-medium">#{o.id}</td>
                                    <td className="p-4 hidden sm:table-cell"><p className="font-medium">{o.customer_name}</p><p className="text-xs text-neutral-400">{o.customer_email}</p></td>
                                    <td className="p-4 font-medium">{formatLKR(o.total)}</td>
                                    <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full ${statusColor(o.status)}`}>{o.status}</span></td>
                                    <td className="p-4 text-right"><button onClick={() => setSelected(o)} className="text-xs font-medium underline">View</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {selected && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold">Order #{selected.id}</h2><button onClick={() => setSelected(null)}><X size={20} /></button></div>
                        <div className="space-y-2 text-sm mb-4">
                            <p><span className="text-neutral-400">Customer:</span> {selected.customer_name}</p>
                            <p><span className="text-neutral-400">Email:</span> {selected.customer_email}</p>
                            <p><span className="text-neutral-400">Phone:</span> {selected.customer_phone}</p>
                            <p><span className="text-neutral-400">Address:</span> {selected.address}, {selected.city}</p>
                            <p><span className="text-neutral-400">Payment:</span> {selected.payment_method === 'cod' ? 'Cash on Delivery' : 'Card'}</p>
                            <p><span className="text-neutral-400">Total:</span> <span className="font-bold">{formatLKR(selected.total)}</span></p>
                        </div>
                        <h3 className="font-bold mb-2 text-sm">Items</h3>
                        <div className="space-y-2 mb-4">
                            {(selected.order_items || []).map((it: any, i: number) => (
                                <div key={i} className="flex justify-between text-sm border-b border-neutral-100 pb-2"><span>{it.product_name} ({it.size} · {it.color}) ×{it.quantity}</span><span className="font-medium">{formatLKR(it.price * it.quantity)}</span></div>
                            ))}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Update Status</label>
                            <select value={selected.status} onChange={e => updateStatus(selected.id, e.target.value)} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black bg-white">
                                {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
