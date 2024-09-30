import { auth, db } from '@/config'
import { Picker } from '@react-native-picker/picker'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { addDoc, collection } from 'firebase/firestore'
import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

const register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [name, setName] = useState('')

  const registerWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      )
      const user = userCredential.user
      await addDoc(collection(db, 'users'), {
        email: user.email,
        uid: user.uid, // role can be 'admin' or 'user'
        role: role,
        fullName: name,
        address: 'sds',
      })

      console.log('User registered successfully:', user)
      alert('Register successfully ')

      // You can now use `user` object for further logic
    } catch (error: any) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          alert('This email is already in use!')
          break
        case 'auth/invalid-email':
          alert('The email address is not valid!')
          break
        case 'auth/weak-password':
          alert('The password is too weak!')
          break
        default:
          alert('Error registering: ' + error.message)
      }
      // Handle specific errors here, e.g. display error messages
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
        placeholder="Full name"
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
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => registerWithEmail(email, password)}
      >
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
export default register
