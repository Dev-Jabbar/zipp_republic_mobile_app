import {
  AuthError,
  register as registerRequest,
  signIn as signInRequest,
} from "@/services/authApi";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";

export function useAuth() {
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | Error | null>(null);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInRequest(email, password);
      setUser(user);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await registerRequest(name, email, password);
      setUser(user);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { signIn, register, loading, error };
}
