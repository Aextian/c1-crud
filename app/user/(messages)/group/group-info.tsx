import { auth, db } from '@/config'
import useImageUploads from '@/hooks/useImageUploads'
import { Feather } from '@expo/vector-icons'
import { Link, Stack, router, useLocalSearchParams } from 'expo-router'
import {
  DocumentData,
  arrayRemove,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  Image,
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
  const { image, pickImage, uploadImage } = useImageUploads() //hooks to handle image

  useEffect(() => {
    if (!id) return

    const groupRef = doc(db, 'groupChats', id)

    // Real-time listener for group data
    const unsubscribeGroup = onSnapshot(groupRef, async (groupSnapshot) => {
      if (groupSnapshot.exists()) {
        const groupData = groupSnapshot.data()
        setGroup(groupData)

        // Fetch members' details
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
        setMembers(membersData.filter((member) => member !== null)) // Remove null values
      } else {
        console.log('Group does not exist')
        setMembers([])
      }
    })

    return () => unsubscribeGroup() // Cleanup listener on unmount
  }, [id])

  const updateGroupImage = async () => {
    try {
      await pickImage()
      const imageUrl = await uploadImage()
      const groupRef = doc(db, 'groupChats', id)
      await updateDoc(groupRef, { image: imageUrl })
      alert('Group image updated successfully')
      //reload the pagec
      window.location.reload()
    } catch (error) {
      console.error('Error updating group image:', error)
    }
  }

  const handleLeaveGroup = async (currentUserId: string, groupId: string) => {
    Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Yes, Leave',
        onPress: async () => {
          try {
            const groupRef = doc(db, 'groupChats', groupId)

            // Remove only the current user from the members array
            await updateDoc(groupRef, {
              members: arrayRemove(currentUserId),
            })

            alert('You have left the group')

            router.push('/user/messages')
          } catch (error) {
            console.error('Error leaving group:', error)
          }
        },
      },
    ])
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
              pathname: '/user/(messages)/group/add-member',
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
          <TouchableOpacity
            onPress={() => handleLeaveGroup(String(auth?.currentUser?.uid), id)}
            className="mt-5"
          >
            <Text className="text-red-500 font-semibold">Leave group</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="mt-10 flex items-center justify-center">
        <View
          style={{ borderRadius: 100 }}
          className=" relative border bg-gray-200 border-gray-300 w-36 h-36   items-center justify-center"
        >
          {group?.image && group?.image !== 'undefined' ? (
            <Image
              source={{ uri: group?.image }}
              style={{ width: '100%', height: '100%', borderRadius: 100 }}
            />
          ) : (
            <Feather name="users" size={50} color="black" />
          )}
          <View className="absolute bg-black/30 rounded-full p-2  -bottom-2 right-0">
            <TouchableOpacity onPress={updateGroupImage}>
              <Feather name="camera" size={30} color="white" />
            </TouchableOpacity>
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
