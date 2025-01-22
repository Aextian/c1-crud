import { auth, db } from '@/config'
import {
  DocumentData,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore'
import { useState } from 'react'

export const useFetchPostsFavorites = () => {
  const [posts, setPosts] = useState<DocumentData[]>([])
  const currentUser = auth.currentUser
  const [isLoading, setLoading] = useState(false)

  const fetchPostsAndComments = async () => {
    if (!currentUser) return

    const favoritesDocRef = doc(db, 'favorites', currentUser.uid)

    const favoritesSnapshot = await getDoc(favoritesDocRef)

    if (!favoritesSnapshot.exists()) return

    const favorites = favoritesSnapshot.data().favorites || [] // Array of document IDs

    setLoading(true)

    // Fetch all posts and their comments
    const postsWithComments = await Promise.all(
      favorites.map(async (postId: string) => {
        // Fetch the post data
        const postDocRef = doc(db, 'posts', postId)
        const postSnapshot = await getDoc(postDocRef)

        if (!postSnapshot.exists()) return null

        const postData = postSnapshot.data()
        const authorId = postData.authorId

        // Fetch the author's name
        const authorDocRef = doc(db, 'users', authorId)
        const authorSnapshot = await getDoc(authorDocRef)

        const authorData = authorSnapshot.exists()
          ? { id: authorSnapshot.id, ...authorSnapshot.data() }
          : null

        // Fetch comments for this post
        const commentsQuery = query(
          collection(db, `posts/${postId}/comments`),
          orderBy('createdAt', 'asc'), // Order comments by creation time
        )

        const commentsSnapshot = await getDocs(commentsQuery)
        const commentsData = commentsSnapshot.docs.map((commentDoc) => ({
          id: commentDoc.id,
          ...commentDoc.data(),
        }))

        return {
          id: postId,
          ...postData,
          authorData,
          comments: commentsData,
        }
      }),
    )
    setPosts(postsWithComments.filter((post) => post !== null))
    setLoading(false)
  }

  return { posts, fetchPostsAndComments, isLoading }
}
