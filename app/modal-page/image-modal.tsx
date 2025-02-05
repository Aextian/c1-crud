import { Stack, useLocalSearchParams } from 'expo-router'
import React from 'react'
import { Image, View } from 'react-native'
import PagerView from 'react-native-pager-view'
import Animated, { FadeIn } from 'react-native-reanimated'

export default function Modal() {
  const { imageUrls, index } = useLocalSearchParams<any>()
  const images = JSON.parse(imageUrls)

  return (
    <Animated.View
      entering={FadeIn}
      style={{
        flex: 1,
      }}
    >
      <Stack.Screen
        options={{
          presentation: 'fullScreenModal',
          animation: 'fade',
          // headerShown: false,
          headerTitle: '',
        }}
      />
      <PagerView
        style={{ flex: 1, backgroundColor: 'black' }}
        initialPage={Number(index)}
      >
        {images.length > 0 &&
          images.map((image: string, index: number) => (
            <View
              style={{ justifyContent: 'center', alignItems: 'center' }}
              key={index}
            >
              <Image
                source={{
                  uri: image,
                }}
                style={{
                  height: 300,
                  width: 400,
                  borderRadius: 10,
                  resizeMode: 'cover',
                }}
                // resizeMode="cover"
              />
            </View>
          ))}
      </PagerView>
    </Animated.View>
  )
}
