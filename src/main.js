const videoSources = [
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://www.w3schools.com/html/movie.mp4'
];

const videos = [];
const audioSelect = document.getElementById('audioSelect');

async function setupAudioOutputs() {
  if (!navigator.mediaDevices?.enumerateDevices || !HTMLMediaElement.prototype.setSinkId) {
    alert("Your browser does not support audio output selection.");
    return;
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  const audioOutputs = devices.filter(d => d.kind === 'audiooutput');

  for (const device of audioOutputs) {
    const option = document.createElement('option');
    option.value = device.deviceId;
    option.textContent = device.label || `Device ${device.deviceId}`;
    audioSelect.appendChild(option);
  }

  // Apply selected sink to all videos
  audioSelect.addEventListener('change', async () => {
    for (const video of videos) {
      try {
        await video.setSinkId(audioSelect.value || '');
        console.log(`Audio output set to ${audioSelect.value || 'default'} for a video`);
      } catch (err) {
        console.error("Failed to set sink ID:", err);
      }
    }
  });
}

async function createVideos() {
  const container = document.getElementById('videoContainer');

  for (const src of videoSources) {
    const video = document.createElement('video');
    video.src = src;
    video.controls = true;
    video.autoplay = false; // autoplay restricted on most browsers
    video.muted = true;     // unmute after user interaction
    video.playsInline = true;
    video.loop = true; // Loop the video
    

    container.appendChild(video);
    videos.push(video);
  }

  // Wait for user gesture to unmute and play
  document.body.addEventListener('click', async () => {
    for (const video of videos) {
      video.muted = false;
      try {
        await video.play();
      } catch (err) {
        console.warn('Autoplay error:', err);
      }
    }
  }, { once: true });
}

setupAudioOutputs();
createVideos();