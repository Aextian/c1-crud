import { useRouter } from 'expo-router'
import { collection, doc, setDoc } from 'firebase/firestore'
import { useRef, useState } from 'react'
import {
  MediaStream,
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
} from 'react-native-webrtc'
import { auth, db } from '../config'
import { usePermission } from './useRequestPermission'
import { useStateRef } from './useStateRef'

const useGc = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>()
  const [callId, setCallId] = useState('')
  const currentUser = auth.currentUser
  const router = useRouter()
  const pc = useRef<RTCPeerConnection | null>(new RTCPeerConnection({}))

  const [roomId, setRoomId] = useState('')
  const [userName, setUserName] = useState('')
  const [remoteMedias, setRemoteMedias, remoteMediasRef] = useStateRef<{
    [key: string]: any
  }>({})
  const [remoteStreams, setRemoteStreams, remoteStreamsRef] = useStateRef<{
    [key: string]: MediaStream
  }>({})
  const [peerConnections, setPeerConnections] = useStateRef<{
    [key: string]: RTCPeerConnection
  }>({})
  const [totalParticipants, setTotalParticipants] = useState(0)

  const {
    // Boolean value if permission is granted
    cameraPermissionGranted,
    microphonePermissionGranted,

    // request permission methods
    requestMicrophonePermission,
    requestCameraPermission,
  } = usePermission()

  const [localMediaControl, setLocalMediaControl] = useState<any>({
    mic: microphonePermissionGranted,
    camera: cameraPermissionGranted,
  })

  const STUN_SERVER = {
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

  // const createCall = async (callId, participants) => {
  //   try {
  //     if (!localStream) {
  //       console.error('Local stream is not available')
  //       return
  //     }

  //     // A Map to manage peer connections for each user
  //     const peerConnections = new Map()

  //     // Firestore reference to the main call document
  //     const callDoc = doc(collection(db, 'rooms'), callId)

  //     // Loop through each participant (other than the current user) to set up connections
  //     for (const participantId of participants) {
  //       // Skip the current user
  //       if (participantId === currentUser?.uid) continue

  //       // Initialize a new peer connection for this participant
  //       const pc = new RTCPeerConnection(servers)
  //       peerConnections.set(participantId, pc)

  //       // Clear existing senders and add local stream tracks
  //       pc.getSenders().forEach(
  //         (sender) => sender.track && pc.removeTrack(sender),
  //       )
  //       localStream
  //         .getTracks()
  //         .forEach((track) => pc.addTrack(track, localStream))

  //       // Firestore candidate collections for this participant
  //       const offerCandidates = collection(
  //         callDoc,
  //         `offerCandidates_${participantId}`,
  //       )
  //       const answerCandidates = collection(
  //         callDoc,
  //         `answerCandidates_${participantId}`,
  //       )

  //       // Handle ICE candidates for this participant
  //       pc.addEventListener('icecandidate', (e) => {
  //         if (e.candidate) {
  //           setDoc(doc(offerCandidates), e.candidate.toJSON())
  //         } else {
  //           console.log('Got final candidate!')
  //         }
  //       })

  //       // Handle remote track for this participant
  //       pc.addEventListener('track', (event) => {
  //         setRemoteStreamForUser(participantId, event.streams[0])
  //       })

  //       // Create and set local offer description for this participant
  //       const offerDescription = await pc.createOffer()
  //       await pc.setLocalDescription(offerDescription)

  //       // Save offer to Firestore for this participant with unique field
  //       await setDoc(
  //         callDoc,
  //         {
  //           [`offer_${participantId}`]: {
  //             sdp: offerDescription.sdp,
  //             type: offerDescription.type,
  //           },
  //           from: currentUser?.uid,
  //           to: participantId,
  //           status: 'incoming', // 'incoming' means awaiting answer
  //         },
  //         { merge: true },
  //       ) // Use merge: true to ensure existing data is not overwritten

  //       // Listen for the answer from this participant in Firestore
  //       onSnapshot(callDoc, (snapshot) => {
  //         const data = snapshot.data()
  //         if (data?.[`answer_${participantId}`] && !pc.remoteDescription) {
  //           const answerDescription = new RTCSessionDescription(
  //             data[`answer_${participantId}`],
  //           )
  //           pc.setRemoteDescription(answerDescription)
  //         }
  //       })

  //       // Listen for ICE candidates from the answerer for this participant
  //       onSnapshot(answerCandidates, (snapshot) => {
  //         snapshot.docChanges().forEach((change) => {
  //           if (change.type === 'added') {
  //             const candidate = new RTCIceCandidate(change.doc.data())
  //             pc.addIceCandidate(candidate).catch((error) =>
  //               console.error('Error adding ICE candidate:', error),
  //             )
  //           }
  //         })
  //       })
  //     }

  //     // Return cleanup function to close all peer connections and Firestore listeners on unmount
  //     return () => {
  //       peerConnections.forEach((pc, participantId) => {
  //         pc.close()
  //       })
  //     }
  //   } catch (error) {
  //     console.error('Error starting group call:', error)
  //   }
  // }
  const createCall = async (callId, participants) => {
    try {
      if (!localStream) {
        console.error('Local stream is not available')
        return
      }

      // A Map to manage peer connections for each user
      const peerConnections = new Map()

      // Firestore reference to the main call document
      const callDoc = doc(collection(db, 'rooms'), callId)

      await setDoc(callDoc, { participants }, { merge: true })

      // Loop through each participant (other than the current user) to set up connections
      for (const participantId of participants) {
        // Skip the current user
        if (participantId === currentUser?.uid) continue

        // Initialize a new peer connection for this participant
        const pc = new RTCPeerConnection(servers)
        peerConnections.set(participantId, pc)

        // Clear existing senders and add local stream tracks
        pc.getSenders().forEach(
          (sender) => sender.track && pc.removeTrack(sender),
        )
        localStream
          .getTracks()
          .forEach((track) => pc.addTrack(track, localStream))

        // Firestore candidate collections for this participant
        const offerCandidates = collection(
          callDoc,
          `offerCandidates_${participantId}`,
        )
        const answerCandidates = collection(
          callDoc,
          `answerCandidates_${participantId}`,
        )

        // Handle ICE candidates for this participant
        pc.addEventListener('icecandidate', (e) => {
          if (e.candidate) {
            setDoc(doc(offerCandidates), e.candidate.toJSON())
          } else {
            console.log('Got final candidate!')
          }
        })

        // Handle remote track for this participant
        pc.addEventListener('track', (event) => {
          setRemoteStreamForUser(participantId, event.streams[0])
        })

        // Create and set local offer description for this participant
        const offerDescription = await pc.createOffer()
        await pc.setLocalDescription(offerDescription)

        // Save offer to Firestore for this participant with unique field
        await setDoc(
          callDoc,
          {
            [`offer_${participantId}`]: {
              sdp: offerDescription.sdp,
              type: offerDescription.type,
            },
            from: currentUser?.uid,
            to: participantId,
            status: 'incoming', // 'incoming' means awaiting answer
          },
          { merge: true },
        ) // Use merge: true to ensure existing data is not overwritten

        // Listen for the answer from this participant in Firestore
        onSnapshot(callDoc, (snapshot) => {
          const data = snapshot.data()
          if (data?.[`answer_${participantId}`] && !pc.remoteDescription) {
            const answerDescription = new RTCSessionDescription(
              data[`answer_${participantId}`],
            )
            pc.setRemoteDescription(answerDescription)
          }
        })

        // Listen for ICE candidates from the answerer for this participant
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

      // Return cleanup function to close all peer connections and Firestore listeners on unmount
      return () => {
        peerConnections.forEach((pc, participantId) => {
          pc.close()
        })
      }
    } catch (error) {
      console.error('Error starting group call:', error)
    }
  }

  // const joinCall = async (callId, participantId) => {
  //   try {
  //     if (!localStream) {
  //       console.error('Local stream is not available')
  //       return
  //     }

  //     // Firestore reference to the call document
  //     const callDoc = doc(collection(db, 'rooms'), callId)

  //     // Initialize a single peer connection for the participant you are joining
  //     const pc = new RTCPeerConnection(servers)

  //     // Clear existing senders and add local stream tracks
  //     pc.getSenders().forEach(
  //       (sender) => sender.track && pc.removeTrack(sender),
  //     )
  //     localStream
  //       .getTracks()
  //       .forEach((track) => pc.addTrack(track, localStream))

  //     // Firestore references for ICE candidates for the current participant
  //     const offerCandidates = collection(
  //       callDoc,
  //       `offerCandidates_${participantId}`,
  //     )
  //     const answerCandidates = collection(
  //       callDoc,
  //       `answerCandidates_${participantId}`,
  //     )

  //     // Handle ICE candidates
  //     pc.addEventListener('icecandidate', (e) => {
  //       if (e.candidate) {
  //         setDoc(doc(answerCandidates), e.candidate.toJSON())
  //       }
  //     })

  //     // Handle remote track
  //     pc.addEventListener('track', (event) => {
  //       setRemoteStreamForUser(participantId, event.streams[0])
  //     })

  //     // Fetch call data from Firestore
  //     const docSnapshot = await getDoc(callDoc)
  //     if (!docSnapshot.exists()) {
  //       console.error('No such document!')
  //       return
  //     }

  //     const callData = docSnapshot.data()

  //     // Check if there is an offer for this participant
  //     if (callData[`offer_${participantId}`]) {
  //       const offerDescription = new RTCSessionDescription(
  //         callData[`offer_${participantId}`],
  //       )
  //       await pc.setRemoteDescription(offerDescription)

  //       // Create and set local answer description
  //       const answerDescription = await pc.createAnswer()
  //       await pc.setLocalDescription(answerDescription)

  //       // Save answer to Firestore for the specific participant
  //       await updateDoc(callDoc, {
  //         [`answer_${participantId}`]: {
  //           sdp: answerDescription.sdp,
  //           type: answerDescription.type,
  //         },
  //       })
  //     }

  //     // Listen for ICE candidates from the offerer (to add to the peer connection)
  //     const unsubscribeOfferCandidates = onSnapshot(
  //       offerCandidates,
  //       (snapshot) => {
  //         snapshot.docChanges().forEach((change) => {
  //           if (change.type === 'added') {
  //             const candidate = new RTCIceCandidate(change.doc.data())
  //             pc.addIceCandidate(candidate).catch((error) =>
  //               console.error('Error adding ICE candidate:', error),
  //             )
  //           }
  //         })
  //       },
  //     )

  //     // Return cleanup function to close connection and unsubscribe listeners
  //     return () => {
  //       pc.close()
  //       unsubscribeOfferCandidates()
  //     }
  //   } catch (error) {
  //     console.error('Error joining call:', error)
  //   }
  // }

  const joinCall = async (callId, participantId) => {
    try {
      if (!localStream) {
        console.error('Local stream is not available')
        return
      }

      const callDoc = doc(collection(db, 'rooms'), callId)
      const pc = new RTCPeerConnection(servers)

      // Clear existing senders and add local stream tracks
      pc.getSenders().forEach(
        (sender) => sender.track && pc.removeTrack(sender),
      )
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

      pc.addEventListener('icecandidate', (e) => {
        if (e.candidate) {
          setDoc(doc(answerCandidates), e.candidate.toJSON())
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

      const peerConnections = new Map()

      for (const otherParticipantId of callData.participants) {
        if (participantId === otherParticipantId) continue // Skip current user
        const otherPc = new RTCPeerConnection(servers)
        peerConnections.set(otherParticipantId, otherPc)

        // Handle tracks, offer creation, and ICE candidates
        otherPc
          .getSenders()
          .forEach((sender) => sender.track && otherPc.removeTrack(sender))

        localStream
          .getTracks()
          .forEach((track) => otherPc.addTrack(track, localStream))

        const offerCandidates = collection(
          callDoc,
          `offerCandidates_${otherParticipantId}`,
        )
        const answerCandidates = collection(
          callDoc,
          `answerCandidates_${otherParticipantId}`,
        )

        otherPc.addEventListener('icecandidate', (e) => {
          if (e.candidate) {
            setDoc(doc(offerCandidates), e.candidate.toJSON())
          }
        })

        otherPc.addEventListener('track', (event) => {
          setRemoteStreamForUser(otherParticipantId, event.streams[0])
        })

        const offerDescription = await otherPc.createOffer()
        await otherPc.setLocalDescription(offerDescription)

        await updateDoc(callDoc, {
          [`offer_${otherParticipantId}`]: {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
          },
        })

        onSnapshot(callDoc, (snapshot) => {
          const data = snapshot.data()
          if (
            data?.[`answer_${otherParticipantId}`] &&
            !otherPc.remoteDescription
          ) {
            const answerDescription = new RTCSessionDescription(
              data[`answer_${otherParticipantId}`],
            )
            otherPc.setRemoteDescription(answerDescription)
          }
        })

        // Listen for ICE candidates from other participant
        onSnapshot(answerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const candidate = new RTCIceCandidate(change.doc.data())
              otherPc
                .addIceCandidate(candidate)
                .catch((error) =>
                  console.error('Error adding ICE candidate:', error),
                )
            }
          })
        })
      }

      // Check if the current participant should answer the call
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

      // Handle ICE candidates for the caller and answerers
      const unsubscribeOfferCandidates = onSnapshot(
        offerCandidates,
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

      const unsubscribeAnswerCandidates = onSnapshot(
        answerCandidates,
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

      // Cleanup function
      return () => {
        pc.close()
        unsubscribeOfferCandidates()
        unsubscribeAnswerCandidates()
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
