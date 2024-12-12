import { auth, db } from '@/config'
import { AntDesign, Entypo, Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import {
  DocumentData,
  collection,
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
  const currentUser = auth?.currentUser

  // State to manage likes and comments
  const [posts, setPosts] = useState<any>([])
  const [likes, setLikes] = useState(Array(posts.length).fill(false)) // To track likes

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
  console.log('likes', likes)
  const router = useRouter()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long', // e.g., "Monday"
      year: 'numeric', // e.g., "2023"
      month: 'long', // e.g., "December"
      day: 'numeric', // e.g., "12"
    })
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* navigate to post screen */}
        <Pressable onPress={() => router.push('/teacher/(tabs)/add-post')}>
          <View className="flex flex-row gap-5  border-b border-b-slate-100  p-4 ">
            <View className="rounded-full border ">
              {currentUser?.photoURL ? (
                <Image
                  source={{ uri: currentUser?.photoURL }}
                  style={{ width: 45, height: 45, borderRadius: 100 }}
                />
              ) : (
                <Feather name="user" size={24} color="black" />
              )}
            </View>
            <View className="gap-2">
              <Text className="text-[12px] font-medium">
                {currentUser?.displayName}
              </Text>
              <Text className="text-[10px] text-gray-500 font-medium">
                What's on your mind?
              </Text>
            </View>
          </View>
        </Pressable>

        {/* post content*/}
        {posts.map((post: DocumentData, index: number) => (
          <View key={index} className="border-b border-b-slate-200 p-4">
            <View className="flex flex-row justify-between">
              <View className="flex flex-row items-center justify-start gap-2">
                <View className="rounded-full w-8 h-8 border p-3 items-center justify-center">
                  {post?.authorAvatar ? (
                    <Image
                      source={{ uri: post?.authorAvatar }}
                      style={{ width: 30, height: 30, borderRadius: 100 }}
                    />
                  ) : (
                    <Feather name="user" size={24} color="black" />
                  )}
                </View>
                <View>
                  <Text className="font-semibold">{post.authorName}</Text>
                  <Text className="text-[8px] text-gray-500">
                    {formatDate(post.createdAt)}
                  </Text>
                </View>
              </View>
              <Text>...</Text>
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
              <View className="flex flex-row items-center justify-start gap-5 relative">
                {likes[index] ? (
                  <View className="flex flex-row rounded-br-2xl rounded-tl-2xl   items-start gap-5 px-3 py-2  bg-white shadow-2xl absolute -top-16 left-0">
                    {/* emotic */}
                    <TouchableOpacity
                      onPress={() => toggleLike(index)}
                      style={styles.likeButton}
                    >
                      <Text>
                        <AntDesign name="like2" size={24} />
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => toggleLike(index)}
                      style={styles.likeButton}
                    >
                      <Text>
                        {' '}
                        <AntDesign name="dislike2" size={24} />
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                <TouchableOpacity
                  onPress={() => toggleLike(index)}
                  onLongPress={() => toggleLike(index)}
                  // onLongPress={() => handleEmoticonPress(index)}
                  style={styles.likeButton}
                >
                  <Text>
                    <Entypo name="bookmark" size={24} />
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => toggleLike(index)}
                  onLongPress={() => toggleLike(index)}
                  // onLongPress={() => handleEmoticonPress(index)}
                  style={styles.likeButton}
                >
                  <Text className="text-lg ">
                    {likes[index] ? '❤️1K ' : '🤍 '}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    // @ts-ignore
                    router.push(`/teacher/posts/comments/${post.id}`)
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
