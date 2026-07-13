import { useEffect, useState } from 'react';
import { Users, Plus, Trash2, Shield, User as UserIcon, X, Mail, Calendar, ShoppingBag, Crown } from 'lucide-react';
import { formatLKR } from '../../lib/utils';

type AppUser = {
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at: string | null;
    role: string;
    is_super: boolean;
    order_count: number;
};

export default function AdminUsers() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'admin' | 'customer'>('all');
    const [modal, setModal] = useState<'create' | null>(null);
    const [createForm, setCreateForm] = useState({ email: '', password: '', role: 'customer' });
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    const token = () => JSON.parse(localStorage.getItem('uc_session') || '{}').token;

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/users', { headers: { Authorization: `Bearer ${token()}` } });
            const data = await res.json();
            if (res.ok) setUsers(data || []);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchUsers(); }, []);

    const toggleRole = async (u: AppUser) => {
        if (u.is_super) return;
        const newRole = u.role === 'admin' ? 'customer' : 'admin';
        await fetch('/api/users', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
            body: JSON.stringify({ id: u.id, role: newRole }),
        });
        fetchUsers();
    };

    const deleteUser = async (u: AppUser) => {
        if (u.is_super) return;
        if (!confirm(`Delete user ${u.email}? This cannot be undone.`)) return;
        await fetch('/api/users', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
            body: JSON.stringify({ id: u.id }),
        });
        fetchUsers();
    };

    const createUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setCreating(true);
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
            body: JSON.stringify(createForm),
        });
        const data = await res.json();
        setCreating(false);
        if (!res.ok) { setError(data.error || 'Failed to create user'); return; }
        setModal(null);
        setCreateForm({ email: '', password: '', role: 'customer' });
        fetchUsers();
    };

    const filtered = users.filter(u => {
        if (filter === 'admin' && u.role !== 'admin') return false;
        if (filter === 'customer' && u.role !== 'customer') return false;
        if (search && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const adminCount = users.filter(u => u.role === 'admin').length;
    const customerCount = users.filter(u => u.role === 'customer').length;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-black">User Management</h1>
                    <p className="text-neutral-500 text-sm mt-1">Manage user accounts, roles & permissions</p>
                </div>
                <button onClick={() => setModal('create')} className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-neutral-800">
                    <Plus size={16} /> Add User
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-neutral-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Users size={20} /></div>
                        <div><p className="text-2xl font-black">{users.length}</p><p className="text-xs text-neutral-400">Total Users</p></div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center"><Shield size={20} /></div>
                        <div><p className="text-2xl font-black">{adminCount}</p><p className="text-xs text-neutral-400">Admins</p></div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><UserIcon size={20} /></div>
                        <div><p className="text-2xl font-black">{customerCount}</p><p className="text-xs text-neutral-400">Customers</p></div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email..." className="flex-1 border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" />
                <div className="flex gap-2">
                    {(['all', 'admin', 'customer'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2.5 rounded-lg text-sm font-medium transition capitalize ${filter === f ? 'bg-black text-white' : 'bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-50'}`}>{f}s</button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />)}</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-neutral-400"><Users size={48} className="mx-auto mb-3" /><p>No users found.</p></div>
            ) : (
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase">
                            <tr>
                                <th className="text-left p-4">User</th>
                                <th className="text-left p-4 hidden sm:table-cell">Role</th>
                                <th className="text-left p-4 hidden md:table-cell">Orders</th>
                                <th className="text-left p-4 hidden lg:table-cell">Joined</th>
                                <th className="text-left p-4 hidden lg:table-cell">Last Sign In</th>
                                <th className="text-right p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => (
                                <tr key={u.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-neutral-100 text-neutral-600'}`}>
                                                {u.email[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium flex items-center gap-1.5">
                                                    {u.email}
                                                    {u.is_super && <Crown size={13} className="text-yellow-500" />}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 hidden sm:table-cell">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-neutral-100 text-neutral-600'}`}>
                                            {u.role === 'admin' ? 'Admin' : 'Customer'}
                                        </span>
                                    </td>
                                    <td className="p-4 hidden md:table-cell text-neutral-500">{u.order_count}</td>
                                    <td className="p-4 hidden lg:table-cell text-neutral-400 text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                                    <td className="p-4 hidden lg:table-cell text-neutral-400 text-xs">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}</td>
                                    <td className="p-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => toggleRole(u)}
                                                disabled={u.is_super}
                                                className={`flex items-center gap-1 text-xs px-3 py-1.5 border rounded-lg transition ${u.is_super ? 'border-neutral-200 text-neutral-300 cursor-not-allowed' : 'border-neutral-300 hover:bg-neutral-50'}`}
                                                title={u.is_super ? 'Super-admin role is fixed' : u.role === 'admin' ? 'Demote to customer' : 'Promote to admin'}
                                            >
                                                <Shield size={12} /> {u.role === 'admin' ? 'Demote' : 'Promote'}
                                            </button>
                                            <button
                                                onClick={() => deleteUser(u)}
                                                disabled={u.is_super}
                                                className={`p-1.5 border rounded-lg transition ${u.is_super ? 'border-neutral-200 text-neutral-300 cursor-not-allowed' : 'border-neutral-300 text-red-500 hover:bg-red-50'}`}
                                                title={u.is_super ? 'Cannot delete super-admin' : 'Delete user'}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create user modal */}
            {modal === 'create' && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setModal(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Create New User</h2>
                            <button onClick={() => setModal(null)}><X size={20} /></button>
                        </div>
                        <form onSubmit={createUser} className="space-y-4">
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} type="email" placeholder="Email address" required className="w-full border border-neutral-300 rounded-lg pl-11 pr-4 py-2.5 text-sm outline-none focus:border-black" />
                            </div>
                            <input value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} type="password" placeholder="Password (min 6 characters)" required minLength={6} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" />
                            <select value={createForm.role} onChange={e => setCreateForm({ ...createForm, role: e.target.value })} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black bg-white">
                                <option value="customer">Customer</option>
                                <option value="admin">Admin</option>
                            </select>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <button type="submit" disabled={creating} className="w-full bg-black text-white py-3 rounded-lg text-sm font-semibold disabled:opacity-50">
                                {creating ? 'Creating...' : 'Create User'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
