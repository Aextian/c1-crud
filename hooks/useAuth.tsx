import { auth } from '@/config'
import { DocumentData } from 'firebase/firestore'
import { useEffect, useState } from 'react'

const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<DocumentData | null>(null) // Adjust the type based on your user object
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user)
      setLoading(false)
    })
    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  return { currentUser, loading }
}

export default useAuth
