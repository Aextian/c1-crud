import { auth, db } from '@/config'
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'

const useRole = () => {
  const currentUser = auth?.currentUser
  const [role, setRole] = useState('')
  const [course, setCourse] = useState('')
  const [year, setYear] = useState('')

  const documentRef = getDoc(doc(db, 'users', String(currentUser?.uid)))

  useEffect(() => {
    documentRef.then((docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data()
        setRole(userData.role)
        setCourse(userData.course)
        setYear(userData.year)
      }
    })
  }, [currentUser])

  return { role, year, course }
}

export default useRole
