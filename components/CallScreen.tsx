import useWebRTC from '@/hooks/useVideoCall'
import React, { useEffect } from 'react'
import { View } from 'react-native'
import { RTCView } from 'react-native-webrtc'
import CallActionBox from './CallActionBox'

const CallScreen = () => {
  const {
    localStream,
    remoteStream,
    startCall,
    answerCall,
    endCall,
    switchCamera,
    callId,
    setCallId,
    startLocalStream,
  } = useWebRTC()

  useEffect(() => {
    startLocalStream()
  }, [])

  return (
    <View className="flex-1 bg-red-600">
      {!remoteStream && (
        <RTCView
          className="flex-1"
          streamURL={localStream?.toURL()}
          objectFit={'cover'}
        />
      )}

      {remoteStream && (
        <>
          <RTCView
            className="flex-1"
            streamURL={remoteStream && remoteStream.toURL()}
            objectFit={'cover'}
          />
          {localStream && (
            <RTCView
              className="w-32 h-48 absolute right-6 top-8"
              streamURL={localStream && localStream.toURL()}
            />
          )}
        </>
      )}
      <View className="absolute bottom-0 w-full">
        <CallActionBox
          switchCamera={switchCamera}
          //   toggleMute={toggleMute}
          //   toggleCamera={toggleCamera}
          endCall={endCall}
        />
      </View>
    </View>
  )
}

export default CallScreen
