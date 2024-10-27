import { auth, db } from '@/config'
import useMessages from '@/hooks/useMessages'
import { Ionicons } from '@expo/vector-icons'
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from 'expo-router'
import { DocumentData, doc, getDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { GiftedChat } from 'react-native-gifted-chat'

export default function ChatScreen() {
  const navigation = useNavigation()
  const currentUser = auth.currentUser
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>()
  const { messages, onSend } = useMessages(conversationId) // Pass the id to the custom hook
  const [user, setUser] = useState<DocumentData>()

  useFocusEffect(
    React.useCallback(() => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } })
      return () => {
        navigation.getParent()?.setOptions({ tabBarStyle: styles.tabBar })
      }
    }, [navigation]),
  )
  useEffect(() => {
    const docRef = doc(db, 'conversations', String(conversationId))
    const fetchData = async () => {
      try {
        const docSnap = await getDoc(docRef) // Await the getDoc call
        if (docSnap.exists()) {
          // Document data found
          const usersId = docSnap.data().users
          const userId = usersId.find((ids: string) => ids !== currentUser?.uid)
          const userRef = doc(db, 'users', userId)
          const userSnap = await getDoc(userRef) // Await the getDoc call
          const userData = userSnap.data()
          setUser(userData)
        } else {
          // Document not found
          console.log('No such document!')
        }
      } catch (error) {
        console.error('Error fetching document:', error)
      }
    }

    fetchData()
  }, [conversationId])

  const router = useRouter()

  // const handleNavigation = () => {
  //   const conversationId = "123"; // Example conversation ID
  //   router.push({
  //     pathname: '/student/(tabs)/messages/videoCalls/callId/[conversationId]',
  //     params: { conversationId }, // Pass dynamic conversationId
  //   });
  // };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: user?.name || '',
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 10 }} // Adjust the margin if needed
              onPress={() =>
                // router.push(
                //   // @ts-expect-error
                //   `/student/(tabs)/messages/video-calls/${user._id}`,
                // )

                router.push({
                  pathname:
                    '/student/(tabs)/messages/video-calls/video-call-screen',
                  params: {
                    callId: user?._id,
                  },
                })
              }
            >
              <Ionicons name="videocam" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: currentUser?.uid ?? '',
          name: currentUser?.email ?? '',
        }}
      />
    </>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute', // Make it absolute to position it correctly
    bottom: 10, // Position from the bottom
    left: 20, // Add left margin
    right: 20, // Add right margin
    justifyContent: 'space-between', // Space items evenly
    alignItems: 'center', // Center items vertically
    backgroundColor: '#fff', // Background color
    borderRadius: 25, // Rounded corners
    shadowColor: 'black', // Shadow color
    shadowOffset: { width: 0, height: 10 }, // Shadow offset
    shadowRadius: 10, // Shadow blur
    shadowOpacity: 0.1, // Shadow opacity
    elevation: 5, // Android shadow elevation
  },
})
