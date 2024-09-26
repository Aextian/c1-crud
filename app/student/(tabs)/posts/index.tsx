import React, { useState } from 'react'
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

  // Function to toggle likes
  const toggleLike = (index) => {
    const newLikes = [...likes]
    newLikes[index] = !newLikes[index] // Toggle like status
    setLikes(newLikes)
  }

  // Function to handle comment change
  const handleCommentChange = (text, index) => {
    const newComments = [...comments]
    newComments[index] = text // Update the comment for the respective card
    setComments(newComments)
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
        {cards.map((_, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardHeader}>Content Title {index + 1}</Text>
            <Text style={styles.cardContent}>
              This is a lot of content that should be scrollable vertically. You
              can add more paragraphs or components here to see the effect of
              scrolling.
            </Text>

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
