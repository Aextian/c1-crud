import MessageGroupCard from '@/components/MessageGroupCard'
import SkUserLoader from '@/components/SkLoader'
import { auth } from '@/config'
import { useGetUserGroups } from '@/hooks/useGroupChat'
// import useIncomingCall from '@/hooks/useIncommingCall'
import { Feather } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import { DocumentData } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

const group = () => {
  const currentUser = auth.currentUser
  const userId = currentUser?.uid as string
  const [userGroups, setUserGroups] = useState<DocumentData[]>()
  const getUserGroups = useGetUserGroups()
  const router = useRouter()
  // const { incomingCall, listenForIncomingCalls } = useIncomingCall()
  // get user groups
  useEffect(() => {
    const fetchUserGroups = async () => {
      const groups = await getUserGroups(userId)

      setUserGroups(groups)
    }

    fetchUserGroups()
  }, [userId, getUserGroups])

  return (
    <SafeAreaView style={styles.container}>
      {/* {incomingCall && (
        <CallScreen
          type="group"
          isTeacher={true}
          callId={'WERv7Naf4VdEiyGq5rnE'}
        />
      )} */}
      {/* <Button title="Call" onPress={() => handleAnswer()} />
       */}
      <View>
        <Pressable
          onPress={() => router.push('/user/messages/create-group')}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            gap: 20,
            alignItems: 'center',
            borderColor: 'grey',
            borderWidth: 1,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 10,
          }}
        >
          <View className="flex flex-row items-start gap-5 justify-start">
            <Feather name="message-circle" size={24} />
            <Text>Create a group chat</Text>
          </View>
          <TouchableOpacity disabled>
            <Feather name="send" size={24} />
          </TouchableOpacity>
        </Pressable>
        <View style={{ paddingHorizontal: 10, marginVertical: 10 }}>
          <View className="flex flex-row items-center justify-center gap-5">
            <Link
              className="bg-red-300 rounded-lg p-2 text-xs font-bold text-black"
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
        <ScrollView contentContainerStyle={{ display: 'flex', gap: 30 }}>
          {userGroups && userGroups?.length > 0 ? (
            <>
              {userGroups?.map((group) => (
                <MessageGroupCard key={group.id} group={group} />
              ))}
            </>
          ) : (
            <>
              <SkUserLoader />
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
