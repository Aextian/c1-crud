import { storage } from '@/config'
import * as ImagePicker from 'expo-image-picker'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { useState } from 'react'

const useUploadMultiples = () => {
  const [images, setImages] = useState<string[]>([]) // Store multiple image URIs

  // Function to upload all selected images
  const uploadImages = async () => {
    if (images.length === 0) return []

    const uploadPromises = images.map(async (image) => {
      const response = await fetch(image)
      const blob = await response.blob()
      const filename = image.split('/').pop()
      const storageRef = ref(storage, `images/${filename}`)
      await uploadBytes(storageRef, blob)
      const downloadURL = await getDownloadURL(storageRef)
      return downloadURL
    })

    // Wait for all uploads to complete and return their URLs
    return await Promise.all(uploadPromises)
  }

  // Function to pick multiple images
  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true, // Enable multiple image selection
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      const selectedImages = result.assets.map((asset) => asset.uri)
      setImages((prevImages) => [...prevImages, ...selectedImages]) // Append new images to the existing list
    }
  }

  // Function to clear all selected images
  const clearImages = () => {
    setImages([])
  }

  return {
    images, // Array of image URIs
    pickImages,
    uploadImages,
    clearImages,
  }
}

export default useUploadMultiples
