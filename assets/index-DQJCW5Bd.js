(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const SCALEDRONE_CHANNEL_ID = "EoIG3R1I4JdyS4L1";
const ROOM_NAME = "observable-room1234516";
const USER_ID = Math.floor(Math.random() * 1e4);
let drone;
let room;
let localStream;
let memberslist = [];
const membersInCall = [];
let hasOwnerStartedTheCall = false;
const peerConnections = {};
const handleOfferCallbacks = /* @__PURE__ */ new Map();
const localVideo = document.getElementById("localVideo");
const videosContainer = document.getElementById("videosContainer");
const pendingCandidates = {};
document.getElementById("startCallBtn").addEventListener("click", startCall);
document.getElementById("joinCallBtn").addEventListener("click", joinCall);
drone = new Scaledrone(SCALEDRONE_CHANNEL_ID, { data: { userId: USER_ID } });
drone.on("open", (error) => {
  if (error) return console.error(error);
  document.getElementById("selfid").innerText = drone.clientId;
  room = drone.subscribe(ROOM_NAME);
  room.on("open", (error2) => {
    if (error2) console.error(error2);
  });
  room.on("members", async (members) => {
    memberslist = members.filter((member) => member.id !== drone.clientId);
  });
  room.on("member_leave", (member) => {
    memberslist = memberslist.filter((m) => m.id !== member.id);
    if (peerConnections[member.id]) {
      peerConnections[member.id].close();
      delete peerConnections[member.id];
    }
    const video = document.getElementById(`video-${member.id}`);
    if (video) video.remove();
  });
  room.on("member_join", async (member) => {
    const index = memberslist.findIndex((m) => m.id === member.id);
    if (index !== -1) memberslist[index] = member;
    else memberslist.push(member);
    if (hasOwnerStartedTheCall && member.id !== drone.clientId) {
      drone.publish({
        room: ROOM_NAME,
        message: { type: "call-started", from: USER_ID, to: member.id }
      });
      await createOfferFor(member);
    }
  });
  room.on("data", (message, member) => {
    if (!member || member.id === drone.clientId) return;
    switch (message.type) {
      case "call-started":
        if (message.to === drone.clientId || message.to === void 0) {
          console.log("Group video call started! by: " + message.from);
          document.getElementById("joinCallBtn").style.display = "inline";
          document.getElementById("startCallBtn").style.display = "none";
        }
        break;
      case "offer":
        console.log("Offer received from: " + message.from);
        if (message.to === drone.clientId)
          handleOfferCallbacks.set(drone.clientId, handleOffer.bind(null, message.offer, member, message.from));
        break;
      case "answer":
        if (message.to === drone.clientId)
          handleAnswer(message.answer, member);
        break;
      case "ice-candidate":
        if (message.to === drone.clientId)
          handleNewICECandidate(message.candidate, member);
        break;
      case "connected":
        console.log("Connected to: " + message.from);
        if (message.to === drone.clientId)
          handleConnected(member);
        break;
      case "connected-with":
        console.log("Connected with: " + message.from);
        if (message.to === drone.clientId)
          handleConnectedWith(member, message.connectwithOthers);
        break;
      case "offer-direct":
        console.log("Direct offer received from: " + message.from);
        if (message.to === drone.clientId)
          handleOffer(message.offer, member);
        break;
    }
  });
});
async function startCall() {
  document.getElementById("startCallBtn").disabled = true;
  hasOwnerStartedTheCall = true;
  await initLocalVideo();
  drone.publish({
    room: ROOM_NAME,
    message: { type: "call-started", from: USER_ID }
  });
  for (const member of memberslist)
    await createOfferFor(member);
}
async function joinCall() {
  await initLocalVideo();
  const handleOfferCallback = handleOfferCallbacks.get(drone.clientId);
  if (!handleOfferCallback) {
    console.error("refresh and join again, callback not found");
    localStream.getTracks().forEach((track) => track.stop());
    localVideo.srcObject = null;
    localVideo.muted = true;
    localVideo.style.display = "none";
    return;
  }
  document.getElementById("joinCallBtn").style.display = "none";
  await handleOfferCallback();
  handleOfferCallbacks.delete(drone.clientId);
}
async function initLocalVideo() {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;
  localVideo.muted = true;
  localVideo.style.display = "";
}
async function createOfferFor(member, isDirectConnect = false) {
  const pc = createPeerConnection(member.id);
  peerConnections[member.id] = pc;
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  if (isDirectConnect)
    drone.publish({
      room: ROOM_NAME,
      message: { type: "offer-direct", offer, to: member.id, from: drone.clientId }
    });
  else
    drone.publish({
      room: ROOM_NAME,
      message: { type: "offer", offer, to: member.id, from: drone.clientId }
    });
}
function createPeerConnection(memberId) {
  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      {
        url: "turn:numb.viagenie.ca",
        credential: "muazkh",
        username: "webrtc@live.com"
      },
      {
        url: "turn:192.158.29.39:3478?transport=udp",
        credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
        username: "28224511:1379330808"
      },
      {
        url: "turn:192.158.29.39:3478?transport=tcp",
        credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
        username: "28224511:1379330808"
      },
      {
        url: "turn:turn.bistri.com:80",
        credential: "homeo",
        username: "homeo"
      },
      {
        url: "turn:turn.anyfirewall.com:443?transport=tcp",
        credential: "webrtc",
        username: "webrtc"
      }
    ]
  });
  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
  pc.ontrack = (event) => {
    membersInCall.push(memberId);
    let video = document.getElementById(`video-${memberId}`);
    if (!video) {
      video = document.createElement("video");
      video.id = `video-${memberId}`;
      video.autoplay = true;
      video.playsInline = true;
      video.className = "remoteVideo";
      videosContainer.prepend(video);
    }
    video.srcObject = event.streams[0];
  };
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      drone.publish({
        room: ROOM_NAME,
        message: {
          type: "ice-candidate",
          candidate: event.candidate,
          to: memberId,
          from: drone.clientId
        }
      });
    }
  };
  return pc;
}
async function handleOffer(offer, member, callerID) {
  const pc = createPeerConnection(member.id);
  peerConnections[member.id] = pc;
  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  drone.publish({
    room: ROOM_NAME,
    message: { type: "answer", answer, to: member.id, from: drone.clientId }
  });
  if (pendingCandidates[member.id]) {
    for (const candidate of pendingCandidates[member.id]) {
      try {
        await pc.addIceCandidate(candidate);
      } catch (e) {
        console.error("Error adding queued ICE candidate:", e);
      }
    }
    delete pendingCandidates[member.id];
  }
  if (callerID) {
    drone.publish({
      room: ROOM_NAME,
      message: { type: "connected", answer, to: member.id, from: drone.clientId }
    });
  }
}
async function handleAnswer(answer, member) {
  const pc = peerConnections[member.id];
  if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
  if (pendingCandidates[member.id]) {
    for (const candidate of pendingCandidates[member.id]) {
      try {
        await pc.addIceCandidate(candidate);
      } catch (e) {
        console.error("Error adding queued ICE candidate:", e);
      }
    }
    delete pendingCandidates[member.id];
  }
}
async function handleNewICECandidate(candidate, member) {
  const pc = peerConnections[member.id];
  const ice = new RTCIceCandidate(candidate);
  if (!pc) {
    console.warn("Peer connection not ready yet, queueing candidate");
    pendingCandidates[member.id] = pendingCandidates[member.id] || [];
    pendingCandidates[member.id].push(ice);
    return;
  }
  if (!pc.remoteDescription) {
    console.warn("Remote description not set yet, queueing candidate");
    pendingCandidates[member.id] = pendingCandidates[member.id] || [];
    pendingCandidates[member.id].push(ice);
    return;
  }
  try {
    await pc.addIceCandidate(ice);
  } catch (e) {
    console.error("Error adding ICE candidate:", e);
  }
}
function handleConnected(member) {
  let connectwithOthers = membersInCall.filter((m) => m !== member.id && m !== drone.clientId);
  if (connectwithOthers.length === 0) return;
  connectwithOthers = Array.from(new Set(connectwithOthers));
  drone.publish({
    room: ROOM_NAME,
    message: { type: "connected-with", to: member.id, from: drone.clientId, connectwithOthers }
  });
}
function handleConnectedWith(member, connectwithOthers) {
  for (const m of connectwithOthers) {
    const member2 = memberslist.find((e) => e.id == m);
    if (!member2)
      continue;
    createOfferFor(member2, true);
  }
}
