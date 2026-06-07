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
        const products = getStoredProducts();
        set({ products });
    },

    addProduct: async (product) => {
        const products = getStoredProducts();
        const newProduct: Product = {
            ...product,
            id: Math.random().toString(36).substr(2, 9),
            cost_price: product.cost_price ?? product.costPrice,
            selling_price: product.selling_price ?? product.sellingPrice,
            expiry_date: product.expiry_date ?? product.expiryDate
        };
        const updated = [...products, newProduct];
        saveProducts(updated);
        set({ products: updated });
    },

    updateProduct: async (id, updates) => {
        const products = getStoredProducts();
        const updated = products.map((p) => {
            if (p.id === id) {
                return {
                    ...p,
                    ...updates,
                    cost_price: updates.cost_price !== undefined ? updates.cost_price : (updates.costPrice !== undefined ? updates.costPrice : p.cost_price),
                    selling_price: updates.selling_price !== undefined ? updates.selling_price : (updates.sellingPrice !== undefined ? updates.sellingPrice : p.selling_price),
                    expiry_date: updates.expiry_date !== undefined ? updates.expiry_date : (updates.expiryDate !== undefined ? updates.expiryDate : p.expiry_date)
                };
            }
            return p;
        });
        saveProducts(updated);
        set({ products: updated });
    },
}));
