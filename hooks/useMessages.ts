import { db } from '@/config' // Adjust the import path as necessary
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'
import { GiftedChat, IMessage } from 'react-native-gifted-chat' // Adjust import based on your project structure

const useMessages = (id: string) => {
  const [messages, setMessages] = useState<IMessage[]>([])

  useEffect(() => {
    if (!id) return // Check if conversationId is valid

    const messagesCollection = collection(
      db,
      'conversations',
      String(id),
      'messages',
    )
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

  const onSend = useCallback(
    async (messages: IMessage[] = []) => {
      if (messages.length === 0) return // Ensure there is a message to send
      const { _id, createdAt, text, user } = messages[0]
      try {
        // Reference to the messages collection
        const messagesCollection = collection(
          db,
          'conversations',
          id,
          'messages',
        )
        // Add a new message document to Firestore
        await addDoc(messagesCollection, {
          _id,
          createdAt,
          text,
          user,
        })
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, messages),
        )
      } catch (error) {
        console.error('Error sending message: ', error)
        alert(error)
      }
    },
    [id],
  )

  return { messages, onSend } // Return messages for use in components
}

export default useMessages
