import { useRouter } from 'expo-router'
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

const index = () => {
  const router = useRouter()

  return (
    <View className="flex-1 items-center bg-white gap-10 justify-center">
      <View className="flex items-center justify-between  w-full">
        <Image
          // className="h-64 w-64"
          // style={{ height: 300, width: '100%' }}
          style={{ height: 150, width: '80%' }} // Dynamic image size
          source={require('../assets/images/logo.png')}
          resizeMode="contain"
        />
        <Image
          style={{ height: 150, width: '80%' }} // Dynamic image size
          source={require('../assets/images/wetext.png')}
          resizeMode="contain"
        />
        {/* <Text style={{ fontSize: 55, fontWeight: 'bold', fontFamily: 'serif' }}>
          WeConnect
        </Text> */}
        <View></View>
      </View>

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
