import { create } from 'zustand';
import { initialProducts } from '@/lib/mockData';

export interface Product {
    id: string;
    name: string;
    quantity: number;
    costPrice?: number;
    sellingPrice?: number;
    expiryDate?: string;
    cost_price?: number;
    selling_price?: number;
    expiry_date?: string;
    category?: string;
}

interface InventoryState {
    products: Product[];
    fetchProducts: () => Promise<void>;
    addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
    updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
}

const getStoredProducts = (): Product[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('kirana_products');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse stored products', e);
        }
    }
    const mapped = initialProducts.map(p => ({
        ...p,
        cost_price: p.costPrice,
        selling_price: p.sellingPrice,
        expiry_date: p.expiryDate
    }));
    localStorage.setItem('kirana_products', JSON.stringify(mapped));
    return mapped;
};

const saveProducts = (products: Product[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('kirana_products', JSON.stringify(products));
    }
};

export const useInventoryStore = create<InventoryState>((set) => ({
    products: typeof window !== 'undefined' ? getStoredProducts() : [],

    fetchProducts: async () => {
        try {
            const res = await fetch('/api/products');
            if (res.ok) {
                const products = await res.json();
                set({ products });
            }
        } catch (e) {
            console.error('Failed to fetch products from API', e);
        }
    },

    addProduct: async (product) => {
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            if (res.ok) {
                const newProduct = await res.json();
                set((state) => ({ products: [...state.products, newProduct] }));
            } else {
                console.error('Failed to add product to DB');
            }
        } catch (e) {
            console.error('Failed to add product', e);
        }
    },

    updateProduct: async (id, updates) => {
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (res.ok) {
                const updatedProduct = await res.json();
                set((state) => ({
                    products: state.products.map((p) =>
                        p.id === id ? updatedProduct : p
                    )
                }));
            } else {
                console.error('Failed to update product in DB');
            }
        } catch (e) {
            console.error('Failed to update product', e);
        }
    },
}));
