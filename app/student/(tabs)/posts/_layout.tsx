import { Stack } from 'expo-router'
import React from 'react'

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Facebook' }} />
    </Stack>
  )
}

export default _layout
