import { Feather } from '@expo/vector-icons'
import { Link, Stack, useRouter } from 'expo-router'
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
            <>
              <Link href={'/user/(todo)'} asChild>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 10,
                  }}
                >
                  <View className="flex flex-row gap-2 items-center">
                    <Text>Todo</Text>
                    <Feather name="book-open" size={24} color="#FFA500" />
                  </View>
                </TouchableOpacity>
              </Link>

              <Link href={'/user/(messages)/meeting'} asChild>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 10,
                  }}
                >
                  <View className="flex flex-row gap-2 items-center">
                    <Text>Meeting</Text>
                    <Feather name="users" size={24} color="#454552" />
                  </View>
                </TouchableOpacity>
              </Link>
            </>
          ),
        }}
      />
    </Stack>
  )
}
export default _layout
