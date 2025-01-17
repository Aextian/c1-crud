import { auth } from '@/config'
import { sendPasswordResetEmail } from 'firebase/auth'
import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

const resetPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async () => {
    setLoading(true)
    await sendPasswordResetEmail(auth, email)
      .then(() => {
        alert('Password reset email sent!')
        setLoading(false)
      })
      .catch((error) => {
        setLoading(false)
        const errorCode = error.code
        const errorMessage = error.message
        alert('Error sending password reset email')
      })
  }

  return (
    <View style={styles.container}>
      <TextInput
        className=" rounded-2xl text-xl border border-slate-200 bg-slate-200 w-10/12 p-4"
        value={email}
        onChangeText={(text) => setEmail(text)}
        placeholder="Enter your email"
      />

      <TouchableOpacity
        disabled={loading}
        onPress={handleResetPassword}
        className="p-3 mt-5  border-green-500 border-2 items-center rounded-3xl  w-10/12"
      >
        <Text className="text-xl font-bold text-green-500">
          {loading ? 'Sending...' : 'Send Reset Password'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    // marginTop: 50,
    padding: 20,
    gap: 5,
    backgroundColor: '#f0f0f0', // Light background for contrast
  },
  loginInput: {
    width: '80%', // Input width takes 80% of screen width
    padding: 15, // Padding for touchable input area
    marginVertical: 10, // Spacing between inputs
    backgroundColor: '#fff', // White background for inputs
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd', // Border color for input fields
  },
  loginButton: {
    backgroundColor: '#007BFF', // Blue background for login button
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginVertical: 10, // Spacing below the button
    width: '80%', // Button width should match input fields
    alignItems: 'center', // Center text horizontally
    justifyContent: 'center', // Center text vertically
  },
  loginButtonText: {
    color: '#fff', // White text
    fontSize: 16,
    fontWeight: 'bold', // Bold text for the button
  },
  registerButton: {
    backgroundColor: '#6c757d', // Grey color for register button
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginVertical: 10,
    textAlign: 'center',
    width: '80%',
    alignItems: 'center', // Center the text horizontally
    justifyContent: 'center', // Center the text vertically
  },
  registerText: {
    color: '#fff', // White text for the register button
    fontSize: 16,
    fontWeight: 'bold', // Bold text for the register button
    textAlign: 'center', // Ensure text is centered
  },
})

export default resetPassword
