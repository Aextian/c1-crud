import InChatFileTransfer from '@/components/inChatFileTransfer'
import { auth } from '@/config'
import React, { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Bubble } from 'react-native-gifted-chat'

const useRenderGiftedChat = () => {
  const [fileUrl, setFileUrl] = useState('')

  const renderBubble = (props: any) => {
    const { currentMessage } = props
    const currentUser = auth.currentUser
    if (currentMessage.file && currentMessage.file.url) {
      return (
        <TouchableOpacity
          style={{
            backgroundColor:
              props.currentMessage.user._id === currentUser?.uid
                ? '#2e64e5'
                : '#efefef',
            borderBottomLeftRadius:
              props.currentMessage.user._id === currentUser?.uid ? 15 : 5,
            borderBottomRightRadius:
              props.currentMessage.user._id === currentUser?.uid ? 5 : 15,
          }}
          onPress={() => setFileUrl(currentMessage.file.url)}
        >
          <InChatFileTransfer filePath={currentMessage.file.url} />
          <View style={{ flexDirection: 'column', padding: 5 }}>
            <Text
              style={{
                color:
                  currentMessage.user._id === currentUser?.uid
                    ? 'white'
                    : 'black',
              }}
            >
              {currentMessage.text}
            </Text>
          </View>
        </TouchableOpacity>
      )
    }
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#2e64e5', //set the color green
          },
        }}
        textStyle={{
          right: {
            color: '#efefef', // Set the text color to white
          },
        }}
      />
    )
  }

  return { renderBubble, fileUrl, setFileUrl }
}

export default useRenderGiftedChat
