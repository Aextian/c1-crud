import { Feather } from '@expo/vector-icons'
import { Link } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const SearchUser = () => {
  return (
    <Link href={'/user/messages/search-user'} asChild>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          // gap: 20,
          alignItems: 'center',
          borderColor: 'grey',
          borderWidth: 1,
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 10,
        }}
      >
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
