import { db } from '@/config'
import { Ionicons } from '@expo/vector-icons'
import Feather from '@expo/vector-icons/build/Feather'
import { collection, onSnapshot } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'

const HomeHeader = () => {
  const [userCount, setUserCount] = useState(0)
  const [postCount, setPostCount] = useState(0)

  useEffect(() => {
    const userRef = collection(db, 'users')
    const postRef = collection(db, 'posts')

    const unsubscribeUsr = onSnapshot(userRef, (snapshot) => {
      const users = snapshot.docs.map((doc) => doc.data())
      setUserCount(users.length)
    })

    const unsubscribePost = onSnapshot(postRef, (snapshot) => {
      const posts = snapshot.docs.map((doc) => doc.data())
      setPostCount(posts.length)
    })

    return () => {
      unsubscribeUsr()
      unsubscribePost()
    }
  }, [])

  return (
    <View className="w-full mt-5 bg-green-200 rounded-xl p-5 flex flex-row gap-10 items-center justify-center">
      <View className="flex flex-row gap-2 items-center">
        <Feather name="users" color={'green'} size={28} />
        <Text>{userCount}</Text>
      </View>
      <View className="flex flex-row gap-2 items-center">
        <Ionicons name="book" color={'green'} size={28} />
        <Text>{postCount}</Text>
      </View>
    </View>
  )
}

export default HomeHeader
