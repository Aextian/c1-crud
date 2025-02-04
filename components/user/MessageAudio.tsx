import useRecordingStore from '@/store/useRecordingStore'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

const MessageAudio = (props: any) => {
  const { playSound, stopSound, isPlaying, currentAudio } = useRecordingStore()

  const { currentMessage } = props
  // Check if the message contains a file

  const handlePress = () => {
    if (isPlaying && currentAudio === currentMessage.audio) {
      stopSound() // Stop the current audio
    } else {
      playSound(currentMessage.audio) // Play the new audio
    }
  }

  if (currentMessage.audio) {
    return (
      <TouchableOpacity style={styles.audioContainer} onPress={handlePress}>
        <Text style={styles.audioText}>
          <Text style={styles.audioText}>
            {isPlaying && currentAudio === currentMessage.audio
              ? '❚❚ Voice Message'
              : '▶ Voice Message'}
          </Text>
        </Text>
      </TouchableOpacity>
    )
  }
  return null
}

const styles = StyleSheet.create({
  audioContainer: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
  },
  audioText: {
    color: '#000',
  },
})

export default MessageAudio
