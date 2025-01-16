import { auth, db } from '@/config'
import { DocumentData, collection, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'

const useUser = () => {
  const [users, setUsers] = useState<DocumentData[]>()
  const currentUser = auth?.currentUser
  useEffect(() => {
    const usersCollection = collection(db, 'users')
    const unsubscribe = onSnapshot(usersCollection, (querySnapshot) => {
      const usersData = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((user) => user.id !== currentUser?.uid)
      setUsers(usersData)
    })
    return unsubscribe
  }, [])

  return { users }
}

export default useUser
