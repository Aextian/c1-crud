import { db } from '@/config'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { collection, DocumentData, getDocs, query } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const MessageCard = ({ conversation }: { conversation: DocumentData }) => {
  const router = useRouter()

  // Function to find the user

  const [user, setUser] = useState<DocumentData>()

  useEffect(() => {
    const fetchUser = async () => {
      // if (!conversation.id) return // Early return if no conversation ID
      try {
        // Query to find users in the conversation
        const userIdCollection = query(
          collection(db, 'conversations', conversation.id),
        )
        const querySnapshot = await getDocs(userIdCollection)

        if (querySnapshot.empty) {
          console.log('No users found in this conversation.')
          return
        }

        // Access the first user document in the results
        const userDoc = querySnapshot.docs[0]
        console.log('User Document:', userDoc)
        setUser(userDoc.data())
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    fetchUser()
  }, [])

  // console.log('user', user)

  return (
    <TouchableOpacity
      style={styles.messageCardContainer}
      onPress={() =>
        router.push({
          pathname: `/student/messages/conversation/[id]`,
          params: { id: conversation.id }, // Passing params as part of the object
        })
      }
    >
      <View style={styles.messsageCardIcon}>
        <Feather name="user" size={24} color="black" />
      </View>
      {/* content */}
      <View
        style={{
          flex: 1,
          alignItems: 'flex-start',
          marginLeft: 1,
          justifyContent: 'flex-start',
        }}
      >
        <Text>{conversation?.id}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  messageCardContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
  },
  messsageCardIcon: {
    width: 45,
    height: 45,
    borderColor: 'green',
    borderWidth: 2,
    borderRadius: 100,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
export default MessageCard
