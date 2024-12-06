import { auth, db } from '@/config'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import {
  DocumentData,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const MessageCard = ({ conversation }: { conversation: DocumentData }) => {
  const router = useRouter()
  const currentUser = auth.currentUser
  const [user, setUser] = useState<DocumentData>()
  const [lastMessage, setLastMessage] = useState<string | null>(null)

  useEffect(() => {
    const docRef = doc(db, 'conversations', conversation.id)
    const messagesRef = collection(
      db,
      'conversations',
      conversation.id,
      'messages',
    )
    const fetchData = async () => {
      try {
        const docSnap = await getDoc(docRef) // Await the getDoc call

        if (docSnap.exists()) {
          // Document data found
          const usersId = docSnap.data().users
          const userId = usersId.find((id: string) => id !== currentUser?.uid)
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
    const fetchLastMessage = () => {
      const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(1))
      const unsubcribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const lastMessage = snapshot.docs[0].data()
          setLastMessage(lastMessage.text)
        } else {
          console.log('No messages found!')
        }
      })
      return unsubcribe
    }
    fetchData() // Call the async function
    const unsubscribeFromMessages = fetchLastMessage()
    return () => {
      unsubscribeFromMessages()
    }
  }, [conversation.id]) // Add conversation.id as a dependency

  const CONVERSATION_USER_PATH = '/teacher/(tabs)/messages/conversations/user'

  return (
    <TouchableOpacity
      style={styles.messageCardContainer}
      onPress={() =>
        router.push({
          pathname: CONVERSATION_USER_PATH,
          params: {
            id: conversation.id,
          },
        })
      }
    >
      <View style={styles.messsageCardIcon}>
        {user?.avatar ? (
          <Image
            source={{ uri: user?.avatar }}
            style={{ width: 45, height: 45, borderRadius: 100 }}
          />
        ) : (
          <Feather name="user" size={24} color="black" />
        )}
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
        <Text>{user?.name}</Text>
        <Text className="text-xs text-gray-500" numberOfLines={1}>
          {lastMessage}{' '}
        </Text>
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
