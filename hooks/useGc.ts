import { useRouter } from 'expo-router'
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

  // Declare outside the functions
  const peerConnections = new Map()

  const createCall = async (callId, participants) => {
    try {
      if (!localStream) {
        console.error('Local stream is not available')
        return
      }

      const peerConnections = new Map()
      const callDoc = doc(collection(db, 'rooms'), callId)

      await setDoc(callDoc, { participants }, { merge: true })

      for (const participantId of participants) {
        if (participantId === currentUser?.uid) continue

        const pc = new RTCPeerConnection(servers)
        peerConnections.set(participantId, pc)

        // Add tracks to the connection
        localStream
          .getTracks()
          .forEach((track) => pc.addTrack(track, localStream))

        // Handle ICE candidates
        const offerCandidates = collection(
          callDoc,
          `offerCandidates_${participantId}`,
        )
        pc.addEventListener('icecandidate', (event) => {
          if (event.candidate) {
            setDoc(doc(offerCandidates), event.candidate.toJSON())
          }
        })

        // Track event for remote streams
        pc.addEventListener('track', (event) => {
          setRemoteStreamForUser(participantId, event.streams[0])
        })

        // Create offer and set local description
        const offerDescription = await pc.createOffer()
        await pc.setLocalDescription(offerDescription)

        // Save offer to Firestore
        await setDoc(
          callDoc,
          {
            [`offer_${participantId}`]: {
              sdp: offerDescription.sdp,
              type: offerDescription.type,
            },
            from: currentUser?.uid,
          },
          { merge: true },
        )

        // Listen for answer from this participant
        onSnapshot(callDoc, (snapshot) => {
          const data = snapshot.data()
          if (data?.[`answer_${participantId}`] && !pc.remoteDescription) {
            const answerDescription = new RTCSessionDescription(
              data[`answer_${participantId}`],
            )
            pc.setRemoteDescription(answerDescription)
          }
        })

        // Listen for ICE candidates from answerers
        const answerCandidates = collection(
          callDoc,
          `answerCandidates_${participantId}`,
        )
        onSnapshot(answerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const candidate = new RTCIceCandidate(change.doc.data())
              pc.addIceCandidate(candidate).catch((error) =>
                console.error('Error adding ICE candidate:', error),
              )
            }
          })
        })
      }

      return () => {
        peerConnections.forEach((pc) => pc.close())
      }
    } catch (error) {
      console.error('Error starting group call:', error)
    }
  }

  const joinCall = async (callId, participantId) => {
    try {
      if (!localStream) {
        console.error('Local stream is not available')
        return
      }

      const callDoc = doc(collection(db, 'rooms'), callId)
      const pc = new RTCPeerConnection(servers)

      // Add local stream to the connection
      localStream
        .getTracks()
        .forEach((track) => pc.addTrack(track, localStream))

      const offerCandidates = collection(
        callDoc,
        `offerCandidates_${participantId}`,
      )
      const answerCandidates = collection(
        callDoc,
        `answerCandidates_${participantId}`,
      )

      // Queue for candidates if remote description is not set
      const candidateQueue = []

      pc.addEventListener('icecandidate', (e) => {
        if (e.candidate) {
          // If remote description is not set, queue the candidate
          if (pc.remoteDescription) {
            pc.addIceCandidate(e.candidate).catch((error) => {
              console.error('Error adding ICE candidate:', error)
            })
          } else {
            candidateQueue.push(e.candidate) // Queue the candidate
          }
        }
      })

      pc.addEventListener('track', (event) => {
        setRemoteStreamForUser(participantId, event.streams[0])
      })

      const docSnapshot = await getDoc(callDoc)
      if (!docSnapshot.exists()) {
        console.error('No such document!')
        return
      }

      const callData = docSnapshot.data()

      // Process each other participant
      for (const otherParticipantId of callData.participants) {
        if (participantId === otherParticipantId) continue

        const offerCandidates = collection(
          callDoc,
          `offerCandidates_${otherParticipantId}`,
        )
        const answerCandidates = collection(
          callDoc,
          `answerCandidates_${otherParticipantId}`,
        )

        const otherPc = new RTCPeerConnection(servers)
        peerConnections.set(otherParticipantId, otherPc)

        // Add local stream to the new peer connection
        localStream
          .getTracks()
          .forEach((track) => otherPc.addTrack(track, localStream))

        // Handle track event for the other peer
        otherPc.addEventListener('track', (event) => {
          console.log('Track event received for', otherParticipantId)
          if (event.streams && event.streams.length > 0) {
            console.log('Remote stream:', event.streams[0])
            setRemoteStreamForUser(otherParticipantId, event.streams[0])
          } else {
            console.error('No streams found in track event')
          }
        })

        otherPc.addEventListener('iceconnectionstatechange', () => {
          console.log('ICE Connection State:', otherPc.iceConnectionState)
          if (otherPc.iceConnectionState === 'connected') {
            console.log('Connection established, waiting for remote stream...')
          } else if (otherPc.iceConnectionState === 'failed') {
            console.error('ICE connection failed')
          }
        })

        otherPc.addEventListener('icecandidate', (e) => {
          if (e.candidate) {
            console.log('ICE candidate for', otherParticipantId, e.candidate)
          } else {
            console.log('ICE candidate gathering completed')
          }
        })

        console.log(
          'Peer connection status for',
          otherParticipantId,
          otherPc.connectionState,
        )

        // Listen for remote answer and set remote description
        onSnapshot(callDoc, (snapshot) => {
          const data = snapshot.data()
          console.log('Current remote description:', otherPc.remoteDescription)
          console.log('Current signaling state:', otherPc.signalingState)

          // Check if answer data exists for the other participant
          if (data?.[`answer_${otherParticipantId}`]) {
            const answerDescription = new RTCSessionDescription(
              data[`answer_${otherParticipantId}`],
            )

            // Only set remote description if it's not already set
            if (!otherPc.remoteDescription) {
              console.log('Setting remote description for:', otherParticipantId)

              // If signaling state is "have-remote-offer" or "have-local-pranswer", set the remote description
              if (
                otherPc.signalingState === 'have-remote-offer' ||
                otherPc.signalingState === 'have-local-pranswer'
              ) {
                otherPc
                  .setRemoteDescription(answerDescription)
                  .then(() => {
                    console.log(
                      'Remote description set successfully for',
                      otherParticipantId,
                    )

                    // Add any queued candidates after setting remote description
                    candidateQueue.forEach((candidate) => {
                      otherPc.addIceCandidate(candidate).catch((error) => {
                        console.error(
                          'Error adding queued ICE candidate:',
                          error,
                        )
                      })
                    })

                    // Clear the candidate queue after processing
                    candidateQueue.length = 0
                  })
                  .catch((error) => {
                    console.error(
                      'Error setting remote description for',
                      otherParticipantId,
                      error,
                    )
                  })
              } else {
                console.log(
                  'Cannot set remote description yet, signaling state:',
                  otherPc.signalingState,
                )
                // Handle case where signaling state is not ready (waiting for offer or other condition)
                // If needed, you could add logic to recheck periodically or handle state changes.
              }
            } else {
              console.log(
                'Remote description already set for',
                otherParticipantId,
              )
            }
          } else {
            console.log('Answer for participant not available in snapshot data')
          }
        })

        // Add ICE candidates from the answerCandidates collection
        onSnapshot(answerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const candidate = new RTCIceCandidate(change.doc.data())
              otherPc.addIceCandidate(candidate).catch((error) => {
                console.error('Error adding ICE candidate:', error)
              })
            }
          })
        })

        // Listen for incoming offer ICE candidates
        onSnapshot(offerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const candidate = new RTCIceCandidate(change.doc.data())

              // If remote description is set, add ICE candidate
              if (otherPc.remoteDescription) {
                otherPc.addIceCandidate(candidate).catch((error) => {
                  console.error('Error adding ICE candidate:', error)
                })
              } else {
                // Otherwise, queue the candidate
                candidateQueue.push(candidate)
              }
            }
          })
        })
      }

      // Handle offer from the current participant
      if (callData[`offer_${participantId}`]) {
        const offerDescription = new RTCSessionDescription(
          callData[`offer_${participantId}`],
        )
        await pc.setRemoteDescription(offerDescription)

        const answerDescription = await pc.createAnswer()
        await pc.setLocalDescription(answerDescription)

        await updateDoc(callDoc, {
          [`answer_${participantId}`]: {
            sdp: answerDescription.sdp,
            type: answerDescription.type,
          },
        })
      }

      // Handle ICE candidates after the remote description is set
      onSnapshot(offerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data())
            pc.addIceCandidate(candidate).catch((error) =>
              console.error('Error adding ICE candidate:', error),
            )
          }
        })
      })

      onSnapshot(answerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data())
            pc.addIceCandidate(candidate).catch((error) =>
              console.error('Error adding ICE candidate:', error),
            )
          }
        })
      })

      return () => {
        pc.close()
      }
    } catch (error) {
      console.error('Error joining call:', error)
    }
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
