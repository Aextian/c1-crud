import React from 'react'
import { ScrollView, Text, View } from 'react-native'

const notifications = () => {
  return (
    <ScrollView style={{ flex: 1, paddingTop: 35, padding: 10 }}>
      <View className="mb-10">
        <Text className="text-2xl font-bold">Notifications</Text>
      </View>
      <View className="flex flex-row gap-5">
        <View className="rounded-full h-12 w-12 bg-black"></View>
        <View className="justify-center">
          <Text className="font-bold text-xs">Kimjhan</Text>
          <Text className="text-gray-500 pr-12" numberOfLines={1}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa,
            soluta? Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Ipsa, soluta? Lorem ipsum dolor sit amet consectetur adipisicing
            elit. Ipsa, soluta?
          </Text>
        </View>
      </View>
      <View className="flex flex-row gap-5 mt-10">
        <View className="rounded-full h-12 w-12 bg-black"></View>
        <View className="justify-center">
          <Text className="font-bold text-xs">Kimjhan</Text>
          <Text className="text-gray-500 pr-12" numberOfLines={1}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa,
            soluta? Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Ipsa, soluta? Lorem ipsum dolor sit amet consectetur adipisicing
            elit. Ipsa, soluta?
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default notifications
