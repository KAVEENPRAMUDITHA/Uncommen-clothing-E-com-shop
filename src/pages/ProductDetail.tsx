import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Star,
    ShoppingBag,
    ChevronLeft,
    Check,
    Truck,
    ShieldCheck,
    RefreshCw,
    Sparkles,
    ArrowRight,
    Tag,
    CheckCircle2
} from 'lucide-react';
import { formatLKR, STORE } from '../lib/utils';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';

type Review = { id: number; author: string; rating: number; comment: string; created_at: string };
type VariantImage = { id: number; image_url: string; color: string | null; is_primary: boolean };

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { add, open } = useCart();
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
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    const fetchReviews = () => {
        fetch(`/api/reviews?product_id=${id}`)
            .then(r => r.json())
            .then(d => setReviews(d || []))
            .catch(() => {});
    };

    useEffect(() => {
        setLoading(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fetch(`/api/products`)
            .then(r => r.json())
            .then(all => {
                const p = (all || []).find((x: any) => String(x.id) === String(id));
                setProduct(p);
                if (p) {
                    const firstColor = (p.colors || [''])[0];
                    setSize((p.sizes || [''])[0]);
                    setColor(firstColor);

                    const imgs: VariantImage[] = p.product_images || [];
                    const colorMatch = imgs.find(i => i.color === firstColor);
                    const primary = imgs.find(i => i.is_primary);
                    setActiveImage(colorMatch?.image_url || primary?.image_url || p.display_image || p.image_url);
                    setRelated((all || []).filter((x: any) => x.category_id === p.category_id && x.id !== p.id).slice(0, 4));
                }
                fetchReviews();
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const handleColorChange = (c: string) => {
        setColor(c);
        const imgs: VariantImage[] = product?.product_images || [];
        const colorMatch = imgs.find(i => i.color === c);
        if (colorMatch) {
            setActiveImage(colorMatch.image_url);
        } else {
            const primary = imgs.find(i => i.is_primary);
            setActiveImage(primary?.image_url || product?.display_image || product?.image_url || '');
        }
    };

    const handleAdd = (openDrawer = true) => {
        if (!product) return;
        add({
            product_id: product.id,
            product_name: product.name,
            price: finalPrice,
            image_url: activeImage || product.display_image || product.image_url,
            quantity: qty,
            size,
            color
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2200);
        if (openDrawer) {
            open();
        }
    };

    const handleBuyNow = () => {
        handleAdd(false);
        navigate('/checkout');
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!revAuthor.trim() || !revComment.trim()) return;
        await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: Number(id), author: revAuthor, rating: revRating, comment: revComment })
        });
        setRevAuthor('');
        setRevComment('');
        setRevRating(5);
        setReviewSubmitted(true);
        setTimeout(() => setReviewSubmitted(false), 4000);
        fetchReviews();
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-neutral-50/40">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center text-center px-6">
                <div>
                    <h2 className="text-2xl font-black text-neutral-900 mb-2">Product Not Found</h2>
                    <p className="text-sm text-neutral-500 mb-6">The piece you are looking for is no longer available.</p>
                    <Link to="/shop" className="bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-full hover:bg-neutral-800 transition">
                        Back to Shop
                    </Link>
                </div>
            </div>
        );
    }

    const discount = product.discounts;
    const hasDiscount = discount && discount.active;
    const finalPrice = hasDiscount
        ? discount.type === 'percentage'
            ? product.price * (1 - discount.value / 100)
            : Math.max(0, product.price - discount.value)
        : product.price;

    const discountSavings = hasDiscount ? product.price - finalPrice : 0;
    const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 5.0;

    const variantImages: VariantImage[] = product.product_images || [];
    const galleryImages = variantImages.length > 0
        ? variantImages
        : [{ id: 0, image_url: product.display_image || product.image_url, color: null, is_primary: true }];

    return (
        <div className="min-h-screen bg-neutral-50/30">
            {/* ─── Breadcrumb Navigation ─── */}
            <div className="max-w-7xl mx-auto px-6 pt-6 pb-4">
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                    <Link to="/" className="hover:text-neutral-900 transition">Home</Link>
                    <span>/</span>
                    <Link to="/shop" className="hover:text-neutral-900 transition">Shop</Link>
                    {product.categories && (
                        <>
                            <span>/</span>
                            <Link to={`/shop?category=${product.category_id}`} className="hover:text-neutral-900 transition">
                                {product.categories.name}
                            </Link>
                        </>
                    )}
                    <span>/</span>
                    <span className="text-neutral-900 font-semibold truncate max-w-xs">{product.name}</span>
                </div>
            </div>

            {/* ─── Product Hero Showcase ─── */}
            <div className="max-w-7xl mx-auto px-6 py-6 lg:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                    {/* Left Column: Media Gallery */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="relative rounded-3xl overflow-hidden bg-neutral-100 aspect-[3/4] shadow-md border border-neutral-200/70">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={activeImage}
                                    src={activeImage}
                                    alt={product.name}
                                    initial={{ opacity: 0, scale: 1.02 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.35, ease: 'easeOut' }}
                                    className="w-full h-full object-cover"
                                />
                            </AnimatePresence>

                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                                {hasDiscount && (
                                    <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg backdrop-blur-sm">
                                        <Tag size={12} /> {discount.type === 'percentage' ? `${discount.value}% OFF` : `${formatLKR(discount.value)} OFF`}
                                    </span>
                                )}
                                {product.featured && !hasDiscount && (
                                    <span className="bg-neutral-900 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-white/20">
                                        <Sparkles size={12} className="text-yellow-400" /> FEATURED
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail Carousel */}
                        {galleryImages.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 pt-1">
                                {galleryImages.map((img, i) => (
                                    <button
                                        key={img.id || i}
                                        type="button"
                                        onClick={() => setActiveImage(img.image_url)}
                                        className={`relative shrink-0 w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                                            activeImage === img.image_url
                                                ? 'border-neutral-900 ring-2 ring-neutral-900/20 shadow-md scale-105'
                                                : 'border-transparent hover:border-neutral-300 opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <img src={img.image_url} alt={img.color || `View ${i + 1}`} className="w-full h-full object-cover" />
                                        {img.color && (
                                            <span className="absolute bottom-0 left-0 right-0 bg-neutral-900/80 text-white text-[9px] font-bold px-1 py-0.5 text-center truncate">
                                                {img.color}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Product Info & Order Configuration */}
                    <div className="lg:col-span-5 space-y-6">
                        <div>
                            {product.categories && (
                                <span className="text-xs font-bold tracking-[0.25em] uppercase text-neutral-400">
                                    {product.categories.name}
                                </span>
                            )}
                            <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight mt-1 mb-3">
                                {product.name}
                            </h1>

                            {/* Ratings Header */}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            size={15}
                                            className={i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-200'}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs font-bold text-neutral-700">
                                    {avgRating.toFixed(1)}
                                </span>
                                <span className="text-xs text-neutral-400">
                                    ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                                </span>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-sm flex items-center justify-between">
                            <div className="flex items-baseline gap-3">
                                {hasDiscount ? (
                                    <>
                                        <span className="text-3xl font-black text-red-600">
                                            {formatLKR(finalPrice)}
                                        </span>
                                        <span className="text-base text-neutral-400 line-through">
                                            {formatLKR(product.price)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-3xl font-black text-neutral-900">
                                        {formatLKR(product.price)}
                                    </span>
                                )}
                            </div>

                            {hasDiscount && (
                                <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                                    Save {formatLKR(discountSavings)}
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-neutral-600 leading-relaxed">
                            {product.description}
                        </p>

                        {/* Size Selection */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-neutral-900 uppercase tracking-wider">Select Size</span>
                                    <span className="text-neutral-400 font-medium">Standard Fit</span>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {product.sizes.map((s: string) => {
                                        const isSelected = size === s;
                                        return (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setSize(s)}
                                                className={`min-w-12 h-11 px-4 rounded-xl text-xs font-bold uppercase transition-all duration-200 ${
                                                    isSelected
                                                        ? 'bg-neutral-900 text-white shadow-md scale-105'
                                                        : 'bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-900'
                                                }`}
                                            >
                                                {s}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Color Selection */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="space-y-2.5">
                                <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                                    Color: <span className="font-semibold text-neutral-500 normal-case">{color}</span>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {product.colors.map((c: string) => {
                                        const isSelected = color === c;
                                        return (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => handleColorChange(c)}
                                                className={`px-4 h-11 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                                                    isSelected
                                                        ? 'bg-neutral-900 text-white shadow-md'
                                                        : 'bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-900'
                                                }`}
                                            >
                                                <span>{c}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Quantity & Stock Status */}
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center border border-neutral-200 rounded-full bg-white px-2 py-1 shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setQty(q => Math.max(1, q - 1))}
                                    className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center font-bold text-neutral-600 transition"
                                >
                                    –
                                </button>
                                <span className="w-10 text-center text-sm font-bold text-neutral-900">{qty}</span>
                                <button
                                    type="button"
                                    onClick={() => setQty(q => q + 1)}
                                    className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center font-bold text-neutral-600 transition"
                                >
                                    +
                                </button>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                                <CheckCircle2 size={13} />
                                <span>{product.stock > 0 ? `In Stock (${product.stock} available)` : 'Limited Stock'}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-2">
                            <button
                                type="button"
                                onClick={() => handleAdd(true)}
                                className={`w-full py-4 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 ${
                                    added
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-neutral-900 text-white hover:bg-neutral-800'
                                }`}
                            >
                                {added ? (
                                    <>
                                        <Check size={16} /> Added to Shopping Bag
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag size={16} /> Add to Bag · {formatLKR(finalPrice * qty)}
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleBuyNow}
                                className="w-full py-4 rounded-full font-bold text-xs uppercase tracking-wider border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-all duration-200 shadow-sm flex items-center justify-center gap-2 group"
                            >
                                Buy Now with 1-Click
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Trust & Guarantee Widgets */}
                        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-3 text-xs text-neutral-600">
                            <div className="flex items-center gap-3">
                                <Truck size={17} className="text-neutral-900 shrink-0" />
                                <span><strong>Islandwide Shipping:</strong> Free for orders over Rs. 5,000</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <RefreshCw size={17} className="text-neutral-900 shrink-0" />
                                <span><strong>7-Day Returns:</strong> Easy size and color exchange policy</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={17} className="text-neutral-900 shrink-0" />
                                <span><strong>100% Authentic Quality:</strong> Curated at Gamma Tower, Kiribathgoda</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Customer Reviews Section ─── */}
            <div className="max-w-7xl mx-auto px-6 py-16 border-t border-neutral-200/80">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left: Reviews List */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">Feedback</span>
                                <h2 className="text-2xl font-black text-neutral-900 mt-1">Customer Reviews</h2>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-neutral-200 shadow-sm">
                                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-bold text-neutral-900">{avgRating.toFixed(1)} / 5.0</span>
                            </div>
                        </div>

                        {reviews.length === 0 ? (
                            <div className="bg-white rounded-3xl p-10 text-center border border-neutral-200/80">
                                <Star size={32} className="text-neutral-300 mx-auto mb-3" />
                                <h4 className="font-bold text-neutral-800 mb-1">No reviews yet</h4>
                                <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                                    Be the first to share your thoughts on this piece with the Uncommon community.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map(r => (
                                    <div key={r.id} className="bg-white p-6 rounded-2xl border border-neutral-200/70 shadow-sm space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">
                                                    {r.author[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-xs text-neutral-900 leading-tight">{r.author}</p>
                                                    <span className="text-[10px] text-emerald-600 font-semibold">Verified Buyer</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={12}
                                                        className={i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-200'}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-xs text-neutral-600 leading-relaxed pt-1">{r.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Write a Review Form */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-3xl p-7 sm:p-8 border border-neutral-200/80 shadow-md">
                            <span className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">Share Your Experience</span>
                            <h3 className="text-xl font-black text-neutral-900 mt-1 mb-5">Write a Review</h3>

                            <form onSubmit={submitReview} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block mb-1.5">
                                        Your Name
                                    </label>
                                    <input
                                        required
                                        value={revAuthor}
                                        onChange={e => setRevAuthor(e.target.value)}
                                        placeholder="e.g. Kaveen P."
                                        className="w-full px-4 py-3 bg-neutral-50/60 border border-neutral-200 rounded-xl text-xs outline-none focus:border-neutral-900 focus:bg-white transition"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block mb-1.5">
                                        Overall Rating
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <button
                                                type="button"
                                                key={n}
                                                onClick={() => setRevRating(n)}
                                                className="p-1 hover:scale-110 transition-transform"
                                            >
                                                <Star
                                                    size={22}
                                                    className={n <= revRating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-200'}
                                                />
                                            </button>
                                        ))}
                                        <span className="text-xs font-bold text-neutral-600 ml-2">({revRating} / 5)</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block mb-1.5">
                                        Your Review
                                    </label>
                                    <textarea
                                        required
                                        value={revComment}
                                        onChange={e => setRevComment(e.target.value)}
                                        placeholder="Describe the fabric, fit, and overall quality..."
                                        rows={4}
                                        className="w-full px-4 py-3 bg-neutral-50/60 border border-neutral-200 rounded-xl text-xs outline-none focus:border-neutral-900 focus:bg-white transition resize-none"
                                    />
                                </div>

                                {reviewSubmitted && (
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
                                        ✓ Thank you! Your review has been submitted.
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-neutral-900 text-white rounded-full font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition shadow-sm"
                                >
                                    Publish Review
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Related Products ─── */}
            {related.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 py-16 border-t border-neutral-200/80">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">Complete the Look</span>
                            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">You May Also Like</h2>
                        </div>
                        <Link to="/shop" className="text-xs font-bold uppercase tracking-wider text-neutral-900 hover:text-neutral-600 transition flex items-center gap-1">
                            View All <ArrowRight size={13} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {related.map(p => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
