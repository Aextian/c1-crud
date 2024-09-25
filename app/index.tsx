import { View, Text, Button } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const index = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>index</Text>
      <Link href={'/register'} asChild>
      <Button title='Register'/>
      </Link>
      <Link href={'/one'} asChild>
      <Button title='One'/>
      </Link>
    </View>
  )
}

export default index
