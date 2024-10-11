import { auth, db } from '@/config'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import {
  DocumentData,
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

const UserList = () => {
  const [users, setUsers] = useState<DocumentData>([])
  const currentUser = auth.currentUser
  const router = useRouter() // Initialize the router

  useEffect(() => {
    const usersCollection = collection(db, 'users')
    const unsubscribe = onSnapshot(usersCollection, (querySnapshot) => {
      const usersData = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((user) => user.id !== currentUser?.uid)
      setUsers(usersData)
    })
    return unsubscribe
  }, [])

  const handleSelectUser = async (selectedUser: DocumentData) => {
    // Check if the conversation exists or create a new one
    const conversationCollection = query(
      collection(db, 'conversations'), // Use the db reference here
      where('users', 'array-contains', currentUser?.uid),
    )
    try {
      const querySnapshot = await getDocs(conversationCollection) // Use await to get the documents
      const conversation = querySnapshot.docs.find((doc) => {
        const users = doc.data().users
        // Check if the selected user is in the conversation
        return users.includes(selectedUser.id)
      })
      if (conversation) {
        router.push(`/student/messages/conversation/${conversation.id}`)
      } else {
        // Create a new conversation
        const docRef = await addDoc(collection(db, 'conversations'), {
          users: [currentUser?.uid, selectedUser.id], // Corrected document structure
        })
        router.push(`/student/messages/conversation/${docRef.id}`)
      }
    } catch (error) {
      console.error('Error fetching or creating conversation: ', error)
    }
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
      }}
    >
      {users.map((user: DocumentData) => (
        <TouchableOpacity
          key={user.id}
          style={{ marginRight: 10, alignItems: 'center' }}
          activeOpacity={0.8}
          onPress={() => handleSelectUser(user)}
        >
          <View className="item-center  h-16 w-16  justify-center border p-4 rounded-full">
            <Feather name="user" size={24} />
          </View>
          <Text className="text-[10px] text-center">{user.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

export default UserList
