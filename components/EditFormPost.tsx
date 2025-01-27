import { auth, db } from '@/config'
import useGradeLevel from '@/hooks/useGradeLevel'
import useRole from '@/hooks/useRole'
import { Feather } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import { useRouter } from 'expo-router'
import { DocumentData, doc, updateDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import FileView from './FileView'

const EditFormPost = ({ data }: { data: DocumentData }) => {
  const router = useRouter()
  const { role } = useRole()
  const { years, courses } = useGradeLevel<string>()
  const [post, addPost] = useState('')
  const [year, setYear] = useState('')
  const [course, setCourse] = useState('')
  const currentUser = auth.currentUser
  const [isLoading, setLoading] = useState(false)
  const [parsedData, setParsedData] = useState<DocumentData | null>(null)
  useEffect(() => {
    if (data) {
      const parsedData = JSON.parse(data as any)
      setParsedData(parsedData)
    }
  }, [data])

  useEffect(() => {
    if (parsedData) {
      addPost(parsedData.post)
      setYear(parsedData.year)
      setCourse(parsedData.course)
    }
  }, [parsedData])

  const handleSubmit = async () => {
    setLoading(true) // Start loading before the process starts

    try {
      // Update the post in the Firestore
      await updateDoc(doc(db, 'posts', data.id), {
        createdAt: new Date().toISOString(),
        authorId: currentUser?.uid, // Store the UID of the author
        authorName: currentUser?.displayName || 'Anonymous', // Store the author's name
        authorAvatar: currentUser?.photoURL,
        post: post,
        year: year,
        course: course,
      })

      // Reset the state after the post has been successfully added
      addPost('')
      setLoading(false) // Stop loading after successful operation

      // Redirect to the posts page
      router.push('/user/posts')
    } catch (error) {
      console.error('Error updating post: ', error) // Log the error
      alert('Error while updating post. Please try again later.') // Show a more informative error alert
      setLoading(false) // Stop loading in case of error
    }
  }

  const handleClose = () => {
    addPost('')

    router.push('/user/posts')
  }
  console.log('parseData', parsedData?.post)

  return (
    <>
      <View className="w-full bg-white border-b border-b-slate-100 flex justify-start ">
        <TouchableOpacity onPress={handleClose} className="p-4">
          <Feather name="x" size={20} />
        </TouchableOpacity>
      </View>
      <View className="flex-1 bg-white">
        <View className="flex px-10 flex-row  items-center  p-4 gap-5">
          <View className="rounded-full border">
            {currentUser?.photoURL ? (
              <Image
                source={{ uri: currentUser?.photoURL }}
                style={{ width: 45, height: 45, borderRadius: 100 }}
              />
            ) : (
              <Feather name="user" size={24} color="black" />
            )}
          </View>
          <View className="flex flex-col items-start">
            <Text className="text-xs font-medium">
              {currentUser?.displayName}
            </Text>
            <TextInput
              className=" items-center border-none text-[10px] outline-none"
              editable
              multiline
              numberOfLines={4}
              placeholder="What's on your mind?"
              placeholderTextColor={'gray'}
              value={post}
              onChangeText={addPost}
            />
          </View>
        </View>

        <View className="px-10">
          {role === 'teacher' && (
            <View className="flex flex-row items-center justify-center gap-2 ">
              <View
                style={{ width: 150 }}
                className="border flex flex-row  h-12 border-gray-200 outline-none ring-0 rounded-2xl  "
              >
                <Picker
                  selectedValue={course}
                  onValueChange={(course) => setCourse(course)}
                  style={{
                    width: '100%',
                    height: '100%',
                    fontSize: 10, // Adjust the font size for the picker
                  }}
                >
                  <Picker.Item
                    label="Course"
                    value=""
                    style={{ fontSize: 10 }} // Adjust font size of this item
                  />
                  {courses.map((course: any) => (
                    <Picker.Item
                      style={{ fontSize: 10 }} // Adjust font size of this item
                      key={course.id}
                      label={course.name}
                      value={course.name}
                    />
                  ))}
                </Picker>
              </View>
              <View
                style={{ width: 150 }}
                className="border flex flex-row  h-12 border-gray-200 outline-none ring-0 rounded-2xl  "
              >
                <Picker
                  selectedValue={year}
                  onValueChange={(course) => setYear(course)}
                  style={{
                    width: '100%',
                    height: '100%',
                    fontSize: 10, // Adjust the font size for the picker
                  }}
                >
                  <Picker.Item
                    label="Level"
                    value=""
                    style={{ fontSize: 10 }} // Adjust font size of this item
                  />
                  {years.map((year: any) => (
                    <Picker.Item
                      style={{ fontSize: 10 }} // Adjust font size of this item
                      key={year}
                      label={year.name}
                      value={year.name}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          {/* footer */}
          <View className="flex flex-row mt-5  justify-between gap-5 items-center ">
            <TouchableOpacity
              className="bg-green-400 px-5 py-3 w-1/2 items-center  text-sm rounded-3xl"
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text className="text-white">Post</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-1 mt-10 bg-white items-center justify-center">
          {parsedData && parsedData?.file.url && (
            <FileView fileName={parsedData?.file.name} />
          )}
          {parsedData && (
            <View className="mt-5">
              <FlatList
                data={data.imageUrls}
                renderItem={({ item }) => (
                  <View className="mr-5">
                    <Image
                      source={{ uri: item }}
                      className="h-72 w-64 rounded-md shadow-lg"
                    />
                  </View>
                )}
                keyExtractor={(item) => item}
                horizontal
                showsHorizontalScrollIndicator={false} // Hides the scrollbar for cleaner look
                contentContainerStyle={{
                  paddingHorizontal: 10, // Adds padding at the beginning and end of the list
                }}
              />
            </View>
          )}
        </View>
      </View>
    </>
  )
}

export default EditFormPost
