import { useFetchPosts } from '@/api/useFetchPosts'
import PostSkLoader from '@/components/shared/PostSkLoader'
import Posts from '@/components/teacher/Posts'
import { auth, db } from '@/config'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  Text,
  View,
} from 'react-native'

const index = () => {
  const currentUser = auth?.currentUser

  const { posts, fetchPostsAndComments, isLoading } = useFetchPosts()

  // Fetch posts from Firestore
  useEffect(() => {
    fetchPostsAndComments()
  }, [db]) // Include db as a dependency if it can change

  const router = useRouter()

  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchPostsAndComments() // Fetch new data
    setRefreshing(false) // Hide the spinner
  }, [])

  return (
    // <SafeAreaView className="flex-1 px-5  gap-10 bg-gray-200 ">
    <View style={{ flex: 1 }}>
      {/* navigate to post screen */}
      <SafeAreaView className="flex-1 mt-10  ">
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
      </SafeAreaView>

      {isLoading && <PostSkLoader />}
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
  )
}

export default index
