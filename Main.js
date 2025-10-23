const SCALEDRONE_CHANNEL_ID = 'EoIG3R1I4JdyS4L1';
const ROOM_NAME = 'observable-room';
const USER_ID = Math.floor(Math.random() * 10000);

let drone;
let room;
let localStream;
let memberslist = [];
const membersInCall = [];
let hasOwnerStartedTheCall = false;
const peerConnections = {}; // { memberId: RTCPeerConnection }
const handleOfferCallbacks = new Map(); // { memberId: (offer, member) => void }


// --- DOM references ---
const localVideo = document.getElementById('localVideo');
const videosContainer = document.getElementById('videosContainer');

// Store ICE candidates that arrive early
const pendingCandidates = {}; // { memberId: RTCIceCandidate[] }

// --- Button listeners ---
document.getElementById('startCallBtn').addEventListener('click', startCall);
document.getElementById('joinCallBtn').addEventListener('click', joinCall);

// --- Connect to Scaledrone ---
drone = new Scaledrone(SCALEDRONE_CHANNEL_ID, { data: { userId: USER_ID } });

drone.on('open', (error) => {
  if (error) return console.error(error);
  document.getElementById("selfid").innerText = drone.clientId;
  room = drone.subscribe(ROOM_NAME);
  room.on('open', (error) => { if (error) console.error(error); });

  // Handle existing and new members
  room.on('members', async (members) => {
    memberslist = members.filter(member => member.id !== drone.clientId);
  });

  room.on('member_leave', (member) => {
    memberslist = memberslist.filter((m) => m.id !== member.id);
    if (peerConnections[member.id]) {
      peerConnections[member.id].close();
      delete peerConnections[member.id];
    }
    const video = document.getElementById(`video-${member.id}`);
    if (video) video.remove();
  });

  room.on('member_join', async (member) => {
    memberslist.push(member);

    if (hasOwnerStartedTheCall && member.id !== drone.clientId) {
      // Broadcast "call-started"
      drone.publish({
        room: ROOM_NAME,
        message: { type: 'call-started', from: USER_ID }
      });
      await createOfferFor(member);
    }
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
        // if (message.to === drone.clientId)
        //   handleofferCallback = handleOffer.bind(null, message.offer, member);
        console.log({message, member})
        if (message.to === drone.clientId)
          handleOfferCallbacks.set(drone.clientId, handleOffer.bind(null, message.offer, member, message.from));
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
  document.getElementById('startCallBtn').disabled = true;
  hasOwnerStartedTheCall = true;

  // Initialize local video
  await initLocalVideo();

  // Broadcast "call-started"
  drone.publish({
    room: ROOM_NAME,
    message: { type: 'call-started', from: USER_ID }
  });

  for (const member of memberslist)
    await createOfferFor(member);
}

// --- Participant: join call ---
async function joinCall() {
  const handleOfferCallback = handleOfferCallbacks.get(drone.clientId);
  if (!handleOfferCallback)
  {
    console.error("refresh and join again, callback not found");
    return;
  }
  document.getElementById('joinCallBtn').style.display = 'none';

  await initLocalVideo();
  await handleOfferCallback();
  handleOfferCallbacks.delete(drone.clientId);
}

// --- Initialize local camera ---
async function initLocalVideo() {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;
  localVideo.muted = true;
  localVideo.style.display = "";
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
      videosContainer.prepend(video);
      membersInCall.push(memberId);
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
async function handleOffer(offer, member, callerID) {
  const pc = createPeerConnection(member.id);
  peerConnections[member.id] = pc;

  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  drone.publish({
    room: ROOM_NAME,
    message: { type: 'answer', answer, to: member.id, from: drone.clientId }
  });

    // Apply any ICE candidates that arrived before we were ready
  if (pendingCandidates[member.id]) {
    for (const candidate of pendingCandidates[member.id]) {
      try {
        await pc.addIceCandidate(candidate);
      } catch (e) {
        console.error('Error adding queued ICE candidate:', e);
      }
    }
    delete pendingCandidates[member.id];
  }

  // ! handle pending to connect with each other
  //   for (const m of memberslist) {
  //   if ([drone.clientId, callerID, ...membersInCall].includes(m.id)) continue;
  //   await createOfferFor(m);
  // }
}

// --- Handle answer ---
async function handleAnswer(answer, member) {
  const pc = peerConnections[member.id];
  if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));

  // Apply any queued ICE candidates
  if (pendingCandidates[member.id]) {
    for (const candidate of pendingCandidates[member.id]) {
      try {
        await pc.addIceCandidate(candidate);
      } catch (e) {
        console.error('Error adding queued ICE candidate:', e);
      }
    }
    delete pendingCandidates[member.id];
  }
}

// --- Handle ICE candidate ---
async function handleNewICECandidate(candidate, member) {
  const pc = peerConnections[member.id];
  const ice = new RTCIceCandidate(candidate);

  if (!pc) {
    console.warn('Peer connection not ready yet, queueing candidate');
    pendingCandidates[member.id] = pendingCandidates[member.id] || [];
    pendingCandidates[member.id].push(ice);
    return;
  }

  if (!pc.remoteDescription) {
    console.warn('Remote description not set yet, queueing candidate');
    pendingCandidates[member.id] = pendingCandidates[member.id] || [];
    pendingCandidates[member.id].push(ice);
    return;
  }

  try {
    await pc.addIceCandidate(ice);
  } catch (e) {
    console.error('Error adding ICE candidate:', e);
  }
}
