#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import {execFile} from "node:child_process";
import {promisify} from "node:util";
import {fileURLToPath} from "node:url";

const execFileAsync=promisify(execFile),here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,"../..");
const jobs=JSON.parse(await fs.readFile(path.join(root,"narration-jobs.json"),"utf8"));
const shouldGenerate=process.argv.includes("--generate"),force=process.argv.includes("--force");
const normalize=text=>String(text||"").normalize("NFKC").trim().replace(/\s+/g," ");
const hash=text=>{let h=2166136261;for(const ch of normalize(text)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(16).padStart(8,"0")};
const wordCount=text=>normalize(text).split(/\s+/).filter(Boolean).length;
const safe=value=>String(value||"").toLowerCase().replace(/[^a-z0-9_-]+/g,"-").replace(/^-|-$/g,"");
let oldManifest={clips:{}};try{oldManifest=JSON.parse(await fs.readFile(path.join(root,"narration-manifest.generated.json"),"utf8"))}catch{}
const planned=[];
for(const clip of jobs.clips)for(const voiceId of clip.voices||[]){const voice=jobs.voices[voiceId];if(!voice)throw new Error(`Unknown voice ${voiceId} in ${clip.id}`);const spokenText=clip.translations?.[voiceId]||clip.text;planned.push({clip,voiceId,voice,spokenText,relative:`assets/audio/narration/${safe(clip.area)}/${safe(clip.lessonId)}/${safe(clip.sectionId)}--${safe(voiceId)}.mp3`,spokenHash:hash(spokenText)})}
const estimatedSeconds=planned.reduce((sum,row)=>sum+wordCount(row.spokenText)/145*60,0);
if(!shouldGenerate){console.log(JSON.stringify({mode:"audit-only",sections:jobs.clips.length,voiceClips:planned.length,estimatedMinutes:+(estimatedSeconds/60).toFixed(1),model:jobs.model,studentModelDownload:false},null,2));process.exit(0)}
let KokoroTTS;try{({KokoroTTS}=await import("kokoro-js"))}catch{console.error("kokoro-js is not installed. Run: npm install");process.exit(2)}
try{await execFileAsync("ffmpeg",["-version"])}catch{console.error("ffmpeg is required to create compact MP3 files.");process.exit(2)}
const tts=await KokoroTTS.from_pretrained(jobs.model,{dtype:"q8",device:"cpu"});
const report={startedAt:new Date().toISOString(),model:jobs.model,speed:jobs.speed,generated:[],skipped:[],changed:[],failed:[]};
const manifest={version:2,system:"Dragonswood Narrator",model:jobs.model,speed:jobs.speed,voices:jobs.voices,clips:{}};
for(const clip of jobs.clips){const sources={},voiceHashes={};for(const row of planned.filter(x=>x.clip.id===clip.id)){const out=path.join(root,row.relative),old=oldManifest.clips?.[clip.id]?.voiceHashes?.[row.voiceId];sources[row.voiceId]=row.relative;voiceHashes[row.voiceId]=row.spokenHash;try{await fs.mkdir(path.dirname(out),{recursive:true});let exists=false;try{await fs.access(out);exists=true}catch{}if(exists&&!force&&old===row.spokenHash){report.skipped.push(`${clip.id}:${row.voiceId}`);continue}const temp=path.join(os.tmpdir(),`dw-narration-${process.pid}-${safe(clip.id)}-${row.voiceId}.wav`);const audio=await tts.generate(row.spokenText,{voice:row.voice.modelVoice,speed:Number(jobs.speed||0.9)});await audio.save(temp);await execFileAsync("ffmpeg",["-y","-loglevel","error","-i",temp,"-ac","1","-ar","24000","-codec:a","libmp3lame","-b:a","64k",out]);await fs.unlink(temp).catch(()=>{});(exists?report.changed:report.generated).push(`${clip.id}:${row.voiceId}`)}catch(error){report.failed.push({clip:`${clip.id}:${row.voiceId}`,error:String(error?.message||error)})}}
  manifest.clips[clip.id]={hash:hash(clip.text),contentType:clip.contentType||"general",defaultVoice:clip.contentType==="ela"?"us-liam":"gb-lewis",sources,voiceHashes,textVersion:clip.textVersion||1,fallback:clip.fallback!==false,lastGenerated:new Date().toISOString()};
}
report.finishedAt=new Date().toISOString();
await fs.writeFile(path.join(root,"narration-manifest.generated.json"),JSON.stringify(manifest,null,2));
await fs.writeFile(path.join(root,"narration-generation-report.json"),JSON.stringify(report,null,2));
console.log(JSON.stringify({generated:report.generated.length,changed:report.changed.length,skipped:report.skipped.length,failed:report.failed.length},null,2));
if(report.failed.length)process.exit(1);
