import { getOrders } from "@/services/ordersApi";
import { Order } from "@/types/order";
import { useEffect, useState } from "react";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getOrders(controller.signal)
      .then((data) => setOrders(data))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("getOrders failed:", err); // TEMP — remove once root cause confirmed
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { orders, loading, error };
}
