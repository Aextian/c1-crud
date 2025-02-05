import { Stack } from 'expo-router'
import React from 'react'

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="comments/[id]"
        options={{ headerShown: false, presentation: 'transparentModal' }}
      />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="edit-post" options={{ headerShown: false }} />
      <Stack.Screen
        name="image-modal"
        options={{
          presentation: 'containedModal',
          animation: 'fade',
          headerShown: false,
        }}
      />
      <Stack.Screen name="calendar" options={{ headerTitle: 'Calendar' }} />
      <Stack.Screen name="view-post" options={{ headerTitle: '' }} />
    </Stack>
  )
}

export default _layout
