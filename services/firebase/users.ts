// src/services/firebase/users.js

import {
  DocumentData,
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { auth, db } from '../../config'

// Function to get all users
export async function getAllUsers() {
  const [users, setUsers] = useState<DocumentData[]>([])
  const currentUser = auth?.currentUser
  useEffect(() => {
    // Set up real-time listener for users collection
    const usersRef = collection(db, 'users')

    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        const userData = snapshot.docs.map((doc) => doc.data())
        // Filter and update the users state with the real-time data
        setUsers(
          userData.filter(
            (user) => user.id !== currentUser?.uid && user.role !== 'admin', // Remove current user and admin users
          ),
        )
      },
      (error) => {
        console.error('Error fetching users:', error)
      },
    )

    // Clean up the listener on component unmount
    return () => unsubscribe()
  }, [currentUser?.uid]) // Re-run when currentUser changes

  return users
}

export async function updateUser(userId: string, updatedData: any) {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, updatedData)
    console.log('User successfully updated!')
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

// Handle Update User

// Function to add a user
// export async function addUser(username, email) {
//   try {
//     await addDoc(collection(db, "users"), { username, email });
//     console.log("User successfully added!");
//   } catch (error) {
//     console.error("Error adding user:", error);
//     throw error;
//   }
// }
