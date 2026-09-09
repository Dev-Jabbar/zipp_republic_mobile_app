import { getCartItems, setCartItems } from "@/services/cartApi";
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

const isSameLine = (
  a: Pick<CartItem, "id" | "size" | "color">,
  b: Pick<CartItem, "id" | "size" | "color">,
) => a.id === b.id && a.size === b.size && a.color === b.color;

interface CartState {
  items: CartItem[];

  hasHydrated: boolean;

  // actions — all target a specific id+size+color combination, not just
  // id, so acting on one size/color variant doesn't affect another.
  // Signatures are UNCHANGED from the pre-Firestore version — every
  // existing call site (CartDrawer, ProductDetailScreen, checkout.tsx,
  // Header) needs zero changes.
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  incrementItem: (id: string, size?: string, color?: string) => void;
  decrementItem: (id: string, size?: string, color?: string) => void;
  removeItem: (id: string, size?: string, color?: string) => void;
  clearCart: () => void;

  // derived helpers (call as functions, not properties)
  getTotalCount: () => number;
  getSubtotal: () => number;

  setActiveUid: (uid: string | null) => Promise<void>;
}

let activeUid: string | null = null;
let syncTimer: ReturnType<typeof setTimeout> | null = null;
const SYNC_DEBOUNCE_MS = 600;

const scheduleSync = (items: CartItem[]) => {
  if (!activeUid) return;
  if (syncTimer) clearTimeout(syncTimer);
  const uidAtScheduleTime = activeUid;
  syncTimer = setTimeout(() => {
    setCartItems(uidAtScheduleTime, items).catch((err) => {
      console.error("Cart sync to Firestore failed:", err);
    });
  }, SYNC_DEBOUNCE_MS);
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  hasHydrated: false,

  addItem: (item, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((i) => isSameLine(i, item));
      const items = existing
        ? state.items.map((i) =>
            i === existing ? { ...i, quantity: i.quantity + quantity } : i,
          )
        : [...state.items, { ...item, quantity }];
      scheduleSync(items);
      return { items };
    });
  },

  incrementItem: (id, size, color) => {
    set((state) => {
      const items = state.items.map((i) =>
        isSameLine(i, { id, size, color })
          ? { ...i, quantity: i.quantity + 1 }
          : i,
      );
      scheduleSync(items);
      return { items };
    });
  },

  decrementItem: (id, size, color) => {
    set((state) => {
      const items = state.items.map((i) =>
        isSameLine(i, { id, size, color })
          ? { ...i, quantity: Math.max(1, i.quantity - 1) }
          : i,
      );
      scheduleSync(items);
      return { items };
    });
  },

  removeItem: (id, size, color) => {
    set((state) => {
      const items = state.items.filter(
        (i) => !isSameLine(i, { id, size, color }),
      );
      scheduleSync(items);
      return { items };
    });
  },

  clearCart: () => {
    scheduleSync([]);
    set({ items: [] });
  },

  getTotalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  getSubtotal: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  setActiveUid: async (uid) => {
    if (uid === activeUid && get().hasHydrated) return;

    if (syncTimer) {
      clearTimeout(syncTimer);
      syncTimer = null;
    }

    activeUid = uid;

    if (!uid) {
      set({ items: [], hasHydrated: true });
      return;
    }

    set({ hasHydrated: false });
    try {
      const items = await getCartItems(uid);
      set({ items, hasHydrated: true });
    } catch (err) {
      console.error("Cart hydrate from Firestore failed:", err);
      set({ items: [], hasHydrated: true });
    }
  },
}));
