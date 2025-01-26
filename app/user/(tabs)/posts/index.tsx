import { useFetchPosts } from '@/api/useFetchPosts'
import PostSkLoader from '@/components/shared/PostSkLoader'
import Posts from '@/components/teacher/Posts'
import PostsHeader from '@/components/teacher/PostsHeader'
import { auth, db } from '@/config'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
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
  const [isButtonVisible, setIsButtonVisible] = useState(true)
  const [fadeAnim] = useState(new Animated.Value(1))

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchPostsAndComments() // Fetch new data
    setRefreshing(false) // Hide the spinner
  }, [])

  // This will be used to detect scroll position
  const handleScroll = (event: any) => {
    const contentOffsetY = event.nativeEvent.contentOffset.y
    if (contentOffsetY > 30) {
      // If scrolled down more than 50 pixels
      if (isButtonVisible) {
        setIsButtonVisible(false)
        Animated.timing(fadeAnim, {
          toValue: 0, // Fade out
          duration: 300, // Duration of fade out
          useNativeDriver: true,
        }).start()
      }
    } else {
      if (!isButtonVisible) {
        setIsButtonVisible(true)
        Animated.timing(fadeAnim, {
          toValue: 1, // Fade in
          duration: 300, // Duration of fade in
          useNativeDriver: true,
        }).start()
      }
    }
  }

  return (
    // <SafeAreaView className="flex-1 px-5  gap-10 bg-gray-200 ">
    <View style={{ flex: 1, marginTop: 20 }}>
      <PostsHeader />
      {/* navigate to post screen */}
      {isButtonVisible && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Pressable onPress={() => router.push('/user/(tabs)/add-post')}>
            <View className="flex flex-row gap-5 border-b border-b-slate-100 p-4">
              <View className="rounded-full border">
                {currentUser?.photoURL &&
                currentUser?.photoURL !== 'undefined' ? (
                  <Image
                    source={{ uri: currentUser?.photoURL }}
                    style={{ width: 45, height: 45, borderRadius: 100 }}
                  />
                ) : (
                  <View style={{ width: 45, height: 45 }}>
                    <Feather name="user" size={24} color="black" />
                  </View>
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
        </Animated.View>
      )}

      {isLoading ? (
        <PostSkLoader />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh} // This triggers the refresh logic
              colors={['#ff0000']} // Optional, for custom colors
              progressBackgroundColor="#ffffff" //spinner color green
            />
          }
          renderItem={({ item, index }) => <Posts item={item} index={index} />}
          onScroll={handleScroll} // This will track the scroll position
        />
      )}
    </View>
  )
}

export default index
