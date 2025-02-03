import { auth } from '@/config'
import useUser from '@/hooks/useUser'
import { Feather } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { DocumentData } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'

interface UserListProps {
  search?: string
}

const UserList = ({ search = '' }: UserListProps) => {
  const currentUser = auth.currentUser
  const [filteredUsers, setFilteredUsers] = useState<DocumentData[]>([])
  const [user, setUser] = useState<DocumentData | undefined>()
  const { users } = useUser()

  const navigateToFormNote = '/user/(tabs)/messages/add-note'

  useEffect(() => {
    setUser(users?.find((user) => user._id === currentUser?.uid))

    // filter users based on query
    const filtered = users?.filter((user) =>
      user.name.toLowerCase().includes(search?.toLowerCase()),
    )
    if (search === '' && users) {
      setFilteredUsers(users.filter((user) => user._id !== currentUser?.uid))
    } else {
      setFilteredUsers(filtered || [])
    }
  }, [search, users])

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        alignItems: 'flex-start',
        paddingHorizontal: 10,
        // height: 150,
        paddingVertical: 5,
      }}
    >
      <View
        style={{
          position: 'relative',
          height: 150,
          width: 100,
          justifyContent: 'flex-end',
        }}
      >
        <Link
          style={{
            position: 'absolute',
            top: -0,
            right: -0,
            zIndex: 100,
          }}
          href={navigateToFormNote}
        >
          <View style={{ position: 'relative' }}>
            <View
              style={{ zIndex: 100 }}
              className="h-16 w-24 p-2 items-center justify-center  rounded-3xl bg-white shadow shadow-black "
            >
              <Text
                style={{ fontSize: 8 }}
                className=" text-gray-400 text-ellipsis"
                numberOfLines={2}
              >
                {user?.note || 'Add note'}
              </Text>
            </View>
            <View
              style={{ position: 'absolute', bottom: -20, left: 0 }}
              className="h-8 w-8  rounded-full bg-white shadow"
            />
          </View>
        </Link>
        <Link href={navigateToFormNote} asChild>
          <TouchableOpacity
            key={currentUser?.uid}
            style={{ marginRight: 10, alignItems: 'center' }}
            activeOpacity={0.8}
          >
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
              {currentUser?.photoURL &&
              currentUser?.photoURL !== 'undefined' ? (
                <Image
                  src={currentUser?.photoURL}
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
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ fontSize: 10, textAlign: 'center' }}
            >
              Me
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      {filteredUsers?.map((user: DocumentData) => {
        // Extract the first word from the user's name
        const firstWord = user.name ? user.name.split(' ')[0] : ''

        return (
          <>
            <View
              style={{
                position: 'relative',
                height: 150,
                width: 100,
                justifyContent: 'flex-end',
              }}
            >
              {user.note && (
                <Link
                  href={{
                    pathname: `/user/(tabs)/messages/view-note`,
                    params: {
                      user: JSON.stringify(user), // Convert user object to JSON string
                    },
                  }}
                  asChild
                >
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: -0,
                      right: -30,
                      zIndex: 100,
                    }}
                  >
                    <View style={{ position: 'relative' }}>
                      <View
                        style={{
                          zIndex: 100,
                          borderTopEndRadius: 10,
                          borderTopStartRadius: 20,
                          borderBottomRightRadius: 20,
                        }}
                        className="h-16 w-24  items-center justify-center  bg-white shadow shadow-black "
                      >
                        <Text
                          style={{ fontSize: 8 }}
                          className=" text-gray-300 text-ellipsis"
                          numberOfLines={2}
                        >
                          {user?.note || 'Add note'}
                        </Text>
                      </View>
                      <View
                        style={{ position: 'absolute', bottom: -20, left: -15 }}
                        className="h-8 w-8  rounded-full bg-white shadow"
                      />
                    </View>
                  </TouchableOpacity>
                </Link>
              )}

              <Link
                key={user._id}
                href={{
                  pathname: `/user/(tabs)/messages/conversations/user`,
                  params: {
                    id: user._id,
                  },
                }}
                asChild
              >
                <TouchableOpacity
                  key={user.id}
                  style={{ marginRight: 10, alignItems: 'center' }}
                  activeOpacity={0.8}
                >
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
                      <Feather name="user" size={24} />
                    )}
                  </View>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ fontSize: 10, textAlign: 'center' }}
                  >
                    {firstWord}
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </>
        )
      })}
    </ScrollView>
  )
}

export default UserList
