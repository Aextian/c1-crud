import PostSkLoader from '@/components/shared/PostSkLoader'
import ProfileSkLoader from '@/components/shared/ProfileSkLoader'
import Posts from '@/components/user/Post'
import ProfileHeader from '@/components/user/ProfileHeader'
import { auth } from '@/config'
import useUserAndPosts from '@/hooks/shared/useUserAndPosts'
import userCoverUploads from '@/hooks/userCoverUploads'
import { Stack, useLocalSearchParams } from 'expo-router'
import React, { useCallback, useState } from 'react'
import {
  FlatList,
  ImageBackground,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

const profile = () => {
  const currentUser = auth?.currentUser
  const { id } = useLocalSearchParams<{ id: string }>()
  const { pickImage, image } = userCoverUploads(currentUser?.uid || '')
  const [refreshing, setRefreshing] = useState(false)
  const onRefresh = useCallback(() => {}, [])
  const { posts, user, isLoading } = useUserAndPosts(id)

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ zIndex: 99999 }}>
          <Toast />
        </View>
        <ImageBackground
          source={require('../../../assets/images/bgsvg.png')} // Add your background image here
          style={styles.overlay}
        />
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
              <View className="flex mb-20 justify-center  w-full">
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
export default profile
