// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'

import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import 'firebase/storage' // For Firebase Storage
import { getStorage } from 'firebase/storage'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBky4RWkOhu--PTGZ8H4IULh0HTj4yLVRk',
  authDomain: 'firestore-crud-a0796.firebaseapp.com',
  projectId: 'firestore-crud-a0796',
  storageBucket: 'firestore-crud-a0796.appspot.com',
  messagingSenderId: '249850920425',
  appId: '1:249850920425:web:c7111501d3f82829f19f78',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { auth, db, storage }
