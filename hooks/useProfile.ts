import { db } from '@/config'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { useEffect, useState } from 'react'

const useProfile = (userId: string) => {
  const [postsCount, setPostsCount] = useState(0)
  const [likesCount, setLikesCount] = useState(0)
  const [dislikesCount, setDislikesCount] = useState(0)

  useEffect(() => {
    // Fetch posts count
    const q = query(collection(db, 'posts'), where('authorId', '==', userId))
    const fetchPostsCount = async () => {
      const querySnapshot = await getDocs(q)
      setPostsCount(querySnapshot.size)
    }
    // Fetch likes count
    const fetchLikesCount = async () => {
      const postSnapshot = await getDocs(q)

      const totalLikes = postSnapshot.docs.reduce((total, doc) => {
        return total + doc.data().likesCount
      }, 0)

      setLikesCount(totalLikes)
    }

    // Fetch dislikes count
    const fetchDislikesCount = async () => {
      const postSnapshot = await getDocs(q)

      const totalDislikes = postSnapshot.docs.reduce((total, doc) => {
        return total + doc.data().dislikesCount
      }, 0)

      setDislikesCount(totalDislikes)
    }

    fetchLikesCount()
    fetchDislikesCount()
    fetchPostsCount()
  }, [userId])

  return { postsCount, likesCount, dislikesCount }
}

export default useProfile
