import { Link, Stack, useLocalSearchParams } from 'expo-router'
import { DocumentData } from 'firebase/firestore'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const ViewNote = () => {
  const { user } = useLocalSearchParams<DocumentData>()
  const parsedUser = typeof user === 'string' ? JSON.parse(user) : user

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: `${parsedUser.name} `,
          presentation: 'modal',
        }}
      />

      <View style={{ flex: 1 }} className="flex flex-col gap-2 p-10">
        {/* Content Section */}
        <View className="flex-1 justify-start   w-full items-center">
          <View className="w-full p-5 h-36 shadow shadow-black bg-white rounded-xl">
            <Text>{parsedUser.note}</Text>
          </View>

          {/* Button Section */}
          <Link
            href={{
              pathname: `/user/(tabs)/messages/conversations/user`,
              params: {
                id: parsedUser?._id,
              },
            }}
            asChild
          >
            <TouchableOpacity className="bg-green-400 font-bold p-2 mt-10 items-center rounded-xl w-full">
              <Text className="text-white text-2xl">Chat</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </>
  )
}

export default ViewNote
