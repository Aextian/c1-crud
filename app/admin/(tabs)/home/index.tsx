import HomeHeader from '@/components/admin/HomeHeader'
import { Feather } from '@expo/vector-icons'
import { Link } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const index = () => {
  return (
    <View className="flex-1 p-10">
      <HomeHeader />
      <View className=" w-full gap-5 flex flex-wrap flex-row justify-between  mt-10">
        <Link href={'/admin/home/manage-posts'} asChild>
          <TouchableOpacity className="flex items-center w-1/4 aspect-square">
            <View className="flex flex-col items-center bg-green-400 p-5 rounded-2xl ">
              <Feather name="home" color="white" size={28} />
            </View>
            <Text className="text-xs text-slate-400">Manage Post</Text>
          </TouchableOpacity>
        </Link>
        <Link href={'/admin/home/manage-users'} asChild>
          <TouchableOpacity className="flex items-center w-1/4 aspect-square">
            <View className="flex flex-col items-center bg-green-400 p-5 rounded-2xl ">
              <Feather name="users" color={'white'} size={28} />
            </View>
            <Text className="text-xs text-slate-400">Manage Users</Text>
          </TouchableOpacity>
        </Link>
        <Link href={'/admin/home/manage-section'} asChild>
          <TouchableOpacity className="flex items-center w-1/4 aspect-square">
            <View className="flex flex-col items-center bg-green-400 p-5 rounded-2xl ">
              <Feather name="edit" color={'white'} size={28} />
            </View>
            <Text className="text-xs text-slate-400">Manage Section</Text>
          </TouchableOpacity>
        </Link>

        <Link href={'/admin/home/manage-year-level'} asChild>
          <TouchableOpacity className="flex items-center w-1/4 aspect-square">
            <View className="flex flex-col items-center bg-green-400 p-5 rounded-2xl ">
              <Feather name="edit-2" color={'white'} size={28} />
            </View>
            <Text className="text-xs text-slate-400">Manage Year</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  )
}

export default index
