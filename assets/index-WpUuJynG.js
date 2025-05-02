(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))i(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const s of t.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function o(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function i(e){if(e.ep)return;e.ep=!0;const t=o(e);fetch(e.href,t)}})();document.querySelector("#app").innerHTML=`
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
`;
