import LoadingScreen from '@/components/shared/loadingScreen'
import { auth, db } from '@/config'
import useAuth from '@/hooks/useAuth'
import { Stack } from 'expo-router'
import { usePreventScreenCapture } from 'expo-screen-capture'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import React, { useEffect } from 'react'
import { AppState, View } from 'react-native'
import Toast from 'react-native-toast-message'
import '../global.css'

const _layout = () => {
  // Function to track user presence
  usePreventScreenCapture()

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid)

        // Set user online when they log in
        await setDoc(
          userRef,
          { last_seen: serverTimestamp(), state: 'online' },
          { merge: true },
        )

        // Track app state changes (foreground/background)
        const handleAppStateChange = async (nextAppState: string) => {
          if (nextAppState === 'background' || nextAppState === 'inactive') {
            await updateDoc(userRef, {
              state: 'offline',
              last_seen: serverTimestamp(),
            })
          } else if (nextAppState === 'active') {
            await updateDoc(userRef, {
              state: 'online',
              last_seen: serverTimestamp(),
            })
          }
        }

        const appStateListener = AppState.addEventListener(
          'change',
          handleAppStateChange,
        )

        return () => {
          appStateListener.remove() // Cleanup listener
        }
      }
    })

    return () => unsubscribeAuth() // Cleanup auth listener
  }, [])

  const { loading, user } = useAuth()
  console.log('user', user)

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <>
      <View style={{ zIndex: 99999999 }}>
        <Toast />
      </View>
      <Stack>
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen
          name="auth/reset-password"
          options={{ headerTitle: 'Reset Password' }}
        />
        <Stack.Screen name="user" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </>
  )
}

export default _layout
