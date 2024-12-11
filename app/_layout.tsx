import LoadingScreen from '@/components/loadingScreen'
import useAuth from '@/hooks/useAuth'
import { Stack, useRouter, useSegments } from 'expo-router'
import React, { useEffect } from 'react'
import '../global.css'

const _layout = () => {
  const router = useRouter()
  const segments = useSegments()
  const { currentUser, loading, user } = useAuth()

  useEffect(() => {
    if (loading) return
    const inAuthGroup = segments[0] == 'auth'
    // if (currentUser && !inAuthGroup) {
    if (currentUser) {
      user?.role === 'student'
        ? router.replace('/student/messages')
        : user?.role === 'teacher'
          ? router.replace('/teacher/messages')
          : user?.role === 'admin'
            ? router.replace('/admin/home')
            : null
    } else if (!currentUser && !inAuthGroup) {
      router.replace('/auth/login')

      // router.replace('/auth/login')
      // router.replace('/student/videocall')
    }
  }, [currentUser, loading])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Stack>
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/signup" options={{ headerTitle: 'Signup' }} />
      <Stack.Screen name="student" options={{ headerShown: false }} />
      <Stack.Screen name="teacher" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  )
}

export default _layout
