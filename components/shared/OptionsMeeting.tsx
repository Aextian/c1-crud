import { Feather, Ionicons } from '@expo/vector-icons'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'

interface IOptionsMeetingProps {
  toggleCamera: () => void
  switchCamera: () => void
  leaveCall: () => void
  toggleMute: () => void
  isMuted: boolean
  isCameraEnabled: boolean
  usingFrontCamera: boolean
}

const OptionsMeeting = ({
  toggleCamera,
  switchCamera,
  leaveCall,
  toggleMute,
  isMuted,
  isCameraEnabled,
  usingFrontCamera,
}: IOptionsMeetingProps) => {
  return (
    <View className="flex flex-row justify-between items-center p-5 px-10 rounded-lg gap-10  bg-white">
      <TouchableOpacity
        className="rounded-full p-5 bg-gray-200"
        onPress={toggleMute}
      >
        <Feather
          name={`${isMuted ? 'mic-off' : 'mic'}`}
          size={24}
          color="black"
        />
      </TouchableOpacity>
      <TouchableOpacity
        className="rounded-full p-5 bg-gray-200"
        onPress={toggleCamera}
      >
        <Feather
          name={`${isCameraEnabled ? 'video-off' : 'video'}`}
          size={24}
          color="black"
        />
      </TouchableOpacity>

      <TouchableOpacity
        className="rounded-full p-5 bg-gray-200"
        onPress={switchCamera}
      >
        <Ionicons name="camera-reverse-outline" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity
        className="rounded-full p-5 bg-gray-200"
        onPress={leaveCall}
      >
        <Feather name="phone-call" size={24} color="red" />
      </TouchableOpacity>
    </View>
  )
}

export default OptionsMeeting
