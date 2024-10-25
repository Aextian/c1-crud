import useVc from '@/hooks/useVc'
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from 'expo-router'
import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { RTCView } from 'react-native-webrtc'

const answerCall = () => {
  const { callId, answerCallId } = useLocalSearchParams()
  useEffect(() => {
    console.log('Call ID:', callId) // Should log the actual call ID
    console.log('Answer Call ID:', answerCallId) // Should log the actual offer
  }, [callId, answerCallId])

  const navigation = useNavigation()
  useFocusEffect(
    React.useCallback(() => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } })
      return () => {
        navigation.getParent()?.setOptions({ tabBarStyle: styles.tabBar })
      }
    }, [navigation]),
  )

  const { localStream, remoteStream, startCall, answerCall, startLocalStream } =
    useVc()

  const handleCallUser = async (videoCallId: string) => {
    await startCall(videoCallId) // Start call to the specific user
  }

  return (
    <View className="flex-1 ">
      {localStream && (
        <>
          <Text>Local Stream {localStream.toURL()}</Text>
          <RTCView
            objectFit={'cover'}
            streamURL={localStream?.toURL()}
            style={{ flex: 1 }}
          />
        </>
      )}

      {remoteStream && (
        <>
          <RTCView
            style={{ flex: 1 }}
            streamURL={remoteStream && remoteStream.toURL()}
            objectFit={'cover'}
          />
          {localStream && (
            <>
              <RTCView
                className="w-32 h-48 absolute right-6 top-8"
                streamURL={localStream.toURL()}
              />
            </>
          )}
          <View className="absolute bottom-0 w-full bg-red">
            {/* <CallActionBox
              switchCamera={switchCamera}
                toggleMute={toggleMute}
                toggleCamera={toggleCamera}
              endCall={endCall}
            /> */}
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute', // Make it absolute to position it correctly
    bottom: 10, // Position from the bottom
    left: 20, // Add left margin
    right: 20, // Add right margin
    justifyContent: 'space-between', // Space items evenly
    alignItems: 'center', // Center items vertically
    backgroundColor: '#fff', // Background color
    borderRadius: 25, // Rounded corners
    shadowColor: 'black', // Shadow color
    shadowOffset: { width: 0, height: 10 }, // Shadow offset
    shadowRadius: 10, // Shadow blur
    shadowOpacity: 0.1, // Shadow opacity
    elevation: 5, // Android shadow elevation
  },
})

export default answerCall
