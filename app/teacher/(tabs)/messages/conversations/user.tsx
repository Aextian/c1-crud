import CustomInputToolbar from '@/components/CustomeToolbar'
import InChatFileTransfer from '@/components/inChatFileTransfer'
import InChatViewFile from '@/components/inChatViewFile'
import MessageAudio from '@/components/MessageAudio'
import { auth, db } from '@/config'
import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
import useMessages from '@/hooks/useMessages'
import useRenderGiftedChat from '@/hooks/useRenderGiftedChat'
import useRecordingStore from '@/store/useRecordingStore'
import { Ionicons } from '@expo/vector-icons'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { doc, DocumentData, getDoc } from 'firebase/firestore'
import React, { useCallback, useEffect, useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { GiftedChat } from 'react-native-gifted-chat'

export default function userConversation() {
  useHideTabBarOnFocus()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [user, setUser] = useState<DocumentData>()
  const currentUser = auth.currentUser

  useEffect(() => {
    const docRef = doc(db, 'conversations', id)
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
  } = useMessages(id) // Pass the id to the custom hook

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

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: user?.name || '',
          headerRight: () => (
            <TouchableOpacity
              className="bg-green-100 px-5 py-2 rounded-xl"
              style={{ marginRight: 10 }} // Adjust the margin if needed
              onPress={() =>
                router.push({
                  pathname:
                    '/student/(tabs)/messages/video-calls/video-call-screen',
                  params: {
                    callId: id,
                  },
                })
              }
            >
              <Ionicons name="videocam" size={24} color="black" />
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
