import CallScreen from '@/components/CallScreen'
import MessageCard from '@/components/MessageCard'
import SkUserLoader from '@/components/SkLoader'
import UserList from '@/components/UserList'
// import MessageCard from '@/components/messageCard'
import { auth, db } from '@/config'
import { useChat } from '@/hooks/useChat'
import { Feather } from '@expo/vector-icons'
import {
  DocumentData,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
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
  const [chat, addChat] = useState('')
  const [rooms, setChatRoom] = useState<DocumentData[] | undefined>()
  const { conversations, loading } = useChat()
  const currentUser = auth.currentUser

  // functio to create new chat
  const createNewChat = async () => {
    let id = `${Date.now()}`
    const _doc = {
      _id: id,
      chatName: chat,
      user: currentUser?.uid,
    }
    try {
      await setDoc(doc(db, 'chats', id), _doc)
      addChat('')
    } catch (error) {
      console.error('Error adding post: ', error)
    }
  }
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
            placeholder="Create a chat"
            value={chat}
            placeholderTextColor={'#999'}
            onChangeText={(chat) => addChat(chat)}
          />
          <TouchableOpacity onPress={createNewChat}>
            <Feather name="send" size={24} />
          </TouchableOpacity>
        </View>
        <UserList role="student" />
        <View style={{ paddingHorizontal: 10, marginVertical: 10 }}>
          <Text>Messages</Text>
        </View>
        <ScrollView contentContainerStyle={{ display: 'flex', gap: 30 }}>
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
