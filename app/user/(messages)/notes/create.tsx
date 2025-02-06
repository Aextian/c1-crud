import NoteForm from '@/components/shared/NoteForm'
import React from 'react'
import { ImageBackground, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const CreateNote = () => {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#fff' }}
      className="flex flex-col gap-5 px-5 "
    >
      <ImageBackground
        source={require('../../../../assets/images/bgsvg.png')}
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: 0.3,
          },
        ]}
      />
      <NoteForm />
    </SafeAreaView>
  )
}

export default CreateNote
