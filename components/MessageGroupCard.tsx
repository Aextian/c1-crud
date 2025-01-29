import { db } from '@/config'
import { Feather } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import {
  DocumentData,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const MessageGroupCard = ({ group }: { group: DocumentData }) => {
  const router = useRouter()
  const [lastMessage, setLastMessage] = useState<string | null>(null)

  useEffect(() => {
    const groupRef = collection(db, 'groupChats', group.id, 'messages')
    const fetchLastMessage = () => {
      const q = query(groupRef, orderBy('createdAt', 'desc'), limit(1))
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
    const unsubscribeFromMessages = fetchLastMessage()
    return () => {
      unsubscribeFromMessages()
    }
  }, [group.id]) // Add conversation.id as a dependency

  const CONVERSATION_GROUP_PATH = '/user/(tabs)/messages/conversations/group'

  return (
    <Link
      href={{ pathname: CONVERSATION_GROUP_PATH, params: { id: group.id } }}
      asChild
    >
      <TouchableOpacity style={styles.messageCardContainer}>
        <View style={styles.messsageCardIcon}>
          <Feather name="users" size={24} color="black" />
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
          <Text>{group?.name}</Text>
          <Text className="text-xs text-gray-500" numberOfLines={1}>
            {lastMessage}{' '}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
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
    // borderColor: 'green',
    // borderWidth: 2,
    borderRadius: 100,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
export default MessageGroupCard
