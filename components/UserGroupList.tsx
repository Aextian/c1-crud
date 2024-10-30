import { auth, db } from '@/config'
import { Feather } from '@expo/vector-icons'
import Checkbox from 'expo-checkbox'
import { DocumentData, collection, onSnapshot } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import SkLoading from './SkLoading'

interface IProps {
  setUserIds: (userIds: string[]) => void
  userIds: string[]
}
const UserGroupList = ({ userIds, setUserIds }: IProps) => {
  const [users, setUsers] = useState<DocumentData>([])
  //   const [userIds, setUserIds] = useState<string[]>([])
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

  return users.length > 0 ? (
    <ScrollView
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        paddingHorizontal: 10,
      }}
    >
      {users.map((user: DocumentData) => (
        <View
          className="flex flex-row justify-between w-full items-center "
          key={user.id}
        >
          <View
            className="flex flex-row items-center "
            style={{ marginBottom: 10 }}
          >
            <View className="item-center  h-16 w-16  justify-center border p-4 rounded-full">
              <Feather name="user" size={24} />
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
    <SkLoading />
  )
}

export default UserGroupList
