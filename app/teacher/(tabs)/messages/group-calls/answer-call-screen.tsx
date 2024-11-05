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
    answerCall,
    startLocalStream,
    endCall,
  } = useGroupCall()
  const { callId } = useLocalSearchParams<{ callId: string }>()

  useEffect(() => {
    startLocalStream()
  }, [])

  useEffect(() => {
    if (localStream) {
      answerCall(callId)
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

  console.log('remoteStream count', remoteStreams.length)
  return (
    <View style={styles.container}>
      {localStream && (
        <RTCView streamURL={localStream.toURL()} style={styles.localVideo} />
      )}
      {/* Render remote streams */}
      <Text>Remote Streams</Text>
      {remoteStreams.map((stream, index) => (
        <RTCView
          key={index}
          streamURL={stream.toURL()}
          style={styles.remoteVideo}
        />
      ))}

      {/* <FlatList
      style={{ flex: 1 }}
        data={remoteStreams} // Convert object to array for FlatList
        renderItem={renderRemoteStream}
        keyExtractor={(item, index) => `${index}`}
      /> */}
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
  },
})

export default answerCallScreen
