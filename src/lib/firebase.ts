import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Your web app's Firebase configuration
// ---------------------------------------------------------
// NOTE: This connects to the Firebase Project labeled "WealthWise V3 Final"
// The ID "web-archive-harvester" is correct! Do not change it.
// ---------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyD235oKmaCDNC9sv1BetoBCn-5CyaNmmxk",
  authDomain: "web-archive-harvester.firebaseapp.com",
  projectId: "web-archive-harvester",
  storageBucket: "web-archive-harvester.firebasestorage.app",
  messagingSenderId: "536596374039",
  appId: "1:536596374039:web:ca213c8c6159457e123252"
};

// Initialize Firebase (Prevent double initialization in Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export the services so other files can use them
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);