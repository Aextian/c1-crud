import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'

export const downloadFile = async (fileUrl: string, fileName: string) => {
  try {
    // Define the file path in the app's document directory
    const fileUri = `${FileSystem.documentDirectory}${fileName}`

    // Start the download
    const { uri } = await FileSystem.downloadAsync(fileUrl, fileUri)

    console.log('File downloaded to:', uri)

    // Share the downloaded file (optional)
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri)
    } else {
      alert('File downloaded but sharing is not available on this device.')
    }

    return uri
  } catch (error) {
    console.error('Error downloading file:', error)
    alert('Failed to download the file.')
    return null
  }
}
