import { auth } from "@/services/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";

export const useIsAuthenticated = () =>
  useAuthStore((s) => !!s.user && !s.user.isAnonymous);

export function initializeAuthListener() {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (!firebaseUser) {
      useAuthStore.setState({ user: null, isInitializing: false });
      signInAnonymously(auth).catch((err) => {
        console.error("Anonymous sign-in failed:", err);
      });
      return;
    }

    useAuthStore.setState({
      user: {
        id: firebaseUser.uid,
        name: firebaseUser.displayName ?? "",
        email: firebaseUser.email ?? "",
        isAnonymous: firebaseUser.isAnonymous,
      },
      isInitializing: false,
    });

    useCartStore.getState().setActiveUid(firebaseUser.uid);
  });
}
