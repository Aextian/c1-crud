import { TDataProps } from '@/app/admin/(tabs)/add-user'
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
    data: TDataProps,
    imageUrl: string,
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

      const formData = {
        _id: user.uid,
        name: name,
        email: email,
        avatar: imageUrl,
        role: data.role,
        year: data.year,
        section: data.section,
        providerData: user.providerData[0],
      }
      // Update user profile with display name
      await updateProfile(user, { displayName: name, photoURL: imageUrl })
      // Add user data to Firestore
      await setDoc(doc(db, 'users', user.uid), formData)

      // await signOut(auth) // Prevent auto-login

      setLoading(false)
      return user
    } catch (error: any) {
      setLoading(false)
      console.log(error)
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
