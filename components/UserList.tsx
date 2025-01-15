import { auth, db } from '@/config'
import { getAllUsers } from '@/services/firebase/users'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import {
  DocumentData,
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

interface UserListProps {
  role?: string
}

const UserList = ({ role }: UserListProps) => {
  const [users, setUsers] = useState<DocumentData>([])
  const [user, setUser] = useState<DocumentData>()
  const [note, setNote] = useState('')
  const currentUser = auth.currentUser
  const router = useRouter() // Initialize the router

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData: DocumentData[] = await getAllUsers() // Wait for the promise to resolve
        setUsers(
          userData.filter(
            (user) => user.id !== currentUser?.uid && user.role !== 'admin', //remove admin and current user
          ),
        ) // Update the state with the fetched users
        setUser(userData.find((user) => user.id === currentUser?.uid))
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers() // Call the async function
  }, [])

  // useEffect(() => {
  //   const getNote = async () => {
  //     try {
  //       const noteRef = doc(db, 'notes', String(currentUser?.uid))
  //       const noteSnapshot = await getDoc(noteRef)
  //       if (noteSnapshot.exists()) {
  //         setNote(noteSnapshot.data().note)
  //       }
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   }

  //   getNote()
  // }, [currentUser])

  const handleSelectUser = async (selectedUser: DocumentData) => {
    // Check if the conversation exists or create a new one
    const conversationCollection = query(
      collection(db, 'conversations'), // Use the db reference here
      where('users', 'array-contains', currentUser?.uid),
    )
    try {
      const querySnapshot = await getDocs(conversationCollection) // Use await to get the documents
      const conversation = querySnapshot.docs.find((doc) => {
        const users = doc.data().users
        // Check if the selected user is in the conversation
        return users.includes(selectedUser.id)
      })

      if (conversation) {
        role === 'teacher'
          ? router.push({
              pathname: `/teacher/(tabs)/messages/conversations/user`,
              params: {
                id: conversation.id,
              },
            })
          : router.push(
              `/student/(tabs)/messages/conversations/${conversation.id}`,
            )
      } else {
        // Create a new conversation
        const docRef = await addDoc(collection(db, 'conversations'), {
          users: [currentUser?.uid, selectedUser.id], // Corrected document structure
        })

        role === 'teacher'
          ? router.push({
              pathname: `/teacher/(tabs)/messages/conversations/user`,
              params: {
                id: docRef.id,
              },
            })
          : router.push(`/student/(tabs)/messages/conversations/${docRef.id}`)
      }
    } catch (error) {
      console.error('Error fetching or creating conversation: ', error)
    }
  }

  const navigateToFormNote = () => {
    role === 'teacher' ? router.push('/teacher/(tabs)/messages/add-note') : null
  }
  const navigateToViewNote = (user: DocumentData) => {
    router.push({
      pathname: `/teacher/(tabs)/messages/view-note`,
      params: {
        user: JSON.stringify(user), // Convert user object to JSON string
      },
    })
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        alignItems: 'center',
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
        <Pressable
          style={{
            position: 'absolute',
            top: -0,
            right: -0,
            zIndex: 100,
          }}
          onPress={navigateToFormNote}
        >
          <View style={{ position: 'relative' }}>
            <View
              style={{ zIndex: 100 }}
              className="h-16 w-16 p-2 items-center justify-center  rounded-full bg-white shadow shadow-black "
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
              style={{ position: 'absolute', bottom: -20, left: 0 }}
              className="h-8 w-8  rounded-full bg-white shadow"
            />
          </View>
        </Pressable>
        <TouchableOpacity
          key={currentUser?.uid}
          style={{ marginRight: 10, alignItems: 'center' }}
          activeOpacity={0.8}
          onPress={navigateToFormNote}
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
            {currentUser?.photoURL ? (
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
      </View>

      {users.map((user: DocumentData) => {
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
                <TouchableOpacity
                  onPress={() => navigateToViewNote(user)}
                  style={{
                    position: 'absolute',
                    top: -0,
                    right: -0,
                    zIndex: 100,
                  }}
                >
                  <View style={{ position: 'relative' }}>
                    <View
                      style={{ zIndex: 100 }}
                      className="h-16 w-16 p-2 items-center justify-center  rounded-full bg-white shadow shadow-black "
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
                      style={{ position: 'absolute', bottom: -20, left: 0 }}
                      className="h-8 w-8  rounded-full bg-white shadow"
                    />
                  </View>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                key={user.id}
                style={{ marginRight: 10, alignItems: 'center' }}
                activeOpacity={0.8}
                onPress={() => handleSelectUser(user)}
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
                  {user?.avatar ? (
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
            </View>
          </>
        )
      })}
    </ScrollView>
  )
}

export default UserList
