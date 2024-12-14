import {
  DocumentData,
  collection,
  doc,
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

  const listenForIncomingCalls = (callId: string) => {
    const groupCallDoc = doc(db, 'groupChats', callId)
    const unsubscribe = onSnapshot(groupCallDoc, (docSnapshot) => {
      const data = docSnapshot.data()
      if (data?.callStarted && data.startedBy !== userId) {
        // Notify the user of an incoming call
        setIncomingCall(data)
        // alert(`Incoming call from ${data.startedBy}`)
        // Optionally, open the call UI here or trigger a ringtone
      }
    })

    return unsubscribe
  }

  return { incomingCall, callId, listenForIncomingCalls }
}

export default useIncomingCall
