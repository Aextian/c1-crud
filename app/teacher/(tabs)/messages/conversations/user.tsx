import CustomInputToolbar from '@/components/CustomeToolbar'
import { auth, db, storage } from '@/config'
import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
import useMessages from '@/hooks/useMessages'
import { Ionicons } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { DocumentData, doc, getDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import React, { useEffect, useState } from 'react'
import { Button, TouchableOpacity } from 'react-native'
import { GiftedChat } from 'react-native-gifted-chat'

export default function userConversation() {
  useHideTabBarOnFocus()
  const { id } = useLocalSearchParams<{ id: string }>()
  const currentUser = auth.currentUser
  const { messages, onSend } = useMessages(id) // Pass the id to the custom hook
  const [user, setUser] = useState<DocumentData>()

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

  const uploadFileToFirebase = async (fileUri: any) => {
    try {
      const response = await fetch(fileUri)
      const blob = await response.blob()
      const fileName = fileUri.split('/').pop() // Get file name from URI
      const storageRef = ref(storage, `uploads/${fileName}`)
      // Upload the file
      await uploadBytes(storageRef, blob)
      // Get the file's download URL
      const downloadURL = await getDownloadURL(storageRef)
      console.log('success', downloadURL)
      return downloadURL
    } catch (error) {
      console.error('File upload error:', error)
      return null
    }
  }

  const pickFile = async () => {
    console.log('pickFile')
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf', // Specify file type (e.g., PDFs)
        copyToCacheDirectory: true,
      })
      console.log('result', result)

      if (result.type === 'success') {
        console.log(result.uri)
        return result.uri // Return the file URI
      }
      return null
    } catch (error) {
      console.error('Error picking file:', error)
      return null
    }
  }

  const shareFile = async () => {
    const fileUri = await pickFile() // Pick a PDF
    console.log('fileUri', fileUri)
    if (fileUri) {
      const fileUrl = await uploadFileToFirebase(fileUri) // Upload to Firebase
      if (fileUrl) {
        const message = {
          _id: Math.random().toString(),
          createdAt: new Date(),
          text: 'Shared a file:', // Optional message text
          user: { _id: 1, name: 'User' },
          file: fileUrl, // Custom property for non-image files
        }
        onSend([message])
      }
    }
  }

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

      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: currentUser?.uid ?? '',
          name: currentUser?.email ?? '',
        }}
        renderInputToolbar={(props) => (
          <CustomInputToolbar {...props} onFilePress={shareFile} />
        )}
        // renderMessageText={renderMessage}
      />
      <Button title="Select FIle" onPress={shareFile} />
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
