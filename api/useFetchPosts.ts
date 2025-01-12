import { db } from '@/config'
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import { useState } from 'react'

type TPosts = {
  id: string
  comments: any
  createdAt: any
  post: string
}

export const useFetchPosts = () => {
  const [posts, setPosts] = useState<any>([])

  const fetchPostsAndComments = async () => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      // Map over all posts to fetch their comments
      const postsWithComments = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const postId = doc.id

          // Fetch comments for this post
          const commentsQuery = query(
            collection(db, `posts/${postId}/comments`),
            orderBy('createdAt', 'asc'), // Optional: Order comments by creation time
          )

          const commentsSnapshot = await getDocs(commentsQuery)
          const commentsData = commentsSnapshot.docs.map((commentDoc) => ({
            id: commentDoc.id,
            ...commentDoc.data(),
          }))

          return {
            id: postId,
            ...doc.data(),
            comments: commentsData, // Attach the comments to the post
          }
        }),
      )
      setPosts(postsWithComments)
    })

    // Cleanup the subscription on unmount
    return () => unsubscribe()
  }

  return { posts, fetchPostsAndComments }
}
