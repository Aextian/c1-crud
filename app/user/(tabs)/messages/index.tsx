import SearchUser from '@/components/shared/SearchUser'
import SkUserLoader from '@/components/shared/SkLoader'
import MessageCard from '@/components/user/MessageCard'
import MessageGroupCard from '@/components/user/MessageGroupCard'
import UserLists from '@/components/user/UserLists'
import { auth } from '@/config'
import { useChat } from '@/hooks/useChat'
import { useGetUserGroups } from '@/hooks/useGroupChat'

import React, { useCallback, useState } from 'react'
import {
  FlatList,
  ImageBackground,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native'
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

  const sortedConversations = [...conversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )

  const sortedUserGroups = [...userGroups].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )

  // get the last updated conversation
  const lastConversation = sortedConversations[0]
  const lastGroup = sortedUserGroups[0]

  const isNewConversation = lastGroup?.updatedAt > lastConversation?.updatedAt

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../../../assets/images/bgsvg.png')}
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: 0.3,
          },
        ]}
      />
      <View>
        <SearchUser />
        <UserLists />
        <View
          className={`flex flex-col ${isNewConversation && 'flex-col-reverse'}`}
        >
          <FlatList
            data={sortedConversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageCard key={item.id} conversation={item} />
            )}
            ListEmptyComponent={
              loading || refreshing ? (
                <SkUserLoader />
              ) : (
                <View>
                  <Text style={{ textAlign: 'center' }}>
                    No conversation found
                  </Text>
                </View>
              )
            } // Show when no conversations exist
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
          {/* group chat */}
          <FlatList
            data={sortedUserGroups}
            keyExtractor={(item) => item.id} // Extract unique key for each group
            renderItem={({ item }) => <MessageGroupCard group={item} />} // Render each group
            contentContainerStyle={{ paddingVertical: 20, gap: 30 }} // Styling for the container
          />
        </View>
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
