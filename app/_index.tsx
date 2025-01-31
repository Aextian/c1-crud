import { useRouter } from 'expo-router'
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
const index = () => {
  const router = useRouter()

  return (
    <View className="flex-1 items-center gap-10 justify-center">
      <Image
        className="h-96 w-96"
        source={require('../assets/images/logo.png')}
      />

      <TouchableOpacity
        onPress={() => router.push('/auth/login')}
        className="p-5  border-green-500 border-2 items-center rounded-3xl  w-10/12"
      >
        <Text className="text-3xl font-bold text-green-500">Login</Text>
      </TouchableOpacity>
    </View>
  )
}

export default index
