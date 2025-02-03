import { Feather } from '@expo/vector-icons'
import { Link } from 'expo-router'
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

const PostsHeader = () => {
  return (
    <View className="flex flex-row justify-between px-5 mt-5 mb-10">
      <View className="flex flex-row items-center gap-2">
        <Image
          source={require('../../assets/images/logo.png')}
          style={{ width: 35, height: 35, borderRadius: 100 }}
          resizeMode="contain" // Ensure the image scales correctly
        />
        <Text className="text-3xl font-semibold">WeConnect</Text>
      </View>

      <View className="flex flex-row gap-5">
        <Link href={'/user/(tabs)/posts/search'} asChild>
          <TouchableOpacity>
            <Feather name="search" size={24} color="black" />
          </TouchableOpacity>
        </Link>
        <Link href={'/user/(tabs)/posts/favorites'} asChild>
          <TouchableOpacity>
            <Feather name="heart" size={24} color="black" />
          </TouchableOpacity>
        </Link>
        <Link href={'/user/(tabs)/posts/calendar'} asChild>
          <TouchableOpacity>
            <Feather name="calendar" size={24} color="black" />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  )
}

export default PostsHeader
