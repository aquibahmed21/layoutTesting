    const startBtn = document.getElementById('startBtn');
    const toggleSpeakerBtn = document.getElementById('toggleSpeakerBtn');
    const video = document.getElementById('remoteVideo');

    let usingSpeaker = false;

    startBtn.addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        video.srcObject = stream;
        video.muted = false;
        await video.play();

        startBtn.disabled = true;
        toggleSpeakerBtn.disabled = false;
        toggleSpeakerBtn.textContent = "Use Speaker";

        // Optional sinkId logic (Android Chrome only)
        if (typeof video.setSinkId === 'function') {
          console.log("setSinkId is supported");
        } else {
          console.warn("setSinkId is not supported on this device");
        }
      } catch (e) {
        alert("Media access error: " + e.message);
      }
    });

    toggleSpeakerBtn.addEventListener('click', async () => {
      if (typeof video.setSinkId !== 'function') {
        alert("Audio output device control not supported on this browser.");
        return;
      }

      try {
        usingSpeaker = !usingSpeaker;
        await video.setSinkId(usingSpeaker ? 'speaker' : 'default');
        toggleSpeakerBtn.textContent = usingSpeaker ? "Use Earpiece" : "Use Speaker";
      } catch (e) {
        alert("Failed to switch audio output: " + e.message);
      }
    });