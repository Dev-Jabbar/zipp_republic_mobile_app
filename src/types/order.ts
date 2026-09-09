// Destination: src/types/order.ts

/**
 * Snapshot of a cart line item at the moment an order is placed — NOT a
 * live reference to the product. If the product's price/name/image
 * changes later in Firestore, past orders should still show what the
 * customer actually saw and paid at checkout time.
 */
export interface OrderItem {
  id: string;
  name: string;
  // Always a plain URL string here, unlike CartItem.image (typed `any`
  // to tolerate local require() assets) — only live Firestore product
  // images ever reach checkout, so this narrows back down to string.
  image?: string;
  price: number;
  size?: string;
  color?: string;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

export type PaymentMethod = "card" | "bank_transfer" | "cash_on_delivery";

export interface PaymentInfo {
  method: PaymentMethod;
  // Display-only label, e.g. "Card payment (demo)" — never real card
  // details. There's no payment processor wired up yet; this exists so
  // the order history UI has something to show under "Payment".
  label: string;
}

export type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

export interface Order {
  // Safe to use the Firestore doc ID directly here (unlike Product) —
  // WE create these docs ourselves via addDoc in ordersApi.ts, so there's
  // no manual-console-entry mismatch to work around.
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  status: OrderStatus;
  createdAt: string; // ISO string
  shippingAddress: ShippingAddress;
  payment: PaymentInfo;
}
