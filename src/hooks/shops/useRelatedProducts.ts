import { getRelatedProducts } from "@/services/productsApi";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";

/**
 * Fetches "You may also like" products for a given product. Pass null
 * while the main product is still loading — the hook simply won't fetch
 * until a real product is available (there's nothing to find related
 * items for yet).
 */
export function useRelatedProducts(product: Product | null, limit = 6) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!product) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getRelatedProducts(product, limit, controller.signal)
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [product?.id, limit]);

  return { products, loading, error };
}
