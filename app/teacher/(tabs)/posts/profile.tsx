import Posts from '@/components/teacher/Posts'
import { auth, db } from '@/config'
import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
import { handleSelectUser } from '@/hooks/useMessageUser'
import useProfile from '@/hooks/useProfile'
import userCoverUploads from '@/hooks/userCoverUploads'
import { Feather, Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  DocumentData,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import React, { useCallback, useEffect, useState } from 'react'
import {
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

type TUser = {
  id: string
  displayName: string
  email: string
  avatar: string
  uid: string
  coverImage: string
}

const profile = () => {
  useHideTabBarOnFocus()

  const currentUser = auth?.currentUser
  const { id } = useLocalSearchParams<{ id: string }>()

  const [user, setUser] = useState<DocumentData>()
  const [posts, setPosts] = useState<any>([])
  const [conversationId, setConversationId] = useState<string | null>(null)

  const { pickImage, image } = userCoverUploads(currentUser?.uid || '')

  const { postsCount, likesCount, dislikesCount } = useProfile(id)

  const [refreshing, setRefreshing] = useState(false)
  const onRefresh = useCallback(() => {}, [])
  const router = useRouter()

  useEffect(() => {
    if (!currentUser?.uid) return
    if (!id) return

    const userDocRef = doc(db, 'users', id) // Directly reference the document by ID

    // To listen to real-time updates
    const unsubscribeUser = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = {
          id: docSnapshot.id, // Include the document ID
          ...docSnapshot.data(), // Spread the document's data
        }

        setUser(userData) // Update state with the user data
      } else {
        setUser({}) // No user found
        console.error('User not found')
      }
    })

    const q = query(
      collection(db, 'posts'),
      where('authorId', '==', id),
      // orderBy('createdAt', 'desc'),
    )
    const unsubscribePosts = onSnapshot(q, async (querySnapshot) => {
      // Map over all posts to fetch their comments
      const postsWithComments = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const postId = doc.id

          // Fetch comments for this post
          const commentsQuery = query(
            collection(db, `posts/${postId}/comments`),
            orderBy('createdAt', 'asc'), // Optional: Order comments by creation time
          )

          const commentsSnapshot = await getDocs(commentsQuery)
          const commentsData = commentsSnapshot.docs.map((commentDoc) => ({
            id: commentDoc.id,
            ...commentDoc.data(),
          }))

          return {
            id: postId,
            ...doc.data(),
            comments: commentsData, // Attach the comments to the post
          }
        }),
      )
      setPosts(postsWithComments)
    })

    // Cleanup the listener on unmount or when `currentUser.uid` changes
    return () => {
      unsubscribeUser()
      unsubscribePosts()
    }
  }, [db, currentUser?.uid, id, image])

  return (
    <View style={{ flex: 1, gap: 10 }}>
      <View className="h-48  w-full bg-gray-400 mt-10">
        {user?.coverImage && (
          <Image
            style={{ width: '100%', height: '100%' }}
            source={{ uri: user?.coverImage }}
          />
        )}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-0 left-5"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        {id === auth?.currentUser?.uid && (
          <TouchableOpacity
            onPress={() => pickImage()}
            className="absolute bottom-2 right-2 "
          >
            <Ionicons name="images-sharp" size={24} color="black" />
          </TouchableOpacity>
        )}
      </View>

      <View className="flex flex-row gap-10 absolute top-36 w-full justify-center items-center">
        <View className="flex flex-col gap-5 items-center">
          {user?.avatar ? (
            <Image
              className="h-36 w-36 rounded-full  border-4 border-white"
              source={{ uri: user?.avatar }}
            />
          ) : (
            <Image
              className="h-36 w-36 rounded-full  border-4 border-white"
              source={require('../../../../assets/images/user-image.jpg')}
            />
          )}

          <Text className="text-2xl font-semibold first-letter:uppercase">
            {currentUser?.displayName}
          </Text>
          <View className="flex flex-row gap-10">
            <View className="flex flex-col items-center">
              <Text className="font-bold text-2xl">{postsCount}</Text>
              <Text>Posts</Text>
            </View>
            <View className="flex flex-col items-center">
              <Text className="font-bold text-2xl">{likesCount}</Text>
              <Text>Likes</Text>
            </View>
            <View className="flex flex-col items-center">
              <Text className="font-bold text-2xl">{dislikesCount}</Text>
              <Text>Dislike</Text>
            </View>
          </View>
          <View className="flex flex-row gap-5">
            {id === auth?.currentUser?.uid && (
              <TouchableOpacity
                onPress={() =>
                  router.push('/teacher/(tabs)/settings/edit-profile')
                }
                className="bg-green-500 px-5 py-2 rounded-xl flex flex-row items-center gap-5"
              >
                <Ionicons name="create" size={24} color="white" />
                <Text className="text-lg font-semibold text-white">
                  Edit Profile
                </Text>
              </TouchableOpacity>
            )}

            {id !== auth?.currentUser?.uid && user && (
              <TouchableOpacity
                onPress={() => handleSelectUser(user, 'teacher')}
                className="bg-green-200 px-5 py-2 rounded-xl flex flex-row items-center gap-5"
              >
                <Feather name="message-square" size={24} color="black" />
                <Text className="text-lg font-semibold">Message</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* User Posts */}
      <View className="mt-60 items-center justify-center">
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
          renderItem={({ item, index }) => <Posts item={item} index={index} />}
        />
      </View>
    </View>
  )
}

export default profile
