import { db } from '@/config'
import useAuth from '@/hooks/useAuth'
import { useUserStore } from '@/store/useUserStore'
import { Feather } from '@expo/vector-icons'
import {
  collection,
  doc,
  DocumentData,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
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
  const [chatRoom, setChatRoom] = useState<DocumentData[] | undefined>()
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
  const sendMessage = () => {
    if (newMessage.trim() === '') return // Prevent empty messages
    const newMsg = {
      id: (messages.length + 1).toString(),
      text: newMessage,
      sender: 'me',
    }
    setMessages((prevMessages) => [...prevMessages, newMsg]) // Add new message to the list
    setNewMessage('') // Clear the input field
  }
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
          <Text>{user?.name}</Text>
        </TouchableOpacity>
      </View>
      {/* <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        inverted // To show the latest message at the bottom
      /> */}

      <MessageCard />
      <MessageCard />
      <MessageCard />
      <MessageCard />
      {/* <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <Button title="Send" onPress={sendMessage} />
      </View> */}
    </View>
  )
}

const MessageCard = () => {
  return (
    <TouchableOpacity style={styles.messageCardContainer}>
      <View style={styles.messsageCardIcon}>
        <Feather name="user" size={24} color="white" />
      </View>
      {/* content */}
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          marginLeft: 1,
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#333' }}>Message Title</Text>
        <Text style={{ color: '#333', fontSize: 12 }}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis,
          iure.
        </Text>
        <Text
          style={{ color: 'green', paddingVertical: 5, fontWeight: 'bold' }}
        >
          27 min
        </Text>
      </View>
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
    width: 50,
    height: 50,
    backgroundColor: 'green',
    borderRadius: 100,
    marginRight: 10,
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
