import { auth } from '@/config'
import { signOut } from 'firebase/auth'
import React from 'react'
import { Button, Text, View } from 'react-native'

const index = () => {
  return (
    <View>
      <Text>index</Text>
      <Button onPress={() => signOut(auth)} title="Log out" />
    </View>
  )
}

export default index
