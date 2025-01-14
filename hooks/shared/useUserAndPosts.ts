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
import { useEffect, useState } from 'react'

type TUser = {
  // Define the user type structure here
  [key: string]: any
}

type TPost = {
  id: string
  [key: string]: any
}

const useUserAndPosts = (id: string | undefined) => {
  const [isLoading, setLoading] = useState(false)
  const [user, setUser] = useState<DocumentData | null>(null)
  const [posts, setPosts] = useState<DocumentData[]>([])
  const currentUser = auth?.currentUser

  useEffect(() => {
    setLoading(true)
    if (!currentUser?.uid || !id) return

    const userDocRef = doc(db, 'users', id)

    const unsubscribeUser = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data() as TUser
        setUser(userData)
      } else {
        setUser(null)
        console.error('User not found')
      }
    })

    const postsQuery = query(
      collection(db, 'posts'),
      where('authorId', '==', id),
    )

    const unsubscribePosts = onSnapshot(postsQuery, async (querySnapshot) => {
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

          const commentsQuery = query(
            collection(db, `posts/${postId}/comments`),
            orderBy('createdAt', 'asc'),
          )

          const commentsSnapshot = await getDocs(commentsQuery)
          const commentsData = commentsSnapshot.docs.map((commentDoc) => ({
            id: commentDoc.id,
            ...commentDoc.data(),
          }))

          return {
            id: postId,
            ...docSnapshot.data(),
            comments: commentsData,
            authorData: authorData,
          }
        }),
      )
      setPosts(postsWithComments)
      setLoading(false)
    })

    return () => {
      unsubscribeUser()
      unsubscribePosts()
    }
  }, [db, currentUser?.uid, id])

  return { user, posts, isLoading }
}

export default useUserAndPosts
