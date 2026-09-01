import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    Star,
    MapPin,
    Truck,
    ShieldCheck,
    RefreshCw,
    Sparkles
} from 'lucide-react';
import { STORE } from '../lib/utils';
import ProductCard from '../components/ProductCard';
import type { Category, Product } from '../types';

/* ─── Animation helpers ─── */
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    }),
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: (i: number = 0) => ({
        opacity: 1,
        scale: 1,
        transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
    }),
};

/* ─── Animated Section wrapper ─── */
function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
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

/* ─── Hero Slides Data ─── */
const heroSlides = [
    {
        image: '/images/banner.jpg',
        tag: 'New Collection 2025',
        title: 'Wear the',
        titleHighlight: 'Difference.',
        desc: 'Bold styles for the uncommon. Discover curated fashion that speaks your language — now in Kiribathgoda.',
        primaryBtn: { text: 'Shop Now', link: '/shop' },
        secondaryBtn: { text: 'Our Story', link: '/about' },
    },
    {
        image: '/images/group.jpg',
        tag: 'Signature Street Drop',
        title: 'Style Without',
        titleHighlight: 'Compromise.',
        desc: 'Expressive fits tailored for everyday confidence. Elevate your wardrobe with our latest limited drop.',
        primaryBtn: { text: 'Explore Collections', link: '/shop' },
        secondaryBtn: { text: "Men's Apparel", link: '/shop?category=1' },
    },
    {
        image: '/images/about.png',
        tag: 'Boutique Heritage',
        title: 'Crafted for the',
        titleHighlight: 'Uncommon.',
        desc: 'Hand-selected fabrics and modern cuts designed for individuals who refuse to blend into the background.',
        primaryBtn: { text: 'Browse Drops', link: '/shop' },
        secondaryBtn: { text: "Women's Wear", link: '/shop?category=2' },
    },
];

export default function Home() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    /* Slider state */
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/api/categories').then(r => r.json()),
            fetch('/api/products?featured=true').then(r => r.json()),
        ]).then(([c, p]) => {
            setCategories(c || []);
            setProducts(p || []);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    /* Auto-advance slides */
    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % heroSlides.length);
        }, 5500);
        return () => clearInterval(timer);
    }, [isPaused, currentSlide]);

    const trustBadges = [
        { icon: Truck, title: 'Free Shipping', sub: 'On orders over Rs. 5,000' },
        { icon: RefreshCw, title: 'Easy Returns', sub: '7-day exchange policy' },
        { icon: ShieldCheck, title: 'Secure Payment', sub: 'Card · Cash on Delivery' },
        { icon: MapPin, title: 'Visit Store', sub: 'Kiribathgoda, Sri Lanka' },
    ];

    const slide = heroSlides[currentSlide];

    return (
        <div className="overflow-hidden">
            {/* ─── MODERN HERO SLIDER ─── */}
            <section
                className="relative h-[88vh] min-h-[580px] flex items-center overflow-hidden bg-neutral-950"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* Background Sliding Images with Ken-Burns Zoom */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 1.08 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="absolute inset-0 w-full h-full"
                    >
                        <img
                            src={slide.image}
                            alt={slide.titleHighlight}
                            className="w-full h-full object-cover object-center"
                        />
                        {/* Smooth Cinematic Gradients */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                    </motion.div>
                </AnimatePresence>

                {/* Decorative ambient lights */}
                <div className="absolute top-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 left-10 w-60 h-60 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                {/* Hero Slide Content */}
                <div className="relative max-w-7xl mx-auto px-6 w-full z-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, y: -15 }}
                            className="max-w-xl text-white"
                        >
                            <motion.span
                                variants={fadeUp}
                                custom={0}
                                className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.3em] uppercase border border-white/25 px-5 py-2 rounded-full mb-6 backdrop-blur-md bg-white/10 text-neutral-200"
                            >
                                <Sparkles size={13} className="text-yellow-400" />
                                {slide.tag}
                            </motion.span>

                            <motion.h1
                                variants={fadeUp}
                                custom={1}
                                className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[0.95] mb-6 tracking-tight"
                            >
                                {slide.title}<br />
                                <span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                                    {slide.titleHighlight}
                                </span>
                            </motion.h1>

                            <motion.p
                                variants={fadeUp}
                                custom={2}
                                className="text-base sm:text-lg text-neutral-300 mb-8 max-w-md leading-relaxed"
                            >
                                {slide.desc}
                            </motion.p>

                            <motion.div
                                variants={fadeUp}
                                custom={3}
                                className="flex flex-wrap gap-4"
                            >
                                <Link
                                    to={slide.primaryBtn.link}
                                    className="group bg-white text-black px-8 py-4 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-neutral-100 transition-all duration-300 flex items-center gap-2 hover:gap-3 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                >
                                    {slide.primaryBtn.text}
                                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                                </Link>
                                <Link
                                    to={slide.secondaryBtn.link}
                                    className="border border-white/30 text-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
                                >
                                    {slide.secondaryBtn.text}
                                </Link>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>


                {/* Modern Slide Progress Indicators */}
                <div className="absolute bottom-8 left-0 right-0 z-20">
                    <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {heroSlides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentSlide(i)}
                                    className="group relative py-2"
                                    title={`Slide ${i + 1}`}
                                >
                                    <div className="w-12 sm:w-16 h-1 bg-white/20 rounded-full overflow-hidden transition-all duration-300 group-hover:bg-white/40">
                                        {currentSlide === i && (
                                            <motion.div
                                                initial={{ width: '0%' }}
                                                animate={{ width: isPaused ? '100%' : '100%' }}
                                                transition={{ duration: 5.5, ease: 'linear' }}
                                                className="h-full bg-white rounded-full"
                                            />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Slide Counter */}
                        <div className="text-white/60 text-xs font-mono tracking-widest hidden sm:block">
                            <span className="text-white font-bold">0{currentSlide + 1}</span> / 0{heroSlides.length}
                        </div>
                    </div>
                </div>
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
            <Section className="relative overflow-hidden">
                <div className="relative min-h-[520px] flex items-center">
                    <img
                        src="/images/group.jpg"
                        alt="Style editorial"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />

                    <div className="relative max-w-7xl mx-auto px-6 w-full py-16 grid md:grid-cols-2 gap-10 items-center">
                        <motion.div variants={fadeUp} custom={0}>
                            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.3em] uppercase text-white/60 border border-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm bg-white/5">
                                <Sparkles size={12} className="text-yellow-400" />
                                Our Philosophy
                            </span>
                            <h2 className="text-4xl sm:text-5xl font-black mt-5 leading-tight text-white">
                                Style Without<br />
                                <span className="bg-gradient-to-r from-white via-neutral-300 to-neutral-500 bg-clip-text text-transparent">Compromise.</span>
                            </h2>
                            <p className="text-neutral-300 mt-5 leading-relaxed max-w-md">
                                We believe fashion should be bold, accessible, and personal.
                                Every piece in our collection is handpicked to help you express
                                the uncommon within — effortlessly.
                            </p>
                            <Link
                                to="/about"
                                className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-white border-2 border-white/40 px-8 py-3.5 rounded-full hover:bg-white hover:text-black transition-all duration-300 group backdrop-blur-sm"
                            >
                                Learn More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>

                        <motion.div variants={fadeUp} custom={1} className="flex flex-wrap gap-4 justify-center md:justify-end">
                            {[
                                { value: '500+', label: 'Products' },
                                { value: '1K+', label: 'Happy Customers' },
                                { value: '5.0', label: 'Rating' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    variants={scaleIn}
                                    custom={i}
                                    className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-8 py-6 text-center hover:bg-white/15 transition-all duration-300 min-w-[130px]"
                                >
                                    <p className="text-3xl font-black text-white">{stat.value}</p>
                                    <p className="text-xs text-white/60 mt-1.5 font-medium">{stat.label}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </Section>

            {/* ─── PROMO CTA ─── */}
            <Section className="max-w-7xl mx-auto px-6 pt-4 pb-12">
                <motion.div variants={scaleIn} custom={0}>
                    <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white">
                        <div className="grid md:grid-cols-2">
                            {/* Left: Content */}
                            <div className="relative p-10 sm:p-14 flex flex-col justify-center">
                                <div className="absolute inset-0 opacity-20"
                                    style={{
                                        backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)',
                                        backgroundSize: '28px 28px',
                                    }}
                                />
                                <div className="absolute top-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

                                <div className="relative">
                                    <motion.div
                                        className="flex items-center gap-1.5 mb-6"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.8 }}
                                    >
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: 0, rotate: -30 }}
                                                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 300 }}
                                            >
                                                <Star size={18} className="fill-yellow-400 text-yellow-400" />
                                            </motion.div>
                                        ))}
                                        <span className="ml-3 text-sm text-neutral-400">{STORE.rating} · {STORE.reviewCount} reviews</span>
                                    </motion.div>

                                    <h2 className="text-4xl sm:text-5xl font-black leading-tight">
                                        Become<br />
                                        <span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">Uncommon.</span>
                                    </h2>

                                    <p className="text-neutral-400 mt-5 leading-relaxed max-w-sm">
                                        Join thousands who chose to stand out. Exclusive offers, early access to drops, and members-only pricing.
                                    </p>

                                    <div className="flex flex-wrap gap-2 mt-6">
                                        {['Exclusive Drops', 'Members Pricing', 'Free Shipping'].map((tag) => (
                                            <span key={tag} className="text-[11px] font-semibold tracking-wider uppercase text-white/70 border border-white/15 px-3.5 py-1.5 rounded-full bg-white/5 backdrop-blur-sm">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <Link
                                        to="/shop"
                                        className="group inline-flex items-center gap-2 bg-white text-black px-9 py-4 rounded-full font-semibold text-sm hover:bg-neutral-100 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all duration-300 mt-8"
                                    >
                                        Browse Collection <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>

                            {/* Right: Image */}
                            <div className="relative min-h-[320px] md:min-h-0 overflow-hidden">
                                <img
                                    src="/images/women-dress.jpg"
                                    alt="Uncommon style"
                                    className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/40 to-transparent md:block hidden" />
                                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent md:hidden" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </Section>
        </div>
    );
}
