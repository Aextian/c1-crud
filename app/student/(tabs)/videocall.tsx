import { db } from '@/config'
import {
  FirestoreCollections,
  peerConstraints,
  sessionConstraints,
} from '@/constants/gc'
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

const {
  // Boolean value if permission is granted
  cameraPermissionGranted,
  microphonePermissionGranted,

  // request permission methods
  requestMicrophonePermission,
  requestCameraPermission,
} = Permissions()

const [localMediaControl, setLocalMediaControl] = useState<MediaControl>({
  mic: microphonePermissionGranted,
  camera: cameraPermissionGranted,
})

export enum Screen {
  CreateRoom,
  InRoomCall,
}

export type RemoteSteam = {
  track: MediaStream
  mic: boolean
  camera: boolean
  id: string
}

export type MediaControl = {
  mic: boolean
  camera: boolean
  speaker?: boolean
}

const { width, height } = Dimensions.get('screen')

export const HomeScreen: React.FC<any> = () => {
  const [roomId, setRoomId] = useState('')
  const [localStream, setLocalStream] = useState<MediaStream | undefined>()
  const [userName, setUserName] = useState('')
  const [screen, setScreen] = useState(Screen.CreateRoom)
  const [remoteMedias, setRemoteMedias] = useState<{
    [key: string]: MediaControl
  }>({})
  const [remoteStreams, setRemoteStreams] = useState<{
    [key: string]: MediaStream
  }>({})
  const [peerConnections, setPeerConnections] = useState<{
    [key: string]: RTCPeerConnection
  }>({})
  const [totalParticipants, setTotalParticipants] = useState(0)

  const listenPeerConnections = useCallback(
    async (roomRef, createdUserName) => {
      // Reference to the connection collection where all peer connections are stored
      const connectionSnapshot = collection(roomRef, 'connections') // Use roomRef to get connections collection

      const unsubscribeCandidates = onSnapshot(
        connectionSnapshot,
        (snapshot) => {
          // Loop through all changes in the connections collection
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === 'added') {
              const data = change.doc.data()

              // Check if the responder is the current user
              if (data.responder === createdUserName) {
                // Get the requester's participant data from the participants collection
                const requestParticipantRef = doc(
                  roomRef,
                  'participants',
                  data.requester,
                ) // Reference to the requester's document
                const requestParticipantData = (
                  await getDoc(requestParticipantRef)
                ).data()

                // Update the remote media controls for the requester
                setRemoteMedias((prev) => ({
                  ...prev,
                  [data.requester]: {
                    mic: requestParticipantData?.mic,
                    camera: requestParticipantData?.camera,
                  },
                }))

                // Initialize the requester's remote stream
                setRemoteStreams((prev) => ({
                  ...prev,
                  [data.requester]: new MediaStream([]),
                }))

                // Initialize PeerConnection for the requester
                const peerConnection = new RTCPeerConnection(peerConstraints)

                // Get the connection document for the current user and the requester
                const connectionRef = doc(
                  roomRef,
                  'connections',
                  `${data.requester}-${createdUserName}`,
                )
                const answerCandidatesCollection = collection(
                  connectionRef,
                  'answerCandidates',
                ) // Create the answerCandidates sub-collection

                // Add current user's local stream tracks to the PeerConnection
                localStream?.getTracks().forEach((track) => {
                  peerConnection.addTrack(track, localStream)
                })

                // Handle incoming tracks from the requester’s MediaStream
                peerConnection.addEventListener('track', (event) => {
                  event.streams[0].getTracks().forEach((track) => {
                    const remoteStream =
                      remoteStreams[data.requester] ?? new MediaStream([])
                    remoteStream.addTrack(track)

                    // Store the remote stream
                    setRemoteStreams((prev) => ({
                      ...prev,
                      [data.requester]: remoteStream,
                    }))
                  })
                })

                // Handle ICE candidates and store them in the Firestore collection
                peerConnection.addEventListener('icecandidate', (event) => {
                  if (event.candidate) {
                    addDoc(answerCandidatesCollection, event.candidate.toJSON())
                  }
                })

                // Get the connection data (offer) from Firestore
                const connectionData = (await getDoc(connectionRef)).data()
                const offer = connectionData?.offer

                // Set the offer as the remote description
                await peerConnection.setRemoteDescription(offer)

                // Create an answer and set it as the local description
                const answerDescription = await peerConnection.createAnswer()
                await peerConnection.setLocalDescription(answerDescription)

                // Send the answer to Firestore
                const answer = {
                  type: answerDescription.type,
                  sdp: answerDescription.sdp,
                }
                await updateDoc(connectionRef, { answer })

                // Listen for ICE candidates from the offerCandidates collection and add to the PeerConnection
                const offerCandidatesCollection = collection(
                  connectionRef,
                  'offerCandidates',
                )
                onSnapshot(
                  offerCandidatesCollection,
                  (iceCandidateSnapshot) => {
                    iceCandidateSnapshot
                      .docChanges()
                      .forEach(async (iceCandidateChange) => {
                        if (iceCandidateChange.type === 'added') {
                          await peerConnection.addIceCandidate(
                            new RTCIceCandidate(iceCandidateChange.doc.data()),
                          )
                        }
                      })
                  },
                )

                // Store the peer connection for later use
                setPeerConnections((prev) => ({
                  ...prev,
                  [data.requester]: peerConnection,
                }))
              }
            }
          })
        },
      )

      // Return the unsubscribe function to stop listening for updates when needed
      return unsubscribeCandidates
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
      try {
        // Loop through all participants data
        const participantsSnapshot = await getDocs(
          collection(roomRef, FirestoreCollections.participants),
        )

        participantsSnapshot.forEach(async (participantSnapshot) => {
          const participant = participantSnapshot.data()

          // Store participant's control status in remoteMedias
          setRemoteMedias((prev) => ({
            ...prev,
            [participant.name]: {
              mic: participant?.mic,
              camera: participant?.camera,
            },
          }))

          // Init participant's remoteStream to add track data from Peer Connection later
          setRemoteStreams((prev) => ({
            ...prev,
            [participant.name]: new MediaStream([]),
          }))

          // Initialize peer connection
          const peerConnection = new RTCPeerConnection(peerConstraints)

          // Create connection between current user and participant
          const connectionsCollection = collection(
            roomRef,
            FirestoreCollections.connections,
          )
          const connectionRef = doc(
            connectionsCollection,
            `${createdUserName}-${participant.name}`,
          )

          // Create offerCandidates collection
          const offerCandidatesCollection = collection(
            connectionRef,
            FirestoreCollections.offerCandidates,
          )

          // Add current user's stream to created PC (Peer Connection)
          localStream?.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream)
          })

          // Get participant's MediaStream from PC
          peerConnection.addEventListener('track', (event) => {
            event.streams[0].getTracks().forEach((track) => {
              const remoteStream =
                remoteStreams[participant.name] ?? new MediaStream([])
              remoteStream.addTrack(track)

              // Store in remoteStreams as it's initialized before
              setRemoteStreams((prev) => ({
                ...prev,
                [participant.name]: remoteStream,
              }))
            })
          })

          // Add current user's ICE Candidates to offerCandidates collection
          peerConnection.addEventListener('icecandidate', (event) => {
            if (event.candidate) {
              addDoc(offerCandidatesCollection, event.candidate.toJSON())
            }
          })

          // Create offer SDP and set localDescription
          const offerDescription =
            await peerConnection.createOffer(sessionConstraints)
          peerConnection.setLocalDescription(offerDescription)

          // Send offer to Firestore
          const offer = {
            type: offerDescription.type,
            sdp: offerDescription.sdp,
          }
          await setDoc(connectionRef, {
            offer,
            requester: createdUserName,
            responder: participant.name,
          })

          // Add listener to coming answers
          onSnapshot(connectionRef, async (connectionSnapshot) => {
            const data = connectionSnapshot.data()
            // If PC does not have any remoteDescription and answer exists
            if (!peerConnection.remoteDescription && data?.answer) {
              // Get answer and set as remoteDescription
              const answerDescription = new RTCSessionDescription(data.answer)
              await peerConnection.setRemoteDescription(answerDescription)
            }
          })

          // Add listener to answerCandidates collection to participant's ICE Candidates
          const answerCandidatesCollection = collection(
            connectionRef,
            FirestoreCollections.answerCandidates,
          )
          onSnapshot(answerCandidatesCollection, (iceCandidatesSnapshot) => {
            iceCandidatesSnapshot.docChanges().forEach(async (change) => {
              if (change.type === 'added') {
                // Get Answer's ICE candidates and add in PC
                await peerConnection.addIceCandidate(
                  new RTCIceCandidate(change.doc.data()),
                )
              }
            })
          })

          // Store peer connections
          setPeerConnections((prev) => ({
            ...prev,
            [participant.name]: peerConnection,
          }))
        })
      } catch (error) {
        console.error('Error registering peer connection: ', error)
      }
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
    try {
      // Create room with current userName and set createdDate as current datetime
      const roomRef = doc(collection(db, FirestoreCollections.rooms), userName)
      await setDoc(roomRef, { createdDate: new Date() })

      // Create participants collection in the room with current user
      const participantRef = doc(
        collection(roomRef, FirestoreCollections.participants),
        userName,
      )
      await setDoc(participantRef, {
        // Control mic and camera status of current user's device
        mic: localMediaControl?.mic,
        camera: localMediaControl?.camera,
        name: userName,
      })

      // Store the new created roomId and navigate to InRoomCall screen
      setRoomId(roomRef.id)
      setScreen(Screen.InRoomCall)

      // Add listener to new peer connection in Firestore
      await listenPeerConnections(roomRef, userName)
    } catch (error) {
      console.error('Error creating room: ', error)
    }
  }, [
    userName,
    listenPeerConnections,
    localMediaControl?.camera,
    localMediaControl?.mic,
  ])

  const joinRoom = useCallback(
    async (roomRef: any) => {
      try {
        // Register new PeerConnection to Firestore
        await registerPeerConnection(roomRef, userName)

        // Add user data to participants collection in the room
        const participantRef = doc(
          collection(roomRef, FirestoreCollections.participants),
          userName,
        )
        await setDoc(participantRef, {
          mic: localMediaControl?.mic,
          camera: localMediaControl?.camera,
          name: userName,
        })

        // Listen to new incoming PeerConnections
        await listenPeerConnections(roomRef, userName)

        // Navigate to InRoomCall screen
        setScreen(Screen.InRoomCall)
      } catch (error) {
        console.error('Error joining room: ', error)
      }
    },
    [
      userName,
      registerPeerConnection,
      localMediaControl?.mic,
      localMediaControl?.camera,
      listenPeerConnections,
    ],
  )

  const checkRoomExist = useCallback(() => {
    // get room data based on the entered room id
    const roomRef = database.collection(FirestoreCollections.rooms).doc(roomId)

    roomRef.get().then((docSnapshot) => {
      if (!docSnapshot.exists) {
        Alert.alert('Room not found')
        setRoomId('')
        return
      } else {
        joinRoom(roomRef) // process to join room if room is existed
      }
    })
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

  const toggleMicrophone = useCallback(() => {
    // check if permission is granted, if not call request permission
    if (microphonePermissionGranted) {
      // update state in local mediaControl
      setLocalMediaControl((prev) => ({
        ...prev,
        mic: !prev.mic,
      }))

      // update mic value of localStream
      localStream?.getAudioTracks().forEach((track) => {
        localMediaControl?.mic
          ? (track.enabled = false)
          : (track.enabled = true)
      })
      if (roomId) {
        // get location of current room that user's in
        const roomRef = database
          .collection(FirestoreCollections.rooms)
          .doc(roomId)

        // get location of user's participant data
        const participantRef = roomRef
          .collection(FirestoreCollections.participants)
          .doc(userName)

        // update mic value in Firestore
        participantRef.update({
          mic: !localMediaControl?.mic,
        })
      }
    } else {
      requestMicrophonePermission()
    }
  }, [
    localMediaControl?.mic,
    localStream,
    microphonePermissionGranted,
    requestMicrophonePermission,
    roomId,
    userName,
  ])

  const toggleCamera = useCallback(() => {
    // check if permission is granted, if not call request permission
    if (cameraPermissionGranted) {
      // update state in local mediaControl
      setLocalMediaControl((prev) => ({
        ...prev,
        camera: !prev.camera,
      }))

      // update camera value of localStream
      localStream?.getVideoTracks().forEach((track) => {
        localMediaControl?.camera
          ? (track.enabled = false)
          : (track.enabled = true)
      })
      if (roomId) {
        // get location of current room that user's in
        const roomRef = database
          .collection(FirestoreCollections.rooms)
          .doc(roomId)

        // get location of user's participant data
        const participantRef = roomRef
          .collection(FirestoreCollections.participants)
          .doc(userName)

        // update camera value in Firestore
        participantRef.update({
          camera: !localMediaControl?.camera,
        })
      }
    } else {
      requestCameraPermission()
    }
  }, [
    cameraPermissionGranted,
    localMediaControl?.camera,
    localStream,
    requestCameraPermission,
    roomId,
    userName,
  ])

  const hangUp = useCallback(async () => {
    // stop local stream
    localStream?.getTracks()?.forEach((track) => {
      track.stop()
    })

    // stop remote streams
    if (remoteStreams) {
      Object.keys(remoteStreams).forEach((remoteStreamKey) => {
        remoteStreams[remoteStreamKey]
          .getTracks()
          .forEach((track) => track.stop())
      })
    }

    // close peer connections
    if (peerConnections) {
      Object.keys(peerConnections).forEach((peerConnectionKey) => {
        peerConnections[peerConnectionKey].close()
      })
    }

    // get location of current room
    const roomRef = database.collection(FirestoreCollections.rooms).doc(roomId)

    // remove room data if no one here
    if (totalParticipants === 1) {
      const batch = database.batch()

      // delete all data Participants
      const participants = await roomRef
        .collection(FirestoreCollections.participants)
        .get()
      participants?.forEach((doc) => {
        batch.delete(doc.ref)
      })

      // delete all data Connections
      const connections = await roomRef
        .collection(FirestoreCollections.connections)
        .get()
      connections?.forEach((doc) => {
        batch.delete(doc.ref)
      })

      // delete current room detail data and this room in Rooms
      await batch.commit()
      await roomRef.delete()
    } else {
      // delete user data in Participants collection
      await roomRef
        .collection(FirestoreCollections.participants)
        .doc(userName)
        .delete()

      // filter data has userName is requester or responder
      const Filter = firebase.firestore.Filter
      const connectionSnapshot = await roomRef
        .collection(FirestoreCollections.connections)
        .where(
          Filter.or(
            Filter('requester', '==', userName),
            Filter('responder', '==', userName),
          ),
        )
        .get()

      // delete all filtered connections one by one
      connectionSnapshot?.docs?.forEach?.(async (doc) => {
        const batch = database.batch()

        // delete all data answerCandidates
        const answerCandidates = await doc.ref
          .collection(FirestoreCollections.answerCandidates)
          .get()
        answerCandidates.forEach((answerDoc) => {
          batch.delete(answerDoc.ref)
        })

        // delete all data offerCandidates
        const offerCandidates = await doc.ref
          .collection(FirestoreCollections.offerCandidates)
          .get()
        offerCandidates.forEach((offerDoc) => {
          batch.delete(offerDoc.ref)
        })

        // delete connection detail and remove it from Connections
        await batch.commit()
        doc.ref.delete()
      })
    }

    // reset data
    setRoomId('')
    setScreen(Screen.CreateRoom)
    setRemoteMedias({})
    setRemoteStreams({})
    setPeerConnections({})
    setTotalParticipants(0)

    // if user still enable camera or microphone, call openMediaDevices to show it locally
    if (localMediaControl?.camera || localMediaControl?.mic) {
      openMediaDevices(localMediaControl?.mic, localMediaControl?.camera)
    }
  }, [
    localStream,
    remoteStreams,
    peerConnections,
    roomId,
    totalParticipants,
    setRemoteMedias,
    setRemoteStreams,
    setPeerConnections,
    localMediaControl?.camera,
    localMediaControl?.mic,
    userName,
    openMediaDevices,
  ])

  useEffect(() => {
    setLocalMediaControl({
      mic: microphonePermissionGranted,
      camera: cameraPermissionGranted,
    })
    if (cameraPermissionGranted || microphonePermissionGranted) {
      openMediaDevices(microphonePermissionGranted, cameraPermissionGranted)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraPermissionGranted, microphonePermissionGranted])

  useEffect(() => {
    if (roomId) {
      const roomRef = database
        .collection(FirestoreCollections.rooms)
        .doc(roomId)
      const participantRef = roomRef.collection(
        FirestoreCollections.participants,
      )
      if (participantRef) {
        // listener to new changes from Participants collection
        participantRef.onSnapshot((snapshot) => {
          // get current total participants in Firestore
          if (totalParticipants !== snapshot.size) {
            setTotalParticipants(snapshot.size)
          }

          // loop through new data changes
          snapshot.docChanges().forEach(async (change) => {
            const data = change.doc.data()
            if (change.type === 'modified') {
              // ignore changes from current user
              if (data?.name !== userName) {
                // update new change in remoteMedias
                setRemoteMedias((prev) => ({
                  ...prev,
                  [data.name]: {
                    camera: data?.camera,
                    mic: data?.mic,
                  },
                }))
              }
            } else if (change.type === 'removed') {
              // update remote streams to remove leaver's streams
              setRemoteStreams((prev) => {
                const newRemoteStreams = { ...prev }
                delete newRemoteStreams[data?.name]
                return newRemoteStreams
              })

              // update remote medias to remove leaver's control status
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
      <KeyboardAvoidingView
        behavior={isIOS ? 'padding' : 'height'}
        style={[styles.container, styles.spacingBottom]}
      >
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          style={styles.flex}
        >
          <>
            {localStream && localMediaControl?.camera ? (
              <View style={styles.localStream}>
                <RTCView
                  streamURL={localStream.toURL()}
                  style={styles.flex}
                  mirror={true}
                />
                {!localMediaControl?.mic && (
                  <Control
                    showMuteAudio
                    muteAudioColor={colors.white}
                    containerStyle={styles.localControl}
                  />
                )}
              </View>
            ) : (
              <View style={styles.noCamera}>
                <Avatar title={userName} />
                {!localMediaControl?.mic && (
                  <Control
                    showMuteAudio
                    containerStyle={styles.remoteControlContainer}
                  />
                )}
              </View>
            )}
            <Control
              mediaControl={localMediaControl}
              toggleMicrophone={toggleMicrophone}
              toggleCamera={toggleCamera}
            />
            <TextInput
              style={styles.nameInput}
              value={userName}
              placeholder="Enter display name"
              onChangeText={setUserName}
            />
            <Pressable
              style={[styles.button, !userName && styles.buttonDisabled]}
              onPress={createRoom}
              disabled={!userName}
            >
              <Text style={styles.buttonTitle}>Create room</Text>
            </Pressable>
            <View style={styles.joinContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter room id"
                onChangeText={setRoomId}
              />
              <Pressable
                style={[styles.joinButton, !roomId && styles.buttonDisabled]}
                onPress={checkRoomExist}
                disabled={!roomId}
              >
                <Text style={styles.buttonTitle}>Join</Text>
              </Pressable>
            </View>
          </>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    ),
    [
      localStream,
      localMediaControl,
      userName,
      toggleMicrophone,
      toggleCamera,
      createRoom,
      roomId,
      checkRoomExist,
    ],
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
                <RTCView
                  streamURL={stream?.toURL()}
                  style={styles.flex}
                  objectFit="cover"
                />
                {!media?.mic && (
                  <Control
                    showMuteAudio
                    muteAudioColor={colors.white}
                    containerStyle={styles.remoteControlWithCameraOn}
                  />
                )}
              </View>
            ) : (
              <View
                key={`${remoteStreamKey}-noCamera`}
                style={[styles.noCameraInRoom, mediaDimension]}
              >
                <Avatar title={remoteStreamKey} />
                {!media?.mic && (
                  <Control
                    showMuteAudio
                    containerStyle={styles.remoteControlContainer}
                  />
                )}
              </View>
            )}
          </View>
        )
      }),
    [mediaDimension, remoteMedias, remoteStreams],
  )

  const InRoomCallScreen = useCallback(
    () => (
      <View style={styles.container}>
        {totalParticipants === 1 ? (
          <View style={styles.noUsersContainer}>
            <Text style={styles.noUserText}>
              No one here.{'\n'}Share your room ID for other users to join
            </Text>
          </View>
        ) : (
          <ScrollView>
            <View style={styles.flexWrap}>{renderRemoteStreams()}</View>
          </ScrollView>
        )}
        <DraggableStream
          stream={localStream}
          mediaControl={localMediaControl}
          title={userName}
        />
        <Clipboard title={roomId} />
        <Control
          hangUp={hangUp}
          mediaControl={localMediaControl}
          toggleMicrophone={toggleMicrophone}
          toggleCamera={toggleCamera}
          containerStyle={styles.controlContainer}
          iconSize={metrics.sMedium}
        />
      </View>
    ),
    [
      totalParticipants,
      renderRemoteStreams,
      localStream,
      localMediaControl,
      userName,
      roomId,
      hangUp,
      toggleMicrophone,
      toggleCamera,
    ],
  )

  switch (screen) {
    case Screen.CreateRoom:
      return CreateRoomScreen()
    case Screen.InRoomCall:
      return InRoomCallScreen()
    default:
      return null
  }
}
