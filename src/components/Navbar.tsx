import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, User, Package } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { STORE } from '../lib/utils';

const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Shop', to: '/shop' },
    { label: 'Men', to: '/shop?category=1' },
    { label: 'Women', to: '/shop?category=2' },
    { label: 'Accessories', to: '/shop?category=3' },
    { label: 'About', to: '/about' },
];

export default function Navbar() {
    const { count, open } = useCart();
    const { user, isAdmin } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (to: string) => {
        const [path, query] = to.split('?');
        // Exact match for Home
        if (to === '/') return location.pathname === '/';
        // For links with query params (Men, Women, Accessories), match both path and query
        if (query) {
            return location.pathname === path && location.search === `?${query}`;
        }
        // For Shop, only match when there's no category query param
        if (to === '/shop') {
            return location.pathname === '/shop' && !location.search.includes('category=');
        }
        // For other pages (About), match by pathname
        return location.pathname === path;
    };

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
        setMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-neutral-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                <button className="lg:hidden" onClick={() => setMenuOpen(v => !v)}>
                    {menuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-xl font-black tracking-tight text-neutral-900">UNCOMMON</span>
                    <span className="text-xl font-light tracking-[0.3em] text-neutral-500 hidden sm:inline">CLOTHING</span>
                </Link>
                <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-neutral-700">
                    {navLinks.map(({ label, to }) => (
                        <Link
                            key={label}
                            to={to}
                            className={`relative pb-1 transition ${
                                isActive(to)
                                    ? 'text-black font-bold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-black after:rounded-full'
                                    : 'hover:text-black'
                            }`}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
                <form onSubmit={submitSearch} className="hidden md:flex items-center border border-neutral-300 rounded-full px-3 py-1.5 focus-within:border-neutral-900 transition">
                    <Search size={16} className="text-neutral-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="bg-transparent outline-none text-sm ml-2 w-28 lg:w-40" />
                </form>
                <div className="flex items-center gap-1">
                    {user && !isAdmin && (
                        <Link to="/orders" className="hidden sm:flex p-2 hover:bg-neutral-100 rounded-full transition" title="My Orders">
                            <Package size={20} className="text-neutral-600" />
                        </Link>
                    )}
                    <Link to={user ? (isAdmin ? '/admin' : '/account') : '/account'} className="p-2 hover:bg-neutral-100 rounded-full transition" title={user ? 'My Account' : 'Sign In'}>
                        {user ? (
                            <div className="w-7 h-7 bg-neutral-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {user.email[0].toUpperCase()}
                            </div>
                        ) : (
                            <User size={22} />
                        )}
                    </Link>
                    <button onClick={open} className="relative p-2 hover:bg-neutral-100 rounded-full transition">
                        <ShoppingCart size={22} />
                        {count > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{count}</span>
                        )}
                    </button>
                </div>
            </div>
            {menuOpen && (
                <div className="lg:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-1">
                    <form onSubmit={submitSearch} className="flex items-center border border-neutral-300 rounded-full px-3 py-2 mb-2">
                        <Search size={16} className="text-neutral-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="bg-transparent outline-none text-sm ml-2 flex-1" />
                    </form>
                    {navLinks.map(({ label, to }) => (
                        <Link
                            key={label}
                            to={to}
                            className={`block text-sm py-2 px-3 rounded-lg transition ${
                                isActive(to)
                                    ? 'text-black font-bold bg-neutral-100'
                                    : 'text-neutral-700 font-medium hover:bg-neutral-50'
                            }`}
                            onClick={() => setMenuOpen(false)}
                        >
                            {label}
                        </Link>
                    ))}
                    <Link to={user ? '/orders' : '/account'} className="block text-sm font-medium text-neutral-700 py-2 px-3 rounded-lg hover:bg-neutral-50 transition" onClick={() => setMenuOpen(false)}>
                        {user ? 'My Orders' : 'Sign In / Sign Up'}
                    </Link>
                </div>
            )}
        </header>
    );
}

