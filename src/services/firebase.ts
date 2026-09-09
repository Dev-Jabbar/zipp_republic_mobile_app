import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import {
  // @ts-ignore
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCGHvKJ0dpkT1lkOU7b-UGc2Ntx8ZlsJ5w",
  authDomain: "zipp-republic.firebaseapp.com",
  projectId: "zipp-republic",
  storageBucket: "zipp-republic.firebasestorage.app",
  messagingSenderId: "1031701672540",
  appId: "1:1031701672540:web:b7fbfecd98d529e844ac99",
};

const app = initializeApp(firebaseConfig);

export const auth: Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db: Firestore = getFirestore(app);
