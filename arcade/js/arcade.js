import {GAMES,BOARDS} from './game-registry.js?v=58.0.3';
import {initLeaderboard,submitBestScore,getTop} from './leaderboard-service.js?v=57.1.16';
import {getFirebaseContext,recordArcadeGameResult} from './access-client.js?v=58.0.2';
const $=selector=>document.querySelector(selector);
const screens=[...document.querySelectorAll('.screen')];
const CONFIG=window.DRAGONSWOOD_ARCADE_CONFIG||{};
const TOP_N=Math.max(1,Math.min(25,Number(CONFIG.leaderboard?.topN)||5));
let currentGame=null;
let currentPeriod='daily';

function makeLocalId(){
  let id=localStorage.getItem('dragonswoodArcade.localId');
  if(!id){id=(crypto.randomUUID?.()||`local-${Date.now()}-${Math.random()}`).replace(/[^A-Za-z0-9_-]/g,'');localStorage.setItem('dragonswoodArcade.localId',id)}
  return id;
}
function getComfortMode(){const saved=localStorage.getItem('dragonswoodArcade.comfortMode');if(saved==='on')return true;if(saved==='off')return false;return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches}
function setComfortMode(on){localStorage.setItem('dragonswoodArcade.comfortMode',on?'on':'off');document.documentElement.classList.toggle('comfort-mode',!!on)}
function getPerformanceMode(){const value=(localStorage.getItem('dragonswoodArcade.performanceMode')||'auto').toLowerCase();return ['auto','standard','low'].includes(value)?value:'auto'}
function setPerformanceMode(mode){const value=['auto','standard','low'].includes(mode)?mode:'auto';localStorage.setItem('dragonswoodArcade.performanceMode',value);return value}
function getProfile(){return {displayName:'Adventurer',studentId:'',localId:makeLocalId(),comfortMode:getComfortMode(),performanceMode:getPerformanceMode()}}
let profile=getProfile();
function refreshProfile(){
  profile={...profile,comfortMode:getComfortMode(),performanceMode:getPerformanceMode()};
  $('#profileName').textContent=profile.displayName;
  $('#profileInput').value=profile.displayName==='Adventurer'?'':profile.displayName;
  const comfort=$('#comfortToggle');if(comfort)comfort.checked=profile.comfortMode;
  const performance=$('#performanceMode');if(performance)performance.value=profile.performanceMode;
  document.documentElement.classList.toggle('comfort-mode',profile.comfortMode);
}
function show(id){screens.forEach(screen=>screen.classList.toggle('visible',screen.id===id))}
function toast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),1800)}
function renderGames(){
  const grid=$('#gameGrid');grid.innerHTML='';
  for(const game of GAMES){
    const card=document.createElement('article');card.className=`game-card has-veil-tile ${game.className||''}`;
    card.innerHTML=`<img class="game-card-art" src="${game.art}" alt="" loading="lazy" decoding="async"><div class="game-card-content"><div class="game-kicker">${game.kicker}</div><h3>${game.title}</h3><h4>${game.subtitle}</h4><p>${game.description}</p><div class="card-tags">${game.tags.map(tag=>`<span>${tag}</span>`).join('')}</div><button class="play-game">${game.button}</button></div>`;
    card.querySelector('button').addEventListener('click',()=>openGame(game));grid.appendChild(card);
  }
}
function openGame(game){currentGame=game;$('#gameTitle').textContent=game.title;$('#gameSubtitle').textContent=game.subtitle.toUpperCase();const url=new URL(game.path,location.href);url.searchParams.set('comfort',profile.comfortMode?'1':'0');url.searchParams.set('perf',profile.performanceMode);$('#gameFrame').src=url.href;$('#saveStatus').textContent='PLAYING';show('gameScreen')}
function exitGame(){const frame=$('#gameFrame');frame.src='about:blank';currentGame=null;show('homeScreen');$('#saveStatus').textContent='READY'}
async function renderLeaderboard(){
  const host=$('#leaderboardBoards'),skeleton=window.DWImmersiveUI?.skeletonMarkup('leaderboard')||'<div class="empty-board">Consulting the Hall of Records…</div>';host.innerHTML=BOARDS.map(board=>`<section class="board" data-board="${board.id}"><h3>${board.title}</h3>${skeleton}</section>`).join('');
  await Promise.all(BOARDS.map(async board=>{
    const el=host.querySelector(`[data-board="${board.id}"]`);
    try{const rows=await getTop(board.id,currentPeriod,TOP_N);el.innerHTML=`<h3>${board.title}</h3>`+(rows.length?rows.map((row,index)=>`<div class="leader-row"><div class="rank">${index+1}</div><div class="leader-name">${escapeHtml(row.displayName||'Adventurer')}</div><div class="leader-metric">${escapeHtml(row.metric||String(row.score))}</div></div>`).join(''):'<div class="empty-board">No scores yet. A brief period of peace.</div>')}
    catch(err){console.warn(err);el.innerHTML=`<h3>${board.title}</h3><div class="empty-board"><strong>The Hall of Records cannot be reached.</strong><br>You can still play; this score will stay on this device.</div>`}
  }));
}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}

window.addEventListener('message',async event=>{
  if(event.origin!==location.origin||event.source!==$('#gameFrame').contentWindow)return;
  const message=event.data;
  if(message?.type==='dragonswood:arcade-result'){
    $('#saveStatus').textContent='RECORDING';
    try{await recordArcadeGameResult(message.payload);$('#saveStatus').textContent='RESULT SAVED';toast('Arcade result recorded.')}
    catch(err){console.warn(err);$('#saveStatus').textContent='SAVE ERROR';toast('Arcade result could not be recorded.')}
    return;
  }
  if(!message||message.channel!=='dragonswood-arcade')return;
  if(message.type==='ready'){
    try{$('#gameFrame').contentWindow.postMessage({channel:'dragonswood-arcade',type:'profile',profile:{displayName:profile.displayName,studentId:profile.studentId,comfortMode:profile.comfortMode,performanceMode:profile.performanceMode}},location.origin)}catch{}
    return;
  }
  if(message.type==='score'){
    if(message.practice||message.custom)return;
    $('#saveStatus').textContent='RECORDING SCORE…';
    try{const result=await submitBestScore(message,profile);$('#saveStatus').textContent=result.updated?'BEST SAVED':'BEST KEPT';toast(result.updated?'Leaderboard best updated.':'Your existing best stays on the board.')}
    catch(err){console.warn(err);$('#saveStatus').textContent='SAVE ERROR';toast('Score could not be saved.')}
  }
});

$('#leaderboardBtn').addEventListener('click',()=>{show('leaderboardScreen');renderLeaderboard()});
document.querySelectorAll('[data-home]').forEach(button=>button.addEventListener('click',()=>show('homeScreen')));
$('#homeBrand').addEventListener('click',()=>{if(currentGame)exitGame();else show('homeScreen')});
$('#exitGameBtn').addEventListener('click',exitGame);
$('#fullscreenBtn').addEventListener('click',()=>$('#gameFrame').requestFullscreen?.());
document.querySelectorAll('[data-period]').forEach(button=>button.addEventListener('click',()=>{currentPeriod=button.dataset.period;document.querySelectorAll('[data-period]').forEach(item=>item.classList.toggle('active',item===button));renderLeaderboard()}));
$('#profileBtn').addEventListener('click',()=>{$('#profileInput').value=profile.displayName==='Adventurer'?'':profile.displayName;$('#comfortToggle').checked=profile.comfortMode;$('#performanceMode').value=profile.performanceMode;$('#profileDialog').showModal()});
$('#profileForm').addEventListener('submit',()=>{setComfortMode($('#comfortToggle').checked);setPerformanceMode($('#performanceMode').value);refreshProfile();toast('Arcade device settings updated.')});

async function startArcadeShell(){
  try{
    const context=await getFirebaseContext();
    const snap=await context.fsMod.getDoc(context.fsMod.doc(context.db,'students',context.user.uid));
    const student=snap.exists()?snap.data():{};
    profile={...profile,studentId:context.user.uid,localId:context.user.uid,displayName:String(student.firstName||context.user.displayName||'Adventurer').trim().slice(0,32)||'Adventurer'};
    $('#profileInput').disabled=true;
  }catch(err){console.warn('Shared Dragonswood profile unavailable:',err)}
  refreshProfile();
  renderGames();
  await initLeaderboard(text=>{$('#cloudBadge').textContent=text});
}
startArcadeShell().catch(console.warn);
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js?v=58.0.3').catch(()=>{});
