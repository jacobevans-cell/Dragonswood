import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const root=new URL('../../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8'),hall=read('adventurer-hall.html');
test('Hall is a native inventory page with preserved balances and the separate current character chooser',()=>{
 for(const id of ['petsView','shopView','badgesView','backgrounds','realWorldPrizes'])assert.ok(hall.includes('id="'+id+'"'),id);
 assert.match(hall,/href="\.\/#character" target="_top"/);assert.doesNotMatch(hall,/http-equiv="refresh"|async function chooseV5Character|async function chooseClass/);
 assert.match(hall,/p\.ownedPets=\[\.\.\.\(p\.ownedPetIds\|\|\[\]\)\]/);
 assert.match(hall,/Hatching is paused/);assert.doesNotMatch(hall,/Eggs and boss rewards/);
});
test('owned earlier-class equipment stays visible without enabling obsolete appearance or class changes',()=>{
 const nodes=new Map(),$=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:''});return nodes.get(id)};
 const item=(id,classId,extra={})=>({id,classId,name:id,slot:'weapon',art:'item.png',level:1,cost:10,rarity:'common',...extra});
 const p={gold:5,rpgEquipped:{},rpgInventory:['earlier','appearance']};
 const ctx={p,$,esc:String,appearance:()=>({v5:true,name:'New hero',familyName:'Voidcore',learning:true}),currentClassId:()=> 'mage',level:()=>1,owned:id=>p.rpgInventory.includes(id),R:{classes:{mage:{name:'Mage',icon:'✦',color:'purple'}},items:[item('current','mage'),item('earlier','healer'),item('unowned-old','healer'),item('appearance','mage',{appearance:true})],v5Markup:()=>'<canvas aria-label="New hero"></canvas>'},document:{querySelectorAll:()=>[]}};
 const fn=hall.slice(hall.indexOf('function renderShop('),hall.indexOf('\nconst BACKGROUNDS'));
 vm.runInNewContext(fn+';renderShop()',ctx);
 const result=$('shop').innerHTML;assert.match(result,/earlier/);assert.match(result,/appearance/);assert.doesNotMatch(result,/unowned-old/);assert.equal((result.match(/SAVED COLLECTIBLE/g)||[]).length,2);assert.match($('shopIntro').innerHTML,/<canvas/);
});
test('native Hall route is not redirected back to the learning chooser',()=>{
 assert.doesNotMatch(read('v33-integration/js/dragon-path-host.js'),/value==='hall'/);
 assert.match(read('v33-integration/js/student-app.js'),/else if\(state.page==='hall'\)mountModule\('adventurer-hall'\)/);
});
