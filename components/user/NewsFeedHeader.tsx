import { auth, db } from '@/config'
import { Feather } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { DocumentData, collection, onSnapshot } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

const NewsFeedHeader = () => {
  const currentUser = auth.currentUser
  const [events, setEvents] = useState<DocumentData[]>([])
  const dateToday = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const eventsRef = collection(
      db,
      'events',
      String(currentUser?.uid),
      'userEvents',
    )

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      eventsRef,
      (querySnapshot) => {
        const events = querySnapshot.docs.map((doc) => doc.data())
        setEvents(events.filter((event) => event.date === dateToday))
      },
      (error) => {
        console.error('Error fetching events:', error)
      },
    )

    // Cleanup function to unsubscribe when component unmounts
    return () => unsubscribe()
  }, [currentUser?.uid, dateToday]) // Add dependencies for re-subscription

  return (
    <View className="flex flex-row justify-between px-5 mt-5 mb-10">
      <View className="flex flex-row items-center gap-2">
        <Image
          source={require('../../assets/images/logo.png')}
          style={{ width: 35, height: 35, borderRadius: 100 }}
          resizeMode="contain" // Ensure the image scales correctly
        />
        <Text className="text-3xl font-semibold">WeConnect</Text>
      </View>

      <View className="flex flex-row gap-5">
        <Link href={'/user/(posts)/search'} asChild>
          <TouchableOpacity>
            <Feather name="search" size={24} color="black" />
          </TouchableOpacity>
        </Link>
        <Link href={'/user/(posts)/favorites'} asChild>
          <TouchableOpacity>
            <Feather name="heart" size={24} color="black" />
          </TouchableOpacity>
        </Link>
        <Link href={'/user/(posts)/calendar'} asChild>
          <TouchableOpacity>
            <Feather name="calendar" size={24} color="black" />
            {events.length > 0 && (
              <View className="w-2 h-2 bg-red-500 rounded-full absolute top-0 right-0" />
            )}
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  )
}

export default NewsFeedHeader
