import { storage } from '@/config'
import * as DocumentPicker from 'expo-document-picker'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { useState } from 'react'

const useFileUpload = () => {
  const [isAttachImage, setIsAttachImage] = useState(false)
  const [isAttachFile, setIsAttachFile] = useState(false)
  const [imagePath, setImagePath] = useState('')
  const [filePath, setFilePath] = useState('')
  const [fileType, setFileType] = useState('')
  const [fileName, setFileName] = useState('')
  const resetState = () => {
    setIsAttachImage(false)
    setIsAttachFile(false)
    setImagePath('')
    setFilePath('')
    setFileType('')
  }

  const uploadFileToFirebase = async (fileUri: string) => {
    try {
      const response = await fetch(fileUri)
      const blob = await response.blob()
      const fileName = fileUri.split('/').pop() // Get file name from URI
      const storageRef = ref(storage, `uploads/${fileName}`)

      // Upload the file
      await uploadBytes(storageRef, blob)

      // Get the file's download URL
      const downloadURL = await getDownloadURL(storageRef)
      return downloadURL
    } catch (error) {
      console.error('File upload error:', error)
      return null
    }
  }

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Allow all file types
        copyToCacheDirectory: true,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri // Access the file URI
        const fileType = result.assets[0].mimeType || '' // Get file type (if available)
        const fileName = result.assets[0].name // Get the actual file name
        const fileUrl = await uploadFileToFirebase(fileUri) // Upload to Firebase

        // Update state based on file type
        if (fileType.includes('image/')) {
          setImagePath(fileUrl || '')
          setFileType(fileType)
          setFileName(fileName || '')
          setIsAttachImage(true)
        } else {
          setFilePath(fileUrl || '')
          setFileType(fileType)
          setFileName(fileName || '')
          setIsAttachFile(true)
        }

        return fileUrl // Return the uploaded file URL
      }

      return null // Return null if no file was picked
    } catch (error) {
      console.error('Error picking file:', error)
      return null
    }
  }

  const shareFile = async () => {
    const fileUrl = await pickFile() // Pick and upload a file
    if (fileUrl) {
      console.log('File uploaded and available at:', fileUrl)
    } else {
      console.log('No file selected or upload failed.')
    }
    return fileUrl
  }

  return {
    isAttachImage,
    isAttachFile,
    imagePath,
    filePath,
    fileType,
    fileName,
    pickFile,
    shareFile,
    resetState,
    setFilePath,
    setImagePath,
  }
}

export default useFileUpload
