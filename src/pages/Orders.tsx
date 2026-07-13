import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronRight, Truck, CheckCircle, Clock, XCircle, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatLKR } from '../lib/utils';

type Order = {
    id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    address: string;
    city: string;
    total: number;
    payment_method: string;
    status: string;
    created_at: string;
    order_items: { product_id: number; product_name: string; quantity: number; price: number; size: string; color: string }[];
};

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
    pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
    processing: { icon: Package, color: 'bg-blue-100 text-blue-700', label: 'Processing' },
    shipped: { icon: Truck, color: 'bg-purple-100 text-purple-700', label: 'Shipped' },
    delivered: { icon: CheckCircle, color: 'bg-green-100 text-green-700', label: 'Delivered' },
    cancelled: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Cancelled' },
};

const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];

export default function Orders() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<number | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/account');
            return;
        }
        if (!user) return;
        const session = JSON.parse(localStorage.getItem('uc_session') || '{}');
        fetch('/api/orders', { headers: { Authorization: `Bearer ${session.token}` } })
            .then(r => r.json())
            .then(d => setOrders(d || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [user, authLoading]);

    if (authLoading || loading) return <div className="max-w-3xl mx-auto px-6 py-20 text-center text-neutral-400">Loading your orders...</div>;
    if (!user) return null;

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <h1 className="text-3xl font-black mb-2">My Orders</h1>
            <p className="text-sm text-neutral-500 mb-8">Track and manage your purchases</p>

            {orders.length === 0 ? (
                <div className="text-center py-16">
                    <ShoppingBag size={48} className="mx-auto mb-4 text-neutral-300" />
                    <p className="text-lg font-medium text-neutral-400 mb-2">No orders yet</p>
                    <p className="text-sm text-neutral-400 mb-6">When you place an order, it will appear here for tracking.</p>
                    <Link to="/shop" className="inline-block bg-black text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-neutral-800 transition">Start Shopping</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => {
                        const cfg = statusConfig[order.status] || statusConfig.pending;
                        const currentStepIdx = statusSteps.indexOf(order.status);
                        const isExpanded = expanded === order.id;
                        return (
                            <div key={order.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                                {/* Order header */}
                                <button
                                    onClick={() => setExpanded(isExpanded ? null : order.id)}
                                    className="w-full flex items-center justify-between p-5 hover:bg-neutral-50 transition text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${cfg.color}`}>
                                            <cfg.icon size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">Order #{order.id}</p>
                                            <p className="text-xs text-neutral-400">
                                                {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-sm hidden sm:block">{formatLKR(order.total)}</span>
                                        <span className={`text-xs px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                                        <ChevronRight size={16} className={`text-neutral-400 transition ${isExpanded ? 'rotate-90' : ''}`} />
                                    </div>
                                </button>

                                {/* Expanded details */}
                                {isExpanded && (
                                    <div className="border-t border-neutral-100 p-5 space-y-5">
                                        {/* Status tracker */}
                                        {order.status !== 'cancelled' && (
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">Order Status</p>
                                                <div className="flex items-center">
                                                    {statusSteps.map((step, i) => {
                                                        const stepCfg = statusConfig[step];
                                                        const isDone = i <= currentStepIdx;
                                                        const isCurrent = i === currentStepIdx;
                                                        return (
                                                            <div key={step} className="flex items-center flex-1 last:flex-none">
                                                                <div className="flex flex-col items-center">
                                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition ${isDone ? stepCfg.color : 'bg-neutral-100 text-neutral-300'} ${isCurrent ? 'ring-2 ring-offset-2 ring-neutral-900' : ''}`}>
                                                                        <stepCfg.icon size={16} />
                                                                    </div>
                                                                    <span className={`text-[10px] mt-1 ${isDone ? 'text-neutral-700 font-medium' : 'text-neutral-300'}`}>{stepCfg.label}</span>
                                                                </div>
                                                                {i < statusSteps.length - 1 && (
                                                                    <div className={`flex-1 h-0.5 mx-1 ${i < currentStepIdx ? 'bg-neutral-900' : 'bg-neutral-200'}`} />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Items */}
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">Items</p>
                                            <div className="space-y-2">
                                                {(order.order_items || []).map((it, i) => (
                                                    <div key={i} className="flex justify-between text-sm border-b border-neutral-50 pb-2">
                                                        <div>
                                                            <p className="font-medium">{it.product_name}</p>
                                                            <p className="text-xs text-neutral-400">{it.size} · {it.color} · Qty {it.quantity}</p>
                                                        </div>
                                                        <span className="font-medium">{formatLKR(it.price * it.quantity)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Shipping & payment */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Shipping Address</p>
                                                <p className="text-neutral-600">{order.customer_name}<br />{order.address}<br />{order.city}<br />{order.customer_phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Payment</p>
                                                <p className="text-neutral-600">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Credit / Debit Card'}</p>
                                                <p className="text-neutral-600 mt-2"><span className="text-neutral-400">Total: </span><span className="font-bold">{formatLKR(order.total)}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
