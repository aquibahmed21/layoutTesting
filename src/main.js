import './style.css'

document.querySelector('#app').innerHTML = `
 <div class="page-container">
    <div class="header">Mobile Keyboard Layout Fix</div>
    <div class="chat-history">chat history</div>
    <div class="editor-wrapper">
      <div id="editor" contenteditable="true">
        Tap here and start typing...
      </div>
    </div>
  </div>
`



    // Adjust for soft keyboard using visualViewport (modern browsers)
    if (window.visualViewport) {
      const editorWrapper = document.querySelector('.editor-wrapper');

      function adjustForKeyboard() {
        debugger;
        const viewportHeight = window.visualViewport.height;
        editorWrapper.style.height = viewportHeight + 'px';
      }

      window.visualViewport.addEventListener('resize', adjustForKeyboard);
      window.visualViewport.addEventListener('scroll', adjustForKeyboard); // for iOS

      // initial set
      document.querySelector('#editor').addEventListener('focus', () => {
        adjustForKeyboard();
      })
    }
