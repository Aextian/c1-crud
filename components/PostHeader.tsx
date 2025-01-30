import { auth } from '@/config'
import useAuth from '@/hooks/useAuth'
import useGradeLevel from '@/hooks/useGradeLevel'
import { Feather } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import { Link } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Image, Text, View } from 'react-native'

const PostHeader = ({ filterPosts }: { filterPosts: any }) => {
  const currentUser = auth.currentUser
  const { years, sections } = useGradeLevel<string>()
  const { user } = useAuth()

  const [year, setYear] = useState('')
  const [section, setSection] = useState('')

  useEffect(() => {
    filterPosts({ year, section })
  }, [year, section])

  return (
    <View>
      <Link href={'/user/(tabs)/add-post'}>
        <View className="flex flex-row gap-5 border-b border-b-slate-100 p-4">
          <View className="rounded-full border">
            {currentUser?.photoURL && currentUser?.photoURL !== 'undefined' ? (
              <Image
                source={{ uri: currentUser?.photoURL }}
                style={{ width: 45, height: 45, borderRadius: 100 }}
              />
            ) : (
              <View
                className="text-center flex items-center justify-center"
                style={{ width: 45, height: 45 }}
              >
                <Feather name="user" size={24} color="black" />
              </View>
            )}
          </View>
          <View className="gap-2">
            <Text className="text-[12px] font-medium">
              {currentUser?.displayName}
            </Text>
            <Text className="text-[10px] text-gray-500 font-medium">
              What's on your mind?
            </Text>
          </View>
        </View>
      </Link>
      {user?.role === 'teacher' && user && user !== undefined && (
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
  )
}

export default PostHeader
