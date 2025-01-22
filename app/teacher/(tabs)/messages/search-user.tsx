import UserList from '@/components/UserList'
import React, { useState } from 'react'
import { TextInput, View } from 'react-native'

const SearchUser = () => {
  const [search, setSearch] = useState('')
  return (
    <View>
      <View className="px-10 py-3">
        <TextInput
          className="w-full border border-gray-300 rounded-2xl p-3"
          autoFocus
          value={search}
          placeholder="Search by name or email"
          onChangeText={setSearch}
        />
      </View>
      <UserList search={search} role="teacher" />
    </View>
  )
}

export default SearchUser
