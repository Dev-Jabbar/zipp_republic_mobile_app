import { auth, db } from "@/services/firebase";
import { CartItem } from "@/store/useCartStore";
import { Order, OrderItem, PaymentInfo, ShippingAddress } from "@/types/order";
import {
  addDoc,
  collection,
  DocumentData,
  query as fsQuery,
  getDocs,
  orderBy,
  QueryDocumentSnapshot,
  where,
} from "firebase/firestore";

const ordersCollection = collection(db, "orders");

const throwIfAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
};

const cartItemsToOrderItems = (items: CartItem[]): OrderItem[] =>
  items.map((i) => {
    const raw = {
      id: i.id,
      name: i.name,
      image: typeof i.image === "string" ? i.image : undefined,
      price: i.price,
      size: i.size,
      color: i.color,
      quantity: i.quantity,
    };
    return Object.fromEntries(
      Object.entries(raw).filter(([, value]) => value !== undefined),
    ) as unknown as OrderItem;
  });

const orderFromDoc = (docSnap: QueryDocumentSnapshot<DocumentData>): Order => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    userId: data.userId,
    items: data.items,
    subtotal: data.subtotal,
    status: data.status,
    createdAt: data.createdAt,
    shippingAddress: data.shippingAddress,
    payment: data.payment,
  };
};

export async function createOrder(
  items: CartItem[],
  subtotal: number,
  shippingAddress: ShippingAddress,
  payment: PaymentInfo,
): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Must be signed in to place an order.");
  }

  const docRef = await addDoc(ordersCollection, {
    userId: user.uid,
    items: cartItemsToOrderItems(items),
    subtotal,
    status: "processing" as const,
    createdAt: new Date().toISOString(),
    shippingAddress,
    payment,
  });

  return docRef.id;
}

export async function getOrders(signal?: AbortSignal): Promise<Order[]> {
  const user = auth.currentUser;
  if (!user) return [];

  const snap = await getDocs(
    fsQuery(
      ordersCollection,
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    ),
  );

  throwIfAborted(signal);

  return snap.docs.map(orderFromDoc);
}
