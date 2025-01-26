import MessageCard from '@/components/MessageCard'
import SkUserLoader from '@/components/SkLoader'
import SearchUser from '@/components/shared/SearchUser'
import UserLists from '@/components/teacher/UserLists'
import { useChat } from '@/hooks/useChat'
import { Link } from 'expo-router'
import { DocumentData } from 'firebase/firestore'

import React, { useCallback, useEffect, useState } from 'react'
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

const index = () => {
  const { conversations, loading, fetchConversations } = useChat()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchConversations()
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchConversations() // Fetch new data
    setRefreshing(false) // Hide the spinner
  }, [])

  const renderItem = ({ item }: { item: DocumentData }) => {
    if (item.messages && item.messages.length > 0) {
      return <MessageCard key={item.id} conversation={item} />
    }
    return null
  }

  // Empty component when no conversations are available
  const renderEmptyComponent = () => {
    if (loading || refreshing) {
      return <SkUserLoader />
    }
    return (
      <View>
        <Text style={{ textAlign: 'center' }}>No conversation found</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <SearchUser />
        <UserLists />
        <View style={{ paddingHorizontal: 10, marginVertical: 10 }}>
          <View className="flex flex-row items-center justify-center gap-5">
            <Link
              className="bg-gray-500 rounded-lg p-2 text-xs font-bold text-white"
              href="/user/messages"
            >
              Chats
            </Link>
            <Link
              href="/user/messages/group"
              className="bg-green-300 rounded-lg p-2 text-xs font-bold text-black"
            >
              Group Chats
            </Link>
          </View>
          <Text>Messages</Text>
        </View>
        {/* <ScrollView contentContainerStyle={{ display: 'flex', gap: 30 }}>
          {conversations && conversations?.length > 0 ? (
            <>
              {conversations?.map((conversation) =>
                conversation.messages && conversation.messages.length > 0 ? (
                  <MessageCard
                    key={conversation.id}
                    conversation={conversation}
                  />
                ) : null,
              )}
            </>
          ) : (
            <>
              {loading ? (
                <SkUserLoader />
              ) : (
                <View>
                  <Text style={{ textAlign: 'center' }}>
                    No conversation found
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView> */}

        <FlatList
          data={conversations} // Pass conversations to FlatList
          keyExtractor={(item) => item.id} // Extract unique key for each conversation
          renderItem={renderItem} // Render each conversation
          ListEmptyComponent={renderEmptyComponent} // Show when no conversations exist
          contentContainerStyle={{ paddingVertical: 20, gap: 30 }} // Styling for the container
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh} // This triggers the refresh logic
              colors={['#ff0000']} // Optional, for custom colors
              progressBackgroundColor="#ffffff" // Optional, for the background color of the spinner
            />
          }
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    // paddingTop: 50,
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  messageList: {
    paddingBottom: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
    maxWidth: '80%',
  },
  myMessage: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#e5e5ea',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
})

export default index
