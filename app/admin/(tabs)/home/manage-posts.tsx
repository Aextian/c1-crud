import Post from '@/components/admin/Post'
import { db } from '@/config'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { FlatList, ImageBackground, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const managePosts = () => {
  const [posts, setPosts] = useState<any>([])
  // Fetch posts from Firestore
  const postsRef = collection(db, 'posts')

  useEffect(() => {
    const q = query(postsRef, where('status', '==', false))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setPosts(postsData)
    })

    return () => unsubscribe() // Cleanup the subscription on unmount
  }, [])
  console.log(posts)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ImageBackground
        source={require('../../../../assets/images/bgsvg.png')} // Add your background image here
        style={StyleSheet.absoluteFill}
      />

      <FlatList
        style={{ marginBottom: 40 }}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <Post item={item} index={index} />}
        showsVerticalScrollIndicator={false} // Hides the scrollbar for cleaner look
      />
    </SafeAreaView>
  )
}

export default managePosts
