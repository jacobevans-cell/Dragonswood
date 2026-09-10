'use strict';
const base=require('./curriculum-manifest-base.js');
const keep27=new Set(['I-HUM-D27-C2-A','I-HUM-D27-C3-A','K-HUM-D27-C2-A','K-HUM-D27-C3-A']);
const day28Special={
  I:[
    {id:'I-HUM-D28-C1-A',videoRequired:true},
    {id:'I-HUM-D28-C2-A',videoRequired:false},
    {id:'I-HUM-D28-C3-A',videoRequired:false}
  ],
  K:[
    {id:'K-HUM-D28-C1-A',videoRequired:true},
    {id:'K-HUM-D28-C2-A',videoRequired:false},
    {id:'K-HUM-D28-C3-A',videoRequired:false}
  ]
};
const out={};
for(const [grade,days] of Object.entries(base)){
  const gradeDays={...days};
  if(Array.isArray(gradeDays['27'])){
    gradeDays['27']=Object.freeze(gradeDays['27'].filter(item=>keep27.has(item.id)));
  }
  if(Array.isArray(gradeDays['28'])){
    const videoOnly=gradeDays['28'].filter(item=>item.videoRequired===true&&!String(item.id).startsWith(`${grade}-HUM-D28-`));
    const merged=[...(day28Special[grade]||[]),...videoOnly];
    gradeDays['28']=Object.freeze(merged.map(item=>Object.freeze({...item})));
  }
  out[grade]=Object.freeze(gradeDays);
}
module.exports=Object.freeze(out);