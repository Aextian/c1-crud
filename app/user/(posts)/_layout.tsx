import { Stack, useRouter } from 'expo-router'
import React from 'react'

const _layout = () => {
  const router = useRouter()
  return (
    <Stack>
      <Stack.Screen name="calendar" options={{ headerTitle: '' }} />
      <Stack.Screen
        name="comment/[id]"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="edit"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen name="view-post" options={{ headerTitle: '' }} />
    </Stack>
  )
}
export default _layout
