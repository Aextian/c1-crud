import { Feather } from '@expo/vector-icons'
import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'

const AnimatedIcon = ({ isPlaying }: { isPlaying: boolean }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    } else {
      scaleAnim.setValue(1)
    }
  }, [isPlaying])

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Feather name={'volume-2'} size={16} color="black" />
    </Animated.View>
  )
}

const AudioMessage = ({ isPlaying }: { isPlaying: boolean }) => {
  return (
    <View className="flex flex-row items-center justify-center gap-2">
      <AnimatedIcon isPlaying={isPlaying} />
      <Text style={styles.audioText}>Voice Message</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  audioText: {
    fontSize: 12,
    fontWeight: 'semibold',
  },
})

export default AudioMessage
