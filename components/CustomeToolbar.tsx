import { Ionicons } from '@expo/vector-icons' // For file-sharing icon
import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { InputToolbar } from 'react-native-gifted-chat'

const CustomInputToolbar = (props) => {
  return (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbar}
      renderActions={() => (
        <TouchableOpacity
          style={styles.fileButton}
          onPress={props.onFilePress} // Add your file-sharing function
        >
          <Ionicons name="attach-outline" size={24} color="gray" />
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
  },
})

export default CustomInputToolbar
