import { useRouter } from 'expo-router'
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { useState } from 'react'
import {
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
} from 'react-native-webrtc'
import { auth, db } from '../config'

const useGroupCall = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>()
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([])
  const [callId, setCallId] = useState('')

  const [startTime, setStartTime] = useState()
  const currentUser = auth.currentUser
  const router = useRouter()

  // const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())
  const peerConnections = new Map()

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
        return
      }

      // Reference to the Firestore call and group chat documents
      const callDoc = doc(collection(db, 'calls'), callId)
      const groupCallDoc = doc(db, 'groupChats', callId)
      const offerCandidates = collection(callDoc, 'offerCandidates')
      const answerCandidates = collection(callDoc, 'answerCandidates')

      await setDoc(groupCallDoc, {
        callStarted: true,
        startedBy: currentUser?.uid,
        timestamp: serverTimestamp(),
      })

      // Get the group members
      const groupChatSnapshot = await getDoc(groupCallDoc)
      let userCallIds: string[] = []
      if (groupChatSnapshot.exists()) {
        const chatData = groupChatSnapshot.data()
        userCallIds = (chatData?.members || []).filter(
          (id: string) => id !== currentUser?.uid,
        )
      }

      // Set up peer connections for each participant (excluding the current user)
      for (const participantId of userCallIds) {
        if (peerConnections.has(participantId)) continue
        const pc = new RTCPeerConnection(servers) // Create a new peer connection for the participant
        // Store the peer connection in the map
        peerConnections.set(participantId, pc)
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

        const offerDescription = await pc.createOffer({})

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
      const unsubscribeAnswerCandidates = onSnapshot(
        answerCandidates,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const candidateData = change.doc.data()
              const candidate = new RTCIceCandidate(candidateData)
              console.log('candidatecandidate', candidate)

              // Iterate through each participant ID
              userCallIds.forEach((participantId) => {
                const pc = peerConnections.get(participantId)
                if (pc) {
                  // Ensure remote description is set before adding candidate
                  if (pc.remoteDescription) {
                    pc.addIceCandidate(candidate)
                      .then(() =>
                        console.log('ICE candidate added successfully'),
                      )

                      .catch((error) =>
                        console.error('Error adding ICE candidate:', error),
                      )
                  } else {
                    console.log(
                      'Remote description is not set yet, skipping candidate',
                    )
                  }
                } else {
                  console.error(`PeerConnection not found for ${participantId}`)
                }
              })
            }
          })
        },
      )

      // Return the unsubscribe function to clean up listeners when the call ends
      return () => unsubscribeAnswerCandidates()
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
      const offers = callData?.offers // Assuming `offers` is an object, not an array
      // Find the userCallId from the offers
      let userCallId = ''
      for (const participantId in offers) {
        if (participantId === currentUser?.uid) {
          userCallId = participantId
          break
        }
      }

      // Make sure to handle the case where the userCallId is not found
      if (!userCallId) {
        console.error('No matching user found for this call')
        return
      }

      // Now, proceed with creating peer connections, updating documents, etc.
      const pc = new RTCPeerConnection(servers)
      // Store the peer connection for later use
      peerConnections.set(userCallId, pc)

      // ICE Candidate event handler
      pc.addEventListener('icecandidate', (e) => {
        if (e.candidate) {
          console.log('Received ICE candidate:', e.candidate)
          const candidateData = e.candidate.toJSON()
          setDoc(doc(answerCandidates, userCallId), candidateData)
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
      const offer = offers[userCallId] // Find the offer for the current user
      if (offer) {
        // Set the remote description with the offer received from the caller
        const offerDescription = new RTCSessionDescription(offer)
        await pc.setRemoteDescription(offerDescription)

        // After setting remote description, create an answer
        const answerDescription = await pc.createAnswer()
        await pc.setLocalDescription(answerDescription)

        // Send the answer back to the caller
        await updateDoc(callDoc, {
          [`answers.${userCallId}`]: {
            sdp: answerDescription.sdp,
            type: answerDescription.type,
          },
        })
      }

      // Listen for incoming ICE candidates for the specific user
      const unsubscribeAnswerCandidates = onSnapshot(
        answerCandidates,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const candidateData = change.doc.data()
              if (candidateData) {
                const candidate = new RTCIceCandidate(candidateData)
                if (change.doc.id === userCallId) {
                  pc.addIceCandidate(candidate)
                    .then(() =>
                      console.log(`ICE candidate added for ${userCallId}`),
                    )
                    .catch((error) =>
                      console.error('Failed to add ICE candidate', error),
                    )
                }
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
    console.log('endlive')
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
