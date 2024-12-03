import { auth, db } from '@/config' // Adjust the import path as necessary
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'
import { GiftedChat, IMessage } from 'react-native-gifted-chat' // Adjust import based on your project structure
import useFileUpload from './useFileUpload'

const useMessages = (id: string) => {
  const [messages, setMessages] = useState<IMessage[]>([])
  console.log('messages', messages)

  useEffect(() => {
    if (!id) return // Check if conversationId is valid

    const messagesCollection = collection(db, 'conversations', id, 'messages')
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
      }))
      setMessages(allMessages)
    })

    return () => unsubscribe() // Cleanup subscription on unmount
  }, [id])

  // const onSend = useCallback(
  //   async (messages = []) => {
  //     const [messageToSend] = messages
  //     const { text, _id, createdAt, user } = messageToSend

  //     // Handle sending image
  //     if (isAttachImage) {
  //       const newMessage = {
  //         _id: Math.random().toString(), // Generate a unique _id
  //         text: messageToSend.text,
  //         createdAt: new Date(),
  //         user: {
  //           _id: user._id, // Use the current user's ID
  //           avatar: '', // Optionally set user avatar
  //         },
  //         image: imagePath, // Use the image path if it's an image
  //         file: {
  //           url: '', // No file URL if it's an image
  //         },
  //       }

  //       setMessages((previousMessages) =>
  //         GiftedChat.append(previousMessages, newMessage),
  //       )

  //       // Save to Firebase
  //       const messagesCollection = collection(
  //         db,
  //         'conversations',
  //         id,
  //         'messages',
  //       )
  //       await addDoc(messagesCollection, {
  //         _id: newMessage._id,
  //         createdAt,
  //         text,
  //         user,
  //         image: newMessage.image,
  //         file: newMessage.file,
  //       })

  //       // Reset after sending the image
  //       setImagePath('')
  //       setIsAttachImage(false)
  //     }

  //     // Handle sending file
  //     else if (isAttachFile) {
  //       const newMessage = {
  //         _id: Math.random().toString(), // Generate a unique _id
  //         text: messageToSend.text,
  //         createdAt: new Date(),
  //         user: {
  //           _id: user._id, // Use the current user's ID
  //           avatar: '', // Optionally set user avatar
  //         },
  //         image: '', // No image if it's a file
  //         file: {
  //           url: filePath, // Use the file path for file URLs
  //         },
  //       }

  //       // Save to Firebase
  //       const messagesCollection = collection(
  //         db,
  //         'conversations',
  //         id,
  //         'messages',
  //       )
  //       await addDoc(messagesCollection, {
  //         _id: newMessage._id,
  //         createdAt,
  //         text,
  //         user,
  //         image: newMessage.image,
  //         file: newMessage.file,
  //       })

  //       // Reset after sending the file
  //       setFilePath('')
  //       setIsAttachFile(false)
  //     }

  //     // Handle sending regular text messages
  //     else {
  //       // Save regular message to Firebase
  //       const messagesCollection = collection(
  //         db,
  //         'conversations',
  //         id,
  //         'messages',
  //       )
  //       await addDoc(messagesCollection, {
  //         _id,
  //         createdAt,
  //         text,
  //         user,
  //         image: '',
  //         file: {
  //           url: '',
  //         },
  //       })
  //     }
  //   },
  //   [filePath, imagePath, isAttachFile, isAttachImage],
  // )
  // Modify onSend()
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
  const currenUser = auth.currentUser

  const onSend = useCallback(
    async (messages = []) => {
      const [messageToSend] = messages
      const messagesCollection = collection(db, 'conversations', id, 'messages')
      if (isAttachImage) {
        const newMessage = {
          _id: messages[0]._id + 1,
          text: messageToSend.text,
          createdAt: new Date(),
          user: {
            _id: currenUser?.uid,
            avatar: '',
          },
          image: imagePath,
          file: {
            url: '',
          },
        }

        await addDoc(messagesCollection, newMessage)
        // resetState()
      } else if (isAttachFile) {
        const newMessage = {
          _id: messages[0]._id + 1,
          text: messageToSend.text,
          createdAt: new Date(),
          user: {
            _id: currenUser?.uid,
            avatar: '',
          },
          image: '',
          file: {
            url: filePath,
            type: fileType,
          },
        }
        console.log('newMessage', newMessage)
        await addDoc(messagesCollection, newMessage)

        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, newMessage),
        )
        // resetState()
      } else {
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, messages),
        )
      }
    },
    [filePath, imagePath, isAttachFile, isAttachImage],
  )

  // const pickFile = async () => {
  //   try {
  //     const result = await DocumentPicker.getDocumentAsync({
  //       type: '*/*', // Allow all file types
  //       copyToCacheDirectory: true,
  //     })
  //     // Ensure the result is not canceled and assets are available
  //     if (!result.canceled && result.assets && result.assets.length > 0) {
  //       const fileUri = result.assets[0].uri // Access the file URI

  //       // Check file type and set paths accordingly
  //       if (fileUri.indexOf('.png') !== -1 || fileUri.indexOf('.jpg') !== -1) {
  //         setImagePath(fileUri)
  //         setFileType(result.assets[0].mimeType || '')
  //         setIsAttachImage(true)
  //       } else {
  //         setFilePath(fileUri)
  //         setIsAttachFile(true)
  //       }

  //       return fileUri // Return the file URI
  //     }

  //     return null // Return null if no file was picked
  //   } catch (error) {
  //     console.error('Error picking file:', error)
  //     return null
  //   }
  // }
  return {
    shareFile,
    onSend,
    imagePath,
    filePath,
    isAttachFile,
    isAttachImage,
    messages,
    setFilePath,
    setImagePath,
  }
}

export default useMessages
