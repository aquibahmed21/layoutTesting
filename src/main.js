const startBtn = document.getElementById('startBtn');
    const video = document.getElementById('video');

    startBtn.addEventListener('click', async () => {
      try {
        // Get microphone input to simulate a WebRTC call (could also use audio file)
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

        // Assign stream to video element (will use speaker on Android)
        video.srcObject = stream;

        // Unmute after user gesture
        video.muted = false;
        await video.play();

        startBtn.disabled = true;
        startBtn.textContent = 'Streaming...';

        // Optionally try to force output device (Android Chrome only)
        if (typeof video.setSinkId === 'function') {
          try {
            await video.setSinkId('default'); // or 'speaker' if supported
            console.log('Sink set to default');
          } catch (err) {
            console.warn('Could not set sinkId:', err);
          }
        }
      } catch (err) {
        console.error('Error accessing media devices.', err);
        alert('Permission denied or no devices found.');
      }
    });