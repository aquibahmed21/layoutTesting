(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))o(e);new MutationObserver(e=>{for(const i of e)if(i.type==="childList")for(const d of i.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&o(d)}).observe(document,{childList:!0,subtree:!0});function n(e){const i={};return e.integrity&&(i.integrity=e.integrity),e.referrerPolicy&&(i.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?i.credentials="include":e.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(e){if(e.ep)return;e.ep=!0;const i=n(e);fetch(e.href,i)}})();document.querySelector("#app").innerHTML=`

<h3>Devices BEFORE getUserMedia()</h3>
<label for="videoBefore">Video Devices:</label>
<select id="videoBefore"></select><br>
<label for="audioBefore">Audio Devices:</label>
<select id="audioBefore"></select>

<h3>Devices AFTER getUserMedia()</h3>
<label for="videoAfter">Video Devices:</label>
<select id="videoAfter"></select><br>
<label for="audioAfter">Audio Devices:</label>
<select id="audioAfter"></select>
<br /><br /><br />
<button id="startBtn">Start Camera</button>
<br />
`;const a=document.getElementById("startBtn"),l=document.getElementById("videoBefore"),u=document.getElementById("audioBefore"),f=document.getElementById("videoAfter"),m=document.getElementById("audioAfter");async function s(r,t){const n=await navigator.mediaDevices.enumerateDevices();r.innerHTML="",t.innerHTML="",n.forEach(o=>{const e=document.createElement("option");e.value=o.deviceId||"",e.text=o.label||`${o.kind}`,o.kind==="videoinput"?r.appendChild(e):o.kind==="audioinput"&&t.appendChild(e)})}s(l,u);let c=null;a.addEventListener("click",async()=>{try{c=await navigator.mediaDevices.getUserMedia({video:!0,audio:!0});const r=document.createElement("div"),t=document.createElement("video");t.autoplay=!0,t.playsinline=!0,t.width=320,t.height=240,t.style.marginTop="1em",r.appendChild(t);const n=document.createElement("br");r.appendChild(n),t.srcObject=c;const o=document.createElement("button");o.textContent="Stop Camera",document.body.appendChild(r),o.addEventListener("click",()=>{c.getTracks().forEach(e=>e.stop()),r.remove()}),r.appendChild(o),s(f,m)}catch(r){alert("Error: "+r.message),console.error(r)}});
