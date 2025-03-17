import CreateRoom from '@/components/shared/CreateRoom'
import JoinMeeting from '@/components/shared/JoinMeeting'
import MeetingType from '@/components/shared/MeetingType'
import OptionsMeeting from '@/components/shared/OptionsMeeting'
import { auth } from '@/config'
import Daily, {
  DailyCall,
  DailyEvent,
  DailyMediaView,
} from '@daily-co/react-native-daily-js'
import { Feather } from '@expo/vector-icons'
import axios from 'axios'
import { Stack } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
  FlatList,
  LogBox,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

// Ignore warnings
LogBox.ignoreLogs(['new NativeEventEmitter'])
LogBox.ignoreAllLogs()

const meeting = () => {
  const callObject = useRef<DailyCall | null>(null)
  const [participants, setParticipants] = useState<any>({})
  const [joined, setJoined] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraEnabled, setIsCameraEnabled] = useState(true)
  const [usingFrontCamera, setUsingFrontCamera] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState('')
  const [isParticipantMuted, setParticipantMuted] = useState<{
    [key: string]: boolean
  }>({})

  const [roomUrl, setRoomUrl] = useState<string | null>(null)
  const [room, setRoom] = useState<string>('')
  const currentUser = auth.currentUser

  const DAILY_API_KEY =
    '850dd356d41c9f5feae7e21be16e5c4fabcbb3cd2902d2e235e32eb2e6781d4e'

  const createRoom = async () => {
    const room = Math.random().toString(36).substring(7) //generate random text
    try {
      const response = await axios.post(
        'https://api.daily.co/v1/rooms',
        {
          name: room, // A unique room name
          properties: {
            enable_chat: true,
            enable_screenshare: true,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${DAILY_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      )
      setRoomUrl(response.data.url) // Save the room URL
      setRoom(room)
    } catch (error) {
      console.error('Error creating room:', error)
      alert('Failed to create a meeting room')
    }
  }

  const events: DailyEvent[] = [
    'participant-joined',
    'participant-updated',
    'participant-left',
  ]

  useEffect(() => {
    if (!callObject.current) {
      callObject.current = Daily.createCallObject()
    }

    const handleParticipantEvent = () => {
      const updatedParticipants = { ...callObject.current?.participants() }
      setParticipants(updatedParticipants)
    }

    events.forEach((event) => {
      callObject.current?.on(event, handleParticipantEvent)
    })

    callObject.current.startCamera()

    return () => {
      events.forEach((event) => {
        callObject.current?.off(event, handleParticipantEvent)
      })
      if (callObject.current) {
        callObject.current.leave() // Leave the call
        callObject.current.destroy() // Destroy the instance
        callObject.current = null // Reset the reference
      }
    }
  }, [])

  const joinCall = async () => {
    // Ensure a room ID is provided
    setIsLoading(true)
    if (!room || room.trim() === '') {
      alert('Please enter a valid room ID.')
      setIsLoading(false)
      return
    }

    try {
      // Optional: Show a loading indicator

      // Attempt to join the call
      await callObject.current?.join({
        url: `https://weconn.daily.co/${room}`,
        userName: currentUser?.displayName || '', // Custom username
      })

      // Update state after successfully joining
      setJoined(true)
      setIsLoading(false)
    } catch (error) {
      setJoined(false)

      alert(
        "The meeting you're trying to join does not exist. Please check the room ID.",
      )
      console.error('Join call error:', error)
    } finally {
      // Hide the loading indicator
      setIsLoading(false)
    }
  }

  const leaveCall = () => {
    if (callObject.current) {
      callObject.current.leave() // Disconnect from the call
      callObject.current.destroy() // Destroy the DailyIframe instance
      callObject.current = null // Reset the reference
    }
    setJoined(false) // Reset state
    setParticipants({})
    setRoomUrl(null)
    setRoom('')
    setType('')
  }

  const toggleMute = () => {
    const shouldMute = !isMuted
    callObject.current?.setLocalAudio(shouldMute ? false : true)
    setIsMuted(shouldMute)
  }

  const toggleCamera = () => {
    const shouldEnableCamera = !isCameraEnabled
    callObject.current?.setLocalVideo(shouldEnableCamera)
    setIsCameraEnabled(shouldEnableCamera)
  }

  const switchCamera = async () => {
    if (callObject.current) {
      try {
        // Enumerate devices to get a list of all input devices (video and audio)
        const response = await callObject.current.enumerateDevices()

        // Access the devices array
        const devices = response.devices

        // Filter to get only video input devices (cameras)
        const videoDevices = devices.filter(
          (device) => device.kind === 'videoinput',
        )

        // Check if there are any video devices
        if (videoDevices.length === 0) {
          throw new Error('No video devices found')
        }

        // Find the front and back cameras
        // Find the front and back cameras based on the device label or other identifiers
        const frontCamera = videoDevices.find((device) =>
          device.label.toLowerCase().includes('front'),
        )
        const backCamera = videoDevices.find(
          (device) =>
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('back'),
        )

        // Determine the new camera to switch to
        const newCamera = usingFrontCamera ? backCamera : frontCamera

        if (newCamera) {
          // Switch the camera by deviceId
          await callObject.current.setCamera(newCamera.deviceId)

          // Toggle the state for front/back camera
          setUsingFrontCamera(!usingFrontCamera)
          console.log('Switched camera to:', newCamera.label)
        } else {
          console.error('Could not find a valid camera to switch to')
        }
      } catch (error) {
        console.error('Error switching camera:', error)
      }
    }
  }

  const renderParticipant = ({ item: userId }) => {
    const participant = participants[userId]
    const videoTrack = participant.tracks?.video?.persistentTrack

    if (!videoTrack || videoTrack === 'undefined') return null

    const toggleMute = () => {
      if (!participant.local) {
        const newMutedState = !isParticipantMuted[userId]
        callObject.current?.updateParticipant(userId, {
          setAudio: !newMutedState, // Toggle mute state
        })

        setParticipantMuted((prev) => ({
          ...prev,
          [userId]: newMutedState, // Update specific user mute state
        }))
      }
    }

    return (
      <View style={styles.videoTile}>
        <DailyMediaView
          key={userId}
          videoTrack={videoTrack}
          audioTrack={participant.tracks?.audio?.persistentTrack}
          style={{ width: '100%', height: '100%' }}
          zOrder={participant.local ? 1 : 0}
          objectFit="cover"
        />
        <View className="absolute bottom-5 w-full bg-black/30 rounded-lg p-2">
          <Text className="text-white text-center">
            {participant.local ? 'You' : participant.user_name || 'Unknown'}
          </Text>
        </View>
        {!participant.local && (
          <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
            {isParticipantMuted[userId] ? (
              <Feather name="mic-off" color="white" size={20} />
            ) : (
              <Feather name="mic" color="white" size={20} />
            )}
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ headerShown: !joined, headerTitle: 'Meeting' }}
      />

      {!joined ? (
        <>
          {type === '' && <MeetingType setType={setType} />}
          {type === 'create' ? (
            <CreateRoom createRoom={createRoom} room={room} setRoom={setRoom} />
          ) : (
            type === 'join' && (
              <JoinMeeting
                setRoom={setRoom}
                isLoading={isLoading}
                joinCall={joinCall}
              />
            )
          )}
        </>
      ) : (
        <View style={styles.callContainer}>
          <FlatList
            data={Object.keys(participants)}
            keyExtractor={(userId) => userId}
            renderItem={renderParticipant}
            horizontal={false} // Set to true if you want horizontal scrolling
            numColumns={2} // Adjust columns as needed
          />
          <OptionsMeeting
            toggleCamera={toggleCamera}
            switchCamera={switchCamera}
            leaveCall={leaveCall}
            toggleMute={toggleMute}
            isMuted={isMuted}
            isCameraEnabled={isCameraEnabled}
            usingFrontCamera={usingFrontCamera}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  muteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    borderRadius: 20,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  callContainer: {
    flex: 1,
    marginTop: 20,
    width: '100%',
  },
  videoGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  videoTile: {
    position: 'relative',
    width: '45%',
    height: 200,
    // backgroundColor: 'red',
    borderRadius: 20,
    margin: 5,
    overflow: 'hidden',
  },
  controls: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#1f1f1f',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: '#444',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  controlText: {
    color: '#fff',
    fontSize: 16,
  },
  usernameOverlay: {
    position: 'absolute', // Overlay on top of the video tile
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional: makes the background slightly dark
    padding: 10,
    borderRadius: 5,
  },
  usernameText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default meeting
