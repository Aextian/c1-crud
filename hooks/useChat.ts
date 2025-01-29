import { auth, db } from '@/config'
import {
  DocumentData,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'

const useChat = () => {
  const [conversations, setConversations] = useState<DocumentData[]>([])
  const [loading, setLoading] = useState(true)
  const currentUser = auth.currentUser

  const fetchConversations = useCallback(async () => {
    if (!currentUser) return

    const conversationCollection = query(
      collection(db, 'conversations'),
      where('users', 'array-contains', currentUser.uid),
    )

    const unsubscribe = onSnapshot(
      conversationCollection,
      async (querySnapshot) => {
        const conversationList = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
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
              messages,
            }
          }),
        )

        setConversations(conversationList)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [currentUser])

  useEffect(() => {
    fetchConversations().then((unsubscribe) => {
      return () => unsubscribe?.()
    })
  }, [fetchConversations])

  return { conversations, loading, refreshConversations: fetchConversations }
}

export { useChat }
