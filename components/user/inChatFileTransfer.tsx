import { Feather } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

type IChatFile = {
  fileName: string
}
const InChatFileTransfer = ({ fileName }: IChatFile) => {
  return (
    <View style={styles.frame}>
      <Feather name="file" size={24} color={'3a8dbe4'} />
      <View className="overflow-hidden items-center justify-center">
        <Text
          className="truncate text-xs text-center justify-center items-center"
          numberOfLines={1}
        >
          {fileName}
        </Text>
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
