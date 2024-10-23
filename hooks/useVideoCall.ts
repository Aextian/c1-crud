import {
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
import { db } from '../config'

// Define the type for the PeerConnection
type PeerConnection = RTCPeerConnection

const useWebRTC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>()
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>()
  const [callId, setCallId] = useState('')
  // const pc = useRef(null) // RTCPeerConnection reference
  const pc = useRef<RTCPeerConnection | null>(new RTCPeerConnection({}))
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
  const getLocalStream = async () => {
    const stream = await mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })
    setLocalStream(stream)
  }

  const startCall = async () => {
    // getLocalStream()
    try {
      if (!localStream) {
        console.error('Local stream is not available')
        return // Exit if localStream is not initialized
      }
      // Initialize the peer connection if it's not already initialized
      pc.current ||= new RTCPeerConnection(servers)

      // Clear existing senders and add new tracks
      pc.current.getSenders().forEach((sender) => {
        if (sender.track) {
          pc.current.removeTrack(sender) // Remove existing track
        }
      })

      // Add local stream tracks to the peer connection
      localStream.getTracks().forEach((track) => {
        pc.current.addTrack(track, localStream)
      })

      // Create a new document reference for the call
      const callDoc = doc(collection(db, 'calls'), callId)
      const offerCandidates = collection(callDoc, 'offerCandidates')
      const answerCandidates = collection(callDoc, 'answerCandidates')

      // Listen for ICE candidates and send them to Firestore
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
      })

      // Create and set local offer description
      const offerDescription = await pc.current.createOffer({})
      await pc.current.setLocalDescription(offerDescription)

      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      }
      // Save the offer to Firestore
      await setDoc(callDoc, { offer })

      // Listen for answer
      const unsubscribeAnswer = onSnapshot(callDoc, (snapshot) => {
        const data = snapshot.data()

        // Set remote description if available
        if (pc.current) {
          if (data?.answer && !pc.current.remoteDescription) {
            const answerDescription = new RTCSessionDescription(data.answer)
            pc.current
              .setRemoteDescription(answerDescription)
              .then(() => console.log('Remote description set successfully'))
              .catch((error) =>
                console.error('Error setting remote description:', error),
              )
          }
        }

        // Handle call ending
        if (data?.ended) {
          console.log('Call has ended')
          endCall() // Clean up the peer connection
          setRemoteStream(null) // Clear the remote stream
        }
      })

      // Listen for ICE candidates from the answerer
      const unsubscribeCandidates = onSnapshot(answerCandidates, (snapshot) => {
        if (pc.current) {
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
        }
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
      // Create a reference to the call document
      const callDoc = doc(collection(db, 'calls'), callId)
      const offerCandidates = collection(callDoc, 'offerCandidates')
      const answerCandidates = collection(callDoc, 'answerCandidates')
      // Initialize the peer connection
      pc.current = new RTCPeerConnection(servers)
      // Add local stream tracks to the peer connection
      localStream?.getTracks().forEach((track) => {
        if (pc.current) {
          pc.current.addTrack(track, localStream)
        }
      })

      // Listen for ICE candidates and send them to Firestore
      pc.current.addEventListener('icecandidate', (e) => {
        if (!e.candidate) {
          console.log('Got final candidate!')
          return
        }
        setDoc(doc(answerCandidates), e.candidate.toJSON())
      })

      pc.current.addEventListener('track', (event) => {
        setRemoteStream(event.streams[0])
      })

      // Fetch offer from Firestore
      const docSnapshot = await getDoc(callDoc)
      if (!docSnapshot.exists()) {
        console.error('No such document!')
        return // Exit if the document doesn't exist
      }

      const callData = docSnapshot.data()
      const offerDescription = callData.offer // Safe to access

      // Set the remote description using the offer
      if (offerDescription) {
        await pc.current.setRemoteDescription(
          new RTCSessionDescription(offerDescription),
        )
      }

      // Create and send the answer
      const answerDescription = await pc.current.createAnswer()
      await pc.current.setLocalDescription(answerDescription)

      const answer = {
        sdp: answerDescription.sdp,
        type: answerDescription.type,
      }

      // Update Firestore with the answer
      await updateDoc(callDoc, { answer })

      // Listen for ICE candidates from the offerer
      onSnapshot(offerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data())
            pc.current.addIceCandidate(candidate)
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
    getLocalStream,
  }
}

export default useWebRTC
