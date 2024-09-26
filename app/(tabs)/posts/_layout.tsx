import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const _layout = () => {
  return (
  //  <Stack>
  //   <Stack.Screen name="index" options={{ title: 'Posts' }} />
  //   <Stack.Screen name="[id]" options={{ headerTitle: 'Post Details' }} />
  //   </Stack>

  <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer>
        <Drawer.Screen
          name="index" // This is the name of the page and must match the url from root
          options={{
            drawerLabel: 'Home',
            title: 'overview',
          }}
        />
        <Drawer.Screen
          name="posts/[id]" // This is the name of the page and must match the url from root
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
