import { Stack } from 'expo-router'
import React from 'react'

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="answer-call-screen"
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="video-call-screen"
        options={{ headerShown: false, presentation: 'modal' }}
      />
    </Stack>
  )
}

export default _layout
