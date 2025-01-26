import { db } from '@/config'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { DocumentData, doc, getDoc, updateDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import SkUserLoader from './SkLoader'

const Notification = (data: any) => {
  const [user, setUser] = useState<DocumentData>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const fetchNotifications = async () => {
      const userDoc = doc(db, 'users', data.fromUserId)
      const userSnapshot = await getDoc(userDoc)
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data()
        console.log('userData', userData)
        console.log('userDatad', userData)

        setUser(userData)
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  const router = useRouter()

  const navigateToCommentSection = async (data: DocumentData) => {
    if (data.type !== 'comment') return
    const { id: notificationId, postId } = data
    // Create a reference to the notification document
    const notificationRef = doc(db, 'notifications', notificationId)

    try {
      // Update the isRead field in Firestore
      await updateDoc(notificationRef, {
        isRead: true, // Mark the notification as read
      })
      // Navigate to the comment section after the update
      router.push(`/user/posts/comments/${postId}`)
    } catch (error) {
      console.error('Error updating notification:', error)
    }
    router.push(`/user/posts/comments/${postId}`)
  }

  return loading ? (
    <SkUserLoader />
  ) : (
    <View className="flex flex-row gap-5 mt-5">
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
      <TouchableOpacity
        onPress={() => navigateToCommentSection(data)}
        className="justify-center"
      >
        <Text className="font-bold text-xs first-letter:uppercase">
          {user?.name}
        </Text>
        <Text
          className={`${data.isRead ? 'text-gray-500' : 'text-black-500 font-bold'} pr-12 text-ellipsis`}
          numberOfLines={1}
        >
          {data.message}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default Notification
