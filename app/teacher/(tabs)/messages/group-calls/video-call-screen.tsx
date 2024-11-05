import CallActionBox from '@/components/CallActionBox'
import useGroupCall from '@/hooks/useGroupCall'
import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
import { useLocalSearchParams } from 'expo-router'
import React, { useEffect } from 'react'
import { View } from 'react-native'
import { RTCView } from 'react-native-webrtc'

const videCallScreen = () => {
  useHideTabBarOnFocus()
  const { callId } = useLocalSearchParams<{ callId: string }>()
  const { localStream, remoteStream, startCall, startLocalStream } =
    useGroupCall()

  useEffect(() => {
    startLocalStream()
  }, [])

  useEffect(() => {
    if (localStream) {
      startCall(callId)
    }
  }, [localStream])

  return (
    <View className="flex-1 ">
      {localStream && !remoteStream && (
        <>
          <RTCView streamURL={localStream?.toURL()} style={{ flex: 1 }} />
        </>
      )}

      {remoteStream && (
        <>
          <RTCView
            style={{ flex: 1 }}
            streamURL={remoteStream.toURL()}
            objectFit={'cover'}
          />
          {localStream && (
            <>
              <View className="absolute top-5 right-5 h-48 w-36 rounded-3xl justify-center items-start overflow-hidden">
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
            <CallActionBox
              // switchCamera={switchCamera}
              //   toggleMute={toggleMute}
              //   toggleCamera={toggleCamera}
              callId={callId}
            />
          </View>
        </>
      )}
    </View>
  )
}

export default videCallScreen
