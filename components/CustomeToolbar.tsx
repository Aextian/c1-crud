import useRecording from '@/hooks/useRecording'
import { Ionicons } from '@expo/vector-icons' // For file-sharing icon
import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { InputToolbar } from 'react-native-gifted-chat'

const CustomInputToolbar = (props: any) => {
  const { startRecording, stopRecording, recording, playSound } = useRecording()

  const handleStopRecording = async () => {
    const uri = await stopRecording()
    if (uri) {
      playSound(uri)
    }
  }

  return (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbar}
      renderActions={() => (
        <>
          <TouchableOpacity
            style={styles.fileButton}
            onPress={props.onFilePress} // Add your file-sharing function
          >
            <Ionicons name="attach-outline" size={24} color="gray" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fileButton}
            onPress={recording ? handleStopRecording : startRecording}
          >
            <Ionicons
              name="mic-outline"
              size={36}
              color={`${recording ? 'green' : 'gray'}`}
            />
          </TouchableOpacity>
        </>
      )}
      renderSend={() => (
        <TouchableOpacity
          style={styles.fileButton}
          onPress={() => {
            if (props.text && props.onSend) {
              props.onSend({ text: props.text.trim() }, true)
            }
          }}
        >
          <Ionicons name="send-outline" size={24} color="gray" />
        </TouchableOpacity>
      )}
    />
  )
}

const styles = StyleSheet.create({
  inputToolbar: {
    flexDirection: 'row', // Align input and button horizontally
    alignItems: 'center',
    padding: 8,
  },
  fileButton: {
    marginHorizontal: 8,
    marginBottom: 10,
  },
})

export default CustomInputToolbar