import TabBar from '@/components/tabBar'
import { auth } from '@/config'
import { Tabs } from 'expo-router'
import { signOut } from 'firebase/auth'
import React from 'react'
import { Button } from 'react-native'

const _layout = () => {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen
        name="one"
        options={{
          headerTitle: 'One',
          tabBarLabel: 'Tab one',
          headerRight: () => (
            <Button title="Logout" onPress={() => signOut(auth)} />
          ),
        }}
      />
      <Tabs.Screen name="tow" options={{ title: 'Twosds' }} />
      <Tabs.Screen
        name="posts"
        options={{
          headerShown: false,
          headerTitle: 'Posts',
          tabBarLabel: 'Post ',
        }}
      />
    </Tabs>
  )
}

export default _layout
