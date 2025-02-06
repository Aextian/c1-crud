import { auth, db } from '@/config'
import addNotifications from '@/hooks/useNotifications'
import { Feather, FontAwesome } from '@expo/vector-icons'
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from 'expo-router'
import {
  DocumentData,
  addDoc,
  collection,
  onSnapshot,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated'

const CommentPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>()

  const currentUser = auth.currentUser
  const navigation = useNavigation()
  const [comment, addComments] = useState('')
  const [comments, setComments] = useState<DocumentData[]>()
  useFocusEffect(
    React.useCallback(() => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } })
      return () => {
        // Show the tab bar when leaving this screen
        navigation.getParent()?.setOptions({ tabBarStyle: styles.tabBar })
      }
    }, [navigation]),
  )

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
            <View key={key} className="flex flex-row gap-5 mt-10">
              <View className="rounded-full w-8 h-8 border p-3 items-center justify-center">
                {comment?.authorAvatar &&
                comment.authorAvatar !== 'undefined' ? (
                  <Image
                    source={{ uri: comment?.authorAvatar }}
                    style={{ width: 30, height: 30, borderRadius: 100 }}
                  />
                ) : (
                  <Feather name="user" size={24} color="black" />
                )}
              </View>

              <View className="justify-center">
                <Text className="font-bold text-xs">{comment.author}</Text>
                <Text className="text-gray-500 pr-12" numberOfLines={1}>
                  {comment.comment}
                </Text>
              </View>
            </View>
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

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute', // Make it absolute to position it correctly
    bottom: 10, // Position from the bottom
    left: 20, // Add left margin
    right: 20, // Add right margin
    justifyContent: 'space-between', // Space items evenly
    alignItems: 'center', // Center items vertically
    backgroundColor: '#fff', // Background color
    borderRadius: 25, // Rounded corners
    shadowColor: 'black', // Shadow color
    shadowOffset: { width: 0, height: 10 }, // Shadow offset
    shadowRadius: 10, // Shadow blur
    shadowOpacity: 0.1, // Shadow opacity
    elevation: 5, // Android shadow elevation
  },
})

export default CommentPage
