import { Link } from 'expo-router'
import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
const index = () => {
  const [username, setName] = useState('')
  const [email, setEmail] = useState('')

  return (
    <View style={styles.container}>
      <TextInput
        value={username}
        onChangeText={(username) => {
          setName(username)
        }}
        placeholder="Email"
        style={styles.loginInput}
      />
      <TextInput
        value={email}
        onChangeText={(email) => {
          setEmail(email)
        }}
        placeholder="Password"
        secureTextEntry
        style={styles.loginInput}
      />
      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Logsdin</Text>
      </TouchableOpacity>
      <Link href={'/auth/register'} style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Register</Text>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loginInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '80%', // Responsive width
    maxWidth: 300, // Max width to limit the input size
    minWidth: 200, // Minimum width to ensure it's not too small
    borderRadius: 5, // Rounded corners
    paddingHorizontal: 10, // Padding inside the input
    fontSize: 16, // Better text size for readability
    backgroundColor: '#fff', // Background color
  },

  loginButton: {
    backgroundColor: '#007BFF', // Blue color for login
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '80%',
    maxWidth: 300,
    minWidth: 200,
    alignItems: 'center', // Center the text inside the button
    marginVertical: 10, // Add space between buttons
  },
  loginButtonText: {
    color: '#fff', // White text
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default index
