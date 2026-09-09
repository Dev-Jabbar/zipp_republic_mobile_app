/**
 * Same field shape as ShippingAddress (types/order.ts) plus an `id` —
 * deliberately kept in sync so a saved address could later be used to
 * prefill checkout without a conversion step. Not wired into checkout
 * yet, just keeping the door open.
 */
export interface Address {
  id: string; // Firestore doc ID — trustworthy, app-created via addDoc
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}
