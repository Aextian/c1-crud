import { db } from '@/config'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { DocumentData, doc, getDoc, updateDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

const Notification = (data: DocumentData) => {
  const [user, setUser] = useState<DocumentData>()
  const [isDisabled, setDisabled] = useState(false)

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

  const router = useRouter()

  const navigateToCommentSection = async (data: DocumentData) => {
    setDisabled(true)

    const { id: notificationId, postId } = data
    const notificationRef = doc(db, 'notifications', notificationId)

    if (data.type !== 'comment' && data.type !== 'reply') {
      await updateDoc(notificationRef, {
        isRead: true, // Mark the notification as read
      })
      setDisabled(false)

      return
    }

    try {
      // Update the isRead field in Firestore
      await updateDoc(notificationRef, {
        isRead: true, // Mark the notification as read
      })
      // Navigate to the comment section after the update
      router.push(`/user/(posts)/comment/${postId}`)
      setDisabled(false)
    } catch (error) {
      setDisabled(false)
      console.error('Error updating notification:', error)
    }
  }

  return (
    <View className="flex flex-row gap-5 mt-5  bg-white ">
      <View className="rounded-full h-12 w-12 border items-center justify-center ">
        {user?.avatar && user?.avatar !== 'undefined' ? (
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
        disabled={isDisabled}
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
