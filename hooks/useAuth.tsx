import { auth, db } from '@/config'
import { DocumentData, doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'

const useAuth = () => {
  // const [currentUser, setCurrentUser] = useState<DocumentData | null>(null) // Adjust the type based on your user object
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<DocumentData | null>(null)

  const currentUser = auth.currentUser

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      // setCurrentUser(user)
      setLoading(false)
    })
    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      const docRef = doc(db, 'users', String(currentUser?.uid))
      const userSnap = await getDoc(docRef) // Await the getDoc call
      if (userSnap.exists()) {
        const userData = userSnap.data()
        setUser(userData)
      }
    }
    fetchUser()
  }, [currentUser])

  return { currentUser, loading, user }
}

export default useAuth
