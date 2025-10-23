const SCALEDRONE_CHANNEL_ID = 'EoIG3R1I4JdyS4L1';
const ROOM_NAME = 'observable-room';
const USER_ID = Math.floor(Math.random() * 10000);

let drone;
let room;
let localStream;
const peerConnections = {}; // { memberId: RTCPeerConnection }
let handleofferCallback = null;

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

  // Handle existing and new members
  room.on('members', async (members) => {
    console.log('Online members:', members);
  });

  room.on('member_leave', (member) => {
    console.log('Member left:', member.id);
    if (peerConnections[member.id]) {
      peerConnections[member.id].close();
      delete peerConnections[member.id];
    }
    const video = document.getElementById(`video-${member.id}`);
    if (video) video.remove();
  });

  // Listen for signalling messages
  room.on('data', (message, member) => {
    if (!member || member.id === drone.clientId) return;

    switch (message.type) {
      case 'call-started':
        console.log('Group video call started!');
        document.getElementById('joinCallBtn').style.display = 'inline';
        break;
      case 'offer':
        if (message.to === drone.clientId)
          handleofferCallback = handleOffer.bind(null, message.offer, member);
        break;
      case 'answer':
        if (message.to === drone.clientId)
          handleAnswer(message.answer, member);
        break;
      case 'ice-candidate':
        if (message.to === drone.clientId)
          handleNewICECandidate(message.candidate, member);
        break;
    }
  });
});

// --- Owner: start call ---
async function startCall() {
  await initLocalVideo();
  document.getElementById('startCallBtn').disabled = true;

  // Broadcast "call-started"
  drone.publish({
    room: ROOM_NAME,
    message: { type: 'call-started', from: USER_ID }
  });
}

// --- Participant: join call ---
async function joinCall() {
  await initLocalVideo();
  if (handleofferCallback) {
    await handleofferCallback();
  }
  document.getElementById('joinCallBtn').style.display = 'none';

  const members = room.members || [];
  for (const m of members) {
    if (m.id === drone.clientId) continue;
    await createOfferFor(m);
  }

  // Handle future joins
  room.on('member_join', async (member) => {
    if (member.id !== drone.clientId) {
      // Broadcast "call-started"
      drone.publish({
        room: ROOM_NAME,
        message: { type: 'call-started', from: USER_ID }
      });
      await createOfferFor(member);
    }
  });
}

// --- Initialize local camera ---
async function initLocalVideo() {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  localVideo.srcObject = localStream;
  localVideo.muted = true;
}

// --- Create and send offer ---
async function createOfferFor(member) {
  const pc = createPeerConnection(member.id);
  peerConnections[member.id] = pc;

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  drone.publish({
    room: ROOM_NAME,
    message: { type: 'offer', offer, to: member.id, from: drone.clientId }
  });
}

// --- Create peer connection ---
function createPeerConnection(memberId) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  });

  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  pc.ontrack = (event) => {
    let video = document.getElementById(`video-${memberId}`);
    if (!video) {
      video = document.createElement('video');
      video.id = `video-${memberId}`;
      video.autoplay = true;
      video.playsInline = true;
      video.className = 'remoteVideo';
      videosContainer.appendChild(video);
    }
    video.srcObject = event.streams[0];
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      drone.publish({
        room: ROOM_NAME,
        message: {
          type: 'ice-candidate',
          candidate: event.candidate,
          to: memberId,
          from: drone.clientId
        }
      });
    }
  };

  return pc;
}

// --- Handle offer ---
async function handleOffer(offer, member) {
  const pc = createPeerConnection(member.id);
  peerConnections[member.id] = pc;

  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  drone.publish({
    room: ROOM_NAME,
    message: { type: 'answer', answer, to: member.id, from: drone.clientId }
  });
}

// --- Handle answer ---
async function handleAnswer(answer, member) {
  const pc = peerConnections[member.id];
  if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
}

// --- Handle ICE candidate ---
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
