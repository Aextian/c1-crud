import { db } from '@/config'
import { DocumentData, collection, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'

const useGradeLevel = <T>() => {
  const [years, setYears] = useState<DocumentData | T[]>([])
  const [sections, setSections] = useState<DocumentData | T[]>([])
  const [courses, setCourses] = useState<DocumentData | T[]>([])

  const yearCollectionRef = collection(db, 'years')
  const sectionsCollectionRef = collection(db, 'sections')
  const courseCollectionRef = collection(db, 'courses')

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

    const unsubscribeSection = onSnapshot(
      sectionsCollectionRef,
      (querySnapshot) => {
        const sectionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setSections(sectionsData)
      },
    )

    return () => {
      unsubscribeYear(), unsubscribeCourse(), unsubscribeSection()
    } // Cleanup the subscription on unmount
  }, [])

  return { years, sections, courses }
}

export default useGradeLevel
