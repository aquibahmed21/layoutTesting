(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))n(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const o of t.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function i(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function n(e){if(e.ep)return;e.ep=!0;const t=i(e);fetch(e.href,t)}})();document.querySelector("#app").innerHTML=`
 <div class="page-container">
    <div class="header">Mobile Keyboard Layout Fix</div>
    <div class="chat-history">chat history</div>
    <div class="editor-wrapper">
      <div id="editor" contenteditable="true">
        Tap here and start typing...
      </div>
    </div>
  </div>
`;if(window.visualViewport){let r=function(){debugger;const i=window.visualViewport.height;s.style.height=i+"px"};var d=r;const s=document.querySelector(".editor-wrapper");window.visualViewport.addEventListener("resize",r),window.visualViewport.addEventListener("scroll",r),document.querySelector("#editor").addEventListener("focus",()=>{r()})}
