import { Stack } from 'expo-router'
import React from 'react'

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(messages)" options={{ headerShown: false }} />
      <Stack.Screen name="(posts)" options={{ headerShown: false }} />
    </Stack>
  )
}

export default _layout
