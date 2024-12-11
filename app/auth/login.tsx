import { auth, db } from '@/config'
import { useUserStore } from '@/store/useUserStore'
import { Link, useRouter } from 'expo-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import React, { useState } from 'react'
import {
  Image,
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
  const { setUser } = useUserStore()

  const [loading, setLoading] = useState(false)
  const handleLogin = async () => {
    setLoading(true)
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password)
      if (userCred) {
        const docSnap = await getDoc(doc(db, 'users', userCred.user.uid))
        if (docSnap.exists()) {
          const data = docSnap.data()
          setUser(data)
          if (data.role === 'admin') {
            router.push('/admin/home')
          } else if (data.role === 'teacher') {
            router.push('/teacher/messages')
          } else {
            router.push('/student/messages')
          }
        }
      }
      setLoading(false)
    } catch (error: any) {
      setLoading(false)
      console.error('Login error:', error.message)
      alert(error.message)
    }
  }

  return (
    <View style={styles.container}>
      <View className="flex items-center justify-between gap-10">
        <Image
          className="h-64 w-64"
          source={require('../../assets/images/logo.png')}
        />
        <View>
          <Text className="text-2xl tracking-widest">Welcome back !</Text>
        </View>
      </View>
      <TextInput
        className=" mt-5 rounded-2xl text-2xl border border-slate-200 bg-slate-200 w-10/12 p-4"
        value={email}
        onChangeText={(text) => setEmail(text)}
        placeholder="Email"
      />
      <TextInput
        value={password}
        onChangeText={(text) => setPassword(text)}
        placeholder="Password"
        secureTextEntry
        className=" mt-5 rounded-2xl text-2xl border border-slate-200 bg-slate-200 w-10/12 p-4"
      />
      <TouchableOpacity
        disabled={loading}
        onPress={handleLogin}
        className="p-3 mt-5  border-green-500 border-2 items-center rounded-3xl  w-10/12"
      >
        <Text className="text-3xl font-bold text-green-500">
          {loading ? 'Loging...' : 'Login'}
        </Text>
      </TouchableOpacity>
      <View className="flex flex-row gap-4 mt-5">
        <Text className="text-slate-400">New User? </Text>
        <Link href={'/auth/signup'}>
          <Text className="text-green-500">Sign Up</Text>
        </Link>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
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

export default login
