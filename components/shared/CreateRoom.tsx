import * as Clipboard from 'expo-clipboard'
import React, { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
interface IProps {
  room: string
  createRoom: () => void
}
const CreateRoom = ({ createRoom, room }: IProps) => {
  const [isCopy, setCopy] = useState(false)

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(room)
    setCopy(true)
  }

  const handleCreateRoom = () => {
    createRoom()
    setCopy(false)
  }

  return (
    <View className="w-8/12 mx-auto flex gap-10">
      <View className="flex items-center mb-10 gap-5">
        <Text>Room ID: {room}</Text>
        <TouchableOpacity onPress={copyToClipboard}>
          <Text className={`${!isCopy && 'font-bold'}`}>Copy</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        className="bg-green-400 rounded-lg p-4"
        onPress={handleCreateRoom}
      >
        <Text className="text-white text-center">Generate Room</Text>
      </TouchableOpacity>
    </View>
  )
}

export default CreateRoom
