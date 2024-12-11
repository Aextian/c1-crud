import { db } from '@/config'
import { Feather } from '@expo/vector-icons'
import {
  DocumentData,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

const managePosts = () => {
  const [posts, setPosts] = useState<any>([])
  // Fetch posts from Firestore
  const postsRef = collection(db, 'posts')

  useEffect(() => {
    const q = query(postsRef, where('status', '==', false))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setPosts(postsData)
    })

    return () => unsubscribe() // Cleanup the subscription on unmount
  }, [])

  // Function to update status
  const handleApprove = async (id: string) => {
    try {
      const docRef = doc(db, 'posts', id) // Reference to the document
      await updateDoc(docRef, { status: true }) // Update the status field
      console.log('Status updated successfully')
    } catch (error) {
      console.error('Error updating status: ', error)
    }
  }

  // Function to delete a document
  const handleReject = async (id: string) => {
    try {
      const docRef = doc(db, 'posts', id) // Reference to the document
      await deleteDoc(docRef) // Delete the document
      console.log('Document deleted successfully')
    } catch (error) {
      console.error('Error deleting document: ', error)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {posts.map((post: DocumentData, index: number) => (
          <View key={index} className="border-b border-b-slate-200 p-4">
            <View className="flex flex-row items-center justify-start gap-2">
              <View className="rounded-full w-8 h-8 border p-3 items-center justify-center">
                <Feather name="user" size={14} />
              </View>
              <View>
                <Text className="font-semibold">{post.authorName}</Text>
              </View>
            </View>
            <View className="px-9 pb-10">
              <Text className="text-black leading-loose">{post.post} </Text>
              {post.imageUrl && (
                <Image
                  source={{ uri: post.imageUrl }}
                  className="h-72 w-64 rounded-md"
                />
              )}
              {/* Reaction (Like) Section */}
              <View className="flex flex-row items-center justify-around gap-5 mt-10">
                <TouchableOpacity
                  className="bg-green-400 p-3 rounded-lg"
                  onPress={() => handleApprove(post.id)}
                >
                  <Text className="text-lg text-white">Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-red-400 p-3 rounded-lg"
                  onPress={() => handleReject(post.id)}
                >
                  <Text className="text-lg text-white">Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 5,
    paddingTop: 35,
    backgroundColor: '#fff',
  },

  header: {
    fontSize: 24,
    marginBottom: 10,
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

  cardHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
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

export default managePosts
