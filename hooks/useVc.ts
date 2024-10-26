import {
  collection,
  CollectionReference,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
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
  // const pc = useRef(null) // RTCPeerConnection reference
  const pc = useRef<RTCPeerConnection>(new RTCPeerConnection({}))

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

  const checkCandidateExists = async (
    candidateData: RTCIceCandidateInit,
    offerCandidates: CollectionReference,
  ) => {
    const querySnapshot = await getDocs(offerCandidates)
    return querySnapshot.docs.some((doc) => {
      const existingCandidate = doc.data() as RTCIceCandidateInit
      return (
        existingCandidate.candidate === candidateData.candidate &&
        existingCandidate.sdpMid === candidateData.sdpMid &&
        existingCandidate.sdpMLineIndex === candidateData.sdpMLineIndex
      )
    })
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

      // Initialize the peer connection if it's not already initialized
      pc.current ||= new RTCPeerConnection(servers)

      // Clear existing senders and add local stream tracks
      pc.current
        .getSenders()
        .forEach((sender) => sender.track && pc.current.removeTrack(sender))
      localStream
        .getTracks()
        .forEach((track) => pc.current.addTrack(track, localStream))

      // Firestore references
      const callDoc = doc(collection(db, 'calls'), callId)
      const offerCandidates = collection(callDoc, 'offerCandidates')
      const answerCandidates = collection(callDoc, 'answerCandidates')

      // Handle ICE candidates
      pc.current.addEventListener('icecandidate', (e) => {
        if (e.candidate) {
          setDoc(doc(offerCandidates), e.candidate.toJSON())
        } else {
          console.log('Got final candidate!')
        }
      })

      // Stream remote tracks
      pc.current.addEventListener('track', (event) => {
        setRemoteStream(event.streams[0])
        console.log('Remote stream added:', event.streams[0])
      })

      // Create and set local offer description
      const offerDescription = await pc.current.createOffer({})
      await pc.current.setLocalDescription(offerDescription)

      // Save offer and caller info to Firestore
      await setDoc(callDoc, {
        offer: {
          sdp: offerDescription.sdp,
          type: offerDescription.type,
        },
        from: auth.currentUser?.uid,
        to: callId,
        status: 'incoming',
      })

      // Listen for answer
      const unsubscribeAnswer = onSnapshot(callDoc, (snapshot) => {
        const data = snapshot.data()
        if (data?.answer && !pc.current.remoteDescription) {
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
            pc.current
              .addIceCandidate(candidate)
              .then(() => console.log('ICE candidate added successfully'))
              .catch((error) =>
                console.error('Error adding ICE candidate:', error),
              )
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

      // Initialize peer connection
      pc.current = new RTCPeerConnection(servers)

      // Add local stream tracks
      localStream?.getTracks().forEach((track) => {
        pc.current?.addTrack(track, localStream)
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
      onSnapshot(offerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data())
            pc.current?.addIceCandidate(candidate)
          }
        })
      })
    } catch (error) {
      console.error('Error answering call:', error)
    }
  }

  const endCall = async () => {
    try {
      // Stop all local stream tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          track.stop() // Stop each track
        })
      }

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
        const callDoc = doc(collection(db, 'calls'), callId)
        await updateDoc(callDoc, { ended: true }) // Notify both peers
        console.log('Call ended and Firestore updated')
      }

      // Reset local and remote streams
      setLocalStream(null) // Clear the local stream
      setRemoteStream(null) // Clear the remote stream
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
