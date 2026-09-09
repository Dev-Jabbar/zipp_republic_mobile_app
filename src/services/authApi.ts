import { getCartItems, mergeCartItems, setCartItems } from "@/services/cartApi";
import { AuthUser } from "@/types/auth";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";

export class AuthError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function toAuthUser(user: User): AuthUser {
  return {
    id: user.uid,
    name: user.displayName ?? "",
    email: user.email ?? "",
    isAnonymous: user.isAnonymous,
  };
}

function toAuthError(err: unknown): AuthError {
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code: string }).code)
      : "auth/unknown-error";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return new AuthError(
        "auth/wrong-password",
        "Incorrect email or password.",
      );
    case "auth/user-not-found":
      return new AuthError(
        "auth/user-not-found",
        "No account found with this email.",
      );
    case "auth/email-already-in-use":
    case "auth/credential-already-in-use":
      return new AuthError(
        "auth/email-already-in-use",
        "An account with this email already exists.",
      );
    case "auth/invalid-email":
      return new AuthError(
        "auth/invalid-email",
        "That email address looks invalid.",
      );
    case "auth/weak-password":
      return new AuthError(
        "auth/weak-password",
        "Password should be at least 6 characters.",
      );
    default:
      return new AuthError(code, "Something went wrong. Please try again.");
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<AuthUser> {
  try {
    const priorUser = auth.currentUser;
    const guestUid = priorUser && priorUser.isAnonymous ? priorUser.uid : null;
    const guestItems = guestUid ? await getCartItems(guestUid) : [];

    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );

    if (guestItems.length > 0) {
      const existingItems = await getCartItems(credential.user.uid);
      const merged = mergeCartItems(existingItems, guestItems);
      await setCartItems(credential.user.uid, merged);
    }

    return toAuthUser(credential.user);
  } catch (err) {
    console.log("RAW SIGN IN ERROR:", err);
    throw toAuthError(err);
  }
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  try {
    const current = auth.currentUser;
    let user: User;

    if (current && current.isAnonymous) {
      const emailCredential = EmailAuthProvider.credential(
        email.trim(),
        password,
      );
      const result = await linkWithCredential(current, emailCredential);
      user = result.user;
    } else {
      const result = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      user = result.user;
    }

    await updateProfile(user, { displayName: name.trim() });
    return toAuthUser({ ...user, displayName: name.trim() } as User);
  } catch (err) {
    console.log("RAW REGISTER ERROR:", err);
    throw toAuthError(err);
  }
}
