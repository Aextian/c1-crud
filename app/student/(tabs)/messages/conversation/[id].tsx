// screens/ChatScreen.js
import React from 'react'
// import { firebase } from '../firebase';
import { auth } from '@/config'
import useMessages from '@/hooks/useMessages'
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from 'expo-router'
import { GiftedChat } from 'react-native-gifted-chat'

export default function ChatScreen() {
  const navigation = useNavigation()
  const currentUser = auth.currentUser
  const { id } = useLocalSearchParams()
  const { messages, onSend } = useMessages(id as string) // Pass the id to the custom hook

  useFocusEffect(
    React.useCallback(() => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } })
      return () => {
        // Show the tab bar when leaving this screen
        navigation.getParent()?.setOptions({ tabBarStyle: undefined })
      }
    }, [navigation]),
  )

  return (
    <>
      <Stack.Screen options={{ headerTitle: currentUser?.displayName || '' }} />
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: currentUser?.uid ?? '',
          name: currentUser?.email ?? '',
        }}
      />
    </>
  )
}
