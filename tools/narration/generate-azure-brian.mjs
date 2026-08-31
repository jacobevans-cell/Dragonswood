import {createHash} from "node:crypto";
import {readFile,writeFile,mkdir,rename,rm,stat} from "node:fs/promises";
import {dirname,resolve,relative,sep} from "node:path";
import {fileURLToPath} from "node:url";

const toolDir=dirname(fileURLToPath(import.meta.url));
const root=resolve(toolDir,"..","..");
const args=new Set(process.argv.slice(2));
const shouldGenerate=args.has("--generate");
const force=args.has("--force");
const config=await readJson(resolve(root,"narration-config.json"));
const jobs=await readJson(resolve(root,"narration-jobs.json"));
const library=await readJson(resolve(root,"library-books.json"));
const previous=await readJson(resolve(root,"narration-manifest.generated.json"),{version:3,clips:{}});
const VOICE_ID=config.voiceId,VOICE_NAME=config.voiceName;
const ALLOWED_LOCALES=new Set(["en-US","en-GB","en-IE","en-AU","es-ES"]);

function normalize(text){return String(text||"").trim().replace(/\s+/g," ")}
function runtimeHash(text){let value=2166136261;for(const character of normalize(text)){value^=character.charCodeAt(0);value=Math.imul(value,16777619)}return(value>>>0).toString(16).padStart(8,"0")}
function sha256(data){return createHash("sha256").update(data).digest("hex")}
function escapeXml(value){return String(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}
function sleep(milliseconds){return new Promise(resolvePromise=>setTimeout(resolvePromise,milliseconds))}
function safeSegment(value,label){const result=String(value||"").toLowerCase();if(!/^[a-z0-9][a-z0-9-]*$/.test(result))throw new Error(`${label} must use lowercase letters, numbers, and hyphens: ${value}`);return result}
function withinRoot(path){const rel=relative(root,path);return rel!==""&&!rel.startsWith(`..${sep}`)&&rel!==".."}
function localeOf(value){const locale=String(value||config.defaultLocale);if(!ALLOWED_LOCALES.has(locale))throw new Error(`Unsupported narration locale: ${locale}`);return locale}
function sourcePath(value){const path=resolve(root,String(value||""));if(!withinRoot(path))throw new Error(`Book source must stay inside the repository: ${value}`);return path}

async function readJson(path,fallback){
  try{return JSON.parse(await readFile(path,"utf8"))}
  catch(error){if(fallback!==undefined&&error.code==="ENOENT")return fallback;throw error}
}
function extractAssignedJsonArray(source,name){
  const marker=`const ${name}=`,markerIndex=source.indexOf(marker);
  if(markerIndex<0)throw new Error(`Could not find ${marker} in the reader file.`);
  const start=source.indexOf("[",markerIndex+marker.length);
  if(start<0)throw new Error(`Could not find the ${name} array.`);
  let depth=0,inString=false,escaped=false;
  for(let index=start;index<source.length;index++){
    const character=source[index];
    if(inString){if(escaped)escaped=false;else if(character==="\\")escaped=true;else if(character==='"')inString=false;continue}
    if(character==='"'){inString=true;continue}
    if(character==="[")depth++;
    if(character==="]"&&--depth===0)return JSON.parse(source.slice(start,index+1));
  }
  throw new Error(`The ${name} array is incomplete.`);
}

function jobClip(job){
  const area=safeSegment(job.area,"area"),lessonId=safeSegment(job.lessonId,"lessonId"),sectionId=safeSegment(job.sectionId,"sectionId");
  const source=`assets/audio/narration/${area}/${lessonId}/${sectionId}--${VOICE_ID}.mp3`;
  return {id:String(job.id||""),text:normalize(job.text),locale:localeOf(job.locale),contentType:String(job.contentType||"general"),textVersion:Number(job.textVersion)||1,fallback:job.fallback!==false,source,output:resolve(root,...source.split("/")),origin:"narration-jobs.json"};
}
async function bookClips(book){
  if(book.enabled===false)return [];
  const bookId=safeSegment(book.id,"book id"),format=String(book.sourceFormat||"json-pages"),path=sourcePath(book.source),locale=localeOf(book.locale);
  let pages;
  if(format==="dragonswood-page-text")pages=extractAssignedJsonArray(await readFile(path,"utf8"),"PAGE_TEXT").map((text,index)=>({page:index+1,text}));
  else if(format==="json-pages"){
    const source=await readJson(path);
    pages=Array.isArray(source.pages)?source.pages:[];
  }else throw new Error(`Unsupported sourceFormat for ${bookId}: ${format}`);
  if(!pages.length)throw new Error(`Book ${bookId} contains no pages.`);
  const seen=new Set(),clipPrefix=String(book.clipIdPrefix||`library/${bookId}/page-`);
  return pages.map((page,index)=>{
    const pageNumber=Number(page.page??index+1);
    if(!Number.isInteger(pageNumber)||pageNumber<1||seen.has(pageNumber))throw new Error(`Book ${bookId} has an invalid or repeated page number: ${pageNumber}`);
    seen.add(pageNumber);
    const filePage=String(pageNumber).padStart(3,"0"),source=`assets/audio/library/${bookId}/${VOICE_ID}/page-${filePage}.mp3`;
    return {id:`${clipPrefix}${pageNumber}`,text:normalize(page.text),locale,contentType:"book",textVersion:Number(page.textVersion)||1,fallback:true,source,output:resolve(root,...source.split("/")),origin:`${book.source} page ${pageNumber}`};
  });
}

const planned=[];
for(const job of jobs.clips||[])planned.push(jobClip(job));
for(const book of library.books||[])planned.push(...await bookClips(book));
const ids=new Set();
for(const clip of planned){
  if(!clip.id||ids.has(clip.id))throw new Error(`Narration clip IDs must be unique: ${clip.id}`);
  ids.add(clip.id);
  if(!clip.text)throw new Error(`Narration clip has no text: ${clip.id}`);
  if(clip.text.length>Number(config.maxCharactersPerClip||6000))throw new Error(`${clip.id} has ${clip.text.length} characters; split it below ${config.maxCharactersPerClip} characters.`);
  if(!withinRoot(clip.output))throw new Error(`Narration output escaped the repository: ${clip.output}`);
  clip.hash=runtimeHash(clip.text);
}

async function exists(path){try{return(await stat(path)).isFile()}catch{return false}}
const pending=[];
for(const clip of planned){
  const old=previous.clips?.[clip.id],oldSource=String(old?.sources?.[VOICE_ID]||"").split("?")[0];
  const unchanged=!force&&old?.voiceHashes?.[VOICE_ID]===clip.hash&&old?.locale===clip.locale&&oldSource===clip.source&&await exists(clip.output);
  clip.status=unchanged?"reused":"pending";
  if(!unchanged)pending.push(clip);
}
const characterCount=planned.reduce((sum,clip)=>sum+clip.text.length,0);
console.log(`Brian plan: ${planned.length} clips, ${characterCount.toLocaleString()} characters, ${pending.length} to generate, ${planned.length-pending.length} reusable.`);
if(!shouldGenerate){
  console.log("Plan only. Run npm run narration:generate (or START-BRIAN-NARRATION-GENERATOR.cmd) to create the MP3 files.");
  process.exit(0);
}

const key=String(process.env.AZURE_SPEECH_KEY||"").trim(),region=String(process.env.AZURE_SPEECH_REGION||"").trim().toLowerCase();
if(pending.length&&(!key||!region))throw new Error("AZURE_SPEECH_KEY and AZURE_SPEECH_REGION are required. The key is read only from this process environment.");
if(region&&!/^[a-z0-9-]+$/.test(region))throw new Error("AZURE_SPEECH_REGION contains invalid characters.");

async function azureRequest(url,options,label){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),60000);
  try{
    const response=await fetch(url,{...options,signal:controller.signal});
    if(response.ok)return response;
    const detail=(await response.text()).slice(0,500);
    const error=new Error(`${label} failed (${response.status}): ${detail||response.statusText}`);error.status=response.status;error.retryAfter=response.headers.get("retry-after");throw error;
  }finally{clearTimeout(timer)}
}
async function verifyVoice(){
  const response=await azureRequest(`https://${region}.tts.speech.microsoft.com/cognitiveservices/voices/list`,{headers:{"Ocp-Apim-Subscription-Key":key}},"Azure voice check");
  const voices=await response.json();
  if(!voices.some(voice=>voice.ShortName===VOICE_NAME))throw new Error(`${VOICE_NAME} is not available from the configured Azure Speech resource in ${region}.`);
}
let lastSynthesisAt=0;
async function synthesize(clip){
  const interval=Number(config.freeTierMinIntervalMs)||3250,elapsed=Date.now()-lastSynthesisAt;
  if(elapsed<interval)await sleep(interval-elapsed);
  const ssml=`<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${escapeXml(VOICE_NAME)}"><lang xml:lang="${escapeXml(clip.locale)}"><prosody rate="${escapeXml(config.prosodyRate)}">${escapeXml(clip.text)}</prosody></lang></voice></speak>`;
  let lastError;
  for(let attempt=1;attempt<=4;attempt++){
    try{
      lastSynthesisAt=Date.now();
      const response=await azureRequest(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,{method:"POST",headers:{"Ocp-Apim-Subscription-Key":key,"Content-Type":"application/ssml+xml","X-Microsoft-OutputFormat":config.outputFormat,"User-Agent":"Dragonswood-Brian-Generator/1.0"},body:ssml},`Azure synthesis for ${clip.id}`);
      return Buffer.from(await response.arrayBuffer());
    }catch(error){
      lastError=error;
      if(error.status!==429&&error.status<500)break;
      const retrySeconds=Math.max(Number(error.retryAfter)||0,Math.pow(2,attempt));
      if(attempt<4)await sleep(Math.min(30000,retrySeconds*1000));
    }
  }
  throw lastError;
}
async function atomicWrite(path,data){
  await mkdir(dirname(path),{recursive:true});
  const temporary=`${path}.part`;
  await writeFile(temporary,data);
  try{await rename(temporary,path)}catch(error){if(error.code!=="EEXIST"&&error.code!=="EPERM")throw error;await rm(path,{force:true});await rename(temporary,path)}
}
async function writeJson(path,value){await atomicWrite(path,`${JSON.stringify(value,null,2)}\n`)}

const report={version:1,voiceId:VOICE_ID,voiceName:VOICE_NAME,region:region||null,startedAt:new Date().toISOString(),planned:planned.length,characters:characterCount,reused:planned.length-pending.length,generated:0,failed:[]};
if(pending.length)await verifyVoice();
for(let index=0;index<pending.length;index++){
  const clip=pending[index];
  try{
    console.log(`[${index+1}/${pending.length}] ${clip.id} (${clip.text.length} characters)`);
    const bytes=await synthesize(clip);
    if(bytes.length<500)throw new Error(`Azure returned an unexpectedly small audio file (${bytes.length} bytes).`);
    await atomicWrite(clip.output,bytes);
    clip.audioSha256=sha256(bytes);clip.status="generated";report.generated++;
  }catch(error){report.failed.push({id:clip.id,message:String(error?.message||error).slice(0,700)});console.error(`FAILED ${clip.id}: ${error?.message||error}`)}
}
report.finishedAt=new Date().toISOString();
await writeJson(resolve(root,"narration-generation-report.json"),report);
if(report.failed.length)throw new Error(`${report.failed.length} Brian clip(s) failed. The existing site manifest was left unchanged.`);

const manifest={version:3,system:"Dragonswood Brian Narrator",generatedAt:report.finishedAt,provider:"azure-speech",outputFormat:config.outputFormat,voices:{[VOICE_ID]:{label:"Brian • Multilingual Neural",modelVoice:VOICE_NAME,lang:config.defaultLocale,speed:0.92}},clips:{}};
for(const clip of planned){
  const old=previous.clips?.[clip.id];
  const versionedSource=`${clip.source}?h=${clip.hash}`;
  manifest.clips[clip.id]={hash:clip.hash,defaultVoice:VOICE_ID,contentType:clip.contentType,locale:clip.locale,sources:{[VOICE_ID]:versionedSource},voiceHashes:{[VOICE_ID]:clip.hash},voiceVersion:1,textVersion:clip.textVersion,fallback:clip.fallback,audioSha256:clip.audioSha256||old?.audioSha256||null};
}
await writeJson(resolve(root,"narration-manifest.generated.json"),manifest);
await atomicWrite(resolve(root,"narration-manifest.js"),`/* Generated by tools/narration/generate-azure-brian.mjs. */\nwindow.DRAGONSWOOD_NARRATION_MANIFEST = Object.freeze(${JSON.stringify(manifest,null,2)});\n`);
console.log(`Brian narration complete: ${report.generated} generated, ${report.reused} reused, ${planned.length} total.`);
