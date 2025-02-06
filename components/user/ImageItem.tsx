import { Link } from 'expo-router' // Adjust if you're using a different routing method
import React from 'react'
import { Image, TouchableOpacity } from 'react-native'

const ImageItem = ({
  imageUrl,
  index,
  imageUrls,
}: {
  imageUrl: string
  index: number
  imageUrls: string[]
}) => {
  if (!imageUrl) return null // Handle case where there's no image URL

  // console.log('Image URL:', JSON.stringify(imageUrls))

  return (
    <Link
      key={index}
      href={{
        pathname: 'user/modal/image-modal',
        params: {
          image: encodeURIComponent(imageUrl),
          index: index,
          imageUrls: encodeURIComponent(JSON.stringify(imageUrls)), // Encode the full string
        }, // Encode the image URL
      }}
      asChild
    >
      <TouchableOpacity>
        <Image
          source={{ uri: imageUrl }} // Use imageUrl here
          style={{
            marginHorizontal: 10,
            width: 320, // Set width for each image
            height: 300, // Set height for each image
            borderRadius: 10, // Optional: Adds rounded corners
          }}
          resizeMode="cover" // Ensure the image scales correctly
        />
      </TouchableOpacity>
    </Link>
  )
}

export default ImageItem
