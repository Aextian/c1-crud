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

const ManageSection = () => {
  const [section, setSection] = useState('')
  const [sections, setSections] = useState<DocumentData[]>([])

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Confirmation',
      'Are you sure you want to delete this section?',
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
              const sectionDocRef = doc(db, 'sections', id) // Reference to the document
              await deleteDoc(sectionDocRef) // Deletes the document from Firestore
              console.log('Section deleted successfully')
            } catch (error) {
              console.error('Error deleting section:', error)
            }
          },
        },
      ],
    )
  }

  const handleSubmit = async () => {
    await addDoc(collection(db, 'sections'), {
      createdAt: new Date().toISOString(),
      name: section,
    })
    setSection('')
  }

  useEffect(() => {
    const collectionRef = collection(db, 'sections')
    const unsubscribe = onSnapshot(collectionRef, (querySnapshot) => {
      const sectionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setSections(sectionsData.sort((a, b) => a.name.localeCompare(b.name)))
    })

    return () => unsubscribe() // Cleanup the subscription on unmount
  }, [])

  return (
    <View style={{ flex: 1, padding: 10, backgroundColor: '#fff' }}>
      <View className="flex flex-row gap-5 items-center justify-center my-10 ">
        <TextInput
          className="bg-slate-200 rounded-xl p-2  w-8/12"
          placeholder="Section Name"
          value={section}
          onChangeText={(text) => setSection(text)}
        />
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-green-300 py-3 px-10 rounded-xl  items-center justify-center"
        >
          <Text>Add</Text>
        </TouchableOpacity>
      </View>
      {sections.map((section, key) => (
        <View
          key={key}
          className="flex items-start flex-row justify-between mt-5"
        >
          <Text>{section.name}</Text>
          <View className="flex items-center flex-row gap-2">
            <TouchableOpacity
              onPress={() => handleDelete(section.id)}
              className="bg-red-300 p-2 rounded-xl py-2 px-16"
            >
              <Text>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  )
}

export default ManageSection
