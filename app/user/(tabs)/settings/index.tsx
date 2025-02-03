import ModalLoadingScreen from '@/components/ModalLoadingScreen'
import { auth } from '@/config'
import { Feather } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import { signOut } from 'firebase/auth'
import React, { useState } from 'react'
import { Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'

const index = () => {
  const [isLoading, setIsLoading] = useState(false)
  const currentUser = auth?.currentUser
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
      <SafeAreaView className="flex-1 px-5 bg-white  gap-5">
        <Link
          href={{
            pathname: '/user/(tabs)/settings/profile',
            params: { id: currentUser?.uid },
          }}
          asChild
        >
          <TouchableOpacity>
            <View className="bg-white shadow p-5 mt-5 items-center rounded-2xl flex justify-start flex-row gap-5 ">
              <View className="rounded-full w-16 h-16  p-3 items-center justify-center">
                {currentUser?.photoURL &&
                currentUser?.photoURL !== 'undefined' ? (
                  <Image
                    source={{ uri: currentUser?.photoURL }}
                    style={{ width: '100%', height: '100%', borderRadius: 100 }}
                  />
                ) : (
                  <Feather name="user" size={24} color="black" />
                )}
              </View>

              <View>
                <Text className="text-sm">{currentUser?.displayName}</Text>
                <Text className="text-xs text-gray-400">
                  {currentUser?.email}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Link>

        <View className="bg-white shadow p-5 rounded-lg flex justify-start  gap-5  ">
          <Text>General</Text>
          <Link href="/user/(tabs)/settings/edit-profile" asChild>
            <TouchableOpacity>
              <Text className="text-sm">Edit Profile</Text>
              <Text className="text-xs text-gray-200">
                {currentUser?.displayName}
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
        <View className="bg-white shadow p-5 rounded-lg flex justify-start  gap-5  ">
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
