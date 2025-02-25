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

const ManageCourse = () => {
  const [course, setCourse] = useState('')
  const [courses, setCourses] = useState<DocumentData[]>([])

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
    setCourse('')
  }

  useEffect(() => {
    const collectionRef = collection(db, 'courses')
    const unsubscribe = onSnapshot(collectionRef, (querySnapshot) => {
      const coursesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setCourses(coursesData.sort((a, b) => a.name.localeCompare(b.name)))
    })

    return () => unsubscribe() // Cleanup the subscription on unmount
  }, [])

  return (
    <View style={{ flex: 1, padding: 10, backgroundColor: '#fff' }}>
      <View className="flex flex-row gap-5 items-center justify-center my-10 ">
        <TextInput
          className="bg-slate-200 rounded-xl p-2  w-8/12"
          placeholder="Course Name"
          value={course}
          onChangeText={(text) => setCourse(text)}
        />
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-green-300 py-3 px-10 rounded-xl  items-center justify-center"
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
            <TouchableOpacity
              onPress={() => handleDelete(course.id)}
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

export default ManageCourse
