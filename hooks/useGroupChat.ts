import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'
import { IMessage } from 'react-native-gifted-chat'
import { db } from '../config' // Import your Firebase configuration here

// Hook for sending messages

export const useGroupMessage = (groupId: string) => {
  const [messages, setMessages] = useState<IMessage[]>([])

  useEffect(() => {
    if (!groupId) return // Check if conversationId is valid

    const messagesCollection = collection(db, 'groupChats', groupId, 'messages')
    const messagesQuery = query(
      messagesCollection,
      orderBy('createdAt', 'desc'),
    )

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => ({
        _id: doc.id,
        text: doc.data().text,
        createdAt: doc.data().createdAt.toDate(),
        user: doc.data().user,
      }))
      setMessages(allMessages)
    })

    return () => unsubscribe() // Cleanup subscription on unmount
  }, [groupId])

  const onSend = useCallback(
    async (messages: IMessage[] = []) => {
      if (messages.length === 0) return // Ensure there is a message to send
      const { createdAt, text, user } = messages[0]
      try {
        // Reference to the messages collection
        const messagesCollection = collection(
          db,
          'groupChats',
          groupId,
          'messages',
        )
        // Add a new message document to Firestore
        await addDoc(messagesCollection, {
          createdAt,
          text,
          user,
        })
        // setMessages((previousMessages) =>
        //   GiftedChat.append(previousMessages, messages),
        // )
      } catch (error) {
        console.error('Error sending message: ', error)
        alert(error)
      }
    },
    [groupId],
  )

  return { messages, onSend }
}

// Hook for creating a group
export const useCreateGroup = () => {
  const createGroup = useCallback(async (groupName, memberIds) => {
    try {
      const groupRef = await addDoc(collection(db, 'groupChats'), {
        name: groupName,
        members: memberIds,
        createdAt: serverTimestamp(),
      })
      console.log('Group created with ID:', groupRef.id)
      return groupRef.id
    } catch (error) {
      console.error('Error creating group:', error)
    }
  }, [])

  return createGroup
}

// Hook for adding a member to a group
export const useAddMemberToGroup = () => {
  const addMemberToGroup = useCallback(async (groupId, userId) => {
    try {
      const groupRef = doc(db, 'groups', groupId)
      await updateDoc(groupRef, {
        members: arrayUnion(userId),
      })
      console.log('Member added to group:', groupId)
    } catch (error) {
      console.error('Error adding member:', error)
    }
  }, [])

  return addMemberToGroup
}

// Hook for retrieving groups a user is part of
export const useGetUserGroups = () => {
  const getUserGroups = useCallback(async (userId: string) => {
    if (!userId) return [] // Ensure userId is defined
    const groupsRef = collection(db, 'groupChats')
    const q = query(groupsRef, where('members', 'array-contains', userId))
    const querySnapshot = await getDocs(q)
    const userGroups = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    return userGroups
  }, [])

  return getUserGroups
}
