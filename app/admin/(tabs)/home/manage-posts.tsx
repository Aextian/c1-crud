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

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 5,
    paddingTop: 35,
    backgroundColor: '#fff',
  },

  header: {
    fontSize: 24,
    marginBottom: 10,
  },

  contentText: {
    fontSize: 18,
    marginBottom: 10,
  },
  carousel: {
    marginTop: 15,
    flexDirection: 'row',
  },
  imageContainer: {
    // width: 300,
    height: 200,
    marginRight: 10,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 10,
  },

  cardHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  likeButton: {
    marginVertical: 10,
  },
  likeText: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
})

export default managePosts
