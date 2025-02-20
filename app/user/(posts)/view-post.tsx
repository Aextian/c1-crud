import LoadingScreen from '@/components/shared/loadingScreen'
import ViewPost from '@/components/user/ViewPost'
import { db } from '@/config'
import { useLocalSearchParams } from 'expo-router'
import {
  DocumentData,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { ImageBackground, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const viewPost = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [post, setPost] = useState<DocumentData>()
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true)
      try {
        const docRef = doc(db, 'posts', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          const authorId = data.authorId

          const authorDocRef = doc(db, 'users', authorId)
          // Fetch the document
          const authorSnapshot = await getDoc(authorDocRef)
          let authorData = {}
          if (authorSnapshot.exists()) {
            authorData = { id: authorSnapshot.id, ...authorSnapshot.data() } // Extract data if the document exists
          }
          const commentsQuery = query(
            collection(db, `posts/${id}/comments`),
            orderBy('createdAt', 'asc'), // Optional: Order comments by creation time
          )

          const commentsSnapshot = await getDocs(commentsQuery)
          const commentsData = commentsSnapshot.docs.map((commentDoc) => ({
            id: commentDoc.id,
            ...commentDoc.data(),
          }))

          setPost({
            ...data,
            id: docSnap.id,
            authorData: authorData,
            comments: commentsData,
          })
          setLoading(false)
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching post:', error)
        setLoading(false)
      }
    }
    fetchPost()
  }, [id])

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ImageBackground
        source={require('../../../assets/images/bgsvg.png')}
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: 0.3,
          },
        ]}
      />
      {post && post !== undefined && <ViewPost item={post} index={0} />}
    </SafeAreaView>
  )
}

export default viewPost
