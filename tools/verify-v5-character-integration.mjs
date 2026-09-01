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
let profiles=0,checkedFiles=0;

for(const [classId,genders] of Object.entries(R.v5Families)){
  for(const [gender,affinities] of Object.entries(genders)){
    for(const affinity of Object.keys(affinities)){
      for(const level of levels){
        const profile={email:R.v5Config.testerEmail,characterSystemVersion:'v5',characterV5Gender:gender,characterV5Affinity:affinity,characterV5ClassId:classId,level};
        const pack=R.resolveV5Character(profile);
        profiles++;
        if(!pack){failures.push(`No pack: ${classId}/${gender}/${affinity}/L${level}`);continue}
        if(R.characterClassId(profile)!==classId)failures.push(`Wrong class: ${pack.id}`);
        for(const key of ['skinArt','idleArt','walkLeftArt','walkRightArt','attackArt','abilityArt','hurtArt','happyArt','celebrateArt']){
          const target=path.join(root,pack[key]);
          checkedFiles++;
          if(!fs.existsSync(target))failures.push(`Missing ${key}: ${pack[key]}`);
        }
      }
    }
  }
}

const legacy={classId:'mage',rpgEquipped:{appearance:'mage_appearance_10'},characterSystemVersion:'legacy',characterV5Gender:'',characterV5Affinity:'',characterV5ClassId:''};
if(R.characterClassId(legacy)!=='mage')failures.push('Legacy rollback class did not resolve.');
if(R.resolveAppearance(legacy)?.id!=='mage_appearance_10')failures.push('Legacy rollback appearance did not resolve.');
if(!R.v5SelectionRequired({email:R.v5Config.testerEmail,classId:'mage'},R.v5Config.testerEmail))failures.push('Tester reset gate did not require V5 selection.');

const catalog=JSON.parse(fs.readFileSync(path.join(root,'assets/rpg/v5/catalog.json'),'utf8'));
if(catalog.validation?.passed!==true)failures.push('Production catalog validation is not passing.');
if(catalog.characters?.length!==80)failures.push(`Expected 80 catalog characters, got ${catalog.characters?.length}.`);
if(catalog.productionAssetCount!==480)failures.push(`Expected 480 production files, got ${catalog.productionAssetCount}.`);

for(const [file,needle] of [['adventurer-hall.html','characterV5'],['boss-battle.html','characterClassId'],['v33-integration/js/student-app.js','characterV5'],['kingdom-wars/kingdom-wars-test-app.mjs','characterV5']]){
  const body=fs.readFileSync(path.join(root,file),'utf8');
  if(!body.includes(needle))failures.push(`${file} is not wired to V5 profile fields.`);
}

const result={passed:failures.length===0,profiles,checkedFiles,catalogCharacters:catalog.characters.length,productionAssets:catalog.productionAssetCount,failures};
console.log(JSON.stringify(result,null,2));
if(failures.length)process.exitCode=1;
