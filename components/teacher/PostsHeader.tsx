import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const PostsHeader = () => {
  const router = useRouter()
  const navigatetoSearch = () => {
    router.push('/teacher/(tabs)/posts/search')
  }
  const navigateToFavorites = () => {
    router.push('/teacher/(tabs)/posts/favorites')
  }
  return (
    <View className="flex flex-row justify-between px-5 my-10">
      <Text className="text-3xl font-semibold">WeConnect</Text>
      <View className="flex flex-row gap-5">
        <TouchableOpacity onPress={navigatetoSearch}>
          <Feather name="search" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={navigateToFavorites}>
          <Feather name="heart" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default PostsHeader
