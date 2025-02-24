import { auth, db } from '@/config'
import addNotifications from '@/hooks/useNotifications'
import { FontAwesome } from '@expo/vector-icons'
import { addDoc, collection, doc, getDoc } from 'firebase/firestore'
import React, { useState } from 'react'
import { TextInput, TouchableOpacity, View } from 'react-native'

type TCommentReply = {
  postId: string
  commentId: string
}
const CommentReply = ({ postId, commentId }: TCommentReply) => {
  const currentUser = auth.currentUser
  const [comment, addComments] = useState('')

  const submitComment = async () => {
    // Ensure `id` exists and is valid
    if (!commentId) {
      console.error('Post ID is not defined')
      return
    }

    const data = {
      author: currentUser?.displayName || 'Anonymous',
      authorAvatar: currentUser?.photoURL,
      comment: comment,
      createdAt: new Date(),
    }

    try {
      await addDoc(
        collection(db, 'posts', postId, 'comments', commentId, 'replies'),
        data,
      )

      const commentRef = doc(db, 'posts', postId, 'comments', commentId)

      const commentSnap = await getDoc(commentRef)

      if (commentSnap.exists()) {
        // Add comment notification
        addNotifications({
          fromUserId: currentUser?.uid || '',
          toUserId: commentSnap.data()?.authorId,
          postId: postId,
          type: 'reply', // Specify the type of notification
          liketype: undefined, // Optional, not needed for comments
        })
      }

      addComments('')
    } catch (error) {
      console.error('Error adding comment: ', error)
    }
  }

  return (
    <View className=" flex-row gap-5 justify-between  rounded-xl border-slate-200 border px-2  w-8/12 ml-10 items-center bg-white ">
      <TextInput
        className=" py-1 "
        placeholderTextColor={'#999'}
        placeholder="Write a message..."
        autoFocus
        value={comment}
        onChangeText={(text) => addComments(text)}
      />
      <TouchableOpacity onPress={submitComment}>
        <FontAwesome name="send" size={17} color="#555" />
      </TouchableOpacity>
    </View>
  )
}

export default CommentReply
