// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFT_qAl61jFaJAT-Xj26Y-exMIC7kRlyQ",
  authDomain: "elborracho-e4786.firebaseapp.com",
  projectId: "elborracho-e4786",
  storageBucket: "elborracho-e4786.appspot.com",
  messagingSenderId: "18148409746",
  appId: "1:18148409746:web:e0e72c4418145d4594014b",
  measurementId: "G-5ELH307RCJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);

export default app;
