import { auth } from '@/config'
import useProfile from '@/hooks/useProfile'
import { Feather, Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
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
    <View className="relative mb-56 ">
      <View
        style={{
          height: 200,
          width: '100%',
          padding: 5,
        }}
      >
        {user?.coverImage && user?.coverImage !== 'undefined' ? (
          <Image
            style={{ width: '100%', height: '100%' }}
            source={{ uri: user?.coverImage }}
            resizeMode="cover"
          />
        ) : (
          <View className=" mt-20 items-center justify-center">
            <Text className="text-2xl font-semibold">No Cover Image</Text>
          </View>
        )}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 7,
            left: 7,
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: 100,
            padding: 10,
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
              bottom: 5,
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
      <LinearGradient
        className=" top-56 absolute w-full  "
        colors={['#ceeef6', 'transparent']}
        // colors={['#4c669f', '#3b5998', '#192f6a']}
        style={{
          borderTopRightRadius: 40,
          borderTopLeftRadius: 40,
          height: 300,
        }}
      />
      <View className=" absolute w-full top-44 justify-center flex flex-col gap-5 items-center">
        <View className="h-36 w-36 rounded-full bg-gray-200 items-center justify-center border-[6px] overflow-hidden border-white">
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
              <TouchableOpacity className="bg-blue-400 shadow-[0_4px_10px_rgba(0,0,0,0.8)] shadow-black px-10 py-3 rounded-full flex flex-row items-center gap-5">
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
              <TouchableOpacity className="bg-blue-400 shadow-[0_4px_10px_rgba(0,0,0,0.8)] shadow-black px-10 py-3 rounded-full flex flex-row items-center gap-5">
                {/* <Feather name="message-square" size={24} color="black" /> */}
                <Text className="text-lg text-white font-semibold">
                  Message
                </Text>
              </TouchableOpacity>
            </Link>
          )}
        </View>
      </View>
    </View>
  )
}

export default ProfileHeader
