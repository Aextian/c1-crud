import CallScreen from '@/components/CallScreen'
import MessageCard from '@/components/MessageCard'
import UserList from '@/components/UserList'
import LoadingScreen from '@/components/loadingScreen'
// import MessageCard from '@/components/messageCard'
import { auth, db } from '@/config'
import { useChat } from '@/hooks/useChat'
import { useCreateGroup, useGetUserGroups } from '@/hooks/useGroupChat'
import { Feather } from '@expo/vector-icons'
import { Link } from 'expo-router'
import {
  DocumentData,
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
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

const index = () => {
  const [groupChatName, setGroupChatName] = useState('')
  const [rooms, setChatRoom] = useState<DocumentData[] | undefined>()
  const { conversations } = useChat()
  const currentUser = auth.currentUser

  const [userGroups, setUserGroups] = useState<DocumentData[] | undefined>()

  // groupchat
  const createGroup = useCreateGroup()
  const getUserGroups = useGetUserGroups()

  const handleCreateGroup = async () => {
    const groupId = await createGroup(groupChatName, [currentUser?.uid])
    setGroupChatName('')
    console.log('New group created with ID:', groupId)
  }
  useEffect(() => {
    const fetchUserGroups = async () => {
      const groups = await getUserGroups(currentUser?.uid)
      setUserGroups(groups)
    }
    fetchUserGroups()
  }, [currentUser, getUserGroups])

  // Function to handle sending a new message
  // get all chat rooms
  useEffect(() => {
    const chatQuery = query(collection(db, 'chats'), orderBy('_id', 'desc'))
    const unsubscribe = onSnapshot(chatQuery, (querySnapshot) => {
      const chatRooms = querySnapshot.docs.map((doc) => doc.data())
      if (chatRooms.length > 0) {
        setChatRoom(chatRooms)
      }
    })
    return unsubscribe
  }, [])

  const [incomingCall, setIncomingCall] = useState<DocumentData | null>(null)

  const authorId = currentUser?.uid

  const [callId, setCallId] = useState('')

  useEffect(() => {
    const q = query(
      collection(db, 'calls'),
      where('to', '==', authorId),
      where('status', '==', 'incoming'),
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const callData = snapshot.docs[0].data()
        setCallId(snapshot.docs[0].id)
        setIncomingCall(callData)
      } else {
        setIncomingCall(null)
      }
    })
    return () => unsubscribe() // Cleanup listener on unmount
  }, [])

  // const [onlineUsers, setOnlineUsers] = useState([])
  // useEffect(() => {
  //   const usersRef = collection(db, 'status')
  //   // Query for users who are online
  //   const unsubscribe = usersRef
  //     .where('state', '==', 'online')
  //     .onSnapshot((querySnapshot) => {
  //       const onlineUsersList = []
  //       querySnapshot.forEach((doc) => {
  //         onlineUsersList.push(doc.id) // doc.id is the user's UID
  //       })
  //       setOnlineUsers(onlineUsersList)
  //     })
  //   return () => unsubscribe()
  // }, [])

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
        </View>
        <UserList />
        <View style={{ paddingHorizontal: 10, marginVertical: 10 }}>
          <View className="flex flex-row items-center justify-center gap-5">
            <Link
              className="bg-red-300 rounded-lg p-2 text-xs font-bold text-black"
              href="/teacher/messages/groupchat"
            >
              Chats
            </Link>
            <Link
              href="/teacher/messages/groupchat"
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
