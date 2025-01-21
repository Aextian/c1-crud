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
      user?.role === 'student'
        ? router.replace('/student/messages')
        : user?.role === 'teacher'
          ? router.replace('/teacher/posts')
          : user?.role === 'admin'
            ? router.replace('/admin/home')
            : null
    } else if (!currentUser && !inAuthGroup) {
      // router.replace('/auth/login')

      router.replace('/auth/login')
      // router.replace('/teacher/settings/profile')
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
      <Stack.Screen name="student" options={{ headerShown: false }} />
      <Stack.Screen name="teacher" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  )
}

export default _layout
