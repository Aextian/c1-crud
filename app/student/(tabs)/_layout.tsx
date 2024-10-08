import TabBar from '@/components/tabBar'
import { Tabs } from 'expo-router'
import React from 'react'

const _layout = () => {
  return (
    <Tabs
      // screenOptions={{ tabBarHideOnKeyboard: true }}
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={({ route }) => ({
        tabBarStyle: {
          display: route.name === '/student/posts/add-post' ? 'none' : 'flex',
        },
      })}
    >
      <Tabs.Screen name="posts" options={{ headerShown: false }} />
      <Tabs.Screen
        name="messages"
        options={{ headerShown: false, tabBarHideOnKeyboard: true }}
      />
      <Tabs.Screen name="settings" options={{ headerShown: false }} />
    </Tabs>
  )
}

export default _layout
