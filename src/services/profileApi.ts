import { auth, db } from "@/services/firebase";
import { Address } from "@/types/profile";
import { updateProfile } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  QueryDocumentSnapshot,
  setDoc,
} from "firebase/firestore";

const throwIfAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
};

const requireUid = (): string => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Must be signed in.");
  }
  return user.uid;
};

const userDocRef = (uid: string) => doc(db, "users", uid);
const addressesCollection = (uid: string) =>
  collection(db, "users", uid, "addresses");

const addressFromDoc = (
  docSnap: QueryDocumentSnapshot<DocumentData>,
): Address => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    fullName: data.fullName,
    phone: data.phone,
    address: data.address,
    city: data.city,
    state: data.state,
  };
};

export async function updateDisplayName(name: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Must be signed in.");
  }
  await updateProfile(user, { displayName: name });
}

export async function getMarketingPreference(
  signal?: AbortSignal,
): Promise<boolean> {
  const uid = requireUid();
  const snap = await getDoc(userDocRef(uid));
  throwIfAborted(signal);

  if (!snap.exists()) return true;
  const value = snap.data().marketingEmail;
  return typeof value === "boolean" ? value : true;
}

export async function setMarketingPreference(value: boolean): Promise<void> {
  const uid = requireUid();
  await setDoc(userDocRef(uid), { marketingEmail: value }, { merge: true });
}

export async function getAddresses(signal?: AbortSignal): Promise<Address[]> {
  const uid = requireUid();
  const snap = await getDocs(addressesCollection(uid));
  throwIfAborted(signal);
  return snap.docs.map(addressFromDoc);
}

export async function addAddress(
  address: Omit<Address, "id">,
): Promise<string> {
  const uid = requireUid();
  const docRef = await addDoc(addressesCollection(uid), address);
  return docRef.id;
}

export async function deleteAddress(addressId: string): Promise<void> {
  const uid = requireUid();
  await deleteDoc(doc(db, "users", uid, "addresses", addressId));
}
