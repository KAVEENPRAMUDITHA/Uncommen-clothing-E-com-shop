import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, ChevronLeft, Check } from 'lucide-react';
import { formatLKR } from '../lib/utils';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';

type Review = { id: number; author: string; rating: number; comment: string; created_at: string };
type VariantImage = { id: number; image_url: string; color: string | null; is_primary: boolean };

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { add } = useCart();
    const [product, setProduct] = useState<any>(null);
    const [related, setRelated] = useState<any[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [size, setSize] = useState('');
    const [color, setColor] = useState('');
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);
    const [activeImage, setActiveImage] = useState('');
    const [revAuthor, setRevAuthor] = useState('');
    const [revRating, setRevRating] = useState(5);
    const [revComment, setRevComment] = useState('');

    const fetchReviews = () => {
        fetch(`/api/reviews?product_id=${id}`).then(r => r.json()).then(d => setReviews(d || []));
    };

    useEffect(() => {
        setLoading(true);
        fetch(`/api/products`).then(r => r.json()).then(all => {
            const p = (all || []).find((x: any) => String(x.id) === String(id));
            setProduct(p);
            if (p) {
                const firstColor = (p.colors || [''])[0];
                setSize((p.sizes || [''])[0]);
                setColor(firstColor);
                // Set initial image: matching color variant, else primary, else default
                const imgs: VariantImage[] = p.product_images || [];
                const colorMatch = imgs.find(i => i.color === firstColor);
                const primary = imgs.find(i => i.is_primary);
                setActiveImage(colorMatch?.image_url || primary?.image_url || p.image_url);
                setRelated((all || []).filter((x: any) => x.category_id === p.category_id && x.id !== p.id).slice(0, 4));
            }
            fetchReviews();
            setLoading(false);
        });
    }, [id]);

    // When color changes, update the displayed image
    const handleColorChange = (c: string) => {
        setColor(c);
        const imgs: VariantImage[] = product?.product_images || [];
        const colorMatch = imgs.find(i => i.color === c);
        if (colorMatch) {
            setActiveImage(colorMatch.image_url);
        } else {
            // No variant image for this color — fall back to primary or default
            const primary = imgs.find(i => i.is_primary);
            setActiveImage(primary?.image_url || product?.image_url || '');
        }
    };

    const handleAdd = () => {
        if (!product) return;
        add({ product_id: product.id, product_name: product.name, price: finalPrice, image_url: activeImage || product.image_url, quantity: qty, size, color });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!revAuthor || !revComment) return;
        await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: Number(id), author: revAuthor, rating: revRating, comment: revComment }) });
        setRevAuthor(''); setRevComment(''); setRevRating(5);
        fetchReviews();
    };

    if (loading) return <div className="max-w-7xl mx-auto px-6 py-20 text-center text-neutral-400">Loading...</div>;
    if (!product) return <div className="max-w-7xl mx-auto px-6 py-20 text-center text-neutral-400">Product not found.</div>;

    const discount = product.discounts;
    const hasDiscount = discount && discount.active;
    const finalPrice = hasDiscount
        ? discount.type === 'percentage' ? product.price * (1 - discount.value / 100) : Math.max(0, product.price - discount.value)
        : product.price;
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

    // Build the gallery: color-specific images first, then general images
    const variantImages: VariantImage[] = product.product_images || [];
    const galleryImages = variantImages.length > 0
        ? variantImages
        : [{ id: 0, image_url: product.image_url, color: null, is_primary: true }];

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-black mb-6"><ChevronLeft size={16} /> Back</button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Image gallery */}
                <div>
                    <div className="relative rounded-xl overflow-hidden bg-neutral-100 aspect-[3/4] mb-3">
                        <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
                        {hasDiscount && <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">SALE</span>}
                    </div>
                    {/* Thumbnails */}
                    {galleryImages.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {galleryImages.map((img, i) => (
                                <button
                                    key={img.id || i}
                                    onClick={() => setActiveImage(img.image_url)}
                                    className={`relative shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition ${activeImage === img.image_url ? 'border-black' : 'border-transparent hover:border-neutral-300'}`}
                                >
                                    <img src={img.image_url} alt={img.color || `View ${i + 1}`} className="w-full h-full object-cover" />
                                    {img.color && (
                                        <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] px-1 py-0.5 text-center truncate">{img.color}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product info */}
                <div>
                    {product.categories && <Link to={`/shop?category=${product.category_id}`} className="text-xs font-semibold tracking-wider uppercase text-neutral-400 hover:text-black">{product.categories.name}</Link>}
                    <h1 className="text-3xl font-black mt-1 mb-3">{product.name}</h1>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} className={i < Math.round(avg) ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'} />)}
                        </div>
                        <span className="text-sm text-neutral-500">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        {hasDiscount ? (
                            <>
                                <span className="text-3xl font-black text-red-600">{formatLKR(finalPrice)}</span>
                                <span className="text-lg text-neutral-400 line-through">{formatLKR(product.price)}</span>
                            </>
                        ) : <span className="text-3xl font-black">{formatLKR(product.price)}</span>}
                    </div>
                    <p className="text-neutral-600 leading-relaxed mb-6">{product.description}</p>
                    {product.sizes && product.sizes.length > 0 && (
                        <div className="mb-5">
                            <p className="text-sm font-semibold mb-2">Size</p>
                            <div className="flex gap-2">
                                {product.sizes.map((s: string) => (
                                    <button key={s} onClick={() => setSize(s)} className={`min-w-10 px-3 h-10 rounded border text-sm font-medium transition ${size === s ? 'border-black bg-black text-white' : 'border-neutral-300 hover:border-neutral-900'}`}>{s}</button>
                                ))}
                            </div>
                        </div>
                    )}
                    {product.colors && product.colors.length > 0 && (
                        <div className="mb-6">
                            <p className="text-sm font-semibold mb-2">Color {color && <span className="text-neutral-400 font-normal">— {color}</span>}</p>
                            <div className="flex flex-wrap gap-2">
                                {product.colors.map((c: string) => {
                                    const hasVariantImg = variantImages.some(i => i.color === c);
                                    return (
                                        <button
                                            key={c}
                                            onClick={() => handleColorChange(c)}
                                            className={`px-4 h-10 rounded border text-sm font-medium transition flex items-center gap-1.5 ${color === c ? 'border-black bg-black text-white' : 'border-neutral-300 hover:border-neutral-900'}`}
                                        >
                                            {c}
                                            {hasVariantImg && <span className={`w-1.5 h-1.5 rounded-full ${color === c ? 'bg-white' : 'bg-blue-500'}`} title="Has variant image" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center border border-neutral-300 rounded-full">
                            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-2.5 hover:bg-neutral-100 rounded-l-full">–</button>
                            <span className="px-4 text-sm font-medium">{qty}</span>
                            <button onClick={() => setQty(q => q + 1)} className="px-4 py-2.5 hover:bg-neutral-100 rounded-r-full">+</button>
                        </div>
                        <span className="text-sm text-neutral-500">{product.stock} in stock</span>
                    </div>
                    <button onClick={handleAdd} className={`w-full py-4 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition ${added ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-neutral-800'}`}>
                        {added ? <><Check size={18} /> Added to Cart</> : <><ShoppingBag size={18} /> Add to Cart</>}
                    </button>
                </div>
            </div>

            {/* Reviews */}
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div>
                    <h2 className="text-2xl font-black mb-5">Customer Reviews</h2>
                    {reviews.length === 0 ? <p className="text-neutral-400 text-sm">No reviews yet. Be the first!</p> : (
                        <div className="space-y-5">
                            {reviews.map(r => (
                                <div key={r.id} className="border-b border-neutral-100 pb-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-semibold text-sm">{r.author}</p>
                                        <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className={i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'} />)}</div>
                                    </div>
                                    <p className="text-sm text-neutral-600">{r.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div>
                    <h2 className="text-2xl font-black mb-5">Write a Review</h2>
                    <form onSubmit={submitReview} className="space-y-4">
                        <input value={revAuthor} onChange={e => setRevAuthor(e.target.value)} placeholder="Your name" className="w-full border border-neutral-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-black" />
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Rating:</span>
                            {[1, 2, 3, 4, 5].map(n => (
                                <button type="button" key={n} onClick={() => setRevRating(n)}><Star size={20} className={n <= revRating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'} /></button>
                            ))}
                        </div>
                        <textarea value={revComment} onChange={e => setRevComment(e.target.value)} placeholder="Share your thoughts..." rows={4} className="w-full border border-neutral-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-black resize-none" />
                        <button type="submit" className="bg-black text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-neutral-800">Submit Review</button>
                    </form>
                </div>
            </div>

            {related.length > 0 && (
                <div className="mt-16">
                    <h2 className="text-2xl font-black mb-6">You May Also Like</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {related.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                </div>
            )}
        </div>
    );
}
