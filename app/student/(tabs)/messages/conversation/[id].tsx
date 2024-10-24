import CallScreen from '@/components/CallScreen'
import { auth, db } from '@/config'
import useMessages from '@/hooks/useMessages'
import { Ionicons } from '@expo/vector-icons'
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from 'expo-router'
import { DocumentData, doc, getDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

export default function ChatScreen() {
  const navigation = useNavigation()
  const currentUser = auth.currentUser
  const { id } = useLocalSearchParams()
  const { messages, onSend } = useMessages(id as string) // Pass the id to the custom hook
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
    const docRef = doc(db, 'conversations', String(id))
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
  }, [id])

  // const handleVideoCall = () => {
  //   console.log('click')
  //   return <CallScreen />
  // }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: user?.name || '',
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 10 }} // Adjust the margin if needed
              // onPress={() => handleVideoCall()}
            >
              <Ionicons name="videocam" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <CallScreen />
      {/* <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: currentUser?.uid ?? '',
          name: currentUser?.email ?? '',
        }}
      /> */}
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
