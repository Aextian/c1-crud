import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
interface IProps {
  setType: React.Dispatch<React.SetStateAction<string>>
}
const MeetingType = ({ setType }: IProps) => {
  return (
    <View className="flex flex-col gap-4">
      <TouchableOpacity
        className="bg-red-300 rounded-lg p-4"
        onPress={() => setType('create')}
        activeOpacity={0.8}
      >
        <Text className="text-center text-white text-xl font-semibold">
          Create a Meeting
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-green-300 rounded-lg p-4"
        onPress={() => setType('join')}
        activeOpacity={0.8}
      >
        <Text className="text-xl text-white font-semibold text-center">
          Join Your Meeting
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default MeetingType
