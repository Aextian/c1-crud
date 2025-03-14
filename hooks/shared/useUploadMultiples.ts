import { storage } from '@/config'
import * as ImagePicker from 'expo-image-picker'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { useState } from 'react'

const useUploadMultiples = () => {
  const [files, setFiles] = useState<
    { uri: string; type: 'image' | 'video' }[]
  >([])
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrls, setUploadedUrls] = useState<{
    images: string[]
    videos: string[]
  }>({
    images: [],
    videos: [],
  })

  // 📌 Function to upload files
  const uploadFiles = async () => {
    if (files.length === 0) return { images: [], videos: [] }

    try {
      const uploadedUrls = { images: [], videos: [] }

      const uploadPromises = files.map(async (file) => {
        try {
          console.log('Uploading file:', file.uri)

          const response = await fetch(file.uri)
          if (!response.ok) throw new Error(`Failed to fetch file: ${file.uri}`)

          const blob = await response.blob()
          const filename = file.uri.split('/').pop()
          const fileType = file.type?.startsWith('video') ? 'videos' : 'images'

          console.log(`Uploading to Firebase: ${fileType}/${filename}`)

          const storageRef = ref(storage, `${fileType}/${filename}`)
          await uploadBytesResumable(storageRef, blob)
          const downloadURL = await getDownloadURL(storageRef)

          // Append to the correct list
          uploadedUrls[fileType].push(downloadURL)

          console.log('Uploaded file URL:', downloadURL)
          return downloadURL
        } catch (error) {
          console.error('Upload error:', error)
          return null
        }
      })

      await Promise.all(uploadPromises)
      console.log('Final uploaded URLs:', uploadedUrls)
      return uploadedUrls
    } catch (error) {
      console.error('Unexpected upload error:', error)
      return { images: [], videos: [] }
    }
  }

  // 📌 Function to pick multiple files (Images & Videos)
  const pickFiles = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Allow both images & videos
      allowsMultipleSelection: true,
      quality: 1,
    })

    if (!result.canceled) {
      // const selectedFiles = result.assets.map((asset) => asset.uri)
      const selectedFiles: { uri: string; type: 'image' | 'video' }[] =
        result.assets.map((asset) => ({
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
        }))
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles])
    }
  }

  // 📌 Function to clear selected files
  const clearFiles = () => {
    setFiles([])
    setUploadedUrls({ images: [], videos: [] })
  }

  return {
    files,
    uploadedUrls,
    progress,
    uploading,
    pickFiles,
    uploadFiles,
    clearFiles,
  }
}

export default useUploadMultiples
