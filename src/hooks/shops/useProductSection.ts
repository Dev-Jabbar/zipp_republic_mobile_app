import { getProductSection, ProductSectionQuery } from "@/services/productsApi";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";

export function useProductSection(query: ProductSectionQuery) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getProductSection(query, controller.signal)
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
  }, [query.category, query.isNewArrivals, query.offset, query.limit]);

  return { products, loading, error };
}
