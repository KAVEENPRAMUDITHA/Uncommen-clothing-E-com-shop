import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Star, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { slugify, formatLKR } from '../../lib/utils';

type Prod = any;
type Cat = { id: number; name: string };
type Disc = { id: number; name: string; type: string; value: number; active: boolean };
type VariantImage = { id?: number; image_url: string; color: string; is_primary: boolean };

export default function AdminProducts() {
    const [products, setProducts] = useState<Prod[]>([]);
    const [cats, setCats] = useState<Cat[]>([]);
    const [discounts, setDiscounts] = useState<Disc[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<Prod | null>(null);
    const [form, setForm] = useState({ name: '', slug: '', description: '', price: 0, category_id: 1, image_url: '', stock: 0, sizes: '', colors: '', featured: false, discount_id: '' });
    const [uploading, setUploading] = useState(false);
    const [variantImages, setVariantImages] = useState<VariantImage[]>([]);
    const [uploadingVariant, setUploadingVariant] = useState(false);
    const [variantColor, setVariantColor] = useState('');

    const token = () => JSON.parse(localStorage.getItem('uc_session') || '{}').token;

    const fetchData = async () => {
        setLoading(true);
        const [p, c, d] = await Promise.all([
            fetch('/api/products').then(r => r.json()),
            fetch('/api/categories').then(r => r.json()),
            fetch('/api/discounts').then(r => r.json()),
        ]);
        setProducts(p || []); setCats(c || []); setDiscounts(d || []);
        setLoading(false);
    };
    useEffect(() => { fetchData(); }, []);

    const fetchVariantImages = async (productId: number) => {
        const res = await fetch(`/api/product-images?product_id=${productId}`);
        const data = await res.json();
        setVariantImages(data || []);
    };

    const openNew = () => {
        setForm({ name: '', slug: '', description: '', price: 0, category_id: cats[0]?.id || 1, image_url: '', stock: 0, sizes: '', colors: '', featured: false, discount_id: '' });
        setVariantImages([]);
        setModal({} as Prod);
    };

    const openEdit = (p: Prod) => {
        setForm({
            name: p.name, slug: p.slug, description: p.description, price: p.price,
            category_id: p.category_id, image_url: p.image_url, stock: p.stock,
            sizes: (p.sizes || []).join(', '), colors: (p.colors || []).join(', '),
            featured: p.featured, discount_id: p.discount_id ? String(p.discount_id) : ''
        });
        setVariantImages([]);
        setModal(p);
        fetchVariantImages(p.id);
    };

    const uploadImage = async (file: File) => {
        setUploading(true);
        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = (reader.result as string).split(',')[1];
            const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ fileName: file.name, fileBase64: base64, contentType: file.type }) });
            const { url } = await res.json();
            setForm(f => ({ ...f, image_url: url }));
            setUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const uploadVariantImage = async (file: File, color: string) => {
        if (!modal || !('id' in modal) || !modal.id) {
            alert('Please save the product first before adding variant images.');
            return;
        }
        setUploadingVariant(true);
        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = (reader.result as string).split(',')[1];
            const upRes = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ fileName: file.name, fileBase64: base64, contentType: file.type }) });
            const { url } = await upRes.json();
            const res = await fetch('/api/product-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({ product_id: modal.id, image_url: url, color: color || null, is_primary: variantImages.length === 0 }),
            });
            const data = await res.json();
            setVariantImages(prev => [...prev, data]);
            setUploadingVariant(false);
            setVariantColor('');
        };
        reader.readAsDataURL(file);
    };

    const setPrimaryImage = async (imgId: number) => {
        if (!modal || !('id' in modal) || !modal.id) return;
        await fetch('/api/product-images', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
            body: JSON.stringify({ id: imgId, is_primary: true, product_id: modal.id }),
        });
        fetchVariantImages(modal.id);
    };

    const deleteVariantImage = async (imgId: number) => {
        if (!confirm('Remove this variant image?')) return;
        await fetch('/api/product-images', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
            body: JSON.stringify({ id: imgId }),
        });
        if (modal && 'id' in modal && modal.id) fetchVariantImages(modal.id);
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        const body = {
            ...form,
            slug: form.slug || slugify(form.name),
            price: Number(form.price),
            category_id: Number(form.category_id),
            stock: Number(form.stock),
            sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
            colors: form.colors.split(',').map(s => s.trim()).filter(Boolean),
            discount_id: form.discount_id ? Number(form.discount_id) : null,
        };
        if (modal && 'id' in modal && modal.id) {
            await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ id: modal.id, ...body }) });
        } else {
            const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify(body) });
            const created = await res.json();
            setModal(created); // Switch to edit mode so variant images can be added
        }
        fetchData();
    };

    const del = async (id: number) => {
        if (!confirm('Delete this product?')) return;
        await fetch('/api/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ id }) });
        fetchData();
    };

    const colorsList = form.colors.split(',').map(s => s.trim()).filter(Boolean);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div><h1 className="text-3xl font-black">Products</h1><p className="text-neutral-500 text-sm mt-1">Manage your inventory</p></div>
                <button onClick={openNew} className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-neutral-800"><Plus size={16} /> New Product</button>
            </div>
            {loading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />)}</div> : (
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase">
                            <tr><th className="text-left p-4">Product</th><th className="text-left p-4 hidden sm:table-cell">Category</th><th className="text-left p-4">Price</th><th className="text-left p-4 hidden md:table-cell">Stock</th><th className="text-left p-4 hidden md:table-cell">Variants</th><th className="text-right p-4">Actions</th></tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                                    <td className="p-4"><div className="flex items-center gap-3"><img src={p.display_image || p.image_url} alt="" className="w-10 h-12 object-cover rounded" /><div><p className="font-medium">{p.name}</p>{p.featured && <span className="text-xs text-yellow-600">★ Featured</span>}</div></div></td>
                                    <td className="p-4 hidden sm:table-cell text-neutral-500">{p.categories?.name}</td>
                                    <td className="p-4 font-medium">{formatLKR(p.price)}</td>
                                    <td className="p-4 hidden md:table-cell">{p.stock}</td>
                                    <td className="p-4 hidden md:table-cell">{(p.product_images || []).length > 0 ? <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{p.product_images.length} image{(p.product_images || []).length !== 1 ? 's' : ''}</span> : <span className="text-xs text-neutral-300">—</span>}</td>
                                    <td className="p-4"><div className="flex justify-end gap-2"><button onClick={() => openEdit(p)} className="p-2 hover:bg-neutral-100 rounded"><Pencil size={14} /></button><button onClick={() => del(p.id)} className="p-2 hover:bg-red-50 text-red-500 rounded"><Trash2 size={14} /></button></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {modal && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setModal(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">{'id' in modal && modal.id ? 'Edit' : 'New'} Product</h2>
                            <button onClick={() => setModal(null)}><X size={20} /></button>
                        </div>
                        <form onSubmit={save} className="space-y-4">
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Product name" required className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" />
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black resize-none" />
                            <div className="grid grid-cols-2 gap-3">
                                <input value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} type="number" placeholder="Price (Rs.)" required className="border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" />
                                <input value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} type="number" placeholder="Stock" className="border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" />
                            </div>
                            <select value={form.category_id} onChange={e => setForm({ ...form, category_id: Number(e.target.value) })} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black bg-white">
                                {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <input value={form.sizes} onChange={e => setForm({ ...form, sizes: e.target.value })} placeholder="Sizes (comma separated: S, M, L, XL)" className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" />
                            <input value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} placeholder="Colors (comma separated: Black, White)" className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" />
                            <select value={form.discount_id} onChange={e => setForm({ ...form, discount_id: e.target.value })} className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black bg-white">
                                <option value="">No discount</option>
                                {discounts.map(d => <option key={d.id} value={d.id}>{d.name} ({d.type === 'percentage' ? `${d.value}%` : `Rs.${d.value}`})</option>)}
                            </select>

                            {/* Default product image */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Default Product Image</label>
                                {form.image_url && <img src={form.image_url} alt="" className="w-24 h-28 object-cover rounded mb-2" />}
                                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-neutral-300 rounded-lg p-4 cursor-pointer hover:border-neutral-400 text-sm text-neutral-500">
                                    <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Default Image'}
                                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                                </label>
                                <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="Or paste image URL" className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black mt-2" />
                            </div>

                            <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="accent-black" /> Featured product</label>
                            <button type="submit" className="w-full bg-black text-white py-3 rounded-lg text-sm font-semibold">Save Product</button>
                        </form>

                        {/* Color Variant Images Section — only shown after product is saved */}
                        {'id' in modal && modal.id && (
                            <div className="mt-6 pt-6 border-t border-neutral-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <ImageIcon size={18} />
                                    <h3 className="font-bold text-sm">Color Variant Images</h3>
                                </div>
                                <p className="text-xs text-neutral-400 mb-4">Upload images for specific color variants. Customers will see the matching image when they select a color.</p>

                                {/* Upload row */}
                                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                                    <select value={variantColor} onChange={e => setVariantColor(e.target.value)} className="border border-neutral-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-black bg-white flex-1">
                                        <option value="">Select color (or General)</option>
                                        {colorsList.map(c => <option key={c} value={c}>{c}</option>)}
                                        <option value="General">General (no specific color)</option>
                                    </select>
                                    <label className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-lg px-4 py-2.5 cursor-pointer text-sm transition flex-1 ${uploadingVariant ? 'border-neutral-400 text-neutral-400' : 'border-neutral-300 hover:border-neutral-400 text-neutral-500'}`}>
                                        <Upload size={16} /> {uploadingVariant ? 'Uploading...' : 'Add Variant Image'}
                                        <input type="file" accept="image/*" className="hidden" disabled={uploadingVariant} onChange={e => { if (e.target.files?.[0] && variantColor) uploadVariantImage(e.target.files[0], variantColor); else if (e.target.files?.[0]) alert('Please select a color first.'); }} />
                                    </label>
                                </div>

                                {/* Variant images grid */}
                                {variantImages.length === 0 ? (
                                    <div className="text-center py-8 text-neutral-300 text-sm border border-dashed border-neutral-200 rounded-lg">
                                        <ImageIcon size={32} className="mx-auto mb-2" />
                                        No variant images yet. Upload images per color to showcase them on the product page.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-3">
                                        {variantImages.map(img => (
                                            <div key={img.id} className="relative group rounded-lg overflow-hidden border border-neutral-200">
                                                <img src={img.image_url} alt={img.color || 'General'} className="w-full aspect-[3/4] object-cover" />
                                                {img.is_primary && <span className="absolute top-1.5 left-1.5 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Star size={8} className="fill-white" /> PRIMARY</span>}
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] px-2 py-1 text-center">{img.color || 'General'}</div>
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5">
                                                    {!img.is_primary && (
                                                        <button type="button" onClick={() => img.id && setPrimaryImage(img.id)} className="w-7 h-7 bg-white rounded-full flex items-center justify-center hover:bg-neutral-200" title="Set as primary"><Star size={13} /></button>
                                                    )}
                                                    <button type="button" onClick={() => img.id && deleteVariantImage(img.id)} className="w-7 h-7 bg-white text-red-500 rounded-full flex items-center justify-center hover:bg-red-50" title="Delete"><Trash2 size={13} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
