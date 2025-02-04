import UserGroupList from '@/components/user/UserGroupList'
import { auth } from '@/config'
import { useCreateGroup } from '@/hooks/useGroupChat'
import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { TextInput, TouchableOpacity, View } from 'react-native'

const createGroup = () => {
  const createGroup = useCreateGroup()
  const router = useRouter()
  useHideTabBarOnFocus()
  const [userIds, setUserIds] = useState<string[]>([])
  const [groupChatName, setGroupChatName] = useState('')
  const [loading, setLoading] = useState(false)
  const currentUser = auth.currentUser
  const handleCreateGroup = async () => {
    setLoading(true)
    await createGroup(groupChatName, [currentUser?.uid, ...userIds])
    setLoading(false)
    setGroupChatName('')
    router.push('/user/(tabs)/messages')
  }

  return (
    <View className="flex flex-1 flex-col gap-5 px-5  bg-white">
      <View className="flex flex-row mt-5 items-center justify-between gap-5 border border-gray-300 px-3 rounded-xl">
        <Feather name="message-circle" size={24} />
        <TextInput
          style={{
            flex: 1,
            padding: 10,
            width: '100%',
            outlineStyle: 'none',
          }}
          placeholder="Create a group chat"
          onChangeText={(groupChatName) => setGroupChatName(groupChatName)}
          placeholderTextColor={'#999'}
        />
        <TouchableOpacity disabled={loading} onPress={handleCreateGroup}>
          <Feather name="send" size={24} />
        </TouchableOpacity>
      </View>

      <UserGroupList setUserIds={setUserIds} userIds={userIds} />
    </View>
  )
}

export default createGroup
