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
  ScrollView,
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

  const sortedConversations = conversations
    .filter((c) => c.updatedAt) // Ensure it filters correctly
    .map((c) => ({
      ...c,
      type: 'conversation',
    }))

  const sortedUserGroups = userGroups.map((g) => ({ ...g, type: 'group' }))

  const mergedArray = [...sortedConversations, ...sortedUserGroups].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )

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
      <View className=" flex-1">
        <SearchUser />
        <View className="mb-5">
          <UserLists />
        </View>
        <ScrollView className={`flex fflex-col mb-16`}>
          <FlatList
            data={mergedArray}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) =>
              item.type === 'conversation' ? (
                <MessageCard key={item.id} conversation={item} />
              ) : (
                <MessageGroupCard key={item.id} group={item} />
              )
            }
            ListEmptyComponent={
              loading || refreshing ? (
                <View className="mt-5 mx-3">
                  <SkUserLoader />
                </View>
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
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
