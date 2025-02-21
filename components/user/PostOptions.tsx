import { db } from '@/config'
import { Link } from 'expo-router'
import { deleteDoc, doc, DocumentData } from 'firebase/firestore'
import React from 'react'
import { Alert, Text, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'

interface IPostOptionsProps {
  data: DocumentData
}

const PostOptions = ({ data }: IPostOptionsProps) => {
  const handleRemovePost = async () => {
    try {
      await deleteDoc(doc(db, 'posts', data.id)) // Delete the post from Firestore
      // Alert.alert('Success', 'Post has been removed successfully.')
      Toast.show({
        type: 'success', // 'success', 'error', 'info'
        text1: 'Success',
        text2: 'Post has been removed successfully',
      })
    } catch (error) {
      console.error('Error removing post:', error)
      Toast.show({
        type: 'error', // 'success', 'error', 'info'
        text1: 'Error',
        text2: 'Failed to remove the post. Please try again later.',
      })
    }
  }

  const confirmRemovePost = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleRemovePost },
      ],
    )
  }

  return (
    <View
      style={{
        position: 'absolute',
        top: 50,
        right: 30,
        borderBottomStartRadius: 10,
        borderBottomEndRadius: 10,
        borderTopStartRadius: 10,
        paddingHorizontal: 30,
        paddingVertical: 20,
        backgroundColor: 'white',
        zIndex: 1,
      }}
      className="shadow"
    >
      <View className="flex gap-5">
        <Link
          href={{
            pathname: '/user/(posts)/edit',
            params: { id: data.id }, // Serialize the data to pass it
          }}
          asChild
        >
          <TouchableOpacity>
            <Text>Edit Post</Text>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity onPress={confirmRemovePost}>
          <Text className="text-red-500">Delete Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default PostOptions
