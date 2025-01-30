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
  const currentUser = auth.currentUser
  const router = useRouter()
  const { postsCount, likesCount, dislikesCount } = useProfile(id)

  return (
    <>
      <View className="h-48  w-full bg-gray-400 mt-10">
        {user?.coverImage && (
          <Image
            style={{ width: '100%', height: '100%' }}
            source={{ uri: user?.coverImage }}
          />
        )}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-0 left-5"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        {id === auth?.currentUser?.uid && (
          <TouchableOpacity
            onPress={() => pickImage()}
            className="absolute bottom-2 right-2 "
          >
            <Ionicons name="images-sharp" size={24} color="black" />
          </TouchableOpacity>
        )}
      </View>
      <View className="flex flex-row gap-10 absolute top-36 w-full justify-center items-center">
        <View className="flex flex-col gap-5 items-center">
          {user?.avatar ? (
            <Image
              className="h-36 w-36 rounded-full  border-4 border-white"
              source={{ uri: user?.avatar }}
            />
          ) : (
            <Image
              className="h-36 w-36 rounded-full  border-4 border-white"
              source={require('../assets/images/user-image.jpg')}
            />
          )}

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
