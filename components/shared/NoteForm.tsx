import { auth, db } from '@/config'
import { useRouter } from 'expo-router'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'

const NoteForm = () => {
  const currentUser = auth.currentUser
  const [note, setNote] = useState('')
  const [isLoading, setLoading] = useState(false)
  const router = useRouter()

  const submitNote = async () => {
    setLoading(true)
    try {
      // Reference to the subcollection inside the user document
      // Reference to the user's document
      const userDocRef = doc(db, 'users', String(currentUser?.uid))

      // Update the user's document with the new note
      await updateDoc(userDocRef, {
        note: note, // The new note
      })

      setLoading(false)
      router.push('/teacher/messages')
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  useEffect(() => {
    const getNote = async () => {
      try {
        const noteRef = doc(db, 'users', String(currentUser?.uid))
        const noteSnapshot = await getDoc(noteRef)
        if (noteSnapshot.exists()) {
          setNote(noteSnapshot.data().note)
        }
      } catch (error) {
        console.log(error)
      }
    }

    getNote()
  }, [currentUser])

  return (
    <View className="flex flex-col gap-2">
      <View className="w-full p-2 h-36 shadow shadow-black bg-white rounded-xl">
        <TextInput
          value={note}
          onChangeText={(text) => setNote(text)}
          multiline
          numberOfLines={4}
          className="p-2"
          placeholder="Note"
        />
      </View>
      <TouchableOpacity
        disabled={isLoading}
        className="bg-green-400 font-bold t p-2 items-center rounded-xl"
      >
        <Text className="text-white text-2xl" onPress={submitNote}>
          {isLoading ? 'Submiting...' : 'Submit'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default NoteForm
