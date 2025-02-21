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
        onPress={() => router.replace('/auth/login')}
        className="bg-blue-400 shadow-[0_4px_10px_rgba(0,0,0,0.8)]  shadow-black px-5 py-3 my-5 rounded-full w-10/12 mx-10 justify-center flex flex-row items-center"
      >
        <Text className="text-3xl font-bold text-white">Continue</Text>
      </TouchableOpacity>
    </View>
  )
}

export default index
