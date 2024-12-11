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

const manageCourses = () => {
  const [course, setCouse] = useState('')
  const [courses, setcourses] = useState<DocumentData>([])

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
              const courseDocRef = doc(db, 'courses', id) // Reference to the document
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
    await addDoc(collection(db, 'courses'), {
      createdAt: new Date().toISOString(),
      name: course,
    })
  }

  const collectionRef = collection(db, 'courses')

  useEffect(() => {
    const unsubscribe = onSnapshot(collectionRef, (querySnapshot) => {
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setcourses(postsData)
    })

    return () => unsubscribe() // Cleanup the subscription on unmount
  }, [])

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <View className="flex flex-row gap-5 items-center justify-center my-10 ">
        <TextInput
          className="bg-slate-200 rounded-xl p-2  w-8/12"
          placeholder="Course Name"
          onChangeText={(text) => setCouse(text)}
        />
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-green-300 p-2 rounded-xl px-10 items-center justify-center"
        >
          <Text>Add</Text>
        </TouchableOpacity>
      </View>
      {courses.map((course, key) => (
        <View
          key={key}
          className="flex items-start flex-row justify-between mt-5"
        >
          <Text>{course.name}</Text>
          <View className="flex items-center flex-row gap-2">
            <TouchableOpacity className="bg-green-300 p-2 rounded-xl">
              <Text>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(course.id)}
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

export default manageCourses
