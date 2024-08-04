// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // Your Firebase config here
  apiKey: "AIzaSyAW7sQMcQgFU-hdVTKuge54OPBQ0KfozIk",
  authDomain: "hackerthon-bc9c0.firebaseapp.com",
  projectId: "hackerthon-bc9c0",
  storageBucket: "hackerthon-bc9c0.appspot.com",
  messagingSenderId: "915023494487",
  appId: "1:915023494487:web:24f70dcb02d76bf5ba5212",
  measurementId: "G-7PP1T6YH97",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
