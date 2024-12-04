import useRecording from '@/hooks/useRecording'
import { Button, StyleSheet, View } from 'react-native'

export default function App() {
  const { startRecording, stopRecording, recording } = useRecording()
  return (
    <View style={styles.container}>
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? stopRecording : startRecording}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 10,
  },
})
