import UserGroupList from '@/components/UserGroupList'
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
    router.push('/user/(tabs)/messages/group')
  }

  return (
    <View className="flex flex-col gap-5 px-5 mt-5">
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          gap: 20,
          alignItems: 'center',
          borderColor: 'grey',
          borderWidth: 1,
          paddingHorizontal: 20,
          borderRadius: 10,
        }}
      >
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
