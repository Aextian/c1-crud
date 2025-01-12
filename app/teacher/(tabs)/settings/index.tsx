import { auth } from '@/config'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { signOut } from 'firebase/auth'
import React from 'react'
import {
  Image,
  Pressable,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

const index = () => {
  const currentUser = auth?.currentUser
  console.log(currentUser)
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 px-5  gap-10 bg-gray-200 ">
      <TouchableOpacity
        className="bg-white p-5 mt-20 items-center rounded-2xl flex justify-start flex-row gap-5 "
        // onPress={() => router.push('/teacher/(tabs)/settings/profile')}
        onPress={() =>
          router.push({
            pathname: '/teacher/(tabs)/settings/profile',
            params: {
              id: currentUser?.uid,
            },
          })
        }
      >
        <View className="rounded-full w-16 h-16  p-3 items-center justify-center">
          {currentUser?.photoURL ? (
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
          <Text className="text-xs text-gray-400">{currentUser?.email}</Text>
        </View>
      </TouchableOpacity>
      <View className="bg-white p-5 rounded-lg flex justify-start  gap-5  ">
        <Text>General</Text>
        <View>
          <Pressable
            onPress={() => router.push('/teacher/(tabs)/settings/edit-profile')}
          >
            <Text className="text-sm">Edit Profile</Text>
            <Text className="text-xs text-gray-200">
              {currentUser?.displayName}
            </Text>
          </Pressable>

          <View>
            <Text className="text-sm">Term of use</Text>
            <Text className="text-xs text-gray-200">Jhon Doe</Text>
          </View>
        </View>
      </View>
      <View className="bg-white p-5 rounded-lg flex justify-start  gap-5  ">
        <Text>Freferences</Text>
        <View>
          <Pressable onPress={() => signOut(auth)}>
            <Text className="text-sm">Log out</Text>
            <Text className="text-xs text-gray-400">
              Securly log out of account
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default index
