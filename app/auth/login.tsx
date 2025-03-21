import { auth, db } from '@/config'
import { getDeviceId } from '@/hooks/getDeviceId'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Redirect, useRouter } from 'expo-router'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
  Image,
  ImageBackground,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import Toast from 'react-native-toast-message'

const login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const [imageSize, setImageSize] = useState({ height: 300, width: '100%' })
  const currentUser = auth.currentUser
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setImageSize({ height: 150, width: '80%' }) // Smaller size when keyboard is visible
      },
    )
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setImageSize({ height: 300, width: '100%' }) // Reset size when keyboard is hidden
      },
    )

    return () => {
      // Clean up the listeners on component unmount
      keyboardDidHideListener.remove()
      keyboardDidShowListener.remove()
    }
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    try {
      const deviceId = await getDeviceId()

      const userCred = await signInWithEmailAndPassword(auth, email, password)
      if (userCred) {
        const userRef = doc(db, 'activeSessions', userCred.user.uid)

        // Save session to Firestore
        await setDoc(userRef, { deviceId, timestamp: Date.now() })

        // Store device ID locally
        await AsyncStorage.setItem('deviceId', String(deviceId))
        console.log('Login successful!')

        const docSnap = await getDoc(doc(db, 'users', userCred.user.uid))
        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data.frozen) {
            Toast.show({
              type: 'error', // 'success', 'error', 'info'
              text1: 'Error',
              text2: 'Your account has been frozen',
            })
            setLoading(false)
            await signOut(auth)
            return
          }

          Toast.show({
            type: 'success', // 'success', 'error', 'info'
            text1: 'Success',
            text2: 'Login successful',
          })

          if (data.role !== undefined) {
            if (data.role === 'admin') {
              router.replace('/admin/home')
            } else {
              router.replace('/user/posts')
            }
          }
        }
      }
      setLoading(false)
    } catch (error: any) {
      setLoading(false)
      console.error('Login error:', error.message)
      // alert(error.message)
      Toast.show({
        type: 'error', // 'success', 'error', 'info'
        text1: 'Error',
        text2: ' Invalid email or password',
      })
    }
  }

  if (currentUser?.email === 'admin@example.com') {
    return <Redirect href="/admin/home" />
  }

  if (currentUser) {
    return <Redirect href="/user/posts" />
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/background.jpg')} // Add your background image here
        style={styles.overlay}
      />
      <View className="flex items-center justify-between  w-full">
        <Image
          style={{ height: imageSize.height, width: imageSize.width }} // Dynamic image size
          source={require('../../assets/images/logo.png')}
          resizeMode="contain"
        />
        <Text style={{ fontSize: 55, fontWeight: 'bold', fontFamily: 'serif' }}>
          WeConnect
        </Text>
        <View>
          <Text className="text-2xl tracking-widest font-semibold shadow shadow-black">
            Welcome back !
          </Text>
        </View>
      </View>
      <TextInput
        className=" mt-5 rounded-xl text-xl border border-slate-200 bg-slate-50 w-10/12 p-4"
        value={email}
        onChangeText={(text) => setEmail(text)}
        placeholder="Email"
      />
      <TextInput
        value={password}
        onChangeText={(text) => setPassword(text)}
        placeholder="Password"
        secureTextEntry
        className=" mt-5 rounded-xl text-xl border border-slate-200 bg-slate-50 w-10/12 p-4"
      />
      <TouchableOpacity
        disabled={loading}
        onPress={handleLogin}
        // className="p-3 mt-5  border-green-500 border-2 items-center rounded-xl  w-10/12"
        className="bg-blue-400 shadow-[0_4px_10px_rgba(0,0,0,0.8)] shadow-black px-5 py-3 my-5 rounded-full w-10/12 mx-10 justify-center flex flex-row items-center"
      >
        <Text className="text-3xl font-bold text-white">
          {loading ? 'Loging...' : 'Login'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push('/auth/reset-password')}
        className="flex flex-row gap-4 mt-5"
      >
        <Text className="text-slate-400">Forgot Password? </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    padding: 20,
    gap: 5,
    backgroundColor: 'white', // Light background for contrast
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

export default login
