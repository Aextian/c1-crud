import NoteForm from '@/components/shared/NoteForm'
import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
import React from 'react'
import { SafeAreaView } from 'react-native'

const addNote = () => {
  useHideTabBarOnFocus()
  return (
    <SafeAreaView className="flex flex-col gap-5 px-5 mt-5">
      <NoteForm />
    </SafeAreaView>
  )
}

export default addNote
