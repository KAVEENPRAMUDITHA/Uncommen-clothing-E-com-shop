import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type CartItem = {
    product_id: number;
    product_name: string;
    price: number;
    image_url: string;
    quantity: number;
    size: string;
    color: string;
};

type CartCtx = {
    items: CartItem[];
    isOpen: boolean;
    open: () => void;
    close: () => void;
    add: (item: CartItem) => void;
    remove: (idx: number) => void;
    updateQty: (idx: number, qty: number) => void;
    clear: () => void;
    total: number;
    count: number;
};

const Ctx = createContext<CartCtx>({
    items: [], isOpen: false, open: () => { }, close: () => { },
    add: () => { }, remove: () => { }, updateQty: () => { }, clear: () => { }, total: 0, count: 0,
});

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        try { return JSON.parse(localStorage.getItem('uc_cart') || '[]'); } catch { return []; }
    });
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => { localStorage.setItem('uc_cart', JSON.stringify(items)); }, [items]);

    const add = (item: CartItem) => {
        setItems(prev => {
            const idx = prev.findIndex(i => i.product_id === item.product_id && i.size === item.size && i.color === item.color);
            if (idx >= 0) {
                const copy = [...prev];
                copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + item.quantity };
                return copy;
            }
            return [...prev, item];
        });
        setIsOpen(true);
    };
    const remove = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));
    const updateQty = (idx: number, qty: number) => setItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: Math.max(1, qty) } : it));
    const clear = () => setItems([]);
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const count = items.reduce((s, i) => s + i.quantity, 0);

    return (
        <Ctx.Provider value={{ items, isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false), add, remove, updateQty, clear, total, count }}>
            {children}
        </Ctx.Provider>
    );
}

export const useCart = () => useContext(Ctx);
