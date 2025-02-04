import { useFetchPosts } from '@/api/useFetchPosts'
import PostSkLoader from '@/components/shared/PostSkLoader'
import NewsFeedHeader from '@/components/user/NewsFeedHeader'
import Post from '@/components/user/Post'
import PostHeader from '@/components/user/PostHeader'
import { db } from '@/config'
import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const index = () => {
  const { posts, fetchPostsAndComments, isLoading, filterPosts } =
    useFetchPosts()

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
      <NewsFeedHeader />

      {isLoading ? (
        <PostSkLoader />
      ) : (
        <FlatList
          // style={{ marginBottom: 30 }}
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
          ListHeaderComponent={<PostHeader filterPosts={filterPosts} />}
        />
      )}
    </SafeAreaView>
  )
}

export default index
