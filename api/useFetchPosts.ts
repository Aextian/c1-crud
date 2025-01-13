import { db } from '@/config'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
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
  const [isLoading, setLoading] = useState(false)

  const fetchPostsAndComments = async () => {
    const q = query(
      collection(db, 'posts'),
      where('status', '==', true),
      // orderBy('createdAt', 'desc'),
    )

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      // Map over all posts to fetch their comments
      const postsWithComments = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const postId = docSnapshot.id
          const authorId = docSnapshot.data().authorId

          // Fetch the author's name
          const authorDocRef = doc(db, 'users', authorId) // Reference the specific document

          // Fetch the document
          const authorSnapshot = await getDoc(authorDocRef)
          let authorData = {} // Initialize an empty object to store author data

          if (authorSnapshot.exists()) {
            authorData = { id: authorSnapshot.id, ...authorSnapshot.data() } // Extract data if the document exists
          }

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
          console.log('commentsData', commentsData)

          return {
            id: postId,
            ...docSnapshot.data(),
            authorData: authorData,
            comments: commentsData, // Attach the comments to the post
          }
        }),
      )
      setPosts(postsWithComments)
      setLoading(false)
    })

    // Cleanup the subscription on unmount
    return () => unsubscribe()
  }

  return { posts, fetchPostsAndComments, isLoading }
}
