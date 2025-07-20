"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

// Define the Firebase config directly here for the provider
const firebaseConfig = {
  apiKey: "AIzaSyBCDXZdOagqQdL_rezpRmKTB1WSemhP8Tw",
  authDomain: "maktabat-al-amal.firebaseapp.com",
  projectId: "maktabat-al-amal",
  storageBucket: "maktabat-al-amal.firebasestorage.app",
  messagingSenderId: "679336450795",
  appId: "1:679336450795:web:335f75e95936ce670ffcae",
}

interface FirebaseContextType {
  app: ReturnType<typeof initializeApp> | null
  auth: ReturnType<typeof getAuth> | null
  db: ReturnType<typeof getFirestore> | null
  storage: ReturnType<typeof getStorage> | null
}

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  auth: null,
  db: null,
  storage: null,
})

export const useFirebase = () => useContext(FirebaseContext)

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [firebaseInitialized, setFirebaseInitialized] = useState(false)
  const [firebaseInstances, setFirebaseInstances] = useState<FirebaseContextType>({
    app: null,
    auth: null,
    db: null,
    storage: null,
  })

  useEffect(() => {
    if (!firebaseInitialized) {
      try {
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
        const auth = getAuth(app)
        const db = getFirestore(app)
        const storage = getStorage(app)

        setFirebaseInstances({ app, auth, db, storage })
        setFirebaseInitialized(true)
        console.log("Firebase initialized successfully in provider.")
      } catch (error) {
        console.error("Failed to initialize Firebase in provider:", error)
      }
    }
  }, [firebaseInitialized])

  return <FirebaseContext.Provider value={firebaseInstances}>{children}</FirebaseContext.Provider>
}
