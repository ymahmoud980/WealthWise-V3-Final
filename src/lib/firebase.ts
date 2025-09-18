// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

// Your web app's Firebase configuration - NOTE: Storage is no longer used for documents.
const firebaseConfig = {
  projectId: "wealthwise-03-09692965-e2a36",
  appId: "1:598104639129:web:d7a13196e6e0136feb5a08",
  storageBucket: "wealthwise-03-09692965-e2a36.appspot.com",
  apiKey: "AIzaSyAW1NOjMUD3cWYDDzTImM0d4T9JxEEPLsE",
  authDomain: "wealthwise-03-09692965-e2a36.firebaseapp.com",
  messagingSenderId: "598104639129"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db: Firestore = getFirestore(app);


export { app, db };
