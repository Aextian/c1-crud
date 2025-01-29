import { auth, db } from '@/config'
import useImageUploads from '@/hooks/useImageUploads'
import { Feather } from '@expo/vector-icons'
import { Link, Stack, useLocalSearchParams } from 'expo-router'
import { DocumentData, doc, getDoc, updateDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

const GroupInfo = () => {
  const { id } = useLocalSearchParams<any>()
  const [group, setGroup] = useState<DocumentData>()
  const [members, setMembers] = useState<DocumentData[]>([])
  const [option, setOptions] = useState(false)
  const currentUser = auth?.currentUser
  const { image, pickImage, uploadImage } = useImageUploads() //hooks to handle image

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const groupRef = doc(db, 'groupChats', id)
        const groupSnapshot = await getDoc(groupRef)

        if (groupSnapshot.exists()) {
          const groupData = groupSnapshot.data()
          setGroup(groupData)

          // Fetch all members' details
          const memberPromises = groupData.members.map(
            async (memberId: string) => {
              const memberRef = doc(db, 'users', memberId)
              const memberSnapshot = await getDoc(memberRef)
              return memberSnapshot.exists()
                ? { id: memberId, ...memberSnapshot.data() }
                : null
            },
          )

          const membersData = await Promise.all(memberPromises)
          setMembers(membersData.filter((member) => member !== null)) // Remove nulls if any
        } else {
          console.log('Group does not exist')
        }
      } catch (error) {
        console.error('Error fetching group:', error)
      }
    }

    if (id) {
      fetchGroup()
    }
  }, [id])

  const updateGroupImage = async () => {
    try {
      await pickImage()
      if (image) {
        const imageUrl = await uploadImage(image)
        const groupRef = doc(db, 'groupChats', id)
        await updateDoc(groupRef, { image: imageUrl })
        alert('Group image updated successfully')
      }
    } catch (error) {
      console.error('Error updating group image:', error)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white', position: 'relative' }}>
      <Stack.Screen
        options={{
          headerTitle: '',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setOptions(!option)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
              }}
            >
              <Feather name="more-vertical" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      {option && (
        <View className="absolute bg-white shadow top-0 right-14 rounded-b-xl rounded-tl-xl p-5 z-10">
          <Link
            href={{
              pathname: '/user/messages/conversations/group/add-member',
              params: {
                id: id,
              },
            }}
            asChild
          >
            <TouchableOpacity>
              <Text>Add member</Text>
            </TouchableOpacity>
          </Link>
          <TouchableOpacity className="mt-5">
            <Text className="text-red-500 font-semibold">Leave group</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="mt-10 flex items-center justify-center">
        <View className="rounded-full w-36 h-36   p-3 items-center justify-center">
          {group?.image && group?.image !== 'undefined' ? (
            <Image
              source={{ uri: group?.image }}
              style={{ width: '100%', height: '100%', borderRadius: 100 }}
            />
          ) : (
            <Feather name="users" size={24} color="black" />
          )}
          <View className="absolute bottom-5 right-8">
            <Pressable onPress={updateGroupImage}>
              <Feather name="camera" size={28} color="white" />
            </Pressable>
          </View>
        </View>
        <View>
          <Text className="font-bold text-lg">{group?.name}</Text>
        </View>
      </View>
      <View className="px-10 mb-10">
        <Text>Members</Text>
      </View>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          paddingHorizontal: 10,
        }}
      >
        {members.map((user: DocumentData) => (
          <View
            className="flex flex-row justify-between w-full items-center "
            key={user.id}
          >
            <View
              className="flex flex-row items-center "
              style={{ marginBottom: 10 }}
            >
              <View
                style={{
                  height: 50,
                  width: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderRadius: 50,
                  // padding: 16,
                }}
              >
                {user?.avatar && user?.avatar !== 'undefined' ? (
                  <Image
                    src={user?.avatar}
                    alt="avatar"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 50,
                    }}
                  />
                ) : (
                  <Feather name="user" size={20} />
                )}
              </View>

              <Text
                style={{ fontWeight: 'bold', marginLeft: 10 }}
                className="text-[10px] text-center"
              >
                {user.name}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

export default GroupInfo
