import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'

const _layout = () => {
  return (
   <Tabs>
    <Tabs.Screen name="one" options={{ headerTitle: 'One',tabBarLabel: 'Tab one ' }} />
    <Tabs.Screen name="tow" options={{ title: 'Twosds' }} />
    <Tabs.Screen name="posts" options={{ headerShown:false,headerTitle: 'Posts',tabBarLabel: 'Post ' }} />
   </Tabs>
  )
}

export default _layout
