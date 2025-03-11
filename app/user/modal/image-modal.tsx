import { Stack, useLocalSearchParams } from 'expo-router'
import React from 'react'
import { Dimensions, Image, View } from 'react-native'
import ImageZoom from 'react-native-image-pan-zoom'
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
          presentation: 'modal',
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
              <ImageZoom
                cropWidth={Dimensions.get('window').width}
                cropHeight={Dimensions.get('window').height}
                imageWidth={Dimensions.get('window').width}
                imageHeight={Dimensions.get('window').height}
              >
                <Image
                  source={{
                    uri: image,
                  }}
                  style={{
                    height: '100%',
                    width: '100%',
                    borderRadius: 10,
                    resizeMode: 'contain',
                  }}
                  resizeMode="contain"
                />
              </ImageZoom>
            </View>
          ))}
      </PagerView>
    </Animated.View>
  )
}
