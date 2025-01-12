import { storage } from '@/config'
import * as ImagePicker from 'expo-image-picker'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { useState } from 'react'

const useImageUploads = () => {
  const [image, setImage] = useState<string | null>(null)

  const uploadImage = async () => {
    if (image) {
      const response = await fetch(image)
      const blob = await response.blob()
      const filename = image.split('/').pop()
      const storageRef = ref(storage, `images/${filename}`)
      await uploadBytes(storageRef, blob)
      const downloadURL = await getDownloadURL(storageRef)
      return downloadURL
    }
  }

  const pickImage = async () => {
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

  return {
    image,
    pickImage,
    uploadImage,
  }
}

export default useImageUploads
