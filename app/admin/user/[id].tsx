import { db } from '@/config'
import { Feather } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { DocumentData, doc, getDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { Image, Text, View } from 'react-native'

const User = () => {
  const { id } = useLocalSearchParams<{ id: string }>()

  const [user, setUser] = useState<DocumentData>()

  useEffect(() => {
    const fetchUser = async () => {
      const docRef = doc(db, 'users', String(id))
      const userSnap = await getDoc(docRef) // Await the getDoc call
      if (userSnap.exists()) {
        const userData = userSnap.data()
        setUser(userData)
      }
    }
    fetchUser()
  }, [id])

  console.log(user)
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
      }}
    >
      <View className="bg-white shadow-lg mt-10 p-6 rounded-2xl w-96 flex flex-col gap-4">
        {/* Avatar */}
        <View
          style={{
            height: 80,
            width: 80,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: '#ddd',
            borderRadius: 50,
            backgroundColor: '#f0f0f0',
          }}
        >
          {user?.avatar && user?.avatar !== 'undefined' ? (
            <Image
              source={{ uri: user.avatar }}
              alt="avatar"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 50,
              }}
            />
          ) : (
            <Feather name="user" size={32} color="#888" />
          )}
        </View>

        {/* User Information */}
        <View className="flex flex-col items-center gap-5">
          <Text className="text-lg font-semibold text-gray-800">
            Name: {user?.name}
          </Text>
          <Text className="text-gray-600">Email: {user?.email}</Text>
          <Text className="text-gray-600">Role: {user?.role}</Text>
        </View>

        {/* Student-Specific Details */}
        {user?.role === 'student' && (
          <View className="bg-gray-100 p-4 rounded-lg flex gap-5">
            <Text className="text-gray-700 font-semibold">
              Student Details:
            </Text>
            <Text className="text-gray-600">Section: {user?.section}</Text>
            <Text className="text-gray-600">Year: {user?.year}</Text>
            <Text className="text-gray-600">Course: {user?.course}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default User
