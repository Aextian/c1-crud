import { auth, db } from '@/config'
import { FontAwesome, Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Tabs, router } from 'expo-router'
import {
  DocumentData,
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

const _layout = () => {
  const currentUser = auth.currentUser
  const [newNotification, setNewNotification] = useState(false)

  useEffect(() => {
    // Start by setting loading to true
    if (currentUser?.uid) {
      const notificationQuery = query(
        collection(db, 'notifications'),
        where('toUserId', '==', currentUser.uid),
      )
      // Set up the real-time listener
      const unsubscribe = onSnapshot(notificationQuery, (querySnapshot) => {
        const notificationsData: DocumentData[] = querySnapshot.docs.map(
          (doc) => ({
            id: doc.id, // Get document ID
            ...doc.data(), // Get document data
          }),
        )
        const unreadNotifications = notificationsData.filter(
          (notification) => !notification.isRead,
        )
        // Update the state with the notifications
        setNewNotification(unreadNotifications.length > 0)
      })
      // Cleanup the listener on unmount or when currentUser changes
      return () => unsubscribe()
    }
  }, []) // Dependency array to run the effect when currentUser changes

  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#7dc9d6',
        tabBarInactiveTintColor: '#454552',
      }}
    >
      <Tabs.Screen
        name="posts/index"
        options={{
          tabBarStyle: styles.tabBar,
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          // tabBarStyle: { display: 'none' },
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="chatbubbles" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-post"
        options={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
          tabBarIcon: ({ color }) => (
            // <View
            <LinearGradient
              colors={['#7dc9d6', 'transparent']}
              style={{ width: 68, height: 68 }}
              className="  border-2 overflow-hidden  border-white items-center justify-center rounded-full absolute bottom-3  "
            >
              <FontAwesome size={25} name="plus" color={'white'} />
            </LinearGradient>
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View>
              <FontAwesome size={24} name="bell" color={color} />
              {newNotification && (
                <View className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full" />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false, // Hide the header for this screen
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="gear" color={color} />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => router.push('/user/settings')}
            />
          ),
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute', // Make it absolute to position it correctly
    bottom: 10, // Position from the bottom
    left: 20, // Add left margin
    right: 20, // Add right margin
    justifyContent: 'space-between', // Space items evenly
    alignItems: 'center', // Center items vertically
    backgroundColor: '#fff', // Background color
    borderRadius: 25, // Rounded corners
    shadowColor: 'black', // Shadow color
    shadowOffset: { width: 0, height: 10 }, // Shadow offset
    shadowRadius: 10, // Shadow blur
    shadowOpacity: 0.1, // Shadow opacity
    elevation: 5, // Android shadow elevation
  },
})

export default _layout
