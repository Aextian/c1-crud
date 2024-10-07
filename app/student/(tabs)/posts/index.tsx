import { db } from '@/config'
import useAuth from '@/hooks/useAuth'
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

// interface Post {
//   id: string
//   uid: string
//   posts: string
// }

const index = () => {
  const images = [
    { uri: 'https://via.placeholder.com/300/FF5733/FFFFFF?text=Image+1' },
    { uri: 'https://via.placeholder.com/300/33FF57/FFFFFF?text=Image+2' },
    { uri: 'https://via.placeholder.com/300/3357FF/FFFFFF?text=Image+3' },
    { uri: 'https://via.placeholder.com/300/FFC300/FFFFFF?text=Image+4' },
    { uri: 'https://via.placeholder.com/300/581845/FFFFFF?text=Image+5' },
  ]

  const cards = Array.from({ length: 5 })

  // State to manage likes and comments
  const [likes, setLikes] = useState(Array(cards.length).fill(false)) // To track likes
  const [comments, setComments] = useState(Array(cards.length).fill('')) // To track comments
  const [post, addPost] = useState('')
  const [posts, setPosts] = useState<any>([])

  const { currentUser, loading } = useAuth()

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, 'posts'), {
        createdAt: new Date().toISOString(),
        authorId: currentUser.uid, // Store the UID of the author
        authorName: currentUser.displayName || 'Anonymous', // Store the author's name
        post: post,
        likes: 0,
        comment: 0,
        status: false,
      })
      alert('Post added successfully')
      addPost('')
    } catch (error) {
      console.error('Error adding post: ', error)
      alert('Post added error')
    }
  }

  // Fetch posts from Firestore
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setPosts(postsData)
      // setLoading(false);
    })

    return () => unsubscribe() // Cleanup the subscription on unmount
  }, [])

  // Function to toggle likes
  const toggleLike = (index: number) => {
    const newLikes = [...likes]
    newLikes[index] = !newLikes[index] // Toggle like status
    setLikes(newLikes)
  }

  // Function to handle comment change
  const handleCommentChange = (text: string, index: number) => {
    const newComments = [...comments]
    newComments[index] = text // Update the comment for the respective card
    setComments(newComments)
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View>
        <TextInput
          editable
          placeholder="Add a post..."
          multiline
          numberOfLines={4}
          maxLength={40}
          onChangeText={(post) => addPost(post)}
          value={post}
          style={{ padding: 10 }}
        />
        <Button title="Post" onPress={handleSubmit} />
      </View>
      {/* view carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.carousel}
      >
        {images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={image} style={styles.image} resizeMode="cover" />
          </View>
        ))}
      </ScrollView>
      {/* post content*/}
      <View style={styles.content}>
        {posts.map((post, index) => (
          <View key={index} style={styles.card}>
            <Text className="text-2xl font-bold ">
              {post.authorName} hahahah
            </Text>
            <Text style={styles.cardContent}>{post.post}</Text>

            {/* Reaction (Like) Section */}
            <TouchableOpacity
              onPress={() => toggleLike(index)}
              style={styles.likeButton}
            >
              <Text style={styles.likeText}>
                {likes[index] ? '❤️ Liked' : '🤍 Like'}
              </Text>
            </TouchableOpacity>

            {/* Comment Section */}
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              value={comments[index]}
              onChangeText={(text) => handleCommentChange(text, index)}
            />
            <Button
              title="Submit Comment"
              onPress={() =>
                alert(`Comment on Card ${index + 1}: ${comments[index]}`)
              }
            />
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    marginBottom: 10,
  },
  content: {
    marginBottom: 20,
    padding: 16,
  },
  contentText: {
    fontSize: 18,
    marginBottom: 10,
  },
  carousel: {
    marginTop: 15,
    flexDirection: 'row',
  },
  imageContainer: {
    // width: 300,
    height: 200,
    marginRight: 10,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 10,
  },
  card: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 16,
    color: '#333',
  },
  likeButton: {
    marginVertical: 10,
  },
  likeText: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
})

export default index
