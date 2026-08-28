import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowRight, Star, MapPin, Truck, ShieldCheck, RefreshCw, Sparkles } from 'lucide-react';
import { STORE, formatLKR } from '../lib/utils';
import ProductCard from '../components/ProductCard';

type Cat = { id: number; name: string; slug: string; image_url: string; description: string };
type Prod = any;

/* ─── animation helpers ─── */
const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    }),
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number = 0) => ({
        opacity: 1, scale: 1,
        transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
    }),
};

/* ─── Animated Section wrapper ─── */
function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });
    return (
        <motion.section
            ref={ref}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className={className}
        >
            {children}
        </motion.section>
    );
}

/* ─── Marquee ─── */
function Marquee() {
    const items = ['NEW ARRIVALS', '✦', 'FREE SHIPPING OVER Rs. 5,000', '✦', 'KIRIBATHGODA STORE', '✦', 'EASY RETURNS', '✦', 'PREMIUM QUALITY', '✦'];
    const repeated = [...items, ...items, ...items];
    return (
        <div className="bg-neutral-900 text-white overflow-hidden py-3 select-none">
            <motion.div
                className="flex gap-8 whitespace-nowrap text-xs font-semibold tracking-[0.25em] uppercase"
                animate={{ x: ['0%', '-33.333%'] }}
                transition={{ duration: 25, ease: 'linear', repeat: Infinity }}
            >
                {repeated.map((t, i) => <span key={i} className="shrink-0">{t}</span>)}
            </motion.div>
        </div>
    );
}

export default function Home() {
    const [categories, setCategories] = useState<Cat[]>([]);
    const [products, setProducts] = useState<Prod[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/categories').then(r => r.json()),
            fetch('/api/products?featured=true').then(r => r.json()),
        ]).then(([c, p]) => { setCategories(c || []); setProducts(p || []); })
            .catch(() => { }).finally(() => setLoading(false));
    }, []);

    /* hero parallax */
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

    const trustBadges = [
        { icon: Truck, title: 'Free Shipping', sub: 'On orders over Rs. 5,000' },
        { icon: RefreshCw, title: 'Easy Returns', sub: '7-day exchange policy' },
        { icon: ShieldCheck, title: 'Secure Payment', sub: 'Card · Cash on Delivery' },
        { icon: MapPin, title: 'Visit Store', sub: 'Kiribathgoda, Sri Lanka' },
    ];

    return (
        <div className="overflow-hidden">
            {/* ─── HERO ─── */}
            <section ref={heroRef} className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden">
                <motion.img
                    src="/images/banner.jpg"
                    alt="Uncommon Clothing"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ y: heroY }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />

                {/* Decorative circles */}
                <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                <motion.div style={{ opacity: heroOpacity }} className="relative max-w-7xl mx-auto px-6 w-full">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        className="max-w-xl text-white"
                    >
                        <motion.span
                            variants={fadeUp} custom={0}
                            className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.3em] uppercase border border-white/30 px-5 py-2 rounded-full mb-8 backdrop-blur-sm bg-white/5"
                        >
                            <Sparkles size={14} className="text-yellow-400" />
                            New Collection 2025
                        </motion.span>

                        <motion.h1
                            variants={fadeUp} custom={1}
                            className="text-5xl sm:text-7xl font-black leading-[0.92] mb-6"
                        >
                            Wear the<br />
                            <span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                                Difference.
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeUp} custom={2}
                            className="text-lg text-neutral-300 mb-10 max-w-md leading-relaxed"
                        >
                            Bold styles for the uncommon. Discover curated fashion that speaks your language — now in Kiribathgoda.
                        </motion.p>

                        <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4">
                            <Link
                                to="/shop"
                                className="group bg-white text-black px-8 py-4 rounded-full font-semibold text-sm hover:bg-neutral-100 transition-all duration-300 flex items-center gap-2 hover:gap-3 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                            >
                                Shop Now <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <Link
                                to="/about"
                                className="border border-white/30 text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
                            >
                                Our Story
                            </Link>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Scroll hint */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <span className="text-white/50 text-[10px] tracking-[0.3em] uppercase">Scroll</span>
                    <div className="w-5 h-8 rounded-full border-2 border-white/30 flex justify-center pt-1.5">
                        <motion.div
                            className="w-1 h-1.5 bg-white/60 rounded-full"
                            animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    </div>
                </motion.div>
            </section>

            {/* ─── MARQUEE ─── */}
            <Marquee />

            {/* ─── TRUST BADGES ─── */}
            <Section className="border-b border-neutral-100 bg-neutral-50/50">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
                    {trustBadges.map((b, i) => (
                        <motion.div
                            key={i}
                            variants={fadeUp}
                            custom={i}
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-300 group cursor-default"
                        >
                            <div className="w-11 h-11 bg-neutral-900 text-white rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                <b.icon size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-neutral-900">{b.title}</p>
                                <p className="text-xs text-neutral-400 mt-0.5">{b.sub}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Section>

            {/* ─── CATEGORIES ─── */}
            <Section className="max-w-7xl mx-auto px-6 py-12">
                <motion.div variants={fadeUp} custom={0} className="text-center mb-8">
                    <span className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-400">Browse</span>
                    <h2 className="text-4xl font-black mt-2">Shop by Category</h2>
                    <div className="w-12 h-1 bg-neutral-900 mx-auto mt-4 rounded-full" />
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categories.map((c, i) => (
                        <motion.div key={c.id} variants={scaleIn} custom={i}>
                            <Link
                                to={`/shop?category=${c.id}`}
                                className="group relative h-80 rounded-2xl overflow-hidden block shadow-lg hover:shadow-2xl transition-shadow duration-500"
                            >
                                <img
                                    src={c.image_url}
                                    alt={c.name}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-all duration-500" />
                                <div className="absolute bottom-0 left-0 p-7 text-white">
                                    <h3 className="text-2xl font-bold group-hover:translate-y-0 translate-y-1 transition-transform duration-300">{c.name}</h3>
                                    <p className="text-sm text-neutral-300 mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity duration-300">{c.description}</p>
                                    <span className="inline-flex items-center gap-1.5 text-sm font-medium mt-3 group-hover:gap-3 transition-all duration-300">
                                        Explore <ArrowRight size={14} />
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </Section>

            {/* ─── FEATURED PRODUCTS ─── */}
            <Section className="bg-neutral-50/50 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div variants={fadeUp} custom={0} className="flex items-end justify-between mb-8">
                        <div>
                            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-400">Handpicked</span>
                            <h2 className="text-4xl font-black mt-2">Featured Products</h2>
                            <div className="w-12 h-1 bg-neutral-900 mt-4 rounded-full" />
                        </div>
                        <Link to="/shop" className="text-sm font-semibold text-neutral-900 hover:text-neutral-600 transition flex items-center gap-1.5 group">
                            View all <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="aspect-[3/4] bg-neutral-200 animate-pulse rounded-xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {products.slice(0, 8).map((p, i) => (
                                <motion.div key={p.id} variants={fadeUp} custom={i}>
                                    <ProductCard product={p} />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </Section>

            {/* ─── EDITORIAL STRIP ─── */}
            <Section className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <motion.div variants={fadeUp} custom={0} className="relative">
                        <div className="relative overflow-hidden rounded-2xl aspect-[4/5] shadow-xl">
                            <img
                                src="/images/group.jpg"
                                alt="Style editorial"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                        {/* Decorative offset frame */}
                        <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-neutral-200 rounded-2xl -z-10" />
                    </motion.div>
                    <motion.div variants={fadeUp} custom={1} className="py-8">
                        <span className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-400">Our Philosophy</span>
                        <h2 className="text-4xl sm:text-5xl font-black mt-3 leading-tight">
                            Style Without<br />
                            <span className="text-neutral-400">Compromise.</span>
                        </h2>
                        <p className="text-neutral-500 mt-6 leading-relaxed max-w-md">
                            We believe fashion should be bold, accessible, and personal.
                            Every piece in our collection is handpicked to help you express
                            the uncommon within — effortlessly.
                        </p>
                        <div className="flex gap-8 mt-8">
                            <div>
                                <p className="text-3xl font-black">500+</p>
                                <p className="text-xs text-neutral-400 mt-1">Products</p>
                            </div>
                            <div>
                                <p className="text-3xl font-black">1K+</p>
                                <p className="text-xs text-neutral-400 mt-1">Happy Customers</p>
                            </div>
                            <div>
                                <p className="text-3xl font-black">5.0</p>
                                <p className="text-xs text-neutral-400 mt-1">Rating</p>
                            </div>
                        </div>
                        <Link
                            to="/about"
                            className="inline-flex items-center gap-2 mt-10 text-sm font-semibold text-neutral-900 border-2 border-neutral-900 px-8 py-3.5 rounded-full hover:bg-neutral-900 hover:text-white transition-all duration-300 group"
                        >
                            Learn More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </Section>

            {/* ─── PROMO CTA ─── */}
            <Section className="max-w-7xl mx-auto px-6 pt-4 pb-12">
                <motion.div variants={scaleIn} custom={0}>
                    <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white p-12 sm:p-16">
                        {/* Animated gradient background */}
                        <div className="absolute inset-0 opacity-30"
                            style={{
                                background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)',
                            }}
                        />
                        <div className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)',
                                backgroundSize: '32px 32px',
                            }}
                        />

                        <div className="relative max-w-lg">
                            <motion.div
                                className="flex items-center gap-1 mb-5"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 300 }}
                                    >
                                        <Star size={18} className="fill-yellow-400 text-yellow-400" />
                                    </motion.div>
                                ))}
                                <span className="ml-3 text-sm text-neutral-300">{STORE.rating} · {STORE.reviewCount} reviews</span>
                            </motion.div>
                            <h2 className="text-4xl sm:text-5xl font-black mb-5 leading-tight">
                                Become<br />Uncommon.
                            </h2>
                            <p className="text-neutral-300 mb-8 leading-relaxed">
                                Join thousands who chose to stand out. Exclusive offers, early access to drops, and members-only pricing.
                            </p>
                            <Link
                                to="/shop"
                                className="group inline-flex items-center gap-2 bg-white text-black px-9 py-4 rounded-full font-semibold text-sm hover:bg-neutral-100 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all duration-300"
                            >
                                Browse Collection <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </Section>
        </div>
    );
}
