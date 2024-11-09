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

  // const createCall = async (callId: string) => {
  //   try {
  //     if (!localStream) {
  //       console.error('Local stream is not available')
  //       return
  //     }

  //     // Initialize the peer connection if it's not already initialized
  //     pc.current ||= new RTCPeerConnection(servers)

  //     // Clear existing senders and add local stream tracks
  //     if (pc.current) {
  //       pc.current
  //         .getSenders()
  //         .forEach((sender) => sender.track && pc.current?.removeTrack(sender))
  //       localStream.getTracks().forEach((track) => {
  //         pc.current?.addTrack(track, localStream)
  //       })
  //     }

  //     // Firestore references
  //     const callDoc = doc(collection(db, 'rooms'), callId)
  //     const offerCandidates = collection(callDoc, 'offerCandidates')
  //     const answerCandidates = collection(callDoc, 'answerCandidates')

  //     // Handle ICE candidates
  //     if (pc.current) {
  //       pc.current.addEventListener('icecandidate', (e) => {
  //         if (e.candidate) {
  //           setDoc(doc(offerCandidates), e.candidate.toJSON())
  //         } else {
  //           console.log('Got final candidate!')
  //         }
  //       })
  //     }

  //     // Stream remote tracks
  //     pc.current.addEventListener('track', (event) => {
  //       setRemoteStream(event.streams[0])
  //       console.log('Remote stream added:', event.streams[0])
  //     })

  //     // Create and set local offer description
  //     const offerDescription = await pc.current.createOffer({})

  //     await pc.current.setLocalDescription(offerDescription)

  //     // Fetch userCallId
  //     const conversationDoc = doc(db, 'conversations', callId)
  //     const docSnap = await getDoc(conversationDoc) // Await the getDoc call
  //     let userCallId = ''
  //     if (docSnap.exists()) {
  //       const usersId = docSnap.data().users
  //       userCallId = usersId.find((id: string) => id !== currentUser?.uid)
  //     }
  //     // Save offer and caller info to Firestore
  //     await setDoc(callDoc, {
  //       offer: {
  //         sdp: offerDescription.sdp,
  //         type: offerDescription.type,
  //       },
  //       from: auth.currentUser?.uid,
  //       to: userCallId,
  //       status: 'incoming',
  //     })

  //     // Listen for answer
  //     const unsubscribeAnswer = onSnapshot(callDoc, (snapshot) => {
  //       const data = snapshot.data()
  //       if (!data) {
  //         router.push(`/student/messages/conversations/${callId}`)
  //       }

  //       if (data?.answer && pc.current && !pc.current.remoteDescription) {
  //         const answerDescription = new RTCSessionDescription(data.answer)
  //         pc.current
  //           .setRemoteDescription(answerDescription)
  //           .then(() => console.log('Remote description set successfully'))
  //           .catch((error) =>
  //             console.error('Error setting remote description:', error),
  //           )
  //       }
  //     })

  //     // Listen for ICE candidates from the answerer
  //     const unsubscribeCandidates = onSnapshot(answerCandidates, (snapshot) => {
  //       snapshot.docChanges().forEach((change) => {
  //         if (change.type === 'added') {
  //           const candidate = new RTCIceCandidate(change.doc.data())
  //           if (pc.current) {
  //             // Check if pc.current is valid
  //             pc.current
  //               .addIceCandidate(candidate)
  //               .then(() => console.log('ICE candidate added successfully'))
  //               .catch((error) =>
  //                 console.error('Error adding ICE candidate:', error),
  //               )
  //           }
  //         }
  //       })
  //     })

  //     // Return cleanup function to unsubscribe from Firestore on unmount
  //     return () => {
  //       unsubscribeAnswer()
  //       unsubscribeCandidates()
  //     }
  //   } catch (error) {
  //     console.error('Error starting call:', error)
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

      // Firestore references
      const callDoc = doc(collection(db, 'rooms'), callId)

      // Loop through each participant (other than the current user) to set up connections
      for (const participantId of participants) {
        if (participantId === currentUser?.uid) continue // Skip the current user

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

        // Save offer to Firestore
        await setDoc(callDoc, {
          [`offer_${participantId}`]: {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
          },
          from: currentUser?.uid,
          to: participantId,
          status: 'incoming',
        })

        // Listen for answer for this participant
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

  // const joinCall = async (callId: string) => {
  //   try {
  //     // Firestore references
  //     const callDoc = doc(collection(db, 'rooms'), callId)
  //     const offerCandidates = collection(callDoc, 'offerCandidates')
  //     const answerCandidates = collection(callDoc, 'answerCandidates')

  //     // Check if localStream is initialized
  //     if (!localStream) {
  //       console.error('Local stream is not available')
  //       return
  //     }

  //     // Initialize peer connection only if not already initialized
  //     if (!pc.current) {
  //       pc.current = new RTCPeerConnection(servers)
  //     }

  //     // Add local stream tracks
  //     localStream.getTracks().forEach((track) => {
  //       pc.current?.addTrack(track, localStream)
  //     })

  //     // Handle ICE candidates
  //     pc.current.addEventListener('icecandidate', (e) => {
  //       if (e.candidate) {
  //         setDoc(doc(answerCandidates), e.candidate.toJSON())
  //       } else {
  //         console.log('Got final candidate!')
  //       }
  //     })

  //     // Stream remote tracks
  //     pc.current.addEventListener('track', (event) => {
  //       setRemoteStream(event.streams[0])
  //       console.log('Remote stream added:', event.streams[0])
  //     })

  //     // Fetch and set remote offer description
  //     const docSnapshot = await getDoc(callDoc)
  //     if (!docSnapshot.exists()) {
  //       console.error('No such document!')
  //       return
  //     }

  //     const callData = docSnapshot.data()
  //     if (callData.offer) {
  //       await pc.current.setRemoteDescription(
  //         new RTCSessionDescription(callData.offer),
  //       )
  //     }

  //     const conversationDoc = doc(db, 'conversations', callId)
  //     const docSnap = await getDoc(conversationDoc) // Await the getDoc call
  //     let userCallId = ''
  //     if (docSnap.exists()) {
  //       const usersId = docSnap.data().users
  //       userCallId = usersId.find((id: string) => id !== currentUser?.uid)
  //     }

  //     // Create and send the answer
  //     const answerDescription = await pc.current.createAnswer()
  //     await pc.current.setLocalDescription(answerDescription)

  //     await updateDoc(callDoc, {
  //       answer: { sdp: answerDescription.sdp, type: answerDescription.type },
  //     })

  //     // Listen for ICE candidates from the offerer
  //     const unsubscribeOfferCandidates = onSnapshot(
  //       offerCandidates,
  //       (snapshot) => {
  //         snapshot.docChanges().forEach((change) => {
  //           if (change.type === 'added') {
  //             const candidate = new RTCIceCandidate(change.doc.data())
  //             pc.current?.addIceCandidate(candidate)
  //           }
  //         })
  //       },
  //     )

  //     // Listen for call status changes
  //     const unsubscribeCallStatus = onSnapshot(callDoc, (snapshot) => {
  //       const data = snapshot.data()
  //       if (!data) {
  //         router.push(`/student/messages/conversations/${callId}`)
  //       }
  //     })

  //     // Return a cleanup function to unsubscribe on component unmount
  //     return () => {
  //       unsubscribeOfferCandidates()
  //       unsubscribeCallStatus() // Clean up the status listener
  //       if (pc.current) {
  //         pc.current.close()
  //         pc.current = null // Set to null after closing
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error answering call:', error)
  //   }
  // }

  const joinCall = async (callId, participants) => {
    try {
      if (!localStream) {
        console.error('Local stream is not available')
        return
      }

      // A Map to manage peer connections for each user
      const peerConnections = new Map()

      // Firestore references
      const callDoc = doc(collection(db, 'rooms'), callId)

      // Loop through each participant to set up connections
      for (const participantId of participants) {
        // if (participantId === currentUser?.uid) continue // Skip the current user

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

        // Handle ICE candidates
        pc.addEventListener('icecandidate', (e) => {
          if (e.candidate) {
            setDoc(doc(answerCandidates), e.candidate.toJSON())
          }
        })

        // Handle remote track
        pc.addEventListener('track', (event) => {
          setRemoteStreamForUser(participantId, event.streams[0])
        })

        // Listen for the offer for this participant
        const docSnapshot = await getDoc(callDoc)
        if (!docSnapshot.exists()) {
          console.error('No such document!')
          return
        }

        const callData = docSnapshot.data()
        if (callData[`offer_${participantId}`]) {
          const offerDescription = new RTCSessionDescription(
            callData[`offer_${participantId}`],
          )
          await pc.setRemoteDescription(offerDescription)

          // Create and set local answer description
          const answerDescription = await pc.createAnswer()
          await pc.setLocalDescription(answerDescription)

          // Save answer to Firestore
          await updateDoc(callDoc, {
            [`answer_${participantId}`]: {
              sdp: answerDescription.sdp,
              type: answerDescription.type,
            },
          })
        }

        // Listen for ICE candidates from the offerer
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

        // Store the unsubscribe function for cleanup later
        peerConnections.set(participantId, { pc, unsubscribeOfferCandidates })
      }

      // Return cleanup function to close connections and unsubscribe listeners
      return () => {
        peerConnections.forEach(({ pc, unsubscribeOfferCandidates }) => {
          pc.close()
          unsubscribeOfferCandidates()
        })
        peerConnections.clear()
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
