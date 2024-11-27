import useSignUp from '@/hooks/useSignUp'
import { Picker } from '@react-native-picker/picker'
import * as ImagePicker from 'expo-image-picker'
import React, { useState } from 'react'
import {
  Alert,
  Image,
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
  const [image, setImage] = useState<string | null>(null)

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
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
      >
        <Text className="text-3xl font-bold text-green-500">Sign up</Text>
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
