// API resources use root paths on Firebase; the same approved assets also ship
// beneath the GitHub project path. Student writing and external URLs stay intact.
export function publicResources(value,base=new URL('./',import.meta.url)){
 if(typeof value==='string')return /^\/(assets|vendor)\//.test(value)?new URL(value.slice(1),base).pathname:value.startsWith('/lesson-media/')?new URL(value,'https://dragonswood-9289e.web.app').href:value;
 if(Array.isArray(value))return value.map(v=>publicResources(v,base));
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,['drafts','submissions','versions','answers','response','answer','work','projectWork'].includes(k)?v:publicResources(v,base)]));
 return value;
}
