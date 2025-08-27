// src/firebaseConfig.js
// Place this file in src/

// Import Firebase functions you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase app configuration object (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyAxHZeTDr94S7cbBah9RZd0-5XBV_EBxK4",
  authDomain: "ishika-gst.firebaseapp.com",
  projectId: "ishika-gst",
  storageBucket: "ishika-gst.appspot.com",
  messagingSenderId: "691326701729",
  appId: "1:691326701729:web:19f09c850e85babdb8e0e0",
  measurementId: "G-M72SCMXWDF"
};

// Initialize Firebase app instance
const app = initializeApp(firebaseConfig);

// Export Firebase authentication and firestore database instances
export const auth = getAuth(app);
export const db = getFirestore(app);
