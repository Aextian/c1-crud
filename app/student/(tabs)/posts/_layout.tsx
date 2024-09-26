import { Drawer } from 'expo-router/drawer'
import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const _layout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer>
        <Drawer.Screen
          name="student/posts" // This is the name of the page and must match the url from root
          options={{
            drawerLabel: 'Home',
            title: 'overview',
          }}
        />
        <Drawer.Screen
          name="student/posts/[id]" // This is the name of the page and must match the url from root
          options={{
            drawerLabel: 'Posts Details',
            title: 'overview',
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  )
}

export default _layout
