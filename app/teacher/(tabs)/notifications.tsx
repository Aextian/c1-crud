import Notification from '@/components/Notification'
import { auth, db } from '@/config'
import {
  DocumentData,
  collection,
  getDocs,
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
    // const q = query (collection(db, 'notifications')),where('receiver', '==', currentUser.uid)
    const fetchNotifications = async () => {
      const notificationQuery = query(
        collection(db, 'notifications'),
        where('fromUserId', '==', currentUser?.uid),
      )

      const querySnapshot = await getDocs(notificationQuery)

      const notificationsData = querySnapshot.docs.map((doc) => doc.data())

      setNotifications(notificationsData)
    }
    fetchNotifications()
  }, [currentUser?.uid])

  console.log(notifications)

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
        keyExtractor={(item, index) => index.toString()} // Ensure each item has a unique key
        renderItem={({ item }) => <Notification {...item} />} // Assuming Notification component takes the correct props
      />
    </View>
  )
}

export default notifications
