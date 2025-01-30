import ProfileHeader from '@/components/ProfileHeader'
import PostSkLoader from '@/components/shared/PostSkLoader'
import ProfileSkLoader from '@/components/shared/ProfileSkLoader'
import Posts from '@/components/teacher/Posts'
import { auth } from '@/config'
import useUserAndPosts from '@/hooks/shared/useUserAndPosts'
import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
import userCoverUploads from '@/hooks/userCoverUploads'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { FlatList, RefreshControl, SafeAreaView, View } from 'react-native'

const profile = () => {
  useHideTabBarOnFocus()

  const currentUser = auth?.currentUser
  const { id } = useLocalSearchParams<{ id: string }>()
  const { pickImage, image } = userCoverUploads(currentUser?.uid || '')
  const [refreshing, setRefreshing] = useState(false)
  const onRefresh = useCallback(() => {}, [])
  const router = useRouter()

  const { posts, user, isLoading } = useUserAndPosts(id)

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        {/* User Posts */}
        {/* <View className="mt-60 flex  justify-center  w-full"> */}
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
            ListEmptyComponent={<PostSkLoader />}
            renderItem={({ item, index }) => (
              <Posts item={item} index={index} />
            )}
            ListHeaderComponent={
              <View className="flex mb-96  justify-center  w-full">
                <ProfileHeader user={user} id={id} pickImage={pickImage} />
              </View>
            }
          />
        )}
      </SafeAreaView>
    </>
  )
}

export default profile
