
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import { 
  getAuth, 
  onAuthStateChanged, 
  type User, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from "firebase/auth";
import type { FinancialData } from './types';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 && firebaseConfig.apiKey ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

const DATA_COLLECTION_ID = 'userData';
const USER_COLLECTION_ID = 'users';

export const getFinancialDataFromFirestore = async (userId: string): Promise<FinancialData | null> => {
    if (!userId) return null;
    const dataDocRef = doc(db, DATA_COLLECTION_ID, userId);
    try {
        const docSnap = await getDoc(dataDocRef);
        if (docSnap.exists()) {
            return docSnap.data() as FinancialData;
        } else {
            console.log("No such document for user:", userId);
            return null;
        }
    } catch (error) {
        console.error("Error getting document:", error);
        return null;
    }
};

export const saveFinancialDataToFirestore = async (userId: string, data: FinancialData) => {
    if (!userId) return;
    const dataDocRef = doc(db, DATA_COLLECTION_ID, userId);
    try {
        await setDoc(dataDocRef, data, { merge: true });
    } catch (error) {
        console.error("Error writing document: ", error);
    }
};

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update Firebase Auth profile
  await updateProfile(user, { displayName: name });

  // Create user document in Firestore
  const userDocRef = doc(db, USER_COLLECTION_ID, user.uid);
  await setDoc(userDocRef, {
    name: name,
    email: user.email,
    role: 'user',
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });

  return userCredential;
};

export const signInWithEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);

  // Update last login timestamp
  const userDocRef = doc(db, USER_COLLECTION_ID, userCredential.user.uid);
  await setDoc(userDocRef, {
    lastLoginAt: serverTimestamp(),
  }, { merge: true });

  return userCredential;
};

export const signOut = () => {
  return firebaseSignOut(auth);
};


export { auth, onAuthStateChanged, db, doc, getDoc };
export type { User };
