import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

// Initialize Firebase Admin
const app = getApps().length === 0 
  ? initializeApp({
      credential: cert(firebaseAdminConfig),
    })
  : getApps()[0]

export const auth = getAuth(app)
export const adminDb = getFirestore(app)

export default app
