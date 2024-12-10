import { db } from '@/config'
import { DocumentData, collection, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'

const useGradeLevel = <T>() => {
  const [years, setYears] = useState<DocumentData | T[]>([])
  const [courses, setCourses] = useState<DocumentData | T[]>([])

  const yearCollectionRef = collection(db, 'years')
  const courseCollectionRef = collection(db, 'years')
  useEffect(() => {
    const unsubscribeYear = onSnapshot(yearCollectionRef, (querySnapshot) => {
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setYears(postsData)
    })

    const unsubscribeCourse = onSnapshot(
      courseCollectionRef,
      (querySnapshot) => {
        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setCourses(postsData)
      },
    )

    return () => {
      unsubscribeYear(), unsubscribeCourse()
    } // Cleanup the subscription on unmount
  }, [])

  return { years, courses }
}

export default useGradeLevel
