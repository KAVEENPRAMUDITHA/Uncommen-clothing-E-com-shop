import { Link } from 'react-router-dom';
import { formatLKR } from '../lib/utils';
import { Tag } from 'lucide-react';

type Product = any;

export default function ProductCard({ product }: { product: Product }) {
    const discount = product.discounts;
    const hasDiscount = discount && discount.active;
    const finalPrice = hasDiscount
        ? discount.type === 'percentage'
            ? product.price * (1 - discount.value / 100)
            : Math.max(0, product.price - discount.value)
        : product.price;

    return (
        <Link to={`/product/${product.id}`} className="group block">
            <div className="relative overflow-hidden rounded-lg bg-neutral-100 aspect-[3/4]">
                <img src={product.display_image || product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                {hasDiscount && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Tag size={11} /> {discount.type === 'percentage' ? `${discount.value}% OFF` : `${formatLKR(discount.value)} OFF`}
                    </span>
                )}
                {product.featured && !hasDiscount && (
                    <span className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-2.5 py-1 rounded-full">FEATURED</span>
                )}
            </div>
            <div className="mt-3">
                <h3 className="text-sm font-medium text-neutral-900 group-hover:underline">{product.name}</h3>
                {product.categories && <p className="text-xs text-neutral-400 mt-0.5">{product.categories.name}</p>}
                <div className="mt-1 flex items-center gap-2">
                    {hasDiscount ? (
                        <>
                            <span className="text-sm font-bold text-red-600">{formatLKR(finalPrice)}</span>
                            <span className="text-xs text-neutral-400 line-through">{formatLKR(product.price)}</span>
                        </>
                    ) : (
                        <span className="text-sm font-bold">{formatLKR(product.price)}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
