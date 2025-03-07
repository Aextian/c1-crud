import useRecordingStore from '@/store/useRecordingStore'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import AudioMessage from '../shared/AudioMessage'

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
          <Text
            style={styles.audioText}
            className="items-center justify-center"
          >
            <AudioMessage isPlaying={isPlaying} />
            {/* {isPlaying ? (
              <>
                <Feather name="volume-2" size={20} color="black" /> Voice
                Message
              </>
            ) : (
              <>
                <Feather name="volume-x" size={20} color="black" /> Voice
                Message
              </>
            )} */}
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 10,
    borderRadius: 5,
  },
  audioText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'semibold',
  },
})

export default MessageAudio
