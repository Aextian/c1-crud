import React from 'react'
import { ActivityIndicator, Animated, Modal } from 'react-native'

const ModalLoadingScreen = ({
  isModalVisible,
}: {
  isModalVisible: boolean
}) => {
  return (
    <Modal animationType="slide" transparent={true} visible={isModalVisible}>
      <Animated.View
        style={{
          flex: 1,
          padding: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#673ab7" />
      </Animated.View>
    </Modal>
  )
}

export default ModalLoadingScreen
