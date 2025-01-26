import { auth, db } from '@/config'
import {
  DocumentData,
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

export const useFetchPosts = () => {
  const [posts, setPosts] = useState<DocumentData[]>([])

  const [isLoading, setLoading] = useState(false)
  const currentUser = auth.currentUser

  const fetchPostsAndComments = async () => {
    setLoading(true)

    const documentRef = getDoc(doc(db, 'users', String(currentUser?.uid)))

    const documentSnapshot = await documentRef
    const userData = documentSnapshot.data()

    const q = query(collection(db, 'posts'), where('status', '==', true))

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

          return {
            id: postId,
            ...docSnapshot.data(),
            authorData: authorData,
            comments: commentsData, // Attach the comments to the post
          }
        }),
      )

      if (userData?.role === 'student') {
        // Filter posts that either have no `year` and `course`, or have matching `year` and `course`
        const filteredPosts = postsWithComments.filter((p) => {
          // Include posts with no `year` and `course`
          if (!p.year || !p.course) return true
          // Include posts with matching `year` and `course`
          return p.year === userData.year && p.course === userData.course
        })
        setPosts(filteredPosts) // Sets the posts to be displayed
      } else {
        setPosts(postsWithComments)
      }

      // setPosts(postsWithComments.filter((p) => p.year === role))
      setLoading(false)
    })

    // Cleanup the subscription on unmount
    return () => unsubscribe()
  }

  return { posts, fetchPostsAndComments, isLoading }
}
