import UserLists from '@/components/user/UserLists'
import { Feather } from '@expo/vector-icons'
import { Link } from 'expo-router'
import React, { useState } from 'react'
import {
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

const SearchUser = () => {
  const [search, setSearch] = useState('')
  return (
    <View className="flex-1 justify-start items-start bg-white">
      <ImageBackground
        source={require('../../../assets/images/bgsvg.png')}
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: 0.3,
          },
        ]}
      />
      <View className="w-full bg-white shadow">
        <TextInput
          className="w-full rounded-xl p-5"
          autoFocus
          value={search}
          placeholder="Search by name or email"
          onChangeText={setSearch}
        />
      </View>
      <Link href="/user/(messages)/group/create" asChild>
        <TouchableOpacity className="flex-row items-center gap-10 px-10 py-3 w-full">
          <Feather name="users" size={24} color="black" />
          <Text>Group chat</Text>
        </TouchableOpacity>
      </Link>

      <UserLists search={search} />
    </View>
  )
}

export default SearchUser
