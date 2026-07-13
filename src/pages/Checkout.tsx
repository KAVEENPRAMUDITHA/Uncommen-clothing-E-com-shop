import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CreditCard, Banknote, ArrowLeft } from 'lucide-react';
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
        if (!form.name || !form.email || !form.phone || !form.address || !form.city) { setError('Please fill all fields.'); return; }
        setLoading(true);
        try {
            const session = JSON.parse(localStorage.getItem('uc_session') || '{}');
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (session.token) headers['Authorization'] = `Bearer ${session.token}`;
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    customer_name: form.name, customer_email: form.email, customer_phone: form.phone,
                    address: form.address, city: form.city, total: grandTotal, payment_method: payment,
                    items: items.map(i => ({ product_id: i.product_id, product_name: i.product_name, quantity: i.quantity, price: i.price, size: i.size, color: i.color })),
                }),
            });
            if (!res.ok) throw new Error('Order failed');
            setSuccess(true); clear();
        } catch { setError('Something went wrong. Please try again.'); }
        finally { setLoading(false); }
    };

    if (success) return (
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={40} className="text-green-600" /></div>
            <h1 className="text-3xl font-black mb-3">Order Confirmed!</h1>
            <p className="text-neutral-500 mb-8">Thank you for your purchase. We'll send a confirmation email shortly. You can collect your order at {STORE.address} or arrange delivery.</p>
            <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => navigate('/shop')} className="bg-black text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-neutral-800">Continue Shopping</button>
                {user && <button onClick={() => navigate('/orders')} className="border border-neutral-300 px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-neutral-50">Track My Order</button>}
            </div>
        </div>
    );

    if (items.length === 0) return (
        <div className="max-w-2xl mx-auto px-6 py-20 text-center text-neutral-400">
            <p className="text-lg mb-4">Your cart is empty.</p>
            <button onClick={() => navigate('/shop')} className="text-black underline font-medium">Go to Shop</button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-black mb-6"><ArrowLeft size={16} /> Back</button>
            <h1 className="text-4xl font-black mb-8">Checkout</h1>
            <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h2 className="text-lg font-bold mb-4">Contact Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="border border-neutral-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-black sm:col-span-2" />
                            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" className="border border-neutral-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-black" />
                            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="border border-neutral-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-black" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold mb-4">Shipping Address</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Street address" className="border border-neutral-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-black sm:col-span-2" />
                            <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="City" className="border border-neutral-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-black" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold mb-4">Payment Method</h2>
                        <div className="space-y-3">
                            <label className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer transition ${payment === 'cod' ? 'border-black bg-neutral-50' : 'border-neutral-300'}`}>
                                <input type="radio" checked={payment === 'cod'} onChange={() => setPayment('cod')} className="accent-black" />
                                <Banknote size={20} /><span className="text-sm font-medium">Cash on Delivery</span>
                            </label>
                            <label className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer transition ${payment === 'card' ? 'border-black bg-neutral-50' : 'border-neutral-300'}`}>
                                <input type="radio" checked={payment === 'card'} onChange={() => setPayment('card')} className="accent-black" />
                                <CreditCard size={20} /><span className="text-sm font-medium">Credit / Debit Card</span>
                            </label>
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
                <div>
                    <div className="bg-neutral-50 rounded-xl p-6 sticky top-24">
                        <h2 className="font-bold mb-4">Order Summary</h2>
                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                            {items.map((it, i) => (
                                <div key={i} className="flex gap-3 text-sm">
                                    <img src={it.image_url} alt="" className="w-12 h-14 object-cover rounded" />
                                    <div className="flex-1"><p className="font-medium leading-tight">{it.product_name}</p><p className="text-xs text-neutral-400">{it.size} · {it.color} · ×{it.quantity}</p></div>
                                    <span className="font-medium">{formatLKR(it.price * it.quantity)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2 border-t border-neutral-200 pt-4 text-sm">
                            <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span>{formatLKR(total)}</span></div>
                            <div className="flex justify-between"><span className="text-neutral-500">Shipping</span><span>{shipping === 0 ? 'Free' : formatLKR(shipping)}</span></div>
                            <div className="flex justify-between font-bold text-base pt-2 border-t border-neutral-200"><span>Total</span><span>{formatLKR(grandTotal)}</span></div>
                        </div>
                        {user ? (
                            <p className="text-xs text-green-600 mt-3 text-center">✓ Order will be linked to your account for tracking</p>
                        ) : (
                            <p className="text-xs text-neutral-400 mt-3 text-center">Sign in to track your order after purchase</p>
                        )}
                        <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-full font-semibold text-sm hover:bg-neutral-800 transition mt-3 disabled:opacity-50">{loading ? 'Placing Order...' : 'Place Order'}</button>
                    </div>
                </div>
            </form>
        </div>
    );
}
