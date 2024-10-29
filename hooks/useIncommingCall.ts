import {
  DocumentData,
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { auth, db } from '../config' // Adjust this import path as needed

const useIncomingCall = () => {
  const [incomingCall, setIncomingCall] = useState<DocumentData | null>(null)
  const [callId, setCallId] = useState('')

  const userId = auth.currentUser?.uid

  useEffect(() => {
    const q = query(collection(db, 'calls'), where('to', '==', userId))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const callData = snapshot.docs[0].data()
        setCallId(snapshot.docs[0].id)
        setIncomingCall(callData)
      } else {
        setIncomingCall(null)
      }
    })

    return () => unsubscribe() // Cleanup listener on unmount
  }, [userId])

  return { incomingCall, callId }
}

export default useIncomingCall
