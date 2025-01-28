import Notification from '@/components/Notification'
import SkUserLoader from '@/components/SkLoader'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Start by setting loading to true
    setLoading(true)

    if (currentUser?.uid) {
      const notificationQuery = query(
        collection(db, 'notifications'),
        where('toUserId', '==', currentUser.uid),
      )
      // Set up the real-time listener
      const unsubscribe = onSnapshot(notificationQuery, (querySnapshot) => {
        const notificationsData = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Get document ID
          ...doc.data(), // Get document data
        }))
        // Update the state with the notifications
        setNotifications(notificationsData)
        // Set loading to false once data is fetched
        setLoading(false)
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
      {notifications.length === 0 && !loading && (
        <Text className="text-center text-gray-500">
          No notifications found.
        </Text>
      )}
      {loading && <SkUserLoader />}
      <FlatList
        data={notifications}
        keyExtractor={(item: DocumentData, index: string) => index.toString()}
        renderItem={({ item }: { item: DocumentData }) => (
          <Notification {...item} />
        )}
      />
    </View>
  )
}

export default notifications
