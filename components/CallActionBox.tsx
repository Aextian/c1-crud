import { Feather } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

interface IProps {
  switchCamera: () => void
  toggleMute?: () => void
  toggleCamera?: () => void
  endCall: () => void
}

const CallActionBox = ({
  switchCamera,
  toggleMute,
  toggleCamera,
  endCall,
}: IProps) => {
  return (
    <View style={styles.container}>
      {/* Switch Camera Button */}
      <TouchableOpacity style={styles.button} onPress={switchCamera}>
        <Feather name="camera" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Toggle Mute Button */}
      <TouchableOpacity style={styles.button} onPress={toggleMute}>
        <Feather name="mic-off" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Toggle Camera Button */}
      <TouchableOpacity style={styles.button} onPress={toggleCamera}>
        <Feather name="camera-off" size={30} color="#fff" />
      </TouchableOpacity>

      {/* End Call Button */}
      <TouchableOpacity
        style={[styles.button, styles.endCallButton]}
        onPress={endCall}
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
