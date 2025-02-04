import { auth, db } from '@/config'
import useDislike from '@/hooks/useDislike'
import useFavorite from '@/hooks/useFavorite'
import useLike from '@/hooks/useLike'
import { formatDate } from '@/utils/date-utils'
import { AntDesign, Feather, Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { doc, getDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
  FlatList,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import ImageItem from './ImageItem'
import PostOptions from './PostOptions'

const Post = ({ item, index }: { item: any; index: number }) => {
  const [showOptions, setShowOptions] = useState(false)
  const [commentCounts, setCommentCounts] = useState(0)
  const currentUser = auth?.currentUser
  const { isFavorite, toggleFavorite, setIsFavorite } = useFavorite()
  const { isLikes, toggleLike, setIsLikes } = useLike(item)
  const { isDislikes, toggleDislike, setIsDislikes } = useDislike(item)

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

  return (
    <View key={index} className="border-b border-b-slate-200 flex shadow">
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => setShowOptions(false)}
      />

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

      <View className="my-5">
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

export default Post
