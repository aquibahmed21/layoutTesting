(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))n(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const i of t.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function o(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function n(e){if(e.ep)return;e.ep=!0;const t=o(e);fetch(e.href,t)}})();document.querySelector("#app").innerHTML=`
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
`;document.addEventListener("focus",async function(s){const r=s.target;r.matches("input, textarea, [contenteditable]")&&(await new Promise(o=>setTimeout(o,100)),console.log("Focused:",r),document.body.style.height=window.visualViewport.height+"px")},!0);document.addEventListener("blur",function(s){const r=s.target;r.matches("input, textarea, [contenteditable]")&&(console.log("Blurred:",r),document.body.style.height="")},!0);
