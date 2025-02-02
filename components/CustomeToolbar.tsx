import useRecordingStore from '@/store/useRecordingStore'
import { Ionicons } from '@expo/vector-icons' // For file-sharing icon
import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { InputToolbar } from 'react-native-gifted-chat'

const CustomInputToolbar = (props: any) => {
  // const { startRecording, stopRecording, recording, playSound } = useRecording()

  const { startRecording, stopRecording, recording } = useRecordingStore()

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
            <Ionicons name="attach-outline" size={24} color="blue" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fileButton}
            onPress={recording ? stopRecording : startRecording}
          >
            {recording ? (
              <Ionicons name="stop-circle-outline" size={24} color="blue" />
            ) : (
              <Ionicons name="mic-outline" size={24} color="blue" />
            )}
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
          <Ionicons name="send" size={24} color="blue" />
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
    borderRadius: 30,
  },
  fileButton: {
    marginHorizontal: 8,
    marginBottom: 10,
  },
})

export default CustomInputToolbar
