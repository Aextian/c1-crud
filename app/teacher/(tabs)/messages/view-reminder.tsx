import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
import { Stack } from 'expo-router'
import React from 'react'
import { SafeAreaView, TextInput, View } from 'react-native'

const Reminder = () => {
  useHideTabBarOnFocus()
  return (
    <SafeAreaView className="flex flex-col gap-5 px-5 mt-5">
      <Stack.Screen
        options={{
          headerTitle: 'New Note',
          presentation: 'modal',
        }}
      />
      <View className="flex flex-col gap-2">
        <View className="w-full p-2 h-36 shadow shadow-black bg-white rounded-xl">
          <TextInput
            // value={note}
            // onChangeText={(text) => setNote(text)}
            multiline
            numberOfLines={4}
            className="p-2"
            placeholder="Note"
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Reminder
