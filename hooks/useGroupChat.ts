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
import { useCallback, useEffect } from 'react'
import { db } from '../config' // Import your Firebase configuration here

// Hook for sending messages

export const useSendMessage = () => {
  const sendMessage = useCallback(async (groupId, senderId, text) => {
    try {
      const messagesRef = collection(doc(db, 'groups', groupId), 'messages')
      await addDoc(messagesRef, {
        senderId,
        text,
        timestamp: serverTimestamp(),
      })
      console.log('Message sent to group:', groupId)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }, [])

  return sendMessage
}

// Hook for creating a group
export const useCreateGroup = () => {
  const createGroup = useCallback(async (groupName, memberIds) => {
    try {
      const groupRef = await addDoc(collection(db, 'groupChat'), {
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

// Hook for listening to messages in a group
export const useListenToMessages = (groupId, callback) => {
  useEffect(() => {
    if (!groupId) return

    const messagesRef = collection(doc(db, 'groups', groupId), 'messages')
    const messagesQuery = query(messagesRef, orderBy('timestamp'))

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      callback(messages)
    })

    return () => unsubscribe() // Cleanup listener on component unmount
  }, [groupId, callback])
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
  const getUserGroups = useCallback(async (userId) => {
    const groupsRef = collection(db, 'groups')
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
