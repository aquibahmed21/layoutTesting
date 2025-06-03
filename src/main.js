 window.addEventListener("message", (event) => {
      const iframe = document.getElementById("testFrame");
      if (event.data === "keyboardOpen") {
        iframe.style.height = "60vh";
      } else if (event.data === "keyboardClose") {
        iframe.style.height = "100vh";
      }
    });