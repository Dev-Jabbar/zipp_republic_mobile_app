import { create } from "zustand";

export interface CartItem {
  id: string;
  name: string;
  image: any;
  price: number;
  size?: string;
  color?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];

  // actions
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  incrementItem: (id: string) => void;
  decrementItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;

  // derived helpers (call as functions, not properties)
  getTotalCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item, quantity = 1) =>
    set((state) => {
      const existing = state.items.find(
        (i) =>
          i.id === item.id && i.size === item.size && i.color === item.color,
      );

      if (existing) {
        return {
          items: state.items.map((i) =>
            i === existing ? { ...i, quantity: i.quantity + quantity } : i,
          ),
        };
      }

      return {
        items: [...state.items, { ...item, quantity }],
      };
    }),

  incrementItem: (id) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    })),

  decrementItem: (id) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i,
      ),
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  clearCart: () => set({ items: [] }),

  getTotalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  getSubtotal: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));
