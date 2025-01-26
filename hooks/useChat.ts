import { auth, db } from '@/config'
import {
  DocumentData,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
import { useState } from 'react'

const useChat = () => {
  const [conversations, setConversations] = useState<
    DocumentData[] | undefined
  >([])
  const [loading, setLoading] = useState(true)
  const currentUser = auth.currentUser

  const fetchConversations = async () => {
    setLoading(true)

    const conversationCollection = query(
      collection(db, 'conversations'),
      where('users', 'array-contains', currentUser?.uid),
    )
    const unsubscribe = onSnapshot(
      conversationCollection,
      async (querySnapshot) => {
        const conversationList = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            // Fetch messages for each conversation
            const messagesRef = collection(
              db,
              `conversations/${doc.id}/messages`,
            )
            const messagesSnapshot = await getDocs(messagesRef)

            const messages = messagesSnapshot.docs.map((msgDoc) => ({
              id: msgDoc.id,
              ...msgDoc.data(),
            }))

            return {
              id: doc.id,
              ...doc.data(),
              messages, // Attach messages to conversation object
            }
          }),
        )

        setConversations(conversationList)
        setLoading(false) // Stop loading after fetching data
      },
    )
    return () => unsubscribe() // Cleanup subscription on unmount
  }

  return { conversations, loading, fetchConversations }
}

export { useChat }
