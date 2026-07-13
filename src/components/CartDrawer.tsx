import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { formatLKR } from '../lib/utils';

export default function CartDrawer() {
    const { items, isOpen, close, remove, updateQty, total } = useCart();
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/40" onClick={close} />
            <div className="relative bg-white w-full max-w-md h-full flex flex-col shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-neutral-200">
                    <h2 className="font-bold text-lg flex items-center gap-2"><ShoppingBag size={20} /> Your Cart</h2>
                    <button onClick={close} className="p-1 hover:bg-neutral-100 rounded"><X size={22} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {items.length === 0 ? (
                        <div className="text-center py-16 text-neutral-400">
                            <ShoppingBag size={48} className="mx-auto mb-3" />
                            <p>Your cart is empty</p>
                            <button onClick={close} className="mt-4 text-sm font-medium underline">Continue shopping</button>
                        </div>
                    ) : items.map((it, i) => (
                        <div key={i} className="flex gap-3 border-b border-neutral-100 pb-4">
                            <img src={it.image_url} alt={it.product_name} className="w-20 h-24 object-cover rounded" />
                            <div className="flex-1">
                                <h3 className="text-sm font-medium leading-snug">{it.product_name}</h3>
                                <p className="text-xs text-neutral-500 mt-0.5">{it.size} · {it.color}</p>
                                <p className="text-sm font-semibold mt-1">{formatLKR(it.price)}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center border border-neutral-300 rounded">
                                        <button onClick={() => updateQty(i, it.quantity - 1)} className="px-2 py-1 hover:bg-neutral-100"><Minus size={12} /></button>
                                        <span className="px-3 text-sm">{it.quantity}</span>
                                        <button onClick={() => updateQty(i, it.quantity + 1)} className="px-2 py-1 hover:bg-neutral-100"><Plus size={12} /></button>
                                    </div>
                                    <button onClick={() => remove(i)} className="text-neutral-400 hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {items.length > 0 && (
                    <div className="border-t border-neutral-200 p-5 space-y-3">
                        <div className="flex justify-between text-sm"><span className="text-neutral-500">Subtotal</span><span className="font-semibold">{formatLKR(total)}</span></div>
                        <p className="text-xs text-neutral-400">Shipping & taxes calculated at checkout.</p>
                        <Link to="/checkout" onClick={close} className="block text-center bg-black text-white py-3.5 rounded-full font-semibold text-sm hover:bg-neutral-800 transition">Proceed to Checkout</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
