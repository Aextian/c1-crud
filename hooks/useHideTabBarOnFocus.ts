import { useFocusEffect, useNavigation } from '@react-navigation/native'
import React from 'react'
import { StyleSheet } from 'react-native'

const useHideTabBarOnFocus = () => {
  const navigation = useNavigation()

  useFocusEffect(
    React.useCallback(() => {
      // Hide the tab bar when the screen is focused
      navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } })

      return () => {
        // Show the tab bar again when the screen is unfocused
        navigation.getParent()?.setOptions({ tabBarStyle: styles.tabBar })
      }
    }, [navigation]),
  )
}

// Sample tab bar style
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

export default useHideTabBarOnFocus
