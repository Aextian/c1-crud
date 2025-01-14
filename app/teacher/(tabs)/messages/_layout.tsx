import { Ionicons } from '@expo/vector-icons'
import { Stack } from 'expo-router'
import React from 'react'
import { TouchableOpacity } from 'react-native'

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="group" options={{ headerShown: false }} />
      <Stack.Screen
        name="create-group"
        options={({ navigation }) => ({
          headerTitle: 'New Group',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
              }}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="add-note"
        options={{ headerTitle: 'New Note', presentation: 'modal' }}
      />
    </Stack>
  )
}
export default _layout
