import {GAMES,BOARDS} from './game-registry.js';
import {initLeaderboard,submitBestScore,getTop} from './leaderboard-service.js';
import {getFirebaseContext} from './access-client.js';
const $=s=>document.querySelector(s);
const screens=[...document.querySelectorAll('.screen')];
const CONFIG=window.DRAGONSWOOD_ARCADE_CONFIG||{};
const TOP_N=Math.max(1,Math.min(25,Number(CONFIG.leaderboard?.topN)||5));
let currentGame=null,currentPeriod='daily';

function makeLocalId(){let id=localStorage.getItem('dragonswoodArcade.localId');if(!id){id=(crypto.randomUUID?.()||`local-${Date.now()}-${Math.random()}`).replace(/[^A-Za-z0-9_-]/g,'');localStorage.setItem('dragonswoodArcade.localId',id)}return id}
function getComfortMode(){const saved=localStorage.getItem('dragonswoodArcade.comfortMode');if(saved==='on')return true;if(saved==='off')return false;return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches}
function setComfortMode(on){localStorage.setItem('dragonswoodArcade.comfortMode',on?'on':'off');document.documentElement.classList.toggle('comfort-mode',!!on)}
function getPerformanceMode(){const v=(localStorage.getItem('dragonswoodArcade.performanceMode')||'auto').toLowerCase();return ['auto','standard','low'].includes(v)?v:'auto'}
function setPerformanceMode(mode){const v=['auto','standard','low'].includes(mode)?mode:'auto';localStorage.setItem('dragonswoodArcade.performanceMode',v);return v}
function getProfile(){return{displayName:'Adventurer',studentId:'',localId:makeLocalId(),comfortMode:getComfortMode(),performanceMode:getPerformanceMode()}}
let profile=getProfile();
function refreshProfile(){profile={...profile,comfortMode:getComfortMode(),performanceMode:getPerformanceMode()};$('#profileName').textContent=profile.displayName;$('#profileInput').value=profile.displayName==='Adventurer'?'':profile.displayName;const c=$('#comfortToggle');if(c)c.checked=profile.comfortMode;const p=$('#performanceMode');if(p)p.value=profile.performanceMode;document.documentElement.classList.toggle('comfort-mode',profile.comfortMode)}
function show(id){screens.forEach(s=>s.classList.toggle('visible',s.id===id))}
function toast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1800)}
function renderGames(){const grid=$('#gameGrid');grid.innerHTML='';for(const g of GAMES){const card=document.createElement('article');card.className=`game-card ${g.className||''}`;card.innerHTML=`<img class="game-card-art" src="${g.art}" alt=""><div class="game-card-content"><div class="game-kicker">${g.kicker}</div><h3>${g.title}</h3><h4>${g.subtitle}</h4><p>${g.description}</p><div class="card-tags">${g.tags.map(t=>`<span>${t}</span>`).join('')}</div><button class="play-game">ENTER PORTAL</button></div>`;card.querySelector('button').addEventListener('click',()=>openGame(g));grid.appendChild(card)}}
function openGame(g){currentGame=g;$('#gameTitle').textContent=g.title;$('#gameSubtitle').textContent=g.subtitle.toUpperCase();const u=new URL(g.path,location.href);u.searchParams.set('comfort',profile.comfortMode?'1':'0');u.searchParams.set('perf',profile.performanceMode);$('#gameFrame').src=u.href;$('#saveStatus').textContent='PLAYING';show('gameScreen')}
function exitGame(){const frame=$('#gameFrame');frame.src='about:blank';currentGame=null;show('homeScreen');$('#saveStatus').textContent='READY'}
async function renderLeaderboard(){const host=$('#leaderboardBoards');host.innerHTML=BOARDS.map(b=>`<section class="board" data-board="${b.id}"><h3>${b.title}</h3><div class="empty-board">Loading records…</div></section>`).join('');await Promise.all(BOARDS.map(async b=>{const el=host.querySelector(`[data-board="${b.id}"]`);try{const rows=await getTop(b.id,currentPeriod,TOP_N);el.innerHTML=`<h3>${b.title}</h3>`+(rows.length?rows.map((r,i)=>`<div class="leader-row"><div class="rank">${i+1}</div><div class="leader-name">${escapeHtml(r.displayName||'Adventurer')}</div><div class="leader-metric">${escapeHtml(r.metric||String(r.score))}</div></div>`).join(''):`<div class="empty-board">No scores yet. A brief period of peace.</div>`)}catch(err){console.warn(err);el.innerHTML=`<h3>${b.title}</h3><div class="empty-board">Leaderboard unavailable.</div>`}}))}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

window.addEventListener('message',async e=>{if(e.origin!==location.origin||e.source!==$('#gameFrame').contentWindow)return;const m=e.data;if(!m||m.channel!=='dragonswood-arcade')return;if(m.type==='ready'){try{$('#gameFrame').contentWindow.postMessage({channel:'dragonswood-arcade',type:'profile',profile:{displayName:profile.displayName,studentId:profile.studentId,comfortMode:profile.comfortMode,performanceMode:profile.performanceMode}},location.origin)}catch{}return}if(m.type==='score'){if(m.practice||m.custom)return;$('#saveStatus').textContent='SAVING';try{const result=await submitBestScore(m,profile);$('#saveStatus').textContent=result.updated?'BEST SAVED':'BEST KEPT';toast(result.updated?'Leaderboard best updated.':'Your existing best stays on the board.')}catch(err){console.warn(err);$('#saveStatus').textContent='SAVE ERROR';toast('Score could not be saved.')}}});

$('#leaderboardBtn').addEventListener('click',()=>{show('leaderboardScreen');renderLeaderboard()});document.querySelectorAll('[data-home]').forEach(b=>b.addEventListener('click',()=>show('homeScreen')));$('#homeBrand').addEventListener('click',()=>{if(currentGame)exitGame();else show('homeScreen')});$('#exitGameBtn').addEventListener('click',exitGame);$('#fullscreenBtn').addEventListener('click',()=>$('#gameFrame').requestFullscreen?.());document.querySelectorAll('[data-period]').forEach(b=>b.addEventListener('click',()=>{currentPeriod=b.dataset.period;document.querySelectorAll('[data-period]').forEach(x=>x.classList.toggle('active',x===b));renderLeaderboard()}));
$('#profileBtn').addEventListener('click',()=>{$('#profileInput').value=profile.displayName==='Adventurer'?'':profile.displayName;$('#comfortToggle').checked=profile.comfortMode;$('#performanceMode').value=profile.performanceMode;$('#profileDialog').showModal()});
$('#profileForm').addEventListener('submit',()=>{setComfortMode($('#comfortToggle').checked);setPerformanceMode($('#performanceMode').value);refreshProfile();toast('Arcade device settings updated.');});

async function startArcadeShell(){
  try{
    const C=await getFirebaseContext(),snap=await C.fsMod.getDoc(C.fsMod.doc(C.db,'students',C.user.uid)),student=snap.exists()?snap.data():{};
    profile={...profile,studentId:C.user.uid,localId:C.user.uid,displayName:String(student.firstName||C.user.displayName||'Adventurer').trim().slice(0,32)||'Adventurer'};
    $('#profileInput').disabled=true;
  }catch(err){console.warn('Shared Dragonswood profile unavailable:',err)}
  refreshProfile();renderGames();await initLeaderboard(text=>{$('#cloudBadge').textContent=text});
}
startArcadeShell().catch(console.warn);if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
