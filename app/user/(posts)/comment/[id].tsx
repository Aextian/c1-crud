import CommentCard from '@/components/user/CommentCard'
import { auth, db } from '@/config'
import addNotifications from '@/hooks/useNotifications'
import { FontAwesome } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import {
  DocumentData,
  addDoc,
  collection,
  onSnapshot,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated'

const CommentPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const currentUser = auth.currentUser
  const [comment, addComments] = useState('')
  const [comments, setComments] = useState<DocumentData[]>()

  // add comments
  const submitComment = async () => {
    // Ensure `id` exists and is valid
    if (!id) {
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
      await addDoc(collection(db, 'posts', id, 'comments'), data)

      // Add comment notification
      addNotifications({
        fromUserId: currentUser?.uid || '',
        postId: id,
        type: 'comment', // Specify the type of notification
        liketype: undefined, // Optional, not needed for comments
      })

      addComments('')
    } catch (error) {
      console.error('Error adding comment: ', error)
    }
  }

  //   get all comments
  useEffect(() => {
    const commentsCollectionRef = collection(
      db,
      'posts',
      String(id),
      'comments',
    )
    // Listen for real-time updates
    const unsubscribe = onSnapshot(commentsCollectionRef, (commentSnapshot) => {
      // Extract the comment data from each document
      const comments = commentSnapshot.docs.map((doc) => ({
        id: doc.id, // To keep track of individual comment IDs
        ...doc.data(), // Spread the document data into the object
      }))

      setComments(comments) // Assuming `setComments` updates your component's state
    })
    return unsubscribe
  }, [id])

  return (
    <Animated.View entering={FadeIn} style={{ flex: 1 }}>
      <Animated.View entering={SlideInDown} style={{ flex: 1 }}>
        <View
          className="px-10 rounded-lg"
          style={{ flex: 1, marginTop: 20, backgroundColor: 'white' }}
        >
          {comments?.map((comment, key) => (
            <CommentCard key={key} postId={id} comment={comment} />
          ))}
        </View>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <View className=" flex-row gap-5 justify-between px-10 bg-white ">
            <TextInput
              style={{
                height: 40,
                backgroundColor: 'white',
                borderRadius: 10,
              }}
              placeholderTextColor={'#999'}
              placeholder="Write a message..."
              autoFocus
              value={comment}
              onChangeText={(text) => addComments(text)}
            />
            <TouchableOpacity onPress={submitComment}>
              <FontAwesome name="send" size={24} color="#555" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Animated.View>
  )
}

export default CommentPage
