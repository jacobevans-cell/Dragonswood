import assert from 'node:assert/strict';
import {drawRecipients,recipientLabel} from './gift-exchange-core.mjs';

for(let count=2;count<=40;count++){
  const ids=Array.from({length:count},(_,i)=>`student-${i}`);
  for(let trial=0;trial<50;trial++){
    const result=drawRecipients(ids,max=>Math.floor(Math.random()*max));
    assert.deepEqual(Object.keys(result).sort(),[...ids].sort());
    assert.deepEqual(Object.values(result).sort(),[...ids].sort());
    for(const id of ids)assert.notEqual(result[id],id);
    if(count>2){
      const redraw=drawRecipients(ids,max=>Math.floor(Math.random()*max),result);
      assert.ok(ids.some(id=>redraw[id]!==result[id]));
    }
  }
}
assert.throws(()=>drawRecipients(['a'],()=>0));
assert.throws(()=>drawRecipients(['a','a'],()=>0));
assert.equal(recipientLabel({firstName:'Ava',lastName:'Rivera'}),'Ava R.');
console.log('Gift exchange draw checks passed.');

