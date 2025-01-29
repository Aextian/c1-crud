import { auth, db } from '@/config'
import addNotifications from '@/hooks/useNotifications'
import { formatDate } from '@/utils/date-utils'
import { AntDesign, Feather, Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
  FlatList,
  Image,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import ImageItem from '../ImageItem'
import PostOptions from '../PostOptions'

const Posts = ({ item, index }: { item: any; index: number }) => {
  const [isLikes, setIsLikes] = useState(false)
  const [isDislikes, setIsDislikes] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [commentCounts, setCommentCounts] = useState(0)
  const currentUser = auth?.currentUser

  useEffect(() => {
    const fetchFavorites = async () => {
      if (currentUser) {
        const favoriteDocRef = doc(db, 'favorites', currentUser?.uid)
        const docSnapshot = await getDoc(favoriteDocRef)

        if (docSnapshot.exists()) {
          const favorites = docSnapshot.data().favorites || []
          setIsFavorite(favorites.includes(item.id)) // Check if the current item's ID is in the favorites
        } else {
          setIsFavorite(false) // Default to false if no favorites exist
        }
      }
    }

    // Set likes and dislikes states
    setIsLikes(item?.likes?.includes(currentUser?.uid))
    setIsDislikes(item?.dislikes?.includes(currentUser?.uid))

    // Fetch the favorites asynchronously
    fetchFavorites()

    // Set comment counts
    setCommentCounts(item?.comments?.length || 0)
  }, [item?.likes, item?.dislikes, item?.id, item?.comments, currentUser?.uid])

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

        addNotifications({
          fromUserId: currentUser?.uid || '',
          postId: item.id,
          type: 'like',
          liketype: 'like',
        })
        setIsLikes(true)
      }
    } catch (error) {
      console.error('Error updating like status: ', error)
    }
  }
  const toggleDislike = async (index: number) => {
    const userId = currentUser?.uid // Get the current user's ID
    setIsDislikes(!isDislikes)
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
    const isDisliked = item.dislikes.includes(userId)

    try {
      if (isDisliked) {
        // If the user has already liked the post, remove the userId from the likes array
        await updateDoc(postRef, {
          dislikes: arrayRemove(userId), // Remove the userId from the likes array
          dislikesCount: item.dislikesCount - 1, // Optionally, decrement the likes count
        })
        setIsDislikes(false)
      } else {
        // If the user hasn't liked the post, add the userId to the likes array
        await updateDoc(postRef, {
          dislikes: arrayUnion(userId), // Add the userId to the likes array
          dislikesCount: item.dislikesCount + 1, // Optionally, increment the likes count
        })
        addNotifications({
          fromUserId: currentUser?.uid || '',
          postId: item.id,
          type: 'like',
          liketype: 'disliked',
        })
        setIsDislikes(true)
      }
    } catch (error) {
      console.error('Error updating like status: ', error)
    }
  }
  const toggleFavorite = async (postId: number) => {
    setIsFavorite(!isFavorite)
    if (!currentUser) {
      console.error('No user is logged in')
      return
    }
    // Reference the user's favorites document
    const favoriteDocRef = doc(db, 'favorites', currentUser?.uid)

    try {
      // Check if the document exists
      const docSnapshot = await getDoc(favoriteDocRef)

      if (docSnapshot.exists()) {
        // Document exists, update it
        if (isFavorite) {
          // Remove the postId from the favorites array
          await updateDoc(favoriteDocRef, {
            favorites: arrayRemove(postId),
          })
        } else {
          // Add the postId to the favorites array
          await updateDoc(favoriteDocRef, {
            favorites: arrayUnion(postId),
          })
        }
      } else {
        // Document does not exist, create it
        await setDoc(favoriteDocRef, {
          favorites: [postId], // Initialize the favorites array with the postId
        })
      }
    } catch (error) {
      console.error('Error updating favorite status: ', error)
    }
  }

  return (
    <View key={index} className="border-b border-b-slate-200  shadow">
      {showOptions && <PostOptions data={item} />}

      <View className="flex flex-row justify-between py-2 mt-5 px-5 ">
        <View className="flex flex-row items-center justify-start gap-2">
          <View className="rounded-full w-12 h-12 border  items-center justify-center">
            {item?.authorData.avatar &&
            item?.authorData.avatar !== 'undefined' ? (
              <Image
                source={{ uri: item?.authorData.avatar }}
                style={{ width: '100%', height: '100%', borderRadius: 100 }}
              />
            ) : (
              <Feather name="user" size={16} color="black" />
            )}
          </View>
          <Link
            href={{
              pathname: '/user/(tabs)/posts/profile',
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
        {currentUser?.uid === item.authorId ? (
          <TouchableOpacity onPress={() => setShowOptions(!showOptions)}>
            <Text className="text-2xl font-bold">...</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={24} />
          </TouchableOpacity>
        )}
      </View>

      <View className="pb-10">
        <View className="px-10">
          <Text className="text-black leading-loose">{item.post} </Text>
          {item.file.url !== '' && (
            <TouchableOpacity
              className=" p-2 w-8/12 mt-5 mb-5 mx-auto rounded-xl  border border-gray-300"
              onPress={() => Linking.openURL(item.file.url)}
            >
              <View className="flex flex-row items-center gap-2">
                <Feather name="file" size={24} color={'green'} />
                <Text className="text-xs font-semibold">{item.file.name}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={item.imageUrls} // Your data array
          keyExtractor={(item) => item}
          renderItem={({ item, index }) => (
            <ImageItem imageUrl={item} index={index} />
          )}
          horizontal
          showsHorizontalScrollIndicator={false} // Hides the scrollbar for cleaner look
          contentContainerStyle={{
            paddingHorizontal: 10, // Adds padding at the beginning and end of the list
          }}
        />
        {/* Reaction (Like) Section */}
        <View className="flex px-5 py-2 flex-row items-center justify-start gap-5 relative">
          <TouchableOpacity
            onPress={() => toggleLike(index)}
            onLongPress={() => toggleLike(index)}
          >
            <View className="flex flex-row items-center gap-2 justify-center">
              <Text>
                <AntDesign name={isLikes ? 'like1' : 'like2'} size={16} />
              </Text>
              <Text className="text-lg font-semibold">{item?.likesCount}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => toggleDislike(index)}>
            <View className="flex flex-row items-center gap-2 justify-center">
              <Text>
                <AntDesign
                  name={isDislikes ? 'dislike1' : 'dislike2'}
                  size={16}
                />
              </Text>
              <Text className="text-lg font-semibold">
                {item?.dislikesCount}
              </Text>
            </View>
          </TouchableOpacity>

          <View className="flex flex-row items-center gap-2">
            <Link href={`/user/posts/comments/${item.id}`} asChild>
              <TouchableOpacity>
                <Feather name="message-circle" color={'gray'} size={20} />
              </TouchableOpacity>
            </Link>
            <Text className="text-lg font-semibold">{commentCounts}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default Posts
