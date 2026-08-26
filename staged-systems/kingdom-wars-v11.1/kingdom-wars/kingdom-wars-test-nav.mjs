import {getKingdomTesterSession} from './kingdom-wars-test-access.mjs';

(async()=>{
  const session=await getKingdomTesterSession({silent:true});
  if(!session.allowed)return;
  if(document.getElementById('dwKingdomWarsTesterLink'))return;

  const a=document.createElement('a');
  a.id='dwKingdomWarsTesterLink';
  a.href='kingdom-test.html';
  a.innerHTML='<span style="font-size:18px">🏰</span><span><b>KINGDOM WARS</b><small>HIDDEN TEST</small></span>';
  a.title='Open the hidden Kingdom Wars tester realm';
  Object.assign(a.style,{
    position:'fixed',left:'7px',bottom:'18px',zIndex:'9998',
    width:'136px',minHeight:'48px',display:'flex',gap:'7px',alignItems:'center',
    padding:'8px 9px',boxSizing:'border-box',border:'1px solid #ffd766',
    borderRadius:'10px',background:'linear-gradient(90deg,#5620a7,#087fa8)',
    color:'#fff',textDecoration:'none',font:'11px Arial',boxShadow:'0 8px 24px #0009'
  });
  a.querySelector('small').style.cssText='display:block;margin-top:2px;color:#ffe08a;font-size:9px;letter-spacing:.6px';
  document.body.appendChild(a);
})();
