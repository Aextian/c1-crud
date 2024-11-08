// WebRTCService.js
import { db } from '@/config'
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import {
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
} from 'react-native-webrtc'

// Function to start the local stream (camera and microphone)
export const startLocalStream = async () => {
  try {
    const stream = await mediaDevices.getUserMedia({
      audio: true, // request audio
      video: {
        facingMode: 'user', // user-facing camera
        width: 640, // width of the video stream
        height: 480, // height of the video stream
      },
    })
    console.log('Local stream started')
    return stream
  } catch (error) {
    console.error('Error starting local stream:', error)
    throw error // Throw error if mediaDevices.getUserMedia fails
  }
}

// Create a new room and return its ID
export const createRoom = async () => {
  const roomRef = doc(collection(db, 'rooms'))
  const roomData = {
    offers: {},
    answers: {},
    iceCandidates: {},
  }
  await setDoc(roomRef, roomData)
  return roomRef.id
}

// Join an existing room and establish a WebRTC connection
// Function to join the room
export const joinRoom = async (
  roomId,
  peerId,
  localStream,
  addRemoteStream,
) => {
  const roomRef = doc(db, 'rooms', roomId)
  const roomDoc = await getDoc(roomRef)

  if (!roomDoc.exists()) {
    console.log('Room not found!')
    return
  }

  // Create a new peer connection
  const peerConnection = new RTCPeerConnection()

  // Add each track from the localStream to the peer connection
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream)
  })

  peerConnection.addEventListener('icecandidate', (e) => {
    if (e.candidate) {
      console.log('ICE Candidate:', e.candidate)
      sendIceCandidate(e.candidate, roomId, peerId)
    }
  })

  // Listen for remote stream
  peerConnection.addEventListener('track', (event) => {
    const newStream = event.streams[0]
    addRemoteStream(peerId, newStream)
  })

  // Create an offer
  const offer = await peerConnection.createOffer()

  // Set the local description with the offer
  await peerConnection.setLocalDescription(offer)

  // Store the offer in Firebase
  await updateDoc(roomRef, {
    [`offers.${peerId}`]: offer,
  })

  // Listen for an answer from the other peer
  listenForAnswer(roomId, peerId, peerConnection)

  // Listen for ICE candidates from the other peer
  listenForIceCandidates(roomId, peerId, peerConnection)
}

// Function to listen for the answer
const listenForAnswer = (roomId, peerId, peerConnection) => {
  const roomRef = doc(db, 'rooms', roomId)

  // Listen for the other peer's answer
  const unsubscribe = onSnapshot(roomRef, async (snapshot) => {
    const data = snapshot.data()
    if (data && data.answers && data.answers[peerId]) {
      const answer = data.answers[peerId]

      // Set the remote description (answer) after receiving it
      try {
        const answerDesc = new RTCSessionDescription(answer)
        await peerConnection.setRemoteDescription(answerDesc)
      } catch (error) {
        console.error('Error setting remote description', error)
      }
    }
  })
}

// Function to listen for ICE candidates
const listenForIceCandidates = (roomId, peerId, peerConnection) => {
  const iceCandidatesRef = collection(db, 'rooms', roomId, 'iceCandidates')

  // Listen for ICE candidates from the other peer
  const unsubscribe = onSnapshot(iceCandidatesRef, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const candidateData = change.doc.data()

        // Ensure the candidate is not from the same peer
        if (candidateData.peerId !== peerId) {
          const candidate = new RTCIceCandidate(candidateData.candidate)

          // Before adding the candidate, ensure the peer connection has a valid remote description
          if (peerConnection.remoteDescription) {
            peerConnection.addIceCandidate(candidate)
          } else {
            console.error(
              'Cannot add ICE candidate, remote description is null',
            )
          }
        }
      }
    })
  })
}

// Send ICE candidate to Firebase
const sendIceCandidate = (candidate, roomId, peerId) => {
  // You can serialize the candidate here before saving
  const candidateData = candidate.toJSON() // Serialize the candidate
  const iceCandidatesRef = collection(db, 'rooms', roomId, 'iceCandidates')
  setDoc(doc(iceCandidatesRef), {
    peerId, // Identify which peer is sending the candidate
    candidate: candidateData, // Store candidate as a JSON object
    timestamp: new Date(), // Optional timestamp
  })
}
