import React from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import LoadingScreen from './loadingScreen'
interface IProps {
  setRoom: React.Dispatch<React.SetStateAction<string>>
  joinCall: () => void
  isLoading: boolean
}
const JoinMeeting = ({ setRoom, joinCall, isLoading }: IProps) => {
  return (
    <View className="w-8/12 mx-auto flex gap-5">
      <TextInput
        placeholder="Room ID"
        className="border border-gray-400 p-2 rounded-lg w-full"
        onChangeText={(text) => setRoom(text)}
      />
      <TouchableOpacity
        className="bg-green-400 rounded-lg p-4"
        onPress={joinCall}
        disabled={isLoading}
      >
        <Text className="text-white text-center">
          {isLoading ? <LoadingScreen /> : 'Join Room'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default JoinMeeting
