import { Feather, Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const index = () => {
  const router = useRouter()
  return (
    <View className="flex-1 p-10">
      <View className="w-full bg-slate-200 rounded-xl p-5 flex flex-row gap-10 items-center justify-center">
        <View>
          <Feather name="users" size={28} />
          <Text>24</Text>
        </View>
        <View>
          <Ionicons name="book" size={28} />
          <Text>24</Text>
        </View>
        <View>
          <Ionicons name="school" size={28} />
          <Text>24</Text>
        </View>
      </View>
      <View className=" w-full gap-5 flex flex-row justify-around  mt-10">
        <TouchableOpacity
          className="flex items-center"
          onPress={() => router.push('/admin/posts')}
        >
          <View className="flex flex-col items-center bg-green-100 p-8 rounded-2xl ">
            <Feather name="home" size={28} />
          </View>
          <Text className="text-xs text-slate-400">Manage Post</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex items-center"
          onPress={() => router.push('/admin/home/manage-users')}
        >
          <View className="flex flex-col items-center bg-green-100 p-8 rounded-2xl ">
            <Feather name="users" size={28} />
          </View>
          <Text className="text-xs text-slate-400">Manage Users</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex items-center"
          onPress={() => router.push('/admin/home/manage-course')}
        >
          <View className="flex flex-col items-center bg-green-100 p-8 rounded-2xl ">
            <Feather name="edit" size={28} />
          </View>
          <Text className="text-xs text-slate-400">Manage Course</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex items-center"
          onPress={() => router.push('/admin/(tabs)/home/manage-year-level')}
        >
          <View className="flex flex-col items-center bg-green-100 p-8 rounded-2xl ">
            <Feather name="edit-2" size={28} />
          </View>
          <Text className="text-xs text-slate-400">Manage Year</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default index
