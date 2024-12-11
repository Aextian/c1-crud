import { Feather, Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const index = () => {
  const router = useRouter()
  return (
    <View className="flex-1 p-10">
      <View className="w-full bg-green-200 rounded-xl p-5 flex flex-row gap-10 items-center justify-center">
        <View>
          <Feather name="users" color={'green'} size={28} />
          <Text>24</Text>
        </View>
        <View>
          <Ionicons name="book" color={'green'} size={28} />
          <Text>24</Text>
        </View>
        <View>
          <Ionicons name="school" color={'green'} size={28} />
          <Text>24</Text>
        </View>
      </View>
      <View className=" w-full gap-5 flex flex-wrap flex-row justify-between  mt-10">
        <TouchableOpacity
          className="flex items-center w-1/4 aspect-square"
          onPress={() => router.push('/admin/home/manage-posts')}
        >
          <View className="flex flex-col items-center bg-green-400 p-8 rounded-2xl ">
            <Feather name="home" color="white" size={28} />
          </View>
          <Text className="text-xs text-slate-400">Manage Post</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex items-center w-1/4 aspect-square"
          onPress={() => router.push('/admin/home/manage-users')}
        >
          <View className="flex flex-col items-center bg-green-400 p-8 rounded-2xl ">
            <Feather name="users" color={'white'} size={28} />
          </View>
          <Text className="text-xs text-slate-400">Manage Users</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex items-center w-1/4 aspect-square"
          onPress={() => router.push('/admin/home/manage-course')}
        >
          <View className="flex flex-col items-center bg-green-400 p-8 rounded-2xl ">
            <Feather name="edit" color={'white'} size={28} />
          </View>
          <Text className="text-xs text-slate-400">Manage Course</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex items-center w-1/4 aspect-square"
          onPress={() => router.push('/admin/(tabs)/home/manage-year-level')}
        >
          <View className="flex flex-col items-center bg-green-400 p-8 rounded-2xl ">
            <Feather name="edit-2" color={'white'} size={28} />
          </View>
          <Text className="text-xs text-slate-400">Manage Year</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default index
