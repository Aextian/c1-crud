import CallActionBox from '@/components/CallActionBox'
import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
import useVc from '@/hooks/useVc'
import { useLocalSearchParams } from 'expo-router'
import React, { useEffect } from 'react'
import { View } from 'react-native'
import { RTCView } from 'react-native-webrtc'

const answerCallScreen = () => {
  useHideTabBarOnFocus()

  const {
    localStream,
    remoteStream,
    startCall,
    answerCall,
    startLocalStream,
    endCall,
  } = useVc()
  const { callId } = useLocalSearchParams<{ callId: string }>()

  useEffect(() => {
    startLocalStream()
  }, [])

  useEffect(() => {
    if (localStream) {
      answerCall(callId)
    }
  }, [localStream, callId])

  return (
    <View className="flex-1 ">
      {remoteStream && (
        <>
          <RTCView
            style={{ flex: 1 }}
            streamURL={remoteStream.toURL()}
            objectFit={'cover'}
          />
          {localStream && (
            <>
              <View className="absolute top-5 right-5 h-48 w-36 rounded-3xl justify-center items-start overflow-hidden bg-red-300 ">
                <RTCView
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  objectFit="cover"
                  streamURL={localStream.toURL()}
                />
              </View>
            </>
          )}
          <View className="absolute bottom-0 w-full bg-red">
            <CallActionBox callId={callId} />
          </View>
        </>
      )}
    </View>
  )
}

export default answerCallScreen
