import {
  addAddress as addAddressApi,
  deleteAddress as deleteAddressApi,
  getAddresses,
} from "@/services/profileApi";
import { Address } from "@/types/profile";
import { useCallback, useEffect, useState } from "react";

/**
 * Same loading/error contract as the other data-fetching hooks, plus
 * addAddress/deleteAddress actions that refetch afterward — there's no
 * real-time listener here (no onSnapshot anywhere else in the app
 * either), so a manual refetch after a write is the established pattern.
 */
export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback((signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    return getAddresses(signal)
      .then((data) => setAddresses(data))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!signal?.aborted) setLoading(false);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const addAddress = async (address: Omit<Address, "id">) => {
    await addAddressApi(address);
    await load();
  };

  const deleteAddress = async (id: string) => {
    await deleteAddressApi(id);
    await load();
  };

  return { addresses, loading, error, addAddress, deleteAddress };
}
