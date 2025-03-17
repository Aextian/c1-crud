import { commentFormatDate } from '@/utils/date-utils'
import { Feather } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { DocumentData } from 'firebase/firestore'
import React, { useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

const CommentSubReply = ({ commentReply }: { commentReply: DocumentData }) => {
  const [viewComment, setViewComment] = useState(false)

  return (
    <View className="flex flex-row gap-5 px-10 my-5">
      <Link
        href={{
          pathname: '/user/(profile)',
          params: { id: commentReply.authorId },
        }}
      >
        <View className="rounded-full w-8 h-8 border  items-center justify-center">
          {commentReply?.authorAvatar &&
          commentReply.authorAvatar !== 'undefined' ? (
            <Image
              source={{ uri: commentReply?.authorAvatar }}
              style={{ width: '100%', height: '100%', borderRadius: 100 }}
            />
          ) : (
            <Feather name="user" size={24} color="black" />
          )}
        </View>
      </Link>

      <View className="justify-center">
        <Text className="font-bold text-xs ">{commentReply.author}</Text>
        <Text className="text-[10px] text-slate-400">
          {commentFormatDate(commentReply.createdAt)}
        </Text>
        <Text
          // style={{ wordSpacing: 1, letterSpacing: 0.5 }}
          className="text-gray-500 pr-12  text-sm font-serif "
          numberOfLines={viewComment ? undefined : 1}
        >
          {commentReply.comment}
        </Text>
        {commentReply.comment.length > 50 && ( // Show toggle only if comment is long
          <TouchableOpacity
            className="text-right"
            onPress={() => setViewComment(!viewComment)}
          >
            <Text className="text-gray-500 font-semibold">
              {viewComment ? 'Show Less' : 'Show More'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default CommentSubReply
