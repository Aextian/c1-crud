import { useFetchPosts } from '@/api/useFetchPosts'
import PostSkLoader from '@/components/shared/PostSkLoader'
import NewsFeedHeader from '@/components/user/NewsFeedHeader'
import Post from '@/components/user/Post'
import PostHeader from '@/components/user/PostHeader'
import { db } from '@/config'
import React, { useCallback, useEffect, useState } from 'react'
import {
  FlatList,
  ImageBackground,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

const index = () => {
  const { posts, fetchPostsAndComments, isLoading, filterPosts } =
    useFetchPosts()
  // useActiveSessionListener()

  // Fetch posts from Firestore
  useEffect(() => {
    fetchPostsAndComments()
  }, [db]) // Include db as a dependency if it can change

  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchPostsAndComments() // Fetch new data
    setRefreshing(false) // Hide the spinner
  }, [])

  // Sort the posts by creation time
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#fff', position: 'relative' }}
    >
      <View style={{ zIndex: 99999 }}>
        <Toast />
      </View>
      <ImageBackground
        source={require('../../../../assets/images/bgsvg.png')} // Add your background image here
        style={styles.overlay}
      />
      <NewsFeedHeader />

      {isLoading ? (
        <PostSkLoader />
      ) : (
        <FlatList
          style={{ marginBottom: 40 }}
          data={sortedPosts}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh} // This triggers the refresh logic
              colors={['#ff0000']} // Optional, for custom colors
              progressBackgroundColor="#ffffff" //spinner color green
            />
          }
          renderItem={({ item, index }) => <Post item={item} index={index} />}
          showsVerticalScrollIndicator={false} // Hides the scrollbar for cleaner look
          ListHeaderComponent={<PostHeader filterPosts={filterPosts} />}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 250,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
})
export default index
