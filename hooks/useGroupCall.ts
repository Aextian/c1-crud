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

const useGroupCall = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>()
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([])
  const [callId, setCallId] = useState('')
  const [startTime, setStartTime] = useState()
  const currentUser = auth.currentUser
  const router = useRouter()

  const pc = useRef<RTCPeerConnection | null>(new RTCPeerConnection({}))
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())

  const formatDuration = (durationInMilliseconds: number) => {
    const totalSeconds = Math.floor(durationInMilliseconds / 1000) // Convert milliseconds to seconds
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `Call Duration: ${hours}h ${minutes}m ${seconds}s`
  }

  //call server
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

      // Firestore references
      const callDoc = doc(collection(db, 'calls'), callId)
      const offerCandidates = collection(callDoc, 'offerCandidates')
      const answerCandidates = collection(callDoc, 'answerCandidates')

      // Fetch userCallId
      const groupChatDoc = doc(db, 'groupChats', callId)
      const docSnap = await getDoc(groupChatDoc) // Await the getDoc call
      let userCallIds: string[] = []
      if (docSnap.exists()) {
        const usersId = docSnap.data().members
        userCallIds = usersId.filter((id: string) => id !== currentUser?.uid)
      }

      // Iterate over each participant in the call
      userCallIds.forEach(async (participantId) => {
        // Initialize a new peer connection for each participant
        const pc = new RTCPeerConnection(servers)
        peerConnections.set(participantId, pc)

        // Clear existing senders and add local stream tracks
        pc.getSenders().forEach((sender) => {
          if (sender.track) pc.removeTrack(sender)
        })
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream)
        })

        // Handle ICE candidates
        pc.addEventListener('icecandidate', (e) => {
          if (e.candidate) {
            setDoc(doc(offerCandidates, participantId), e.candidate.toJSON())
          }
        })

        // Stream remote tracks
        pc.addEventListener('track', (event) => {
          const newStream = event.streams[0]
          if (newStream && !remoteStreams.some((s) => s.id === newStream.id)) {
            setRemoteStreams((prevStreams) => [...prevStreams, newStream])
            console.log('Remote stream added:', newStream.id)
          }
        })

        // Create and set local offer description
        const offerDescription = await pc.createOffer({})
        await pc.setLocalDescription(offerDescription)

        // Save offer and caller info to Firestore
        await setDoc(callDoc, {
          offer: { sdp: offerDescription.sdp, type: offerDescription.type },
          caller: auth.currentUser?.uid,
          members: userCallIds,
        })

        // Listen for answer
        const unsubscribeAnswer = onSnapshot(callDoc, (snapshot) => {
          const data = snapshot.data()
          if (data?.answer && !pc.remoteDescription) {
            const answerDescription = new RTCSessionDescription(data.answer)
            pc.setRemoteDescription(answerDescription)
              .then(() => console.log('Remote description set successfully'))
              .catch((error) =>
                console.error('Error setting remote description:', error),
              )
          }
        })

        // Listen for ICE candidates from the answerer
        const unsubscribeCandidates = onSnapshot(
          collection(callDoc, `answerCandidates/${participantId}`),
          (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const candidate = new RTCIceCandidate(change.doc.data())
                pc.addIceCandidate(candidate).catch((error) =>
                  console.error('Error adding ICE candidate:', error),
                )
              }
            })
          },
        )

        // Clean up
        return () => {
          unsubscribeAnswer()
          unsubscribeCandidates()
          pc.close()
          peerConnections.delete(participantId)
        }
      })
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

      setStartTime(Date.now() as any)

      // Fetch the call document from Firestore
      const docSnapshot = await getDoc(callDoc)
      if (!docSnapshot.exists()) {
        console.error('No such document!')
        return
      }

      const callData = docSnapshot.data()
      if (!callData || !callData.offer) {
        console.error('No offer found in the document')
        return
      }

      // List of participant IDs (other than current user) from the call document
      const userCallIds: string[] = callData.members || []
      for (const participantId of userCallIds) {
        if (peerConnections.current.has(participantId)) {
          // Skip if a connection for this participant already exists
          continue
        }

        // Initialize a new peer connection for each participant
        const pc = new RTCPeerConnection(servers)
        peerConnections.current.set(participantId, pc)

        // Add local stream tracks to the connection
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream)
        })

        // Handle ICE candidates for each participant
        pc.addEventListener('icecandidate', (e) => {
          if (e.candidate) {
            setDoc(doc(answerCandidates, participantId), e.candidate.toJSON())
          } else {
            console.log('Got final candidate!')
          }
        })

        // Stream remote tracks for each participant
        pc.addEventListener('track', (event) => {
          setRemoteStreams((prevStreams) => [...prevStreams, event.streams[0]])
          console.log('Remote stream added:', event.streams[0])
        })

        // Set the remote description using the offer from Firestore
        await pc.setRemoteDescription(new RTCSessionDescription(callData.offer))

        // Create and send the answer
        const answerDescription = await pc.createAnswer()
        await pc.setLocalDescription(answerDescription)

        // Save the answer to Firestore
        await updateDoc(callDoc, {
          [`answers.${participantId}`]: {
            sdp: answerDescription.sdp,
            type: answerDescription.type,
          },
        })
      }

      // Listen for ICE candidates from the offerers
      const unsubscribeOfferCandidates = onSnapshot(
        offerCandidates,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data()
              const candidate = new RTCIceCandidate(data)
              const participantId = change.doc.id

              const pc = peerConnections.current.get(participantId)
              if (pc) {
                pc.addIceCandidate(candidate).catch((error) =>
                  console.error('Error adding ICE candidate:', error),
                )
              }
            }
          })
        },
      )

      // Listen for call status changes
      const unsubscribeCallStatus = onSnapshot(callDoc, (snapshot) => {
        const data = snapshot.data()
        if (!data) {
          // Handle call end or disconnection here if needed
        }
      })

      // Return a cleanup function to unsubscribe on component unmount
      return () => {
        unsubscribeOfferCandidates()
        unsubscribeCallStatus()
        peerConnections.current.forEach((pc) => pc.close())
        peerConnections.current.clear()
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
      const callDuration = formatDuration(callEndTime - startTime!)

      // Close the peer connection
      if (pc.current) {
        pc.current
          .getSenders()
          .forEach((sender) => pc.current?.removeTrack(sender)) // Remove tracks
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
    remoteStreams,
    startCall,
    answerCall,
    endCall,
    switchCamera,
    setCallId,
    callId,
    startLocalStream,
  }
}

export default useGroupCall
