import React from 'react'
import { PinchGestureHandler } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

const ZoomableImage = ({ uri }) => {
  const scale = useSharedValue(1)

  const pinchHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      scale.value = event.scale
    },
    onEnd: () => {
      scale.value = withSpring(1) // Reset zoom after release
    },
  })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <PinchGestureHandler onGestureEvent={pinchHandler}>
      <Animated.View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Animated.Image
          source={{ uri }}
          style={[
            {
              height: '90%',
              width: '90%',
              borderRadius: 10,
              resizeMode: 'contain',
            },
            animatedStyle,
          ]}
          resizeMode="contain"
        />
      </Animated.View>
    </PinchGestureHandler>
  )
}

export default ZoomableImage
