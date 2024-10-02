import { auth } from '@/config'
import { useEffect, useState } from 'react'

const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<any>(null) // Adjust the type based on your user object
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
