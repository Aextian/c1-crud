import { db } from '@/config'
import { DocumentData, collection, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'

const useGradeLevel = <T>() => {
  const [years, setYears] = useState<DocumentData | T[]>([])
  const [sections, setSections] = useState<DocumentData | T[]>([])

  const yearCollectionRef = collection(db, 'years')
  const sectionsCollectionRef = collection(db, 'sections')

  useEffect(() => {
    const unsubscribeYear = onSnapshot(yearCollectionRef, (querySnapshot) => {
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setYears(postsData)
    })

    const unsubscribeCourse = onSnapshot(
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
      unsubscribeYear(), unsubscribeCourse()
    } // Cleanup the subscription on unmount
  }, [])

  return { years, sections }
}

export default useGradeLevel
