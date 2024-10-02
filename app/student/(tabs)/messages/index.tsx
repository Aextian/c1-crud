import LoadingScreen from '@/components/loadingScreen'
import { db } from '@/config'
import useAuth from '@/hooks/useAuth'
import { useUserStore } from '@/store/useUserStore'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import {
  DocumentData,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

const PersonalMessageScreen = () => {
  // State to manage messages
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! How are you?', sender: 'other' },
    { id: '2', text: 'I am fine, thank you! How about you?', sender: 'me' },
  ])
  const [newMessage, setNewMessage] = useState('')
  const [chat, addChat] = useState('')
  const { currentUser, loading } = useAuth()
  const user = useUserStore((state) => state.user)
  const [rooms, setChatRoom] = useState<DocumentData[] | undefined>()

  // functio to create new chat
  const createNewChat = async () => {
    let id = `${Date.now()}`
    const _doc = {
      _id: id,
      chatName: chat,
      user: currentUser.uid,
    }
    try {
      await setDoc(doc(db, 'chats', id), _doc)
      addChat('')
    } catch (error) {
      console.error('Error adding post: ', error)
    }
  }
  // Function to handle sending a new message

  // Render each message
  const renderMessage = ({ item }: any) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'me' ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  )

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

  return (
    <View style={styles.container}>
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
      <View style={{ paddingHorizontal: 10, marginVertical: 10 }}>
        <Text>Message</Text>
      </View>
      <ScrollView contentContainerStyle={{ display: 'flex', gap: 30 }}>
        {rooms && rooms?.length > 0 ? (
          <>
            {rooms?.map((room) => <MessageCard key={room._id} room={room} />)}
          </>
        ) : (
          <>
            <LoadingScreen />
          </>
        )}
      </ScrollView>
    </View>
  )
}

const MessageCard = ({ room }: DocumentData) => {
  const router = useRouter()
  return (
    <TouchableOpacity
      style={styles.messageCardContainer}
      onPress={() =>
        router.push({
          pathname: `/student/messages/[chat]`,
          params: { roomId: room._id }, // Passing params as part of the object
        })
      }
    >
      <View style={styles.messsageCardIcon}>
        <Feather name="user" size={24} color="black" />
      </View>
      {/* content */}
      <View
        style={{
          flex: 1,
          alignItems: 'flex-start',
          marginLeft: 1,
          justifyContent: 'flex-start',
        }}
      >
        <Text style={{ color: '#333' }}>{room.chatName}</Text>
        <Text style={{ color: '#333', fontSize: 12 }}>{room._id}</Text>
      </View>
      <Text style={{ color: 'green', paddingVertical: 5, fontWeight: 'bold' }}>
        27 min
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  messageCardContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
  },
  messsageCardIcon: {
    width: 45,
    height: 45,
    borderColor: 'green',
    borderWidth: 2,
    borderRadius: 100,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
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

export default PersonalMessageScreen
