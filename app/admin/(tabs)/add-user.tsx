import LoadingScreen from '@/components/loadingScreen'
import { storage } from '@/config'
import useGradeLevel from '@/hooks/useGradeLevel'
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

export type TDataProps = {
  role: string
  year: string
  course: string
}

const addUser = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const { years, courses } = useGradeLevel<string>()
  const [isFormValid, setIsFormValid] = useState(false)
  const [errors, setErrors] = useState({} as any)

  const handleFormValidation = () => {
    let errors = {} as any

    if (!email) {
      errors.email = 'Email is required'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      errors.email = 'Invalid email address'
    }

    if (!password) {
      errors.password = 'Password is required'
    }

    if (!name) {
      errors.name = 'Name is required'
    }

    if (!data.role) {
      errors.role = 'Role is required'
    }

    if (!data.year && data.role === 'student') {
      errors.year = 'Year is required'
    }

    if (!data.course && data.role === 'student') {
      errors.course = 'Course is required'
    }

    setErrors(errors)
    setIsFormValid(Object.keys(errors).length === 0)
  }

  const [data, setData] = useState<TDataProps>({
    role: '',
    year: '',
    course: '',
  })

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
    if (!isFormValid) {
      handleFormValidation()
      return
    }
    try {
      const imageUrl = await uploadImage()
      const user = await signUp(email, password, name, data, String(imageUrl))
      if (user) {
        alert('Registered successfully!')
        // Optionally, reset form fields
        setEmail('')
        setImage(null)
        setPassword('')
        setData({
          role: '',
          year: '',
          course: '',
        })
      }
    } catch (error) {
      alert(error)
    }
  }

  return (
    <Animated.View entering={FadeIn} style={{ flex: 1, marginTop: 10 }}>
      <Animated.View entering={SlideInDown} style={{ flex: 1 }}>
        {/* Dismiss modal when pressing outside */}
        {/* <SafeAreaProvider> */}
        <SafeAreaView style={{ flex: 1 }}>
          <View className="w-full bg-white border-b border-b-slate-100 flex justify-start ">
            <Link href={'/admin/home'} asChild>
              <Pressable className="p-4">
                <Feather name="x" size={20} />
              </Pressable>
            </Link>
          </View>
          <View style={styles.container}>
            <View className="h-24 w-24 rounded-full bg-white overflow-hidden shadow-lg">
              {image ? (
                <Image
                  source={{ uri: image }}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  source={require('../../../assets/images/user-image.jpg')}
                  className="h-full w-full object-cover"
                />
              )}
              <Feather name="x" size={20} />
            </View>
            <TouchableOpacity
              onPress={pickImage}
              className="px-5 py-1 rounded-lg bg-gray-200"
            >
              <Text>Select Profile</Text>
            </TouchableOpacity>
            <View className="items-center flex justify-center w-full">
              <TextInput
                value={email}
                onChangeText={(email) => {
                  setEmail(email)
                }}
                placeholder="Email"
                className=" rounded-2xl text-lg border border-slate-200 bg-slate-200 w-10/12 p-4"
              />
              <Text className="text-red-500 text-sm">{errors.email} </Text>
            </View>
            <View className="items-center flex justify-center w-full">
              <TextInput
                value={password}
                onChangeText={(password) => {
                  setPassword(password)
                }}
                placeholder="Password"
                secureTextEntry
                className=" rounded-2xl text-lg border border-slate-200 bg-slate-200 w-10/12 p-4"
              />
              <Text className="text-red-500 text-sm">{errors.password} </Text>
            </View>
            <View className="items-center flex justify-center w-full">
              <TextInput
                value={name}
                onChangeText={(name) => {
                  setName(name)
                }}
                placeholder="Name"
                className=" tex rounded-2xl text-lg border border-slate-200 bg-slate-200 w-10/12 p-4"
              />
              <Text className="text-red-500 text-sm">{errors.name} </Text>
            </View>

            <View className="items-center flex justify-center w-full">
              <View className="border border-slate-200 rounded-2xl bg-slate-200 w-10/12 ">
                <Picker
                  selectedValue={data.role}
                  style={{
                    // height: 50,
                    width: 350,
                  }}
                  onValueChange={(role) => setData({ ...data, role })}
                >
                  <Picker.Item label="Please Select Role" value="" />
                  <Picker.Item label="Student" value="student" />
                  <Picker.Item label="Teacher" value="teacher" />
                </Picker>
              </View>
              <Text className="text-red-500 text-sm">{errors.role} </Text>
            </View>
            {data.role === 'student' && (
              <>
                <View className="items-center flex justify-center w-full">
                  <View className="border border-slate-200 rounded-2xl bg-slate-200 w-10/12 ">
                    <Picker
                      selectedValue={data.year}
                      onValueChange={(year) => setData({ ...data, year })}
                      style={{
                        // height: 50,
                        width: 350,
                      }}
                    >
                      <Picker.Item label="Please Select Year Level" value="" />

                      {years.map((year: any) => (
                        <Picker.Item
                          key={year}
                          label={year.name}
                          value={year.name}
                        />
                      ))}
                    </Picker>
                  </View>
                  <Text className="text-red-500 text-sm">{errors.year} </Text>
                </View>

                <View className="items-center flex justify-center w-full">
                  <View className="border border-slate-200 rounded-2xl bg-slate-200 w-10/12 ">
                    <Picker
                      selectedValue={data.course}
                      onValueChange={(course) => setData({ ...data, course })}
                      style={{
                        // height: 50,
                        width: 350,
                      }}
                    >
                      <Picker.Item label="Please Select Course" value="" />
                      {courses.map((course: any) => (
                        <Picker.Item
                          key={course.id}
                          label={course.name}
                          value={course.name}
                        />
                      ))}
                    </Picker>
                  </View>
                  <Text className="text-red-500 text-sm">{errors.course} </Text>
                </View>
              </>
            )}

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
