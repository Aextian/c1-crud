import { auth } from '@/config'
import { sendPasswordResetEmail } from 'firebase/auth'
import React, { useState } from 'react'
import {
  ImageBackground,
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
      <ImageBackground
        source={require('../../assets/images/background.jpg')} // Add your background image here
        style={styles.overlay}
      />
      <TextInput
        className=" mt-5 rounded-xl text-xl border border-slate-200 bg-slate-50 w-10/12 p-4"
        value={email}
        onChangeText={(text) => setEmail(text)}
        placeholder="Enter your email"
      />

      <TouchableOpacity
        disabled={loading}
        onPress={handleResetPassword}
        className="bg-blue-400 shadow-[0_4px_10px_rgba(0,0,0,0.8)] shadow-black px-5 py-3 my-5 rounded-full w-10/12 mx-10 justify-center flex flex-row items-center"
      >
        <Text className="text-xl font-bold text-white">
          {loading ? 'Sending...' : 'Send Reset Password'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',

    // justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    // marginTop: 50,
    padding: 20,
    gap: 5,
    backgroundColor: 'white',
  },
  overlay: {
    position: 'absolute',
    top: 250,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
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
