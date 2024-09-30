import { auth, db } from '@/config'
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore'
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

interface Post {
  id: string
  uid: string
  posts: string
}

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
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any | null>(null)

  const onAuthStateChanged = (user: any | null) => {
    if (user) {
      setUser(user)
    } else {
      setUser(null)
    }
  }

  const getUserByUid = async () => {
    if (user) {
      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', user.uid),
      )
      try {
        const querySnapshot = await getDocs(userQuery)
        // Handle case where no user is found
        if (querySnapshot.empty) {
          setUserData(null)
          return
        }
        // Get the first user's data
        const userDoc = querySnapshot.docs[0]
        setUserData({ id: userDoc.id, ...userDoc.data() })
      } catch (error) {
        console.error('Error getting user: ', error)
      }
    }
  }

  useEffect(() => {
    const subcriber = auth.onAuthStateChanged(onAuthStateChanged)
    return subcriber
  }, [])

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, `posts`), {
        uid: user.uid,
        posts: posts,
        status: false,
      })
      console.log('Post added successfully')
      alert('Post added successfully')
    } catch (error) {
      console.error('Error adding post: ', error)
      alert('Post added error')
    }
  }

  const [posts, setPosts] = useState<Post[]>([])

  // Fetch posts from Firestore
  const fetchPosts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'posts'))
      const postsArray: Post[] = []
      querySnapshot.forEach((doc) => {
        // Push each document's data into the array
        const q = postsArray.push({ id: doc.id, ...doc.data() } as Post)
      })
      setPosts(postsArray)
    } catch (error) {
      console.error('Error fetching posts: ', error)
    }
  }

  // Use useEffect to fetch posts on component mount
  useEffect(() => {
    fetchPosts()
    getUserByUid()
  }, [user])

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
      {/* Your main content goes here */}
      <View style={styles.content}>
        {posts.map((post, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardHeader}>
              Content Title {index + 1} {post.uid}
            </Text>
            <Text style={styles.cardContent}>{post.posts}</Text>

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

        <Text style={styles.contentText}>
          This is a lot of content that should be scrollable vertically. You can
          add more paragraphs or components here to see the effect of scrolling.
        </Text>
        {/* Add more content to make it scrollable */}
        <Text style={styles.contentText}>More content...</Text>
        <Text style={styles.contentText}>More content...</Text>
        <Text style={styles.contentText}>More content...</Text>
        <Text style={styles.contentText}>More content...</Text>
        <Text style={styles.contentText}>More content...</Text>
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
