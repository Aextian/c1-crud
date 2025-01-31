import useRecordingStore from '@/store/useRecordingStore'
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'
import { IMessage } from 'react-native-gifted-chat'
import { auth, db } from '../config' // Import your Firebase configuration here
import useFileUpload from './useFileUpload'

// Hook for sending messages

export const useGroupMessage = (groupId: string) => {
  const [messages, setMessages] = useState<IMessage[]>([])
  const currenUser = auth?.currentUser

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
        image: doc.data().image,
        file: doc.data().file,
        audio: doc.data().audio,
      }))
      setMessages(allMessages)
    })
    return () => unsubscribe() // Cleanup subscription on unmount
  }, [groupId])

  const {
    shareFile,
    isAttachFile,
    isAttachImage,
    filePath,
    imagePath,
    fileType,
    setImagePath,
    setFilePath,
    resetState,
  } = useFileUpload()

  const { recordingUri, recording, setRecordingUri } = useRecordingStore()

  const onSend = useCallback(
    async (messages = [] as IMessage[]) => {
      const [messageToSend] = messages

      const messagesCollection = collection(
        db,
        'groupChats',
        groupId,
        'messages',
      )

      if (isAttachImage) {
        const newMessage = {
          _id: messages[0]._id + 1,
          text: messageToSend.text,
          createdAt: new Date(),
          user: messageToSend.user,
          image: imagePath,
          file: {
            url: '',
          },
        }

        await addDoc(messagesCollection, newMessage)
        resetState()
      } else if (isAttachFile) {
        const newMessage = {
          _id: messages[0]._id + 1,
          text: messageToSend.text,
          createdAt: new Date(),
          user: messageToSend.user,

          image: '',
          file: {
            url: filePath,
            type: fileType,
          },
        }
        await addDoc(messagesCollection, newMessage)
        setFilePath('')

        // setMessages((previousMessages) =>
        //   GiftedChat.append(previousMessages, newMessage),
        // )
        // resetState()
      } else if (recordingUri) {
        const newMessage = {
          _id: messages[0]._id + 1,
          text: messageToSend.text,
          createdAt: new Date(),
          user: messageToSend.user,

          image: '',
          file: {
            url: '',
            type: '',
          },
          audio: recordingUri,
        }
        await addDoc(messagesCollection, newMessage)
        setRecordingUri(null)
      } else {
        const newMessage = {
          _id: messageToSend._id,
          text: messageToSend.text,
          createdAt: new Date(),
          user: messageToSend.user,
        }
        await addDoc(messagesCollection, newMessage)
      }

      // add unread status
      const groupRef = doc(db, 'groupChats', groupId)
      // Fetch the document asynchronously
      const docGroup = await getDoc(groupRef)
      if (docGroup.exists()) {
        // Access the group data if it exists
        const groupData = docGroup.data()
        // Now you can use groupData, e.g., to get members
        const members = groupData.members.filter(
          (memberId: string) => memberId !== currenUser?.uid,
        )

        await updateDoc(groupRef, {
          unread: members,
        })
      } else {
        console.log('Group not found')
      }
    },
    [filePath, imagePath, isAttachFile, isAttachImage, recordingUri, groupId],
  )

  return {
    messages,
    onSend,
    isAttachFile,
    shareFile,
    isAttachImage,
    imagePath,
    filePath,
    setFilePath,
    setImagePath,
  }
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
    } catch (error) {
      console.error('Error adding member:', error)
    }
  }, [])

  return addMemberToGroup
}

// Hook for retrieving groups a user is part of
export const useGetUserGroups = (userId: string) => {
  const [userGroups, setUserGroups] = useState<any[]>([]) // Adjust the type as needed
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const groupsRef = collection(db, 'groupChats')
    const q = query(groupsRef, where('members', 'array-contains', userId))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const groups = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setUserGroups(groups)
      setLoading(false)
    })

    return () => unsubscribe() // Cleanup listener on unmount
  }, [userId])

  return { userGroups, loading }
}
