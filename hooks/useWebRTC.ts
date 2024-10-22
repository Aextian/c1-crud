import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../config'

// Define the type for the PeerConnection
type PeerConnection = RTCPeerConnection

// Create an offer and save it to Firestore
const createOffer = async (peerConnection: PeerConnection): Promise<string> => {
  // Create an offer
  const offer = await peerConnection.createOffer()
  await peerConnection.setLocalDescription(offer)

  // Store the offer in Firestore
  const callDocRef = doc(collection(db, 'calls'))
  await setDoc(callDocRef, { offer: peerConnection.localDescription })

  return callDocRef.id // This call ID can be shared with another user
}

// Listen for an answer from Firestore
const listenForAnswer = (
  callId: string,
  peerConnection: PeerConnection,
): void => {
  const callDocRef = doc(db, 'calls', callId)
  onSnapshot(callDocRef, (snapshot) => {
    const data = snapshot.data()
    if (data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer)
      peerConnection.setRemoteDescription(answerDescription)
    }
  })
}

// Listen for ICE candidates and add them to Firestore
const addIceCandidate = (
  callId: string,
  peerConnection: PeerConnection,
): void => {
  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      const candidatesCollection = collection(db, 'calls', callId, 'candidates')
      await setDoc(doc(candidatesCollection), event.candidate.toJSON())
    }
  }
}

// Listen for remote ICE candidates from Firestore
const listenForICECandidates = (
  callId: string,
  peerConnection: PeerConnection,
): void => {
  const candidatesCollection = collection(db, 'calls', callId, 'candidates')
  onSnapshot(candidatesCollection, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const candidate = new RTCIceCandidate(change.doc.data())
        peerConnection.addIceCandidate(candidate)
      }
    })
  })
}

export { addIceCandidate, createOffer, listenForAnswer, listenForICECandidates }
