import { db } from '@/config';
import { firebase } from '@react-native-firebase/database';
import { doc, updateDoc,arrayUnion, collection  } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Alert } from 'react-native';
import { RTCView, mediaDevices, RTCPeerConnection, RTCSessionDescription, MediaStream } from 'react-native-webrtc';


const peerConnectionConfig = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

const GroupCallScreen = () => {
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([])
  const [peerConnections, setPeerConnections] = useState({});
  const [callId, setCallId] = useState<any>(null);  // Store the call ID for signaling

  useEffect(() => {
    startLocalStream();
    return () => {
      stopStreams();
    };
  }, []);

  const startLocalStream = async () => {
    try {
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setLocalStream(stream);
    } catch (error) {
      Alert.alert("Error", "Could not access media devices.");
    }
  };

  const createPeerConnection = (userId: any, localStream: MediaStream) => {
    const peerConnection = new RTCPeerConnection(peerConnectionConfig);
    // Add local stream tracks to the peer connection
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.addEventListener('track', (event) => {
      setRemoteStreams((prevStreams) => [...prevStreams, event.streams[0]]);
    });
    
    peerConnection.addEventListener('icecandidate', async (e) => { 
      if (e.candidate) {
        const candidateData = e.candidate.toJSON();
        try {
          await updateDoc(doc(db, 'calls', callId), {
            iceCandidates: arrayUnion(candidateData)
          });
        } catch (error) {
          console.error("Error adding ICE candidate: ", error);
        }
      }
    });
    
    setPeerConnections((prev) => ({ ...prev, [userId]: peerConnection }));
    return peerConnection;
  };

  // Start a call and create an offer
  const startCall = async () => {
    const callDoc = collection(db, 'calls')

    setCallId(callDoc.id);  // Save the call ID for signaling

    const peerConnection = createPeerConnection(callDoc.id, localStream);

    // Create an offer and store it in Firebase
    const offer = await peerConnection.createOffer({});
    await peerConnection.setLocalDescription(offer);

    await callDoc.set({
      offer: offer.toJSON(),
      iceCandidates: []
    });

    // Listen for answer and ICE candidates
    callDoc.onSnapshot((snapshot) => {
      const data = snapshot.data();
      if (data.answer && !peerConnection.currentRemoteDescription) {
        const answerDesc = new RTCSessionDescription(data.answer);
        peerConnection.setRemoteDescription(answerDesc);
      }
      if (data.iceCandidates) {
        data.iceCandidates.forEach((candidate) => {
          peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        });
      }
    });
  };

  // Answer a call by creating an answer to the offer
  const answerCall = async () => {
    const callDoc = firestore.collection('calls').doc(callId);
    const callData = (await callDoc.get()).data();

    if (callData.offer) {
      const peerConnection = createPeerConnection(callDoc.id, localStream);

      await peerConnection.setRemoteDescription(new RTCSessionDescription(callData.offer));

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      await callDoc.update({
        answer: answer.toJSON(),
      });

      // Listen for ICE candidates
      callDoc.onSnapshot((snapshot) => {
        const data = snapshot.data();
        if (data.iceCandidates) {
          data.iceCandidates.forEach((candidate) => {
            peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          });
        }
      });
    } else {
      Alert.alert("Error", "No call to answer.");
    }
  };

  const stopStreams = () => {
    localStream?.getTracks().forEach((track) => track.stop());
    Object.values(peerConnections).forEach((pc) => pc.close());
  };

  return (
    <View style={styles.container}>
      {/* Render local stream */}
      {localStream && (
        <RTCView
          streamURL={localStream.toURL()}
          style={styles.localVideo}
        />
      )}

      {/* Render remote streams */}
      {remoteStreams.map((stream, index) => (
        <RTCView
          key={index}
          streamURL={stream.toURL()}
          style={styles.remoteVideo}
        />
      ))}

      {/* Call and Answer Buttons */}
      <View style={styles.buttons}>
        <Button title="Start Call" onPress={startCall} />
        <Button title="Answer Call" onPress={answerCall} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  localVideo: {
    width: 100,
    height: 150,
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  remoteVideo: {
    width: '45%',
    height: '45%',
    margin: 5,
  },
  buttons: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});

export default GroupCallScreen;
