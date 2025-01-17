import { auth, db } from '@/config'
import { DocumentData, collection, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'

const useUser = () => {
  const [users, setUsers] = useState<DocumentData[]>()
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

  return { users }
}

export default useUser
