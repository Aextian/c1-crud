import CallScreen from '@/components/CallScreen'
import MessageCard from '@/components/MessageCard'
import UserList from '@/components/UserList'
import LoadingScreen from '@/components/loadingScreen'
import { useChat } from '@/hooks/useChat'
import useIncomingCall from '@/hooks/useIncommingCall'
import { Link } from 'expo-router'

import React from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'

const index = () => {
  const { conversations } = useChat()
  const { incomingCall, callId } = useIncomingCall()

  return (
    <SafeAreaView style={styles.container}>
      {incomingCall && <CallScreen callId={callId} />}
      <View>
        <UserList />
        <View style={{ paddingHorizontal: 10, marginVertical: 10 }}>
          <View className="flex flex-row items-center justify-center gap-5">
            <Link
              className="bg-red-300 rounded-lg p-2 text-xs font-bold text-black"
              href="/teacher/messages"
            >
              Chats s sd
            </Link>
            <Link
              href="/teacher/messages/group"
              className="bg-green-300 rounded-lg p-2 text-xs font-bold text-black"
            >
              Group Chats
            </Link>
          </View>
          <Text>Messages</Text>
        </View>
        <ScrollView contentContainerStyle={{ display: 'flex', gap: 30 }}>
          {conversations && conversations?.length > 0 ? (
            <>
              {conversations?.map((conversation) => (
                <MessageCard
                  key={conversation.id}
                  conversation={conversation}
                />
              ))}
            </>
          ) : (
            <>
              <LoadingScreen />
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
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
