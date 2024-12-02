import { db } from '@/config' // Adjust the import path as necessary
import * as DocumentPicker from 'expo-document-picker'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'
import { GiftedChat, IMessage } from 'react-native-gifted-chat' // Adjust import based on your project structure

const useMessages = (id: string) => {
  const [messages, setMessages] = useState<IMessage[]>([])
  const [isAttachImage, setIsAttachImage] = useState(false)
  const [isAttachFile, setIsAttachFile] = useState(false)
  const [imagePath, setImagePath] = useState('')
  const [filePath, setFilePath] = useState('')

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
  const onSend = useCallback(
    (messages = []) => {
      const [messageToSend] = messages
      if (isAttachImage) {
        const newMessage = {
          _id: messages[0]._id + 1,
          text: messageToSend.text,
          createdAt: new Date(),
          user: {
            _id: 2,
            avatar: '',
          },
          image: imagePath,
          file: {
            url: '',
          },
        }
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, newMessage),
        )
        setImagePath('')
        setIsAttachImage(false)
      } else if (isAttachFile) {
        const newMessage = {
          _id: messages[0]._id + 1,
          text: messageToSend.text,
          createdAt: new Date(),
          user: {
            _id: 2,
            avatar: '',
          },
          image: '',
          file: {
            url: filePath,
          },
        }
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, newMessage),
        )
        setFilePath('')
        setIsAttachFile(false)
      } else {
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, messages),
        )
      }
    },
    [filePath, imagePath, isAttachFile, isAttachImage],
  )

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf', // Specify file type (e.g., PDFs)
        copyToCacheDirectory: true,
      })

      // Ensure the result is not canceled and assets are available
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri // Access the file URI

        // Check file type and set paths accordingly
        if (fileUri.indexOf('.png') !== -1 || fileUri.indexOf('.jpg') !== -1) {
          setImagePath(fileUri)
          setIsAttachImage(true)
        } else {
          setFilePath(fileUri)
          setIsAttachFile(true)
        }

        return fileUri // Return the file URI
      }

      return null // Return null if no file was picked
    } catch (error) {
      console.error('Error picking file:', error)
      return null
    }
  }
  return {
    pickFile,
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
