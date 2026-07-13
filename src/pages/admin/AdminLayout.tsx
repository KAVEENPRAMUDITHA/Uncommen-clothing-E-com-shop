import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderTree, Package, Tag, ShoppingCart, Mail, CreditCard, Users, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const nav = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/discounts', label: 'Discounts', icon: Tag },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/email', label: 'Email Config', icon: Mail },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard },
];

export default function AdminLayout() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleSignOut = async () => { await signOut(); navigate('/admin/login'); };

    return (
        <div className="min-h-screen bg-neutral-50 flex">
            <aside className={`fixed lg:sticky top-0 z-40 h-screen w-64 bg-neutral-950 text-neutral-300 flex flex-col transition-transform ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-6 border-b border-neutral-800">
                    <NavLink to="/admin" className="text-white font-black text-lg">UNCOMMON</NavLink>
                    <p className="text-neutral-500 text-xs tracking-[0.2em]">ADMIN PANEL</p>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {nav.map(n => (
                        <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${isActive ? 'bg-white text-black' : 'text-neutral-300 hover:bg-neutral-800'}`}>
                            <n.icon size={18} /> {n.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-4 border-t border-neutral-800">
                    <p className="text-xs text-neutral-500 mb-2 truncate">{user?.email}</p>
                    <button onClick={handleSignOut} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white w-full px-4 py-2 rounded-lg hover:bg-neutral-800"><LogOut size={16} /> Sign Out</button>
                </div>
            </aside>
            {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />}
            <div className="flex-1 min-w-0">
                <header className="lg:hidden bg-white border-b border-neutral-200 px-4 h-14 flex items-center justify-between sticky top-0 z-20">
                    <button onClick={() => setOpen(true)}><Menu size={22} /></button>
                    <span className="font-bold">Admin Panel</span>
                    <button onClick={handleSignOut}><LogOut size={18} /></button>
                </header>
                <main className="p-6 lg:p-8"><Outlet /></main>
            </div>
        </div>
    );
}
