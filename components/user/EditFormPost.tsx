import { auth, db } from '@/config'
import useGradeLevel from '@/hooks/useGradeLevel'
import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
import useRole from '@/hooks/useRole'
import { Feather } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
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
import FileView from './FileView'

const EditFormPost = ({ data }: { data: DocumentData }) => {
  useHideTabBarOnFocus()
  const router = useRouter()
  const { role } = useRole()
  const { years, sections } = useGradeLevel<string>()
  const [post, addPost] = useState(data.post)
  const [year, setYear] = useState(data.year)
  const [section, setSection] = useState(data.section)
  const currentUser = auth.currentUser
  const [isLoading, setLoading] = useState(false)

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
        section: section,
      })
      addPost('')
      setLoading(false)
      // Redirect to the posts page
      router.push('/user/posts')
    } catch (error) {
      console.error('Error updating post: ', error) // Log the error
      alert('Error while updating post. Please try again later.') // Show a more informative error alert
      setLoading(false) // Stop loading in case of error
    }
  }

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
                style={{ width: 150 }}
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
                style={{ width: 150 }}
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
        </View>
        <View className="flex-1 mt-10 bg-white items-center justify-center">
          {data && data?.file.url && <FileView fileName={data?.file.name} />}
          {data && (
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
        {/* footer */}
        <View className="flex flex-row items-center mb- justify-center mb-10">
          <TouchableOpacity
            className="bg-green-400 justify-center p-5 w-10/12 items-center  text-sm rounded-xl"
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
