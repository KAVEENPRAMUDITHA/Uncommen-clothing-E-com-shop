import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

type Disc = { id: number; name: string; type: string; value: number; active: boolean; start_date: string; end_date: string };

export default function AdminDiscounts() {
    const [discounts, setDiscounts] = useState<Disc[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<Disc | null>(null);
    const [form, setForm] = useState({ name: '', type: 'percentage', value: 10, active: true, start_date: '', end_date: '' });

    const token = () => JSON.parse(localStorage.getItem('uc_session') || '{}').token;

    const fetchD = async () => {
        setLoading(true);
        const d = await fetch('/api/discounts').then(r => r.json());
        setDiscounts(d || []);
        setLoading(false);
    };
    useEffect(() => { fetchD(); }, []);

    const openNew = () => { setForm({ name: '', type: 'percentage', value: 10, active: true, start_date: '', end_date: '' }); setModal({} as Disc); };
    const openEdit = (d: Disc) => { setForm({ name: d.name, type: d.type, value: d.value, active: d.active, start_date: d.start_date || '', end_date: d.end_date || '' }); setModal(d); };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        const body = { ...form, value: Number(form.value) };
        if (modal && 'id' in modal && modal.id) {
            await fetch('/api/discounts', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ id: modal.id, ...body }) });
        } else {
            await fetch('/api/discounts', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify(body) });
        }
        setModal(null); fetchD();
    };

    const del = async (id: number) => {
        if (!confirm('Delete this discount?')) return;
        await fetch('/api/discounts', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ id }) });
        fetchD();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div><h1 className="text-3xl font-black">Discounts</h1><p className="text-neutral-500 text-sm mt-1">Create and assign discounts to products</p></div>
                <button onClick={openNew} className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-neutral-800"><Plus size={16} /> New Discount</button>
            </div>
            {loading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />)}</div> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {discounts.map(d => (
                        <div key={d.id} className="bg-white rounded-xl border border-neutral-200 p-5">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="font-bold">{d.name}</h3>
                                    <p className="text-2xl font-black mt-1">{d.type === 'percentage' ? `${d.value}%` : `Rs.${d.value}`}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${d.active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>{d.active ? 'Active' : 'Inactive'}</span>
                            </div>
                            <p className="text-xs text-neutral-400 mb-3">{d.type === 'percentage' ? 'Percentage off' : 'Fixed amount off'}</p>
                            <div className="flex gap-2">
                                <button onClick={() => openEdit(d)} className="flex items-center gap-1 text-xs px-3 py-1.5 border border-neutral-300 rounded-lg hover:bg-neutral-50"><Pencil size={12} /> Edit</button>
                                <button onClick={() => del(d.id)} className="flex items-center gap-1 text-xs px-3 py-1.5 border border-neutral-300 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={12} /> Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {modal && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setModal(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold">{'id' in modal && modal.id ? 'Edit' : 'New'} Discount</h2><button onClick={() => setModal(null)}><X size={20} /></button></div>
                        <form onSubmit={save} className="space-y-4">
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Discount name (e.g. Summer Sale)" required className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" />
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black bg-white">
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (Rs.)</option>
                            </select>
                            <input value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })} type="number" placeholder="Value" required className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" />
                            <div className="grid grid-cols-2 gap-3">
                                <input value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} type="date" className="border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" />
                                <input value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} type="date" className="border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" />
                            </div>
                            <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="accent-black" /> Active</label>
                            <p className="text-xs text-neutral-400">Assign this discount to products from the Products page.</p>
                            <button type="submit" className="w-full bg-black text-white py-3 rounded-lg text-sm font-semibold">Save Discount</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
