import {
  FirestoreCollections,
  peerConstraints,
  sessionConstraints,
} from '@/constants/gc'
import { useRouter } from 'expo-router'
import { collection, doc, setDoc } from 'firebase/firestore'
import { useCallback, useRef, useState } from 'react'
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

  const listenPeerConnections = useCallback(
    async (roomRef: any, createdUserName: string) => {
      roomRef
        .collection(FirestoreCollections.connections)
        .onSnapshot((connectionSnapshot) => {
          // looping changes from collection Connections
          connectionSnapshot.docChanges().forEach(async (change) => {
            if (change.type === 'added') {
              const data = change.doc.data()

              // find connections that request answer from current user
              if (data.responder === createdUserName) {
                // get requester's location from collection Participants
                const requestParticipantRef = roomRef
                  .collection(FirestoreCollections.participants)
                  .doc(data.requester)

                // get requester's data from requester's location
                const requestParticipantData = (
                  await requestParticipantRef.get()
                ).data()

                // store requester's control status in remoteMedias
                setRemoteMedias((prev) => ({
                  ...prev,
                  [data.requester]: {
                    mic: requestParticipantData?.mic,
                    camera: requestParticipantData?.camera,
                  },
                }))

                // init requester's remoteStream to add track data from Peer Connection later
                setRemoteStreams((prev) => ({
                  ...prev,
                  [data.requester]: new MediaStream([]),
                }))

                // init PeerConnection
                const peerConnection = new RTCPeerConnection(peerConstraints)

                // get location of connection between requester and current user
                const connectionsCollection = roomRef.collection(
                  FirestoreCollections.connections,
                )
                const connectionRef = connectionsCollection.doc(
                  `${data.requester}-${createdUserName}`,
                )

                // create answerCandidates collection
                const answerCandidatesCollection = connectionRef.collection(
                  FirestoreCollections.answerCandidates,
                )

                // add current user's stream to created PC (Peer Connection)
                localStream?.getTracks().forEach((track) => {
                  peerConnection.addTrack(track, localStream)
                })

                // get requester's MediaStream from PC
                peerConnection.addEventListener('track', (event) => {
                  event.streams[0].getTracks().forEach((track) => {
                    const remoteStream =
                      remoteStreams[data.requester] ?? new MediaStream([])
                    remoteStream.addTrack(track)

                    // and store in remoteStreams as it's initialized before
                    setRemoteStreams((prev) => ({
                      ...prev,
                      [data.requester]: remoteStream,
                    }))
                  })
                })

                // add current user's ICE Candidates to answerCandidates collection
                peerConnection.addEventListener('icecandidate', (event) => {
                  if (event.candidate) {
                    answerCandidatesCollection.add(event.candidate.toJSON())
                  }
                })

                // get data from requester-user's connection
                const connectionData = (await connectionRef.get()).data()

                // receive offer SDP and set as remoteDescription
                const offer = connectionData?.offer
                await peerConnection.setRemoteDescription(offer)

                // create answer SDP and set as localDescription
                const answerDescription = await peerConnection.createAnswer()
                await peerConnection.setLocalDescription(answerDescription)

                // send answer to Firestore
                const answer = {
                  type: answerDescription.type,
                  sdp: answerDescription.sdp,
                }
                await connectionRef.update({ answer })

                // collect Offer's ICE candidates from offerCandidates collection and add in PC
                connectionRef
                  .collection(FirestoreCollections.offerCandidates)
                  .onSnapshot((iceCandidateSnapshot) => {
                    iceCandidateSnapshot
                      .docChanges()
                      .forEach(async (iceCandidateChange) => {
                        if (iceCandidateChange.type === 'added') {
                          await peerConnection.addIceCandidate(
                            new RTCIceCandidate(iceCandidateChange.doc.data()),
                          )
                        }
                      })
                  })

                // store peer collections
                setPeerConnections((prev) => ({
                  ...prev,
                  [data.requester]: peerConnection,
                }))
              }
            }
          })
        })
    },
    [
      localStream,
      remoteStreams,
      setPeerConnections,
      setRemoteMedias,
      setRemoteStreams,
    ],
  )

  const registerPeerConnection = useCallback(
    async (roomRef: any, createdUserName: string) => {
      // loop all participants data
      const participants = await roomRef
        .collection(FirestoreCollections.participants)
        .get()
      participants.forEach(async (participantSnapshot) => {
        const participant = participantSnapshot.data()

        // store participant's control status in remoteMedias
        setRemoteMedias((prev) => ({
          ...prev,
          [participant.name]: {
            mic: participant?.mic,
            camera: participant?.camera,
          },
        }))

        // init participant's remoteStream to add track data from Peer Connection later
        setRemoteStreams((prev) => ({
          ...prev,
          [participant.name]: new MediaStream([]),
        }))

        // init peer connection
        const peerConnection = new RTCPeerConnection(peerConstraints)

        // create connection between current user and participant
        const connectionsCollection = roomRef.collection(
          FirestoreCollections.connections,
        )
        const connectionRef = connectionsCollection.doc(
          `${createdUserName}-${participant.name}`,
        )

        // create offerCandidates collection
        const offerCandidatesCollection = connectionRef.collection(
          FirestoreCollections.offerCandidates,
        )

        // add current user's stream to created PC (Peer Connection)
        localStream?.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream)
        })

        // get participant's MediaStream from PC
        peerConnection.addEventListener('track', (event) => {
          event.streams[0].getTracks().forEach((track) => {
            const remoteStream =
              remoteStreams[participant.name] ?? new MediaStream([])
            remoteStream.addTrack(track)

            // and store in remoteStreams as it's initialized before
            setRemoteStreams((prev) => ({
              ...prev,
              [participant.name]: remoteStream,
            }))
          })
        })

        // add current user's ICE Candidates to offerCandidates collection
        peerConnection.addEventListener('icecandidate', (event) => {
          if (event.candidate) {
            offerCandidatesCollection.add(event.candidate.toJSON())
          }
        })

        // create offer SDP and set localDescription
        const offerDescription =
          await peerConnection.createOffer(sessionConstraints)
        peerConnection.setLocalDescription(offerDescription)

        // send offer to Firestore
        const offer = {
          type: offerDescription.type,
          sdp: offerDescription.sdp,
        }
        await connectionRef.set({
          offer,
          requester: createdUserName,
          responder: participant.name,
        })

        // add listener to coming answers
        connectionRef.onSnapshot(async (connectionSnapshot) => {
          const data = connectionSnapshot.data()
          // if PC does not have any remoteDescription and answer existed
          if (!peerConnection.remoteDescription && data?.answer) {
            // get answer and set as remoteDescription
            const answerDescription = new RTCSessionDescription(data.answer)
            await peerConnection.setRemoteDescription(answerDescription)
          }
        })

        // add listener to answerCandidates collection to participant's ICE Candidates
        connectionRef
          .collection(FirestoreCollections.answerCandidates)
          .onSnapshot((iceCandidatesSnapshot) => {
            iceCandidatesSnapshot.docChanges().forEach(async (change) => {
              if (change.type === 'added') {
                // get Answer's ICE candidates and add in PC
                await peerConnection.addIceCandidate(
                  new RTCIceCandidate(change.doc.data()),
                )
              }
            })
          })

        // store peer connections
        setPeerConnections((prev) => ({
          ...prev,
          [participant.name]: peerConnection,
        }))
      })
    },
    [
      localStream,
      remoteStreams,
      setPeerConnections,
      setRemoteMedias,
      setRemoteStreams,
    ],
  )

  const createRoom = useCallback(async () => {
    // create room with current userName and set createdDate as current datetime

    const roomRef = doc(collection(db, FirestoreCollections.rooms), userName)

    // Set data in the main document
    await setDoc(roomRef, { createdDate: new Date() })

    // Reference to the subcollection 'participants' in the 'rooms' document
    const participantRef = doc(
      collection(roomRef, FirestoreCollections.participants),
      userName,
    )

    // Set data in the subcollection document
    await setDoc(participantRef, {
      mic: localMediaControl?.mic,
      camera: localMediaControl?.camera,
      name: userName,
    })

    // add listener to new peer connection in Firestore
    await listenPeerConnections(roomRef, userName)
  }, [
    userName,
    listenPeerConnections,
    localMediaControl?.camera,
    localMediaControl?.mic,
  ])

  const joinRoom = useCallback(
    async (roomRef: any) => {
      // register new PeerConnection to FireStore
      await registerPeerConnection(roomRef, userName)

      // add user data to participants collection
      await roomRef
        .collection(FirestoreCollections.participants)
        .doc(userName)
        .set({
          mic: localMediaControl?.mic,
          camera: localMediaControl?.camera,
          name: userName,
        })

      // also listen to new coming PeerConnections
      await listenPeerConnections(roomRef, userName)
    },
    [
      userName,
      registerPeerConnection,
      localMediaControl?.mic,
      localMediaControl?.camera,
      listenPeerConnections,
    ],
  )

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
