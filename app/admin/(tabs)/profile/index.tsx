import { auth } from '@/config'
import { signOut } from 'firebase/auth'
import React from 'react'
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native'

const index = () => {
  return (
    <SafeAreaView className="flex-1 px-5 gap-10 bg-gray-200 ">
      <View className="bg-white p-5 mt-20 rounded-2xl flex justify-start flex-row gap-5 ">
        <View className="rounded-full w-12 h-12 bg-red-300" />
        <View>
          <Text className="text-sm">Admin</Text>
          <Text className="text-xs text-gray-400">admin@example.com</Text>
        </View>
      </View>

      <View className="bg-white p-5 rounded-lg flex justify-start  gap-5  ">
        <Text>Freferences</Text>
        <View>
          <TouchableOpacity onPress={() => signOut(auth)}>
            <Text className="text-sm">Log out</Text>
            <Text className="text-xs text-gray-400">
              Securly log out of account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default index
