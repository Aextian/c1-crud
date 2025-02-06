import PostsForm from '@/components/user/PostsForm'
import React from 'react'
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

const CreatePostPage = () => {
  return (
    <Animated.View entering={FadeIn} style={{ flex: 1 }}>
      <Animated.View entering={SlideInDown} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <PostsForm />
        </SafeAreaView>
      </Animated.View>
    </Animated.View>
  )
}

export default CreatePostPage
