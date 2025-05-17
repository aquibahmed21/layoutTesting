import './style.css';

const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');

const demoMessages = [
  "Hey, how's it going?",
  "I'm good, thanks! You?",
  "Just chilling... image:https://loremflickr.com/200/140",
  "Check this out: image:https://loremflickr.com/150/120",
  "That's awesome!",
  "Here's a sunset pic: https://loremflickr.com/200/130",
  "Got any weekend plans?",
  "Thinking of going hiking.",
  "Nice! Take pics :)",
  "Hey, how's it going?",
  "I'm good, thanks! You?",
  "Just chilling... image:https://loremflickr.com/200/140",
  "Check this out: image:https://loremflickr.com/150/140",
  "That's awesome!",
  "Here's a sunset pic: https://loremflickr.com/200/130",
  "Got any weekend plans?",
  "Thinking of going hiking.",
  "Nice! Take pics :)",
  "Definitely!"
];

function createMessageElement(content) {
  const message = document.createElement('div');
  message.className = 'message';

  if (content.includes('image:')) {
    const [text, imgUrl] = content.split('image:');
    if (text.trim()) {
      message.appendChild(document.createTextNode(text.trim()));
    }
    const img = document.createElement('img');
    img.loading = "lazy";
    img.src = imgUrl.trim();
    message.appendChild(img);
  } else {
    message.textContent = content;
  }

  return message;
}

function isScrolledToBottom() {
  return chatContainer.scrollTop <= 5;
}

function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function appendMessage(content, shouldAutoScroll) {
  const messageEl = createMessageElement(content);
  chatContainer.insertBefore(messageEl, chatContainer.firstChild);

  const media = messageEl.querySelectorAll('img');
  if (media.length > 0) {
    let loaded = 0;
    media.forEach(img => {
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded === media.length && shouldAutoScroll) {
          requestAnimationFrame(() => scrollToBottom());
        }
      };
    });
  } else if (shouldAutoScroll) {
    scrollToBottom();
  }
}

function sendMessage() {
  const content = messageInput.value.trim();
  if (!content) return;

  const shouldAutoScroll = isScrolledToBottom();
  appendMessage(content, shouldAutoScroll);

  messageInput.value = '';
}

function demoInsert() {
  const shouldAutoScroll = isScrolledToBottom();
  const random = demoMessages[Math.floor(Math.random() * demoMessages.length)];
  appendMessage(random, shouldAutoScroll);
}

function loadInitialMessages() {
  // Reverse the demo messages to simulate older messages at top
  const reversed = [...demoMessages].reverse();
  reversed.forEach(msg => appendMessage(msg, false));

  // Scroll to bottom once all are loaded
  setTimeout(() => scrollToBottom(), 100);
}

// Init
window.onload = () => {
  loadInitialMessages();
};

// Send on Enter
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});
