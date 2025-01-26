import CreateRoom from '@/components/shared/CreateRoom'
import JoinMeeting from '@/components/shared/JoinMeeting'
import MeetingType from '@/components/shared/MeetingType'
import OptionsMeeting from '@/components/shared/OptionsMeeting'
import { auth } from '@/config'
import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
import Daily, {
  DailyCall,
  DailyEvent,
  DailyMediaView,
} from '@daily-co/react-native-daily-js'
import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { LogBox, StyleSheet, Text, View } from 'react-native'

// Ignore warnings
LogBox.ignoreLogs(['new NativeEventEmitter'])
LogBox.ignoreAllLogs()

const meeting = () => {
  useHideTabBarOnFocus()

  const callObject = useRef<DailyCall | null>(null)
  const [participants, setParticipants] = useState<any>({})
  const [joined, setJoined] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraEnabled, setIsCameraEnabled] = useState(true)
  const [usingFrontCamera, setUsingFrontCamera] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [type, setType] = useState('')

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
    if (!room || room.trim() === '') {
      alert('Please enter a valid room ID.')
      return
    }

    try {
      // Optional: Show a loading indicator
      setIsLoading(true)

      // Attempt to join the call
      await callObject.current?.join({
        url: `https://weconn.daily.co/${room}`,
        userName: currentUser?.displayName || '', // Custom username
      })

      // Update state after successfully joining
      setJoined(true)
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

        // Log devices to understand the structure
        console.log('Devices:', response)

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

  return (
    <View style={styles.container}>
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
          <View style={styles.videoGrid}>
            {Object.keys(participants).map((userId) => {
              const participant = participants[userId]
              const videoTrack = participant.tracks?.video?.persistentTrack
              return (
                <>
                  {videoTrack && videoTrack !== 'undefined' ? (
                    <DailyMediaView
                      key={userId}
                      videoTrack={videoTrack}
                      audioTrack={participant.tracks?.audio?.persistentTrack}
                      style={styles.videoTile}
                      zOrder={participant.local ? 1 : 0}
                    />
                  ) : (
                    <View style={styles.usernameOverlay}>
                      <Text>{participant.user_name} NO Video</Text>
                    </View>
                  )}
                </>
              )
            })}
          </View>
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
    width: '45%',
    height: 200,
    backgroundColor: '#333',
    borderRadius: 10,
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
