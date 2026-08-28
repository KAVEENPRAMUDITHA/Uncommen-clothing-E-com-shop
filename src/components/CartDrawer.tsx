import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight, Truck, Sparkles, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { formatLKR } from '../lib/utils';

const FREE_SHIPPING_THRESHOLD = 5000;

export default function CartDrawer() {
    const { items, isOpen, close, remove, updateQty, total, count } = useCart();

    const progressToFreeShipping = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);
    const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - total);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={close}
                    />

                    {/* Drawer */}
                    <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                            className="w-screen max-w-md bg-white flex flex-col shadow-2xl relative"
                        >
                            {/* ─── Header ─── */}
                            <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center">
                                        <ShoppingBag size={18} />
                                    </div>
                                    <div>
                                        <h2 className="font-black text-lg text-neutral-900 tracking-tight">Shopping Bag</h2>
                                        <p className="text-xs text-neutral-500 font-medium">
                                            {count} {count === 1 ? 'item' : 'items'} selected
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={close}
                                    className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white flex items-center justify-center transition-colors duration-200"
                                    title="Close bag"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* ─── Free Shipping Progress Bar ─── */}
                            {items.length > 0 && (
                                <div className="bg-neutral-50 border-b border-neutral-100 px-6 py-3.5">
                                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                                        <span className="flex items-center gap-1.5 text-neutral-800">
                                            <Truck size={14} className="text-neutral-900" />
                                            {amountNeeded === 0 ? (
                                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                                    <Sparkles size={12} /> You unlocked Free Islandwide Shipping!
                                                </span>
                                            ) : (
                                                <span>
                                                    Add <strong className="text-neutral-900">{formatLKR(amountNeeded)}</strong> for Free Shipping
                                                </span>
                                            )}
                                        </span>
                                        <span className="text-neutral-400 font-medium">{Math.round(progressToFreeShipping)}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressToFreeShipping}%` }}
                                            transition={{ duration: 0.5, ease: 'easeOut' }}
                                            className={`h-full rounded-full transition-all ${
                                                amountNeeded === 0 ? 'bg-emerald-500' : 'bg-neutral-900'
                                            }`}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* ─── Cart Items Body ─── */}
                            <div className="flex-1 overflow-y-auto p-6 divide-y divide-neutral-100">
                                {items.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                                        <div className="w-20 h-20 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-5 text-neutral-300">
                                            <ShoppingBag size={36} />
                                        </div>
                                        <h3 className="font-bold text-lg text-neutral-900 mb-1">Your bag is empty</h3>
                                        <p className="text-xs text-neutral-400 max-w-xs mb-8 leading-relaxed">
                                            Looks like you haven't added any uncommon pieces to your bag yet.
                                        </p>
                                        <button
                                            onClick={close}
                                            className="inline-flex items-center gap-2 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-full hover:bg-neutral-800 transition-all duration-200 shadow-sm"
                                        >
                                            Start Shopping <ArrowRight size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    items.map((it, i) => (
                                        <motion.div
                                            key={`${it.product_id}-${it.size}-${it.color}-${i}`}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="py-4 flex gap-4 first:pt-0 last:pb-0 group"
                                        >
                                            {/* Item Image */}
                                            <div className="w-20 h-24 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200/60">
                                                <img
                                                    src={it.image_url}
                                                    alt={it.product_name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>

                                            {/* Item Details */}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className="text-sm font-bold text-neutral-900 leading-snug line-clamp-1">
                                                            {it.product_name}
                                                        </h3>
                                                        <button
                                                            onClick={() => remove(i)}
                                                            className="text-neutral-400 hover:text-red-600 p-1 -mr-1 transition-colors"
                                                            title="Remove item"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>

                                                    {/* Variant Pills */}
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {it.size && (
                                                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-md">
                                                                Size: {it.size}
                                                            </span>
                                                        )}
                                                        {it.color && (
                                                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-md">
                                                                {it.color}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Stepper & Price */}
                                                <div className="flex items-center justify-between mt-3 pt-2">
                                                    <div className="flex items-center border border-neutral-200 rounded-full bg-neutral-50 px-1 py-0.5">
                                                        <button
                                                            onClick={() => updateQty(i, it.quantity - 1)}
                                                            className="w-6 h-6 rounded-full hover:bg-white flex items-center justify-center text-neutral-600 transition"
                                                            title="Decrease quantity"
                                                        >
                                                            <Minus size={11} />
                                                        </button>
                                                        <span className="w-8 text-center text-xs font-bold text-neutral-900">
                                                            {it.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQty(i, it.quantity + 1)}
                                                            className="w-6 h-6 rounded-full hover:bg-white flex items-center justify-center text-neutral-600 transition"
                                                            title="Increase quantity"
                                                        >
                                                            <Plus size={11} />
                                                        </button>
                                                    </div>

                                                    <span className="text-sm font-bold text-neutral-900">
                                                        {formatLKR(it.price * it.quantity)}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {/* ─── Footer with Checkout CTA ─── */}
                            {items.length > 0 && (
                                <div className="border-t border-neutral-100 p-6 bg-neutral-50/50 space-y-4">
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs text-neutral-500 font-medium">
                                            <span>Subtotal ({count} items)</span>
                                            <span>{formatLKR(total)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-neutral-500 font-medium">
                                            <span>Shipping</span>
                                            <span className={amountNeeded === 0 ? 'text-emerald-600 font-bold' : ''}>
                                                {amountNeeded === 0 ? 'FREE' : 'Calculated at checkout'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-base font-black text-neutral-900 pt-2 border-t border-neutral-200/70">
                                            <span>Estimated Total</span>
                                            <span>{formatLKR(total)}</span>
                                        </div>
                                    </div>

                                    <Link
                                        to="/checkout"
                                        onClick={close}
                                        className="group w-full py-4 bg-neutral-900 text-white rounded-full font-bold text-sm hover:bg-neutral-800 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                                    >
                                        Proceed to Checkout
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>

                                    {/* Trust micro-banner */}
                                    <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-400 pt-1 font-medium">
                                        <span className="flex items-center gap-1">
                                            <ShieldCheck size={13} className="text-neutral-500" /> Secure Checkout
                                        </span>
                                        <span>•</span>
                                        <span>7-Day Exchange</span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
