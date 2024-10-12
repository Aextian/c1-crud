import { FontAwesome } from '@expo/vector-icons'
import { useFocusEffect, useNavigation } from 'expo-router'
import React from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated'

const comments = () => {
  const navigation = useNavigation()

  useFocusEffect(
    React.useCallback(() => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } })
      return () => {
        // Show the tab bar when leaving this screen
        navigation.getParent()?.setOptions({ tabBarStyle: styles.tabBar })
      }
    }, [navigation]),
  )

  return (
    <Animated.View entering={FadeIn} style={{ flex: 1 }}>
      <Animated.View entering={SlideInDown} style={{ flex: 1 }}>
        <View
          className="px-10 rounded-lg"
          style={{ flex: 1, marginTop: 20, backgroundColor: 'white' }}
        >
          <View className="flex flex-row gap-5 mt-10">
            <View className="rounded-full h-12 w-12 bg-black"></View>
            <View className="justify-center">
              <Text className="font-bold text-xs">Kimjhan</Text>
              <Text className="text-gray-500 pr-12" numberOfLines={1}>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa,
                soluta? Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Ipsa, soluta? Lorem ipsum dolor sit amet consectetur adipisicing
                elit. Ipsa, soluta?
              </Text>
            </View>
          </View>
          <View className="flex flex-row gap-5 mt-10">
            <View className="rounded-full h-12 w-12 bg-black"></View>
            <View className="justify-center">
              <Text className="font-bold text-xs">Kimjhan</Text>
              <Text className="text-gray-500 pr-12" numberOfLines={1}>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa,
                soluta? Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Ipsa, soluta? Lorem ipsum dolor sit amet consectetur adipisicing
                elit. Ipsa, soluta?
              </Text>
            </View>
          </View>
        </View>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <View className=" flex-row gap-5 justify-between px-10 bg-white ">
            <TextInput
              style={{
                height: 40,
                backgroundColor: 'white',
                borderRadius: 10,
              }}
              placeholderTextColor={'#999'}
              placeholder="Write a message..."
              autoFocus
            />
            <TouchableOpacity>
              <FontAwesome name="send" size={24} color="#555" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute', // Make it absolute to position it correctly
    bottom: 10, // Position from the bottom
    left: 20, // Add left margin
    right: 20, // Add right margin
    justifyContent: 'space-between', // Space items evenly
    alignItems: 'center', // Center items vertically
    backgroundColor: '#fff', // Background color
    borderRadius: 25, // Rounded corners
    shadowColor: 'black', // Shadow color
    shadowOffset: { width: 0, height: 10 }, // Shadow offset
    shadowRadius: 10, // Shadow blur
    shadowOpacity: 0.1, // Shadow opacity
    elevation: 5, // Android shadow elevation
  },
})

export default comments
