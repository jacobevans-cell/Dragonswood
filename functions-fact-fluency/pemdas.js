(function(root){
'use strict';
const modes=['no-exponents','with-exponents'];
function describe(q,mode){
 if(!modes.includes(mode)||!q||!['priority','parentheses','division','left-to-right','subtraction','power','group-power'].includes(q.type)||![q.a,q.b,q.c].every(n=>Number.isInteger(n)&&n>=1&&n<=10))throw Error('Invalid PEMDAS question.');
 const {a,b,c,type}=q;let expression,expected,steps;
 if(type==='priority'){expression=`${a} + ${b} × ${c}`;expected=a+b*c;steps=`Multiply first: ${b} × ${c} = ${b*c}. Then ${a} + ${b*c} = ${expected}.`;}
 if(type==='parentheses'){expression=`(${a} + ${b}) × ${c}`;expected=(a+b)*c;steps=`Parentheses first: ${a} + ${b} = ${a+b}. Then ${a+b} × ${c} = ${expected}.`;}
 if(type==='subtraction'){expression=`${a*b+c} − ${a} × ${b}`;expected=c;steps=`Multiply first: ${a} × ${b} = ${a*b}. Then ${a*b+c} − ${a*b} = ${expected}.`;}
 if(type==='division'){expression=`${a*b} ÷ ${b} + ${c}`;expected=a+c;steps=`Divide first: ${a*b} ÷ ${b} = ${a}. Then ${a} + ${c} = ${expected}.`;}
 if(type==='left-to-right'){expression=`${a*b} ÷ ${b} × ${c}`;expected=a*c;steps=`Division and multiplication go left to right: ${a*b} ÷ ${b} = ${a}. Then ${a} × ${c} = ${expected}.`;}
 if(type==='power'||type==='group-power'){
  if(mode!=='with-exponents'||a>5||b>3||b<2||c>5)throw Error('Invalid exponent question.');
  if(type==='power'){expression=`${c} + ${a}^${b} × 2`;expected=c+a**b*2;steps=`Exponent first: ${a}^${b} = ${a**b}. Multiply: ${a**b} × 2 = ${a**b*2}. Add ${c}: ${expected}.`;}
  else{expression=`(${a} + ${c})^${b}`;expected=(a+c)**b;steps=`Parentheses first: ${a} + ${c} = ${a+c}. Then ${a+c}^${b} = ${expected}.`;}
 }
 return {expression,expected,steps,type};
}
function questions(mode,count=40){if(!modes.includes(mode))throw Error('Invalid mode.');const base=['priority','parentheses','division','left-to-right','subtraction'];const pattern=mode==='with-exponents'?[...base,...base,base[0],base[3],...Array(4).fill('power'),...Array(4).fill('group-power')]:base;const types=Array.from({length:count},(_,i)=>pattern[i%pattern.length]);
 for(let i=types.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[types[i],types[j]]=[types[j],types[i]];}
 return types.slice(0,count).map(type=>{const exponent=type.includes('power'),rand=max=>1+Math.floor(Math.random()*max);return {type,a:rand(exponent?5:10),b:exponent?rand(2)+1:rand(10),c:rand(exponent?5:10)};});
}
const api={describe,questions,modes};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Pemdas=api;
})(typeof globalThis!=='undefined'?globalThis:this);
