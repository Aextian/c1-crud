import { auth, db } from '@/config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { signOut } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { useEffect } from 'react'

export const useActiveSessionListener = () => {
  const currentUser = auth?.currentUser
  useEffect(() => {
    if (!currentUser?.uid) return

    const userRef = doc(db, 'activeSessions', String(currentUser?.uid))

    const unsubscribe = onSnapshot(userRef, async (docSnapshot) => {
      if (!docSnapshot.exists()) return

      const storedDeviceId = await AsyncStorage.getItem('deviceId')
      const sessionDeviceId = docSnapshot.data()?.deviceId
      console.log('storedDeviceId', storedDeviceId)
      console.log('sessionDeviceId', sessionDeviceId)

      if (sessionDeviceId !== storedDeviceId) {
        alert(
          'You have been logged out because you signed in on another device.',
        )
        await signOut(auth)
        router.replace('/auth/login')
      }
    })

    return () => unsubscribe() // Cleanup function
  }, [db, auth, currentUser?.uid])
}
