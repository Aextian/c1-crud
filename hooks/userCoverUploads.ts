import { db, storage } from '@/config'
import * as ImagePicker from 'expo-image-picker'
import { doc, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { useEffect, useState } from 'react'

const userCoverUploads = (id: string) => {
  const [image, setImage] = useState<string | null>(null)

  const uploadImage = async (id: string) => {
    const userRef = doc(db, 'users', id)
    if (image) {
      const response = await fetch(image)
      const blob = await response.blob()
      const filename = image.split('/').pop()
      const storageRef = ref(storage, `images/${filename}`)
      await uploadBytes(storageRef, blob)
      const downloadURL = await getDownloadURL(storageRef)
      await updateDoc(userRef, { coverImage: downloadURL })
      console.log('Image uploaded successfully')
    }
    console.log('Image Not iipload')
  }
  useEffect(() => {
    uploadImage(id)
  }, [image])

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
  }
}

export default userCoverUploads
