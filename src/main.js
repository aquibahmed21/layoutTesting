import './style.css'

document.querySelector('#app').innerHTML = `

<div class="container">
  <h3>Devices BEFORE getUserMedia()</h3>
  <label for="videoBeforeInput">Video Devices Input:</label>
  <select id="videoBeforeInput"></select><br>
  <label for="audioBeforeInput">Audio Devices Input:</label>
  <select id="audioBeforeInput"></select>
  <label for="videoBeforeOutput">Video Devices Output:</label>
  <select id="videoBeforeOutput"></select><br>
  <label for="audioBeforeOutput">Audio Devices Output:</label>
  <select id="audioBeforeOutput"></select>
</div>

<div class="container">
  <h3>Devices AFTER getUserMedia()</h3>
  <label for="videoAfterInput">Video Devices Input:</label>
  <select id="videoAfterInput"></select><br>
  <label for="audioAfterInput">Audio Devices Input:</label>
  <select id="audioAfterInput"></select>
  <label for="videoAfterOutput">Video Devices Output:</label>
  <select id="videoAfterOutput"></select><br>
  <label for="audioAfterOutput">Audio Devices Output:</label>
  <select id="audioAfterOutput"></select>
</div>

<br /><br />
<button id="startBtn" class="full-width">Start Camera</button>
`

const startBtn = document.getElementById('startBtn');


const videoBeforeInput = document.getElementById('videoBeforeInput');
const audioBeforeInput = document.getElementById('audioBeforeInput');
const videoBeforeOutput = document.getElementById('videoBeforeOutput');
const audioBeforeOutput = document.getElementById('audioBeforeOutput');

const videoAfterInput = document.getElementById('videoAfterInput');
const audioAfterInput = document.getElementById('audioAfterInput');
const videoAfterOutput = document.getElementById('videoAfterOutput');
const audioAfterOutput = document.getElementById('audioAfterOutput');

async function listDevices(videoDropdownInput, audioDropdownInput, videoDropdownOutput, audioDropdownOutput) {
  const devices = await navigator.mediaDevices.enumerateDevices();

  videoDropdownInput.innerHTML = ""
  audioDropdownInput.innerHTML = ""
  videoDropdownOutput.innerHTML = ""
  audioDropdownOutput.innerHTML = ""

  devices.forEach(device => {
    const option = document.createElement('option');
    option.value = device.deviceId || '';
    option.text = device.label || `${device.kind}`;

    if (device.kind === 'videoinput') {
      videoDropdownInput.appendChild(option);
    } else if (device.kind === 'audioinput') {
      audioDropdownInput.appendChild(option);
    } else if (device.kind === 'videooutput') {
      videoDropdownOutput.appendChild(option);
    } else if (device.kind === 'audiooutput') {
      audioDropdownOutput.appendChild(option);
    }
  });
}

// List devices BEFORE getUserMedia
listDevices(videoBeforeInput,
  audioBeforeInput,
  videoBeforeOutput,
  audioBeforeOutput);
let stream = null;

startBtn.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    const divContainer = document.createElement('div');

    const video = document.createElement('video');
    video.autoplay = true;
    video.playsinline = true;
    video.width = 320;
    video.height = 240;
    video.style.marginTop = '1em';
    divContainer.appendChild(video);
    const br = document.createElement('br');
    divContainer.appendChild(br);
    video.srcObject = stream;

    const stopBtn = document.createElement('button');
    stopBtn.textContent = 'Stop Camera';
    document.querySelector("#app").appendChild(divContainer);
    stopBtn.addEventListener('click', () => {
      stream.getTracks().forEach(track => track.stop());
      divContainer.remove();
    });
    divContainer.appendChild(stopBtn);

    // List devices AFTER getUserMedia
    listDevices(videoAfterInput, audioAfterInput, videoAfterOutput, audioAfterOutput);
  } catch (err) {
    alert('Error: ' + err.message);
    console.error(err);
  }
});


