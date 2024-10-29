import UserGroupList from '@/components/UserGroupList'
import UserList from '@/components/UserList'
import { Feather } from '@expo/vector-icons'
import React from 'react'
import { TextInput, TouchableOpacity, View } from 'react-native'

const createGroup = () => {
  return (
    <View className="flex flex-col gap-20">
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
          placeholderTextColor={'#999'}
        />
        <TouchableOpacity>
          <Feather name="send" size={24} />
        </TouchableOpacity>
      </View>
      <UserGroupList />
    </View>
  )
}

export default createGroup
