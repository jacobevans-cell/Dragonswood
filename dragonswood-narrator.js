(function(){
  "use strict";

  const SPEED_STORE="dwNarrationSpeed",VOICE_STORE="dwNarrationVoice";
  const BRIAN_ID="us-brian",BRIAN_NAME="en-US-BrianMultilingualNeural";
  const LEGACY_VOICE_IDS=new Set(["automatic","gb-lewis","us-liam","us-bella","es-alex"]);
  const SUPPORTED_LOCALES=new Set(["en-US","en-GB","en-IE","en-AU","es-ES","fr-FR","ar-SA","zh-CN","vi-VN"]);
  const manifest=window.DRAGONSWOOD_NARRATION_MANIFEST||{clips:{},voices:{}};
  const voices=manifest.voices||{},clips=manifest.clips||{};
  let audio=null,objectUrl="",utterance=null,current=null,raf=0,speechQueue=[],speechIndex=0;
  let cloudChunks=[],cloudIndex=0,runToken=0;

  const normalize=text=>String(text||"").trim().replace(/\s+/g," ");
  const hash=text=>{let h=2166136261;for(const ch of normalize(text)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(16).padStart(8,"0")};
  const fmt=n=>`${Math.floor((n||0)/60)}:${String(Math.floor((n||0)%60)).padStart(2,"0")}`;
  const localeOf=value=>SUPPORTED_LOCALES.has(String(value||""))?String(value):"en-US";

  const root=document.createElement("section");
  root.className="dw-narrator";
  root.hidden=true;
  root.setAttribute("aria-label","Dragonswood narration player");
  const launcher=document.createElement("button");
  launcher.type="button";
  launcher.className="dw-narrator-launcher";
  launcher.setAttribute("aria-label","Open read aloud controls");
  launcher.textContent="🔊 READ ALOUD";
  launcher.hidden=true;
  root.innerHTML=`<style>
    .dw-narrator{position:fixed;z-index:100001;left:50%;bottom:16px;transform:translateX(-50%);width:min(760px,calc(100vw - 24px));padding:12px 14px;border:2px solid #f7cf62;border-radius:14px;background:#080923f5;color:#fff;box-shadow:0 14px 40px #000b;font:14px Arial}
    .dw-narrator-launcher{position:fixed;z-index:100000;right:14px;bottom:14px;border:2px solid #f7cf62;border-radius:999px;background:linear-gradient(135deg,#6b2fc7,#087ea4);color:#fff;padding:11px 15px;font:900 13px Arial;box-shadow:0 8px 24px #0009;cursor:pointer}
    .dw-narrator-head{display:flex;justify-content:space-between;gap:10px}.dw-narrator-title{font:900 17px Georgia;color:#ffe58e}.dw-narrator-voice-row{display:grid;grid-template-columns:auto minmax(220px,1fr);gap:8px;align-items:center;margin-top:9px}.dw-narrator-voice-row label{font-weight:900;color:#ffe58e}.dw-narrator-controls{display:grid;grid-template-columns:auto auto 1fr auto auto;gap:8px;align-items:center;margin-top:9px}
    .dw-narrator button,.dw-narrator select{border:1px solid #f7cf62;border-radius:8px;background:#312064;color:white;padding:8px;font-weight:900}.dw-narrator-page-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:9px}.dw-narrator-page-actions button{flex:1 1 180px}.dw-narrator input{width:100%}.dw-narrator small{display:block;color:#cfc4df;margin-top:6px}
    @media(max-width:560px){.dw-narrator-voice-row{grid-template-columns:1fr}.dw-narrator-controls{grid-template-columns:auto auto 1fr}.dw-narrator-speed,.dw-narrator-time{grid-column:auto}}
    @media(prefers-reduced-motion:reduce){.dw-narrator *{scroll-behavior:auto!important;transition:none!important}}
  </style><div class="dw-narrator-head"><div><div class="dw-narrator-title">📜 Listen to the Scroll</div><div id="dwNarratorStatus" role="status">Ready</div></div><button id="dwNarratorClose" aria-label="Close narration player">✕</button></div><div class="dw-narrator-voice-row"><label for="dwNarratorVoice">Narrator</label><select id="dwNarratorVoice" aria-label="Narrator"><option value="us-brian">Brian • Multilingual Neural</option></select></div><div class="dw-narrator-page-actions"><button id="dwNarratorReadPage">📖 Read this page</button><button id="dwNarratorReadSelection">🔎 Read selected text</button></div><div class="dw-narrator-controls"><button id="dwNarratorPlay" aria-label="Play or pause narration">▶ Play</button><button id="dwNarratorRestart" aria-label="Restart narration">↺</button><input id="dwNarratorProgress" aria-label="Narration progress" type="range" min="0" max="100" value="0"><span class="dw-narrator-time" id="dwNarratorTime">0:00</span><select class="dw-narrator-speed" id="dwNarratorSpeed" aria-label="Narration speed"><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select></div><small>Brian is the Dragonswood narrator. Finished recordings are reused; a device voice is used only when Brian audio is unavailable.</small>`;

  const mount=()=>{if(!launcher.isConnected)document.body.append(launcher);if(!root.isConnected)document.body.append(root)};
  const q=id=>root.querySelector(id);
  const status=text=>{mount();q("#dwNarratorStatus").textContent=text};
  const pref=()=>{
    const saved=localStorage.getItem(VOICE_STORE)||BRIAN_ID;
    if(saved!==BRIAN_ID&&LEGACY_VOICE_IDS.has(saved))localStorage.setItem(VOICE_STORE,BRIAN_ID);
    return BRIAN_ID;
  };
  const requestedVoice=()=>BRIAN_ID;
  const voiceLabel=id=>voices[id]?.label||"Brian • Multilingual Neural";

  function tick(){
    if(!audio)return;
    q("#dwNarratorProgress").value=audio.duration?audio.currentTime/audio.duration*100:0;
    q("#dwNarratorTime").textContent=`${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
    if(!audio.paused)raf=requestAnimationFrame(tick);
  }
  function setNarratorPlaying(value){document.documentElement.dataset.dwNarratorPlaying=value?"1":"0"}
  function releaseAudio(){
    cancelAnimationFrame(raf);
    if(audio){audio.pause();audio.removeAttribute("src");audio.load();audio=null}
    if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=""}
  }
  function stop(hide=false){
    runToken++;
    setNarratorPlaying(false);
    releaseAudio();
    if("speechSynthesis" in window)speechSynthesis.cancel();
    utterance=null;speechQueue=[];speechIndex=0;cloudChunks=[];cloudIndex=0;current=null;
    if(root.isConnected){q("#dwNarratorPlay").textContent="▶ Play";if(hide)root.hidden=true}
  }

  function chooseBrowserVoice(){
    const list=speechSynthesis.getVoices();
    const english=list.filter(voice=>String(voice.lang||"").toLowerCase().startsWith("en"));
    const modern=/natural|online|neural|google us english|microsoft (aria|guy|andrew|brian|ryan|george)/i;
    const legacy=/microsoft (david|zira|hazel)/i;
    return english.find(voice=>modern.test(voice.name))||english.find(voice=>!legacy.test(voice.name))||english[0]||list[0]||null;
  }
  function waitForBrowserVoices(){
    if(!("speechSynthesis" in window))return Promise.resolve([]);
    const ready=speechSynthesis.getVoices();
    if(ready.length)return Promise.resolve(ready);
    return new Promise(resolve=>{
      let done=false;
      const finish=()=>{if(done)return;done=true;speechSynthesis.removeEventListener?.("voiceschanged",finish);resolve(speechSynthesis.getVoices())};
      speechSynthesis.addEventListener?.("voiceschanged",finish,{once:true});
      setTimeout(finish,1200);
    });
  }
  function splitAtLimit(text,limit){
    const sentences=normalize(text).match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[];
    const chunks=[];let chunk="";
    const push=()=>{if(chunk.trim())chunks.push(chunk.trim());chunk=""};
    for(const sentenceValue of sentences){
      const sentence=sentenceValue.trim();
      if(!sentence)continue;
      if(sentence.length>limit){
        push();let longChunk="";
        for(const word of sentence.split(/\s+/)){
          if((longChunk+" "+word).trim().length>limit){if(longChunk)chunks.push(longChunk);longChunk=word}else longChunk=(longChunk+" "+word).trim();
        }
        if(longChunk)chunks.push(longChunk);
      }else if((chunk+" "+sentence).trim().length>limit){push();chunk=sentence}else chunk=(chunk+" "+sentence).trim();
    }
    push();
    return chunks;
  }
  const splitForSpeech=text=>splitAtLimit(text,220);
  const splitForCloud=text=>splitAtLimit(text,5200);

  function speakQueueItem(token,note=""){
    if(token!==runToken)return;
    if(speechIndex>=speechQueue.length){setNarratorPlaying(false);utterance=null;q("#dwNarratorPlay").textContent="▶ Replay";status("Scroll complete");return}
    utterance=new SpeechSynthesisUtterance(speechQueue[speechIndex]);
    utterance.lang=localeOf(current?.locale);
    utterance.voice=chooseBrowserVoice();
    utterance.rate=Number(current?.rate||q("#dwNarratorSpeed").value||1);
    const actual=utterance.voice?.name||"device voice";
    status(note||`Brian audio is unavailable — temporary device voice: ${actual}`);
    utterance.onend=()=>{speechIndex++;speakQueueItem(token,note)};
    utterance.onerror=event=>{if(event.error==="interrupted"||event.error==="canceled")return;status("Device narration could not continue. Press Replay to try again.")};
    speechSynthesis.speak(utterance);
    setNarratorPlaying(true);
    q("#dwNarratorPlay").textContent="⏸ Pause";
  }
  async function fallback(text,token,note=""){
    releaseAudio();
    if(token!==runToken)return;
    if(!("speechSynthesis" in window)){status("Brian narration is not available yet. You can continue your work normally.");return}
    status("Brian audio is unavailable; preparing the temporary device voice…");
    await waitForBrowserVoices();
    if(token!==runToken)return;
    speechSynthesis.cancel();speechQueue=splitForSpeech(text);speechIndex=0;
    if(!speechQueue.length){status("No readable text was found.");return}
    setTimeout(()=>speakQueueItem(token,note),60);
  }

  async function requestCloudBrian(text,locale){
    let response;
    if(window.firebase?.apps?.length&&typeof window.firebase.app().functions==="function"){
      response=await window.firebase.app().functions("us-central1").httpsCallable("synthesizeBrianNarration")({text,locale});
    }else{
      const appModule=await import("https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js");
      const functionsModule=await import("https://www.gstatic.com/firebasejs/12.1.0/firebase-functions.js");
      const apps=appModule.getApps();
      if(!apps.length)throw new Error("Firebase is not initialized on this page.");
      const functions=functionsModule.getFunctions(apps[0],"us-central1");
      const call=functionsModule.httpsCallable(functions,"synthesizeBrianNarration",{timeout:60000});
      response=await call({text,locale});
    }
    const base64=String(response?.data?.audioBase64||"");
    if(!base64)throw new Error("The Brian narration service returned no audio.");
    const binary=atob(base64),bytes=new Uint8Array(binary.length);
    for(let index=0;index<binary.length;index++)bytes[index]=binary.charCodeAt(index);
    const url=URL.createObjectURL(new Blob([bytes],{type:"audio/mpeg"}));
    return {url,cacheHit:response?.data?.cacheHit===true};
  }

  function startAudio(src,{token,label,onEnded,onError,isObjectUrl=false}={}){
    if(token!==runToken){if(isObjectUrl)URL.revokeObjectURL(src);return}
    releaseAudio();
    if(isObjectUrl)objectUrl=src;
    audio=new Audio(src);audio.preload="auto";audio.playbackRate=Number(current?.rate||q("#dwNarratorSpeed").value||1);
    audio.onerror=()=>{releaseAudio();if(typeof onError==="function")onError()};
    audio.onended=()=>{setNarratorPlaying(false);releaseAudio();if(typeof onEnded==="function")onEnded();else{q("#dwNarratorPlay").textContent="▶ Replay";status("Scroll complete")}};
    audio.play().then(()=>{if(token!==runToken)return;setNarratorPlaying(true);status(label||`${voiceLabel(BRIAN_ID)} is playing`);q("#dwNarratorPlay").textContent="⏸ Pause";tick()}).catch(()=>{if(token!==runToken)return;status("Brian audio is ready — press Play to begin");q("#dwNarratorPlay").textContent="▶ Play"});
  }

  async function playCloudChunk(token){
    if(token!==runToken)return;
    if(cloudIndex>=cloudChunks.length){q("#dwNarratorPlay").textContent="▶ Replay";status("Scroll complete");return}
    const part=cloudIndex+1,total=cloudChunks.length,text=cloudChunks[cloudIndex];
    status(total>1?`Preparing Brian — part ${part} of ${total}…`:"Preparing Brian…");
    try{
      const result=await requestCloudBrian(text,localeOf(current?.locale));
      if(token!==runToken){URL.revokeObjectURL(result.url);return}
      const label=total>1?`Brian is reading — part ${part} of ${total}`:`Brian is reading${result.cacheHit?" (reused recording)":""}`;
      startAudio(result.url,{token,label,isObjectUrl:true,onEnded:()=>{cloudIndex++;playCloudChunk(token)},onError:()=>fallback(cloudChunks.slice(cloudIndex).join(" "),token)});
    }catch(error){
      console.warn("Dragonswood Brian cloud narration unavailable:",error?.message||error);
      fallback(cloudChunks.slice(cloudIndex).join(" "),token);
    }
  }
  function playCloud(text,token){
    cloudChunks=splitForCloud(text);cloudIndex=0;
    if(!cloudChunks.length){status("No readable text was found.");return}
    playCloudChunk(token);
  }

  function resolveSource(entry,voiceId){return entry?.sources?.[voiceId]||entry?.sources?.[entry.defaultVoice]||entry?.src||""}
  function play(opts={}){
    stop(false);mount();root.hidden=false;
    const token=runToken;
    q("#dwNarratorVoice").value=BRIAN_ID;
    current={
      id:String(opts.id||""),text:String(opts.text||""),spanishText:String(opts.spanishText||""),
      contentType:String(opts.contentType||"general"),assessmentLanguage:String(opts.assessmentLanguage||""),
      voiceId:BRIAN_ID,locale:localeOf(opts.locale),rate:Math.max(0.5,Math.min(1.5,Number(opts.rate)||0))||null
    };
    const entry=clips[current.id],voiceId=requestedVoice(),spokenText=current.text;
    const src=resolveSource(entry,voiceId),expectedHash=entry?.voiceHashes?.[voiceId]||entry?.hash;
    const entryLocale=localeOf(entry?.locale),valid=entry&&expectedHash===hash(spokenText)&&entryLocale===current.locale&&src;
    if(!valid){playCloud(spokenText,token);return}
    status(`Loading ${voiceLabel(voiceId)}…`);
    startAudio(src,{token,label:`${voiceLabel(voiceId)} is playing`,onError:()=>playCloud(spokenText,token)});
  }
  function setVoicePreference(){
    localStorage.setItem(VOICE_STORE,BRIAN_ID);
    if(root.isConnected)q("#dwNarratorVoice").value=BRIAN_ID;
    window.dispatchEvent(new CustomEvent("dw:narration-voice-change",{detail:{voiceId:BRIAN_ID}}));
    return BRIAN_ID;
  }
  function previewVoice(){
    play({id:"system/welcome",text:"Hello, adventurer, and welcome to Dragonswood. We hope to see you soon—and hear the tales of your journey.",voiceId:BRIAN_ID,contentType:"general",locale:"en-US"});
  }
  function readablePageText(){
    if(typeof window.DWReadAloudText==="function")return normalize(window.DWReadAloudText());
    const clone=document.body.cloneNode(true);
    clone.querySelectorAll("script,style,noscript,nav,header,footer,button,input,select,textarea,label,[hidden],[aria-hidden='true'],.dw-narrator,.dw-narrator-launcher,.teacher-only,.answer,.answers,.choices,.choice").forEach(node=>node.remove());
    return normalize(clone.innerText).slice(0,24000);
  }

  mount();
  launcher.onclick=()=>{root.hidden=false;q("#dwNarratorVoice").value=BRIAN_ID;status("Brian is ready. Read the page or highlight a smaller section.")};
  q("#dwNarratorReadPage").onclick=()=>{const text=readablePageText();if(text)play({id:`page/${location.pathname}`,text,contentType:/spelling|reader|writing|witch/i.test(location.pathname)?"ela":"general"});else status("No readable lesson text was found on this page.")};
  q("#dwNarratorReadSelection").onclick=()=>{const text=normalize(getSelection()?.toString());if(text)play({id:`selection/${location.pathname}`,text,contentType:/spelling|reader|writing|witch/i.test(location.pathname)?"ela":"general"});else status("Highlight words or a sentence first, then press Read selected text.")};
  q("#dwNarratorVoice").value=BRIAN_ID;
  q("#dwNarratorVoice").onchange=setVoicePreference;
  q("#dwNarratorSpeed").value=localStorage.getItem(SPEED_STORE)||"1";
  q("#dwNarratorSpeed").onchange=()=>{localStorage.setItem(SPEED_STORE,q("#dwNarratorSpeed").value);if(audio)audio.playbackRate=Number(q("#dwNarratorSpeed").value)};
  q("#dwNarratorClose").onclick=()=>stop(true);
  q("#dwNarratorRestart").onclick=()=>{if(current){const restart={...current};play(restart)}};
  q("#dwNarratorPlay").onclick=()=>{
    if(audio){
      if(audio.paused){audio.play();setNarratorPlaying(true);q("#dwNarratorPlay").textContent="⏸ Pause";tick()}
      else{audio.pause();setNarratorPlaying(false);q("#dwNarratorPlay").textContent="▶ Resume"}
    }else if(utterance){
      if(speechSynthesis.paused){speechSynthesis.resume();setNarratorPlaying(true);q("#dwNarratorPlay").textContent="⏸ Pause"}
      else{speechSynthesis.pause();setNarratorPlaying(false);q("#dwNarratorPlay").textContent="▶ Resume"}
    }else if(current){const replay={...current};play(replay)}
  };
  q("#dwNarratorProgress").oninput=()=>{if(audio&&audio.duration)audio.currentTime=Number(q("#dwNarratorProgress").value)/100*audio.duration};
  ["pagehide","beforeunload","hashchange"].forEach(eventName=>addEventListener(eventName,()=>stop(true)));
  document.addEventListener("visibilitychange",()=>{if(document.hidden)stop(true)});

  window.DWVoicePreferences=Object.freeze({get:pref,set:setVoicePreference,voices});
  window.DWNarrator=Object.freeze({play,previewVoice,stop,hash,normalize,setVoicePreference,getVoicePreference:pref,voiceId:BRIAN_ID,modelVoice:BRIAN_NAME});
  window.DWCedar=window.DWNarrator;
})();
