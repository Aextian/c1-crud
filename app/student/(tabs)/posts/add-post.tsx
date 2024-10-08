import { storage } from '@/config'
import { Feather } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import React, { useState } from 'react'
import { Button, Image, Text, TouchableOpacity, View } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'

const addPost = () => {
  const [image, setImage] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState('')

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

  const uploadImage = async () => {
    if (image) {
      const response = await fetch(image)
      const blob = await response.blob() // Convert image to blob
      const filename = image.substring(image.lastIndexOf('/') + 1)
      const storageRef = ref(storage, `images/${filename}`) // Reference to storage location
      // Upload the file
      await uploadBytes(storageRef, blob).then(async (snapshot) => {
        const downloadURL = await getDownloadURL(snapshot.ref)
        setImageUrl(downloadURL)
        console.log('Image URL:', downloadURL)
        alert('Image uploaded successfully!')
      })
    }
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex flex-row   items-center border  p-4 gap-2">
        <View className="rounded-full border p-3">
          <Feather name="user" size={12} />
        </View>
        <View className="gap-5">
          <Text className="text-[10px] font-medium">Juan Dela Cruz</Text>
          <TextInput
            className="w-full items-center border-none outline-none"
            editable
            placeholder="What's new?"
            placeholderTextColor={'gray'}
          />
          <View className="flex flex-row gap-3 items-center ">
            <TouchableOpacity onPress={pickImage}>
              <Feather name="image" size={20} color={'gray'} />
            </TouchableOpacity>

            <TouchableOpacity onPress={takePhoto}>
              <Feather name="camera" size={20} color={'gray'} />
            </TouchableOpacity>
            <Button title="Upload Image" onPress={uploadImage} />
          </View>
        </View>
      </View>

      <View className="flex-1 items-center justify-center">
        {image && <Image source={{ uri: image }} className="h-24 w-24" />}
        <Text>Image Url</Text>
        {imageUrl && <Image source={{ uri: imageUrl }} className="h-24 w-24" />}
        <Text>jshdjgsjh</Text>
      </View>
    </View>
  )
}

export default addPost
