import { auth, db } from '@/config'
import { Feather } from '@expo/vector-icons'
import Checkbox from 'expo-checkbox'
import { DocumentData, collection, onSnapshot } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { Image, ScrollView, Text, TextInput, View } from 'react-native'
import SkUserLoader from './SkLoader'

interface IProps {
  setUserIds: (userIds: string[]) => void
  userIds: string[]
}
const UserGroupList = ({ userIds, setUserIds }: IProps) => {
  const [users, setUsers] = useState<DocumentData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<DocumentData>([])
  const currentUser = auth.currentUser

  useEffect(() => {
    const usersCollection = collection(db, 'users')
    const unsubscribe = onSnapshot(usersCollection, (querySnapshot) => {
      const usersData = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((user) => user.id !== currentUser?.uid)
      setUsers(usersData)
      setFilteredUsers(usersData)
    })
    return unsubscribe
  }, [])

  const handleCheckboxChange = (isChecked: boolean, userId: string) => {
    setUserIds(
      isChecked
        ? [...userIds, userId] // Add userId if checked
        : userIds.filter((id) => id !== userId), // Remove userId if unchecked
    )
  }
  const handleSearch = (text: string) => {
    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(text.toLowerCase()) ||
        user.email?.toLowerCase().includes(text.toLowerCase()), // Include email search
    )
    if (text === '') {
      setFilteredUsers(users)
    } else {
      setFilteredUsers(filtered)
    }
  }

  return users.length > 0 ? (
    <ScrollView
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        // paddingHorizontal: 10,
      }}
    >
      <View className="w-full bg-white shadow mb-10">
        <TextInput
          className="w-full rounded-xl p-5"
          autoFocus
          placeholder="Search by name or email"
          onChangeText={(text) => handleSearch(text)}
        />
      </View>
      {filteredUsers.map((user: DocumentData) => (
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
          <View>
            <Checkbox
              value={userIds.includes(user.id)}
              onValueChange={(isChecked) =>
                handleCheckboxChange(isChecked, user.id)
              }
              color={userIds.includes(user.id) ? 'blue' : undefined}
              style={{ marginLeft: 10 }}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  ) : (
    <SkUserLoader />
  )
}

export default UserGroupList
