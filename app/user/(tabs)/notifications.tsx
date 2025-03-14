import SkUserLoader from '@/components/shared/SkLoader'
import Notification from '@/components/user/Notification'
import { auth, db } from '@/config'
import {
  DocumentData,
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
  FlatList,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

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

  const sortedNotifications = [...notifications].sort((a, b) => {
    // Prioritize unread notifications
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1 // Unread first
    }

    // Sort by createdAt (latest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#fff', paddingTop: 35, padding: 10 }}
    >
      <ImageBackground
        source={require('../../../assets/images/bgsvg.png')}
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: 0.3,
          },
        ]}
      />
      <FlatList
        style={{ marginBottom: 50 }}
        data={sortedNotifications}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View className="mb-10">
              <Text className="text-3xl font-bold">Notifications</Text>
            </View>
            {!loading && notifications.length === 0 && (
              <Text className="text-center text-gray-500">
                No notifications found.
              </Text>
            )}
          </>
        }
        ListEmptyComponent={loading ? <SkUserLoader /> : null}
        renderItem={({ item }: { item: DocumentData }) => (
          <Notification {...item} />
        )}
      />
    </SafeAreaView>
  )
}

export default notifications
