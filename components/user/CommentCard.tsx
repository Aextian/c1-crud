import { db } from '@/config'
import { Feather } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { collection, DocumentData, onSnapshot } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import CommentReply from './CommentReply'
import CommentSubReply from './CommentSubReply'

type TComment = {
  postId: string
  comment: DocumentData
}

const CommentCard = ({ postId, comment }: TComment) => {
  const [showReply, setShowReply] = useState(false)
  const [commentReplies, setCommentReplies] = useState<DocumentData[]>([])
  const [viewComment, setViewComment] = useState(false)
  const [showFullComment, setShowFullComment] = useState(false)
  const [viewReply, setViewReply] = useState(false)

  useEffect(() => {
    const commentsCollectionRef = collection(
      db,
      'posts',
      postId,
      'comments',
      comment.id,
      'replies',
    )
    // Listen for real-time updates
    const unsubscribe = onSnapshot(commentsCollectionRef, (commentSnapshot) => {
      // Extract the comment data from each document
      const commentReplies = commentSnapshot.docs.map((doc) => ({
        id: doc.id, // To keep track of individual comment IDs
        ...doc.data(), // Spread the document data into the object
      }))

      // get comment replies

      setCommentReplies(commentReplies) // Assuming `setComments` updates your component's state
    })
    return unsubscribe
  }, [postId])

  const replies = viewReply ? commentReplies : commentReplies.slice(0, 1)

  return (
    <View>
      <View className="flex flex-row gap-5 mt-10">
        <Link
          href={{
            pathname: '/user/(profile)',
            params: { id: comment.authorId },
          }}
        >
          <View className="rounded-full w-8 h-8 border p-3 items-center justify-center">
            {comment?.authorAvatar && comment.authorAvatar !== 'undefined' ? (
              <Image
                source={{ uri: comment?.authorAvatar }}
                style={{ width: 30, height: 30, borderRadius: 100 }}
              />
            ) : (
              <Feather name="user" size={24} color="black" />
            )}
          </View>
        </Link>

        <View className="justify-center">
          <Text className="font-bold text-xs">{comment.author}</Text>
          <Text
            className="text-gray-500 pr-12"
            numberOfLines={showFullComment ? undefined : 1}
          >
            {comment.comment}
          </Text>
          {comment.comment.length > 50 && ( // Show toggle only if comment is long
            <TouchableOpacity
              className="text-right"
              onPress={() => setShowFullComment(!showFullComment)}
            >
              <Text className="text-gray-500 font-semibold">
                {showFullComment ? 'Show Less' : 'Show More'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <TouchableOpacity className="ml-16 my-2">
        <Text
          className="text-sm text-slate-300"
          onPress={() => setShowReply(!showReply)}
        >
          Reply
        </Text>
      </TouchableOpacity>
      {replies.map((commentReply, key) => (
        <CommentSubReply key={key} commentReply={commentReply} />
      ))}
      {commentReplies.length > 1 && !viewReply && (
        <TouchableOpacity className="px-10" onPress={() => setViewReply(true)}>
          <Text className="text-slate-400">View or more replies</Text>
        </TouchableOpacity>
      )}

      {showReply && <CommentReply postId={postId} commentId={comment.id} />}
    </View>
  )
}

export default CommentCard
