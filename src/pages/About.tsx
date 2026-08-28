import { motion } from 'framer-motion';
import { Star, MapPin, Phone, Clock, Award, Heart, Sparkles, ShieldCheck, ArrowRight, Compass, CheckCircle2 } from 'lucide-react';
import { STORE } from '../lib/utils';
import { Link } from 'react-router-dom';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    }),
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.94 },
    visible: (i: number = 0) => ({
        opacity: 1,
        scale: 1,
        transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
    }),
};

export default function About() {
    const values = [
        {
            icon: Sparkles,
            title: 'Uncommon Vision',
            desc: 'We curate pieces that break the mold of fast fashion, embracing timeless boldness and distinctive individuality.',
        },
        {
            icon: ShieldCheck,
            title: 'Handpicked Quality',
            desc: 'Every fabric, stitch, and silhouette undergoes rigorous selection to ensure premium comfort and longevity.',
        },
        {
            icon: Compass,
            title: 'Local Roots, Global Taste',
            desc: 'Proudly rooted in Kiribathgoda, Sri Lanka, bringing internationally inspired cuts and trends to your wardrobe.',
        },
        {
            icon: Heart,
            title: 'Customer-Obsessed',
            desc: 'From personal styling advice to seamless support, we treat every customer as an essential part of our story.',
        },
    ];

    const stats = [
        { icon: Award, label: 'Customer Rating', value: `${STORE.rating} ★` },
        { icon: Heart, label: 'Happy Shoppers', value: '2,000+' },
        { icon: Sparkles, label: 'Curated Designs', value: '500+' },
        { icon: Star, label: 'Verified Reviews', value: `${STORE.reviewCount}+` },
    ];

    return (
        <div className="overflow-hidden bg-white text-neutral-900">
            {/* ─── Hero Section ─── */}
            <section className="relative min-h-[460px] flex items-center justify-center bg-neutral-950 text-white overflow-hidden py-20 px-6">
                {/* Subtle Ambient Light */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-neutral-800/30 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

                <div className="relative max-w-4xl mx-auto text-center">
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
                        <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.3em] uppercase border border-white/20 px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm bg-white/5 text-neutral-300">
                            <Sparkles size={13} className="text-yellow-400" />
                            Established in Kiribathgoda
                        </span>
                    </motion.div>

                    <motion.h1
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={1}
                        className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] mb-6"
                    >
                        Fashion for Those Who Dare to be{' '}
                        <span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                            Uncommon.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={2}
                        className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        From our flagship boutique in Gamma Tower to closets across Sri Lanka, we craft and curate style that speaks before you do.
                    </motion.p>
                </div>
            </section>

            {/* ─── Main Story & About Image Showcase ─── */}
            <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                    {/* Left: About Image with Charm Frame */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-60px' }}
                        variants={scaleIn}
                        className="lg:col-span-6 relative"
                    >
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-neutral-100 aspect-[4/4.5] sm:aspect-[4/3.8] lg:aspect-[4/4.5]">
                            <img
                                src="/images/about.png"
                                alt="Uncommon Clothing Story"
                                className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700 ease-out"
                            />
                            {/* Subtle dark gradient overlay for depth */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                            {/* Floating Glassmorphic Badge */}
                            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/40 shadow-lg flex items-center justify-between text-neutral-900">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                        UC
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold leading-tight">{STORE.name}</p>
                                        <p className="text-xs text-neutral-500">{STORE.tagline}</p>
                                    </div>
                                </div>
                                <span className="text-[11px] font-semibold tracking-wider uppercase px-3 py-1 bg-neutral-100 rounded-full text-neutral-700">
                                    Kiribathgoda
                                </span>
                            </div>
                        </div>

                        {/* Decorative background border accent */}
                        <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-neutral-200 rounded-3xl -z-10 hidden sm:block" />
                    </motion.div>

                    {/* Right: Story Content */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-60px' }}
                        variants={fadeUp}
                        className="lg:col-span-6 space-y-6"
                    >
                        <div>
                            <span className="text-xs font-semibold tracking-[0.25em] uppercase text-neutral-400">Our Heritage</span>
                            <h2 className="text-3xl sm:text-4xl font-black mt-2 leading-tight">
                                Curating Confidence, Stitch by Stitch.
                            </h2>
                            <div className="w-12 h-1 bg-neutral-900 mt-4 rounded-full" />
                        </div>

                        <p className="text-neutral-600 leading-relaxed text-base">
                            <strong className="text-neutral-900 font-semibold">{STORE.name}</strong> was born from a simple observation: modern fashion had become predictable. We believed everyday wear shouldn't mean blending into the background.
                        </p>

                        <p className="text-neutral-600 leading-relaxed text-base">
                            Established in <strong>Kiribathgoda, Sri Lanka</strong>, our boutique in Gamma Tower brings together a finely tuned edit of men’s apparel, women’s wear, and standout accessories. Every drop is crafted to bridge high-end street aesthetics with effortless everyday comfort.
                        </p>

                        {/* Bullet Highlights */}
                        <div className="space-y-3 pt-2">
                            {[
                                'Premium fabrics tailored for Sri Lankan climate & comfort',
                                'Limited-run batches to preserve your unique signature',
                                'Welcoming in-store experience with personal styling advice',
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <CheckCircle2 size={18} className="text-neutral-900 shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium text-neutral-700">{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 flex items-center gap-4">
                            <Link
                                to="/shop"
                                className="inline-flex items-center gap-2 bg-neutral-900 text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-neutral-800 transition-all duration-300 shadow-sm group"
                            >
                                Discover Collections
                                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a
                                href={`tel:${STORE.phone}`}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-800 px-6 py-3.5 rounded-full border border-neutral-300 hover:bg-neutral-50 transition-colors"
                            >
                                <Phone size={15} /> Contact Us
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ─── Pillars / Values Section ─── */}
            <section className="bg-neutral-50/70 border-y border-neutral-100 py-16 lg:py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <span className="text-xs font-semibold tracking-[0.25em] uppercase text-neutral-400">Why Uncommon</span>
                        <h2 className="text-3xl sm:text-4xl font-black mt-2">What Sets Us Apart</h2>
                        <div className="w-12 h-1 bg-neutral-900 mx-auto mt-4 rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((v, i) => (
                            <motion.div
                                key={v.title}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                custom={i}
                                className="bg-white p-7 rounded-2xl border border-neutral-200/70 hover:border-neutral-900/40 hover:shadow-lg transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                                    <v.icon size={22} />
                                </div>
                                <h3 className="text-lg font-bold mb-2 text-neutral-900">{v.title}</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed">{v.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Stats Section ─── */}
            <section className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((s, i) => (
                        <motion.div
                            key={s.label}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={scaleIn}
                            custom={i}
                            className="bg-neutral-900 text-white rounded-2xl p-7 text-center relative overflow-hidden group hover:bg-black transition-colors"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                            <s.icon size={26} className="mx-auto mb-3 text-neutral-400 group-hover:scale-110 transition-transform duration-300" />
                            <p className="text-3xl font-black tracking-tight">{s.value}</p>
                            <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wider font-medium">{s.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ─── Boutique Location & Visit Card ─── */}
            <section className="max-w-7xl mx-auto px-6 pb-16">
                <div className="bg-neutral-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
                    <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 items-center divide-y md:divide-y-0 md:divide-x divide-neutral-800">
                        <div className="flex items-start gap-4 pb-6 md:pb-0">
                            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                                <MapPin size={22} className="text-neutral-300" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Visit Boutique</h3>
                                <p className="text-sm text-neutral-400 leading-relaxed">
                                    {STORE.address}<br />
                                    {STORE.addressLine2}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 py-6 md:py-0 md:px-8">
                            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                                <Phone size={22} className="text-neutral-300" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Customer Care</h3>
                                <p className="text-sm text-neutral-400">{STORE.phone}</p>
                                <a href={`tel:${STORE.phone}`} className="text-xs text-white underline mt-1.5 inline-block hover:text-neutral-300">
                                    Call or WhatsApp
                                </a>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 pt-6 md:pt-0 md:pl-8">
                            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                                <Clock size={22} className="text-neutral-300" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Opening Hours</h3>
                                <p className="text-sm text-neutral-400 leading-relaxed">
                                    {STORE.hours}<br />
                                    <span className="text-xs text-neutral-500">Open 7 days a week</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Final CTA ─── */}
            <section className="bg-neutral-50 border-t border-neutral-100 py-16 text-center px-6">
                <div className="max-w-2xl mx-auto">
                    <span className="text-xs font-semibold tracking-[0.25em] uppercase text-neutral-400">Ready to Upgrade?</span>
                    <h2 className="text-3xl sm:text-4xl font-black mt-2 mb-4">Find Your Uncommon Look</h2>
                    <p className="text-neutral-600 mb-8 max-w-lg mx-auto text-sm sm:text-base">
                        Explore our latest arrivals in men's, women's, and accessory pieces designed to make an impression.
                    </p>
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 bg-neutral-900 text-white px-9 py-4 rounded-full font-bold text-sm hover:bg-neutral-800 hover:shadow-xl transition-all duration-300 group"
                    >
                        Browse Shop
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
