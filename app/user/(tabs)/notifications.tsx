import Notification from '@/components/Notification'
import { auth, db } from '@/config'
import {
  DocumentData,
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { FlatList, Text, View } from 'react-native'

const notifications = () => {
  const currentUser = auth.currentUser
  const [notifications, setNotifications] = useState<DocumentData[]>([])

  // find who send the notifications

  useEffect(() => {
    if (currentUser?.uid) {
      const notificationQuery = query(
        collection(db, 'notifications'),
        where('fromUserId', '!=', currentUser.uid),
      )

      // Set up the real-time listener
      const unsubscribe = onSnapshot(notificationQuery, (querySnapshot) => {
        const notificationsData = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Get document ID
          ...doc.data(), // Get document data
        }))
        setNotifications(notificationsData) // Store the notifications
      })

      // Cleanup the listener on unmount or when currentUser changes
      return () => unsubscribe()
    }
  }, [currentUser?.uid]) // Dependency array to run the effect when currentUser changes

  return (
    <View style={{ flex: 1, paddingTop: 35, padding: 10 }}>
      <View className="mb-10">
        <Text className="text-2xl font-bold">Notifications</Text>
      </View>

      {/* FlatList to render notifications */}
      {notifications.length === 0 && (
        <Text className="text-center text-gray-500">
          No notifications found.
        </Text>
      )}
      <FlatList
        data={notifications}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Notification {...item} />}
      />
    </View>
  )
}

export default notifications
