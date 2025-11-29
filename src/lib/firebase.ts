import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBuezWec1n1B5wi7xGLatgQ3Ausmtb345g",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: "wealthwise-v3-final",
  storageBucket: "wealthwise-v3-final.firebasestorage.app",
  messagingSenderId: "489414271056",
  appId: "1:489414271056:web:4c706525ef8a2b0149f155",
  measurementId: "G-PG5LJCYPNS"
};

// Initialize Firebase (Prevent double initialization in Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export the services so other files can use them
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
