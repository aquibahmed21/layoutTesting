(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))i(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const o of t.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function c(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function i(e){if(e.ep)return;e.ep=!0;const t=c(e);fetch(e.href,t)}})();document.querySelector("#app").innerHTML=`
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
`;document.addEventListener("focus",function(s){const r=s.target;r.matches("input, textarea, [contenteditable]")&&(console.log("Focused:",r),document.body.style.height=window.visualViewport.height+"px")},!0);document.addEventListener("blur",function(s){const r=s.target;r.matches("input, textarea, [contenteditable]")&&(console.log("Blurred:",r),document.body.style.height="")},!0);
