'use strict';
const assert = require('node:assert/strict');

const project = 'demo-dragonswood-v33';
const authUrl = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key';
const base = `http://127.0.0.1:8080/v1/projects/${project}/databases/(default)`;
const prefix = `projects/${project}/databases/(default)/documents`;
const eventPath = 'giftExchanges/current';
const future = new Date(Date.now() + 14*86400000).toISOString();
const giftDay = new Date(Date.now() + 21*86400000).toISOString().slice(0,10);

function field(value) {
  if(value instanceof Date)return {timestampValue:value.toISOString()};
  if(typeof value==='string')return {stringValue:value};
  if(typeof value==='boolean')return {booleanValue:value};
  if(Number.isInteger(value))return {integerValue:String(value)};
  throw new TypeError(`Unsupported field value: ${value}`);
}
function fields(data){return Object.fromEntries(Object.entries(data).map(([key,value])=>[key,field(value)]));}
async function request(url,method='GET',token='',body) {
  const response=await fetch(url,{method,headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{})},body:body?JSON.stringify(body):undefined});
  const text=await response.text();
  return {status:response.status,body:text?JSON.parse(text):null};
}
function expect(actual,status,label){assert.equal(actual.status,status,`${label}: ${JSON.stringify(actual.body)}`);}
async function account(email,existing=false){
  const url=existing?authUrl.replace('accounts:signUp','accounts:signInWithPassword'):authUrl;
  const result=await request(url,'POST','',{email,password:existing?'V33-Gate-Only-2026!':'Gift-Gate-Only-2026!',returnSecureToken:true});
  expect(result,200,`create ${email}`);
  return {uid:result.body.localId,token:result.body.idToken};
}
async function seed(path,data){
  const bits=path.split('/');const id=bits.pop();
  const result=await request(`${base}/documents/${bits.join('/')}?documentId=${encodeURIComponent(id)}`,'POST','owner',{fields:fields(data)});
  expect(result,200,`seed ${path}`);
}
async function get(path,token){return request(`${base}/documents/${path}`,'GET',token);}
async function list(path,token){return request(`${base}/documents/${path}?pageSize=100`,'GET',token);}
async function commit(token,writes){return request(`${base}/documents:commit`,'POST',token,{writes});}
function update(path,data,{create=false,mask=[],timestamp=false}={}){
  return {update:{name:`${prefix}/${path}`,fields:fields(data)},
    ...(create?{currentDocument:{exists:false}}:{}),
    ...(mask.length?{updateMask:{fieldPaths:mask}}:{}),
    ...(timestamp?{updateTransforms:[{fieldPath:'updatedAt',setToServerValue:'REQUEST_TIME'}]}:{})};
}
function remove(path){return {delete:`${prefix}/${path}`};}

(async()=>{
  const [teacher,a,b,c,outsider]=await Promise.all([
    account('jacobicusjax@gmail.com',true),account('gift-a@explore.academy'),account('gift-b@explore.academy'),account('gift-c@explore.academy'),account('gift-outsider@example.com')
  ]);
  for(const [student,name] of [[a,'Ava'],[b,'Ben'],[c,'Cleo']])await seed(`students/${student.uid}`,{firstName:name,grade:5});
  await seed(eventPath,{title:'Gift privacy gate',budgetCents:1500,status:'open',drawVersion:0,wishlistDeadline:giftDay,giftDate:giftDay,wishlistClosesAt:new Date(future)});

  expect(await get(eventPath,a.token),200,'student reads event');
  expect(await get(eventPath,outsider.token),403,'outsider cannot read event');
  expect(await commit(a.token,[update(`${eventPath}/participants/${a.uid}`,{joined:true},{create:true,timestamp:true})]),403,'student cannot add themself');
  expect(await commit(teacher.token,[update(`${eventPath}/participants/${a.uid}`,{joined:true},{create:true,timestamp:true})]),200,'teacher includes A');
  expect(await commit(teacher.token,[update(`${eventPath}/participants/${b.uid}`,{joined:true},{create:true,timestamp:true})]),200,'teacher includes B');
  expect(await commit(teacher.token,[update(`${eventPath}/participants/${c.uid}`,{joined:true},{create:true,timestamp:true})]),200,'teacher includes C');
  expect(await commit(teacher.token,[remove(`${eventPath}/participants/${c.uid}`)]),200,'teacher removes C before draw');
  expect(await get(`${eventPath}/participants/${a.uid}`,a.token),200,'A reads own participation');
  expect(await get(`${eventPath}/participants/${a.uid}`,b.token),403,'B cannot read A participation');
  expect(await list(`${eventPath}/participants`,a.token),403,'student cannot list roster');
  expect(await list(`${eventPath}/participants`,teacher.token),200,'teacher can list roster');

  expect(await commit(a.token,[update(`${eventPath}/wishlists/${a.uid}`,{text:'A sketchbook'},{create:true,timestamp:true})]),200,'A saves wishlist');
  expect(await commit(b.token,[update(`${eventPath}/wishlists/${b.uid}`,{text:'A puzzle'},{create:true,timestamp:true})]),200,'B saves wishlist');
  expect(await commit(c.token,[update(`${eventPath}/wishlists/${c.uid}`,{text:'Color pencils'},{create:true,timestamp:true})]),200,'student can prepare wishlist before selection');
  expect(await get(`${eventPath}/wishlists/${a.uid}`,b.token),403,'wishlist stays private before draw');
  expect(await list(`${eventPath}/wishlists`,a.token),403,'student cannot list wishlists');

  expect(await commit(teacher.token,[
    update(`${eventPath}/assignments/${a.uid}`,{recipientId:b.uid,recipientName:'Ben',drawVersion:1},{create:true,timestamp:true}),
    update(`${eventPath}/assignments/${b.uid}`,{recipientId:a.uid,recipientName:'Ava',drawVersion:1},{create:true,timestamp:true}),
    update(eventPath,{status:'drawn',drawVersion:1},{mask:['status','drawVersion']})
  ]),200,'teacher draws');
  expect(await get(`${eventPath}/assignments/${a.uid}`,a.token),200,'A reads own draw');
  expect(await get(`${eventPath}/assignments/${b.uid}`,a.token),403,'A cannot read B draw');
  expect(await list(`${eventPath}/assignments`,a.token),403,'student cannot list draws');
  expect(await list(`${eventPath}/assignments`,teacher.token),200,'teacher sees all draws');
  expect(await get(`${eventPath}/wishlists/${b.uid}`,a.token),200,'A reads assigned recipient wishlist');
  expect(await get(`${eventPath}/wishlists/${a.uid}`,b.token),200,'B reads assigned recipient wishlist');
  expect(await get(`${eventPath}/wishlists/${a.uid}`,c.token),403,'unassigned student cannot read wishlist');
  expect(await commit(a.token,[update(`${eventPath}/assignments/${a.uid}`,{recipientId:c.uid,recipientName:'Cleo',drawVersion:2},{timestamp:true})]),403,'student cannot change draw');
  expect(await commit(c.token,[update(`${eventPath}/participants/${c.uid}`,{joined:true},{create:true,timestamp:true})]),403,'student cannot change locked roster');
  expect(await commit(a.token,[remove(`${eventPath}/participants/${a.uid}`)]),403,'student cannot remove themself');
  console.log('Gift exchange Firestore privacy checks passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});

