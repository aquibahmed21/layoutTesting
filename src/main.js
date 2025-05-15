import './style.css';

document.querySelector('#sendButton').addEventListener('click', sendMessage);
document.querySelector('#messageInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

const chatContainer = document.getElementById("chat");

const sampleMessages = [
  "Hey there!",
  "Look at this amazing place 😍",
  "Check this link: <a href='https://openai.com' target='_blank'>OpenAI</a>",
  "Hello <span class='mention'>@charlie</span>, thoughts?",
  "Just a regular message.",
  "Mentioning <span class='mention'>@dana</span> for feedback.",
  "Another random idea dropping here just to test height."
];

function getRandomImage() {
  const w = Math.floor(Math.random() * 200) + 100;
  const h = Math.floor(Math.random() * 150) + 100;
  const topic = ['city', 'nature', 'people', 'technology', 'animals'][Math.floor(Math.random() * 5)];
  return `<div class="image-wrapper loading"><img onload="this.classList.add('loaded'); this.parentElement.classList.remove('loading');" src="https://loremflickr.com/${w}/${h}/${topic}?random=${Math.random()}" alt="random image"/></div>`;
}

function appendChatMessages(count = 55) {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const isSelf = i % 3 === 0;
    const div = document.createElement("div");
    div.className = "chat-row" + (isSelf ? " self" : "");

    const type = i % 4;
    let content = "";

    switch (type) {
      case 0:
        content = sampleMessages[i % sampleMessages.length];
        break;
      case 1:
        content = sampleMessages[i % sampleMessages.length] + "<br>" + getRandomImage();
        break;
      case 2:
        content = getRandomImage();
        break;
      case 3:
        content = sampleMessages[i % sampleMessages.length] + " " + sampleMessages[(i + 1) % sampleMessages.length];
        break;
    }

    div.innerHTML = content;
    fragment.appendChild(div);
  }

  chatContainer.appendChild(fragment);

  // Scroll to bottom immediately
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // after 2 seconds, add scroll behavior
  // setTimeout(() => {
  //   chatContainer.style.scrollBehavior = "smooth";
  // }, 2000);

  // Prevent scroll jump on image load
  preventImageLoadScrollJump();
}

function preventImageLoadScrollJump() {

  const imgs = chatContainer.querySelectorAll("img");
  imgs.forEach(img => {
    if (!img.complete) {
      img.addEventListener("load", () => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      });
    }
  });
}

appendChatMessages();

function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (text) {
    const row = document.createElement("div");
    row.className = "chat-row self";
    row.textContent = text;
    chatContainer.appendChild(row);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    input.value = "";
  }
}