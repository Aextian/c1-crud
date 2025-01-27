import EditFormPost from '@/components/EditFormPost'
import { useLocalSearchParams } from 'expo-router'
import { DocumentData } from 'firebase/firestore'
import React from 'react'
import { SafeAreaView } from 'react-native'
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated'

const editPost = () => {
  const { data } = useLocalSearchParams<DocumentData>()
  console.log(data)
  return (
    <Animated.View entering={FadeIn} style={{ flex: 1, marginTop: 25 }}>
      <Animated.View entering={SlideInDown} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <EditFormPost data={data} />
        </SafeAreaView>
      </Animated.View>
    </Animated.View>
  )
}

export default editPost
