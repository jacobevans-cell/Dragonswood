'use strict';
const base=require('./curriculum-manifest-base.js');
const keep=new Set(['I-HUM-D27-C2-A','I-HUM-D27-C3-A','K-HUM-D27-C2-A','K-HUM-D27-C3-A']);
const out={};
for(const [grade,days] of Object.entries(base)){
  const gradeDays={...days};
  if(Array.isArray(gradeDays['27'])){
    gradeDays['27']=Object.freeze(gradeDays['27'].filter(item=>keep.has(item.id)));
  }
  out[grade]=Object.freeze(gradeDays);
}
module.exports=Object.freeze(out);
