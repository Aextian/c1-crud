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

// Define a type for messages
interface Message {
  id: string
  text: string
  sender: string // Sender's name
  pinned: boolean // Pin status
}

const GroupChatScreen = () => {
  // State to manage messages
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello everyone!', sender: 'Alice', pinned: false },
    { id: '2', text: 'Hi Alice! How are you?', sender: 'Bob', pinned: false },
    {
      id: '3',
      text: 'I’m good, thanks! How about you?',
      sender: 'Alice',
      pinned: false,
    },
    {
      id: '4',
      text: 'Doing great! Thanks for asking.',
      sender: 'Charlie',
      pinned: false,
    },
  ])
  const [newMessage, setNewMessage] = useState('')
  const [userName, setUserName] = useState('You') // Replace with logged-in user's name

  // Function to handle sending a new message
  const sendMessage = () => {
    if (newMessage.trim() === '') return // Prevent empty messages
    const newMsg: Message = {
      id: (messages.length + 1).toString(),
      text: newMessage,
      sender: userName,
      pinned: false,
    }
    setMessages((prevMessages) => [...prevMessages, newMsg]) // Add new message to the list
    setNewMessage('') // Clear the input field
  }

  // Function to pin or unpin a message
  const togglePinMessage = (id: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === id ? { ...msg, pinned: !msg.pinned } : msg,
      ),
    )
  }

  // Render each message
  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === userName ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <Text style={styles.senderText}>{item.sender}</Text>
      <Text style={styles.messageText}>{item.text}</Text>
      <TouchableOpacity onPress={() => togglePinMessage(item.id)}>
        <Text style={styles.pinText}>{item.pinned ? 'Unpin' : 'Pin'}</Text>
      </TouchableOpacity>
    </View>
  )

  // Filter pinned messages
  const pinnedMessages = messages.filter((msg) => msg.pinned)
  const regularMessages = messages.filter((msg) => !msg.pinned)

  return (
    <View style={styles.container}>
      <FlatList
        data={[...pinnedMessages, ...regularMessages]} // Show pinned messages first
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
  senderText: {
    fontWeight: 'bold',
    marginBottom: 2,
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
  pinText: {
    color: '#007BFF',
    marginTop: 5,
    textAlign: 'right',
  },
})

export default GroupChatScreen
