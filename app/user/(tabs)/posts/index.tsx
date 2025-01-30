import { useFetchPosts } from '@/api/useFetchPosts'
import PostHeader from '@/components/PostHeader'
import PostSkLoader from '@/components/shared/PostSkLoader'
import Posts from '@/components/teacher/Posts'
import PostsHeader from '@/components/teacher/PostsHeader'
import { db } from '@/config'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, RefreshControl, SafeAreaView } from 'react-native'

const index = () => {
  const { posts, fetchPostsAndComments, isLoading, filterPosts } =
    useFetchPosts()

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <PostsHeader />

      {isLoading ? (
        <PostSkLoader />
      ) : (
        <FlatList
          style={{ marginBottom: 30 }}
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
          ListHeaderComponent={<PostHeader filterPosts={filterPosts} />}
        />
      )}
    </SafeAreaView>
  )
}

export default index
