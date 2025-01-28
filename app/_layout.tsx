import LoadingScreen from '@/components/loadingScreen'
import { auth } from '@/config'
import useAuth from '@/hooks/useAuth'
import { Stack, useRouter, useSegments } from 'expo-router'
import React, { useEffect } from 'react'
import '../global.css'

const _layout = () => {
  const router = useRouter()
  const segments = useSegments()
  const { loading, user } = useAuth()

  const currentUser = auth.currentUser

  useEffect(() => {
    if (loading) return
    const inAuthGroup = segments[0] == 'auth'

    if (currentUser && user) {
      user?.role === 'admin'
        ? router.replace('/admin/home')
        : router.replace('/user/posts')
    } else if (!currentUser && !inAuthGroup) {
      router.replace('/auth/login')
    }
  }, [currentUser, loading, user])

  if (loading) {
    return <LoadingScreen />
  }

  return (
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
  )
}

export default _layout
