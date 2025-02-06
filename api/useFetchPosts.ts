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

          const commentsWithReplies = await fetchCommentsWithReplies(postId)

          return {
            id: postId,
            ...docSnapshot.data(),
            authorData: authorData,
            comments: commentsWithReplies, // Attach the comments to the post
          }
        }),
      )

      if (userData?.role === 'student') {
        // Filter posts that either have no `year` and `course`, or have matching `year` and `course`
        const filteredPosts = postsWithComments.filter((p) => {
          // Include posts with no `year` and `course`
          if (!p.year || !p.section) return true
          // Include posts with matching `year` and `course`
          return p.year === userData.year && p.section === userData.section
        })
        setPosts(filteredPosts) // Sets the posts to be displayed
      } else {
        setPosts(postsWithComments)
      }

      setLoading(false)
    })

    // Cleanup the subscription on unmount
    return () => unsubscribe()
  }

  const filterPosts = async ({
    section,
    year,
  }: {
    section: string
    year: string
  }) => {
    if (
      section == '' ||
      year === '' ||
      section === undefined ||
      year === undefined
    )
      return

    setLoading(true)
    const usersRef = collection(db, 'users')
    const usersDocs = await getDocs(usersRef)

    // Extract user data and filter by section and year
    const filteredUsers = usersDocs.docs
      .map((doc) => ({ id: doc.id, ...doc.data() })) // Extract ID and data
      .filter((u) => u.section === section && u.year === year)

    // Get user IDs
    const userIds = filteredUsers.map((user) => user.id)

    // Filter posts where authorId is in the userIds array
    const filteredPosts = posts.filter((p) => userIds.includes(p.authorId))

    setLoading(false)

    setPosts(filteredPosts)
  }

  const fetchCommentsWithReplies = async (postId: string) => {
    try {
      // Fetch comments
      const commentsQuery = query(
        collection(db, `posts/${postId}/comments`),
        orderBy('createdAt', 'asc'), // Optional sorting
      )

      const commentsSnapshot = await getDocs(commentsQuery)
      const commentsData = await Promise.all(
        commentsSnapshot.docs.map(async (commentDoc) => {
          // Fetch replies for each comment
          const repliesQuery = query(
            collection(db, `posts/${postId}/comments/${commentDoc.id}/replies`),
            orderBy('createdAt', 'asc'), // Optional sorting
          )

          const repliesSnapshot = await getDocs(repliesQuery)
          const repliesData = repliesSnapshot.docs.map((replyDoc) => ({
            id: replyDoc.id,
            ...replyDoc.data(),
          }))

          return {
            id: commentDoc.id,
            ...commentDoc.data(),
            replies: repliesData, // Attach replies to the comment
          }
        }),
      )

      return commentsData // Returns array of comments with their replies
    } catch (error) {
      console.error('Error fetching comments and replies:', error)
      return []
    }
  }

  return { posts, fetchPostsAndComments, isLoading, filterPosts }
}
