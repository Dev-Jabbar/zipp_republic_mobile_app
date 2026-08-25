import { MOCK_PRODUCTS } from "@/constants/mockProducts";
import { Product } from "@/types/product";
import { isNewArrival } from "@/utils/product";

const GENDER_SLUGS = ["men", "women"];

// Simulated network latency, so the loading/skeleton states are actually
// visible during development instead of resolving in the same frame.
// Delete this (and the `await simulateNetworkDelay()` calls below) once a
// real fetch() replaces the bodies of getCollection/getProductSection —
// a real network call already has its own latency.
const MOCK_DELAY_MS = 700;

const simulateNetworkDelay = (signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timeout = setTimeout(resolve, MOCK_DELAY_MS);
    signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

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
 * Single seam between the UI and product data. Every screen/hook talks
 * to THIS function — never to MOCK_PRODUCTS directly. When a real backend
 * exists, replace the body below with something like:
 *
 *   const res = await fetch(`/api/products?${new URLSearchParams({
 *     slug: query.slug,
 *     ...(query.minPrice != null && { minPrice: String(query.minPrice) }),
 *     ...(query.maxPrice != null && { maxPrice: String(query.maxPrice) }),
 *     ...(query.inStockOnly && { inStock: "true" }),
 *     ...(query.sortBy && { sort: query.sortBy }),
 *   })}`);
 *   return res.json();
 *
 * No screen, hook, or component needs to change — they only ever call
 * getCollection(query) and read the CollectionResult shape.
 *
 * `signal` is a standard AbortSignal — when a real fetch() replaces the
 * body below, pass it straight through: fetch(url, { signal }). For now
 * it's used to cancel the simulated delay if a newer request supersedes
 * this one before it resolves.
 */
export async function getCollection(
  query: CollectionQuery,
  signal?: AbortSignal,
): Promise<CollectionResult> {
  await simulateNetworkDelay(signal);

  const base = GENDER_SLUGS.includes(query.slug)
    ? MOCK_PRODUCTS.filter((p) => p.gender === query.slug)
    : MOCK_PRODUCTS.filter((p) => p.category === query.slug);

  const priceBounds =
    base.length === 0
      ? { min: 0, max: 600000 }
      : {
          min: Math.floor(Math.min(...base.map((p) => p.price))),
          max: Math.ceil(Math.max(...base.map((p) => p.price))),
        };

  let result = base;

  if (query.minPrice !== undefined) {
    result = result.filter((p) => p.price >= query.minPrice!);
  }
  if (query.maxPrice !== undefined) {
    result = result.filter((p) => p.price <= query.maxPrice!);
  }

  // Product now has an optional inStock field (types/product.ts). Treat
  // a missing field as "in stock" (true) so existing mock items without
  // it don't get filtered out by accident.
  if (query.inStockOnly) {
    result = result.filter((p) => p.inStock !== false);
  }

  switch (query.sortBy) {
    case "az":
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "za":
      result = [...result].sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "price_low_high":
      result = [...result].sort((a, b) => a.price - b.price);
      break;
    case "price_high_low":
      result = [...result].sort((a, b) => b.price - a.price);
      break;
    case "date_new_old":
      result = [...result].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
    case "date_old_new":
      result = [...result].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      break;
    // "featured", "most_relevant", "best_selling" need real backend
    // signals (curation order, sales counts) mock data doesn't have —
    // left as the base collection order until there's a real API.
    default:
      break;
  }

  return {
    products: result,
    totalCount: base.length,
    priceBounds,
  };
}

export interface ProductSectionQuery {
  category?: string;
  isNewArrivals?: boolean;
  offset?: number;
  limit?: number;
}

/**
 * Same seam concept as getCollection, for the smaller horizontal-carousel
 * use case (home screen "New Arrivals", category rows, etc). Kept as a
 * separate function since its query shape (category OR new-arrivals,
 * offset/limit) doesn't match CollectionQuery's slug-based routing — but
 * when a real backend exists, this becomes a fetch() the same way.
 */
export async function getProductSection(
  query: ProductSectionQuery,
  signal?: AbortSignal,
): Promise<Product[]> {
  await simulateNetworkDelay(signal);

  const filtered = query.isNewArrivals
    ? MOCK_PRODUCTS.filter(isNewArrival)
    : MOCK_PRODUCTS.filter((p) => p.category === query.category);

  const offset = query.offset ?? 0;
  return query.limit
    ? filtered.slice(offset, offset + query.limit)
    : filtered.slice(offset);
}
