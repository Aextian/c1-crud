import PostSkLoader from '@/components/shared/PostSkLoader'
import Posts from '@/components/teacher/Posts'
import { auth, db } from '@/config'
import { useFetchPosts } from '@/hooks/shared/useFetchPosts'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Stack } from 'expo-router'
import { DocumentData } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'

interface IHistory {
  id: string
  title: string
}

const search = () => {
  const { posts, fetchPostsAndComments } = useFetchPosts()
  const [filteredUsers, setFilteredUsers] = useState<DocumentData[]>([])
  const [isLoading, setLoading] = useState(false)
  const [history, setHistory] = useState('')
  const [histories, setHistories] = useState<IHistory[]>([])

  const currentUser = auth?.currentUser

  useEffect(() => {
    const loadHistories = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem(
          `history_${currentUser?.uid}`,
        )
        if (storedTasks) {
          setHistories(JSON.parse(storedTasks))
        }
      } catch (error) {
        console.error('Error loading tasks:', error)
      }
    }

    loadHistories()
  }, [])

  // Save tasks to AsyncStorage whenever tasks change
  useEffect(() => {
    const saveHistories = async () => {
      try {
        await AsyncStorage.setItem(
          `history_${currentUser?.uid}`,
          JSON.stringify(histories),
        )
      } catch (error) {
        console.error('Error saving tasks:', error)
      }
    }

    saveHistories()
  }, [histories])

  const addHistory = () => {
    if (history.trim()) {
      setHistories([
        ...histories,
        { id: Date.now().toString(), title: history },
      ])
      setHistory('')
    }
  }

  const deleteHistory = (id: string) => {
    setHistories(histories.filter((item) => item.id !== id))
  }

  useEffect(() => {
    fetchPostsAndComments()
  }, [db]) // Include db as a dependency if it can change

  const handleSearch = (query: string) => {
    setLoading(true)
    setHistory(query)
    if (!query.trim()) {
      // If the query is empty or only whitespace
      setFilteredUsers([]) // Clear the filtered results
      setLoading(false)
      return
    }
    // Filter posts based on the query
    const filtered = posts?.filter(
      (post: DocumentData) =>
        post.post.toLowerCase().includes(query.toLowerCase()) ||
        post.authorName.toLowerCase().includes(query.toLowerCase()),
    )

    // Simulate delay (e.g., for API call or UI feedback)
    setTimeout(() => {
      addHistory() // Save the search query to history (make sure it handles empty queries appropriately)
      setFilteredUsers(filtered || []) // Update the state with filtered results
      setLoading(false) // Stop the loading spinner
    }, 2000)
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          // headerTitle: 'Users',
          headerSearchBarOptions: {
            placeholder: 'Search',
            hideWhenScrolling: true,
            autoFocus: true,
            // onChangeText: (event) => handleSearch(event.nativeEvent.text),
            // onSearchButtonPress: (event) => console.log(event.nativeEvent.text),
            onSearchButtonPress: (event) => {
              const query = event.nativeEvent.text
              console.log('Search button pressed with query:', query)
              handleSearch(query) // Call your search function
            },
          },
        }}
      />
      <View className="flex flex-col  px-10 mt-10 ">
        {filteredUsers.length === 0 && histories.length > 0 && (
          <Text>Search History</Text>
        )}
        {filteredUsers.length === 0 &&
          histories
            .slice(-5)
            .reverse()
            .map((item, index) => (
              <View
                key={item.id || index} // Prefer item.id for better key uniqueness
                className="flex flex-row justify-between bg-gray-200 p-1 "
              >
                <Text>{item.title}</Text>
                <TouchableOpacity onPress={() => deleteHistory(item.id)}>
                  <Text className="text-red-500">X</Text>
                </TouchableOpacity>
              </View>
            ))}
      </View>
      <View>
        {isLoading ? (
          <PostSkLoader />
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            // refreshControl={
            //   <RefreshControl
            //     refreshing={refreshing}
            //     onRefresh={onRefresh} // This triggers the refresh logic
            //     colors={['#ff0000']} // Optional, for custom colors
            //     progressBackgroundColor="#ffffff" // Optional, for the background color of the spinner
            //   />
            // }
            renderItem={({ item, index }) => (
              <Posts item={item} index={index} />
            )}
          />
        )}
      </View>
    </View>
  )
}

export default search
