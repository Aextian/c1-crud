import CustomInputToolbar from '@/components/user/CustomeToolbar'
import MessageAudio from '@/components/user/MessageAudio'
import MessageImage from '@/components/user/MessageImage'
import InChatViewFile from '@/components/user/inChatViewFile'
import { auth, db } from '@/config'
import { useGroupMessage } from '@/hooks/useGroupChat'
import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
import useRenderGiftedChat from '@/hooks/useRenderGiftedChat'
import useRecordingStore from '@/store/useRecordingStore'
import { Feather } from '@expo/vector-icons'
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router'
import {
  DocumentData,
  arrayRemove,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore'
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
    fileName,
  } = useGroupMessage(id) // Pass the id to the custom hook

  // update read status
  useEffect(() => {
    const fetchGroup = async () => {
      const groupRef = doc(db, 'groupChats', id)
      await updateDoc(groupRef, {
        unread: arrayRemove(currentUser?.uid),
      })
    }
    fetchGroup()
  }, [id])

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
            <Link
              href={{
                pathname:
                  '/user/(tabs)/messages/conversations/group/group-info',
                params: { id: id },
              }}
              asChild
            >
              <TouchableOpacity activeOpacity={0.8}>
                <View className="p-2 bg-white shadow rounded-full">
                  <Feather name="info" size={24} color="#454552" />
                </View>
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
      {fileUrl && (
        <InChatViewFile url={fileUrl} onClose={() => setFileUrl('')} />
      )}
      {currentUser && (
        <GiftedChat
          messages={messages}
          onSend={(messages) => onSend(messages)}
          user={{
            _id: currentUser?.uid,
            name: String(currentUser?.displayName),
            avatar: String(currentUser?.photoURL),
          }}
          showUserAvatar={true}
          renderUsernameOnMessage={true}
          isLoadingEarlier={true}
          showAvatarForEveryMessage={true}
          renderAvatarOnTop={true}
          messagesContainerStyle={{
            backgroundColor: '#fff',
          }}
          renderMessageAudio={(props) => <MessageAudio {...props} />}
          renderMessageImage={(props) => <MessageImage {...props} />}
          renderChatFooter={renderChatFooter} // it show instant when select image
          renderBubble={renderBubble}
          renderInputToolbar={(props) => (
            <CustomInputToolbar {...props} onFilePress={shareFile} />
          )}
        />
      )}
    </>
  )
}
