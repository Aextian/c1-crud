import useVc from '@/hooks/useVc'
import { Feather } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

interface IProps {
  callId: string
}

const CallActionBox = ({ callId }: IProps) => {
  const { endCall } = useVc()
  return (
    <View style={styles.container}>
      {/* Switch Camera Button */}
      <TouchableOpacity style={styles.button}>
        <Feather name="camera" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Toggle Mute Button */}
      <TouchableOpacity style={styles.button}>
        <Feather name="mic-off" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Toggle Camera Button */}
      <TouchableOpacity style={styles.button}>
        <Feather name="camera-off" size={30} color="#fff" />
      </TouchableOpacity>

      {/* End Call Button */}
      <TouchableOpacity
        style={[styles.button, styles.endCallButton]}
        onPress={() => endCall(callId)}
      >
        <Feather name="phone" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#333',
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#555',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endCallButton: {
    backgroundColor: 'red',
  },
})

export default CallActionBox
