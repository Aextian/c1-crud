import React from 'react'
import { View } from 'react-native'
import { RTCView } from 'react-native-webrtc'

const design = () => {
  return (
    <View className="relative flex-1 bg-slate-900">
      <RTCView
        style={{
          flex: 1,
        }}
        // streamURL={remoteStream.toURL()}
        objectFit={'cover'}
      />
      <View className="absolute top-5 right-5 h-48 w-36 p-2 rounded-3xl justify-center items-start bg-red-300 overflow-hidden">
        <RTCView
          style={{
            backgroundColor: 'red',
            width: '100%',
            height: '100%',
          }}
          objectFit="cover"
          // streamURL={localStream.toURL()}
        />
      </View>
      <View className="absolute bottom-0 w-full bg-red">
        {/* <CallActionBox
            switchCamera={switchCamera}
              toggleMute={toggleMute}
              toggleCamera={toggleCamera}
            endCall={endCall}
          /> */}
      </View>
    </View>
  )
}

export default design
