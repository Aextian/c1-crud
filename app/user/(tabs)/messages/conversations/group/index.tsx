import CustomInputToolbar from '@/components/CustomeToolbar'
import InChatFileTransfer from '@/components/inChatFileTransfer'
import InChatViewFile from '@/components/inChatViewFile'
import MessageAudio from '@/components/MessageAudio'
import { auth, db } from '@/config'
import { useGroupMessage } from '@/hooks/useGroupChat'
import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
import useRenderGiftedChat from '@/hooks/useRenderGiftedChat'
import useRecordingStore from '@/store/useRecordingStore'
import { Feather } from '@expo/vector-icons'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { doc, DocumentData, getDoc } from 'firebase/firestore'
import React, { useCallback, useEffect, useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { GiftedChat } from 'react-native-gifted-chat'

export default function groupConversation() {
  useHideTabBarOnFocus()
  const { id } = useLocalSearchParams<{ id: string }>()
  const currentUser = auth.currentUser
  const router = useRouter()
  const [group, setGroup] = useState<DocumentData>()
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
  } = useGroupMessage(id) // Pass the id to the custom hook

  const { renderBubble, fileUrl, setFileUrl } = useRenderGiftedChat()
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

  useEffect(() => {
    const fetchGroup = async () => {
      const groupRef = doc(db, 'groupChats', id)
      const userSnap = await getDoc(groupRef)
      const groupData = userSnap.data()
      if (userSnap.exists()) setGroup(groupData)
    }

    fetchGroup()
  }, [id])

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: group?.name || '',
          headerRight: () => (
            <TouchableOpacity
              // style={{ marginRight: 5 }} // Adjust the margin if needed
              onPress={() =>
                router.push({
                  pathname:
                    '/user/(tabs)/messages/conversations/group/group-info',
                  params: {
                    id: id,
                  },
                })
              }
            >
              <View className="p-2 bg-green-50 rounded-full">
                <Feather name="info" size={24} color="black" />
              </View>
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
