import './style.css'

document.querySelector('#app').innerHTML = `
  <div class="chat-container">
    <header class="chat-header">
      <h2>Chat with Support</h2>
    </header>

    <div class="chat-messages" id="chatMessages">
      <!-- Message bubbles go here -->
      <div class="message-row received">Hello! How can I help you?</div>
      <div class="message-row sent">I need assistance with my order.</div>
    </div>

    <div class="chat-input-wrapper">
      <div class="chat-input" contenteditable="true" placeholder="Type a message..."></div>
    </div>
  </div>
`

document.addEventListener('focus', function(event) {
  const target = event.target;
  if (
    target.matches('input, textarea, [contenteditable]')
  ) {
    console.log('Focused:', target);
    document.body.style.height = window.visualViewport.height + 'px';
    // Your custom logic here
  }
}, true); // useCapture: true to catch non-bubbling focus

document.addEventListener('blur', function(event) {
  const target = event.target;
  if (
    target.matches('input, textarea, [contenteditable]')
  ) {
    console.log('Blurred:', target);
    document.body.style.height = '';
    // Your custom logic here
  }
}, true); // useCapture: true to catch non-bubbling blur
