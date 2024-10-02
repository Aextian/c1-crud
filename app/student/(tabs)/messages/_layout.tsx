import { Stack } from 'expo-router'
import React from 'react'

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* <Stack.Screen name="[chat]" options={{ headerTitle: '' }} /> */}
    </Stack>
  )
}

export default _layout
