import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { slugify } from '../../lib/utils';

type Cat = { id: number; name: string; slug: string; description: string; image_url: string };

export default function AdminCategories() {
    const { user } = useAuth();
    const [cats, setCats] = useState<Cat[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<Cat | null>(null);
    const [form, setForm] = useState({ name: '', slug: '', description: '', image_url: '' });
    const [uploading, setUploading] = useState(false);

    const token = () => JSON.parse(localStorage.getItem('uc_session') || '{}').token;

    const fetchCats = async () => {
        setLoading(true);
        const res = await fetch('/api/categories');
        const d = await res.json();
        setCats(d || []);
        setLoading(false);
    };

    useEffect(() => { fetchCats(); }, []);

    const openNew = () => { setForm({ name: '', slug: '', description: '', image_url: '' }); setModal({} as Cat); };
    const openEdit = (c: Cat) => { setForm(c); setModal(c); };

    const uploadImage = async (file: File) => {
        setUploading(true);
        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = (reader.result as string).split(',')[1];
            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                    body: JSON.stringify({ fileName: file.name, fileBase64: base64, contentType: file.type, folder: 'categories' }),
                });
                const { url } = await res.json();
                setForm(f => ({ ...f, image_url: url }));
            } catch {
                alert('Upload failed. Please try again.');
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        const body = { ...form, slug: form.slug || slugify(form.name) };
        if (modal && 'id' in modal && modal.id) {
            await fetch('/api/categories', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ id: modal.id, ...body }) });
        } else {
            await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify(body) });
        }
        setModal(null);
        fetchCats();
    };

    const del = async (id: number) => {
        if (!confirm('Delete this category?')) return;
        await fetch('/api/categories', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ id }) });
        fetchCats();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div><h1 className="text-3xl font-black">Categories</h1><p className="text-neutral-500 text-sm mt-1">Manage product categories</p></div>
                <button onClick={openNew} className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-neutral-800"><Plus size={16} /> New Category</button>
            </div>
            {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 bg-white rounded-xl animate-pulse" />)}</div> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cats.map(c => (
                        <div key={c.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                            {c.image_url && <img src={c.image_url} alt={c.name} className="w-full h-32 object-cover" />}
                            <div className="p-4">
                                <h3 className="font-bold">{c.name}</h3>
                                <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{c.description}</p>
                                <div className="flex gap-2 mt-3">
                                    <button onClick={() => openEdit(c)} className="flex items-center gap-1 text-xs px-3 py-1.5 border border-neutral-300 rounded-lg hover:bg-neutral-50"><Pencil size={12} /> Edit</button>
                                    <button onClick={() => del(c.id)} className="flex items-center gap-1 text-xs px-3 py-1.5 border border-neutral-300 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={12} /> Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {modal && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setModal(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold">{'id' in modal && modal.id ? 'Edit' : 'New'} Category</h2><button onClick={() => setModal(null)}><X size={20} /></button></div>
                        <form onSubmit={save} className="space-y-4">
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Category name" required className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" />
                            <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="Slug (auto-generated if empty)" className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" />
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black resize-none" />
                            <div>
                                <label className="block text-sm font-medium mb-2">Category Image</label>
                                {form.image_url && (
                                    <div className="relative mb-2 group">
                                        <img src={form.image_url} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-neutral-200" />
                                        <button type="button" onClick={() => setForm(f => ({ ...f, image_url: '' }))} className="absolute top-1.5 right-1.5 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-red-50 text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition">
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                                <label className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer text-sm transition ${uploading ? 'border-neutral-400 text-neutral-400 bg-neutral-50' : 'border-neutral-300 hover:border-neutral-400 text-neutral-500 hover:bg-neutral-50'}`}>
                                    <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Image from Device'}
                                    <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); e.target.value = ''; }} />
                                </label>
                                <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="Or paste image URL" className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black mt-2" />
                            </div>
                            <button type="submit" disabled={uploading} className="w-full bg-black text-white py-3 rounded-lg text-sm font-semibold disabled:opacity-50">Save</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
