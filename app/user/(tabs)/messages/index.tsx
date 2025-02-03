import MessageCard from '@/components/MessageCard'
import MessageGroupCard from '@/components/MessageGroupCard'
import SkUserLoader from '@/components/SkLoader'
import SearchUser from '@/components/shared/SearchUser'
import UserLists from '@/components/teacher/UserLists'
import { auth } from '@/config'
import { useChat } from '@/hooks/useChat'
import { useGetUserGroups } from '@/hooks/useGroupChat'
import { DocumentData } from 'firebase/firestore'

import React, { useCallback, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const index = () => {
  const [refreshing, setRefreshing] = useState(false)
  const currentUser = auth?.currentUser
  const { userGroups } = useGetUserGroups(String(currentUser?.uid))
  const { conversations, loading, refreshConversations } = useChat()

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refreshConversations()
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
        <FlatList
          data={userGroups} // Pass conversations to FlatList
          keyExtractor={(item) => item.id} // Extract unique key for each conversation
          renderItem={({ item }) => <MessageGroupCard group={item} />} // Render each conversation
          contentContainerStyle={{ paddingVertical: 20, gap: 30 }} // Styling for the container
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
