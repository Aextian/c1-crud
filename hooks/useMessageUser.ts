import { auth, db } from '@/config'
import { router } from 'expo-router'
import {
  DocumentData,
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'

export const handleSelectUser = async (
  selectedUser: DocumentData,
  role: string,
) => {
  const currentUser = auth.currentUser
  // Check if the conversation exists or create a new one
  const conversationCollection = query(
    collection(db, 'conversations'), // Use the db reference here
    where('users', 'array-contains', currentUser?.uid),
  )
  try {
    const querySnapshot = await getDocs(conversationCollection) // Use await to get the documents
    const conversation = querySnapshot.docs.find((doc) => {
      const users = doc.data().users
      // Check if the selected user is in the conversation
      return users.includes(selectedUser._id)
    })

    if (conversation) {
      role === 'teacher'
        ? router.push({
            pathname: `/teacher/(tabs)/messages/conversations/user`,
            params: {
              id: conversation.id,
            },
          })
        : router.push(
            `/student/(tabs)/messages/conversations/${conversation.id}`,
          )
    } else {
      // Create a new conversation
      const docRef = await addDoc(collection(db, 'conversations'), {
        users: [currentUser?.uid, selectedUser._id], // Corrected document structure
      })

      role === 'teacher'
        ? router.push({
            pathname: `/teacher/(tabs)/messages/conversations/user`,
            params: {
              id: docRef.id,
            },
          })
        : router.push(`/student/(tabs)/messages/conversations/${docRef.id}`)
    }
  } catch (error) {
    console.error('Error fetching or creating conversation: ', error)
  }
}
