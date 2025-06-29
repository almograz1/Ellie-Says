// lib/firebaseAuth.ts
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '@/app/firebase'

export const signInWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider)
}
