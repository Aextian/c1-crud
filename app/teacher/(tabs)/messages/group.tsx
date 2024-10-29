import CallScreen from '@/components/CallScreen'
import MessageGroupCard from '@/components/MessageGroupCard'
import LoadingScreen from '@/components/loadingScreen'
// import MessageCard from '@/components/messageCard'
import { auth } from '@/config'
import { useCreateGroup, useGetUserGroups } from '@/hooks/useGroupChat'
import useIncomingCall from '@/hooks/useIncommingCall'
import { Feather } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import { DocumentData } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

const group = () => {
  const [groupChatName, setGroupChatName] = useState('')
  const currentUser = auth.currentUser
  const userId = currentUser?.uid as string
  const [userGroups, setUserGroups] = useState<DocumentData[]>()
  const createGroup = useCreateGroup()
  const getUserGroups = useGetUserGroups()

  const router = useRouter()

  const handleCreateGroup = async () => {
    await createGroup(groupChatName, [currentUser?.uid])
    setGroupChatName('')
  }

  // get user groups
  useEffect(() => {
    const fetchUserGroups = async () => {
      const groups = await getUserGroups(userId)
      setUserGroups(groups)
    }
    fetchUserGroups()
  }, [userId, getUserGroups])

  const { incomingCall, callId } = useIncomingCall()
  return (
    <SafeAreaView style={styles.container}>
      {incomingCall && <CallScreen callId={callId} />}
      <View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            gap: 20,
            alignItems: 'center',
            borderColor: 'grey',
            borderWidth: 1,
            paddingHorizontal: 20,
            borderRadius: 10,
          }}
        >
          <Feather name="message-circle" size={24} />
          <TextInput
            style={{
              flex: 1,
              padding: 10,
              width: '100%',
              outlineStyle: 'none',
            }}
            placeholder="Create a group chat"
            value={groupChatName}
            placeholderTextColor={'#999'}
            onChangeText={(groupChatName) => setGroupChatName(groupChatName)}
          />
          <TouchableOpacity onPress={handleCreateGroup}>
            <Feather name="send" size={24} />
          </TouchableOpacity>
          <Link href="/teacher/(tabs)/messages/create-group">
            <Text>Navigate Create </Text>
          </Link>
        </View>
        <View style={{ paddingHorizontal: 10, marginVertical: 10 }}>
          <View className="flex flex-row items-center justify-center gap-5">
            <Link
              className="bg-red-300 rounded-lg p-2 text-xs font-bold text-black"
              href="/teacher/messages"
            >
              Chats
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
          {userGroups && userGroups?.length > 0 ? (
            <>
              {userGroups?.map((group) => (
                <MessageGroupCard key={group.id} group={group} />
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

export default group
