import { useAuthStore } from "@/store/useAuthStore";
import { Href, router } from "expo-router";
import { useEffect } from "react";

export function useRequireAuth() {
  const user = useAuthStore((s) => s.user);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const isLoggingOut = useAuthStore((s) => s.isLoggingOut);

  const isAuthenticated = !!user && !user.isAnonymous;

  useEffect(() => {
    if (isInitializing) return;
    if (isLoggingOut) return;

    if (!isAuthenticated) {
      router.push("/(auth)/login" as Href);
    }
  }, [isInitializing, isAuthenticated, isLoggingOut]);

  return { isAuthenticated };
}
