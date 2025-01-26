import { db } from '@/config'
import useAuth from '@/hooks/useAuth'
import useGradeLevel from '@/hooks/useGradeLevel'
import useImageUploads from '@/hooks/useImageUploads'
import useRole from '@/hooks/useRole'
import { Feather } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import { useRouter } from 'expo-router'
import { addDoc, collection } from 'firebase/firestore'
import React, { useState } from 'react'
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native'

const PostsForm = () => {
  const router = useRouter()
  const { role } = useRole()

  const { years, courses } = useGradeLevel<string>()

  // const [imageUrl, setImageUrl] = useState('')
  const [post, addPost] = useState('')
  const [year, setYear] = useState('')
  const [course, setCourse] = useState('')
  const { currentUser, loading } = useAuth()
  const { image, pickImage, uploadImage, clearImage, takeImage } =
    useImageUploads() //hooks to handle image

  const handleSubmit = async () => {
    try {
      const imageUrl = await uploadImage()

      await addDoc(collection(db, 'posts'), {
        createdAt: new Date().toISOString(),
        authorId: currentUser?.uid, // Store the UID of the author
        authorName: currentUser?.displayName || 'Anonymous', // Store the author's name
        authorAvatar: currentUser?.photoURL,
        post: post,
        likes: [],
        likesCount: 0,
        dislikes: [],
        dislikesCount: 0,
        commentCount: 0,
        status: false,
        imageUrl: imageUrl,
        year: year,
        course: course,
      })

      addPost('')
      clearImage()
      router.push('/user/posts')
    } catch (error) {
      console.error('Error adding post: ', error)
      alert('Post added error')
    }
  }

  const handleClose = () => {
    addPost('')
    clearImage()
    router.push('/user/posts')
  }

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
            <View className="flex flex-row  gap-10 ">
              <TouchableOpacity onPress={pickImage}>
                <Feather name="image" size={24} color={'green'} />
              </TouchableOpacity>
              <TouchableOpacity onPress={takeImage}>
                <Feather name="camera" size={24} color={'green'} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              className="bg-green-400 px-5 py-3 w-1/2 items-center  text-sm rounded-3xl"
              onPress={handleSubmit}
            >
              <Text className="text-white">Post</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-1 items-center justify-center">
          {image && (
            <Image source={{ uri: image }} className="h-72 w-64 rounded-md" />
          )}
        </View>
      </View>
    </>
  )
}

export default PostsForm
