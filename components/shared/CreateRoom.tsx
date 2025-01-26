import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
interface IProps {
  setRoom: React.Dispatch<React.SetStateAction<string>>
  room: string
  createRoom: () => void
}
const CreateRoom = ({ setRoom, createRoom, room }: IProps) => {
  return (
    <View className="w-8/12 mx-auto flex gap-10">
      {/* <TextInput
        placeholder="Room ID"
        className="border border-gray-400 p-2 rounded-lg w-full"
        onChangeText={(text) => setRoom(text)}
      /> */}
      <View className="flex items-center mb-10">
        <Text>Room ID: {room}</Text>
      </View>
      <TouchableOpacity
        className="bg-green-400 rounded-lg p-4"
        onPress={createRoom}
        // disabled={room === ''}
      >
        <Text className="text-white text-center">Generate Room</Text>
      </TouchableOpacity>
    </View>
  )
}

export default CreateRoom
