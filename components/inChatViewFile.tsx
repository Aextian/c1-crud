import React from 'react'
import { Linking, Modal, Text, TouchableOpacity, View } from 'react-native'
import Pdf from 'react-native-pdf'

function InChatViewFile({ url, onClose }) {
  // const { currentMessage } = props
  const isShowPdf = url !== '' ? true : false
  const PdfResource = {
    uri: url,
    cache: true,
  }
  return (
    <Modal
      visible={isShowPdf}
      onRequestClose={onClose}
      animationType="slide"
      style={{ height: 600 }}
    >
      <View style={{ flex: 1, padding: 20 }}>
        <Pdf
          source={PdfResource}
          trustAllCerts={false}
          style={{ height: '100%', width: '100%' }}
        />
        <View className="absolute items-center p-5  justify-between flex-row w-full top-36 left-0 ">
          <TouchableOpacity onPress={onClose}>
            <Text className="text-lg font-semibold">X</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-green-300 p-2 rounded-xl"
            onPress={() => Linking.openURL(PdfResource.uri)}
          >
            <Text className="text-black">Download File</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}
export default InChatViewFile
