import { Feather, Ionicons } from '@expo/vector-icons'
import { Stack, useRouter } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const _layout = () => {
  const router = useRouter()
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: '',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/teacher/(tabs)/messages/todo-lists')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
              }}
            >
              <View className="flex flex-row gap-2 items-center">
                <Text>Todo</Text>
                <Feather name="book-open" size={24} color="green" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />
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
      <Stack.Screen name="search-user" options={{ headerTitle: '' }} />
    </Stack>
  )
}
export default _layout
