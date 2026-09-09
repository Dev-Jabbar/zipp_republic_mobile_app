import { getProduct } from "@/services/productsApi";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";

/**
 * Fetches one product by id for the product detail page. Same
 * AbortController cancellation pattern as useCollectionProducts/
 * useProductSection — see useCollectionProducts.ts for why.
 */
export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getProduct(id, controller.signal)
      .then((data) => {
        setProduct(data);
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
  }, [id]);

  return { product, loading, error };
}
