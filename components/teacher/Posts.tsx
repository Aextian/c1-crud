import { auth, db } from '@/config'
import { formatDate } from '@/utils/date-utils'
import { AntDesign, Feather } from '@expo/vector-icons'
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

const Posts = ({ item, index }: { item: any; index: number }) => {
  const [isLikes, setIsLikes] = useState(false)

  const currentUser = auth?.currentUser

  useEffect(() => {
    setIsLikes(item?.likes?.includes(currentUser?.uid))
  }, [item?.likes, currentUser?.uid])

  const toggleLike = async (index: number) => {
    const userId = currentUser?.uid // Get the current user's ID
    setIsLikes(!isLikes)
    if (!userId) {
      console.error('No user is logged in')
      return
    }

    if (!item) {
      console.error('Post not found at index:', index)
      return
    }

    // Get the reference to the post document
    const postRef = doc(db, 'posts', String(item.id))

    // Check if the current user has already liked the post
    const isLiked = item.likes.includes(userId)
    console.log('Item_id', isLiked)

    try {
      if (isLiked) {
        // If the user has already liked the post, remove the userId from the likes array
        await updateDoc(postRef, {
          likes: arrayRemove(userId), // Remove the userId from the likes array
          likesCount: item.likesCount - 1, // Optionally, decrement the likes count
        })
        console.log('Like removed successfully')
        setIsLikes(false)
      } else {
        // If the user hasn't liked the post, add the userId to the likes array
        await updateDoc(postRef, {
          likes: arrayUnion(userId), // Add the userId to the likes array
          likesCount: item.likesCount + 1, // Optionally, increment the likes count
        })
        console.log('Like added successfully')
        setIsLikes(true)
      }
    } catch (error) {
      console.error('Error updating like status: ', error)
    }
  }

  return (
    <View key={index} className="border-b border-b-slate-200 p-4">
      <View className="flex flex-row justify-between">
        <View className="flex flex-row items-center justify-start gap-2">
          <View className="rounded-full w-8 h-8 border p-3 items-center justify-center">
            {item?.authorAvatar ? (
              <Image
                source={{ uri: item?.authorAvatar }}
                style={{ width: 30, height: 30, borderRadius: 100 }}
              />
            ) : (
              <Feather name="user" size={24} color="black" />
            )}
          </View>
          <View>
            <Text className="font-semibold">{item.authorName}</Text>
            <Text className="text-[8px] text-gray-500">
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
        <Text>...</Text>
      </View>

      <View className="px-9 pb-10">
        <Text className="text-black leading-loose">{item.post} </Text>
        {item.imageUrl && (
          <Image
            source={{ uri: item.imageUrl }}
            className="h-72 w-64 rounded-3xl mt-2"
          />
        )}
        {/* Reaction (Like) Section */}
        <View className="flex flex-row items-center justify-start gap-5 relative">
          <TouchableOpacity
            onPress={() => toggleLike(index)}
            onLongPress={() => toggleLike(index)}
            // onLongPress={() => handleEmoticonPress(index)}
            //   style={styles.likeButton}
          >
            <View className="flex flex-row items-center gap-2 justify-center">
              <Text>
                <AntDesign name={isLikes ? 'like1' : 'like2'} size={24} />
              </Text>
              <Text className="text-lg font-semibold">{item?.likesCount}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => toggleLike(index)}
            onLongPress={() => toggleLike(index)}
            // onLongPress={() => handleEmoticonPress(index)}
            //   style={styles.likeButton}
          >
            <Text>
              <AntDesign name="dislike2" size={24} />
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              // @ts-ignore
              router.push(`/teacher/posts/comments/${item.id}`)
            }
          >
            <Feather name="message-circle" color={'gray'} size={28} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default Posts
