import ModalLoadingScreen from '@/components/shared/ModalLoadingScreen'
import { auth } from '@/config'
import { useRouter } from 'expo-router'
import { signOut } from 'firebase/auth'
import React, { useState } from 'react'
import { Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'

const index = () => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut(auth)
      setIsLoading(false)
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <>
      <ModalLoadingScreen isModalVisible={isLoading} />

      <SafeAreaView className="flex-1 px-5 gap-10 bg-gray-200 ">
        <View className="bg-white p-5 mt-20 rounded-2xl flex justify-start flex-row gap-5 ">
          <View className="rounded-full w-12 h-12  items-center justify-center">
            {/* <Feather name="user" size={24} color="black" /> */}
            <Image
              source={require('../../../../assets/images/logo.png')}
              style={{ width: 35, height: 35, borderRadius: 100 }}
              resizeMode="contain" // Ensure the image scales correctly
            />
          </View>
          <View>
            <Text className="text-sm">Admin</Text>
            <Text className="text-xs text-gray-400">admin@example.com</Text>
          </View>
        </View>

        <View className="bg-white p-5 rounded-lg flex justify-start  gap-5  ">
          <Text>Freferences</Text>
          <View>
            <TouchableOpacity onPress={handleSignOut}>
              <Text className="text-sm">Log out</Text>
              <Text className="text-xs text-gray-400">
                Securly log out of account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  )
}

export default index
