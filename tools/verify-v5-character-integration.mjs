import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'dragonswood-rpg-v56.js'),'utf8');
const context={window:{DRAGONSWOOD_PET_REGISTRY:[]},Intl,Date,Math,Number,String,Array,Object,Set,Map};
vm.createContext(context);
vm.runInContext(source,context,{filename:'dragonswood-rpg-v56.js'});
const R=context.window.DWRPG;
const failures=[];
const levels=[1,5,10,15,20];
const expectedFamilies={
  warrior:{male:{radiant:'dawnscale',shadow:'eclipse'},female:{radiant:'sunshield',shadow:'nightwyrm'}},
  ranger:{male:{radiant:'dawnfeather',shadow:'nightfang'},female:{radiant:'sunleaf',shadow:'moonshadow'}},
  mage:{male:{radiant:'starfire',shadow:'voidcore'},female:{radiant:'celestial',shadow:'eclipse-witch'}},
  healer:{male:{radiant:'dawnkeeper',shadow:'mooncleric'},female:{radiant:'dawnwing',shadow:'twilight'}},
};
const expectedTimelines={
  static:[1000],idle:[360,360,360,360],walkLeft:[120,120,120,120,120,120],walkRight:[120,120,120,120,120,120],
  attack:[160,110,130,170,240],heal:[160,130,170,180,240],hurt:[160,190,170,300],
  happy:[160,130,170,130,180,260],celebrate:[130,110,140,190,140,110,160,280],
};
let profiles=0,checkedFiles=0;

for(const [classId,genders] of Object.entries(expectedFamilies)){
  for(const [gender,affinities] of Object.entries(genders)){
    for(const [affinity,expectedId] of Object.entries(affinities)){
      const actual=R.v5Families[classId]?.[gender]?.[affinity]?.id;
      if(actual!==expectedId)failures.push(`Gender mapping mismatch: ${classId}/${gender}/${affinity} expected ${expectedId}, got ${actual}.`);
    }
  }
}

for(const [classId,genders] of Object.entries(R.v5Families)){
  for(const [gender,affinities] of Object.entries(genders)){
    for(const affinity of Object.keys(affinities)){
      for(const level of levels){
       for(const skinTone of Object.keys(R.v5SkinTones))for(const hairColor of Object.keys(R.v5HairColors)){
        const profile={email:R.v5Config.testerEmail,characterSystemVersion:'v5',characterV5Gender:gender,characterV5Affinity:affinity,characterV5ClassId:classId,characterV5SkinTone:skinTone,characterV5HairColor:hairColor,level};
        const pack=R.resolveV5Character(profile);
        profiles++;
        if(!pack){failures.push(`No pack: ${classId}/${gender}/${affinity}/L${level}`);continue}
        if(R.characterClassId(profile)!==classId)failures.push(`Wrong class: ${pack.id}`);
        if(pack.idleArt===pack.walkLeftArt||pack.idleArt===pack.walkRightArt)failures.push(`Idle/walk route collision: ${pack.id}`);
        if(pack.happyArt===pack.celebrateArt)failures.push(`Happy/celebrate route collision: ${pack.id}`);
        for(const [state,expected] of Object.entries(expectedTimelines)){
          if(state==='heal'&&classId!=='healer')continue;
          if(state==='attack'&&classId==='healer')continue;
          const actual=R.v5MotionTimeline(pack,state);
          if(JSON.stringify(actual)!==JSON.stringify(expected))failures.push(`Timeline mismatch: ${pack.id}/${state} got ${JSON.stringify(actual)}.`);
        }
        for(const key of ['skinArt','idleArt','walkLeftArt','walkRightArt','attackArt','abilityArt','hurtArt','happyArt','celebrateArt']){
          const target=path.join(root,pack[key]);
          checkedFiles++;
          if(!fs.existsSync(target))failures.push(`Missing ${key}: ${pack[key]}`);
        }
       }
      }
    }
  }
}

const legacy={classId:'mage',rpgEquipped:{appearance:'mage_appearance_10'},characterSystemVersion:'legacy',characterV5Gender:'',characterV5Affinity:'',characterV5ClassId:''};
if(R.characterClassId(legacy)!=='mage')failures.push('Legacy rollback class did not resolve.');
if(R.resolveAppearance(legacy)?.id!=='mage_appearance_10')failures.push('Legacy rollback appearance did not resolve.');
if(!R.v5SelectionRequired({email:R.v5Config.testerEmail,classId:'mage'},R.v5Config.testerEmail))failures.push('Tester reset gate did not require V5 selection.');
const outsider={email:'another-student@example.com',classId:'mage',characterSystemVersion:'v5',characterV5Gender:'male',characterV5Affinity:'radiant',characterV5ClassId:'warrior',level:20};
if(R.resolveV5Character(outsider)!==null)failures.push('A non-tester account resolved a V5 character.');
if(R.characterClassId(outsider)!=='mage')failures.push('A non-tester account escaped its legacy class through V5 fields.');
if(!R.isV5Tester({email:' JACOBICUSJAX@GMAIL.COM '}))failures.push('Tester email normalization failed.');
if(R.isV5Tester({email:'jacobicusjax@gmail.com.example'}))failures.push('Tester email matching was not exact.');

const disabledContext={window:{DRAGONSWOOD_PET_REGISTRY:[]},Intl,Date,Math,Number,String,Array,Object,Set,Map};
vm.createContext(disabledContext);
vm.runInContext(source.replace('enabled:true,testerEmail:', 'enabled:false,testerEmail:'),disabledContext,{filename:'dragonswood-rpg-v56-disabled.js'});
const disabledR=disabledContext.window.DWRPG;
const rollbackProfile={email:R.v5Config.testerEmail,classId:'mage',characterSystemVersion:'v5',characterV5Gender:'male',characterV5Affinity:'radiant',characterV5ClassId:'warrior',level:20};
if(disabledR.resolveV5Character(rollbackProfile)!==null||disabledR.characterClassId(rollbackProfile)!=='mage')failures.push('Global V5 rollback switch did not restore the legacy character class.');

for(const rulesPath of ['firestore.rules','v33-integration/firestore.gate.rules']){
  const rules=fs.readFileSync(path.join(root,rulesPath),'utf8');
  if(!rules.includes("request.auth.token.email == 'jacobicusjax@gmail.com'"))failures.push(`${rulesPath} is missing the exact tester-email write gate.`);
  for(const field of ['characterSystemVersion','characterV5Gender','characterV5Affinity','characterV5ClassId','characterV5SkinTone','characterV5HairColor','characterV5SelectedAt']){
    if(!rules.includes(field))failures.push(`${rulesPath} is missing the ${field} rule.`);
  }
}

const catalog=JSON.parse(fs.readFileSync(path.join(root,'assets/rpg/v5/catalog.json'),'utf8'));
if(catalog.validation?.passed!==true)failures.push('Production catalog validation is not passing.');
if(catalog.characters?.length!==80)failures.push(`Expected 80 catalog characters, got ${catalog.characters?.length}.`);
if(catalog.productionAssetCount!==640)failures.push(`Expected 640 base production files, got ${catalog.productionAssetCount}.`);
if(catalog.appearance?.layerAssetCount!==1280)failures.push(`Expected 1280 appearance layers, got ${catalog.appearance?.layerAssetCount}.`);
if(catalog.appearance?.wrapperAssetCount!==0)failures.push(`Obsolete SVG wrappers remain in the catalog: ${catalog.appearance?.wrapperAssetCount}.`);
if(!source.includes('function renderV5Character')||!source.includes('function v5StatePaths'))failures.push('The shared V5 renderer is missing.');
if(!source.includes('canvas class="dw-v5-canvas"')||!source.includes('function v5HydrateCanvas')||!source.includes('new ImageDecoder('))failures.push('The synchronized single-clock canvas renderer is missing.');
if(source.includes('<img class="dw-v5-tint'))failures.push('Independent animated tint images remain and can desynchronize from the body.');
if(!source.includes('Promise.all([v5DecodeFrames(canvas.dataset.base),v5TintFrames(canvas.dataset.skin'))failures.push('Base, skin, and hair layers are not loaded together before playback.');
for(const character of catalog.characters||[]){
  const expected=expectedFamilies[character.classId]?.[character.gender]?.[character.affinity];
  if(expected!==character.family)failures.push(`Catalog gender mismatch: ${character.id} is tagged ${character.gender}/${character.affinity}.`);
}

for(const [file,needle] of [['adventurer-hall.html','renderV5Classes'],['boss-battle.html','renderV5Character'],['v33-integration/js/student-app.js','renderV5Character'],['kingdom-wars/kingdom-wars-test-app.mjs','renderV5Character']]){
  const body=fs.readFileSync(path.join(root,file),'utf8');
  if(!body.includes(needle))failures.push(`${file} is not wired to V5 profile fields.`);
}

const result={passed:failures.length===0,profiles,checkedFiles,catalogCharacters:catalog.characters.length,productionAssets:catalog.productionAssetCount,failures};
console.log(JSON.stringify(result,null,2));
if(failures.length)process.exitCode=1;
