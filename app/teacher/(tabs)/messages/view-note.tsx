import { auth, db } from '@/config'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import {
  DocumentData,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const ViewNote = () => {
  const { user } = useLocalSearchParams<DocumentData>()

  const parsedUser = typeof user === 'string' ? JSON.parse(user) : user

  const router = useRouter()
  const currentUser = auth?.currentUser

  const navigateToChat = async () => {
    const conversationCollection = query(
      collection(db, 'conversations'), // Use the db reference here
      where('users', 'array-contains', currentUser?.uid),
    )
    try {
      const querySnapshot = await getDocs(conversationCollection) // Use await to get the documents
      const conversation = querySnapshot.docs.find((doc) => {
        const users = doc.data().users
        // Check if the selected user is in the conversation
        return users.includes(parsedUser._id)
      })
      router.push({
        pathname: `/teacher/(tabs)/messages/conversations/user`,
        params: {
          id: conversation?.id,
        },
      })
    } catch (error) {}
  }

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
          <TouchableOpacity
            className="bg-green-400 font-bold p-2 items-center rounded-xl w-full"
            onPress={navigateToChat}
          >
            <Text className="text-white text-2xl">Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}

export default ViewNote
