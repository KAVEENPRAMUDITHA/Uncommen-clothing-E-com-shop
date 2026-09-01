import { Link } from 'react-router-dom';
import { formatLKR } from '../lib/utils';
import { Tag, ArrowRight, Sparkles } from 'lucide-react';
import type { Product } from '../types';

export default function ProductCard({ product }: { product: Product }) {
    const discount = product.discounts;
    const hasDiscount = discount && discount.active;
    const finalPrice = hasDiscount
        ? discount.type === 'percentage'
            ? product.price * (1 - discount.value / 100)
            : Math.max(0, product.price - discount.value)
        : product.price;

    return (
        <Link to={`/product/${product.id}`} className="group block h-full flex flex-col">
            <div className="relative overflow-hidden rounded-2xl bg-neutral-100 aspect-[3/4] shadow-sm group-hover:shadow-xl transition-all duration-500 ease-out border border-neutral-100">
                <img
                    src={product.display_image || product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />

                {/* Subtle dark gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {hasDiscount && (
                        <span className="bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md backdrop-blur-sm">
                            <Tag size={11} /> {discount.type === 'percentage' ? `${discount.value}% OFF` : `${formatLKR(discount.value)} OFF`}
                        </span>
                    )}
                    {product.featured && !hasDiscount && (
                        <span className="bg-neutral-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md backdrop-blur-sm border border-white/20">
                            <Sparkles size={11} className="text-yellow-400" /> FEATURED
                        </span>
                    )}
                </div>

                {/* Quick Action Button that reveals on hover */}
                <div className="absolute bottom-3 left-3 right-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                    <span className="w-full py-2.5 px-4 bg-white/95 backdrop-blur text-neutral-900 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 hover:bg-neutral-900 hover:text-white transition-colors duration-200">
                        View Details <ArrowRight size={13} />
                    </span>
                </div>
            </div>

            <div className="mt-3.5 flex-1 flex flex-col justify-between">
                <div>
                    {product.categories && (
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                            {product.categories.name}
                        </p>
                    )}
                    <h3 className="text-sm font-semibold text-neutral-900 mt-0.5 group-hover:text-neutral-600 transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                </div>

                <div className="mt-2 flex items-center gap-2">
                    {hasDiscount ? (
                        <>
                            <span className="text-sm font-bold text-red-600">{formatLKR(finalPrice)}</span>
                            <span className="text-xs text-neutral-400 line-through">{formatLKR(product.price)}</span>
                        </>
                    ) : (
                        <span className="text-sm font-bold text-neutral-900">{formatLKR(product.price)}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
