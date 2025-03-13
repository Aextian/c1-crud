import { Stack } from 'expo-router'
import React from 'react'

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="user/[id]" options={{ headerTitle: '' }} />
    </Stack>
  )
}

export default _layout
