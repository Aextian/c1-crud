import LoadingScreen from '@/components/shared/loadingScreen'
import { auth } from '@/config'
import useGradeLevel from '@/hooks/useGradeLevel'
import useImageUploads from '@/hooks/useImageUploads'
import useSignUp from '@/hooks/useSignUp'
import { Feather } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import { Link } from 'expo-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import React, { useState } from 'react'
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

export type TDataProps = {
  role: string
  year: string
  section: string
  course: string
}

const addUser = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const { years, sections, courses } = useGradeLevel<string>()
  const [isFormValid, setIsFormValid] = useState(false)
  const [errors, setErrors] = useState({} as any)
  const { image, pickImage, uploadImage, clearImage } = useImageUploads() //hooks to handle image

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

    if (!data.section && data.role === 'student') {
      errors.section = 'Section is required'
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
    section: '',
    course: '',
  })

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
        await signInWithEmailAndPassword(auth, 'admin@example.com', '123456')
        Toast.show({
          type: 'success', // 'success', 'error', 'info'
          text1: 'Success',
          text2: 'User has been registered successfully',
        })
        // Optionally, reset form fields
        setEmail('')
        clearImage()
        setPassword('')
        setData({
          role: '',
          year: '',
          section: '',
          course: '',
        })
        setName('')
      }
    } catch (error) {
      console.log(error)
      alert(error)
    }
  }

  return (
    <Animated.View entering={FadeIn} style={{ flex: 1, marginTop: 10 }}>
      <Animated.View entering={SlideInDown} style={{ flex: 1 }}>
        {/* <SafeAreaProvider> */}
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
          <View style={{ zIndex: 99999 }}>
            <Toast />
          </View>
          <View className="w-full bg-white border-b border-b-slate-100 flex justify-start ">
            <Link href={'/admin/home'} asChild>
              <Pressable className="p-4">
                <Feather name="x" size={20} />
              </Pressable>
            </Link>
          </View>
          <ScrollView
            style={styles.container}
            contentContainerStyle={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
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
                className=" mt-3 rounded-xl text-xl border border-slate-200 bg-slate-50 w-10/12 p-4"
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
                className=" mt-3 rounded-xl text-xl border border-slate-200 bg-slate-50 w-10/12 p-4"
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
                className=" mt-3 rounded-xl text-xl border border-slate-200 bg-slate-50 w-10/12 p-4"
              />
              <Text className="text-red-500 text-sm">{errors.name} </Text>
            </View>

            <View className="items-center flex justify-center w-full">
              <View
                // className="border border-slate-200 rounded-2xl bg-slate-200 w-10/12 "
                className=" mt-3 rounded-xl  border border-slate-200 bg-slate-50 w-10/12 "
              >
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
                  <View className=" mt-3 rounded-xl  border border-slate-200 bg-slate-50 w-10/12 ">
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

                <View className="items-center flex justify-center w-full">
                  <View className=" mt-3 rounded-xl  border border-slate-200 bg-slate-50 w-10/12 ">
                    <Picker
                      selectedValue={data.section}
                      onValueChange={(section) => setData({ ...data, section })}
                      style={{
                        // height: 50,
                        width: 350,
                      }}
                    >
                      <Picker.Item label="Please Select Section" value="" />
                      {sections.map((section: any) => (
                        <Picker.Item
                          key={section.id}
                          label={section.name}
                          value={section.name}
                        />
                      ))}
                    </Picker>
                  </View>
                  <Text className="text-red-500 text-sm">
                    {errors.section}{' '}
                  </Text>
                </View>

                <View className="items-center flex justify-center w-full">
                  <View className=" mt-3 rounded-xl  border border-slate-200 bg-slate-50 w-10/12 ">
                    <Picker
                      selectedValue={data.year}
                      onValueChange={(year) => setData({ ...data, year })}
                      style={{
                        // height: 50,
                        width: 350,
                      }}
                    >
                      <Picker.Item label="Please Select Level" value="" />

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
              </>
            )}

            <TouchableOpacity
              className="bg-green-400 shadow-[0_4px_10px_rgba(0,0,0,0.8)] shadow-black px-5 py-3 my-5 rounded-full w-10/12 mx-10 justify-center flex flex-row items-center"
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text className="text-3xl font-bold text-white">
                {loading ? <LoadingScreen /> : 'Register'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
        {/* </SafeAreaProvider> */}
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
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
