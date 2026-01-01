// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAzd8xZH_mgQys916tO02zt7OX2CT_Aoi0",
  authDomain: "chethancinemas-1120a.firebaseapp.com",
  projectId: "chethancinemas-1120a",
  storageBucket: "chethancinemas-1120a.firebasestorage.app",
  messagingSenderId: "120878206006",
  appId: "1:120878206006:web:00cb408c37658706e0dc97",
  measurementId: "G-5SDHP1GZBR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);