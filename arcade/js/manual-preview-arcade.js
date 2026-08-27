import {GAMES,BOARDS} from './game-registry.js';

const $=s=>document.querySelector(s),screens=[...document.querySelectorAll('.screen')];
const STORE_KEY='dw-v33-manual-preview:leaderboard-v1';
let currentGame=null,currentPeriod='daily';
const profile={displayName:'Jacob Preview',studentId:'manual-student',localId:'manual-student',comfortMode:localStorage.getItem('dragonswoodArcade.comfortMode')==='on',performanceMode:localStorage.getItem('dragonswoodArcade.performanceMode')||'auto'};

function show(id){screens.forEach(s=>s.classList.toggle('visible',s.id===id))}
function toast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1800)}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function readScores(){try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{}')}catch{return {}}}
function writeScores(value){localStorage.setItem(STORE_KEY,JSON.stringify(value))}
function dateKey(date=new Date()){const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Phoenix',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));return `${parts.year}-${parts.month}-${parts.day}`}
function periodKey(type){if(type==='allTime')return'all';const key=dateKey();if(type==='daily')return key;const d=new Date(`${key}T12:00:00Z`),back=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-back);return d.toISOString().slice(0,10)}
function submitBestScore(event){
  const boardId=String(event.boardId||event.gameId||'').trim(),score=Math.max(0,Math.floor(Number(event.score)||0));if(!boardId)return{updated:false};
  const data=readScores();let updated=false;
  for(const type of ['daily','weekly','allTime']){const key=periodKey(type),id=`${profile.localId}__${type}__${key}__${boardId}`,prior=Number(data[id]?.score??-1);if(score<=prior)continue;data[id]={uid:profile.localId,displayName:profile.displayName,boardId,periodType:type,periodKey:key,score,metric:String(event.metric??score)};updated=true}
  writeScores(data);return{updated};
}
function getTop(boardId,type){const key=periodKey(type);return Object.values(readScores()).filter(row=>row.boardId===boardId&&row.periodType===type&&row.periodKey===key).sort((a,b)=>b.score-a.score).slice(0,5)}
function previewPath(game){return game.id==='dragon-dash'?'games/dragon-dash/manual-preview.html?arcade=1':'games/void-runner/manual-preview.html?arcade=1&dw-manual-preview=1'}
function renderGames(){
  const grid=$('#gameGrid');grid.innerHTML='';
  for(const game of GAMES){const card=document.createElement('article');card.className=`game-card ${game.className||''}`;card.innerHTML=`<img class="game-card-art" src="${game.art}" alt=""><div class="game-card-content"><div class="game-kicker">${game.kicker}</div><h3>${game.title}</h3><h4>${game.subtitle}</h4><p>${game.description}</p><div class="card-tags">${game.tags.map(tag=>`<span>${tag}</span>`).join('')}</div><button class="play-game">ENTER PORTAL</button></div>`;card.querySelector('button').addEventListener('click',()=>openGame(game));grid.appendChild(card)}
}
function openGame(game){currentGame=game;$('#gameTitle').textContent=game.title;$('#gameSubtitle').textContent=game.subtitle.toUpperCase();const url=new URL(previewPath(game),location.href);url.searchParams.set('comfort',profile.comfortMode?'1':'0');url.searchParams.set('perf',profile.performanceMode);$('#gameFrame').src=url.href;$('#saveStatus').textContent='PLAYING';show('gameScreen')}
function exitGame(){const frame=$('#gameFrame');frame.src='about:blank';currentGame=null;show('homeScreen');$('#saveStatus').textContent='READY'}
function renderLeaderboard(){
  const host=$('#leaderboardBoards');host.innerHTML=BOARDS.map(board=>{const rows=getTop(board.id,currentPeriod);return `<section class="board" data-board="${board.id}"><h3>${board.title}</h3>${rows.length?rows.map((row,i)=>`<div class="leader-row"><div class="rank">${i+1}</div><div class="leader-name">${escapeHtml(row.displayName)}</div><div class="leader-metric">${escapeHtml(row.metric)}</div></div>`).join(''):'<div class="empty-board">No local preview scores yet.</div>'}</section>`}).join('');
}
function refreshProfile(){
  profile.comfortMode=localStorage.getItem('dragonswoodArcade.comfortMode')==='on';profile.performanceMode=localStorage.getItem('dragonswoodArcade.performanceMode')||'auto';
  $('#profileName').textContent=profile.displayName;$('#profileInput').value=profile.displayName;$('#profileInput').disabled=true;$('#comfortToggle').checked=profile.comfortMode;$('#performanceMode').value=profile.performanceMode;document.documentElement.classList.toggle('comfort-mode',profile.comfortMode);
}

window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==$('#gameFrame').contentWindow)return;const message=event.data;if(!message||message.channel!=='dragonswood-arcade')return;if(message.type==='ready'){event.source.postMessage({channel:'dragonswood-arcade',type:'profile',profile},location.origin);return}if(message.type==='score'){if(message.practice||message.custom)return;const result=submitBestScore(message);$('#saveStatus').textContent=result.updated?'LOCAL BEST SAVED':'BEST KEPT';toast(result.updated?'Local preview best updated.':'Your local preview best stays on the board.')}});
$('#leaderboardBtn').addEventListener('click',()=>{show('leaderboardScreen');renderLeaderboard()});document.querySelectorAll('[data-home]').forEach(button=>button.addEventListener('click',()=>show('homeScreen')));$('#homeBrand').addEventListener('click',()=>currentGame?exitGame():show('homeScreen'));$('#exitGameBtn').addEventListener('click',exitGame);$('#fullscreenBtn').addEventListener('click',()=>$('#gameFrame').requestFullscreen?.());document.querySelectorAll('[data-period]').forEach(button=>button.addEventListener('click',()=>{currentPeriod=button.dataset.period;document.querySelectorAll('[data-period]').forEach(item=>item.classList.toggle('active',item===button));renderLeaderboard()}));
$('#profileBtn').addEventListener('click',()=>{$('#profileInput').value=profile.displayName;$('#comfortToggle').checked=profile.comfortMode;$('#performanceMode').value=profile.performanceMode;$('#profileDialog').showModal()});
$('#profileForm').addEventListener('submit',()=>{localStorage.setItem('dragonswoodArcade.comfortMode',$('#comfortToggle').checked?'on':'off');localStorage.setItem('dragonswoodArcade.performanceMode',$('#performanceMode').value);refreshProfile();toast('Local preview settings updated.')});
$('#cloudBadge').textContent='LOCAL PREVIEW';refreshProfile();renderGames();
