import { db } from "@/services/firebase";
import { CartItem } from "@/store/useCartStore";
import { doc, getDoc, setDoc } from "firebase/firestore";

const cartDocRef = (uid: string) => doc(db, "carts", uid);

const stripUndefined = <T extends Record<string, unknown>>(obj: T): T =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as T;

const isSameLine = (
  a: Pick<CartItem, "id" | "size" | "color">,
  b: Pick<CartItem, "id" | "size" | "color">,
) => a.id === b.id && a.size === b.size && a.color === b.color;

export async function getCartItems(uid: string): Promise<CartItem[]> {
  const snap = await getDoc(cartDocRef(uid));
  if (!snap.exists()) return [];
  const data = snap.data();
  return Array.isArray(data.items) ? data.items : [];
}

export async function setCartItems(
  uid: string,
  items: CartItem[],
): Promise<void> {
  const cleaned = items.map((item) => stripUndefined({ ...item }));
  await setDoc(cartDocRef(uid), { items: cleaned });
}

export function mergeCartItems(
  existing: CartItem[],
  incoming: CartItem[],
): CartItem[] {
  const merged = existing.map((i) => ({ ...i }));
  for (const item of incoming) {
    const match = merged.find((m) => isSameLine(m, item));
    if (match) {
      match.quantity += item.quantity;
    } else {
      merged.push({ ...item });
    }
  }
  return merged;
}
