import { Feather } from '@expo/vector-icons'
import { Link } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const SearchUser = () => {
  return (
    <Link href={'/user/messages/search-user'} asChild>
      <TouchableOpacity className="flex flex-row items-center justify-between gap-5 border border-gray-300 p-3 rounded-xl">
        <View className="flex flex-row items-start gap-5 justify-start">
          <Feather name="users" size={24} />
          <Text>Search by name or email</Text>
        </View>
        <TouchableOpacity disabled>
          <Feather name="search" size={24} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Link>
  )
}

export default SearchUser
