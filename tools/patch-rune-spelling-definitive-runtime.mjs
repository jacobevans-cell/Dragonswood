import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const files = ["rune-spelling.html", "rune-spelling-rebuild-preview.html"];

const shared = [
  [
    'word,syllables:String(record?.syllables||"").trim(),pronunciation:String(record?.pronunciation||"").trim(),speechNote:String(record?.speechNote||"").trim(),phonograms:String(record?.phonograms||record?.spellingUnits||"").trim(),',
    'word,syllables:String(record?.syllables||"").trim(),pronunciation:String(record?.pronunciation||"").trim(),speechNote:String(record?.speechNote||"").trim(),phonograms:String(record?.phonograms||record?.spellingUnits||"").trim(),phonogramChunks:Array.isArray(record?.phonogramChunks)?record.phonogramChunks.map(String).filter(Boolean):[],phonogramSounds:Array.isArray(record?.phonogramSounds)?record.phonogramSounds.map(String).filter(Boolean):[],soundAudio:Array.isArray(record?.soundAudio)?record.soundAudio.map(route=>({...route})):[],bridgeMode:String(record?.bridgeMode||""),difficulty:Number(record?.difficulty)||0,sourceWorkbook:String(record?.sourceWorkbook||""),sourceWorkbookRow:Number(record?.sourceWorkbookRow)||0,sourceWorkbookSha256:String(record?.sourceWorkbookSha256||""),'
  ],
  [
    'function levelLabel(key){return ({foundation:"Foundation",grade4:"4th Grade",grade5:"5th Grade",challenge:"Challenge",master:"Master"})[key]||"5th Grade"}',
    'function levelLabel(key){return ({foundation:"Foundation",grade4:"4th Grade",grade5:"5th Grade",challenge:"6th Grade",master:"Middle School"})[key]||"5th Grade"}'
  ],
  [
    'function soundBridgeIssues(word){const issues=[],pairs=Array.isArray(word?.sounds)?word.sounds:[];if(!pairs.length)issues.push("missing spelling-to-sound bridge");if(pairs.some(pair=>!Array.isArray(pair)||pair.length!==2||!String(pair[0]||"").trim()||!String(pair[1]||"").trim()))issues.push("malformed spelling-to-sound pair");const written=pairs.map(pair=>String(pair?.[0]||"")).join("");if(pairs.length&&normalizeLetters(written)!==normalizeLetters(word?.word))issues.push("bridge chunks do not reconstruct the spelling");if(pairs.length===1&&normalizeLetters(pairs[0][0])===normalizeLetters(word?.word)&&normalizeLetters(pairs[0][1])===normalizeLetters(word?.word))issues.push("unreviewed whole-word echo is not an instructional bridge");return issues}',
    'function soundBridgeIssues(word){const issues=[],pairs=Array.isArray(word?.sounds)?word.sounds:[],approvedWholeWord=word?.bridgeMode==="owner-approved-whole-word-phonetics-plus-spalding-breakdown";if(!pairs.length)issues.push("missing spelling-to-sound bridge");if(pairs.some(pair=>!Array.isArray(pair)||pair.length!==2||!String(pair[0]||"").trim()||!String(pair[1]||"").trim()))issues.push("malformed spelling-to-sound pair");const written=pairs.map(pair=>String(pair?.[0]||"")).join("");if(pairs.length&&normalizeLetters(written)!==normalizeLetters(word?.word))issues.push("bridge chunks do not reconstruct the spelling");if(approvedWholeWord&&pairs.length===1&&String(pairs[0][1]).trim()!==String(word?.pronunciation||"").trim())issues.push("whole-word phonetics do not match the approved pronunciation");if(!approvedWholeWord&&pairs.length===1&&normalizeLetters(pairs[0][0])===normalizeLetters(word?.word)&&normalizeLetters(pairs[0][1])===normalizeLetters(word?.word))issues.push("unreviewed whole-word echo is not an instructional bridge");return issues}'
  ],
  [
    'if(normalized.words.length<5||normalized.words.length>30)errors.push("The game supports 5–30 unique words per lesson.");if(normalized.words.length!==20)warnings.push(`This lesson has ${normalized.words.length} words; the default weekly target is 20.`);',
    'if(normalized.words.length<5||normalized.words.length>30)errors.push("The game supports 5–30 unique words per lesson.");'
  ],
  [
    'studyProgressLabel.textContent=`${studied.size} / ${needed} words studied and recalled`;studyProgressFill.style.width=`${needed?Math.min(100,studied.size/needed*100):0}%`;remainingCount.textContent=words.length;siegeWordTotal.textContent=words.length;',
    'studyProgressLabel.textContent=`${studied.size} / ${needed} words studied and recalled`;studyProgressFill.style.width=`${needed?Math.min(100,studied.size/needed*100):0}%`;remainingCount.textContent=words.length;siegeWordTotal.textContent=words.length;petMessage.textContent=`Your Rune Dragon is ready to help you master ${words.length} words.`;configureTestRunePath();'
  ],
  [
    'soundbox.innerHTML=w.sounds.map((s,index)=>`<button type="button" class="sound" onclick="event.stopPropagation(); speakChunk(${index})" aria-label="Hear spelling chunk ${escapeHtml(String(s[0]))}, spoken as ${escapeHtml(String(s[1]))}"><span class="chunk">${escapeHtml(String(s[0]))}</span><span class="said"><span aria-hidden="true">🔊</span> hear<br><b>“${escapeHtml(String(s[1]))}”</b></span></button>`).join("");',
    'soundbox.innerHTML=w.sounds.map((s,index)=>{const unavailable=["silent","no-isolated-spalding-clip"].includes(w.soundAudio?.[index]?.mode);return `<button type="button" class="sound" onclick="event.stopPropagation(); speakChunk(${index})" ${unavailable?"disabled":""} aria-label="${unavailable?"No isolated audio for":"Hear"} spelling chunk ${escapeHtml(String(s[0]))}, selected sound ${escapeHtml(String(s[1]))}"><span class="chunk">${escapeHtml(String(s[0]))}</span><span class="said"><span aria-hidden="true">${unavailable?"○":"🔊"}</span> ${unavailable?"labeled":"hear"}<br><b>“${escapeHtml(String(s[1]))}”</b></span></button>`}).join("");'
  ],
  [
    'soundbox.innerHTML=w.sounds.map((s,index)=>{const unavailable=["silent","no-isolated-spalding-clip"].includes(w.soundAudio?.[index]?.mode);return `<button type="button" class="sound" onclick="event.stopPropagation(); speakChunk(${index})" ${unavailable?"disabled":""} aria-label="${unavailable?"No isolated audio for":"Hear"} spelling chunk ${escapeHtml(String(s[0]))}, selected sound ${escapeHtml(String(s[1]))}"><span class="chunk">${escapeHtml(String(s[0]))}</span><span class="said"><span aria-hidden="true">${unavailable?"○":"🔊"}</span> ${unavailable?"labeled":"hear"}<br><b>“${escapeHtml(String(s[1]))}”</b></span></button>`}).join("");',
    'soundbox.innerHTML=w.sounds.map((s,index)=>{const mode=w.soundAudio?.[index]?.mode,unavailable=["silent","no-isolated-spalding-clip"].includes(mode),wholeWord=mode==="whole-word-exception";return `<button type="button" class="sound" onclick="event.stopPropagation(); speakChunk(${index})" ${unavailable?"disabled":""} aria-label="${unavailable?"No isolated audio for":wholeWord?"Hear this exception in the whole word":"Hear"} spelling chunk ${escapeHtml(String(s[0]))}, selected sound ${escapeHtml(String(s[1]))}"><span class="chunk">${escapeHtml(String(s[0]))}</span><span class="said"><span aria-hidden="true">${unavailable?"○":"🔊"}</span> ${unavailable?"labeled":wholeWord?"whole word":"hear"}<br><b>“${escapeHtml(String(s[1]))}”</b></span></button>`}).join("");'
  ],
  [
    'tuesday:{id:"tuesday-discover-2",label:"Tuesday • Discover II",summary:"Master words 11–20, then retrieve five Monday words.",steps:["Study words 11–20","Retrieve five Monday words"]},',
    'tuesday:{id:"tuesday-discover-2",label:"Tuesday • Discover II",summary:"Master the remaining weekly words, then retrieve five Monday words.",steps:["Study the remaining weekly words","Retrieve five Monday words"]},'
  ],
  [
    'thursday:{id:"thursday-mastery",label:"Thursday • Weekly Mastery",summary:"Submit all 20 unsupported first responses, lock the score, then correct missed words.",steps:["20-word first pass","Lock first score","Correct missed words"]}',
    'thursday:{id:"thursday-mastery",label:"Thursday • Weekly Mastery",summary:"Submit every unsupported first response, lock the score, then correct missed words.",steps:["Full weekly first pass","Lock first score","Correct missed words"]}'
  ],
  ['function tuesdayIds(){return words.slice(10,20).map(word=>word.contentId)}', 'function tuesdayIds(){return words.slice(10).map(word=>word.contentId)}'],
  [
    'const id=DAILY_MISSIONS.tuesday.id,record=missionRecord(id);if(!record.components?.study?.complete||!record.components?.carryover?.complete)return;markMissionComplete(id);reportCompletion("daily-mission",{missionId:id,schoolWeekId:missionSchoolWeekId(),scope:id,runId:record.runId,contentIds:[...tuesdayIds(),...record.carryoverIds],wordCount:15,',
    'const id=DAILY_MISSIONS.tuesday.id,record=missionRecord(id);if(!record.components?.study?.complete||!record.components?.carryover?.complete)return;const contentIds=[...tuesdayIds(),...record.carryoverIds];markMissionComplete(id);reportCompletion("daily-mission",{missionId:id,schoolWeekId:missionSchoolWeekId(),scope:id,runId:record.runId,contentIds,wordCount:contentIds.length,'
  ],
  ['contentIds:words.map(word=>word.contentId),wordCount:20,meaningEvidence:', 'contentIds:words.map(word=>word.contentId),wordCount:words.length,meaningEvidence:'],
  ['contentIds:state.order,wordCount:20,accuracy:', 'contentIds:state.order,wordCount:state.order.length,accuracy:'],
  ['window.DWWeeklySpelling={engineVersion:ENGINE_VERSION,curriculumRevision:"2026.08.29-full-30-week-release-v1"', 'window.DWWeeklySpelling={engineVersion:ENGINE_VERSION,curriculumRevision:"2026.08.31-owner-approved-definitive-v1"'],
  ['0 / 20 words studied', '0 / — words studied'],
  ['Your Rune Dragon is ready to help you master 20 words.', "Your Rune Dragon is ready to help you master this week's words."],
  ['I can spell 20 multisyllabic words and use syllables, pronunciation parts, and verified phonograms to study them.', "I can study and correctly spell this week's approved words."],
  ['Spell at least 16 of 20 words correctly on the first try, then correctly retype every missed word.', 'Meet the weekly first-try target, then correctly retype every missed word.'],
  ['Answers and coaching stay locked until all 20 first responses are stored.', 'Answers and coaching stay locked until all weekly first responses are stored.']
  ,['<option value="challenge">Challenge — Grade 6</option>', '<option value="challenge">6th Grade</option>']
  ,['<option value="master">Master — Grade 8</option>', '<option value="master">Middle School</option>']
];

const updateTestPathOld = `function updateTestRunePath(completedCount=testIndex){
  const completed=Math.max(0,Math.min(words.length,Number(completedCount)||0)),path=document.getElementById("testRunePath");
  path.querySelectorAll(".check-rune-stone").forEach((stone,index)=>stone.classList.toggle("lit",completed>=(index+1)*5));
  const milestones=Math.min(4,Math.floor(completed/5));path.setAttribute("aria-label",\`Independent check rune path: \${milestones} of 4 milestones lit\`);
}`;
const updateTestPathNew = `function testRuneMilestones(){return Array.from({length:4},(_,index)=>Math.max(1,Math.ceil(words.length*(index+1)/4)))}
function configureTestRunePath(){const path=document.getElementById("testRunePath");if(!path)return;path.innerHTML=testRuneMilestones().map(count=>\`<span class="check-rune-stone">\${count} word\${count===1?"":"s"}</span>\`).join("");updateTestRunePath(0)}
function updateTestRunePath(completedCount=testIndex){
  const completed=Math.max(0,Math.min(words.length,Number(completedCount)||0)),path=document.getElementById("testRunePath"),thresholds=testRuneMilestones();
  path.querySelectorAll(".check-rune-stone").forEach((stone,index)=>stone.classList.toggle("lit",completed>=thresholds[index]));
  const milestones=thresholds.filter(value=>completed>=value).length;path.setAttribute("aria-label",\`Independent check rune path: \${milestones} of 4 milestones lit\`);
}`;

function replaceRequired(text, oldValue, newValue, label) {
  if (text.includes(newValue)) return text;
  const count = text.split(oldValue).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one old match, found ${count}`);
  return text.replace(oldValue, newValue);
}

for (const name of files) {
  const file = path.join(root, name);
  let text = fs.readFileSync(file, "utf8");
  for (const [oldValue, newValue] of shared) text = replaceRequired(text, oldValue, newValue, `${name}: ${oldValue.slice(0, 70)}`);
  text = replaceRequired(text, updateTestPathOld, updateTestPathNew, `${name}: dynamic rune path`);
  const speakNeedle = name.includes("rebuild")
    ? 'if(!pair||pair.length<2)return;\n  const ipa=String(word?.soundBridgeIpa?.[index]?.[1]||"");'
    : 'if(!pair||pair.length<2)return;\n  speakText(String(pair[1]),0.68);';
  const speakReplacement = name.includes("rebuild")
    ? 'if(!pair||pair.length<2)return;\n  const route=word?.soundAudio?.[index];if(route?.mode==="silent")return;if(route?.mode==="whole-word-exception"){speakText(word.word,0.72);return}if(route?.mode==="clip"&&route.source){playRunePreviewAudio(route.source,"Approved Spalding phonogram audio could not play");return}\n  const ipa=String(word?.soundBridgeIpa?.[index]?.[1]||"");'
    : 'if(!pair||pair.length<2)return;\n  const route=word?.soundAudio?.[Number(soundIndex)];if(route?.mode==="silent")return;if(route?.mode==="whole-word-exception"){speakText(word.word,0.72);return}if(route?.mode==="clip"&&route.source){const audio=new Audio(route.source);audio.play().catch(error=>console.warn("Approved Spalding phonogram audio could not play",error));return}\n  speakText(String(pair[1]),0.68);';
  text = replaceRequired(text, speakNeedle, speakReplacement, `${name}: definitive whole-word speech`);
  fs.writeFileSync(file, text);
  console.log(`Patched ${name}`);
}
