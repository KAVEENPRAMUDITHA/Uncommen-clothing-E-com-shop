import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    ChevronDown,
    Truck,
    CheckCircle2,
    Clock,
    XCircle,
    ShoppingBag,
    Sparkles,
    ArrowRight,
    MapPin,
    CreditCard,
    Banknote,
    ArrowLeft,
    Calendar,
    Hash
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatLKR, STORE } from '../lib/utils';

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

const statusConfig: Record<string, { icon: any; bg: string; text: string; border: string; label: string; dot: string }> = {
    pending: {
        icon: Clock,
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        label: 'Order Placed'
    },
    processing: {
        icon: Package,
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        label: 'Processing'
    },
    shipped: {
        icon: Truck,
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
        label: 'Dispatched'
    },
    delivered: {
        icon: CheckCircle2,
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Delivered'
    },
    cancelled: {
        icon: XCircle,
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
        label: 'Cancelled'
    },
};

const statusSteps = [
    { key: 'pending', label: 'Placed', icon: Clock },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'In Transit', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

export default function Orders() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/account');
            return;
        }
        if (!user) return;
        const session = JSON.parse(localStorage.getItem('uc_session') || '{}');
        fetch('/api/orders', { headers: { Authorization: `Bearer ${session.token}` } })
            .then(r => r.json())
            .then(d => {
                const fetchedOrders = d || [];
                setOrders(fetchedOrders);
                // Expand the most recent order by default if available
                if (fetchedOrders.length > 0) {
                    setExpanded(fetchedOrders[0].id);
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [user, authLoading]);

    if (authLoading || loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-neutral-50/50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Loading your purchase history...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(o => o.status === filterStatus);

    return (
        <div className="min-h-screen bg-neutral-50/50 py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* ─── Header & Member Status ─── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">
                                <Sparkles size={13} className="text-yellow-500" /> Purchase History
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
                            My Orders
                        </h1>
                        <p className="text-sm text-neutral-500 mt-1">
                            Track live shipment statuses, receipts, and order items.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/account"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 px-4 py-2 rounded-full shadow-sm transition"
                        >
                            <ArrowLeft size={13} /> Account
                        </Link>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-neutral-900 px-5 py-2 rounded-full shadow-sm hover:bg-neutral-800 transition"
                        >
                            Explore Drops <ArrowRight size={13} />
                        </Link>
                    </div>
                </div>

                {/* ─── Orders List or Empty State ─── */}
                {orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-12 text-center border border-neutral-200/80 shadow-sm max-w-md mx-auto my-8"
                    >
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
                            <ShoppingBag size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 mb-1">No orders yet</h3>
                        <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
                            You haven't placed any orders yet. Discover our curated styles and express your unique character.
                        </p>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-full hover:bg-neutral-800 transition shadow-sm"
                        >
                            Start Shopping <ArrowRight size={14} />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-5">
                        {filteredOrders.map(order => {
                            const cfg = statusConfig[order.status] || statusConfig.pending;
                            const currentStepIdx = statusSteps.findIndex(s => s.key === order.status);
                            const isExpanded = expanded === order.id;

                            return (
                                <motion.div
                                    key={order.id}
                                    layout
                                    className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:border-neutral-300"
                                >
                                    {/* Order Card Header Summary */}
                                    <button
                                        type="button"
                                        onClick={() => setExpanded(isExpanded ? null : order.id)}
                                        className="w-full p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left hover:bg-neutral-50/60 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm`}>
                                                <cfg.icon size={22} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold uppercase text-neutral-400">
                                                        #{order.id.toString().padStart(5, '0')}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                        {cfg.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {new Date(order.created_at).toLocaleDateString('en-GB', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {order.order_items?.length || 0} {(order.order_items?.length || 0) === 1 ? 'item' : 'items'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                                            <div className="text-left sm:text-right">
                                                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">Total Amount</span>
                                                <span className="text-base font-black text-neutral-900">
                                                    {formatLKR(order.total)}
                                                </span>
                                            </div>
                                            <div className={`w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-neutral-900 text-white' : ''}`}>
                                                <ChevronDown size={16} />
                                            </div>
                                        </div>
                                    </button>

                                    {/* Expanded Details Body */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="border-t border-neutral-100 px-6 sm:px-8 py-7 bg-neutral-50/40 space-y-7"
                                            >
                                                {/* Visual Order Progress Tracker */}
                                                {order.status !== 'cancelled' && (
                                                    <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm">
                                                        <div className="flex items-center justify-between mb-5">
                                                            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                                                                Live Shipment Journey
                                                            </h4>
                                                            <span className="text-xs font-semibold text-neutral-700">
                                                                Courier Dispatch
                                                            </span>
                                                        </div>

                                                        <div className="relative flex items-center justify-between px-2 sm:px-6">
                                                            {statusSteps.map((step, idx) => {
                                                                const isCompleted = idx <= currentStepIdx;
                                                                const isCurrent = idx === currentStepIdx;
                                                                const StepIcon = step.icon;

                                                                return (
                                                                    <div key={step.key} className="flex-1 flex flex-col items-center relative z-10">
                                                                        <div
                                                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                                                isCurrent
                                                                                    ? 'bg-neutral-900 text-white ring-4 ring-neutral-200 shadow-md'
                                                                                    : isCompleted
                                                                                    ? 'bg-emerald-500 text-white'
                                                                                    : 'bg-neutral-100 text-neutral-300'
                                                                            }`}
                                                                        >
                                                                            <StepIcon size={17} />
                                                                        </div>
                                                                        <span
                                                                            className={`text-[11px] mt-2 text-center font-bold ${
                                                                                isCurrent
                                                                                    ? 'text-neutral-900 font-extrabold'
                                                                                    : isCompleted
                                                                                    ? 'text-neutral-700 font-medium'
                                                                                    : 'text-neutral-300'
                                                                            }`}
                                                                        >
                                                                            {step.label}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}

                                                            {/* Background connecting line */}
                                                            <div className="absolute left-10 right-10 top-5 h-0.5 bg-neutral-100 -z-0">
                                                                <div
                                                                    className="h-full bg-emerald-500 transition-all duration-500"
                                                                    style={{
                                                                        width: currentStepIdx >= 0
                                                                            ? `${(currentStepIdx / (statusSteps.length - 1)) * 100}%`
                                                                            : '0%'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Items Purchased List */}
                                                <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
                                                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                                                        Purchased Pieces
                                                    </h4>
                                                    <div className="divide-y divide-neutral-100">
                                                        {(order.order_items || []).map((it, i) => (
                                                            <div key={i} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                                                                <div className="flex items-center gap-3.5">
                                                                    <div className="w-10 h-12 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-400 shrink-0 font-bold text-xs">
                                                                        UC
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-neutral-900 leading-snug">
                                                                            {it.product_name}
                                                                        </p>
                                                                        <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-400">
                                                                            {it.size && <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600 font-semibold text-[10px]">Size {it.size}</span>}
                                                                            {it.color && <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600 font-semibold text-[10px]">{it.color}</span>}
                                                                            <span>Qty: {it.quantity}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <span className="text-sm font-bold text-neutral-900 shrink-0">
                                                                    {formatLKR(it.price * it.quantity)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* 2-Column Delivery & Payment Info */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
                                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                                                            <MapPin size={13} /> Destination Address
                                                        </div>
                                                        <p className="text-xs text-neutral-800 font-bold pt-1">{order.customer_name}</p>
                                                        <p className="text-xs text-neutral-600 leading-relaxed">
                                                            {order.address}<br />
                                                            {order.city}
                                                        </p>
                                                        <p className="text-xs text-neutral-400 pt-1">Phone: {order.customer_phone}</p>
                                                    </div>

                                                    <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-2">
                                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                                                            {order.payment_method === 'cod' ? <Banknote size={13} /> : <CreditCard size={13} />}
                                                            Payment Mode
                                                        </div>
                                                        <p className="text-xs font-bold text-neutral-800 pt-1">
                                                            {order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 'Credit / Debit Card Online'}
                                                        </p>
                                                        <div className="pt-2 border-t border-neutral-100 flex justify-between items-center text-xs">
                                                            <span className="text-neutral-400 font-medium">Total Paid / Due:</span>
                                                            <span className="font-black text-neutral-900 text-sm">{formatLKR(order.total)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
