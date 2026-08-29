const REQUIRED_CONTROL_LABELS=Object.freeze([
  'Unlock Everything for Me',
  'Unlock Morning Work',
  'Unlock Curriculum Quest',
  'Unlock Arcade',
  'Unlock Kingdom Wars',
  'Relock Everything for Me',
  '+10',
  '+50',
  '+100',
  'Award Custom Amount'
]);

const wait=(predicate,message,timeout=15000)=>new Promise((resolve,reject)=>{
  const started=Date.now();
  const tick=()=>{
    let value=false;
    try{value=predicate()}catch{}
    if(value)return resolve(value);
    if(Date.now()-started>=timeout)return reject(new Error(message));
    setTimeout(tick,100);
  };
  tick();
});

function button(label){
  return [...document.querySelectorAll('button')].find(node=>node.textContent.trim()===label)||null;
}

export async function assertTesterPortal(expectedLabel){
  await wait(()=>document.querySelector('[data-true-tester-badge]'),'TRUE TESTER badge did not render.');
  const opener=document.querySelector('[data-tester-controls]');
  if(!opener)throw new Error('Tester Controls button did not render.');
  opener.click();
  await wait(()=>document.querySelector('[data-dialog-true-tester]'),'Tester Controls dialog did not open.');
  const text=document.querySelector('#dialog-root')?.textContent||'';
  if(expectedLabel&&!text.includes(expectedLabel))throw new Error(`Expected tester label ${expectedLabel}.`);
  for(const label of REQUIRED_CONTROL_LABELS)if(!text.includes(label))throw new Error(`Missing Tester Controls action: ${label}`);
  if(document.querySelector('#dialog-root [name="uid"],#dialog-root [name="studentId"],#dialog-root [data-target-uid]'))throw new Error('Tester Controls exposed a target UID field.');
  return {badge:document.querySelector('[data-true-tester-badge]').textContent.trim(),labels:[...REQUIRED_CONTROL_LABELS]};
}

export async function unlockEverything(){
  if(!document.querySelector('[data-dialog-true-tester]'))document.querySelector('[data-tester-controls]')?.click();
  await wait(()=>button('Unlock Everything for Me'),'Unlock Everything for Me did not render.');
  button('Unlock Everything for Me').click();
  await wait(()=>{
    const rows=[...document.querySelectorAll('[data-tester-status]')];
    return rows.length===4&&rows.every(row=>row.textContent.includes('UNLOCKED'));
  },'All four tester unlock statuses did not become UNLOCKED.');
  return [...document.querySelectorAll('[data-tester-status]')].map(row=>row.textContent.trim());
}

export async function awardPreset(currency='xp',amount=10){
  if(!document.querySelector('[data-dialog-true-tester]'))document.querySelector('[data-tester-controls]')?.click();
  await wait(()=>document.querySelector('[data-tester-currency]'),'Tester self-points controls did not render.');
  const select=document.querySelector('[data-tester-currency]');select.value=currency;select.dispatchEvent(new Event('change',{bubbles:true}));
  const award=document.querySelector(`[data-tester-points="${Number(amount)}"]`);
  if(!award)throw new Error(`Preset +${amount} is unavailable.`);
  award.click();
  await wait(()=>document.querySelector('#toast')?.textContent.includes('Tester self-award saved'),'Tester self-award confirmation did not appear.');
  return document.querySelector('#toast').textContent.trim();
}

export async function assertNormalPortal(){
  await wait(()=>document.querySelector('.student-shell'),'Student portal did not render.');
  if(document.querySelector('[data-true-tester-badge],[data-tester-controls]'))throw new Error('A normal student can see Tester Controls.');
  return {testerControlsVisible:false};
}
