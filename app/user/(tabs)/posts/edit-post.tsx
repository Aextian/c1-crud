import LoadingScreen from '@/components/shared/loadingScreen'
import EditFormPost from '@/components/user/EditFormPost'
import { db } from '@/config'
import { useLocalSearchParams } from 'expo-router'
import { DocumentData, doc, getDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native'
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated'

const editPost = () => {
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
          setPost(data)
          setPost({ ...data, id: docSnap.id })
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
    <Animated.View entering={FadeIn} style={{ flex: 1, marginTop: 25 }}>
      <Animated.View entering={SlideInDown} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          {post && <EditFormPost data={post} />}
        </SafeAreaView>
      </Animated.View>
    </Animated.View>
  )
}

export default editPost
