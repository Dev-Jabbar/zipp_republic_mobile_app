import {
  getMarketingPreference,
  setMarketingPreference,
} from "@/services/profileApi";
import { useEffect, useState } from "react";

export function useMarketingPreference() {
  // Defaults true so the switch doesn't flash "off" while the real
  // value is still loading — matches getMarketingPreference's own
  // documented default for a missing doc/field.
  const [value, setValue] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    getMarketingPreference(controller.signal)
      .then((v) => setValue(v))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        // Non-critical — a failed read here just means the switch keeps
        // its optimistic default rather than blocking the whole screen
        // with AsyncBoundary's error state over one toggle.
        console.error("getMarketingPreference failed:", err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  // Optimistic — flips immediately, persists in the background. Reverts
  // back on failure so the UI doesn't silently drift from Firestore.
  const toggle = async (next: boolean) => {
    setValue(next);
    try {
      await setMarketingPreference(next);
    } catch (err) {
      console.error("setMarketingPreference failed:", err);
      setValue(!next);
    }
  };

  return { value, loading, toggle };
}
