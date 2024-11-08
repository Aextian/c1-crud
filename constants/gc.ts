export const peerConstraints = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
}

export const sessionConstraints = {
  mandatory: {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true,
    VoiceActivityDetection: true,
  },
}

export const FirestoreCollections = {
  rooms: 'rooms',
  users: 'users',
  participants: 'participants',
  connections: 'connections',
  offerCandidates: 'offerCandidates',
  answerCandidates: 'answerCandidates',
}
