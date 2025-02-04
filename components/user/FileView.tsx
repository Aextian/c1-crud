import { Feather } from '@expo/vector-icons'
import React from 'react'
import { Text, View } from 'react-native'

const FileView = ({ fileName }: { fileName: string }) => {
  return (
    <View className=" p-3 w-8/12 mx-auto rounded-xl bg-green-100 border border-gray-300">
      <View className="flex flex-row items-center gap-2">
        <Feather name="file" size={24} color={'green'} />
        <Text className="text-xs font-semibold">{fileName}</Text>
      </View>
    </View>
  )
}

export default FileView
