(function(){
  "use strict";
  const SPEED_STORE="dwNarrationSpeed",VOICE_STORE="dwNarrationVoice";
  const manifest=window.DRAGONSWOOD_NARRATION_MANIFEST||{clips:{},voices:{}};
  const voices=manifest.voices||{},clips=manifest.clips||{};
  let audio=null,utterance=null,current=null,raf=0,speechQueue=[],speechIndex=0;
  const normalize=text=>String(text||"").trim().replace(/\s+/g," ");
  const hash=text=>{let h=2166136261;for(const ch of normalize(text)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(16).padStart(8,"0")};
  const fmt=n=>`${Math.floor((n||0)/60)}:${String(Math.floor((n||0)%60)).padStart(2,"0")}`;
  const root=document.createElement("section");root.className="dw-narrator";root.hidden=true;root.setAttribute("aria-label","Dragonswood narration player");
  const launcher=document.createElement("button");launcher.type="button";launcher.className="dw-narrator-launcher";launcher.setAttribute("aria-label","Open read aloud controls");launcher.textContent="🔊 READ ALOUD";
  root.innerHTML=`<style>
    .dw-narrator{position:fixed;z-index:100001;left:50%;bottom:16px;transform:translateX(-50%);width:min(760px,calc(100vw - 24px));padding:12px 14px;border:2px solid #f7cf62;border-radius:14px;background:#080923f5;color:#fff;box-shadow:0 14px 40px #000b;font:14px Arial}
    .dw-narrator-launcher{position:fixed;z-index:100000;right:14px;bottom:14px;border:2px solid #f7cf62;border-radius:999px;background:linear-gradient(135deg,#6b2fc7,#087ea4);color:#fff;padding:11px 15px;font:900 13px Arial;box-shadow:0 8px 24px #0009;cursor:pointer}
    .dw-narrator-head{display:flex;justify-content:space-between;gap:10px}.dw-narrator-title{font:900 17px Georgia;color:#ffe58e}.dw-narrator-voice-row{display:grid;grid-template-columns:auto minmax(220px,1fr);gap:8px;align-items:center;margin-top:9px}.dw-narrator-voice-row label{font-weight:900;color:#ffe58e}.dw-narrator-controls{display:grid;grid-template-columns:auto auto 1fr auto auto;gap:8px;align-items:center;margin-top:9px}
    .dw-narrator button,.dw-narrator select{border:1px solid #f7cf62;border-radius:8px;background:#312064;color:white;padding:8px;font-weight:900}.dw-narrator-page-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:9px}.dw-narrator-page-actions button{flex:1 1 180px}.dw-narrator input{width:100%}.dw-narrator small{display:block;color:#cfc4df;margin-top:6px}
    @media(max-width:560px){.dw-narrator-voice-row{grid-template-columns:1fr}.dw-narrator-controls{grid-template-columns:auto auto 1fr}.dw-narrator-speed,.dw-narrator-time{grid-column:auto}}
    @media(prefers-reduced-motion:reduce){.dw-narrator *{scroll-behavior:auto!important;transition:none!important}}
  </style><div class="dw-narrator-head"><div><div class="dw-narrator-title">📜 Listen to the Scroll</div><div id="dwNarratorStatus" role="status">Ready</div></div><button id="dwNarratorClose" aria-label="Close narration player">✕</button></div><div class="dw-narrator-voice-row"><label for="dwNarratorVoice">Narrator</label><select id="dwNarratorVoice" aria-label="Choose narrator"><option value="automatic">Automatic • Lewis for fantasy, Liam for ELA</option><option value="gb-lewis">Lewis • Fantasy British</option><option value="us-liam">Liam • American Academic</option><option value="us-bella">Bella • American Female</option><option value="es-alex">Alex • Spanish Support</option></select></div><div class="dw-narrator-page-actions"><button id="dwNarratorReadPage">📖 Read this page</button><button id="dwNarratorReadSelection">🔎 Read selected text</button></div><div class="dw-narrator-controls"><button id="dwNarratorPlay" aria-label="Play or pause narration">▶ Play</button><button id="dwNarratorRestart" aria-label="Restart narration">↺</button><input id="dwNarratorProgress" aria-label="Narration progress" type="range" min="0" max="100" value="0"><span class="dw-narrator-time" id="dwNarratorTime">0:00</span><select class="dw-narrator-speed" id="dwNarratorSpeed" aria-label="Narration speed"><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select></div><small>AI-generated narration • Your narrator choice is remembered everywhere. Browser voice is the safe fallback when a recording is unavailable.</small>`;
  const mount=()=>{if(!launcher.isConnected)document.body.append(launcher);if(!root.isConnected)document.body.append(root)};
  const q=id=>root.querySelector(id),status=t=>{mount();q("#dwNarratorStatus").textContent=t};
  const pref=()=>localStorage.getItem(VOICE_STORE)||"automatic";
  const requestedVoice=(contentType="general")=>pref()==="automatic"?(contentType==="ela"?"us-liam":"gb-lewis"):(voices[pref()]?pref():"gb-lewis");
  const voiceLabel=id=>voices[id]?.label||"Dragonswood Narrator";
  function tick(){if(audio){q("#dwNarratorProgress").value=audio.duration?audio.currentTime/audio.duration*100:0;q("#dwNarratorTime").textContent=`${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;if(!audio.paused)raf=requestAnimationFrame(tick)}}
  function setNarratorPlaying(v){document.documentElement.dataset.dwNarratorPlaying=v?"1":"0"}
  function stop(hide=false){setNarratorPlaying(false);cancelAnimationFrame(raf);if(audio){audio.pause();audio.removeAttribute("src");audio.load();audio=null}if("speechSynthesis" in window)speechSynthesis.cancel();utterance=null;speechQueue=[];speechIndex=0;current=null;if(root.isConnected){q("#dwNarratorPlay").textContent="▶ Play";if(hide)root.hidden=true}}
  function chooseBrowserVoice(voiceId){
    const list=speechSynthesis.getVoices(),wanted=String(voices[voiceId]?.lang||"en-US").toLowerCase();
    const exact=list.filter(v=>String(v.lang||"").toLowerCase()===wanted),language=wanted.slice(0,2);
    const languagePool=list.filter(v=>String(v.lang||"").toLowerCase().startsWith(language));
    // ChromeOS usually exposes only one en-US voice but does expose a distinct
    // English female voice under en-GB. Bella must search the full English pool.
    const pool=voiceId==="us-bella"?languagePool:(exact.length?exact:languagePool);
    const patterns={
      "gb-lewis":/google uk english male|microsoft ryan|microsoft george|daniel|lewis|british.*male|male.*british/i,
      "us-liam":/google us english(?!.*female)|microsoft guy|microsoft david|liam|american.*male|male.*american/i,
      "us-bella":/google uk english female|google us english.*female|microsoft aria|microsoft zira|samantha|victoria|bella|english.*female|female.*english/i,
      "es-alex":/google espa[ñn]ol|microsoft alvaro|microsoft jorge|alex|spanish.*male|male.*spanish/i
    };
    const preferred=pool.find(v=>patterns[voiceId]?.test(v.name));
    if(preferred)return preferred;
    const local=pool.find(v=>v.localService!==false);
    const index=voiceId==="us-bella"&&pool.length>1?1:0;
    return local||pool[index]||pool[0]||list.find(v=>/^en/i.test(v.lang))||list[0]||null;
  }
  function waitForBrowserVoices(){
    if(!("speechSynthesis" in window))return Promise.resolve([]);
    const ready=speechSynthesis.getVoices();if(ready.length)return Promise.resolve(ready);
    return new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;speechSynthesis.removeEventListener?.("voiceschanged",finish);resolve(speechSynthesis.getVoices())};speechSynthesis.addEventListener?.("voiceschanged",finish,{once:true});setTimeout(finish,1200)});
  }
  function splitForSpeech(text){
    const sentences=normalize(text).match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[];const chunks=[];
    for(const sentence of sentences){if(sentence.length<=240){chunks.push(sentence.trim());continue}const words=sentence.trim().split(/\s+/);let chunk="";for(const word of words){if((chunk+" "+word).trim().length>220){if(chunk)chunks.push(chunk);chunk=word}else chunk=(chunk+" "+word).trim()}if(chunk)chunks.push(chunk)}
    return chunks.filter(Boolean);
  }
  function speakQueueItem(voiceId,note=""){
    if(speechIndex>=speechQueue.length){setNarratorPlaying(false);utterance=null;q("#dwNarratorPlay").textContent="▶ Replay";status("Scroll complete");return}
    utterance=new SpeechSynthesisUtterance(speechQueue[speechIndex]);utterance.lang=voiceId==="es-alex"?"es-ES":voices[voiceId]?.lang||"en-US";utterance.voice=chooseBrowserVoice(voiceId);utterance.rate=Number(q("#dwNarratorSpeed").value||1);const actual=utterance.voice?.name?` (${utterance.voice.name})`:"";status(note||`${voiceLabel(voiceId)} is reading${actual}`);utterance.onend=()=>{speechIndex++;speakQueueItem(voiceId,note)};utterance.onerror=e=>{if(e.error==="interrupted"||e.error==="canceled")return;status("Browser narration could not continue. Press Replay or try another narrator.")};speechSynthesis.speak(utterance);setNarratorPlaying(true);q("#dwNarratorPlay").textContent="⏸ Pause";
  }
  async function fallback(text,voiceId,note=""){if(audio){audio.pause();audio=null}if(!("speechSynthesis" in window)){status("Narration unavailable. You can continue your work normally.");return}status(`Preparing ${voiceLabel(voiceId)}…`);await waitForBrowserVoices();speechSynthesis.cancel();speechQueue=splitForSpeech(text);speechIndex=0;if(!speechQueue.length){status("No readable text was found.");return}setTimeout(()=>speakQueueItem(voiceId,note),60)}
  function resolveSource(entry,voiceId){return entry?.sources?.[voiceId]||entry?.sources?.[entry.defaultVoice]||entry?.src||""}
  function play(opts={}){mount();stop(false);root.hidden=false;q("#dwNarratorVoice").value=pref();current={id:String(opts.id||""),text:String(opts.text||""),spanishText:String(opts.spanishText||""),contentType:String(opts.contentType||"general"),assessmentLanguage:String(opts.assessmentLanguage||""),voiceId:String(opts.voiceId||"")};const entry=clips[current.id];let voiceId=current.voiceId||requestedVoice(current.contentType),spokenText=current.text,note="";if(voiceId==="es-alex"){if(current.spanishText)spokenText=current.spanishText;else if(current.assessmentLanguage==="en"){voiceId="us-liam";note="This English assessment stays in English; Liam will pronounce it clearly."}}const src=resolveSource(entry,voiceId),expectedHash=entry?.voiceHashes?.[voiceId]||entry?.hash,valid=entry&&expectedHash===hash(spokenText)&&src;if(!valid){fallback(spokenText,voiceId,note);return}status(`Loading ${voiceLabel(voiceId)}…`);audio=new Audio(src);audio.preload="auto";audio.playbackRate=Number(q("#dwNarratorSpeed").value||1);audio.onerror=()=>fallback(spokenText,voiceId,note);audio.onended=()=>{setNarratorPlaying(false);q("#dwNarratorPlay").textContent="▶ Replay";status("Scroll complete")};audio.play().then(()=>{setNarratorPlaying(true);status(`${voiceLabel(voiceId)} is playing`);q("#dwNarratorPlay").textContent="⏸ Pause";tick()}).catch(()=>{status("Audio is ready — press Play to begin");q("#dwNarratorPlay").textContent="▶ Play"})}
  function setVoicePreference(id){const safe=id==="automatic"||voices[id]?id:"automatic";localStorage.setItem(VOICE_STORE,safe);if(root.isConnected)q("#dwNarratorVoice").value=safe;window.dispatchEvent(new CustomEvent("dw:narration-voice-change",{detail:{voiceId:safe}}));return safe}
  function previewVoice(voiceId){
    const selected=voiceId==="automatic"?"gb-lewis":voiceId;
    play({id:"system/welcome",text:"Hello, adventurer, and welcome to Dragonswood. We hope to see you soon—and hear the tales of your journey.",spanishText:"Hola, aventurero, y bienvenido a Dragonswood. Esperamos verte pronto y escuchar los relatos de tu viaje.",voiceId:selected,contentType:"general"});
  }
  function readablePageText(){
    if(typeof window.DWReadAloudText==="function")return normalize(window.DWReadAloudText());
    const clone=document.body.cloneNode(true);
    clone.querySelectorAll("script,style,noscript,nav,header,footer,button,input,select,textarea,label,[hidden],[aria-hidden='true'],.dw-narrator,.dw-narrator-launcher,.teacher-only,.answer,.answers,.choices,.choice").forEach(node=>node.remove());
    return normalize(clone.innerText).slice(0,24000);
  }
  mount();
  launcher.onclick=()=>{root.hidden=false;q("#dwNarratorVoice").value=pref();status("Choose a narrator, then read the page or selected text.")};
  q("#dwNarratorReadPage").onclick=()=>{const text=readablePageText();if(text)play({id:`page/${location.pathname}`,text,contentType:/spelling|reader|writing|witch/i.test(location.pathname)?"ela":"general"});else status("No readable lesson text was found on this page.")};
  q("#dwNarratorReadSelection").onclick=()=>{const text=normalize(getSelection()?.toString());if(text)play({id:`selection/${location.pathname}`,text,contentType:/spelling|reader|writing|witch/i.test(location.pathname)?"ela":"general"});else status("Highlight words or a sentence first, then press Read selected text.")};
  mount();q("#dwNarratorVoice").value=pref();q("#dwNarratorVoice").onchange=()=>{setVoicePreference(q("#dwNarratorVoice").value);if(current)play({...current,voiceId:""})};q("#dwNarratorSpeed").value=localStorage.getItem(SPEED_STORE)||"1";q("#dwNarratorSpeed").onchange=()=>{localStorage.setItem(SPEED_STORE,q("#dwNarratorSpeed").value);if(audio)audio.playbackRate=Number(q("#dwNarratorSpeed").value)};q("#dwNarratorClose").onclick=()=>stop(true);q("#dwNarratorRestart").onclick=()=>{if(audio){audio.currentTime=0;audio.play();tick()}else if(current)play(current)};q("#dwNarratorPlay").onclick=()=>{if(audio){if(audio.paused){audio.play();setNarratorPlaying(true);q("#dwNarratorPlay").textContent="⏸ Pause";tick()}else{audio.pause();setNarratorPlaying(false);q("#dwNarratorPlay").textContent="▶ Resume"}}else if(utterance){if(speechSynthesis.paused){speechSynthesis.resume();setNarratorPlaying(true);q("#dwNarratorPlay").textContent="⏸ Pause"}else{speechSynthesis.pause();setNarratorPlaying(false);q("#dwNarratorPlay").textContent="▶ Resume"}}else if(current)play(current)};q("#dwNarratorProgress").oninput=()=>{if(audio&&audio.duration)audio.currentTime=Number(q("#dwNarratorProgress").value)/100*audio.duration};["pagehide","beforeunload","hashchange"].forEach(e=>addEventListener(e,()=>stop(true)));document.addEventListener("visibilitychange",()=>{if(document.hidden)stop(true)});
  window.DWVoicePreferences=Object.freeze({get:pref,set:setVoicePreference,voices});
  window.DWNarrator=Object.freeze({play,previewVoice,stop,hash,normalize,setVoicePreference,getVoicePreference:pref});
  window.DWCedar=window.DWNarrator;
})();
