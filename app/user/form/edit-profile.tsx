import ModalLoadingScreen from '@/components/shared/ModalLoadingScreen'
import { auth, db } from '@/config'
import useImageUploads from '@/hooks/useImageUploads'
import { Feather } from '@expo/vector-icons'
import { Stack, useRouter } from 'expo-router'
import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import React, { useState } from 'react'
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

export type TDataProps = {
  role?: string
  year?: string
  course?: string
  avatar?: string
}

interface IUser extends TDataProps {
  name: string
  password: string
}

const editProfile = () => {
  const currentUser = auth?.currentUser
  // useHideTabBarOnFocus()

  const [password, setPassword] = useState('')
  const [confirmPasword, setConfirmPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [name, setName] = useState(currentUser?.displayName || '')
  const [isFormValid, setIsFormValid] = useState(false)
  const [errors, setErrors] = useState({} as any)
  const [isLoading, setIsLoading] = useState(false)

  const PASSWORD_REQUIRED = 'Password is required'
  const PASSWORD_INCORRECT = 'Incorrect password'

  const router = useRouter()

  const [currentPasswordValidate, setCurrentPasswordValidate] = useState({
    isIncorrect: false,
    isRequired: false,
  })

  const { image, pickImage, uploadImage } = useImageUploads() //hooks to handle image

  const handleFormValidation = () => {
    let errors = {} as any

    if (!name) {
      errors.name = 'Name is required'
    }

    if (password !== confirmPasword) {
      errors.password = 'Passwords do not match'
    }

    setErrors(errors)
    setIsFormValid(Object.keys(errors).length === 0)
  }

  const updateUser = async ({ name, password }: Partial<IUser>) => {
    // if (!isFormValid) {
    handleFormValidation()
    //   return
    // }

    setIsLoading(true)

    const auth = getAuth()
    const user = auth.currentUser
    const userId = user?.uid

    if (!user) {
      console.error('No user is signed in.')
      setIsLoading(false)
      return
    }
    try {
      if (currentPassword) {
        const credential = EmailAuthProvider.credential(
          user.email!,
          currentPassword,
        )
        try {
          await reauthenticateWithCredential(user, credential)
        } catch (error) {
          console.log('Error reauthenticating:', error)
          setCurrentPasswordValidate({
            isIncorrect: true,
            isRequired: false,
          })
          setIsLoading(false)
          return
        }
      } else {
        setCurrentPasswordValidate({
          isIncorrect: false,
          isRequired: true,
        })
        setIsLoading(false)

        return
      }

      // Update Firebase Authentication profile

      if (password) {
        await updatePassword(user, password)
      }

      // Update Firestore user document
      if (userId) {
        const imageUrl = await uploadImage()

        if (name) await updateProfile(user, { displayName: name })
        if (imageUrl) await updateProfile(user, { photoURL: imageUrl })

        const userRef = doc(db, 'users', userId)
        const updatedData: Partial<IUser> = {}
        if (name) updatedData.name = name
        if (imageUrl) updatedData.avatar = imageUrl
        console.log(updatedData)

        if (Object.keys(updatedData).length > 0) {
          await updateDoc(userRef, updatedData)
        }

        setIsLoading(false)
        // router.replace('/teacher/settings/profile')
        alert('Updated Successfully')
        router.back()
      } else {
        console.error('User ID is undefined')
        setIsLoading(true)
      }
    } catch (error: any) {
      setIsLoading(true)
      console.error('Error updating user:', error.message)
    }
  }

  //   submit updated data
  const handleSubmit = () => {
    // alert('hshshsh')
    updateUser({ name, password })
  }

  return (
    <>
      <ModalLoadingScreen isModalVisible={isLoading} />

      <Stack.Screen
        options={{
          title: '',
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Text>Cancel</Text>
            </Pressable>
          ),
          headerRight: () => (
            <TouchableOpacity
              disabled={!currentPassword || !name}
              onPress={handleSubmit}
            >
              <Text
                className={`text-lg font-bold ${!currentPassword || !name || isLoading ? 'text-gray-400' : ''}`}
              >
                Done
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 10,
          backgroundColor: 'white',
        }}
      >
        <ImageBackground
          source={require('../../../assets/images/bgsvg.png')}
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: 0.3,
            },
          ]}
        />
        {/* edit form */}
        <View className="border  border-gray-200 rounded-xl p-5 w-full">
          <View className="flex flex-row justify-between items-center">
            <View className="flex flex-col gap-5 p-5 w-3/4">
              <Text className="text-md font-bold">Email</Text>
              <Text className="border-b border-gray-300 ">
                {currentUser?.email}
              </Text>
            </View>

            <View className="rounded-full w-24 h-24   p-3 items-center justify-center">
              {!image &&
              currentUser?.photoURL &&
              currentUser?.photoURL !== 'undefined' ? (
                <Image
                  source={{ uri: currentUser?.photoURL }}
                  style={{ width: '100%', height: '100%', borderRadius: 100 }}
                />
              ) : image ? (
                <Image
                  source={{ uri: image }}
                  style={{ width: '100%', height: '100%', borderRadius: 100 }}
                />
              ) : (
                <Feather name="user" size={24} color="black" />
              )}
              <View className="absolute bottom-5 right-2">
                <Pressable onPress={pickImage}>
                  <Feather name="camera" size={24} color="white" />
                </Pressable>
              </View>
            </View>
          </View>
          <View className="flex flex-col gap-5 p-5">
            <Text className="text-md font-bold">Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              className="border-b border-gray-300 "
            />
            <Text className="text-red-500 text-sm">{errors.name} </Text>
          </View>
          <View className="flex flex-col gap-5 p-5">
            <Text className="text-md font-bold">Current Password</Text>
            <TextInput
              onChangeText={setCurrentPassword}
              secureTextEntry
              className="border-b border-gray-300"
            />
            <Text className="text-red-500 text-sm">
              {(currentPasswordValidate.isRequired && PASSWORD_REQUIRED) ||
                (currentPasswordValidate.isIncorrect && PASSWORD_INCORRECT)}
            </Text>
          </View>
          <View className="flex flex-col gap-5 p-5">
            <Text className="text-md font-bold">New Password</Text>
            <TextInput
              secureTextEntry
              onChangeText={setPassword}
              className="border-b border-gray-300"
            />
          </View>
          <View className="flex flex-col gap-5 p-5">
            <Text className="text-md font-bold">Confirm Password</Text>
            <TextInput
              className="border-b border-gray-300"
              secureTextEntry
              onChangeText={setConfirmPassword}
            />
          </View>
          {confirmPasword && password !== confirmPasword && (
            <Text className="text-xs font-bold text-red-300">
              Password does not match
            </Text>
          )}
        </View>
      </View>
    </>
  )
}

export default editProfile
