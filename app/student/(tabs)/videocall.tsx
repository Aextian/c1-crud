import { db } from '@/config'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { nanoid } from 'nanoid'
import React, { useEffect, useState } from 'react'
import { Button, Text, TextInput, View } from 'react-native'
import {
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCView,
  mediaDevices,
} from 'react-native-webrtc'

const WebRTCRoom = () => {
  const [roomId, setRoomId] = useState('')
  const [roomName, setRoomName] = useState('')
  const [localStream, setLocalStream] = useState(null)
  const [remoteStreams, setRemoteStreams] = useState([])
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)

  useEffect(() => {
    const getLocalStream = async () => {
      try {
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: true,
        })
        setLocalStream(stream)
      } catch (err) {
        console.log('Error getting local media stream:', err)
      }
    }

    getLocalStream()
  }, [])

  const addRemoteStream = (peerId, stream) => {
    setRemoteStreams((prevStreams) => [...prevStreams, { peerId, stream }])
  }

  const createRoom = async () => {
    if (!roomName) {
      alert('Please enter a room name')
      return
    }

    const newRoomId = nanoid()

    const roomRef = doc(db, 'rooms', newRoomId)
    await setDoc(roomRef, {
      roomName,
      createdAt: new Date(),
      users: [],
      offers: {},
      iceCandidates: {},
    })

    setRoomId(newRoomId)
    setIsCreatingRoom(false)
  }

  const joinRoom = async () => {
    if (!roomId) {
      alert('Please enter a room ID')
      return
    }

    const roomRef = doc(db, 'rooms', roomId)
    const roomDoc = await getDoc(roomRef)

    if (!roomDoc.exists()) {
      console.log('Room not found!')
      return
    }

    const peerConnection = new RTCPeerConnection()

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream)
    })

    peerConnection.addEventListener('icecandidate', (e) => {
      if (e.candidate) {
        const candidateData = e.candidate.toJSON()
        sendIceCandidate(candidateData)
      }
    })

    peerConnection.addEventListener('track', (event) => {
      const remoteStream = event.streams[0]
      addRemoteStream('peer1', remoteStream)
    })

    // Create an offer
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    // Store the offer in Firebase for signaling
    await updateDoc(roomRef, {
      [`offers.peer1`]: offer,
    })

    listenForAnswer(peerConnection) // Listen for the answer from the remote peer
    listenForIceCandidates(peerConnection) // Listen for ICE candidates
  }

  const sendIceCandidate = async (candidate) => {
    const roomRef = doc(db, 'rooms', roomId)
    const iceCandidatesRef = collection(roomRef, 'iceCandidates')
    await addDoc(iceCandidatesRef, {
      candidate,
    })
  }

  const listenForAnswer = (peerConnection) => {
    const roomRef = doc(db, 'rooms', roomId)

    // Listen for updates on the offer in the room document
    onSnapshot(roomRef, async (docSnapshot) => {
      const data = docSnapshot.data()

      if (!data || !data.offers || !data.offers.peer1) {
        console.log('No offer data found')
        return
      }

      const offerData = data.offers.peer1
      console.log('Offer data received:', offerData)

      // Check if an answer is available
      if (offerData.answer) {
        const answer = offerData.answer
        console.log('Answer received:', answer)

        // Only set the remote description once the answer is available
        try {
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(answer),
          )
          console.log('Remote description set successfully')
        } catch (error) {
          console.error('Error setting remote description:', error)
        }
      } else {
        console.log('Answer not yet available')
      }
    })
  }

  const listenForIceCandidates = (peerConnection) => {
    const roomRef = doc(db, 'rooms', roomId)
    const iceCandidatesRef = collection(roomRef, 'iceCandidates')
    onSnapshot(iceCandidatesRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data().candidate)
          console.log('Received ICE candidate:', candidate)
          peerConnection.addIceCandidate(candidate)
        }
      })
    })
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
        {isCreatingRoom ? 'Create a Room' : 'Join a Room'}
      </Text>
      {isCreatingRoom ? (
        <>
          <TextInput
            placeholder="Enter Room Name"
            value={roomName}
            onChangeText={setRoomName}
            style={{
              borderBottomWidth: 1,
              marginVertical: 10,
              padding: 10,
            }}
          />
          <Button title="Create Room" onPress={createRoom} />
        </>
      ) : (
        <>
          <TextInput
            placeholder="Enter Room ID"
            value={roomId}
            onChangeText={setRoomId}
            style={{
              borderBottomWidth: 1,
              marginVertical: 10,
              padding: 10,
            }}
          />
          <Button title="Join Room" onPress={joinRoom} />
          <Button
            title="Create a Room"
            onPress={() => setIsCreatingRoom(true)}
            style={{ marginTop: 10 }}
          />
        </>
      )}
      {localStream && (
        <RTCView
          streamURL={localStream.toURL()}
          style={{ width: '100%', height: 200, marginTop: 20 }}
        />
      )}
      {remoteStreams.map((remoteStream) => (
        <RTCView
          key={remoteStream.peerId}
          streamURL={remoteStream.stream.toURL()}
          style={{ width: '100%', height: 200, marginTop: 20 }}
        />
      ))}
    </View>
  )
}

export default WebRTCRoom
