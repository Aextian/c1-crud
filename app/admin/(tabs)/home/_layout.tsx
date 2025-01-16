import { Stack } from 'expo-router'
import React from 'react'

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />

      <Stack.Screen
        name="manage-posts"
        options={{ headerTitle: 'Manage Posts' }}
      />
      <Stack.Screen
        name="manage-course"
        options={{ headerTitle: 'Manage Course' }}
      />
      <Stack.Screen
        name="manage-year-level"
        options={{ headerTitle: 'Manage Year' }}
      />
    </Stack>
  )
}

export default _layout
