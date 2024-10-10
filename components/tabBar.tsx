import { Feather } from '@expo/vector-icons'
import { usePathname } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Keyboard, StyleSheet, TouchableOpacity, View } from 'react-native'

interface IProps {
  state: any
  descriptors: any
  navigation: any
}

const TabBar = ({ state, descriptors, navigation }: IProps) => {
  const icons = {
    posts: (props: any) => (
      <Feather name="home" size={24} color={props.color} {...props} />
    ),
    messages: (props: any) => (
      <Feather name="message-circle" size={24} color={props.color} {...props} />
    ),
    settings: (props: any) => (
      <Feather name="settings" size={24} color={props.color} {...props} />
    ),
  }

  // console.log(state.routes[0].state.routeNames[1])

  const pathname = usePathname()

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true)
    })
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false)
    })

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  // Check if the current screen should hide the tab bar
  const shouldHideTabBar =
    descriptors[state.routes[state.index].key]?.options.tabBarHideOnKeyboard

  return (
    <View
      style={[
        styles.tabBar,
        descriptors[state.routes[state.index].key]?.options?.tabBarStyle,
        isKeyboardVisible && shouldHideTabBar ? { display: 'none' } : {},
      ]}
    >
      {/* Apply tabBarStyle here */}
      {state.routes.map((route: any, index: any) => {
        const { options } = descriptors[route.key]

        // console.log(route.name)

        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name

        const isFocused = state.index === index

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          })

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params)
          }
        }

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          })
        }

        return (
          <TouchableOpacity
            key={route.name}
            style={styles.navBarItem}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
          >
            {icons[route.name as keyof typeof icons] ? (
              icons[route.name as keyof typeof icons]({
                color: isFocused ? '#673ab7' : '#222',
              })
            ) : (
              <Feather
                name="alert-circle"
                size={24}
                color={isFocused ? '#673ab7' : '#222'}
              />
            )}
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    bottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
  },
  navBarItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default TabBar
