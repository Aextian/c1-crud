import { Feather } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

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
    profile: (props: any) => (
      <Feather name="message-circle" size={24} color={props.color} {...props} />
    ),
    settings: (props: any) => (
      <Feather name="settings" size={24} color={props.color} {...props} />
    ),
  }
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
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

        console.log(route.name)

        return (
          <TouchableOpacity
            key={route.name}
            style={styles.nabBarItem}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
          >
            {/* {icons[route.name as keyof typeof icons]({
              color: isFocused ? '#673ab7' : '#222',
            })} */}

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

            {/* <Text>{label}</Text> */}
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    // position: 'absolute',
    // position: 'absolute',
    bottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    borderCurve: 'continuous',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
  },
  nabBarItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default TabBar
