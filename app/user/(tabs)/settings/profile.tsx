import PostSkLoader from '@/components/shared/PostSkLoader'
import ProfileSkLoader from '@/components/shared/ProfileSkLoader'
import Posts from '@/components/user/Post'
import ProfileHeader from '@/components/user/ProfileHeader'
import { auth } from '@/config'
import useUserAndPosts from '@/hooks/shared/useUserAndPosts'
import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
import userCoverUploads from '@/hooks/userCoverUploads'
import { Stack, useLocalSearchParams } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { FlatList, RefreshControl, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const profile = () => {
  useHideTabBarOnFocus()

  const currentUser = auth?.currentUser
  const { id } = useLocalSearchParams<{ id: string }>()
  const { pickImage, image } = userCoverUploads(currentUser?.uid || '')
  const [refreshing, setRefreshing] = useState(false)
  const onRefresh = useCallback(() => {}, [])
  const { posts, user, isLoading } = useUserAndPosts(id)

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <Stack.Screen options={{ headerShown: false }} />
        {isLoading ? (
          <ProfileSkLoader />
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#ff0000']}
                progressBackgroundColor="#ffffff"
              />
            }
            ListEmptyComponent={
              isLoading ? (
                <PostSkLoader />
              ) : (
                <View className="flex justify-center items-center">
                  <Text>No posts yet</Text>
                </View>
              )
            }
            renderItem={({ item, index }) => (
              <Posts item={item} index={index} />
            )}
            ListHeaderComponent={
              <View className="flex mb-20  justify-center  w-full">
                <ProfileHeader user={user} id={id} pickImage={pickImage} />
              </View>
            }
            showsVerticalScrollIndicator={false} // Hides the scrollbar for cleaner look
          />
        )}
      </SafeAreaView>
    </>
  )
}

export default profile
