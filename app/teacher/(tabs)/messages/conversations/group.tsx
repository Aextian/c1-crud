import { auth } from '@/config'
import { useGroupMessage } from '@/hooks/useGroupChat'
import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
import { Ionicons } from '@expo/vector-icons'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { GiftedChat } from 'react-native-gifted-chat'
import group from '../group'

export default function groupConversation() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { messages, onSend } = useGroupMessage(id) // Pass the id to the custom hook
  useHideTabBarOnFocus()
  const currentUser = auth.currentUser
  const router = useRouter()
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: group?.name || '',
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 10 }} // Adjust the margin if needed
              onPress={() =>
                router.push({
                  pathname:
                    '/student/(tabs)/messages/video-calls/video-call-screen',
                  params: {
                    callId: id,
                  },
                })
              }
            >
              <Ionicons name="videocam" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: currentUser?.uid ?? '',
          name: currentUser?.displayName ?? '',
        }}
      />
    </>
  )
}
