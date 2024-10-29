import { Stack } from 'expo-router'
import React from 'react'

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="group" options={{ headerShown: false }} />
      <Stack.Screen
        name="create-group"
        options={{ headerTitle: 'New Group' }}
      />
    </Stack>
  )
}
export default _layout
