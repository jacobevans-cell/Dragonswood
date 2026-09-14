import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../../learning-portal/public/',import.meta.url);
const read=name=>fs.readFileSync(new URL(name,root),'utf8');

async function runScene(failEnemy=false){
 const requests=[],draws=[],canvases=[];
 class Element{
  constructor(tag='div'){this.tag=tag;this.style={};this.dataset={};this.attributes={};this.isConnected=true;if(tag==='canvas')canvases.push(this);}
  append(){} setAttribute(k,v){this.attributes[k]=v;} getAttribute(k){return this.attributes[k];} remove(){this.isConnected=false;}
  getContext(){const target=this;return{drawImage:source=>draws.push({target,source}),getImageData:()=>({data:new Uint8ClampedArray(40000)}),putImageData(){},clearRect(){},beginPath(){},ellipse(){},fill(){},save(){},translate(){},scale(){},restore(){}};}
 }
 class Image{
  naturalWidth=1024;naturalHeight=1024;
  set src(value){this.url=value;requests.push(value);queueMicrotask(()=>{if(value.includes('/enemies/')&&(failEnemy||!value.startsWith('/Dragonswood/learning-portal/public/assets/')))this.onerror?.();else this.onload?.();});}
 }
 const hero={family:'Eclipse',views:{back:{path:'/Dragonswood/learning-portal/public/assets/hero.png',frame:[0,0,100,100],anchor:[50,100],topY:0}}};
 const context=vm.createContext({URL,Image,HTMLElement:Element,console,AbortSignal,setTimeout,clearTimeout,window:{},document:{hidden:false,createElement:tag=>new Element(tag),addEventListener(){},removeEventListener(){}},fetch:async()=>({ok:true,json:async()=>({enemies:[{id:'briar-goblin-scout',name:'Briar Goblin Scout',path:'/assets/daily-battle/enemies/briar-goblin-scout-front-v1.png',bounds:{x:0,y:0,width:100,height:100}}]})}),loadActorSelection:async()=>({hero,pet:null}),actorPalette:()=>({}),prepareSpritePixels:p=>p,recolorSpritePixels:p=>p,enemyFacing:()=>-1,arenaBackgroundFrame:()=>({x:0,y:0,width:1000,height:600}),ARENA:{width:1000,height:600,floor:500,heroX:200,heroHeight:300,heroShadowWidth:100,heroShadowHeight:20,enemyX:800,enemyHeight:300,enemyMaxWidth:300}});
 vm.runInContext(read('public-resources.js').replace('export function','function').replace('import.meta.url',JSON.stringify('https://jacobevans-cell.github.io/Dragonswood/learning-portal/public/public-resources.js')),context);
 const scene=read('daily-battle-scene.js').replace(/import[\s\S]*?from\s*["'][^"']+["'];\s*/g,'').replace('export async function','async function');
 vm.runInContext(scene,context);
 const host=new Element(),controller=await context.mountDailyBattleScene({root:host,heroId:'warrior-dark-male-1',petId:null,reducedMotion:true});
 const result={requests,draws,canvases,state:host.dataset.sceneState};controller.destroy();return result;
}

test('published battle loader rebases manifest images and draws both actors under the GitHub subpath',async()=>{
 const result=await runScene();
 assert.ok(result.requests.includes('/Dragonswood/learning-portal/public/assets/daily-battle/enemies/briar-goblin-scout-front-v1.png'));
 assert.ok(!result.requests.some(url=>url.startsWith('/assets/')));
 assert.ok(result.draws.some(draw=>draw.target===result.canvases[0]&&draw.source===result.canvases[1]));
 assert.ok(result.draws.some(draw=>draw.target===result.canvases[0]&&draw.source.url?.includes('/enemies/')));
});
test('an unavailable enemy leaves the selected hero drawn instead of an empty battlefield',async()=>{
 const result=await runScene(true);assert.equal(result.state,'still');
 assert.ok(result.draws.some(draw=>draw.target===result.canvases[0]&&draw.source===result.canvases[1]));
});
