import { addDoc, collection, doc, setDoc, updateDoc } from 'firebase/firestore'
import { useRef, useState } from 'react'
import {
  MediaStream,
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
} from 'react-native-webrtc'
import { auth, db } from '../config'

// Define the type for the PeerConnection
type PeerConnection = RTCPeerConnection

const useVc = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>()
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>()
  const [peerConnection, setPeerConnection] = useState<PeerConnection>()
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

  const startLocalStream = async () => {
    const constraints = {
      audio: true,
      video: {
        mandatory: {
          minWidth: 500, // Provide your own width, height and frame rate here
          minHeight: 300,
          minFrameRate: 30,
        },
      },
    }
    const stream = await mediaDevices.getUserMedia(constraints)
    setLocalStream(stream)
  }

  const startCall = async (callId: string) => {
    try {
      // Initialize the peer connection if it's not already initialized
      pc.current ||= new RTCPeerConnection(servers)
      // Clear existing senders and add new tracks
      pc.current.getSenders().forEach((sender) => {
        if (sender.track) {
          pc.current.removeTrack(sender) // Remove existing track
        }
      })
      // Add local stream tracks to the peer connection
      localStream?.getTracks().forEach((track) => {
        pc.current.addTrack(track, localStream)
      })

      // Create and set local offer description
      const offerDescription = await pc.current.createOffer({})
      await pc.current.setLocalDescription(offerDescription)

      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      }
      const callDocRef = collection(db, 'calls')
      const callDoc = await addDoc(callDocRef, {
        offer: offer,
        from: auth.currentUser?.uid,
        to: callId,
        status: 'incoming',
      })

      const offerCandidates = collection(callDoc, 'offerCandidates')

      // Listen for ICE candidates and send them to Firestore
      pc.current.addEventListener('icecandidate', (e) => {
        if (e.candidate) {
          setDoc(doc(offerCandidates), {
            candidate: e.candidate.toJSON(),
            callId: callDoc.id,
          })
        } else {
          console.log('Got final candidate!')
        }
      })
      // Stream remote tracks
      pc.current.addEventListener('track', (event) => {
        setRemoteStream(event.streams[0])
      })
    } catch (error) {
      console.error('Error starting call:', error)
    }
  }

  const answerCall = async (callId: string, answer: RTCSessionDescription) => {
    try {
      if (!pc.current) {
        pc.current = new RTCPeerConnection(servers)
      }

      // Add local stream tracks to the peer connection
      localStream?.getTracks().forEach((track) => {
        if (pc.current) {
          pc.current.addTrack(track, localStream)
        }
      })

      console.log('Answer:', answer)
      if (answer && answer.type && answer.sdp) {
        await pc.current.setRemoteDescription(new RTCSessionDescription(answer))
      } else {
        console.error('Invalid answer format:', answer)
      }

      // Create and send the answer
      const answerDescription = await pc.current.createAnswer()
      await pc.current.setLocalDescription(answerDescription)

      // Create a reference to the call document
      const callDocRef = doc(collection(db, 'calls'), callId) // Get a reference to the document
      await updateDoc(callDocRef, {
        // answer: answerDescription,
        answer: {
          type: answerDescription.type,
          sdp: answerDescription.sdp,
        },
      })

      // Listen for ICE candidates and send them to Firestore
      pc.current.addEventListener('icecandidate', async (e) => {
        if (!e.candidate) {
          console.log('Got final candidate!')
          return
        }
        const callDocRef = doc(collection(db, 'answerCandidates'))
        await updateDoc(callDocRef, {
          candidate: e.candidate,
          callId: callId,
        })
      })
      pc.current.addEventListener('track', (event) => {
        setRemoteStream(event.streams[0])
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

  // Handle ICE candidates

  //   const calling = () => {
  //     useEffect(() => {
  //         const getOfferCandidates = async () => {
  //           const q = query(collection(db, 'offerCandidates'), where('callId', '==', callId));
  //           const candidatesSnapshot = await getDocs(q);
  //           // Add each candidate to the peer connection
  //           candidatesSnapshot.forEach((doc) => {
  //             const candidate = doc.data();
  //             peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
  //           });
  //         };

  //         const getAnswerCandidates = async () => {
  //           const q = query(collection(db, 'answerCandidates'), where('callId', '==', callId));
  //           const candidatesSnapshot = await getDocs(q);
  //           // Add each candidate to the peer connection
  //           candidatesSnapshot.forEach((doc) => {
  //             const candidate = doc.data();
  //             peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
  //           });
  //         };

  //         getOfferCandidates();
  //         getAnswerCandidates();
  //       }, [callId, peerConnection, db]);
  //   }

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
