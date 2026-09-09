import { db } from "@/services/firebase";
import { Product } from "@/types/product";
import { NEW_ARRIVAL_WINDOW_DAYS } from "@/utils/product";
import {
  collection,
  DocumentData,
  limit as fbLimit,
  query as fsQuery,
  getCountFromServer,
  getDocs,
  orderBy,
  QueryConstraint,
  QueryDocumentSnapshot,
  where,
} from "firebase/firestore";

const GENDER_SLUGS = ["men", "women"];

const productsCollection = collection(db, "products");

/**
 * `signal` no longer cancels the network request itself — Firestore's SDK
 * has no native AbortSignal support, so a request in flight will complete
 * regardless of `signal.aborted`. This just discards a result that resolves
 * after a newer request has superseded it, same contract the hooks already
 * expect (throws AbortError, which useCollectionProducts/useProduct/etc
 * already catch and ignore).
 */
const throwIfAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
};

/**
 * Maps a Firestore doc to our Product type. Deliberately reads `id` from
 * the document's DATA (the field we originally used as the mock id), not
 * from `docSnap.id` (the Firestore document ID) — the products were
 * entered manually in the console, so Firestore auto-generated the doc
 * IDs rather than using our own id values as doc IDs. Every lookup in
 * this file that needs "the product with id X" has to query the `id`
 * field, not read/pass around the Firestore doc ID.
 */
const productFromDoc = (
  docSnap: QueryDocumentSnapshot<DocumentData>,
): Product => {
  const data = docSnap.data();
  return {
    id: data.id,
    name: data.name,
    price: data.price,
    originalPrice: data.originalPrice,
    onSale: data.onSale,
    category: data.category,
    gender: data.gender,
    createdAt: data.createdAt,
    image: data.image,
    colors: data.colors,
    sizes: data.sizes,
    // Kept for safety even though every current doc has this written
    // explicitly (see project brief) — future manual/console additions
    // could still omit it.
    inStock: data.inStock ?? true,
  };
};

const buildBaseConstraints = (slug: string): QueryConstraint[] =>
  GENDER_SLUGS.includes(slug)
    ? [where("gender", "==", slug)]
    : [where("category", "==", slug)];

export type SortOption =
  | "featured"
  | "most_relevant"
  | "best_selling"
  | "az"
  | "za"
  | "price_low_high"
  | "price_high_low"
  | "date_old_new"
  | "date_new_old";

export interface CollectionQuery {
  slug: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: SortOption;
}

export interface CollectionResult {
  products: Product[];
  /** Count in the collection BEFORE price/stock filters (but after the
   * slug routing split) — used for "X of Y products" in the drawer. */
  totalCount: number;
  /** Real min/max price across the whole collection, unaffected by the
   * current filter selection — used to size the slider's track. */
  priceBounds: { min: number; max: number };
}

/**
 * Single seam between the UI and product data — now backed by Firestore.
 * No screen, hook, or component needs to change; they only ever call
 * getCollection(query) and read the CollectionResult shape, same as
 * when this read from MOCK_PRODUCTS.
 *
 * Some filter/sort combinations below (e.g. category + price range +
 * a sort) will need a Firestore composite index. Firestore's own error
 * message includes a direct console link to auto-create it the first
 * time an unsupported combo actually runs — not something to pre-build,
 * just expect it while testing each collection/sort combo.
 */
export async function getCollection(
  query: CollectionQuery,
  signal?: AbortSignal,
): Promise<CollectionResult> {
  const baseConstraints = buildBaseConstraints(query.slug);

  // priceBounds and totalCount are deliberately computed against the
  // BASE set only (gender/category split), ignoring price/stock filters
  // currently applied — same contract as the mock version, so the
  // slider's track and "X of Y" label don't shrink/jump as filters change.
  const [minSnap, maxSnap, countSnap] = await Promise.all([
    getDocs(
      fsQuery(
        productsCollection,
        ...baseConstraints,
        orderBy("price", "asc"),
        fbLimit(1),
      ),
    ),
    getDocs(
      fsQuery(
        productsCollection,
        ...baseConstraints,
        orderBy("price", "desc"),
        fbLimit(1),
      ),
    ),
    getCountFromServer(fsQuery(productsCollection, ...baseConstraints)),
  ]);

  throwIfAborted(signal);

  const priceBounds =
    minSnap.empty || maxSnap.empty
      ? { min: 0, max: 600000 }
      : {
          min: Math.floor(minSnap.docs[0].data().price),
          max: Math.ceil(maxSnap.docs[0].data().price),
        };

  const totalCount = countSnap.data().count;

  const constraints: QueryConstraint[] = [...baseConstraints];

  if (query.minPrice !== undefined) {
    constraints.push(where("price", ">=", query.minPrice));
  }
  if (query.maxPrice !== undefined) {
    constraints.push(where("price", "<=", query.maxPrice));
  }
  if (query.inStockOnly) {
    constraints.push(where("inStock", "==", true));
  }

  switch (query.sortBy) {
    case "price_low_high":
      constraints.push(orderBy("price", "asc"));
      break;
    case "price_high_low":
      constraints.push(orderBy("price", "desc"));
      break;
    case "date_new_old":
      constraints.push(orderBy("createdAt", "desc"));
      break;
    case "date_old_new":
      constraints.push(orderBy("createdAt", "asc"));
      break;
    // "az"/"za" need locale-aware string sort (localeCompare) that
    // Firestore's orderBy can't do natively — sorted client-side below,
    // same as "featured"/"most_relevant"/"best_selling" which still have
    // no real backend signal (curation order, sales counts) to sort by.
    default:
      break;
  }

  const snap = await getDocs(fsQuery(productsCollection, ...constraints));
  throwIfAborted(signal);

  let products = snap.docs.map(productFromDoc);

  if (query.sortBy === "az") {
    products = [...products].sort((a, b) => a.name.localeCompare(b.name));
  } else if (query.sortBy === "za") {
    products = [...products].sort((a, b) => b.name.localeCompare(a.name));
  }

  return { products, totalCount, priceBounds };
}

export interface ProductSectionQuery {
  category?: string;
  isNewArrivals?: boolean;
  offset?: number;
  limit?: number;
}

/**
 * Same seam concept as getCollection, for the smaller horizontal-carousel
 * use case (home screen "New Arrivals", category rows, etc).
 *
 * "New arrivals" used to be `MOCK_PRODUCTS.filter(isNewArrival)` computed
 * entirely in JS. That relative-time check (createdAt within the last N
 * days) translates to a Firestore range query since createdAt is stored
 * as a plain "YYYY-MM-DD" string and those sort correctly lexicographically:
 * where("createdAt", ">=", cutoffDateString). NEW_ARRIVAL_WINDOW_DAYS is
 * imported from utils/product.ts so the window stays in sync with
 * isNewArrival's own definition in one place.
 */
export async function getProductSection(
  query: ProductSectionQuery,
  signal?: AbortSignal,
): Promise<Product[]> {
  const constraints: QueryConstraint[] = [];

  if (query.isNewArrivals) {
    const cutoff = new Date(
      Date.now() - NEW_ARRIVAL_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    )
      .toISOString()
      .split("T")[0]; // "YYYY-MM-DD", matching the stored createdAt format
    constraints.push(
      where("createdAt", ">=", cutoff),
      orderBy("createdAt", "desc"),
    );
  } else if (query.category) {
    constraints.push(where("category", "==", query.category));
  }

  const offset = query.offset ?? 0;
  // Firestore has no native offset — pull a window big enough to cover
  // offset+limit and slice client-side, same end result as the mock's
  // array slice. Fine at this collection's size; would need a real
  // startAfter() cursor if the catalog grows much larger.
  if (query.limit !== undefined) {
    constraints.push(fbLimit(offset + query.limit));
  }

  const snap = await getDocs(fsQuery(productsCollection, ...constraints));
  throwIfAborted(signal);

  const products = snap.docs.map(productFromDoc);

  return query.limit
    ? products.slice(offset, offset + query.limit)
    : products.slice(offset);
}

/**
 * Fetches a single product by id — the product detail page's main data
 * source. Returns null (not an error) if no product matches, so the
 * screen can render a clean "not found" state instead of an error state.
 *
 * This is a QUERY (where "id" == id), not a doc(db, "products", id)
 * lookup, because the Firestore document IDs are auto-generated and no
 * longer match our own `id` field (see productFromDoc's comment above).
 */
export async function getProduct(
  id: string,
  signal?: AbortSignal,
): Promise<Product | null> {
  const snap = await getDocs(
    fsQuery(productsCollection, where("id", "==", id), fbLimit(1)),
  );
  throwIfAborted(signal);

  if (snap.empty) return null;
  return productFromDoc(snap.docs[0]);
}

export async function getRelatedProducts(
  product: Product,
  limit = 6,
  signal?: AbortSignal,
): Promise<Product[]> {
  // Fetch one extra so excluding the current product still leaves up to
  // `limit` results, same as the mock's filter-then-slice behavior.
  const snap = await getDocs(
    fsQuery(
      productsCollection,
      where("category", "==", product.category),
      fbLimit(limit + 1),
    ),
  );
  throwIfAborted(signal);

  return snap.docs
    .map(productFromDoc)
    .filter((p) => p.id !== product.id)
    .slice(0, limit);
}

export async function searchProducts(
  query: string,
  signal?: AbortSignal,
): Promise<Product[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const snap = await getDocs(productsCollection);
  throwIfAborted(signal);

  const lower = trimmed.toLowerCase();
  return snap.docs
    .map(productFromDoc)
    .filter((p) => p.name.toLowerCase().includes(lower));
}
