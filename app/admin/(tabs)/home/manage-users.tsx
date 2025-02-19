import { db } from '@/config'
import useAuthentication from '@/hooks/authentication/useAuthentication'
import useUser from '@/hooks/useUser'
import { Feather } from '@expo/vector-icons'
import { Stack } from 'expo-router'
import { doc, DocumentData, updateDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native'

const manageUsers = () => {
  const [filteredUsers, setFilteredUsers] = useState<DocumentData[]>([])
  const { users } = useUser()
  const { sendResetEmail } = useAuthentication()

  useEffect(() => {
    if (users) setFilteredUsers(users)
  }, [users])

  const handleSearch = (query: string) => {
    const filtered = users?.filter((user) =>
      user.name.toLowerCase().includes(query.toLowerCase()),
    )
    if (query === '' && users) {
      setFilteredUsers(users)
    } else {
      setFilteredUsers(filtered || [])
    }
  }

  const handleUnFrozen = (id: string) => {
    Alert.alert(
      ' Confirmation',
      'Are you sure you want to unfrozen this account?',
      [
        {
          text: 'Cancel',
          style: 'cancel', // Just dismisses the dialog
        },
        {
          text: 'Unfrozen',
          style: 'destructive', // Highlights the delete action (iOS-specific)
          onPress: async () => {
            try {
              const userDocRef = doc(db, 'users', id) // Reference to the document
              await updateDoc(userDocRef, { frozen: false }) // Deletes the document from Firestore
              Alert.alert('Unfrozen Successfully')
            } catch (error) {
              console.error('Error deleting course:', error)
            }
          },
        },
      ],
    )
  }
  const handleFrozen = (id: string) => {
    Alert.alert(
      ' Confirmation',
      'Are you sure you want to frozen this account?',
      [
        {
          text: 'Cancel',
          style: 'cancel', // Just dismisses the dialog
        },
        {
          text: 'Frozen',
          style: 'destructive', // Highlights the delete action (iOS-specific)
          onPress: async () => {
            try {
              const userDocRef = doc(db, 'users', id) // Reference to the document
              await updateDoc(userDocRef, { frozen: true }) // Deletes the document from Firestore
              Alert.alert('Frozen Successfully')
            } catch (error) {
              console.error('Error deleting course:', error)
            }
          },
        },
      ],
    )
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 10,
        paddingTop: 35,
        gap: 10,
        backgroundColor: 'white',
      }}
    >
      <Stack.Screen
        options={{
          headerTitle: 'Users',
          headerSearchBarOptions: {
            placeholder: 'Search Users',
            hideWhenScrolling: true,
            onChangeText: (event) => handleSearch(event.nativeEvent.text),
          },
        }}
      />

      {filteredUsers?.map((user: DocumentData) => {
        return (
          <View className="flex items-start gap-5 flex-row justify-between">
            <View className="flex items-center flex-row gap-5">
              <View
                style={{
                  height: 64,
                  width: 64,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderRadius: 50,
                  // padding: 16,
                }}
              >
                {user.avatar && user.avatar !== 'undefined' ? (
                  <Image
                    source={{ uri: user.avatar }}
                    alt="avatar"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 50,
                    }}
                  />
                ) : (
                  <Feather name="user" size={24} />
                )}
              </View>

              <View className="flex flex-col gap-2 ">
                <Text>{user.name}</Text>
                <Text style={{ fontSize: 10 }}>{user.email}</Text>
                <View className="flex justify-between items-center flex-row gap-2 ">
                  <TouchableOpacity
                    className="bg-green-500 px-16 py-2 rounded-xl"
                    onPress={() => sendResetEmail(user.email)}
                  >
                    <Text className="text-white">Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`${user.frozen ? 'bg-red-300' : 'bg-red-500'} px-12 py-2 rounded-xl`}
                    onPress={
                      user.frozen
                        ? () => handleUnFrozen(user._id)
                        : () => handleFrozen(user._id)
                    }
                  >
                    <Text className="text-white">
                      {user.frozen ? 'Unfreeze' : 'Frozen'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )
      })}
    </View>
  )
}

export default manageUsers
