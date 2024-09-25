// src/services/firebase/users.js

import { collection, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
import {db} from "../../config";

// Function to get all users
export async function getAllUsers() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error; // Re-throw to handle it elsewhere if needed
  }
}

export async function updateUser(userId:string, updatedData:any) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updatedData);
    console.log("User successfully updated!");
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
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
