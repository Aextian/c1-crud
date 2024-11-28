import { auth, db } from '@/config'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
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

const index = () => {
  const currentUser = auth?.currentUser

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
      // setLoading(false);
    })

    return () => unsubscribe() // Cleanup the subscription on unmount
  }, [])

  const router = useRouter()
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
                <TouchableOpacity onPress={() => handleApprove(post.id)}>
                  <Text className="text-lg ">
                    <Feather name="check" color={'green'} size={28} />
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleReject(post.id)}>
                  <Feather name="x" color={'red'} size={28} />
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

export default index
