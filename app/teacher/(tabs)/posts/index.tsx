import { db } from '@/config'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import {
  collection,
  DocumentData,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

const index = () => {
  const images = [
    { uri: 'https://via.placeholder.com/300/FF5733/FFFFFF?text=Image+1' },
    { uri: 'https://via.placeholder.com/300/33FF57/FFFFFF?text=Image+2' },
    { uri: 'https://via.placeholder.com/300/3357FF/FFFFFF?text=Image+3' },
    { uri: 'https://via.placeholder.com/300/FFC300/FFFFFF?text=Image+4' },
    { uri: 'https://via.placeholder.com/300/581845/FFFFFF?text=Image+5' },
  ]

  const cards = Array.from({ length: 5 })
  // State to manage likes and comments
  const [likes, setLikes] = useState(Array(cards.length).fill(false)) // To track likes
  const [posts, setPosts] = useState<any>([])
  // Fetch posts from Firestore
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setPosts(postsData)
      // setLoading(false);
    })

    return () => unsubscribe() // Cleanup the subscription on unmount
  }, [])

  // Function to toggle likes
  const toggleLike = (index: number) => {
    const newLikes = [...likes]
    newLikes[index] = !newLikes[index] // Toggle like status
    setLikes(newLikes)
  }

  const router = useRouter()

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* navigate to post screen */}
        <Pressable onPress={() => router.push('/student/add-post')}>
          <View className="flex flex-row gap-5  border-b border-b-slate-100  p-4 ">
            <View className="rounded-full border p-3 ">
              <Feather name="user" size={12} />
            </View>
            <View className="gap-2">
              <Text className="text-[12px] font-medium">Juan Dela Cruz</Text>
              <Text className="text-[10px] text-gray-500 font-medium">
                What's on your mind?
              </Text>
            </View>
          </View>
        </Pressable>

        {/* view carousel */}
        {/* <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.carousel}
      >
        {images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={image} style={styles.image} resizeMode="cover" />
          </View>
        ))}
      </ScrollView> */}
        {/* post content*/}
        {posts.map((post: DocumentData, index: number) => (
          <View key={index} className="border-b border-b-slate-200 p-4">
            <View className="flex flex-row items-center justify-start gap-2">
              <View className="rounded-full w-8 h-8 border p-3 items-center justify-center">
                <Feather name="user" size={14} />
              </View>
              <View>
                <Text className="font-semibold">{post.authorName}</Text>
              </View>
            </View>
            <View className="px-9 pb-10">
              <Text className="text-black leading-loose">{post.post} </Text>
              {post.imageUrl && (
                <Image
                  source={{ uri: post.imageUrl }}
                  className="h-72 w-64 rounded-md"
                />
              )}
              {/* Reaction (Like) Section */}
              <View className="flex flex-row items-center justify-start gap-5">
                <TouchableOpacity
                  onPress={() => toggleLike(index)}
                  style={styles.likeButton}
                >
                  <Text className="text-lg ">
                    {likes[index] ? '❤️1K ' : '🤍 '}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    // @ts-ignore
                    router.push(`/student/posts/comments/${post.id}`)
                  }
                >
                  <Feather name="message-circle" color={'gray'} size={28} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
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

export default index
