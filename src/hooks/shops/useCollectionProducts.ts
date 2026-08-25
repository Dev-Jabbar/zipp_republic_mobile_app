import {
  CollectionQuery,
  CollectionResult,
  getCollection,
} from "@/services/productsApi";
import { useEffect, useState } from "react";

const EMPTY_RESULT: CollectionResult = {
  products: [],
  totalCount: 0,
  priceBounds: { min: 0, max: 600000 },
};

export function useCollectionProducts(query: CollectionQuery) {
  const [result, setResult] = useState<CollectionResult>(EMPTY_RESULT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getCollection(query, controller.signal)
      .then((data) => {
        setResult(data);
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
  }, [
    query.slug,
    query.minPrice,
    query.maxPrice,
    query.inStockOnly,
    query.sortBy,
  ]);

  return { ...result, loading, error };
}
