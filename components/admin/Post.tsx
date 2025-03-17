import { auth, db } from '@/config'
import { formatDate } from '@/utils/date-utils'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Link } from 'expo-router'
import {
  DocumentData,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore'
import React, { useEffect } from 'react'

import addNotifications from '@/hooks/useNotifications'
import { ResizeMode, Video } from 'expo-av'
import {
  FlatList,
  Image,
  Linking,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import ImageItem from '../user/ImageItem'

const Post = ({ item, index }: { item: any; index: number }) => {
  const currentUser = auth?.currentUser

  // Function to update status
  const handleApprove = async (id: string) => {
    try {
      const docRef = doc(db, 'posts', id) // Reference to the document
      await updateDoc(docRef, { status: true }) // Update the status field
      addNotifications({
        fromUserId: currentUser?.uid || '',
        postId: id,
        type: 'approved',
      })
    } catch (error) {
      console.error('Error updating status: ', error)
    }
  }

  // Function to delete a document
  const handleReject = async (id: string) => {
    try {
      await addNotifications({
        fromUserId: currentUser?.uid || '',
        postId: id,
        type: 'reject',
      })

      const docRef = doc(db, 'posts', id) // Reference to the document
      await deleteDoc(docRef) // Delete the document
    } catch (error) {
      console.error('Error deleting document: ', error)
    }
  }

  useEffect(() => {
    const fetchFavorites = async () => {
      if (currentUser) {
        const favoriteDocRef = doc(db, 'favorites', currentUser?.uid)
        const docSnapshot = await getDoc(favoriteDocRef)
        if (docSnapshot.exists()) {
          const favorites = docSnapshot.data().favorites || []
        } else {
        }
      }
    }

    fetchFavorites()

    const totalCommentsReplies = item?.comments
      ? item.comments.length +
        item.comments.flatMap(
          (comment: { replies: DocumentData[] }) => comment.replies || [],
        ).length
      : 0
  }, [item?.likes, item?.dislikes, item?.id, item?.comments, currentUser?.uid])

  const imageUrls = item.imageUrls

  const fileUrls = [...item.videoUrls, ...imageUrls]

  return (
    <LinearGradient
      key={index}
      style={{
        borderTopRightRadius: 40,
        borderTopLeftRadius: 40,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        marginBottom: 20,
        marginHorizontal: 5,
      }}
      colors={['transparent', 'white']}
      className="border-b border-b-slate-200 flex  shadow"
    >
      <View className="flex flex-row justify-between py-2 mt-5 px-5 ">
        <View className="flex flex-row items-center justify-start gap-2">
          <View className="rounded-full w-12 h-12 border-[4px] bg-gray-200 border-white  items-center justify-center">
            {item?.authorAvatar && item?.authorAvatar !== 'undefined' ? (
              <Image
                source={{ uri: item?.authorAvatar }}
                style={{ width: '100%', height: '100%', borderRadius: 100 }}
              />
            ) : (
              <Feather name="user" size={16} color="black" />
            )}
          </View>
          <Link
            href={{
              pathname: '/user/(profile)',
              params: { id: item.authorId },
            }}
            asChild
          >
            <TouchableOpacity>
              <Text className="font-semibold">{item.authorName}</Text>
              <Text className="text-[8px] text-gray-500">
                {formatDate(item.createdAt)}
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <View className="my-5 ">
        <View className="px-10">
          <Link
            href={{
              pathname: '/user/(posts)/view-post',
              params: { id: item.id },
            }}
            asChild
          >
            <Pressable>
              <Text className="text-black leading-loose">{item.post} </Text>
            </Pressable>
          </Link>

          {item.file.url !== '' && (
            <TouchableOpacity
              className=" p-2 w-8/12 mt-5 mb-5 rounded-xl  border border-gray-300"
              onPress={() => Linking.openURL(item.file.url)}
            >
              <View className="flex flex-row items-center gap-2">
                <Feather name="file" size={24} color={'3a8dbe4'} />
                <Text className="text-xs font-semibold">{item.file.name}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={fileUrls} // Your data array
          keyExtractor={(item, index) => index.toString()} // Ensure unique keys
          renderItem={({ item, index }) => (
            <View
              key={index}
              style={{
                flex: 1,
                width: '48%',
                margin: 5,
                height: fileUrls.length > 3 ? 250 : 350,
              }}
            >
              {item.includes('images') ? (
                <ImageItem imageUrls={fileUrls} imageUrl={item} index={index} />
              ) : (
                <Video
                  source={{ uri: item }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 10, // Optional: Adds rounded corners
                  }} // Explicit width & height
                  useNativeControls
                  resizeMode={ResizeMode.STRETCH}
                  shouldPlay={false} // Don't autoplay
                  isLooping={false}
                />
              )}
            </View>
          )}
          numColumns={fileUrls.length > 3 ? 3 : 2} // Set number of columns
          columnWrapperStyle={{ justifyContent: 'space-between' }} // Ensure even spacing
          contentContainerStyle={{ paddingHorizontal: 5, paddingVertical: 10 }}
          showsHorizontalScrollIndicator={false} // Hides the scrollbar for cleaner look
          showsVerticalScrollIndicator={false}
        />

        <View className="flex flex-row items-center justify-around gap-5 mt-10">
          <TouchableOpacity
            className="bg-green-400 p-3 rounded-lg"
            onPress={() => handleApprove(item.id)}
          >
            <Text className="text-lg text-white">
              <Feather name="check" size={24} color={'#fff'} />
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-400 p-3 rounded-lg"
            onPress={() => handleReject(item.id)}
          >
            <Text className="text-lg text-white">
              <Feather name="x" size={24} color={'#fff'} />
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  )
}

export default Post
