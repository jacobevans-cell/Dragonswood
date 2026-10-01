(function(root){'use strict';
let serial=0;const op=(symbol,left,right)=>({id:++serial,op:symbol,left,right});const group=child=>({group:child});
function tree(q){serial=0;const {a,b,c,type}=q;switch(type){case'priority':return op('+',a,op('×',b,c));case'parentheses':return op('×',group(op('+',a,b)),c);case'subtraction':return op('−',a*b+c,op('×',a,b));case'division':return op('+',op('÷',a*b,b),c);case'left-to-right':return op('×',op('÷',a*b,b),c);case'power':return op('+',c,op('×',op('^',a,b),2));case'group-power':return op('^',group(op('+',a,c)),b);default:throw Error('Unknown question');}}
function next(t){if(typeof t==='number')return null;if(t.group)return next(t.group);return next(t.left)||next(t.right)||t;}
function value(t){if(typeof t==='number')return t;if(t.group)return value(t.group);const a=value(t.left),b=value(t.right);return t.op==='+'?a+b:t.op==='−'?a-b:t.op==='×'?a*b:t.op==='÷'?a/b:a**b;}
function reduce(t,id){if(typeof t==='number')return t;if(t.group){const child=reduce(t.group,id);return typeof child==='number'?child:{group:child};}if(t.id===id){if(next(t)!==t)throw Error('Finish inner operations first');return value(t);}return {...t,left:reduce(t.left,id),right:reduce(t.right,id)};}
function nodes(t){if(typeof t==='number')return [];if(t.group)return nodes(t.group);return [...nodes(t.left),t,...nodes(t.right)];}
const api={tree,next,value,reduce,nodes};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.QuestEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
