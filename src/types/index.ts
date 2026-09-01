export interface Category {
    id: number;
    name: string;
    slug?: string;
    image_url?: string;
    description?: string;
}

export interface Discount {
    id?: number;
    name?: string;
    type: 'percentage' | 'fixed' | string;
    value: number;
    active: boolean;
}

export interface ProductImage {
    id?: number;
    product_id?: number;
    image_url: string;
    color?: string | null;
    is_primary?: boolean;
}

export interface Product {
    id: number;
    name: string;
    slug?: string;
    description?: string;
    price: number;
    category_id?: number;
    image_url?: string;
    display_image?: string;
    stock?: number;
    sizes?: string;
    colors?: string;
    featured?: boolean;
    discount_id?: number | null;
    discounts?: Discount | null;
    categories?: {
        id?: number;
        name: string;
    } | null;
    product_images?: ProductImage[];
}
