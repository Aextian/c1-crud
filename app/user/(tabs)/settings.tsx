import ModalLoadingScreen from '@/components/shared/ModalLoadingScreen'
import { auth } from '@/config'
import { Feather } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import { signOut } from 'firebase/auth'
import React, { useState } from 'react'
import {
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <ImageBackground
          source={require('../../../assets/images/bgsvg.png')}
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: 0.3,
            },
          ]}
        />
        <Link
          href={{
            pathname: '/user/(profile)',
            params: { id: currentUser?.uid },
          }}
          asChild
        >
          <TouchableOpacity activeOpacity={0.8}>
            <View className="bg-white shadow p-5 mt-10 items-center rounded-2xl flex justify-start flex-row gap-5 ">
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
          <View className="px-4">
            <Link href="/user/(profile)/edit" asChild>
              <TouchableOpacity>
                <Text className="text-sm">Edit Profile</Text>
                <Text className="text-xs text-gray-200">
                  {currentUser?.displayName}
                </Text>
              </TouchableOpacity>
            </Link>
            <TouchableOpacity className="mt-5" onPress={handleSignOut}>
              <Text className="text-sm text-red-400">Log out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  )
}

export default index
