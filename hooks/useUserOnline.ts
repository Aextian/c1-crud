import { auth, db } from '@/config'
import database from '@react-native-firebase/database'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'

// Function to set user online or offline status in Firestore
const setUserOnlineFirestore = () => {
  const user = auth.currentUser

  if (!user) return // Exit if no user is logged in

  // Reference to the user's status document in Firestore
  const userStatusFirestoreRef = doc(db, 'status', user.uid)

  // Data structure to save online and offline status
  const isOfflineForFirestore = {
    state: 'offline',
    last_changed: serverTimestamp(),
  }

  const isOnlineForFirestore = {
    state: 'online',
    last_changed: serverTimestamp(),
  }

  // Listen to connection state from Firebase Realtime Database
  const connectedRef = database().ref('.info/connected')
  connectedRef.on('value', (snapshot) => {
    if (snapshot.val() === false) {
      // User is offline (disconnected)
      return
    }

    // When connected, set up `onDisconnect` in Realtime Database
    const userStatusRealtimeRef = database().ref(`/status/${user.uid}`)

    userStatusRealtimeRef
      .onDisconnect()
      .set(isOfflineForFirestore) // Mark the user as offline when disconnected
      .then(() => {
        // Set user as online in Firestore when connected
        setDoc(userStatusFirestoreRef, isOnlineForFirestore)
      })
  })
}

export default setUserOnlineFirestore
