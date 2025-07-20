"use client"

// hooks/use-auth.ts
import { useState } from "react"
import { signInWithEmailAndPassword, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/admin/dashboard") // Redirect to admin dashboard after successful login
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    setError(null)
    try {
      await signOut(auth)
      router.push("/admin") // Redirect to login page after logout
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { login, logout, loading, error }
}
