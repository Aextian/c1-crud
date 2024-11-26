import { auth } from '@/config'
import useGc from '@/hooks/useGc'
import React, { useEffect, useState } from 'react'
import { Button, StyleSheet, Text, TextInput, View } from 'react-native'
import { RTCView } from 'react-native-webrtc'

const WebRTCView = () => {
  const [roomId, setRoomId] = useState('')
  const { createCall, joinCall, remoteStreams, localStream, startLocalStream } =
    useGc()
  useEffect(() => {
    startLocalStream()
  }, [])

  const currentUser = auth?.currentUser

  // Create a new room
  const handleCreateRoom = async () => {
    await createCall(roomId)
    console.log(`Room created with ID: ${roomId}`)
  }
  // Join an existing room
  const handleJoinRoom = async () => {
    if (roomId && localStream) {
      await joinCall(roomId)
      console.log('click')
    } else {
      console.log('Room ID or local stream is missing')
    }
  }

  return (
    <View style={styles.container}>
      {/* Room Controls */}
      <View style={styles.controls}>
        <Button title="Create Room" onPress={handleCreateRoom} />
        <TextInput
          placeholder="Room ID"
          value={roomId}
          onChangeText={setRoomId}
        />
        <Button title="Join Room" onPress={handleJoinRoom} />
      </View>

      {localStream && (
        <RTCView
          streamURL={localStream.toURL()}
          style={styles.localStream}
          mirror={true} // Mirror local stream
          objectFit="cover"
        />
      )}
      {/* Remote Streams */}
      {Object.values(remoteStreams).map((stream, index) => (
        <>
          <View>
            <Text className="text-lg">{stream.toURL()}</Text>
          </View>

          <RTCView
            key={index}
            streamURL={stream.toURL()}
            style={styles.remoteStream}
          />
        </>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  localStream: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  remoteStream: {
    width: '100%',
    height: '40%',
    marginTop: 10,
  },
  controls: {
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
})

export default WebRTCView
