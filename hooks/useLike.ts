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

const useLike = (item: DocumentData) => {
  const [isLikes, setIsLikes] = useState(false)
  const currentUser = auth?.currentUser

  const toggleLike = async (index: number) => {
    const userId = currentUser?.uid // Get the current user's ID
    setIsLikes(!isLikes)
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
    const isLiked = item.likes.includes(userId)

    try {
      if (isLiked) {
        // If the user has already liked the post, remove the userId from the likes array
        await updateDoc(postRef, {
          likes: arrayRemove(userId), // Remove the userId from the likes array
          likesCount: item.likesCount - 1, // Optionally, decrement the likes count
        })
        console.log('Like removed successfully')
        setIsLikes(false)
      } else {
        // If the user hasn't liked the post, add the userId to the likes array
        await updateDoc(postRef, {
          likes: arrayUnion(userId), // Add the userId to the likes array
          likesCount: item.likesCount + 1, // Optionally, increment the likes count
        })

        addNotifications({
          fromUserId: currentUser?.uid || '',
          postId: item.id,
          type: 'like',
          liketype: 'like',
        })
        setIsLikes(true)
      }
    } catch (error) {
      console.error('Error updating like status: ', error)
    }
  }

  return { isLikes, toggleLike, setIsLikes }
}

export default useLike
