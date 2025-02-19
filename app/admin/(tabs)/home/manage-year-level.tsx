import { db } from '@/config'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  onSnapshot,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native'

const ManageYearLevel = () => {
  const [year, setYear] = useState('')
  const [years, setYears] = useState<DocumentData[]>([])

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Confirmation',
      'Are you sure you want to delete this course?',
      [
        {
          text: 'Cancel',
          style: 'cancel', // Just dismisses the dialog
        },
        {
          text: 'Delete',
          style: 'destructive', // Highlights the delete action (iOS-specific)
          onPress: async () => {
            try {
              const courseDocRef = doc(db, 'years', id) // Reference to the document
              await deleteDoc(courseDocRef) // Deletes the document from Firestore
              console.log('Course deleted successfully')
            } catch (error) {
              console.error('Error deleting course:', error)
            }
          },
        },
      ],
    )
  }

  const handleSubmit = async () => {
    await addDoc(collection(db, 'years'), {
      createdAt: new Date().toISOString(),
      name: year,
    })
  }

  const collectionRef = collection(db, 'years')

  useEffect(() => {
    const unsubscribe = onSnapshot(collectionRef, (querySnapshot) => {
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setYears(postsData.sort((a, b) => a.name.localeCompare(b.name)))
    })

    return () => unsubscribe() // Cleanup the subscription on unmount
  }, [])

  return (
    <View style={{ flex: 1, padding: 10, backgroundColor: 'white' }}>
      <View className="flex flex-row gap-5 items-center justify-center my-10 ">
        <TextInput
          className="bg-slate-200 rounded-xl p-2  w-8/12"
          placeholder="Year Level"
          onChangeText={(text) => setYear(text)}
        />
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-green-300 p-2 rounded-xl px-10 items-center justify-center"
        >
          <Text>Add</Text>
        </TouchableOpacity>
      </View>
      {years.map((year) => (
        <View
          key={year.id}
          className="flex items-start flex-row justify-between mt-5"
        >
          <Text>{year.name}</Text>
          <View className="flex items-center flex-row gap-2">
            {/* <TouchableOpacity className="bg-green-300 p-2 rounded-xl">
              <Text>Reset</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              onPress={() => handleDelete(year.id)}
              className="bg-red-300 p-2 rounded-xl"
            >
              <Text>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  )
}

export default ManageYearLevel
