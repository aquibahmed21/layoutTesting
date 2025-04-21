(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))n(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const i of t.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function u(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function n(e){if(e.ep)return;e.ep=!0;const t=u(e);fetch(e.href,t)}})();document.querySelector("#app").innerHTML=`

<h3>Devices BEFORE getUserMedia()</h3>
<label for="videoBeforeInput">Video Devices Input:</label>
<select id="videoBeforeInput"></select><br>
<label for="audioBeforeInput">Audio Devices Input:</label>
<select id="audioBeforeInput"></select>

<br />

<label for="videoBeforeOutput">Video Devices Output:</label>
<select id="videoBeforeOutput"></select><br>
<label for="audioBeforeOutput">Audio Devices Output:</label>
<select id="audioBeforeOutput"></select>

<br /><br />

<h3>Devices AFTER getUserMedia()</h3>
<label for="videoAfterInput">Video Devices Input:</label>
<select id="videoAfterInput"></select><br>
<label for="audioAfterInput">Audio Devices Input:</label>
<select id="audioAfterInput"></select>

<br />

<label for="videoAfterOutput">Video Devices Output:</label>
<select id="videoAfterOutput"></select><br>
<label for="audioAfterOutput">Audio Devices Output:</label>
<select id="audioAfterOutput"></select>

<br /><br />
<button id="startBtn">Start Camera</button>
`;const c=document.getElementById("startBtn"),s=document.getElementById("videoBeforeInput"),a=document.getElementById("audioBeforeInput"),p=document.getElementById("videoBeforeOutput"),f=document.getElementById("audioBeforeOutput"),m=document.getElementById("videoAfterInput"),v=document.getElementById("audioAfterInput"),b=document.getElementById("videoAfterOutput"),B=document.getElementById("audioAfterOutput");async function l(r,o,u,n){const e=await navigator.mediaDevices.enumerateDevices();r.innerHTML="",o.innerHTML="",u.innerHTML="",n.innerHTML="",e.forEach(t=>{const i=document.createElement("option");i.value=t.deviceId||"",i.text=t.label||`${t.kind}`,t.kind==="videoinput"?r.appendChild(i):t.kind==="audioinput"?o.appendChild(i):t.kind==="videooutput"?u.appendChild(i):t.kind==="audiooutput"&&n.appendChild(i)})}l(s,a,p,f);let d=null;c.addEventListener("click",async()=>{try{d=await navigator.mediaDevices.getUserMedia({video:!0,audio:!0});const r=document.createElement("div"),o=document.createElement("video");o.autoplay=!0,o.playsinline=!0,o.width=320,o.height=240,o.style.marginTop="1em",r.appendChild(o);const u=document.createElement("br");r.appendChild(u),o.srcObject=d;const n=document.createElement("button");n.textContent="Stop Camera",document.body.appendChild(r),n.addEventListener("click",()=>{d.getTracks().forEach(e=>e.stop()),r.remove()}),r.appendChild(n),l(m,v,b,B)}catch(r){alert("Error: "+r.message),console.error(r)}});
