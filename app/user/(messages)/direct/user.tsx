import LoadingScreen from '@/components/shared/loadingScreen'
import CustomInputToolbar from '@/components/user/CustomeToolbar'
import MessageAudio from '@/components/user/MessageAudio'
import MessageImage from '@/components/user/MessageImage'
import InChatViewFile from '@/components/user/inChatViewFile'
import { auth, db } from '@/config'
import useMessages from '@/hooks/useMessages'
import useRenderGiftedChat from '@/hooks/useRenderGiftedChat'
import useRecordingStore from '@/store/useRecordingStore'
import { Feather } from '@expo/vector-icons'
import { Link, Stack, useLocalSearchParams } from 'expo-router'
import {
  DocumentData,
  addDoc,
  collection,
  doc,
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
  const { id } = useLocalSearchParams<{ id: string }>() //selected user id
  const [conversationId, setConversationId] = useState<string>('')

  const [user, setUser] = useState<DocumentData>()
  const currentUser = auth.currentUser

  useEffect(() => {
    const updateConversation = async () => {
      const docRef = doc(db, 'conversations', conversationId)

      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const userUnreadId = docSnap.data().unread
        if (userUnreadId === currentUser?.uid) {
          await updateDoc(doc(db, 'conversations', conversationId), {
            unread: '',
          })
        }
      }
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
    fileName,
  } = useMessages(conversationId) // Pass the id to the custom hook

  const { recordingUri, setRecordingUri } = useRecordingStore()

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
          {/* <InChatFileTransfer fileName={fileName} /> */}
          <View className="flex flex-row items-center gap-2 ">
            <Feather name="file" size={24} color={'3a8dbe4'} />
            <Text className="text-xs font-semibold truncate">{fileName}</Text>
          </View>
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
  }, [filePath, imagePath, recordingUri, fileName])

  const { renderBubble, fileUrl, setFileUrl } = useRenderGiftedChat()

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Link
              href={{
                pathname: '/user/(profile)',
                params: { id: user?._id },
              }}
            >
              <View className="p-2  bg-white shadow rounded-full">
                <Text style={{ fontWeight: 'semibold', fontSize: 18 }}>
                  {user?.name || <LoadingScreen />}
                </Text>
              </View>
            </Link>
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
          _id: String(currentUser?.uid),
          name: String(currentUser?.displayName),
          avatar: String(currentUser?.photoURL),
        }}
        showUserAvatar={true}
        // renderUsernameOnMessage={true}
        messagesContainerStyle={{
          backgroundColor: '#fff',
        }}
        isLoadingEarlier={true}
        showAvatarForEveryMessage={true}
        renderAvatarOnTop={true}
        renderMessageAudio={(props) => <MessageAudio {...props} />}
        renderMessageImage={(props) => <MessageImage {...props} />}
        renderChatFooter={renderChatFooter}
        renderBubble={renderBubble}
        renderInputToolbar={(props) => (
          <CustomInputToolbar {...props} onFilePress={shareFile} />
        )}
      />
    </>
  )
}
