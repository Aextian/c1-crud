import { db } from '@/config'
import { useUserStore } from '@/store/useUserStore'
import { Entypo, FontAwesome } from '@expo/vector-icons'
import { Stack, useLocalSearchParams } from 'expo-router'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import React, { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'

const chat = () => {
  const { roomId } = useLocalSearchParams()
  const [message, setMessage] = useState('')
  const { user } = useUserStore()

  const sendMessage = async () => {
    const timeStamp = serverTimestamp()
    const id = `${Date.now()}`
    const _doc = {
      _id: id,
      roomId: roomId,
      timeStamp: timeStamp,
      message: message,
      user: user,
    }
    try {
      // Correct collection reference for the room's messages
      const messagesRef = collection(db, 'chats', roomId.toString(), 'messages')
      // Add the new document to the messages collection
      await addDoc(messagesRef, _doc)
      // Clear the message input after sending
      setMessage('')

      alert('scuess')
    } catch (error: any) {
      alert(error.message) // Alert with the error message
    }
  }

  return (
    <>
      <View style={{ flex: 1 }}>
        <Stack.Screen options={{ headerTitle: `Room ${roomId}` }} />
        <View style={{ height: 50, backgroundColor: 'green' }} />
        <Text>Chat Room: {roomId}</Text>
        <View
          style={{
            width: '100%',
            backgroundColor: 'white',
            marginTop: 10,
            flex: 1,
          }}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={160}
          >
            <>
              <ScrollView>{/* message here */}</ScrollView>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  paddingHorizontal: 35,
                  alignItems: 'center',
                  marginBottom: 25,
                  gap: 10,
                }}
              >
                {/* emoticon here */}
                <TouchableOpacity>
                  <Entypo name="emoji-happy" size={24} color="#555" />
                </TouchableOpacity>
                {/* keyboard here */}
                <TextInput
                  value={message}
                  onChangeText={(message) => setMessage(message)}
                  style={{
                    width: '100%',
                    height: 40,
                    backgroundColor: 'white',
                    borderRadius: 10,
                  }}
                  placeholderTextColor={'#999'}
                  placeholder="Write a message..."
                />
                <TouchableOpacity onPress={sendMessage}>
                  <FontAwesome name="send" size={24} color="#555" />
                </TouchableOpacity>
              </View>
            </>
          </KeyboardAvoidingView>
        </View>
      </View>
    </>
  )
}

export default chat
