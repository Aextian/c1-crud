import { View, Text, Button } from 'react-native'
import React from 'react'
import { Stack, useRouter } from 'expo-router'

const one = () => {
    const router = useRouter()
  return (
    <View>
      <Text>one</Text>
      <Button title='Go back' onPress={() => router.back()} />
    </View>
  )
}

export default one
