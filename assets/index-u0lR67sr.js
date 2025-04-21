(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))n(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const r of t.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function u(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function n(e){if(e.ep)return;e.ep=!0;const t=u(e);fetch(e.href,t)}})();document.querySelector("#app").innerHTML=`

<div class="container">
  <h3>Devices BEFORE getUserMedia()</h3>
  <label for="videoBeforeInput">Video Devices Input:</label>
  <select id="videoBeforeInput"></select><br>
  <label for="audioBeforeInput">Audio Devices Input:</label>
  <select id="audioBeforeInput"></select>
  <label for="videoBeforeOutput">Video Devices Output:</label>
  <select id="videoBeforeOutput"></select><br>
  <label for="audioBeforeOutput">Audio Devices Output:</label>
  <select id="audioBeforeOutput"></select>
</div>

<div class="container">
  <h3>Devices AFTER getUserMedia()</h3>
  <label for="videoAfterInput">Video Devices Input:</label>
  <select id="videoAfterInput"></select><br>
  <label for="audioAfterInput">Audio Devices Input:</label>
  <select id="audioAfterInput"></select>
  <label for="videoAfterOutput">Video Devices Output:</label>
  <select id="videoAfterOutput"></select><br>
  <label for="audioAfterOutput">Audio Devices Output:</label>
  <select id="audioAfterOutput"></select>
</div>

<br /><br />
<button id="startBtn" class="full-width">Start Camera</button>
`;const c=document.getElementById("startBtn"),s=document.getElementById("videoBeforeInput"),a=document.getElementById("audioBeforeInput"),p=document.getElementById("videoBeforeOutput"),f=document.getElementById("audioBeforeOutput"),m=document.getElementById("videoAfterInput"),v=document.getElementById("audioAfterInput"),b=document.getElementById("videoAfterOutput"),B=document.getElementById("audioAfterOutput");async function l(i,o,u,n){const e=await navigator.mediaDevices.enumerateDevices();i.innerHTML="",o.innerHTML="",u.innerHTML="",n.innerHTML="",e.forEach(t=>{const r=document.createElement("option");r.value=t.deviceId||"",r.text=t.label||`${t.kind}`,t.kind==="videoinput"?i.appendChild(r):t.kind==="audioinput"?o.appendChild(r):t.kind==="videooutput"?u.appendChild(r):t.kind==="audiooutput"&&n.appendChild(r)})}l(s,a,p,f);let d=null;c.addEventListener("click",async()=>{try{d=await navigator.mediaDevices.getUserMedia({video:!0,audio:!0});const i=document.createElement("div"),o=document.createElement("video");o.autoplay=!0,o.playsinline=!0,o.width=320,o.height=240,o.style.marginTop="1em",i.appendChild(o);const u=document.createElement("br");i.appendChild(u),o.srcObject=d;const n=document.createElement("button");n.textContent="Stop Camera",document.querySelector("#app").appendChild(i),n.addEventListener("click",()=>{d.getTracks().forEach(e=>e.stop()),i.remove()}),i.appendChild(n),l(m,v,b,B)}catch(i){alert("Error: "+i.message),console.error(i)}});
