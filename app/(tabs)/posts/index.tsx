import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const index = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Post index</Text>
      <Link href={'posts/1'}>Post 1</Link>
      <Link href={'posts/2'}>Post 2</Link>
      <Link href={'posts/3'}>Post 3</Link>
    </View>
  )
}

export default index
