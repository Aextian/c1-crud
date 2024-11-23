import { useCallback, useEffect, useState } from 'react'
import {
  PERMISSIONS,
  PermissionStatus,
  RESULTS,
  check,
  openSettings,
  request,
} from 'react-native-permissions'

export const usePermission = () => {
  const [cameraStatus, setCameraStatus] = useState<PermissionStatus>()
  const [microphoneStatus, setMicrophoneStatus] = useState<PermissionStatus>()

  const requestCameraPermission = useCallback(() => {
    switch (cameraStatus) {
      case RESULTS.BLOCKED:
        openSettings()
        break
      default:
        request(PERMISSIONS.ANDROID.CAMERA)
        break
    }
  }, [cameraStatus])

  const requestMicrophonePermission = useCallback(() => {
    switch (microphoneStatus) {
      case RESULTS.BLOCKED:
        openSettings()
        break
      default:
        request(PERMISSIONS.ANDROID.RECORD_AUDIO)
        break
    }
  }, [microphoneStatus])

  const checkPermission = useCallback(async () => {
    const camera = await check(PERMISSIONS.ANDROID.CAMERA)
    const microphone = await check(PERMISSIONS.ANDROID.RECORD_AUDIO)
    if (camera === RESULTS.DENIED) {
      requestCameraPermission()
    }
    if (microphone === RESULTS.DENIED) {
      requestMicrophonePermission()
    }
    setCameraStatus(camera)
    setMicrophoneStatus(microphone)
  }, [requestCameraPermission, requestMicrophonePermission])

  useEffect(() => {
    checkPermission()
  }, [checkPermission])

  return {
    cameraPermissionGranted: cameraStatus === RESULTS.GRANTED,
    microphonePermissionGranted: microphoneStatus === RESULTS.GRANTED,
    checkPermission,
    requestCameraPermission,
    requestMicrophonePermission,
  }
}
