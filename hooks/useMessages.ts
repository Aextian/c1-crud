import { auth, db } from '@/config' // Adjust the import path as necessary
import useRecordingStore from '@/store/useRecordingStore'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'
import { GiftedChat, IMessage } from 'react-native-gifted-chat' // Adjust import based on your project structure
import useModeration from './shared/useModerations'
import useFileUpload from './useFileUpload'

const useMessages = (id: string) => {
  const [messages, setMessages] = useState<IMessage[]>([])
  const currentUser = auth.currentUser

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
        audio: doc.data().audio,
      }))
      setMessages(allMessages)
    })
    return () => unsubscribe() // Cleanup subscription on unmount
  }, [id])

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
    fileName,
  } = useFileUpload()

  const { recordingUri, recording, setRecordingUri } = useRecordingStore()
  const { checkContentModeration } = useModeration()

  const onSend = useCallback(
    async (messages = [] as IMessage[]) => {
      const [messageToSend] = messages

      const result = await checkContentModeration(messageToSend.text)

      if (result.results[0].flagged) {
        // Append system message in red text
        const warningMessage = {
          _id: Math.random().toString(), // Generate unique ID
          text: '❌ Unable to send: Words used are against the system rules.',
          createdAt: new Date(),
          system: true, // Mark as a system message
          user: {
            _id: 'system',
            name: 'System',
          },
        }

        setMessages((prevMessages) =>
          GiftedChat.append(prevMessages, [warningMessage]),
        )
        return
      }

      const messagesCollection = collection(db, 'conversations', id, 'messages')

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
            name: fileName,
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

      // Update the "unread" field in the conversation
      const conversationRef = doc(db, 'conversations', id)
      const docConversation = await getDoc(conversationRef)
      if (docConversation.exists()) {
        const conversationData = docConversation.data()
        const userId = conversationData.users.find(
          (id: string) => id !== currentUser?.uid,
        )

        await updateDoc(conversationRef, {
          unread: userId,
          updatedAt: new Date().toISOString(),
        })
      }
    },

    [filePath, imagePath, isAttachFile, isAttachImage, recordingUri, id],
  )

  return {
    shareFile,
    fileName,
    onSend,
    imagePath,
    filePath,
    isAttachFile,
    isAttachImage,
    messages,
    setFilePath,
    setImagePath,
    recording,
  }
}

export default useMessages
