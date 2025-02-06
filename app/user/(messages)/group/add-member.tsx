import UserGroupList from '@/components/user/UserGroupList'
import { db } from '@/config'
import useHideTabBarOnFocus from '@/hooks/useHideTabBarOnFocus'
import { Ionicons } from '@expo/vector-icons'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'

const AddMember = () => {
  useHideTabBarOnFocus()
  const { id } = useLocalSearchParams<any>()
  const [userIds, setUserIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const groupRef = doc(db, 'groupChats', id)
        const groupSnapshot = await getDoc(groupRef)

        if (groupSnapshot.exists()) {
          const groupData = groupSnapshot.data()
          setUserIds(groupData.members)
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

  const handleUpdateSubmit = async () => {
    setIsLoading(true)
    try {
      const groupRef = doc(db, 'groupChats', id)
      await updateDoc(groupRef, {
        members: userIds,
      })
      alert('Group updated successfully')
      setIsLoading(false)
      router.back()
    } catch (error) {
      setIsLoading(false)
      console.error('Error updating group:', error)
    }
  }
  return (
    <View className="flex flex-1 flex-col gap-5 px-5   bg-white">
      <Stack.Screen
        options={{
          headerTitle: '',
          headerRight: () => (
            <TouchableOpacity disabled={isLoading} onPress={handleUpdateSubmit}>
              <Ionicons name="checkmark" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />

      <View className="mt-10">
        <UserGroupList setUserIds={setUserIds} userIds={userIds} />
      </View>
    </View>
  )
}

export default AddMember
