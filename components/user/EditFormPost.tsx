import { auth, db } from '@/config'
import useModeration from '@/hooks/shared/useModerations'
import useGradeLevel from '@/hooks/useGradeLevel'
import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
import useRole from '@/hooks/useRole'
import { Feather } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import { ResizeMode, Video } from 'expo-av'
import { Link, useRouter } from 'expo-router'
import { DocumentData, doc, updateDoc } from 'firebase/firestore'
import React, { memo, useState } from 'react'
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

const EditFormPost = ({ data }: { data: DocumentData }) => {
  useHideTabBarOnFocus()

  const router = useRouter()
  const { role } = useRole()
  const { years, sections, courses } = useGradeLevel<string>()
  const [post, addPost] = useState(data.post)
  const [year, setYear] = useState(data.year)
  const [section, setSection] = useState(data.section)
  const [course, setCourse] = useState('')
  const currentUser = auth.currentUser
  const [isLoading, setLoading] = useState(false)

  const { checkContentModeration } = useModeration()

  const handleSubmit = async () => {
    setLoading(true) // Start loading before the process starts

    try {
      const result = await checkContentModeration(post)

      if (result.results[0].flagged) {
        Toast.show({
          type: 'error', // 'success', 'error', 'info'
          text1: "Can't save changes",
          text2: 'Words used are against the system rules.',
        })
        setLoading(false)
        return
      }

      // Update the post in the Firestore
      await updateDoc(doc(db, 'posts', data.id), {
        createdAt: new Date().toISOString(),
        authorId: currentUser?.uid, // Store the UID of the author
        authorName: currentUser?.displayName || 'Anonymous', // Store the author's name
        authorAvatar: currentUser?.photoURL,
        post: post,
        year: year,
        section: section,
      })
      addPost('')
      setLoading(false)
      // Redirect to the posts page
      router.push('/user/posts')

      Toast.show({
        type: 'success', // 'success', 'error', 'info'
        text1: 'Success',
        text2: 'Post updated successfull',
      })
    } catch (error) {
      console.error('Error updating post: ', error) // Log the error
      alert('Error while updating post. Please try again later.') // Show a more informative error alert
      setLoading(false) // Stop loading in case of error
    }
  }

  const imageUrls = data.imageUrls

  const fileUrls = [...data.videoUrls, ...imageUrls]

  return (
    <>
      <View className="w-full bg-white border-b border-b-slate-100 flex justify-start ">
        <Link asChild href={'/user/(tabs)/posts'}>
          <TouchableOpacity className="p-4">
            <Feather name="x" size={20} />
          </TouchableOpacity>
        </Link>
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
          <View className="flex flex-row mt-5  justify-end gap-5 items-center ">
            <TouchableOpacity
              className="bg-blue-400 shadow-[0_4px_10px_rgba(0,0,0,0.8)] shadow-black px-10 py-3 rounded-full flex flex-row items-center gap-5"
              onPress={handleSubmit}
              disabled={isLoading || !post}
            >
              <Text className="text-white ">
                {isLoading ? 'Updating...' : 'Update'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className=" mt-10 bg-white items-center justify-center">
          {data && data?.file.url && <FileView fileName={data?.file.name} />}
          {data && (
            <View className="mt-5">
              <FlatList
                data={fileUrls} // Your data array
                keyExtractor={(item, index) => index.toString()} // Ensure unique keys
                renderItem={({ item, index }) => (
                  <View
                    key={index}
                    style={{
                      width: '48%',
                      margin: 5,
                      height: fileUrls.length > 3 ? 250 : 350,
                    }}
                  >
                    {item.includes('images') ? (
                      <Image
                        source={{ uri: item }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Video
                        source={{ uri: item }}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: 10, // Optional: Adds rounded corners
                        }} // Explicit width & height
                        useNativeControls
                        resizeMode={ResizeMode.STRETCH}
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
            </View>
          )}
        </View>
        {/* footer */}
        <View className="flex flex-row items-center mb- justify-center mb-10">
          <TouchableOpacity
            className="bg-blue-400 shadow-[0_4px_10px_rgba(0,0,0,0.8)] shadow-black px-10 py-3 rounded-full flex flex-row items-center gap-5"
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text className="text-white">
              {isLoading ? 'Updating...' : 'Update'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}

export default memo(EditFormPost)
