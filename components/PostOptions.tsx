import { Link } from 'expo-router'
import { DocumentData } from 'firebase/firestore'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

interface PostOptionsProps {
  data: DocumentData
}

const PostOptions = ({ data }: PostOptionsProps) => {
  return (
    <View
      style={{
        position: 'absolute',
        top: 35,
        right: 20,
        borderBottomStartRadius: 10,
        borderBottomEndRadius: 10,
        borderTopStartRadius: 10,
        padding: 10,
        backgroundColor: 'white',
        zIndex: 1,
      }}
      className="shadow-md"
    >
      <View className="flex gap-5">
        <Link
          href={{
            pathname: '/user/(tabs)/posts/edit-post',
            params: { data: JSON.stringify(data) }, // Serialize the data to pass it
          }}
          asChild
        >
          <TouchableOpacity>
            <Text>Edit Post</Text>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity
          style={{
            backgroundColor: 'red',
            padding: 10,
            borderRadius: 5,
          }}
        >
          <Text style={{ color: 'white' }}>Remove Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default PostOptions
