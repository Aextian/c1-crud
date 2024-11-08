import { useRouter } from 'expo-router'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { useCallback, useState } from 'react'
import {
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
} from 'react-native-webrtc'
import { auth, db } from '../config'

const useGroupCall = () => {

  const [roomId, setRoomId] = useState('')
  const [localStream, setLocalStream] = useState<MediaStream | undefined>()
  const [userName, setUserName] = useState('')
  const [remoteMedias, setRemoteMedias,] = useState<{[key: string]: MediaStream}>({})
  const [remoteStreams, setRemoteStreams,] = useState<{[key: string]: MediaStream}>({})
  const [peerConnections, setPeerConnections] = useState<{
    [key: string]: RTCPeerConnection
  }>({})
  const [totalParticipants, setTotalParticipants] = useState(0)


  const FirestoreCollections = {
    rooms: 'rooms',
    users: 'users',
    participants: 'participants',
    connections: 'connections',
    offerCandidates: 'offerCandidates',
    answerCandidates: 'answerCandidates',
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


  const openMediaDevices = useCallback(async (audio: boolean, video: boolean) => {
    // get media devices stream from webRTC API
    const mediaStream = await mediaDevices.getUserMedia({
      audio,
      video,
    })

    // init peer connection to show user's track locally
    const peerConnection = new RTCPeerConnection(servers)

    // add track from created mediaStream to peer connection
    mediaStream.getTracks().forEach(track => peerConnection.addTrack(track, mediaStream))

    // set mediaStream in localStream
    setLocalStream(mediaStream)
  }, [])

  const createRoom = useCallback(async () => {
    // create room with current userName and set createdDate as current datetime
    const offerCandidates = collection(callDoc, 'offerCandidates')
    const roomRef = doc(collection(db,FirestoreCollections.rooms), userName)

    await setDoc(roomRef, {
      createdDate: serverTimestamp(),
    })

    const participantsRef = collection(roomRef, 'participants');
      // Set participant data
      await setDoc(doc(participantsRef, userName), {
        name: userName,
      });

    setRoomId(roomRef.id) // store new created roomId

    // add listener to new peer connection in Firestore



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

  const listenPeerConnections = useCallback(
    async (roomRef, createdUserName) => {
      // Reference to the connection collection where all peer connections are stored
      const connectionSnapshot = collection(roomRef, 'connections'); // Use roomRef to get connections collection

      const unsubscribeCandidates = onSnapshot(connectionSnapshot, (snapshot) => {
        // Loop through all changes in the connections collection
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const data = change.doc.data();

            // Check if the responder is the current user
            if (data.responder === createdUserName) {
              // Get the requester's participant data from the participants collection
              const requestParticipantRef = doc(roomRef, 'participants', data.requester); // Reference to the requester's document
              const requestParticipantData = (await getDoc(requestParticipantRef)).data();

              // Update the remote media controls for the requester
              setRemoteMedias((prev) => ({
                ...prev,
                [data.requester]: {
                  mic: requestParticipantData?.mic,
                  camera: requestParticipantData?.camera,
                },
              }));

              // Initialize the requester's remote stream
              setRemoteStreams((prev) => ({
                ...prev,
                [data.requester]: new MediaStream([]),
              }));

              // Initialize PeerConnection for the requester
              const peerConnection = new RTCPeerConnection(servers);

              // Get the connection document for the current user and the requester
              const connectionRef = doc(roomRef, 'connections', `${data.requester}-${createdUserName}`);
              const answerCandidatesCollection = collection(connectionRef, 'answerCandidates'); // Create the answerCandidates sub-collection

              // Add current user's local stream tracks to the PeerConnection
              localStream?.getTracks().forEach((track) => {
                peerConnection.addTrack(track, localStream);
              });

              // Handle incoming tracks from the requester’s MediaStream
              peerConnection.addEventListener('track', (event) => {
                event.streams[0].getTracks().forEach((track) => {
                  const remoteStream = remoteStreams[data.requester] ?? new MediaStream([]);
                  remoteStream.addTrack(track);

                  // Store the remote stream
                  setRemoteStreams((prev) => ({
                    ...prev,
                    [data.requester]: remoteStream,
                  }));
                });
              });

              // Handle ICE candidates and store them in the Firestore collection
              peerConnection.addEventListener('icecandidate', (event) => {
                if (event.candidate) {
                  addDoc(answerCandidatesCollection, event.candidate.toJSON());
                }
              });

              // Get the connection data (offer) from Firestore
              const connectionData = (await getDoc(connectionRef)).data();
              const offer = connectionData?.offer;

              // Set the offer as the remote description
              await peerConnection.setRemoteDescription(offer);

              // Create an answer and set it as the local description
              const answerDescription = await peerConnection.createAnswer();
              await peerConnection.setLocalDescription(answerDescription);

              // Send the answer to Firestore
              const answer = {
                type: answerDescription.type,
                sdp: answerDescription.sdp,
              };
              await updateDoc(connectionRef, { answer });

              // Listen for ICE candidates from the offerCandidates collection and add to the PeerConnection
              const offerCandidatesCollection = collection(connectionRef, 'offerCandidates');
              onSnapshot(offerCandidatesCollection, (iceCandidateSnapshot) => {
                iceCandidateSnapshot.docChanges().forEach(async (iceCandidateChange) => {
                  if (iceCandidateChange.type === 'added') {
                    await peerConnection.addIceCandidate(
                      new RTCIceCandidate(iceCandidateChange.doc.data())
                    );
                  }
                });
              });

              // Store the peer connection for later use
              setPeerConnections((prev) => ({
                ...prev,
                [data.requester]: peerConnection,
              }));
            }
          }
        });
      });

      // Return the unsubscribe function to stop listening for updates when needed
      return unsubscribeCandidates;
    },
    [localStream, remoteStreams, setPeerConnections, setRemoteMedias, setRemoteStreams]
  );


  return {
    localStream,
    remoteStreams,
    answerCall,
    endCall,
    openMediaDevices,
  }
}

export default useGroupCall
