import { auth } from '@/config'
import { signOut } from 'firebase/auth'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

const index = () => {
  return (
    <View className="flex-1 px-5 gap-10 bg-gray-200">
      <View className="bg-white p-5 rounded-lg flex justify-start flex-row gap-5 ">
        <View className="rounded-full w-12 h-12 bg-red-400" />
        <View>
          <Text className="text-sm">Jhon Doe</Text>
          <Text className="text-xs text-gray-400">Jhon Doe</Text>
        </View>
      </View>

      <View className="bg-white p-5 rounded-lg flex justify-start  gap-5  ">
        <Text>General</Text>
        <View>
          <View>
            <Text className="text-sm">Edit Profile</Text>
            <Text className="text-xs text-gray-200">Jhon Doe</Text>
          </View>
          <View>
            <Text className="text-sm">Change Password</Text>
            <Text className="text-xs text-gray-200">Jhon Doe</Text>
          </View>
          <View>
            <Text className="text-sm">Term of use</Text>
            <Text className="text-xs text-gray-200">Jhon Doe</Text>
          </View>
        </View>
      </View>
      <View className="bg-white p-5 rounded-lg flex justify-start  gap-5  ">
        <Text>Freferences</Text>
        <View>
          <Pressable onPress={() => signOut(auth)}>
            <Text className="text-sm">Logout</Text>
            <Text className="text-xs text-gray-400">
              Securly log out of account
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

export default index
