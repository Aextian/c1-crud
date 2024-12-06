import { storage } from '@/config'
import { Audio } from 'expo-av'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { create } from 'zustand'

type RecordingState = {
  recording: Audio.Recording | undefined
  sound: Audio.Sound | undefined
  recordingUri: string | null
  permissionResponse: Audio.PermissionResponse | null
  isPlaying: boolean
  currentAudio: null

  startRecording: () => Promise<void>
  stopRecording: () => Promise<void>
  playSound: (uri: string) => Promise<void>
  stopSound: () => Promise<void>
  uploadRecordingToFirebase: (uri: string) => Promise<string | null>
  setRecordingUri: (uri: string | null) => void
}

const useRecordingStore = create<RecordingState>((set, get) => ({
  recording: undefined,
  sound: undefined,
  recordingUri: null,
  permissionResponse: null,
  isPlaying: false, // New state to track playback status
  currentAudio: null,

  startRecording: async () => {
    try {
      const permissionResponse = await Audio.requestPermissionsAsync()
      set({ permissionResponse })

      if (permissionResponse.status !== 'granted') {
        console.log('Recording permissions not granted.')
        return
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      )
      set({ recording })
      console.log('Recording started.')
    } catch (err) {
      console.error('Failed to start recording:', err)
    }
  },

  stopRecording: async () => {
    const { recording, uploadRecordingToFirebase, setRecordingUri } = get()
    if (!recording) return

    try {
      console.log('Stopping recording...')
      const uri = recording.getURI()

      await recording.stopAndUnloadAsync()
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      })

      set({ recording: undefined }) // Reset recording state

      if (uri) {
        const downloadURL = await uploadRecordingToFirebase(uri)
        setRecordingUri(downloadURL)
      }
    } catch (err) {
      console.error('Failed to stop recording:', err)
    }
  },

  uploadRecordingToFirebase: async (uri: string) => {
    try {
      console.log('Uploading recording to Firebase...')
      const response = await fetch(uri)
      const blob = await response.blob()

      const fileName = `recordings/${Date.now()}.m4a`
      const storageRef = ref(storage, fileName)

      await uploadBytes(storageRef, blob)
      console.log('Recording uploaded successfully.')

      const downloadURL = await getDownloadURL(storageRef)
      console.log('Download URL:', downloadURL)

      return downloadURL
    } catch (err) {
      console.error('Failed to upload recording:', err)
      return null
    }
  },

  playSound: async (uri: string) => {
    const { sound: currentSound } = get()

    if (currentSound) {
      await currentSound.unloadAsync()
    }

    try {
      console.log('Loading sound...', uri)
      const { sound } = await Audio.Sound.createAsync({ uri })
      set({ sound: sound, currentAudio: uri, isPlaying: true })
      console.log('Playing sound...')
      await sound.playAsync()
    } catch (err) {
      console.error('Failed to play sound:', err)
    }
  },
  stopSound: async () => {
    const { sound } = get()

    if (sound) {
      try {
        console.log('Stopping sound...')
        await sound?.stopAsync() // Stop the sound
        set({ isPlaying: false })
      } catch (err) {
        console.error('Failed to stop sound:', err)
      }
    } else {
      console.log('No sound is currently playing.')
    }
  },

  setRecordingUri: (uri: string | null) => set({ recordingUri: uri }),
}))

export default useRecordingStore
