import { auth, db } from '@/config'
import {
  DocumentData,
  arrayRemove,
  arrayUnion,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { useState } from 'react'
import addNotifications from './useNotifications'

const useDislike = (item: DocumentData) => {
  const [isDislikes, setIsDislikes] = useState(false)
  const currentUser = auth?.currentUser
  const toggleDislike = async (index: number) => {
    const userId = currentUser?.uid // Get the current user's ID
    setIsDislikes(!isDislikes)
    if (!userId) {
      console.error('No user is logged in')
      return
    }

    if (!item) {
      console.error('Post not found at index:', index)
      return
    }

    // Get the reference to the post document
    const postRef = doc(db, 'posts', String(item.id))

    // Check if the current user has already liked the post
    const isDisliked = item.dislikes.includes(userId)

    try {
      if (isDisliked) {
        // If the user has already liked the post, remove the userId from the likes array
        await updateDoc(postRef, {
          dislikes: arrayRemove(userId), // Remove the userId from the likes array
          dislikesCount: item.dislikesCount - 1, // Optionally, decrement the likes count
        })
        setIsDislikes(false)
      } else {
        // If the user hasn't liked the post, add the userId to the likes array
        await updateDoc(postRef, {
          dislikes: arrayUnion(userId), // Add the userId to the likes array
          dislikesCount: item.dislikesCount + 1, // Optionally, increment the likes count
        })
        addNotifications({
          fromUserId: currentUser?.uid || '',
          postId: item.id,
          type: 'like',
          liketype: 'disliked',
        })
        setIsDislikes(true)
      }
    } catch (error) {
      console.error('Error updating like status: ', error)
    }
  }
  return { isDislikes, toggleDislike, setIsDislikes }
}

export default useDislike
