// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  // Your Firebase config here
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: "hackerthon-bc9c0",
  storageBucket: "hackerthon-bc9c0.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: "1:915023494487:web:24f70dcb02d76bf5ba5212",
  measurementId: "G-7PP1T6YH97",
  databaseURL: "https://hackerthon-bc9c0-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();

const database = getDatabase(app);

export const storage = getStorage(app);

export const firestore = getFirestore(app);

export const db = getFirestore(app);

export { database };
