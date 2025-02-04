import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

const InChatFileTransfer = ({ filePath }: any) => {
  var fileType = ''
  var name = ''
  if (filePath !== undefined) {
    name = filePath.split('/').pop()
    fileType = filePath.split('.').pop()
  }
  return (
    <View>
      <View style={styles.frame}>
        <Image
          source={
            fileType === 'pdf'
              ? require('../../assets/images/chat_file.png')
              : require('../../assets/images/unknown_file.png')
          }
          style={{ height: 40, width: 40 }}
        />
        <View>
          <Text style={styles.text}>file</Text>
        </View>
      </View>
    </View>
  )
}
export default InChatFileTransfer

const styles = StyleSheet.create({
  text: {
    color: 'black',
    marginTop: 10,
    fontSize: 16,
    lineHeight: 20,
    marginLeft: 5,
    marginRight: 5,
  },
  textType: {
    color: 'black',
    marginTop: 5,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  frame: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderRadius: 10,
    padding: 5,
    marginTop: -4,
  },
})
