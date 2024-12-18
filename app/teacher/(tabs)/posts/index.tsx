import Posts from '@/components/teacher/Posts'
import { auth, db } from '@/config'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import React, { useCallback, useEffect, useState } from 'react'
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native'

const index = () => {
  const currentUser = auth?.currentUser

  // State to manage likes and comments
  const [posts, setPosts] = useState<any>([])
  const [likes, setLikes] = useState(Array(posts.length).fill(false)) // To track likes
  const [isLiked, setIsLiked] = useState(false)

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
  const toggleLike = async (index: number) => {
    const userId = currentUser?.uid // Get the current user's ID
    if (!userId) {
      console.error('No user is logged in')
      return
    }

    const post = posts[index]
    if (!post) {
      console.error('Post not found at index:', index)
      return
    }

    // Get the reference to the post document
    const postRef = doc(db, 'posts', String(post.id))

    // Check if the current user has already liked the post
    const isLiked = post.likes.includes(userId)

    try {
      if (isLiked) {
        // If the user has already liked the post, remove the userId from the likes array
        await updateDoc(postRef, {
          likes: arrayRemove(userId), // Remove the userId from the likes array
          likesCount: post.likesCount - 1, // Optionally, decrement the likes count
        })
        console.log('Like removed successfully')
      } else {
        // If the user hasn't liked the post, add the userId to the likes array
        await updateDoc(postRef, {
          likes: arrayUnion(userId), // Add the userId to the likes array
          likesCount: post.likesCount + 1, // Optionally, increment the likes count
        })
        console.log('Like added successfully')
      }
    } catch (error) {
      console.error('Error updating like status: ', error)
    }
  }

  // const toggleDislike = async (index: number) => {
  //   const userId = currentUser?.uid // Get the current user's ID
  //   if (!userId) {
  //     console.error('No user is logged in')
  //     return
  //   }

  //   const post = posts[index]
  //   if (!post) {
  //     console.error('Post not found at index:', index)
  //     return
  //   }

  //   // Get the reference to the post document
  //   const postRef = doc(db, 'posts', String(post.id))

  //   // Check if the current user has already liked the post
  //   const isLiked = post.likes.includes(userId)

  //   try {
  //     if (isLiked) {
  //       // If the user has already liked the post, remove the userId from the likes array
  //       await updateDoc(postRef, {
  //         likes: arrayRemove(userId), // Remove the userId from the likes array
  //         likesCount: post.likesCount - 1, // Optionally, decrement the likes count
  //       })
  //       console.log('Like removed successfully')
  //     } else {
  //       // If the user hasn't liked the post, add the userId to the likes array
  //       await updateDoc(postRef, {
  //         likes: arrayUnion(userId), // Add the userId to the likes array
  //         likesCount: post.likesCount + 1, // Optionally, increment the likes count
  //       })
  //       console.log('Like added successfully')
  //     }
  //   } catch (error) {
  //     console.error('Error updating like status: ', error)
  //   }
  // }

  console.log('likes', likes)
  const router = useRouter()

  const [refreshing, setRefreshing] = useState(false)
  const onRefresh = useCallback(() => {}, [])

  return (
    <View style={{ flex: 1 }}>
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

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh} // This triggers the refresh logic
            colors={['#ff0000']} // Optional, for custom colors
            progressBackgroundColor="#ffffff" // Optional, for the background color of the spinner
          />
        }
        renderItem={({ item, index }) => (
          <Posts item={item} index={index} />
          // <View key={index} className="border-b border-b-slate-200 p-4">
          //   <View className="flex flex-row justify-between">
          //     <View className="flex flex-row items-center justify-start gap-2">
          //       <View className="rounded-full w-8 h-8 border p-3 items-center justify-center">
          //         {item?.authorAvatar ? (
          //           <Image
          //             source={{ uri: item?.authorAvatar }}
          //             style={{ width: 30, height: 30, borderRadius: 100 }}
          //           />
          //         ) : (
          //           <Feather name="user" size={24} color="black" />
          //         )}
          //       </View>
          //       <View>
          //         <Text className="font-semibold">{item.authorName}</Text>
          //         <Text className="text-[8px] text-gray-500">
          //           {formatDate(item.createdAt)}
          //         </Text>
          //       </View>
          //     </View>
          //     <Text>...</Text>
          //   </View>

          //   <View className="px-9 pb-10">
          //     <Text className="text-black leading-loose">{item.post} </Text>
          //     {item.imageUrl && (
          //       <Image
          //         source={{ uri: item.imageUrl }}
          //         className="h-72 w-64 rounded-3xl mt-2"
          //       />
          //     )}
          //     {/* Reaction (Like) Section */}
          //     <View className="flex flex-row items-center justify-start gap-5 relative">
          //       <TouchableOpacity
          //         onPress={() => toggleLike(index)}
          //         onLongPress={() => toggleLike(index)}
          //         // onLongPress={() => handleEmoticonPress(index)}
          //         style={styles.likeButton}
          //       >
          //         <Text>

          //             <AntDesign name="like1" size={24} />
          //             <AntDesign name="like2" size={24} />
          //         </Text>
          //       </TouchableOpacity>

          //       <TouchableOpacity
          //         onPress={() => toggleLike(index)}
          //         onLongPress={() => toggleLike(index)}
          //         // onLongPress={() => handleEmoticonPress(index)}
          //         style={styles.likeButton}
          //       >
          //         <Text>
          //           <AntDesign name="dislike2" size={24} />
          //         </Text>
          //       </TouchableOpacity>

          //       <TouchableOpacity
          //         onPress={() => toggleLike(index)}
          //         onLongPress={() => toggleLike(index)}
          //         // onLongPress={() => handleEmoticonPress(index)}
          //         style={styles.likeButton}
          //       >
          //         <Text className="text-lg ">
          //           {likes[index] ? '❤️1K ' : '🤍 '}
          //         </Text>
          //       </TouchableOpacity>

          //       <TouchableOpacity
          //         onPress={() =>
          //           // @ts-ignore
          //           router.push(`/teacher/posts/comments/${item.id}`)
          //         }
          //       >
          //         <Feather name="message-circle" color={'gray'} size={28} />
          //       </TouchableOpacity>
          //     </View>
          //   </View>
          // </View>
        )}
      />
    </View>
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
