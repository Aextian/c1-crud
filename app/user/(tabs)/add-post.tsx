import PostsForm from '@/components/user/PostsForm'
import React from 'react'
import { SafeAreaView } from 'react-native'
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated'

const addPost = () => {
  return (
    <Animated.View entering={FadeIn} style={{ flex: 1, marginTop: 25 }}>
      <Animated.View entering={SlideInDown} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <PostsForm />
        </SafeAreaView>
      </Animated.View>
    </Animated.View>
  )
}

export default addPost
