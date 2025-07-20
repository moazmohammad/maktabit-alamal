// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
// import { getAnalytics } from "firebase/analytics" // Ensure this is not imported

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBCDXZdOagqQdL_rezpRmKTB1WSemhP8Tw",
  authDomain: "maktabat-al-amal.firebaseapp.com",
  projectId: "maktabat-al-amal",
  storageBucket: "maktabat-al-amal.firebasestorage.app",
  messagingSenderId: "679336450795",
  appId: "1:679336450795:web:335f75e95936ce670ffcae",
  // measurementId: "G-4EE32JC5YX", // Ensure this is removed
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)
// const analytics = typeof window !== "undefined" && getAnalytics(app) // Ensure this is commented out or removed

export { app, auth, db, storage /*, analytics*/ } // Ensure analytics is not exported
