// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAzd8xZH_mgQys916tO02zt7OX2CT_Aoi0",
  authDomain: "chethancinemas-1120a.firebaseapp.com",
  projectId: "chethancinemas-1120a",

  // ✅ CORRECT STORAGE BUCKET
  storageBucket: "chethancinemas-1120a.firebasestorage.app",

  messagingSenderId: "120878206006",
  appId: "1:120878206006:web:00cb408c37658706e0dc97",
  measurementId: "G-5SDHP1GZBR",
};

// 🔥 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔥 SERVICES
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// (optional)
export const analytics = getAnalytics(app);

export default app;
