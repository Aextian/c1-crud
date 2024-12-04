import { Audio } from 'expo-av'
import { useEffect, useState } from 'react'

const useRecording = () => {
  const [recording, setRecording] = useState<Audio.Recording | undefined>()
  const [sound, setSound] = useState<Audio.Sound | undefined>(undefined)

  const [permissionResponse, requestPermission] = Audio.usePermissions()

  async function startRecording() {
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting permission..')
        await requestPermission()
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      console.log('Starting recording..')
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      )
      setRecording(recording)
      console.log('Recording started')
    } catch (err) {
      console.error('Failed to start recording', err)
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..')
    const uri = recording?.getURI()

    if (recording) {
      await recording.stopAndUnloadAsync()
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    })

    console.log('Recording stopped and stored at', uri)
    setRecording(undefined) // Reset the recording state after stopping
    return uri // You may want to return the URI of the recording
  }

  async function playSound(uri: string) {
    console.log('Loading Sound')

    const { sound } = await Audio.Sound.createAsync(
      { uri }, // Use the URI of the file you want to play
    )
    setSound(sound)

    console.log('Playing Sound')
    await sound.playAsync()
  }

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound')
          sound.unloadAsync()
        }
      : undefined
  }, [sound])

  return {
    startRecording,
    stopRecording,
    playSound,
    recording,
  }
}

export default useRecording
