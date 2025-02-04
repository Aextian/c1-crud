import { auth, db } from '@/config'
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { useState } from 'react'

const useFavorite = () => {
  const [isFavorite, setIsFavorite] = useState(false)
  const currentUser = auth?.currentUser

  const toggleFavorite = async (postId: number) => {
    setIsFavorite(!isFavorite)
    if (!currentUser) {
      console.error('No user is logged in')
      return
    }
    // Reference the user's favorites document
    const favoriteDocRef = doc(db, 'favorites', currentUser?.uid)

    try {
      // Check if the document exists
      const docSnapshot = await getDoc(favoriteDocRef)
      if (docSnapshot.exists()) {
        // Document exists, update it
        if (isFavorite) {
          // Remove the postId from the favorites array
          await updateDoc(favoriteDocRef, {
            favorites: arrayRemove(postId),
          })
        } else {
          // Add the postId to the favorites array
          await updateDoc(favoriteDocRef, {
            favorites: arrayUnion(postId),
          })
        }
      } else {
        // Document does not exist, create it
        await setDoc(favoriteDocRef, {
          favorites: [postId], // Initialize the favorites array with the postId
        })
      }
    } catch (error) {
      console.error('Error updating favorite status: ', error)
    }
  }

  return { isFavorite, toggleFavorite, setIsFavorite }
}

export default useFavorite
