import { useRouter } from 'expo-router'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import { useRef, useState } from 'react'
import {
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from 'react-native-webrtc'
import { auth, db } from '../config'

// Define the type for the PeerConnection
type PeerConnection = RTCPeerConnection

const useVc = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>()
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>()
  const [callId, setCallId] = useState('')

  const currentUser = auth.currentUser
  let callStartTime: number | null = null

  console.log('start callingggg', callStartTime)

  const router = useRouter()
  // const pc = useRef(null) // RTCPeerConnection reference
  const pc = useRef<RTCPeerConnection>(new RTCPeerConnection({}))

  const formatDuration = (durationInMilliseconds: number) => {
    const totalSeconds = Math.floor(durationInMilliseconds / 1000) // Convert milliseconds to seconds
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `Call Duration: ${minutes}m ${seconds}s`
  }

  const servers = {
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

  const startCall = async (callId: string) => {
    try {
      if (!localStream) {
        console.error('Local stream is not available')
        return // Exit if localStream is not initialized
      }
      callStartTime = Date.now()

      // Initialize the peer connection if it's not already initialized
      pc.current ||= new RTCPeerConnection(servers)

      // Clear existing senders and add local stream tracks
      if (pc.current) {
        pc.current
          .getSenders()
          .forEach((sender) => sender.track && pc.current.removeTrack(sender))
        localStream.getTracks().forEach((track) => {
          pc.current.addTrack(track, localStream)
        })
      }

      // Firestore references
      const callDoc = doc(collection(db, 'calls'), callId)
      const offerCandidates = collection(callDoc, 'offerCandidates')
      const answerCandidates = collection(callDoc, 'answerCandidates')

      // Handle ICE candidates
      if (pc.current) {
        pc.current.addEventListener('icecandidate', (e) => {
          if (e.candidate) {
            setDoc(doc(offerCandidates), e.candidate.toJSON())
          } else {
            console.log('Got final candidate!')
          }
        })
      }

      // Stream remote tracks
      pc.current.addEventListener('track', (event) => {
        setRemoteStream(event.streams[0])
        console.log('Remote stream added:', event.streams[0])
      })

      // Create and set local offer description
      const offerDescription = await pc.current.createOffer({})
      await pc.current.setLocalDescription(offerDescription)

      // Fetch userCallId
      const conversationDoc = doc(db, 'conversations', callId)
      const docSnap = await getDoc(conversationDoc) // Await the getDoc call
      let userCallId = ''
      if (docSnap.exists()) {
        const usersId = docSnap.data().users
        userCallId = usersId.find((id: string) => id !== currentUser?.uid)
      }
      // Save offer and caller info to Firestore
      await setDoc(callDoc, {
        offer: {
          sdp: offerDescription.sdp,
          type: offerDescription.type,
        },
        from: auth.currentUser?.uid,
        to: userCallId,
        status: 'incoming',
      })

      // Listen for answer
      const unsubscribeAnswer = onSnapshot(callDoc, (snapshot) => {
        const data = snapshot.data()
        if (!data) {
          router.push(`/student/messages/conversations/${callId}`)
        }

        if (data?.answer && pc.current && !pc.current.remoteDescription) {
          const answerDescription = new RTCSessionDescription(data.answer)
          pc.current
            .setRemoteDescription(answerDescription)
            .then(() => console.log('Remote description set successfully'))
            .catch((error) =>
              console.error('Error setting remote description:', error),
            )
        }
      })

      // Listen for ICE candidates from the answerer
      const unsubscribeCandidates = onSnapshot(answerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data())
            if (pc.current) {
              // Check if pc.current is valid
              pc.current
                .addIceCandidate(candidate)
                .then(() => console.log('ICE candidate added successfully'))
                .catch((error) =>
                  console.error('Error adding ICE candidate:', error),
                )
            }
          }
        })
      })

      // Return cleanup function to unsubscribe from Firestore on unmount
      return () => {
        unsubscribeAnswer()
        unsubscribeCandidates()
      }
    } catch (error) {
      console.error('Error starting call:', error)
    }
  }

  const answerCall = async (callId: string) => {
    try {
      // Firestore references
      const callDoc = doc(collection(db, 'calls'), callId)
      const offerCandidates = collection(callDoc, 'offerCandidates')
      const answerCandidates = collection(callDoc, 'answerCandidates')

      // Check if localStream is initialized
      if (!localStream) {
        console.error('Local stream is not available')
        return
      }

      callStartTime = Date.now()

      // Initialize peer connection only if not already initialized
      if (!pc.current) {
        pc.current = new RTCPeerConnection(servers)
      }

      // Add local stream tracks
      localStream.getTracks().forEach((track) => {
        pc.current.addTrack(track, localStream)
      })

      // Handle ICE candidates
      pc.current.addEventListener('icecandidate', (e) => {
        if (e.candidate) {
          setDoc(doc(answerCandidates), e.candidate.toJSON())
        } else {
          console.log('Got final candidate!')
        }
      })

      // Stream remote tracks
      pc.current.addEventListener('track', (event) => {
        setRemoteStream(event.streams[0])
        console.log('Remote stream added:', event.streams[0])
      })

      // Fetch and set remote offer description
      const docSnapshot = await getDoc(callDoc)
      if (!docSnapshot.exists()) {
        console.error('No such document!')
        return
      }

      const callData = docSnapshot.data()
      if (callData.offer) {
        await pc.current.setRemoteDescription(
          new RTCSessionDescription(callData.offer),
        )
      }

      // Create and send the answer
      const answerDescription = await pc.current.createAnswer()
      await pc.current.setLocalDescription(answerDescription)

      await updateDoc(callDoc, {
        answer: { sdp: answerDescription.sdp, type: answerDescription.type },
      })

      // Listen for ICE candidates from the offerer
      const unsubscribeOfferCandidates = onSnapshot(
        offerCandidates,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const candidate = new RTCIceCandidate(change.doc.data())
              pc.current.addIceCandidate(candidate)
            }
          })
        },
      )

      // Listen for call status changes
      const unsubscribeCallStatus = onSnapshot(callDoc, (snapshot) => {
        const data = snapshot.data()
        if (!data) {
          router.push(`/student/messages/conversations/${callId}`)
        }
      })

      // Return a cleanup function to unsubscribe on component unmount
      return () => {
        unsubscribeOfferCandidates()
        unsubscribeCallStatus() // Clean up the status listener
        if (pc.current) {
          pc.current.close()
          pc.current = null // Set to null after closing
        }
      }
    } catch (error) {
      console.error('Error answering call:', error)
    }
  }

  const endCall = async (callId: string) => {
    try {
      // Stop all local stream tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          track.stop() // Stop each track
          setLocalStream(null) // Set local stream to null
        })
      }

      const callEndTime = Date.now()
      const callDuration = formatDuration(callEndTime - callStartTime!)

      // Close the peer connection
      if (pc.current) {
        pc.current
          .getSenders()
          .forEach((sender) => pc.current.removeTrack(sender)) // Remove tracks
        pc.current.close() // Close peer connection
        pc.current = null
      }
      // Mark the call as ended in Firestore, so the other device knows
      if (callId) {
        const messagesCollection = collection(
          db,
          'conversations',
          callId,
          'messages',
        )
        // Add a new message document to Firestore
        await addDoc(messagesCollection, {
          _id: callId,
          createdAt: Timestamp.now(),
          text: callDuration,
          user: {
            _id: currentUser?.uid ?? '',
            name: currentUser?.email ?? '',
          },
        })

        const callDocRef = doc(collection(db, 'calls'), callId) // Get the document reference

        // Fetch the document data
        const callSnapshot = await getDoc(callDocRef)
        if (callSnapshot.exists()) {
          const callData = callSnapshot.data()

          // Check if the call status is 'end'
          if (callData.status === 'end') {
            router.push(`/student/messages/conversations/${callId}`)
          }

          // Update the document to notify that the call ended
          // await updateDoc(callDocRef, { status: 'end' })
          await deleteDoc(callDocRef)
          // await updateDoc(callDocRef, { ended: true, status: 'end' })
          // console.log('Call ended and Firestore updated')
        } else {
          console.log('No such document exists')
        }
      }

      // Reset local and remote streams
      // setLocalStream(null)
      setRemoteStream(null)
      // hnavigate to conversation when the call is end
      router.push(`/student/messages/conversations/${callId}`)
    } catch (error) {
      console.error('Error ending call:', error)
    }
  }

  const switchCamera = () => {
    localStream?.getVideoTracks().forEach((track) => track._switchCamera())
  }

  return {
    localStream,
    remoteStream,
    startCall,
    answerCall,
    endCall,
    switchCamera,
    setCallId,
    callId,
    startLocalStream,
  }
}

export default useVc
