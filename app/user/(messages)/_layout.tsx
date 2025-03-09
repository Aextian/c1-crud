import { Stack, useRouter } from 'expo-router'
import React from 'react'

const _layout = () => {
  const router = useRouter()
  return (
    <Stack>
      <Stack.Screen name="search" options={{ headerTitle: '' }} />
    </Stack>
  )
}
export default _layout
