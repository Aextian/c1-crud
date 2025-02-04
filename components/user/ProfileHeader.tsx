import { auth } from '@/config'
import useProfile from '@/hooks/useProfile'
import { Feather, Ionicons } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import { DocumentData } from 'firebase/firestore'
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

interface IProps {
  id: string
  user: DocumentData | null
  pickImage: () => void
}

const ProfileHeader = ({ user, pickImage, id }: IProps) => {
  const router = useRouter()
  const { postsCount, likesCount, dislikesCount } = useProfile(id)

  return (
    <>
      <View
        style={{
          height: 200,
          width: '100%',
          // marginTop: 10,
          // shadowOffset: { width: 0, height: 2 },
        }}
        className="bg-white shadow"
      >
        {user?.coverImage && user?.coverImage !== 'undefined' ? (
          <Image
            style={{ width: '100%', height: '100%' }}
            source={{ uri: user?.coverImage }}
            resizeMode="contain"
          />
        ) : (
          <View className=" mt-20 items-center justify-center">
            <Text className="text-2xl font-semibold">No Cover Image</Text>
          </View>
        )}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 5,
            left: 5,
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: 100,
            padding: 5,
          }}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {id === auth?.currentUser?.uid && (
          <TouchableOpacity
            onPress={() => pickImage()}
            style={{
              position: 'absolute',
              bottom: 0,
              right: 5,
              padding: 10,
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: 100,
            }}
          >
            <Ionicons name="images-sharp" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
      <View
        className="relative bg-black "
        style={{
          borderTopRightRadius: 30,
          borderTopLeftRadius: 30,
        }}
      >
        <View className=" relative flex flex-col gap-5 items-center">
          <View className="h-36 w-36 rounded-full items-center justify-center border-4 overflow-hidden border-gray-300">
            {user?.avatar && user.avatar !== 'undefined' ? (
              <Image
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                source={{ uri: user?.avatar }}
              />
            ) : (
              <Feather name="user" size={60} color="gray" />
            )}
          </View>

          <Text className="text-2xl font-semibold first-letter:uppercase">
            {user?.name}
          </Text>
          <View className="flex flex-row gap-10">
            <View className="flex flex-col items-center">
              <Text className="font-bold text-2xl">{postsCount}</Text>
              <Text>Posts</Text>
            </View>
            <View className="flex flex-col items-center">
              <Text className="font-bold text-2xl">{likesCount}</Text>
              <Text>Likes</Text>
            </View>
            <View className="flex flex-col items-center">
              <Text className="font-bold text-2xl">{dislikesCount}</Text>
              <Text>Dislike</Text>
            </View>
          </View>
          <View className="flex flex-row gap-5">
            {id === auth?.currentUser?.uid && (
              <Link href="/user/(tabs)/settings/edit-profile" asChild>
                <TouchableOpacity className="bg-green-500 px-5 py-2 rounded-xl flex flex-row items-center gap-5">
                  <Ionicons name="create" size={24} color="white" />
                  <Text className="text-lg font-semibold text-white">
                    Edit Profile
                  </Text>
                </TouchableOpacity>
              </Link>
            )}

            {id !== auth?.currentUser?.uid && user && (
              <Link
                href={{
                  pathname: `/user/(tabs)/messages/conversations/user`,
                  params: {
                    id: user._id,
                  },
                }}
                asChild
              >
                <TouchableOpacity className="bg-green-200 px-5 py-2 rounded-xl flex flex-row items-center gap-5">
                  <Feather name="message-square" size={24} color="black" />
                  <Text className="text-lg font-semibold">Message</Text>
                </TouchableOpacity>
              </Link>
            )}
          </View>
        </View>
      </View>
    </>
  )
}

export default ProfileHeader
