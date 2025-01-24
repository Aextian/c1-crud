import Daily, { DailyMediaView } from '@daily-co/react-native-daily-js'
import React, { useEffect, useRef } from 'react'
import { Button, StyleSheet, View } from 'react-native'

const VideoCall = () => {
  const callObject = useRef(null)

  useEffect(() => {
    // Initialize the call object
    callObject.current = Daily.createCallObject()

    // Join the Daily room
    callObject.current.join({ url: 'https://weconn.daily.co/test' })

    // Cleanup on component unmount
    return () => {
      callObject.current.leave()
    }
  }, [])

  return (
    <View style={styles.container}>
      <DailyMediaView callObject={callObject.current} style={styles.video} />
      <Button title="Leave Call" onPress={() => callObject.current.leave()} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
})

export default VideoCall
