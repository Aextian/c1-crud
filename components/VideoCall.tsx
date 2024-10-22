import { db } from '@/config'
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import React, { useEffect, useRef, useState } from 'react'
import { Button, Text, TextInput, View } from 'react-native'
import {
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCView,
  mediaDevices,
} from 'react-native-webrtc'

const VideoCall = () => {
  const [localStream, setLocalStream] = useState<MediaStream | any>(null)
  const [remoteStream, setRemoteStream] = useState<any>(null)
  const [callId, setCallId] = useState('')

  // const pc = useRef(null) // RTCPeerConnection reference
  const pc = useRef(new RTCPeerConnection({}))

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

  // useEffect(() => {
  //   const getLocalStream = async () => {
  //     const stream = await mediaDevices.getUserMedia({
  //       audio: true,
  //       video: true,
  //     })
  //     setLocalStream(stream)
  //     stream.getTracks().forEach((track) => {
  //       pc.current.addTrack(track, stream)
  //     })
  //   }

  //   getLocalStream()

  //   return () => {
  //     if (localStream) {
  //       localStream.getTracks().forEach((track) => track.stop())
  //     }
  //   }
  // }, [])

  useEffect(() => {
    const getLocalStream = async () => {
      const stream = await mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      setLocalStream(stream)
    }
    getLocalStream()
  }, [])

  const startCall = async () => {
    // Initialize the peer connection if it's not already initialized
    if (!pc.current) {
      pc.current = new RTCPeerConnection(servers)
    }

    // Add local stream tracks to the peer connection
    localStream.getTracks().forEach((track) => {
      pc.current.addTrack(track, localStream)
    })

    // Create a new document reference for the call
    const callDoc = doc(collection(db, 'calls'), callId) // Get a new document reference
    const offerCandidates = collection(callDoc, 'offerCandidates') // Get the offerCandidates collection reference
    const answerCandidates = collection(callDoc, 'answerCandidates') // Get the answerCandidates collection reference

    // Listen for ICE candidates
    // pc.current.onicecandidate = (event) => {
    //   if (event.candidate) {
    //     // Use setDoc to add the candidate to the offerCandidates collection
    //     setDoc(doc(offerCandidates), event.candidate.toJSON())
    //   }
    // }
    pc.current.addEventListener('icecandidate', (e) => {
      if (!e.candidate) {
        console.log('Got final candidate!')
        return
      }
      setDoc(doc(offerCandidates), e.candidate.toJSON())
    })

    // Stream remote tracks
    pc.current.ontrack = (event) => {
      setRemoteStream(event.streams[0])
    }

    // Create an offer
    const offerDescription = await pc.current.createOffer()
    await pc.current.setLocalDescription(offerDescription)

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    }

    // Save the offer to Firestore
    await setDoc(callDoc, { offer })

    // Listen for answer
    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data()
      if (!pc.current.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer)
        pc.current.setRemoteDescription(answerDescription)
      }
    })

    // Listen for ICE candidates from the answerer
    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data())
          pc.current.addIceCandidate(candidate)
        }
      })
    })
  }

  const answerCall = async (callId) => {
    try {
      // Create a reference to the call document
      const callDoc = doc(collection(db, 'calls'), callId)
      const offerCandidates = collection(callDoc, 'offerCandidates')
      const answerCandidates = collection(callDoc, 'answerCandidates')

      // Initialize the peer connection
      pc.current = new RTCPeerConnection(servers)

      // Add local stream tracks to the peer connection
      localStream.getTracks().forEach((track) => {
        pc.current.addTrack(track, localStream)
      })

      // Listen for ICE candidates and send them to Firestore
      // pc.current.onicecandidate = (event) => {
      //   if (event.candidate) {
      //     setDoc(doc(answerCandidates), event.candidate.toJSON())
      //   }
      // }
      pc.current.addEventListener('icecandidate', (e) => {
        if (!e.candidate) {
          console.log('Got final candidate!')
          return
        }
        setDoc(doc(answerCandidates), e.candidate.toJSON())
      })

      // Stream remote tracks
      pc.current.ontrack = (event) => {
        setRemoteStream(event.streams[0])
      }

      // Fetch offer from Firestore
      const docSnapshot = await getDoc(callDoc)
      if (!docSnapshot.exists()) {
        console.error('No such document!')
        return // Exit if the document doesn't exist
      }

      const callData = docSnapshot.data()
      const offerDescription = callData.offer // Safe to access

      // Set the remote description using the offer
      await pc.current.setRemoteDescription(
        new RTCSessionDescription(offerDescription),
      )

      // Create and send the answer
      const answerDescription = await pc.current.createAnswer()
      await pc.current.setLocalDescription(answerDescription)

      const answer = {
        sdp: answerDescription.sdp,
        type: answerDescription.type,
      }

      // Update Firestore with the answer
      await updateDoc(callDoc, { answer })

      // Listen for ICE candidates from the offerer
      onSnapshot(offerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data())
            pc.current.addIceCandidate(candidate)
          }
        })
      })
    } catch (error) {
      console.error('Error answering call:', error)
    }
  }

  pc.current.ontrack = (event) => {
    const stream = event.streams[0]
    if (stream) {
      console.log('Received remote stream:', stream)
      setRemoteStream(stream) // Make sure to update your state with the new stream
    }
  }

  return (
    <View>
      {localStream && (
        <RTCView
          streamURL={localStream.toURL()}
          style={{ width: '100%', height: 200 }}
        />
      )}
      {remoteStream && (
        <>
          <Text>Remote Stream</Text>
          <RTCView
            streamURL={remoteStream?.toURL()}
            style={{ width: '100%', height: 200, backgroundColor: 'red' }}
          />
        </>
      )}
      <Button title="Start Call" onPress={startCall} />
      <TextInput
        placeholder="Enter Call ID"
        value={callId}
        onChangeText={setCallId}
      />
      <Button title="Answer Call" onPress={() => answerCall(callId)} />
    </View>
  )
}

export default VideoCall
