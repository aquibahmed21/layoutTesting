const videoSources = [
      "https://www.w3schools.com/html/mov_bbb.mp4",
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    ];

    const videosContainer = document.getElementById("videos");
    const outputSelect = document.getElementById("audioOutputSelect");
    const warning = document.getElementById("warning");
    const videos = [];

    const canSwitchAudio = typeof HTMLMediaElement.prototype.setSinkId === "function";

    async function getAudioOutputDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(d => d.kind === "audiooutput");
    }

    async function setupAudioOutputSelect() {
      const devices = await getAudioOutputDevices();

      // Clear and add default option
      outputSelect.innerHTML = `<option value="">Default Device</option>`;
      devices.forEach(device => {
        const opt = document.createElement("option");
        opt.value = device.deviceId;
        opt.textContent = device.label || `Device ${device.deviceId}`;
        outputSelect.appendChild(opt);
      });

      outputSelect.addEventListener("change", async () => {
        const deviceId = outputSelect.value;
        for (const video of videos) {
          try {
            await video.setSinkId(deviceId);
          } catch (err) {
            console.error("setSinkId failed:", err);
          }
        }
      });
    }

    async function setupVideos() {
      for (let src of videoSources) {
        const wrapper = document.createElement("div");
        wrapper.className = "bg-white shadow rounded-lg p-4";

        const video = document.createElement("video");
        video.src = src;
        video.controls = true;
        video.autoplay = true;
        video.loop = true;
        video.className = "rounded w-full";

        videos.push(video);
        wrapper.appendChild(video);
        videosContainer.appendChild(wrapper);
      }
    }

    async function init() {
      if (!canSwitchAudio) {
        warning.classList.remove("hidden");
        return;
      }

      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        console.warn("Microphone permission needed for device labels.");
      }

      await setupVideos();
      await setupAudioOutputSelect();
    }

    init();