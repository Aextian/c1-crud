import { useRouter } from 'expo-router'
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { useRef, useState } from 'react'
import {
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
} from 'react-native-webrtc'
import { auth, db } from '../config'

const useGc = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>()
  const [remoteStreams, setRemoteStreams] = useState<{
    [userId: string]: MediaStream
  }>({})
  const [callId, setCallId] = useState('')
  const currentUser = auth.currentUser
  const router = useRouter()
  const pc = useRef<RTCPeerConnection | null>(new RTCPeerConnection({}))

  const STUN_SERVERS = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  }

  const startLocalStream = async () => {
    const constraints = {
      audio: true,
      video: {
        mandatory: {
          minWidth: 500,
          minHeight: 300,
          minFrameRate: 30,
        },
      },
    }

    try {
      const stream = await mediaDevices.getUserMedia(constraints)
      setLocalStream(stream)
      return stream // Return the stream to indicate it's ready
    } catch (error) {
      console.error('Error getting user media:', error)
      throw error // Throw to handle potential errors downstream
    }
  }

  const createCall = async (callId) => {
    const userId = currentUser?.uid

    if (!localStream) {
      console.error('Local stream is not available')
      return
    }

    const callDoc = doc(collection(db, 'rooms'), callId)
    const pc = new RTCPeerConnection(STUN_SERVERS)

    // Add the local stream to the peer connection
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream))

    // Listen for remote streams
    pc.addEventListener('track', (event) => {
      setRemoteStreamForUser(userId, event.streams[0]) // Handle remote stream
    })

    // Listen for ICE candidates and add them to Firestore under the participant's respective candidate array
    pc.addEventListener('icecandidate', (event) => {
      if (event.candidate) {
        const candidateData = event.candidate.toJSON()
        // Add to offerCandidates for the offerer
        updateDoc(callDoc, {
          [`signaling.offerCandidates.${userId}`]: arrayUnion(candidateData),
        })
      }
    })

    // Create an offer and set it as the local description (for User 1)
    const offerDescription = await pc.createOffer()
    await pc.setLocalDescription(offerDescription)

    // Add the new participant and update Firestore with the offer
    await setDoc(callDoc, {
      participants: {
        [String(userId)]: true,
      },
      offererId: userId,
      signaling: {
        offer: offerDescription.sdp,
      },
    })

    // Listen for updates to the call document in Firestore
    const unsubscribe = onSnapshot(callDoc, async (snapshot) => {
      const updatedRoomData = snapshot.data()
      const participants = updatedRoomData?.participants

      if (!updatedRoomData) {
        console.error('Room data is not available')
        return
      }

      if (!participants || typeof participants !== 'object') {
        console.error('Participants is not an object or is undefined')
        return
      }

      // Loop through the participant IDs (keys of the participants object)
      Object.keys(participants).forEach(async (participantId) => {
        if (participantId !== userId && pc) {
          console.log(participantId, 'participantId')

          // Look for the answer for this participant (e.g., answer_2, answer_3, etc.)
          const answerDescription =
            updatedRoomData.signaling[`answer_${participantId}`]

          if (answerDescription && !pc.remoteDescription) {
            try {
              const answer = new RTCSessionDescription({
                type: 'answer',
                sdp: answerDescription,
              })

              // Ensure remote description is set only once the offer has been processed
              if (
                pc.remoteDescription === null ||
                pc.remoteDescription.type === 'offer'
              ) {
                await pc.setRemoteDescription(answer)
                console.log(
                  `Remote description set for participant ${participantId}`,
                )
              } else {
                console.error(`Unable to set remote description: Invalid state`)
              }
            } catch (error) {
              console.error('Error setting remote description:', error)
            }
          }
        }
      })

      // Handle ICE candidates from other participants (answerCandidates)
      if (updatedRoomData.signaling?.answerCandidates) {
        Object.entries(updatedRoomData.signaling.answerCandidates).forEach(
          async ([participantId, candidates]) => {
            if (participantId !== userId) {
              // Add ICE candidates from other participants (not the offerer)
              for (const candidate of candidates) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(candidate))
                } catch (error) {
                  console.error('Error adding ICE candidate:', error)
                }
              }
            }
          },
        )
      }
    })

    return unsubscribe
  }

  const joinCall = async (callId) => {
    const userId = currentUser?.uid

    if (!localStream) {
      console.error('Local stream is not available')
      return
    }

    const callDoc = doc(collection(db, 'rooms'), callId)
    const pc = new RTCPeerConnection(STUN_SERVERS)

    // Add the local stream to the peer connection
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream))

    // Listen for remote streams
    pc.addEventListener('track', (event) => {
      setRemoteStreamForUser(userId, event.streams[0]) // Handle remote stream
    })

    // Listen for ICE candidates and add them to Firestore under the participant's respective candidate array
    pc.addEventListener('icecandidate', (event) => {
      if (event.candidate) {
        const candidateData = event.candidate.toJSON()
        // Add to answerCandidates for the answerer
        updateDoc(callDoc, {
          [`signaling.answerCandidates.${userId}`]: arrayUnion(candidateData),
        })
      }
    })

    // Get the call document snapshot to check for the offer
    const snapshot = await getDoc(callDoc)
    const updatedRoomData = snapshot.data()

    if (!updatedRoomData) {
      console.error('Room data is not available')
      return
    }

    // Check if there's a new offer from the caller (offerer)
    if (updatedRoomData.signaling?.offer && !pc.remoteDescription) {
      const offer = new RTCSessionDescription({
        type: 'offer',
        sdp: updatedRoomData.signaling.offer,
      })

      try {
        // Set remote description only if it's in a proper state
        await pc.setRemoteDescription(offer)
      } catch (error) {
        console.error('Error setting remote offer:', error)
      }
    }

    // Once remote description is set, create the answer
    const answerDescription = await pc.createAnswer()
    await pc.setLocalDescription(answerDescription)

    // Update the Firestore with the answer
    await updateDoc(callDoc, {
      // Merge the new participant without overwriting the existing ones
      participants: {
        [String(userId)]: true,
        ...updatedRoomData.participants, // Keep existing participants
      },
      [`signaling.answer_${userId}`]: answerDescription.sdp,
    })

    // Listen for updates to the call document in Firestore
    const unsubscribe = onSnapshot(callDoc, async (snapshot) => {
      const updatedRoomData = snapshot.data()

      if (!updatedRoomData) {
        console.error('Room data is not available')
        return
      }

      // Handle ICE candidates from offerCandidates (from the offerer)
      if (updatedRoomData.signaling?.offerCandidates) {
        // Ensure candidates are added only once the remote description is set
        updatedRoomData.signaling.offerCandidates.forEach(
          async (candidateData) => {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidateData))
            } catch (error) {
              console.error('Error adding offer candidate:', error)
            }
          },
        )
      }

      // Handle ICE candidates from answerCandidates (from the answerer)
      if (updatedRoomData.signaling?.answerCandidates) {
        // Ensure candidates are added only once the remote description is set
        updatedRoomData.signaling.answerCandidates.forEach(
          async (candidateData) => {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidateData))
            } catch (error) {
              console.error('Error adding answer candidate:', error)
            }
          },
        )
      }
    })

    return unsubscribe
  }

  const setRemoteStreamForUser = (userId, stream) => {
    setRemoteStreams((prevStreams) => ({ ...prevStreams, [userId]: stream }))
  }

  return {
    localStream,
    remoteStreams,
    createCall,
    joinCall,
    setCallId,
    callId,
    startLocalStream,
  }
}

export default useGc
