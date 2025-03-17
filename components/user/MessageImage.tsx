import { Image } from 'expo-image'
import { useState } from 'react'
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import ImageZoom from 'react-native-image-pan-zoom'

interface Message {
  _id: string
  text?: string
  image: string // Image URL
  user: {
    _id: string
    name: string
    avatar?: string
  }
  createdAt: string | number | Date
}

const MessageImage = (props: any) => {
  const [visible, setVisible] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>('')

  const { currentMessage } = props

  const imageUrl = currentMessage.image

  // Show image in modal
  const showImage = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setVisible(true)
  }

  // Hide image modal
  const hideImage = () => {
    setSelectedImage('')
    setVisible(false)
  }

  return (
    <View>
      <TouchableOpacity onPress={() => showImage(imageUrl)}>
        <Image
          style={{ width: 200, height: 150, borderRadius: 10 }}
          source={{ uri: imageUrl }}
          contentFit="cover"
          transition={1000}
        />
      </TouchableOpacity>
      {visible && (
        <Modal transparent={true} visible={visible} onRequestClose={hideImage}>
          <View style={styles.modalContainer}>
            <Pressable style={StyleSheet.absoluteFill} onPress={hideImage} />
            <ImageZoom
              cropWidth={Dimensions.get('window').width}
              cropHeight={Dimensions.get('window').height}
              imageWidth={Dimensions.get('window').width}
              imageHeight={Dimensions.get('window').height}
            >
              <Image
                source={{ uri: selectedImage }}
                style={styles.image}
                contentFit="contain"
                transition={1000}
              />
            </ImageZoom>
          </View>
        </Modal>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    position: 'relative',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  image: {
    // width: '90%',
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  absoluteFill: {
    position: 'absolute',
  },
})

export default MessageImage
