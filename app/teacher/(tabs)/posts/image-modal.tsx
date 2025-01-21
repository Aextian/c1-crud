import { Link, useLocalSearchParams } from 'expo-router'
import { Image, Pressable, StyleSheet, View } from 'react-native'
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated'

export default function Modal() {
  const { image } = useLocalSearchParams<any>()

  return (
    <Animated.View
      entering={FadeIn}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000040',
      }}
    >
      {/* Dismiss modal when pressing outside */}
      <Link href={'/teacher/(tabs)/posts'} asChild>
        <Pressable style={StyleSheet.absoluteFill} />
      </Link>
      <Animated.View
        entering={ZoomIn}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 10,
        }}
      >
        <View
          style={{ flex: 1 }}
          className="flex justify-center flex-col items-center h-16 w-24 "
        >
          {image && (
            <Image
              source={{
                uri: image,
              }}
              style={{
                height: 200,
                width: 300,
                borderRadius: 10,
                resizeMode: 'cover',
                // backgroundColor: '#e0e0e0', // Placeholder background
              }}
            />
          )}
        </View>
      </Animated.View>
    </Animated.View>
  )
}
