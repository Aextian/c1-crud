import LoadingScreen from '@/components/loadingScreen'
import { auth } from '@/config'
import { Stack, useRouter, useSegments } from 'expo-router'
import React, { useEffect, useState } from 'react'

const _layout = () => {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)

  const [initializing, setInitializing] = useState(true)
  const segments = useSegments()
  const onAuthStateChanged = (user: any | null) => {
    setUser(user)
    if (initializing) setInitializing(false)
  }
  useEffect(() => {
    const subcriber = auth.onAuthStateChanged(onAuthStateChanged)
    return subcriber
  }, [])

  useEffect(() => {
    if (initializing) return
    const inAuthGroup = segments[0] == 'auth'
    if (user && !inAuthGroup) {
      router.replace('/student/posts')
    } else if (!user && !inAuthGroup) {
      router.replace('/auth/login')
    }
  }, [user, initializing])

  if (initializing) {
    return <LoadingScreen />
  }

  return (
    <Stack>
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen
        name="auth/register"
        options={{ headerTitle: 'Register' }}
      />
      <Stack.Screen name="student" options={{ headerShown: false }} />
    </Stack>
  )
}

export default _layout
