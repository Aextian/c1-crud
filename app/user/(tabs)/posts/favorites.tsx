import PostSkLoader from '@/components/shared/PostSkLoader'
import Posts from '@/components/user/Post'
import { db } from '@/config'
import { useFetchPostsFavorites } from '@/hooks/shared/useFetchPostsFavorites'
import { Stack } from 'expo-router'
import React, { useEffect } from 'react'
import { FlatList, ImageBackground, StyleSheet, View } from 'react-native'

const favorites = () => {
  const { posts, fetchPostsAndComments, isLoading } = useFetchPostsFavorites()
  useEffect(() => {
    fetchPostsAndComments()
  }, [db]) // Include db as a dependency if it can change

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ImageBackground
        source={require('../../../../assets/images/bgsvg.png')}
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: 0.3,
          },
        ]}
      />
      <Stack.Screen
        options={{
          headerTitle: 'Favorites',
        }}
      />

      <View>
        {isLoading ? (
          <PostSkLoader />
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            // refreshControl={
            //   <RefreshControl
            //     refreshing={refreshing}
            //     onRefresh={onRefresh} // This triggers the refresh logic
            //     colors={['#ff0000']} // Optional, for custom colors
            //     progressBackgroundColor="#ffffff" // Optional, for the background color of the spinner
            //   />
            // }
            renderItem={({ item, index }) => (
              <Posts item={item} index={index} />
            )}
          />
        )}
      </View>
    </View>
  )
}

export default favorites
