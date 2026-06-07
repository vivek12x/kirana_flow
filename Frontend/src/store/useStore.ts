import { create } from 'zustand';
import { Product, CartItem, SalesData } from '@/types';
import { initialSales } from '@/lib/mockData';

interface StoreState {
    cart: CartItem[];
    sales: SalesData[];

    // Cart Actions
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateCartQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    setCart: (items: any[]) => void;
    checkout: () => void;
}

export const useStore = create<StoreState>((set) => ({
    cart: [],
    sales: initialSales,

    addToCart: (product) => set((state) => {
        const existing = state.cart.find((item) => item.id === product.id);
        if (existing) {
            return {
                cart: state.cart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            };
        }
        return {
            cart: [...state.cart, { id: product.id, name: product.name, price: product.sellingPrice, quantity: 1 }]
        };
    }),

    removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter((item) => item.id !== productId)
    })),

    updateCartQuantity: (productId, quantity) => set((state) => {
        if (quantity <= 0) {
            return { cart: state.cart.filter((item) => item.id !== productId) };
        }
        return {
            cart: state.cart.map((item) =>
                item.id === productId ? { ...item, quantity } : item
            )
        };
    }),

    clearCart: () => set({ cart: [] }),

    setCart: (items) => set(() => {
        const timestamp = Date.now();
        const newCartItems: CartItem[] = items.map((item: any, index: number) => ({
            id: `scanned-${index}-${timestamp}`,
            name: item.name || item.item_name || "Unknown Item",
            price: item.price ?? 0,
            quantity: item.quantity ?? item.qty ?? 1,
        }));

        return { cart: newCartItems };
    }),

    checkout: () => set({
        cart: []
    }),
}));

