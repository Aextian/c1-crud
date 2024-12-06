import LoadingScreen from '@/components/loadingScreen'
import { storage } from '@/config'
import useSignUp from '@/hooks/useSignUp'
import { Feather } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import * as ImagePicker from 'expo-image-picker'
import { Link } from 'expo-router'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import React, { useState } from 'react'
import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated'

const addUser = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [name, setName] = useState('')
  const [image, setImage] = useState<string | null>(null)

  const uploadImage = async () => {
    if (image) {
      const response = await fetch(image)
      const blob = await response.blob()
      const filename = image.split('/').pop()
      const storageRef = ref(storage, `images/${filename}`)
      await uploadBytes(storageRef, blob)
      const downloadURL = await getDownloadURL(storageRef)
      return downloadURL
    }
  }
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })
    if (!result.canceled) {
      setImage(result.assets[0].uri)
    }
  }
  const { signUp, loading, error } = useSignUp() // Using the custom hook

  const handleSignUp = async () => {
    try {
      const imageUrl = await uploadImage()
      const user = await signUp(email, password, name, role, String(imageUrl))
      if (user) {
        alert('Registered successfully!')
        // Optionally, reset form fields
        setEmail('')
        setPassword('')
        setName('')
        setRole('')
      }
    } catch (error) {
      alert(error)
    }
  }

  return (
    <Animated.View entering={FadeIn} style={{ flex: 1, marginTop: 25 }}>
      <Animated.View entering={SlideInDown} style={{ flex: 1 }}>
        {/* Dismiss modal when pressing outside */}
        {/* <SafeAreaProvider> */}
        <SafeAreaView style={{ flex: 1 }}>
          <View className="w-full bg-white border-b border-b-slate-100 flex justify-start ">
            <Link href={'/admin/posts'} asChild>
              <Pressable className="p-4">
                <Feather name="x" size={20} />
              </Pressable>
            </Link>
          </View>
          <View style={styles.container}>
            <View className="h-36 w-36 rounded-full bg-green-200 overflow-hidden">
              {image && (
                <Image
                  source={{ uri: image }}
                  className="h-full w-full object-cover"
                />
              )}
            </View>
            <TouchableOpacity
              onPress={pickImage}
              className="px-5 py-1 rounded-lg bg-gray-200"
            >
              <Text>Select Profile</Text>
            </TouchableOpacity>
            <TextInput
              value={email}
              onChangeText={(email) => {
                setEmail(email)
              }}
              placeholder="Email"
              className=" mt-5 rounded-2xl text-2xl border border-slate-200 bg-slate-200 w-10/12 p-4"
            />
            <TextInput
              value={password}
              onChangeText={(password) => {
                setPassword(password)
              }}
              placeholder="Password"
              secureTextEntry
              className=" mt-5 rounded-2xl text-2xl border border-slate-200 bg-slate-200 w-10/12 p-4"
            />
            <TextInput
              value={name}
              onChangeText={(name) => {
                setName(name)
              }}
              placeholder="Name"
              className=" mt-5 rounded-2xl text-2xl border border-slate-200 bg-slate-200 w-10/12 p-4"
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
              className="p-3 mt-5  border-green-500 border-2 items-center rounded-3xl  w-10/12"
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text className="text-3xl font-bold text-green-500">
                {loading ? <LoadingScreen /> : 'Register'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        {/* </SafeAreaProvider> */}
      </Animated.View>
    </Animated.View>
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

export default addUser
