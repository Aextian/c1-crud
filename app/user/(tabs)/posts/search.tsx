import PostSkLoader from '@/components/shared/PostSkLoader'
import Posts from '@/components/user/Post'
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

  const addHistory = (query: string) => {
    setHistories((prevHistories) => {
      // Check if query already exists in history
      if (
        prevHistories.some(
          (item) => item.title.toLowerCase() === query.toLowerCase(),
        )
      ) {
        return prevHistories // Return the same state if duplicate
      }
      return [...prevHistories, { id: Date.now().toString(), title: query }]
    })
  }

  const deleteHistory = (id: string) => {
    setHistories(histories.filter((item) => item.id !== id))
  }

  useEffect(() => {
    fetchPostsAndComments()
  }, [db]) // Include db as a dependency if it can change

  const handleSearch = async (query: string) => {
    setLoading(true)

    if (!query.trim()) {
      setFilteredUsers([]) // Clear the filtered results
      setLoading(false)
      return
    }

    try {
      // Simulate an async operation (replace with an actual API call if needed)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const filtered = posts?.filter(
        (post: DocumentData) =>
          post.post.toLowerCase().includes(query.toLowerCase()) ||
          post.authorName.toLowerCase().includes(query.toLowerCase()),
      )

      setFilteredUsers(filtered || [])
      addHistory(query)
    } catch (error) {
      console.error('Error in handleSearch:', error)
    } finally {
      setLoading(false) // Ensure loading state is reset
    }
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
                <TouchableOpacity onPress={() => handleSearch(item.title)}>
                  <Text>{item.title}</Text>
                </TouchableOpacity>
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
