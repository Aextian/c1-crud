import { db } from '@/config'
import {
  FirestoreCollections,
  peerConstraints,
  sessionConstraints,
} from '@/constants/gc'
import { useStateRef } from '@/hooks/useStateRef'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import {
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCView,
  mediaDevices,
} from 'react-native-webrtc'

enum Screen {
  CreateRoom,
  InRoomCall,
}

type RemoteSteam = {
  track: MediaStream
  mic: boolean
  camera: boolean
  id: string
}

type MediaControl = {
  mic: boolean
  camera: boolean
  speaker?: boolean
}

const HomeScreen: React.FC<any> = () => {
  const { width, height } = Dimensions.get('screen')

  const [roomId, setRoomId] = useState('')
  const [localStream, setLocalStream] = useState<MediaStream | undefined>()
  const [userName, setUserName] = useState('')
  const [screen, setScreen] = useState(Screen.CreateRoom)
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

  // const {
  //   // Boolean value if permission is granted
  //   cameraPermissionGranted,
  //   microphonePermissionGranted,

  //   // request permission methods
  //   requestMicrophonePermission,
  //   requestCameraPermission,
  // } = usePermission()
  // const [localMediaControl, setLocalMediaControl] = useState<any>({
  //   mic: microphonePermissionGranted,
  //   camera: cameraPermissionGranted,
  // })

  const listenPeerConnections = useCallback(
    async (roomRef: any, createdUserName: string) => {
      const connectionCollecttion = collection(
        roomRef, // This refers to the subcollection under the document
        FirestoreCollections.connections,
      )

      onSnapshot(connectionCollecttion, (connectionSnapshot) => {
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
              const connectionsCollection = collection(
                roomRef,
                FirestoreCollections.connections,
              )

              const connectionRef = doc(
                connectionsCollection,
                `${data.requester}-${createdUserName}`,
              )

              // create answerCandidates collection
              const answerCandidatesCollection = collection(
                connectionRef,
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
                  // Add the ICE candidate to Firestore using addDoc
                  addDoc(answerCandidatesCollection, event.candidate.toJSON())
                    .then((docRef) => {
                      console.log('ICE candidate added with ID: ', docRef.id)
                    })
                    .catch((error) => {
                      console.error('Error adding ICE candidate: ', error)
                    })
                }
              })

              // get data from requester-user's connection
              // Assuming connectionRef is already a reference to a Firestore document
              const connectionSnapshot = await getDoc(connectionRef)

              const connectionData = connectionSnapshot.data()
              console.log(connectionData) // You can access the document data here

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

              await updateDoc(connectionRef, {
                answer: answer,
              })

              const offerCandidatesRef = collection(
                connectionRef,
                FirestoreCollections.offerCandidates,
              )

              onSnapshot(offerCandidatesRef, (iceCandidateSnapshot) => {
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
      // / Get a reference to the participants collection within the room document
      const participantsCollectionRef = collection(
        roomRef,
        FirestoreCollections.participants,
      )

      // Retrieve the participants documents
      const participantsSnapshot = await getDocs(participantsCollectionRef)

      // Extract the data for each participant document
      const participants = participantsSnapshot.docs.map((doc) => doc.data())

      participants.forEach(async (participant) => {
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
        const connectionsCollection = collection(
          roomRef,
          FirestoreCollections.connections,
        )

        // const connectionRef = doc(
        //   connectionsCollection,
        //   `${createdUserName}-${participant.name}`,
        // )

        // Create a reference to a specific document in the `connectionsCollection`
        const connectionRef = doc(
          connectionsCollection,
          `${createdUserName}-${participant.name}`,
        )

        // create offerCandidates collection
        const offerCandidatesCollection = collection(
          connectionRef,
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

        peerConnection.addEventListener('icecandidate', (event) => {
          if (event.candidate) {
            // Add the ICE candidate to Firestore using addDoc
            addDoc(offerCandidatesCollection, event.candidate.toJSON())
              .then((docRef) => {
                console.log('ICE candidate added with ID: ', docRef.id)
              })
              .catch((error) => {
                console.error('Error adding ICE candidate: ', error)
              })
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

        await updateDoc(connectionRef, {
          offer, // Offer object or data
          requester: createdUserName, // Name or ID of the person making the request
          responder: participant.name, // Name or ID of the person responding
        })

        onSnapshot(connectionRef, async (snapshot) => {
          const data = snapshot.doc.data() // Access the document data
          if (
            data &&
            peerConnection &&
            !peerConnection.remoteDescription &&
            data.answer
          ) {
            try {
              // Create RTCSessionDescription from the answer data
              const answerDescription = new RTCSessionDescription(data.answer)

              // Set remote description on the peer connection
              await peerConnection.setRemoteDescription(answerDescription)
            } catch (error) {
              console.error('Error setting remote description:', error)
            }
          }
        })

        const answerCandidatesCollection = collection(
          connectionRef,
          FirestoreCollections.answerCandidates,
        )

        // Listen for changes in the `answerCandidates` sub-collection
        onSnapshot(answerCandidatesCollection, (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === 'added') {
              // Get ICE candidate data and add it to the peer connection
              const candidateData = change.doc.data()
              if (candidateData) {
                try {
                  const iceCandidate = new RTCIceCandidate(candidateData)
                  await peerConnection.addIceCandidate(iceCandidate)
                } catch (error) {
                  console.error('Error adding ICE candidate:', error)
                }
              }
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
      // mic: localMediaControl?.mic,
      // camera: localMediaControl?.camera,
      name: userName,
    })

    // add listener to new peer connection in Firestore
    await listenPeerConnections(roomRef, userName)
  }, [
    userName,
    listenPeerConnections,
    // localMediaControl?.camera,
    // localMediaControl?.mic,
  ])

  const joinRoom = useCallback(
    async (roomRef: any) => {
      // register new PeerConnection to FireStore
      await registerPeerConnection(roomRef, userName)

      // Reference to the participants collection within the room document
      const participantsCollectionRef = collection(
        roomRef,
        FirestoreCollections.participants,
      )

      // Create a document reference within the participants collection for the user
      const userDocRef = doc(participantsCollectionRef, userName)

      // Set the user data in the participants collection
      await setDoc(userDocRef, {
        // mic: localMediaControl?.mic,
        // camera: localMediaControl?.camera,
        name: userName,
      })

      // also listen to new coming PeerConnections
      await listenPeerConnections(roomRef, userName)
    },
    [
      userName,
      registerPeerConnection,
      // localMediaControl?.mic,
      // localMediaControl?.camera,
      listenPeerConnections,
    ],
  )

  const checkRoomExist = useCallback(async () => {
    // Reference to the specific room document
    const roomRef = doc(collection(db, FirestoreCollections.rooms), roomId)

    try {
      const docSnapshot = await getDoc(roomRef)
      if (!docSnapshot.exists()) {
        Alert.alert('Room not found')
        setRoomId('')
      } else {
        joinRoom(roomRef) // Process to join the room if it exists
      }
    } catch (error) {
      console.error('Error checking room existence:', error)
    }
  }, [joinRoom, roomId])

  const openMediaDevices = useCallback(
    async (audio: boolean, video: boolean) => {
      // get media devices stream from webRTC API
      const mediaStream = await mediaDevices.getUserMedia({
        audio,
        video,
      })

      // init peer connection to show user's track locally
      const peerConnection = new RTCPeerConnection(peerConstraints)

      // add track from created mediaStream to peer connection
      mediaStream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, mediaStream))

      // set mediaStream in localStream
      setLocalStream(mediaStream)
    },
    [],
  )

  // const toggleMicrophone = useCallback(() => {
  //   // check if permission is granted, if not call request permission
  //   if (microphonePermissionGranted) {
  //     // update state in local mediaControl
  //     setLocalMediaControl((prev) => ({
  //       ...prev,
  //       mic: !prev.mic,
  //     }))

  //     // update mic value of localStream
  //     localStream?.getAudioTracks().forEach((track) => {
  //       localMediaControl?.mic
  //         ? (track.enabled = false)
  //         : (track.enabled = true)
  //     })
  //     if (roomId) {
  //       // get location of current room that user's in

  //       const roomRef = doc(collection(db, FirestoreCollections.rooms), roomId)

  //       const participantRef = doc(
  //         collection(roomRef, FirestoreCollections.participants),
  //         userName,
  //       )

  //       // Update mic value in Firestore
  //       updateDoc(participantRef, {
  //         mic: !localMediaControl?.mic,
  //       })
  //     }
  //   } else {
  //     requestMicrophonePermission()
  //   }
  // }, [
  //   localMediaControl?.mic,
  //   localStream,
  //   microphonePermissionGranted,
  //   requestMicrophonePermission,
  //   roomId,
  //   userName,
  // ])

  // const toggleCamera = useCallback(() => {
  //   // check if permission is granted, if not call request permission
  //   if (cameraPermissionGranted) {
  //     // update state in local mediaControl
  //     setLocalMediaControl((prev) => ({
  //       ...prev,
  //       camera: !prev.camera,
  //     }))

  //     // update camera value of localStream
  //     localStream?.getVideoTracks().forEach((track) => {
  //       localMediaControl?.camera
  //         ? (track.enabled = false)
  //         : (track.enabled = true)
  //     })
  //     if (roomId) {
  //       // get location of current room that user's in

  //       // Get the room document reference
  //       const roomRef = doc(collection(db, FirestoreCollections.rooms), roomId)

  //       // Get the participant document reference inside the room's participants subcollection
  //       const participantRef = doc(
  //         collection(roomRef, FirestoreCollections.participants),
  //         userName,
  //       )

  //       // Update camera value in Firestore
  //       updateDoc(participantRef, {
  //         camera: !localMediaControl?.camera,
  //       })
  //     }
  //   } else {
  //     requestCameraPermission()
  //   }
  // }, [
  //   cameraPermissionGranted,
  //   localMediaControl?.camera,
  //   localStream,
  //   requestCameraPermission,
  //   roomId,
  //   userName,
  // ])

  useEffect(() => {
    // setLocalMediaControl({
    //   mic: microphonePermissionGranted,
    //   camera: cameraPermissionGranted,
    // })
    // if (cameraPermissionGranted || microphonePermissionGranted) {
    openMediaDevices(true, true)
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (roomId) {
      const roomRef = doc(collection(db, FirestoreCollections.rooms), roomId)

      const participantRef = collection(
        roomRef,
        FirestoreCollections.participants,
      )

      if (participantRef) {
        // Listener to new changes from Participants collection
        onSnapshot(participantRef, (snapshot) => {
          // Get current total participants in Firestore
          if (totalParticipants !== snapshot.size) {
            setTotalParticipants(snapshot.size)
          }

          // Loop through new data changes
          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data()
            if (change.type === 'modified') {
              // Ignore changes from current user
              if (data?.name !== userName) {
                // Update new change in remoteMedias
                setRemoteMedias((prev) => ({
                  ...prev,
                  [data.name]: {
                    camera: data?.camera,
                    mic: data?.mic,
                  },
                }))
              }
            } else if (change.type === 'removed') {
              // Update remote streams to remove leaver's streams
              setRemoteStreams((prev) => {
                const newRemoteStreams = { ...prev }
                delete newRemoteStreams[data?.name]
                return newRemoteStreams
              })

              // Update remote medias to remove leaver's control status
              setRemoteMedias((prev) => {
                const newRemoteMedias = { ...prev }
                delete newRemoteMedias[data?.name]
                return newRemoteMedias
              })
            }
          })
        })
      }
    }
  }, [
    totalParticipants,
    roomId,
    userName,
    remoteMediasRef,
    remoteStreamsRef,
    setRemoteMedias,
    setRemoteStreams,
  ])

  const CreateRoomScreen = useCallback(
    () => (
      <KeyboardAvoidingView>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <>
            {localStream && (
              <View>
                <RTCView streamURL={localStream.toURL()} mirror={true} />
              </View>
            )}

            <TextInput
              value={userName}
              placeholder="Enter display name"
              onChangeText={setUserName}
            />
            <Pressable onPress={createRoom} disabled={!userName}>
              <Text>Create room</Text>
            </Pressable>
            <View>
              <TextInput placeholder="Enter room id" onChangeText={setRoomId} />
              <Pressable onPress={checkRoomExist} disabled={!roomId}>
                <Text>Join</Text>
              </Pressable>
            </View>
          </>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    ),
    [localStream, userName, createRoom, roomId, checkRoomExist],
  )

  const mediaDimension = useMemo(
    () => ({
      width: width / (totalParticipants > 3 ? 2 : 1),
      height: height / (totalParticipants > 2 ? 2 : 1),
    }),
    [totalParticipants],
  )

  const renderRemoteStreams = useCallback(
    () =>
      !!remoteStreams &&
      Object.keys(remoteStreams).map((remoteStreamKey) => {
        const stream = remoteStreams[remoteStreamKey]
        const media = remoteMedias[remoteStreamKey]
        return (
          <View key={remoteStreamKey}>
            {media?.camera ? (
              <View style={mediaDimension} key={remoteStreamKey}>
                <RTCView streamURL={stream?.toURL()} objectFit="cover" />
              </View>
            ) : (
              <View key={`${remoteStreamKey}-noCamera`}></View>
            )}
          </View>
        )
      }),
    [mediaDimension, remoteMedias, remoteStreams],
  )

  const InRoomCallScreen = useCallback(
    () => (
      <View>
        {totalParticipants === 1 ? (
          <View>
            <Text>
              No one here.{'\n'}Share your room ID for other users to join
            </Text>
          </View>
        ) : (
          <ScrollView>
            <View>{renderRemoteStreams()}</View>
          </ScrollView>
        )}
      </View>
    ),
    [totalParticipants, renderRemoteStreams, localStream, userName, roomId],
  )

  return CreateRoomScreen()
  // switch (screen) {
  //   case Screen.CreateRoom:
  //     return CreateRoomScreen()
  //   case Screen.InRoomCall:
  //     return InRoomCallScreen()
  //   default:
  //     return null
  // }
}

export default HomeScreen
