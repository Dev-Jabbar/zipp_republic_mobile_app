import { auth } from "@/services/firebase";
import { AuthUser } from "@/types/auth";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { create } from "zustand";

interface AuthState {
  user: AuthUser | null;
  isInitializing: boolean;

  isLoggingOut: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitializing: true,
  isLoggingOut: false,
  setUser: (user) => set({ user }),
  logout: async () => {
    set({ isLoggingOut: true });
    router.replace("/(shop)");
    set({ user: null });

    try {
      await signOut(auth);
    } catch (err) {
      console.log("Sign out failed:", err);
    } finally {
      set({ isLoggingOut: false });
    }
  },
}));
