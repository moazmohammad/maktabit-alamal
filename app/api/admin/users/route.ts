import { NextResponse } from "next/server"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG as string)
    initializeApp({
      credential: cert(serviceAccount),
    })
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error)
    // It's crucial to handle this error properly, perhaps by throwing it
    // or returning an error response immediately if initialization fails.
    // For now, we'll just log and let the subsequent code potentially fail.
  }
}

export async function GET() {
  try {
    const auth = getAuth()
    const listUsersResult = await auth.listUsers(1000) // Fetch up to 1000 users

    const users = listUsersResult.users.map((userRecord) => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      disabled: userRecord.disabled,
      emailVerified: userRecord.emailVerified,
      creationTime: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime,
    }))

    return NextResponse.json({ users }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ message: "Failed to fetch users", error: error.message }, { status: 500 })
  }
}
