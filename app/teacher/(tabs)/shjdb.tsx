import React from 'react'
import { View } from 'react-native'
import Pdf from 'react-native-pdf'

const shjdb = () => {
  const PdfResource = {
    uri: 'https://firebasestorage.googleapis.com/v0/b/firestore-crud-a0796.appspot.com/o/uploads%2F10f819d6-7fad-46d5-8b41-ff0985818f92.pdf?alt=media&token=dda59d92-1bd4-43bf-8bf9-290288ab726d',
    cache: true,
  }

  return (
    <View style={{ flex: 1 }}>
      <Pdf
        style={{ height: '100%', width: '100%' }}
        trustAllCerts={false}
        source={PdfResource}
        onLoadComplete={(numberOfPages, filePath) => {
          console.log(`number of pages: ${numberOfPages}`)
        }}
      />
    </View>
  )
}

export default shjdb
