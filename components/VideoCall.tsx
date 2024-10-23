import useWebRTC from '@/hooks/useVideoCall'
import React, { useEffect } from 'react'
import { Button, Text, TextInput, View } from 'react-native'
import { RTCView } from 'react-native-webrtc'

const VideoCall = () => {
  const {
    localStream,
    remoteStream,
    startCall,
    answerCall,
    endCall,
    switchCamera,
    callId,
    setCallId,
    getLocalStream,
  } = useWebRTC()

  useEffect(() => {
    getLocalStream()
  }, [])

  return (
    <View>
      {localStream && (
        <RTCView
          streamURL={localStream?.toURL()}
          style={{ width: '100%', height: 200 }}
        />
      )}
      {remoteStream && (
        <>
          <Text>Remote Stream</Text>
          <RTCView
            streamURL={remoteStream?.toURL()}
            style={{
              width: '100%',
              height: 200,
              backgroundColor: 'transparent',
              zIndex: 1,
            }}
            mirror={false} // Ensure the mirror property is correctly set for remote
            zOrder={1} // Specifically for native rendering layers
          />
        </>
      )}
      <Button title="Start Call" onPress={startCall} />
      <TextInput
        placeholder="Enter Call ID"
        value={callId}
        onChangeText={setCallId}
      />
      <View className="flex flex-col gap-10">
        <Button title="Answer Call" onPress={() => answerCall(callId)} />
        <Button title="End Call" onPress={() => endCall()} />
        <Button title="Switch Camera" onPress={() => switchCamera()} />
      </View>
    </View>
  )
}

export default VideoCall
