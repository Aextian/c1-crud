import { db } from '@/config'
import { useUserStore } from '@/store/useUserStore'
import { Entypo, FontAwesome } from '@expo/vector-icons'
import { Stack, useLocalSearchParams } from 'expo-router'
import {
  DocumentData,
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

const chat = () => {
  const { roomId } = useLocalSearchParams()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<DocumentData>([])
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

  // get all message

  useEffect(() => {
    const msgQuery = query(
      collection(db, 'chats', roomId.toString(), 'messages'),
      orderBy('timeStamp', 'asc'),
    )

    const unsubscribe = onSnapshot(msgQuery, (querySnapshot) => {
      const upMsg = querySnapshot.docs.map((doc) => doc.data())
      setMessages(upMsg)
    })
    return unsubscribe
  }, [])

  // console.log(messages)
  return (
    <>
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <Stack.Screen options={{ headerTitle: `Room ${roomId}` }} />
        {/* <Tabs.Screen options={{ tabBarHideOnKeyboard: true }} /> */}

        <View style={{ height: 50, backgroundColor: 'green' }} />
        <View
          style={{
            // width: '100%',
            backgroundColor: 'white',
            flex: 1,
          }}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={200}
          >
            <>
              <ScrollView>
                {/* message here */}

                {messages?.map((msg, i) =>
                  msg.user.providerData.email === user?.providerData.email ? (
                    <>
                      <View style={{ margin: 1 }} key={i}>
                        <View
                          style={{
                            justifyContent: 'flex-end',
                            marginHorizontal: 5,
                            marginVertical: 10,
                            backgroundColor: 'green',
                            width: 'auto',
                          }}
                        >
                          <Text>{msg.message}</Text>
                        </View>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={{ margin: 1 }} key={i}>
                        <View
                          style={{
                            justifyContent: 'flex-start',
                            marginHorizontal: 5,
                            marginVertical: 10,
                            backgroundColor: 'gray',
                            width: 'auto',
                          }}
                        >
                          <Text>{msg.message}</Text>
                        </View>
                      </View>
                    </>
                  ),
                )}
              </ScrollView>

              <View style={{ paddingHorizontal: 35 }}>
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
              </View>
            </>
          </KeyboardAvoidingView>
        </View>
      </View>
    </>
  )
}

export default chat
