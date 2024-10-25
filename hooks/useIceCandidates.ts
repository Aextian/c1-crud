import { db } from '@/config'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { useEffect } from 'react'

const useIceCandidates = (callId, peerConnection) => {
  useEffect(() => {
    const getOfferCandidates = async () => {
      const q = query(
        collection(db, 'offerCandidates'),
        where('callId', '==', callId),
      )
      const candidatesSnapshot = await getDocs(q)

      // Add each candidate to the peer connection
      candidatesSnapshot.forEach((doc) => {
        const candidate = doc.data()
        peerConnection?.addIceCandidate(new RTCIceCandidate(candidate))
      })
    }

    const getAnswerCandidates = async () => {
      const q = query(
        collection(db, 'answerCandidates'),
        where('callId', '==', callId),
      )
      const candidatesSnapshot = await getDocs(q)

      // Add each candidate to the peer connection
      candidatesSnapshot.forEach((doc) => {
        const candidate = doc.data()
        peerConnection?.addIceCandidate(new RTCIceCandidate(candidate))
      })
    }

    getOfferCandidates()
    getAnswerCandidates()
  }, [callId, peerConnection, db])
}

export default useIceCandidates
