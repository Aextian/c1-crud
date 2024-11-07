import { useRouter } from 'expo-router'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
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
      // Ensure local stream is available
      if (!localStream) {
        console.error('Local stream is not available')
        return
      }

      // Reference to the Firestore call and group chat documents
      const callDoc = doc(collection(db, 'calls'), callId)
      const groupCallDoc = doc(db, 'groupChats', callId)
      const offerCandidates = collection(callDoc, 'offerCandidates')
      const answerCandidates = collection(callDoc, 'answerCandidates')

      // Create or update the group call document
      const groupDocSnapshot = await getDoc(groupCallDoc)
      if (!groupDocSnapshot.exists()) {
        await setDoc(groupCallDoc, {
          callStarted: true,
          startedBy: currentUser?.uid,
          timestamp: serverTimestamp(),
        })
      } else {
        await updateDoc(groupCallDoc, {
          callStarted: true,
          startedBy: currentUser?.uid,
          timestamp: serverTimestamp(),
        })
      }

      // Get the group members
      const groupChatSnapshot = await getDoc(groupCallDoc)
      let userCallIds: string[] = []
      if (groupChatSnapshot.exists()) {
        const chatData = groupChatSnapshot.data()
        userCallIds = (chatData?.members || []).filter(
          (id: string) => id !== currentUser?.uid,
        )
      }

      // Ensure the call document exists and contains initial offers data
      const callDocSnapshot = await getDoc(callDoc)
      if (!callDocSnapshot.exists()) {
        await setDoc(callDoc, {
          offers: {},
          timestamp: serverTimestamp(),
        })
      }

      // Add local stream tracks to the peer connection

      // Set up peer connections for each participant (excluding the current user)
      for (const participantId of userCallIds) {
        if (peerConnections.current.has(participantId)) continue

        const pc = new RTCPeerConnection(servers) // Create a new peer connection for the participant

        // Store the peer connection in the map
        peerConnections.current.set(participantId, pc)

        // Add tracks to the peer connection
        localStream.getTracks().forEach((track) => {
          console.log('Adding track', track)
          pc.addTrack(track, localStream)
        })

        // Listen for incoming remote tracks
        pc.addEventListener('track', (event) => {
          console.log('Received track event:', event)
          const newStream = event.streams[0]
          if (!newStream) {
            console.error('No stream received')
            return
          }

          // Update state with the new stream if it's not already in the list
          setRemoteStreams((prevStreams) => {
            const streamExists = prevStreams.some(
              (stream) => stream.id === newStream.id,
            )
            return streamExists ? prevStreams : [...prevStreams, newStream]
          })
        })

        pc.addEventListener('icecandidate', (e) => {
          if (e.candidate) {
            const candidateData = e.candidate.toJSON()
            setDoc(doc(offerCandidates, participantId), candidateData) // Send candidate to Firebase
          }
        })

        const offerDescription = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        })
        await pc.setLocalDescription(offerDescription)

        // Send the offer to Firestore
        await updateDoc(callDoc, {
          [`offers.${participantId}`]: {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
          },
        })
      }

      // Listen for incoming ICE candidates from the callee (other participants)
      const unsubscribeCandidates = onSnapshot(answerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidateData = change.doc.data()
            const candidate = new RTCIceCandidate(candidateData)
            // Add ICE candidate to the correct peer connection
            console.log('Adding ICE candidate:', candidate)

            userCallIds.forEach((participantId) => {
              const pc = peerConnections.current.get(participantId)
              console.log('remoteDescription remote:', pc?.remoteDescription)
              if (pc) {
                // Ensure that remote description is set before adding candidate
                if (pc.remoteDescription) {
                  pc.addIceCandidate(candidate)
                    .then(() => console.log('ICE candidate added successfully'))
                    .catch((error) =>
                      console.error('Error adding ICE candidate:', error),
                    )
                } else {
                  console.log(
                    'Remote description is not set yet, skipping candidate',
                  )
                }
              }
            })
          }
        })
      })

      // Return the unsubscribe function to clean up listeners when the call ends
      return () => unsubscribeCandidates()
    } catch (error) {
      console.error('Error starting call:', error)
    }
  }

  const answerCall = async (callId: string) => {
    try {
      if (!localStream) {
        console.error('Local stream is not available')
        return
      }

      const callDoc = doc(collection(db, 'calls'), callId)
      const answerCandidates = collection(callDoc, 'answerCandidates')

      // Get the offer from Firestore
      const callDocSnapshot = await getDoc(callDoc)
      if (!callDocSnapshot.exists()) {
        console.error('No call document found')
        return
      }

      const callData = callDocSnapshot.data()
      const offers = callData?.offers

      // Create a peer connection for each offer
      for (const participantId in offers) {
        const pc = new RTCPeerConnection(servers)
        // Store the peer connection for later use
        peerConnections.current.set(participantId, pc)

        // Check if the track has already been added before adding it
        localStream.getTracks().forEach((track) => {
          const senderExists = pc
            .getSenders()
            .some((sender) => sender.track === track)
          if (!senderExists) {
            pc.addTrack(track, localStream)
          }
        })

        // ICE Candidate event handler
        pc.addEventListener('icecandidate', (e) => {
          if (e.candidate) {
            console.log('Received ICE candidate:', e.candidate)
            const candidateData = e.candidate.toJSON()
            setDoc(doc(answerCandidates, participantId), candidateData)
              .then(() => console.log('Candidate saved'))
              .catch((error) =>
                console.error('Error saving ICE candidate', error),
              )
          }
        })

        // Handle incoming tracks
        pc.addEventListener('track', (event) => {
          const newStream = event.streams[0]
          console.log('Received remote stream:', newStream)
          setRemoteStreams((prevStreams) => {
            const streamExists = prevStreams.some(
              (stream) => stream.id === newStream.id,
            )
            return streamExists ? prevStreams : [...prevStreams, newStream]
          })
        })

        // Set remote description and create an answer
        const offer = offers[participantId]
        if (offer) {
          // Set the remote description with the offer received from the caller
          const offerDescription = new RTCSessionDescription(offer)
          await pc.setRemoteDescription(offerDescription)

          // After setting remote description, create an answer
          const answerDescription = await pc.createAnswer()
          await pc.setLocalDescription(answerDescription)

          // Send the answer back to the caller
          await updateDoc(callDoc, {
            [`answers.${participantId}`]: {
              sdp: answerDescription.sdp,
              type: answerDescription.type,
            },
          })
        }
      }

      // Listen for incoming ICE candidates
      const unsubscribeAnswerCandidates = onSnapshot(
        answerCandidates,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const candidateData = change.doc.data()
              if (candidateData) {
                const candidate = new RTCIceCandidate(candidateData)
                // Match the participantId with the peer connection
                peerConnections.current.forEach((pc, id) => {
                  if (id === change.doc.id) {
                    // Add ICE candidate to the corresponding peer connection
                    pc.addIceCandidate(candidate)
                      .then(() => console.log(`ICE candidate added for ${id}`))
                      .catch((error) =>
                        console.error('Failed to add ICE candidate', error),
                      )
                  }
                })
              }
            }
          })
        },
      )

      return () => unsubscribeAnswerCandidates()
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
