import CustomInputToolbar from '@/components/CustomeToolbar'
import InChatFileTransfer from '@/components/inChatFileTransfer'
import InChatViewFile from '@/components/inChatViewFile'
import { auth, db } from '@/config'
import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
import useMessages from '@/hooks/useMessages'
import useRenderGiftedChat from '@/hooks/useRenderGiftedChat'
import { Ionicons } from '@expo/vector-icons'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { DocumentData, doc, getDoc } from 'firebase/firestore'
import React, { useCallback, useEffect, useState } from 'react'
import { Image, Linking, Text, TouchableOpacity, View } from 'react-native'
import { GiftedChat } from 'react-native-gifted-chat'

export default function userConversation() {
  useHideTabBarOnFocus()
  const { id } = useLocalSearchParams<{ id: string }>()
  const currentUser = auth.currentUser
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
  const [user, setUser] = useState<DocumentData>()
  const [inputText, setInputText] = useState('')

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

  const router = useRouter()

  const renderCustomView = (props) => {
    const { currentMessage } = props
    // Check if the message contains a file
    if (currentMessage.file) {
      return (
        <TouchableOpacity
          onPress={() => Linking.openURL(currentMessage.file.url)}
        >
          <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>
            {/* {currentMessage.file.name || 'Download File'} */}
            sdsdsds
          </Text>
        </TouchableOpacity>
      )
    }
    return null
  }

  const renderChatFooter = useCallback(() => {
    if (imagePath) {
      return (
        <View>
          <Image
            source={{ uri: imagePath }}
            style={{ height: 75, width: 75 }}
          />
          <TouchableOpacity onPress={() => setImagePath('')}>
            <Text>X</Text>
          </TouchableOpacity>
        </View>
      )
    }
    if (filePath) {
      return (
        <View>
          <InChatFileTransfer filePath={filePath} />
          <TouchableOpacity onPress={() => setFilePath('')}>
            <Text>X</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return null
  }, [filePath, imagePath])

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
        onSend={onSend}
        user={{
          _id: currentUser?.uid ?? '',
          name: currentUser?.displayName ?? '',
        }}
        // renderCustomView={renderCustomView}
        // renderChatFooter={renderChatFooter}
        // renderBubble={renderBubble}
        renderInputToolbar={(props) => (
          <CustomInputToolbar {...props} onFilePress={shareFile} />
        )}
      />
    </>
  )
}

// const renderMessage = (props) => {
//   const { currentMessage } = props

//   if (currentMessage.file) {
//     // Render file messages (e.g., PDFs)
//     return (
//       <View
//         style={{ padding: 10, backgroundColor: '#f0f0f0', borderRadius: 10 }}
//       >
//         <Text style={{ marginBottom: 5 }}>PDF File:</Text>
//         <TouchableOpacity onPress={() => Linking.openURL(currentMessage.file)}>
//           <Text style={{ color: 'blue' }}>Open PDF</Text>
//         </TouchableOpacity>
//       </View>
//     )
//   }

//   return null // Default rendering for other messages
// }
