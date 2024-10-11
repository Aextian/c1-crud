import { auth, db } from '@/config'
import {
  DocumentData,
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
import { useEffect, useState } from 'react'

const useChat = () => {
  const [conversations, setConversations] = useState<
    DocumentData[] | undefined
  >([])
  const currentUser = auth.currentUser

  useEffect(() => {
    if (!currentUser) return // Handle the case where currentUser is null

    const conversationCollection = query(
      collection(db, 'conversations'), // Use the db reference here
      where('users', 'array-contains', currentUser.uid), // Ensure currentUser is not null
    )

    const unsubscribe = onSnapshot(conversationCollection, (querySnapshot) => {
      const conversationList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setConversations(conversationList)
    })

    return () => unsubscribe() // Cleanup subscription on unmount
  }, [currentUser]) // Add currentUser as a dependency to handle changes in authentication

  return { conversations }
}

export { useChat }
