import { auth } from '@/config'
import { Link, useRouter } from 'expo-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

const login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const router = useRouter()

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      alert('login success')
      router.push('/student/posts')
    } catch (error: any) {
      console.error('Login error:', error.message)
      alert(error.message)
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        value={email}
        onChangeText={(text) => setEmail(text)}
        placeholder="Email"
        style={styles.loginInput}
      />
      <TextInput
        value={password}
        onChangeText={(text) => setPassword(text)}
        placeholder="Password"
        secureTextEntry
        style={styles.loginInput}
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
      <Link href="/auth/register" style={styles.loginButton}>
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
    justifyContent: 'center',
    marginVertical: 10, // Add space between buttons
  },
  loginButtonText: {
    color: '#fff', // White text
    fontSize: 16,
    fontWeight: 'bold',
    justifyContent: 'center',
  },
})

export default login
