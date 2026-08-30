import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Check,
    CreditCard,
    Banknote,
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    Truck,
    Lock,
    Mail,
    Phone,
    User,
    MapPin,
    Sparkles,
    ShoppingBag
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatLKR, STORE } from '../lib/utils';

export default function Checkout() {
    const { items, total, clear } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '' });
    const [payment, setPayment] = useState('cod');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Auto-fill email if user is logged in
    useEffect(() => {
        if (user?.email) setForm(f => ({ ...f, email: user.email }));
    }, [user]);

    const shipping = total > 5000 ? 0 : 350;
    const grandTotal = total + shipping;

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
            setError('Please fill in all required delivery details.');
            return;
        }
        setLoading(true);
        try {
            const session = JSON.parse(localStorage.getItem('uc_session') || '{}');
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (session.token) headers['Authorization'] = `Bearer ${session.token}`;
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    customer_name: form.name,
                    customer_email: form.email,
                    customer_phone: form.phone,
                    address: form.address,
                    city: form.city,
                    total: grandTotal,
                    payment_method: payment,
                    items: items.map(i => ({
                        product_id: i.product_id,
                        product_name: i.product_name,
                        quantity: i.quantity,
                        price: i.price,
                        size: i.size,
                        color: i.color,
                    })),
                }),
            });
            if (!res.ok) throw new Error('Order failed');
            setSuccess(true);
            clear();
        } catch {
            setError('Something went wrong with your order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ─── Success View ───
    if (success) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-6 py-16 bg-neutral-50/50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-neutral-100 text-center relative overflow-hidden"
                >
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Check size={40} className="stroke-[2.5]" />
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-emerald-600 mb-2">
                        <Sparkles size={13} /> Order Successful
                    </span>

                    <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 mb-3">
                        Thank You for Choosing Uncommon!
                    </h1>

                    <p className="text-neutral-600 text-sm leading-relaxed mb-8 max-w-md mx-auto">
                        Your order has been recorded. We'll send a confirmation email to <strong className="text-neutral-900">{form.email}</strong> with your dispatch updates.
                    </p>

                    <div className="bg-neutral-50 rounded-2xl p-5 mb-8 text-left border border-neutral-100 text-xs text-neutral-600 space-y-2">
                        <div className="flex justify-between">
                            <span className="font-semibold text-neutral-800">Delivery To:</span>
                            <span>{form.name} · {form.city}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-neutral-800">Payment:</span>
                            <span className="uppercase">{payment === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-neutral-800">Store Boutique:</span>
                            <span>{STORE.address}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                        <button
                            onClick={() => navigate('/shop')}
                            className="bg-neutral-900 text-white px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-all shadow-md"
                        >
                            Continue Shopping
                        </button>
                        {user && (
                            <button
                                onClick={() => navigate('/orders')}
                                className="border border-neutral-300 text-neutral-800 px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-neutral-50 transition-all"
                            >
                                View My Orders
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    // ─── Empty Cart View ───
    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-6 py-16 text-center">
                <div className="max-w-md">
                    <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-5 text-neutral-400">
                        <ShoppingBag size={36} />
                    </div>
                    <h2 className="text-2xl font-black text-neutral-900 mb-2">Your Bag is Empty</h2>
                    <p className="text-sm text-neutral-500 mb-6">
                        You need at least one piece in your bag to proceed through checkout.
                    </p>
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 bg-neutral-900 text-white px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition shadow-sm"
                    >
                        Explore Collections <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50/50 py-10 px-6">
            <div className="max-w-7xl mx-auto">
                {/* ─── Breadcrumb & Security Header ─── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition w-fit"
                    >
                        <ArrowLeft size={15} /> Return to Shop
                    </button>
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 bg-white px-3.5 py-1.5 rounded-full border border-neutral-200 shadow-sm w-fit">
                        <Lock size={13} className="text-emerald-600" />
                        <span>256-Bit Encrypted Secure Checkout</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* ─── Left Column: Delivery & Payment Details ─── */}
                    <div className="lg:col-span-7 space-y-8">
                        <form onSubmit={submit} id="checkout-form" className="space-y-8">
                            {/* 1. Contact Info Card */}
                            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">
                                            1
                                        </div>
                                        <h2 className="text-lg font-bold text-neutral-900">Contact Information</h2>
                                    </div>
                                    {user && (
                                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                            Linked to account
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2 relative">
                                        <User size={16} className="absolute left-4 top-3.5 text-neutral-400" />
                                        <input
                                            required
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            placeholder="Full recipient name"
                                            className="w-full pl-11 pr-4 py-3 bg-neutral-50/60 border border-neutral-200 rounded-xl text-sm outline-none focus:border-neutral-900 focus:bg-white transition"
                                        />
                                    </div>

                                    <div className="relative">
                                        <Mail size={16} className="absolute left-4 top-3.5 text-neutral-400" />
                                        <input
                                            required
                                            type="email"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            placeholder="Email for confirmation"
                                            className="w-full pl-11 pr-4 py-3 bg-neutral-50/60 border border-neutral-200 rounded-xl text-sm outline-none focus:border-neutral-900 focus:bg-white transition"
                                        />
                                    </div>

                                    <div className="relative">
                                        <Phone size={16} className="absolute left-4 top-3.5 text-neutral-400" />
                                        <input
                                            required
                                            value={form.phone}
                                            onChange={e => setForm({ ...form, phone: e.target.value })}
                                            placeholder="Mobile phone number"
                                            className="w-full pl-11 pr-4 py-3 bg-neutral-50/60 border border-neutral-200 rounded-xl text-sm outline-none focus:border-neutral-900 focus:bg-white transition"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 2. Shipping Address Card */}
                            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">
                                        2
                                    </div>
                                    <h2 className="text-lg font-bold text-neutral-900">Delivery Address</h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2 relative">
                                        <MapPin size={16} className="absolute left-4 top-3.5 text-neutral-400" />
                                        <input
                                            required
                                            value={form.address}
                                            onChange={e => setForm({ ...form, address: e.target.value })}
                                            placeholder="Street address / House No / Apartment"
                                            className="w-full pl-11 pr-4 py-3 bg-neutral-50/60 border border-neutral-200 rounded-xl text-sm outline-none focus:border-neutral-900 focus:bg-white transition"
                                        />
                                    </div>

                                    <div className="sm:col-span-2 relative">
                                        <input
                                            required
                                            value={form.city}
                                            onChange={e => setForm({ ...form, city: e.target.value })}
                                            placeholder="City / Town (e.g. Colombo, Kiribathgoda, Kandy)"
                                            className="w-full px-4 py-3 bg-neutral-50/60 border border-neutral-200 rounded-xl text-sm outline-none focus:border-neutral-900 focus:bg-white transition"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500 bg-neutral-50 p-3 rounded-xl">
                                    <Truck size={15} className="text-neutral-700 shrink-0" />
                                    <span>Islandwide delivery dispatched within 24–48 hours via registered courier.</span>
                                </div>
                            </div>

                            {/* 3. Payment Method Card */}
                            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">
                                        3
                                    </div>
                                    <h2 className="text-lg font-bold text-neutral-900">Payment Option</h2>
                                </div>

                                <div className="space-y-3">
                                    <label
                                        className={`flex items-start gap-4 border-2 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-200 ${
                                            payment === 'cod'
                                                ? 'border-neutral-900 bg-neutral-50/80 shadow-sm'
                                                : 'border-neutral-200 hover:border-neutral-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={payment === 'cod'}
                                            onChange={() => setPayment('cod')}
                                            className="accent-neutral-900 mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                                                    <Banknote size={18} /> Cash on Delivery (COD)
                                                </span>
                                                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                    Popular
                                                </span>
                                            </div>
                                            <p className="text-xs text-neutral-500 mt-1">
                                                Pay cash to the courier when your package arrives at your doorstep.
                                            </p>
                                        </div>
                                    </label>

                                    <label
                                        className={`flex items-start gap-4 border-2 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-200 ${
                                            payment === 'card'
                                                ? 'border-neutral-900 bg-neutral-50/80 shadow-sm'
                                                : 'border-neutral-200 hover:border-neutral-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={payment === 'card'}
                                            onChange={() => setPayment('card')}
                                            className="accent-neutral-900 mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                                                    <CreditCard size={18} /> Credit / Debit Card
                                                </span>
                                                <div className="flex gap-1 text-[10px] font-bold text-neutral-500 uppercase">
                                                    <span>Visa</span> · <span>Mastercard</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-neutral-500 mt-1">
                                                Secure online checkout processed directly upon order review.
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                {error && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* ─── Right Column: Order Summary ─── */}
                    <div className="lg:col-span-5 sticky top-24">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-lg space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                                <h3 className="font-black text-lg text-neutral-900">Order Summary</h3>
                                <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
                                    {items.length} {items.length === 1 ? 'item' : 'items'}
                                </span>
                            </div>

                            {/* Item previews */}
                            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                                {items.map((it, i) => (
                                    <div key={i} className="flex gap-3.5 items-center">
                                        <div className="w-14 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200/60">
                                            <img src={it.image_url} alt={it.product_name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-neutral-900 leading-snug truncate">
                                                {it.product_name}
                                            </p>
                                            <p className="text-xs text-neutral-400 mt-0.5">
                                                {it.size ? `Size ${it.size}` : ''} {it.color ? `· ${it.color}` : ''} · Qty: {it.quantity}
                                            </p>
                                        </div>
                                        <span className="font-bold text-sm text-neutral-900 shrink-0">
                                            {formatLKR(it.price * it.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Subtotals & Fees */}
                            <div className="space-y-2.5 pt-4 border-t border-neutral-100 text-sm">
                                <div className="flex justify-between text-neutral-500">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-neutral-800">{formatLKR(total)}</span>
                                </div>
                                <div className="flex justify-between text-neutral-500">
                                    <span className="flex items-center gap-1">
                                        Shipping
                                        {shipping === 0 && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">FREE</span>}
                                    </span>
                                    <span className="font-semibold text-neutral-800">
                                        {shipping === 0 ? 'Free' : formatLKR(shipping)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-lg font-black text-neutral-900 pt-3 border-t border-neutral-200">
                                    <span>Total</span>
                                    <span>{formatLKR(grandTotal)}</span>
                                </div>
                            </div>

                            {/* Complete Order Button */}
                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={loading}
                                className="w-full py-4 bg-neutral-900 text-white rounded-full font-bold text-sm uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-50 transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <span>Placing Your Order...</span>
                                ) : (
                                    <>
                                        <span>Confirm & Place Order</span>
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            {/* Guarantee strip */}
                            <div className="pt-2 flex items-center justify-center gap-3 text-[11px] text-neutral-400 font-medium text-center">
                                <ShieldCheck size={14} className="text-neutral-500 shrink-0" />
                                <span>100% Satisfaction Guarantee · 7-Day Exchange</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
