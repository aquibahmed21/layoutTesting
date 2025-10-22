const SCALEDRONE_CHANNEL_ID = 'EoIG3R1I4JdyS4L1';
const ROOM_NAME = 'observable-room';
const USER_ID = Math.floor(Math.random() * 10000);

let drone;
let room;
let localStream;
const peerConnections = {}; // key = member.id -> RTCPeerConnection

// --- DOM references ---
const localVideo = document.getElementById('localVideo');
const videosContainer = document.getElementById('videosContainer');

// --- Button listeners ---
document.getElementById('startCallBtn').addEventListener('click', startCall);
document.getElementById('joinCallBtn').addEventListener('click', joinCall);

// --- Connect to Scaledrone ---
drone = new Scaledrone(SCALEDRONE_CHANNEL_ID, { data: { userId: USER_ID } });

drone.on('open', (error) => {
  if (error) return console.error(error);

  room = drone.subscribe(ROOM_NAME);
  room.on('open', (error) => { if (error) console.error(error); });

  room.on('members', (members) => {
    console.log('Online members:', members);
  });

  // Listen for signalling messages
  room.on('data', (message, member) => {
    if (!member || member.id === drone.clientId) return;

    switch (message.type) {
      case 'call-started':
        console.log('Incoming group video call!');
        document.getElementById('joinCallBtn').style.display = 'inline';
        break;
      case 'offer':
        handleOffer(message.offer, member);
        break;
      case 'answer':
        handleAnswer(message.answer, member);
        break;
      case 'ice-candidate':
        handleNewICECandidate(message.candidate, member);
        break;
    }
  });
});

// --- Owner: start call ---
async function startCall() {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  localVideo.srcObject = localStream;
  localVideo.muted = true;
  document.getElementById('startCallBtn').disabled = true;

  drone.publish({
        room: ROOM_NAME,  message: { type: 'call-started', from: USER_ID } });

  // Send offers to all existing members
  room.on('members', async (members) => {
    for (const m of members) {
      if (m.id === drone.clientId) continue;
      await createOfferFor(m);
    }
  });

  // Send offer to any new member joining later
  room.on('member_join', async (member) => {
    await createOfferFor(member);
  });
}

// --- Participant: join call ---
async function joinCall() {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  localVideo.srcObject = localStream;
  localVideo.muted = true;
  document.getElementById('joinCallBtn').style.display = 'none';

  room.on('members', async (members) => {
    for (const m of members) {
      if (m.id === drone.clientId) continue;
      await createOfferFor(m);
    }
  });
}

// --- Peer Connection helpers ---
async function createOfferFor(member) {
  const pc = createPeerConnection(member.id);
  peerConnections[member.id] = pc;

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  drone.publish({
        room: ROOM_NAME,  message: { type: 'offer', offer, to: member.id, from: USER_ID } });
}

function createPeerConnection(memberId) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  });

  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  pc.ontrack = (event) => {
    const video = document.createElement('video');
    video.srcObject = event.streams[0];
    video.autoplay = true;
    video.playsInline = true;
    video.className = 'remoteVideo';
    videosContainer.appendChild(video);
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      drone.publish({
        room: ROOM_NAME,
        message: { type: 'ice-candidate', candidate: event.candidate, to: memberId }
      });
    }
  };

  return pc;
}

// --- Incoming signals ---
async function handleOffer(offer, member) {
  const pc = createPeerConnection(member.id);
  peerConnections[member.id] = pc;

  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  drone.publish({
        room: ROOM_NAME,
    message: { type: 'answer', answer, to: member.id, from: USER_ID }
  });
}

async function handleAnswer(answer, member) {
  const pc = peerConnections[member.id];
  if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
}

async function handleNewICECandidate(candidate, member) {
  const pc = peerConnections[member.id];
  if (pc) {
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.error('Error adding ICE candidate:', e);
    }
  }
}
