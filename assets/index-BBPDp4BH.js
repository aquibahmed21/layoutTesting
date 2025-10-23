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
const ROOM_NAME = "observable-room";
const USER_ID = Math.floor(Math.random() * 1e4);
let drone;
let room;
let localStream;
const peerConnections = {};
let handleofferCallback = null;
const localVideo = document.getElementById("localVideo");
const videosContainer = document.getElementById("videosContainer");
document.getElementById("startCallBtn").addEventListener("click", startCall);
document.getElementById("joinCallBtn").addEventListener("click", joinCall);
drone = new Scaledrone(SCALEDRONE_CHANNEL_ID, { data: { userId: USER_ID } });
drone.on("open", (error) => {
  if (error) return console.error(error);
  room = drone.subscribe(ROOM_NAME);
  room.on("open", (error2) => {
    if (error2) console.error(error2);
  });
  room.on("members", async (members) => {
    console.log("Online members:", members);
  });
  room.on("member_leave", (member) => {
    console.log("Member left:", member.id);
    if (peerConnections[member.id]) {
      peerConnections[member.id].close();
      delete peerConnections[member.id];
    }
    const video = document.getElementById(`video-${member.id}`);
    if (video) video.remove();
  });
  room.on("data", (message, member) => {
    if (!member || member.id === drone.clientId) return;
    switch (message.type) {
      case "call-started":
        console.log("Group video call started!");
        document.getElementById("joinCallBtn").style.display = "inline";
        break;
      case "offer":
        if (message.to === drone.clientId)
          handleofferCallback = handleOffer.bind(null, message.offer, member);
        break;
      case "answer":
        if (message.to === drone.clientId)
          handleAnswer(message.answer, member);
        break;
      case "ice-candidate":
        if (message.to === drone.clientId)
          handleNewICECandidate(message.candidate, member);
        break;
    }
  });
});
async function startCall() {
  await initLocalVideo();
  document.getElementById("startCallBtn").disabled = true;
  drone.publish({
    room: ROOM_NAME,
    message: { type: "call-started", from: USER_ID }
  });
}
async function joinCall() {
  await initLocalVideo();
  if (handleofferCallback) {
    await handleofferCallback();
  }
  document.getElementById("joinCallBtn").style.display = "none";
  const members = room.members || [];
  for (const m of members) {
    if (m.id === drone.clientId) continue;
    await createOfferFor(m);
  }
  room.on("member_join", async (member) => {
    if (member.id !== drone.clientId) {
      drone.publish({
        room: ROOM_NAME,
        message: { type: "call-started", from: USER_ID }
      });
      await createOfferFor(member);
    }
  });
}
async function initLocalVideo() {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  localVideo.srcObject = localStream;
  localVideo.muted = true;
}
async function createOfferFor(member) {
  const pc = createPeerConnection(member.id);
  peerConnections[member.id] = pc;
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  drone.publish({
    room: ROOM_NAME,
    message: { type: "offer", offer, to: member.id, from: drone.clientId }
  });
}
function createPeerConnection(memberId) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });
  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
  pc.ontrack = (event) => {
    let video = document.getElementById(`video-${memberId}`);
    if (!video) {
      video = document.createElement("video");
      video.id = `video-${memberId}`;
      video.autoplay = true;
      video.playsInline = true;
      video.className = "remoteVideo";
      videosContainer.appendChild(video);
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
async function handleOffer(offer, member) {
  const pc = createPeerConnection(member.id);
  peerConnections[member.id] = pc;
  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  drone.publish({
    room: ROOM_NAME,
    message: { type: "answer", answer, to: member.id, from: drone.clientId }
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
      console.error("Error adding ICE candidate:", e);
    }
  }
}
