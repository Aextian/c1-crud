import { Feather, Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

const profile = () => {
  const router = useRouter()
  return (
    <View style={{ flex: 1, gap: 10 }}>
      <View className="h-48  w-full bg-gray-400">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-0 left-5"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity className="absolute bottom-2 right-2 ">
          <Ionicons name="images-sharp" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View className="flex flex-row gap-10 absolute top-36 w-full justify-center items-center">
        <View className="flex flex-col gap-5 items-center">
          <Image
            className="h-36 w-36 rounded-full  border-4 border-white"
            source={require('../../../../assets/images/user-image.jpg')}
          />
          <Text className="text-2xl font-semibold">Juan Dela Cruz</Text>
          <View className="flex flex-row gap-10">
            <View className="flex flex-col items-center">
              <Text className="font-bold text-2xl">12k</Text>
              <Text>Posts</Text>
            </View>
            <View className="flex flex-col items-center">
              <Text className="font-bold text-2xl">12k</Text>
              <Text>Likes</Text>
            </View>
            <View className="flex flex-col items-center">
              <Text className="font-bold text-2xl">12k</Text>

              <Text>Dislike</Text>
            </View>
          </View>
          <View className="flex flex-row gap-5">
            <TouchableOpacity className="bg-blue-900 px-5 py-2 rounded-xl flex flex-row items-center gap-5">
              <Ionicons name="create" size={24} color="white" />
              <Text className="text-lg font-semibold text-white">
                Edit Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-green-200 px-5 py-2 rounded-xl flex flex-row items-center gap-5">
              <Feather name="message-square" size={24} color="black" />
              <Text className="text-lg font-semibold">Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}

export default profile
