import { storage } from '@/config'
import { Audio } from 'expo-av'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { useEffect, useState } from 'react'

const useRecording = () => {
  const [recording, setRecording] = useState<Audio.Recording | undefined>()
  const [sound, setSound] = useState<Audio.Sound | undefined>(undefined)
  const [recordingUri, setRecordingUri] = useState<string | null>(null)

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

    setRecording(undefined) // Reset the recording state after stopping
    if (uri) {
      const downloadURL = await uploadRecordingToFirebase(uri)
      setRecordingUri(downloadURL)
    }
  }

  async function uploadRecordingToFirebase(uri: string) {
    try {
      console.log('Uploading recording to Firebase...')
      const response = await fetch(uri)
      const blob = await response.blob() // Convert URI to Blob

      const fileName = `recordings/${Date.now()}.m4a` // Create a unique filename
      const storageRef = ref(storage, fileName)

      // Upload the file to Firebase Storage
      await uploadBytes(storageRef, blob)
      console.log('Recording uploaded successfully')

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef)
      console.log('Download URL:', downloadURL)

      return downloadURL // Return the URL of the uploaded file
    } catch (error) {
      console.error('Error uploading recording to Firebase:', error)
      return null
    }
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
    setRecordingUri,
    recordingUri,
    playSound,
    recording,
  }
}

export default useRecording
