import useUser from '@/hooks/useUser'
import { Stack } from 'expo-router'
import { DocumentData } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const manageUsers = () => {
  const { users } = useUser()
  const [filteredUsers, setFilteredUsers] = useState(users ?? [])

  useEffect(() => {
    if (users) setFilteredUsers(users)
  }, users)

  const handleSearch = (query: string) => {
    const filtered = users?.filter((user) =>
      user.name.toLowerCase().includes(query.toLowerCase()),
    )
    if (query === '' && users) {
      setFilteredUsers(users)
    } else {
      setFilteredUsers(filtered || [])
    }
  }

  return (
    <View style={{ flex: 1, padding: 10, paddingTop: 35, gap: 10 }}>
      <Stack.Screen
        options={{
          headerTitle: 'Users',
          headerSearchBarOptions: {
            placeholder: 'Search Users',
            hideWhenScrolling: true,
            onChangeText: (event) => handleSearch(event.nativeEvent.text),
          },
        }}
      />
      <View className="w-full  bg-green-200 mb-5 rounded-xl p-5 flex flex-row gap-10 items-center justify-center">
        <Text>Users</Text>
      </View>
      {filteredUsers?.map((user: DocumentData) => (
        <View className="flex items-start gap-5 flex-row justify-between">
          <View className="flex flex-col gap-2">
            <Text>{user.name}</Text>
            <Text style={{ fontSize: 10 }}>{user.email}</Text>
          </View>
          <View className="flex items-center flex-row gap-2">
            <TouchableOpacity className="bg-green-300 p-2 rounded-xl">
              <Text>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-red-300 p-2 rounded-xl">
              <Text>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  )
}

export default manageUsers
