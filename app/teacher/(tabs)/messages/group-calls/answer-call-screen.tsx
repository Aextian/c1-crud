import useGroupCall from '@/hooks/useGroupCall'
import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
import { useLocalSearchParams } from 'expo-router'
import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { RTCView } from 'react-native-webrtc'

const answerCallScreen = () => {
  useHideTabBarOnFocus()
  const {
    localStream,
    remoteStreams,
    startCall,
    joinCall,
    startLocalStream,
    endCall,
  } = useGroupCall()
  const { callId } = useLocalSearchParams<{ callId: string }>()

  useEffect(() => {
    startLocalStream()
  }, [])

  useEffect(() => {
    if (localStream) {
      joinCall(callId)
    }
  }, [localStream, callId])

  // const renderRemoteStream = ({ item }) => {
  //   // Check if `_reactTag` or another property has the stream URL or directly use `item.toURL()` if possible.
  //   const streamURL = item.toURL ? item.toURL() : `URL_PLACEHOLDER` // Replace with actual stream URL extraction if needed
  //   if (!streamURL) {
  //     console.error('Stream URL is missing for item:', item)
  //     return null
  //   }

  //   return <RTCView streamURL={streamURL} style={styles.remoteVideo} />
  // }

  // return (
  //   <View className="flex-1 ">
  //     {remoteStream && (
  //       <>
  //         <RTCView
  //           style={{ flex: 1 }}
  //           streamURL={remoteStream.toURL()}
  //           objectFit={'cover'}
  //         />
  //         {localStream && (
  //           <>
  //             <View className="absolute top-5 right-5 h-48 w-36 rounded-3xl justify-center items-start overflow-hidden bg-red-300 ">
  //               <RTCView
  //                 style={{
  //                   width: '100%',
  //                   height: '100%',
  //                 }}
  //                 objectFit="cover"
  //                 streamURL={localStream.toURL()}
  //               />
  //             </View>
  //           </>
  //         )}
  //         <View className="absolute bottom-0 w-full bg-red">
  //           <CallActionBox callId={callId} />
  //         </View>
  //       </>
  //     )}
  //   </View>
  // )
  remoteStreams.forEach((stream) => {
    console.log('Stream ID:', stream.id)
    console.log('Stream URL:', stream.toURL())
    console.log('Track Details:', stream.getTracks())
    stream.getTracks().forEach((track) => {
      console.log(`Track kind: ${track.kind}`) // Log if it's a video or audio track
    })
  })

  return (
    <View style={styles.container}>
      {localStream && (
        <RTCView streamURL={localStream.toURL()} style={styles.localVideo} />
      )}
      {/* Render remote streams */}
      {remoteStreams.length > 0 ? (
        <View>
          <RTCView
            streamURL={remoteStreams[0].toURL()}
            style={styles.localVideo}
          />
          <Text>There are {remoteStreams.length} remote streams</Text>
        </View>
      ) : (
        <Text>No remote streams</Text>
      )}
      {remoteStreams.map((stream, index) => (
        <RTCView
          key={stream._id}
          streamURL={stream.toURL()}
          style={styles.remoteVideo}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideo: {
    width: 50,
    height: 50,
  },
  remoteVideo: {
    width: 50, // Adjust sizes as needed
    height: 50,
    backgroundColor: 'red',
  },
})

export default answerCallScreen
