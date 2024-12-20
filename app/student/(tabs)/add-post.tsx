import { db, storage } from '@/config'
import useAuth from '@/hooks/useAuth'
import { Feather } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { Link, useRouter } from 'expo-router'
import { addDoc, collection } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import React, { useState } from 'react'
import {
  Button,
  Image,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated'

const addPost = () => {
  const [image, setImage] = useState<string | null>(null)

  const router = useRouter()
  // const [imageUrl, setImageUrl] = useState('')
  const [post, addPost] = useState('')
  const { currentUser, loading } = useAuth()

  const takePhoto = async () => {
    let pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
    })
  }

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })
    if (!result.canceled) {
      setImage(result.assets[0].uri)
    }
  }

  const handleSubmit = async () => {
    try {
      let imageUrl = ''
      if (image) {
        const response = await fetch(image)
        const blob = await response.blob() // Convert image to blob
        const filename = image.substring(image.lastIndexOf('/') + 1)
        const storageRef = ref(storage, `images/${filename}`) // Reference to storage location
        // Upload the file
        await uploadBytes(storageRef, blob).then(async (snapshot) => {
          const downloadURL = await getDownloadURL(snapshot.ref)
          imageUrl = downloadURL
        })
      }

      await addDoc(collection(db, 'posts'), {
        createdAt: new Date().toISOString(),
        authorId: currentUser?.uid, // Store the UID of the author
        authorName: currentUser?.displayName || 'Anonymous', // Store the author's name
        post: post,
        likes: 0,
        comment: 0,
        status: false,
        imageUrl: imageUrl,
      })
      addPost('')
      router.push('/student/posts')
    } catch (error) {
      console.error('Error adding post: ', error)
      alert('Post added error')
    }
  }
  return (
    <Animated.View entering={FadeIn} style={{ flex: 1, marginTop: 25 }}>
      <Animated.View entering={SlideInDown} style={{ flex: 1 }}>
        {/* Dismiss modal when pressing outside */}
        {/* <SafeAreaProvider> */}
        <SafeAreaView style={{ flex: 1 }}>
          <View className="w-full bg-white border-b border-b-slate-100 flex justify-start ">
            <Link href={'/student/posts'} asChild>
              <Pressable className="p-4">
                <Feather name="x" size={20} />
              </Pressable>
            </Link>
          </View>
          <View className="flex-1 bg-white">
            <View className="flex flex-row   items-center   p-4 gap-2">
              <View className="rounded-full border p-3">
                <Feather name="user" size={12} />
              </View>
              <View className="">
                <View>
                  <Text className="text-xs font-medium">Juan Dela Cruz</Text>
                  <TextInput
                    className="w-full items-center border-none text-[10px] outline-none"
                    editable
                    multiline
                    numberOfLines={4}
                    placeholder="What's on your mind?"
                    placeholderTextColor={'gray'}
                    value={post}
                    onChangeText={addPost}
                  />
                </View>

                <View className="flex flex-row gap-5 items-center ">
                  <TouchableOpacity onPress={pickImage}>
                    <Feather name="image" size={24} color={'gray'} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={takePhoto}>
                    <Feather name="camera" size={24} color={'gray'} />
                  </TouchableOpacity>
                  <Button title="Post" onPress={handleSubmit} />
                </View>
              </View>
            </View>
            <View className="flex-1 items-center justify-center">
              {image && (
                <Image
                  source={{ uri: image }}
                  className="h-72 w-64 rounded-md"
                />
              )}
            </View>
          </View>
        </SafeAreaView>
        {/* </SafeAreaProvider> */}
      </Animated.View>
    </Animated.View>
  )
}

export default addPost
