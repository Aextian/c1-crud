import { auth, db } from '@/config'
import useModeration from '@/hooks/shared/useModerations'
import useUploadMultiples from '@/hooks/shared/useUploadMultiples'
import useFileUpload from '@/hooks/useFileUpload'
import useGradeLevel from '@/hooks/useGradeLevel'
import useRole from '@/hooks/useRole'
import { Feather } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import { ResizeMode, Video } from 'expo-av'
import { useRouter } from 'expo-router'
import { addDoc, collection } from 'firebase/firestore'
import React, { useState } from 'react'
import {
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import Toast from 'react-native-toast-message'
import FileView from './FileView'

const PostsForm = () => {
  const router = useRouter()
  const { role } = useRole()
  const { years, sections, courses } = useGradeLevel<string>()
  const [post, addPost] = useState('')
  const [year, setYear] = useState('')
  const [section, setSection] = useState('')
  const [course, setCourse] = useState('')
  const currentUser = auth.currentUser
  const [isLoading, setLoading] = useState(false)

  // const { images, pickImages, uploadImages, clearImages } = useUploadMultiples() //hooks to handle image

  const {
    files,
    progress,
    uploading,
    uploadedUrls,
    pickFiles,
    uploadFiles,
    clearFiles,
  } = useUploadMultiples()

  const { filePath, fileType, fileName, resetState, pickFile } = useFileUpload()

  const { checkContentModeration } = useModeration()

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const result = await checkContentModeration(post)
      const { images, videos } = await uploadFiles()

      const hasFile =
        (images && images.length > 0) || (videos && videos.length > 0)

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
        status: hasFile ? false : result.results[0].flagged ? false : true,
        file: {
          type: fileType,
          url: filePath,
          name: fileName,
        },
        imageUrls: images,
        videoUrls: videos,
        year: year,
        section: section,
        course: course,
      })

      addPost('')
      clearFiles()
      resetState()
      setLoading(false)

      if (hasFile && result.results[0].flagged) {
        Toast.show({
          type: 'info', // 'success', 'error', 'info'
          text1: 'Review',
          text2: 'your post is under review',
        })
      } else {
        Toast.show({
          type: 'success', // 'success', 'error', 'info'
          text1: 'Success',
          text2: 'Post has been added successfully',
        })
      }

      router.push('/user/posts')
    } catch (error) {
      console.error('Error adding post: ', error)

      setLoading(false)
    }
  }

  const handleClose = () => {
    addPost('')
    resetState()
    clearFiles()
    router.back()
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
          <View className="rounded-full border w-12 h-12 items-center justify-center">
            {currentUser?.photoURL && currentUser?.photoURL !== 'undefined' ? (
              <Image
                source={{ uri: currentUser?.photoURL }}
                style={{ borderRadius: 100, width: '100%', height: '100%' }}
              />
            ) : (
              <Feather name="user" size={20} color="black" />
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
                style={{ width: 115 }}
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
                style={{ width: 115 }}
                className="border flex flex-row  h-12 border-gray-200 outline-none ring-0 rounded-2xl  "
              >
                <Picker
                  selectedValue={section}
                  onValueChange={(section) => setSection(section)}
                  style={{
                    width: '100%',
                    height: '100%',
                    fontSize: 10, // Adjust the font size for the picker
                  }}
                >
                  <Picker.Item
                    label="Section"
                    value=""
                    style={{ fontSize: 10 }} // Adjust font size of this item
                  />
                  {sections.map((section: any) => (
                    <Picker.Item
                      style={{ fontSize: 10 }} // Adjust font size of this item
                      key={section.id}
                      label={section.name}
                      value={section.name}
                    />
                  ))}
                </Picker>
              </View>
              <View
                style={{ width: 115 }}
                className="border flex flex-row  h-12 border-gray-200 outline-none ring-0 rounded-2xl  "
              >
                <Picker
                  selectedValue={year}
                  onValueChange={(year) => setYear(year)}
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
              {/* select file */}
              <TouchableOpacity onPress={pickFile}>
                <Feather name="file" size={30} color={'#454552'} />
              </TouchableOpacity>
              {/* select image */}
              <TouchableOpacity onPress={pickFiles}>
                <Feather name="image" size={30} color={'#454552'} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              className="bg-blue-400 shadow-[0_4px_10px_rgba(0,0,0,0.8)] shadow-black px-10 py-3 rounded-full flex flex-row items-center gap-5"
              onPress={handleSubmit}
              disabled={isLoading || !post}
            >
              <Text className="text-white ">
                {isLoading ? 'Uploading...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-1 mt-10 bg-white items-center justify-center">
          {fileName && <FileView fileName={fileName} />}
          {files.length > 0 && (
            <View className="mt-5">
              <FlatList
                data={files} // Your data array
                keyExtractor={(item, index) => index.toString()} // Ensure unique keys
                renderItem={({ item, index }) => (
                  <View
                    key={index}
                    style={{
                      // flex: 1,
                      justifyContent: 'center',
                      width: '48%',
                      marginBottom: 5,
                      height: files.length > 3 ? 250 : 350,
                    }}
                  >
                    {item.type === 'image' ? (
                      <Image
                        source={{ uri: item.uri }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Video
                        source={{ uri: item.uri }}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: 10, // Optional: Adds rounded corners
                        }} // Explicit width & height
                        useNativeControls
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={false} // Don't autoplay
                        isLooping={false}
                      />
                    )}
                  </View>
                )}
                numColumns={2} // Set number of columns
                columnWrapperStyle={{ justifyContent: 'space-between' }} // Ensure even spacing
                contentContainerStyle={{
                  paddingHorizontal: 5,
                  paddingVertical: 10,
                }}
                showsHorizontalScrollIndicator={false} // Hides the scrollbar for cleaner look
                showsVerticalScrollIndicator={false}
              />
              {/* <FlatList
                data={files} // Change from images to files
                keyExtractor={(item, index) => index.toString()} // Ensure unique keys
                numColumns={3} // Set number of columns
                columnWrapperStyle={{ justifyContent: 'space-between' }} // Ensure even spacing
                contentContainerStyle={{
                  paddingHorizontal: 5,
                  paddingVertical: 10,
                }}
                showsHorizontalScrollIndicator={false} // Hides the scrollbar for cleaner look
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View
                    style={{
                      flex: 1,
                      width: '48%',
                      height: files.length > 3 ? 250 : 350,
                    }}
                  >
                    {item.type === 'image' ? (
                      <Image
                        source={{ uri: item.uri }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Video
                        source={{ uri: item.uri }}
                        style={{ width: '100%', height: '100%' }} // Explicit width & height
                        useNativeControls
                        // resizeMode="contain"
                        shouldPlay={false} // Don't autoplay
                        isLooping={false}
                      />
                    )}
                  </View>
                )}
                keyExtractor={(item) => item.uri}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 10, // Adds padding at the beginning and end of the list
                }}
              /> */}
            </View>
          )}
        </View>
      </View>
    </>
  )
}

export default PostsForm
