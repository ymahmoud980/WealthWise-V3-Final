import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ---------------------------------------------------------
// WealthWise V3 — Firebase config
//
// This file uses env vars when they exist, and otherwise falls back
// to the existing project values so the app boots out of the box
// for local preview.  These values are PUBLIC identifiers, not secrets
// (Firebase Web API keys are protected by Firestore rules + domain
// restrictions, not by being kept secret).  For production you should
// still create a domain-restricted key in the Firebase console and
// put it in .env.local.
// ---------------------------------------------------------

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            || "AIzaSyD235oKmaCDNC9sv1BetoBCn-5CyaNmmxk",
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        || "web-archive-harvester.firebaseapp.com",
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         || "web-archive-harvester",
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     || "web-archive-harvester.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "536596374039",
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID             || "1:536596374039:web:ca213c8c6159457e123252",
};

// Initialize Firebase (prevent double initialization in Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
