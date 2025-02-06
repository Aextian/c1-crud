import { Feather } from '@expo/vector-icons'
import { DocumentData } from 'firebase/firestore'
import React, { useState } from 'react'
import { Image, Pressable, Text, View } from 'react-native'

const CommentSubReply = ({ commentReply }: { commentReply: DocumentData }) => {
  const [viewComment, setViewComment] = useState(false)

  return (
    <View className="flex flex-row gap-5 px-10 my-5">
      <View className="rounded-full w-8 h-8 border p-3 items-center justify-center">
        {commentReply?.authorAvatar &&
        commentReply.authorAvatar !== 'undefined' ? (
          <Image
            source={{ uri: commentReply?.authorAvatar }}
            style={{ width: 30, height: 30, borderRadius: 100 }}
          />
        ) : (
          <Feather name="user" size={24} color="black" />
        )}
      </View>

      <View className="justify-center">
        <Text className="font-bold text-xs">{commentReply.author}</Text>
        <Pressable onPress={() => setViewComment(!viewComment)}>
          <Text
            className="text-gray-500 pr-12"
            numberOfLines={viewComment ? 1 : undefined}
          >
            {commentReply.comment}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

export default CommentSubReply
