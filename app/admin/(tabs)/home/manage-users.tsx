import useUser from '@/hooks/useUser'
import { DocumentData } from 'firebase/firestore'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const manageUsers = () => {
  const { users } = useUser()

  return (
    <View style={{ flex: 1, padding: 10, paddingTop: 35, gap: 10 }}>
      <View className="mb-10">
        <Text>Users</Text>
      </View>
      {users?.map((user: DocumentData) => (
        <View className="flex items-start flex-row justify-between">
          <Text>{user.name}</Text>
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
