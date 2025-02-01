import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-react-native'
import * as tflite from '@tensorflow/tfjs-tflite'
import { Asset } from 'expo-asset'
import * as FileSystem from 'expo-file-system'
import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import RNFS from 'react-native-fs'
const App = () => {
  const MODEL_PATH = `${FileSystem.documentDirectory}64.tflite`
  const MODEL_PATH_RNFS = `${RNFS.DocumentDirectoryPath}64.tflite`

  const [modelLoaded, setModelLoaded] = useState(false)
  const [progress, setProgress] = useState(0)

  // Track progress
  // const callback = (downloadProgress: {
  //   totalBytesWritten: number
  //   totalBytesExpectedToWrite: number
  // }) => {
  //   const progress =
  //     downloadProgress.totalBytesWritten /
  //     downloadProgress.totalBytesExpectedToWrite
  //   setProgress(progress)
  // }

  const loadModel = async () => {
    await tf.ready() // Ensure TensorFlow.js is ready
    // Copy model from assets to app storage

    const fileInfo = await FileSystem.getInfoAsync(MODEL_PATH)

    // const modelAsset = require('../assets/model/64.tflite')

    // await FileSystem.copyAsync({ from: modelAsset, to: MODEL_PATH })
    // await FileSystem.downloadAsync(modelAsset, MODEL_PATH)
    // await modelAsset.downloadAsync();

    const modelAsset = Asset.fromModule(require('../assets/model/64.tflite'))
    // console.log('copying model')
    // const modelUri = modelAsset.uri
    // console.log(modelAsset.uri)
    // if (!modelUri) {
    //   console.error('Failed to load model from asset')
    //   return
    // }
    // const downloadResumable = FileSystem.createDownloadResumable(
    //   modelUri,
    //   MODEL_PATH,
    //   {},
    //   callback,
    // )

    try {
      // await modelAsset.downloadAsync();
      // await downloadResumable.downloadAsync()

      if (fileInfo.exists) {
        console.log(MODEL_PATH_RNFS)
        const modelData = await RNFS.readFile(MODEL_PATH_RNFS, 'base64')
        // Load TFLite model
        // const model = await tflite.loadTFLiteModel(MODEL_PATH_RNFS)
        const model = await tflite.loadTFLiteModel(modelData)
        // const sds = await tf.loadLayersModel(MODEL_PATH_RNFS)

        const modelPath = MODEL_PATH.replace('file://', '')
        console.log('Using model path:', modelPath) // Check the model path without 'file://'
        // const model = await tflite.loadTFLiteModel(Path)

        setModelLoaded(true)
        console.log('model loaded')
      }
      // await FileSystem.copyAsync({ from: modelUri, to: MODEL_PATH })
    } catch (error) {
      console.log(error)
    }

    // const model = 'sd'
    // return model
  }

  useEffect(() => {
    ;(async () => {
      const model = await loadModel()
      // if (model) {
      //   setModelLoaded(true)
      // }
    })()
  }, [])

  return (
    <View className="flex-1 items-center justify-center">
      <Text>{modelLoaded ? 'Model Loaded!' : 'Loading Model...'}</Text>
      <Text>{progress}</Text>
    </View>
  )
}

export default App
