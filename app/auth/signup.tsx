import useSignUp from '@/hooks/useSignUp'
import { Picker } from '@react-native-picker/picker'
import React, { useState } from 'react'
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

const signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [name, setName] = useState('')

  const { signUp, loading, error } = useSignUp() // Using the custom hook

  const handleSignUp = async () => {
    try {
      const user = await signUp(email, password, name, role)
      if (user) {
        Alert.alert('Success', 'Registered successfully!')
        // Optionally, reset form fields
        setEmail('')
        setPassword('')
        setName('')
        setRole('user')
      }
    } catch (error) {
      alert(error)
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        value={email}
        onChangeText={(email) => {
          setEmail(email)
        }}
        placeholder="Email"
        style={styles.RegisterInput}
      />
      <TextInput
        value={password}
        onChangeText={(password) => {
          setPassword(password)
        }}
        placeholder="Password"
        secureTextEntry
        style={styles.RegisterInput}
      />
      <TextInput
        value={name}
        onChangeText={(name) => {
          setName(name)
        }}
        placeholder="Name"
        style={styles.RegisterInput}
      />
      <View
        style={{
          padding: 20,
          display: 'flex',
          justifyContent: 'space-around',
          flexDirection: 'column',
        }}
      >
        <Text>What is your role?</Text>
        <Picker
          selectedValue={role}
          style={{
            height: 50,
            width: 200,
            borderColor: 'gray',
            borderRadius: 5, // Rounded corners
            borderWidth: 1,
          }}
          onValueChange={(role) => setRole(role)}
        >
          <Picker.Item label="Student" value="student" />
          <Picker.Item label="Teacher" value="teacher" />
        </Picker>
      </View>
      <TouchableOpacity style={styles.loginButton} onPress={handleSignUp}>
        <Text style={styles.RegisterButton}>Sign up</Text>
      </TouchableOpacity>
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
  RegisterInput: {
    height: 50,
    borderColor: 'gray',
    borderRadius: 50, // Rounded corners
    borderWidth: 1,
    width: '90%', // Responsive width
    minWidth: 250, // Minimum width to ensure it's not too small
    paddingHorizontal: 15, // Padding inside the input
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
  RegisterButton: {
    color: '#fff', // White text
    fontSize: 16,
    fontWeight: 'bold',
  },
})
export default signup
