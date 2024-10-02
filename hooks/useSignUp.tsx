import { auth, db } from '@/config'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { useState } from 'react'

const useSignUp = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: string,
  ) => {
    setLoading(true)
    setError(null)
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      )
      const user = userCredential.user

      const data = {
        _id: user.uid,
        name: name,
        email: email,
        providerData: user.providerData[0],
      }
      // Update user profile with display name
      await updateProfile(user, { displayName: name })
      // Add user data to Firestore
      await setDoc(doc(db, 'users', user.uid), data)

      setLoading(false)
      return user
    } catch (error: any) {
      setLoading(false)
      // Handle specific Firebase Auth errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('This email is already in use!')
          break
        case 'auth/invalid-email':
          setError('The email address is not valid!')
          break
        case 'auth/weak-password':
          setError('The password is too weak!')
          break
        default:
          setError('Error registering: ' + error.message)
      }
    }
  }

  return { signUp, loading, error }
}

export default useSignUp
