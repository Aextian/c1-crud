// import useGroupCall from '@/hooks/useGroupCall'
// import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
// import { useLocalSearchParams } from 'expo-router'
// import React, { useEffect } from 'react'
// import { StyleSheet, Text, View } from 'react-native'
// import { RTCView } from 'react-native-webrtc'

// const videCallScreen = () => {
//   useHideTabBarOnFocus()
//   const { callId } = useLocalSearchParams<{ callId: string }>()
//   const { localStream, remoteStreams, startCall, startLocalStream } =
//     useGroupCall()

//   useEffect(() => {
//     startLocalStream()
//   }, [])

//   useEffect(() => {
//     if (localStream) {
//       startCall(callId)
//     }
//   }, [localStream])

//   return (
//     <View style={styles.container}>
//       {localStream && (
//         <RTCView streamURL={localStream.toURL()} style={styles.localVideo} />
//       )}
//       {/* Render remote streams */}
//       {remoteStreams.length > 0 ? (
//         <View>
//           <RTCView
//             streamURL={remoteStreams[0].toURL()}
//             style={styles.localVideo}
//           />
//           <Text>There are {remoteStreams.length} remote streams</Text>
//         </View>
//       ) : (
//         <Text>No remote streams</Text>
//       )}
//       {remoteStreams.map((stream, index) => (
//         <RTCView
//           key={stream._id}
//           streamURL={stream.toURL()}
//           style={styles.remoteVideo}
//         />
//       ))}
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   localVideo: {
//     width: 50,
//     height: 50,
//   },
//   remoteVideo: {
//     width: 50, // Adjust sizes as needed
//     height: 50,
//     backgroundColor: 'red',
//   },
// })

// export default videCallScreen
