import CustomInputToolbar from '@/components/CustomeToolbar'
import InChatFileTransfer from '@/components/inChatFileTransfer'
import InChatViewFile from '@/components/inChatViewFile'
import MessageAudio from '@/components/MessageAudio'
import { auth, db } from '@/config'
import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
import useMessages from '@/hooks/useMessages'
import useRenderGiftedChat from '@/hooks/useRenderGiftedChat'
import useRecordingStore from '@/store/useRecordingStore'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import {
  addDoc,
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import React, { useCallback, useEffect, useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { GiftedChat } from 'react-native-gifted-chat'

export default function userConversation() {
  useHideTabBarOnFocus()
  const { id } = useLocalSearchParams<{ id: string }>() //selected user id
  const [conversationId, setConversationId] = useState<string>('')

  const [user, setUser] = useState<DocumentData>()
  const currentUser = auth.currentUser

  useEffect(() => {
    const updateConversation = async () => {
      await updateDoc(doc(db, 'conversations', conversationId), {
        isRead: true,
      })
    }

    if (conversationId) {
      updateConversation()
    }
  }, [conversationId])

  useEffect(() => {
    if (!currentUser?.uid || !id) return
    const conversationCollection = query(
      collection(db, 'conversations'),
      where('users', 'array-contains', currentUser?.uid),
    )

    const fetchConversation = async () => {
      try {
        // Fetch all conversations for the current user
        const querySnapshot = await getDocs(conversationCollection)
        const conversation = querySnapshot.docs.find((doc) => {
          const users = doc.data().users
          // Check if the selected user (id) is in the conversation
          return users.includes(id)
        })

        if (conversation && conversation.exists()) {
          setConversationId(conversation.id)
          // Conversation exists
          const docRef = doc(db, 'conversations', conversation.id)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            const usersId = docSnap.data().users
            const userId = usersId.find(
              (ids: string) => ids !== currentUser?.uid,
            )
            const userRef = doc(db, 'users', userId)
            const userSnap = await getDoc(userRef)
            const userData = userSnap.data()
            setUser(userData)
          }
        } else {
          // No conversation found, create one
          const conversationRef = await addDoc(
            collection(db, 'conversations'),
            {
              users: [currentUser?.uid, id], // Corrected document structure
            },
          )
          setConversationId(conversationRef.id)
          const docSnap = await getDoc(conversationRef)
          if (docSnap.exists()) {
            const usersId = docSnap.data().users
            const userId = usersId.find(
              (ids: string) => ids !== currentUser?.uid,
            )
            const userRef = doc(db, 'users', userId)
            const userSnap = await getDoc(userRef)
            const userData = userSnap.data()
            setUser(userData)
          }
        }
      } catch (error) {
        console.error('Error fetching or creating conversation:', error)
      }
    }

    fetchConversation()
  }, [id, currentUser?.uid])

  const {
    messages,
    onSend,
    isAttachFile,
    shareFile,
    isAttachImage,
    imagePath,
    filePath,
    setFilePath,
    setImagePath,
  } = useMessages(conversationId) // Pass the id to the custom hook

  const { recordingUri, setRecordingUri } = useRecordingStore()

  const router = useRouter()

  const renderChatFooter = useCallback(() => {
    if (imagePath) {
      return (
        <View className="mb-5 rounded-lg mx-10 bg-white">
          <Image
            source={{ uri: imagePath }}
            style={{ height: 40, width: 40, borderRadius: 100 }}
          />
          <TouchableOpacity
            className="absolute -top-2 -right-3 bg-red-200 px-2 py-1 rounded-full"
            onPress={() => setImagePath('')}
          >
            <Text>X</Text>
          </TouchableOpacity>
        </View>
      )
    }
    if (filePath) {
      return (
        <View className="mb-5 rounded-lg mx-10 bg-white">
          <InChatFileTransfer filePath={filePath} />
          <TouchableOpacity
            className="absolute -top-2 -right-3 bg-red-200 px-2 py-1 rounded-full"
            onPress={() => setFilePath('')}
          >
            <Text>X</Text>
          </TouchableOpacity>
        </View>
      )
    }
    if (recordingUri) {
      return (
        <View className="mb-5 p-3 rounded-lg mx-10 bg-white">
          <TouchableOpacity>
            <Text>Voice Message</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="absolute -top-2 -right-3 bg-red-200 px-2 py-1 rounded-full"
            onPress={() => setRecordingUri('')}
          >
            <Text>X</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return null
  }, [filePath, imagePath, recordingUri])

  const { renderBubble, fileUrl, setFileUrl } = useRenderGiftedChat()

  const navigateToProfile = () => {
    router.push({
      pathname: '/user/(tabs)/messages/conversations/profile',
      params: {
        id: user?._id,
      },
    })
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <TouchableOpacity onPress={navigateToProfile}>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>
                {user?.name || 'User'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      {fileUrl && (
        <InChatViewFile url={fileUrl} onClose={() => setFileUrl('')} />
      )}
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: currentUser?.uid ?? '',
          name: currentUser?.displayName ?? '',
        }}
        renderMessageAudio={(props) => <MessageAudio {...props} />}
        renderChatFooter={renderChatFooter}
        renderBubble={renderBubble}
        renderInputToolbar={(props) => (
          <CustomInputToolbar {...props} onFilePress={shareFile} />
        )}
      />
    </>
  )
}
