import { Stack } from 'expo-router'
import React from 'react'

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="comments"
        options={{ headerShown: false, presentation: 'transparentModal' }}
      />
    </Stack>
  )
}

export default _layout
