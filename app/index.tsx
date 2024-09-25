import { View, Text, Button, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link } from 'expo-router'
import { addDoc, collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db } from '../config'
import { getAllUsers } from '@/services/firebase/users';
import { FlatList } from 'react-native-reanimated/lib/typescript/Animated';
const index = () => {

  const [username, setName] = useState('');
  const [email, setEmail] = useState('');

  const create = () => {
    // Add a new document in collection "cities"

// delete data
    // deleteDoc(doc(db, "users",'123')).then(() => {
    //   console.log("Document updated written!");
    // }).catch((error) => {
    //   console.error("Error writing document: ", error);
    // })

    // update
    // updateDoc(doc(db, "users",'123'), {
    //   username: username,
    //   email: email,
    // }).then(() => {
    //   console.log("Document updated written!");
    // }).catch((error) => {
    //   console.error("Error writing document: ", error);
    // });
// delete
    // addDoc(collection(db, "users"), {
    //   username: username,
    //   email: email,
    // }).then(() => {
    //   console.log("Document successfully written!");
    // }).catch((error) => {
    //   console.error("Error writing document: ", error);
    // });
  }

  const [users, setUsers] = useState([]);


  useEffect(() => {
    // Fetch users when the component mounts
    const fetchUsers = async () => {
      try {
        const usersData = await getAllUsers();
        console.log(usersData)
        setUsers(usersData as any);
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };
    fetchUsers();
  }, []);

// edit
  //  const handleEditClick = (user) => {
  //   setEditingUserId(user.id);
  //   setUsername(user.username);
  //   setEmail(user.email);
  // };

  const renderUser = ({ item }: { item: any }) => (
    <View>
      <Text>{item.username}</Text>
      <Text>{item.email}</Text>
    </View>
  );



// sample fetch all posts for a specific user
// async function getPostsByUser(userId) {
//   const postsRef = collection(db, "posts");
//   const q = query(postsRef, where("userId", "==", userId));

//   const querySnapshot = await getDocs(q);
//   const posts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

//   return posts;
// }

// getPostsByUser("user1").then(posts => console.log(posts));

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>index</Text>
      <Link href={'/register'} asChild>
        <Button title='Register' />
      </Link>
      <Link href={'/one'} asChild>
        <Button title='One' />
      </Link>
      <TextInput value={username} onChangeText={(username) => { setName(username) }} placeholder='username' style={{ height: 40, borderColor: 'gray', borderWidth: 1 }} />
      <TextInput value={email} onChangeText={(email) => { setEmail(email) }} placeholder='email' style={{ height: 40, borderColor: 'gray', borderWidth: 1 }} />
      <Button title='Create' onPress={create} />

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        ListEmptyComponent={<Text>No users found</Text>}
      />
    </View>
  )
}

export default index
