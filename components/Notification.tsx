import { db } from '@/config'
import { Feather } from '@expo/vector-icons'
import { DocumentData, doc, getDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { Image, Text, View } from 'react-native'

const Notification = (data: any) => {
  const [user, setUser] = useState<DocumentData>()

  useEffect(() => {
    const fetchNotifications = async () => {
      const userDoc = doc(db, 'users', data.fromUserId)
      const userSnapshot = await getDoc(userDoc)
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data()
        setUser(userData)
      }
    }
    fetchNotifications()
  }, [])

  return (
    <View className="flex flex-row gap-5">
      <View className="rounded-full h-12 w-12 border items-center justify-center ">
        {user?.avatar ? (
          <Image
            source={{ uri: user?.avatar }}
            style={{ width: '100%', height: '100%', borderRadius: 100 }}
          />
        ) : (
          <Feather name="user" size={24} color="black" />
        )}
      </View>
      <View className="justify-center">
        <Text className="font-bold text-xs first-letter:uppercase">
          {user?.name}
        </Text>
        <Text className="text-gray-500 pr-12 text-ellipsis" numberOfLines={1}>
          {data.message}
        </Text>
      </View>
    </View>
  )
}

export default Notification
