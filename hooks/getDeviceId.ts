import * as Application from 'expo-application'
import { Platform } from 'react-native'

export const getDeviceId = async () => {
  if (Platform.OS === 'android') {
    return Application.getAndroidId() // Unique for each installation
  } else {
    const iosId = await Application.getIosIdForVendorAsync()
    return iosId // Unique per vendor (Apple ID)
  }
}
