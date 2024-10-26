import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Button, Modal, StyleSheet, Text, View } from 'react-native'
import Animated, { SlideInUp } from 'react-native-reanimated'

const CallScreen = ({ callId }: any) => {
  const [isModalVisible, setIsModalVisible] = useState(true)

  const router = useRouter()

  // Simulate receiving a call (for demo purposes)
  const onIncomingCall = () => {
    setIsModalVisible(true)
  }

  // Function to handle the answer action
  const handleAnswer = () => {
    setIsModalVisible(false)
    router.push({
      pathname: '/student/(tabs)/messages/answer-calls/answer-call-screen',
      params: {
        callId: callId,
      },
    })
    console.log('Call Answered')
  }

  // Function to handle the decline action
  const handleDecline = () => {
    setIsModalVisible(false)
    // Add your code to decline the call here
    console.log('Call Declined')
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={() => setIsModalVisible(false)}
    >
      <Animated.View
        entering={SlideInUp}
        style={{
          padding: 20,
          alignItems: 'center',
          justifyContent: 'flex-start',
          backgroundColor: 'transparent',
        }}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Incoming Call...</Text>
          <View style={styles.buttonContainer}>
            <Button title="Answer" onPress={handleAnswer} color="#4CAF50" />
            <Button title="Decline" onPress={handleDecline} color="#F44336" />
          </View>
        </View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Adjusted opacity value
    borderRadius: 10,
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
})

export default CallScreen
