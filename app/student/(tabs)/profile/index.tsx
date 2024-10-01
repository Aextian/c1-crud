import { db } from '@/config'
import useAuth from '@/hooks/useAuth'
import { Feather } from '@expo/vector-icons'
import { addDoc, collection } from 'firebase/firestore'
import React, { useState } from 'react'
import {
  Button,
  FlatList,
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
  const { currentUser, loading } = useAuth()

  const handleCreateChat = async () => {
    try {
      await addDoc(collection(db, 'chatRoom'), {
        createdAt: new Date().toISOString(),
        authorId: currentUser.uid, // Store the UID of the author
        authorName: currentUser.displayName,
        name: chat,
      })
      alert('scuess')
    } catch (error) {
      console.error('Error adding post: ', error)
      alert('Post added error')
    }
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

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          gap: 20,
          alignItems: 'center',
          borderColor: 'black',
          borderWidth: 5,
        }}
      >
        <Feather name="message-circle" />
        <TextInput
          style={{ width: '100%' }}
          placeholder="Create a chat"
          value={chat}
          onChangeText={(chat) => addChat(chat)}
        />
        <Button title="Post" onPress={handleCreateChat} />
        <Feather name="send" />
      </View>
      <View style={styles.header}>
        <Text style={styles.headerText}>Conversation</Text>

        <TouchableOpacity
          onPress={() => alert('Starting video call...')}
        ></TouchableOpacity>
      </View>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        inverted // To show the latest message at the bottom
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
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
