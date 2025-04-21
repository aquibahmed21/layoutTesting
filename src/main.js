import './style.css'

document.querySelector('#app').innerHTML = `

<h3>Devices BEFORE getUserMedia()</h3>
<label for="videoBefore">Video Devices:</label>
<select id="videoBefore"></select><br>
<label for="audioBefore">Audio Devices:</label>
<select id="audioBefore"></select>

<h3>Devices AFTER getUserMedia()</h3>
<label for="videoAfter">Video Devices:</label>
<select id="videoAfter"></select><br>
<label for="audioAfter">Audio Devices:</label>
<select id="audioAfter"></select>
<br /><br /><br />
<button id="startBtn">Start Camera</button>
<br />
`

const startBtn = document.getElementById('startBtn');


const videoBefore = document.getElementById('videoBefore');
const audioBefore = document.getElementById('audioBefore');
const videoAfter = document.getElementById('videoAfter');
const audioAfter = document.getElementById('audioAfter');

async function listDevices(videoDropdown, audioDropdown) {
  const devices = await navigator.mediaDevices.enumerateDevices();

  videoDropdown.innerHTML = '';
  audioDropdown.innerHTML = '';

  devices.forEach(device => {
    const option = document.createElement('option');
    option.value = device.deviceId || '';
    option.text = device.label || `${device.kind}`;

    if (device.kind === 'videoinput') {
      videoDropdown.appendChild(option);
    } else if (device.kind === 'audioinput') {
      audioDropdown.appendChild(option);
    }
  });
}

// List devices BEFORE getUserMedia
listDevices(videoBefore, audioBefore);
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
    document.body.appendChild(divContainer);
    stopBtn.addEventListener('click', () => {
      stream.getTracks().forEach(track => track.stop());
      divContainer.remove();
    });
    divContainer.appendChild(stopBtn);

    // List devices AFTER getUserMedia
    listDevices(videoAfter, audioAfter);
  } catch (err) {
    alert('Error: ' + err.message);
    console.error(err);
  }
});


