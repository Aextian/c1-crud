import CallActionBox from '@/components/CallActionBox'
import useVc from '@/hooks/useVc'
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from 'expo-router'
import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { RTCView } from 'react-native-webrtc'

const answerCallScreen = () => {
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

  const navigation = useNavigation()
  useFocusEffect(
    React.useCallback(() => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } })
      return () => {
        navigation.getParent()?.setOptions({ tabBarStyle: styles.tabBar })
      }
    }, [navigation]),
  )

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

export default answerCallScreen
