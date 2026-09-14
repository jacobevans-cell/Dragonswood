export const embeddedPath=window.parent!==window&&new URLSearchParams(location.search).get('embedded')==='1';
const routes=['home','morning','math','reading','writing','science','morphology','ccf','adventurer','schedule','teacher'];
export function pathTabs(route){if(!embeddedPath||['home','adventurer','schedule'].includes(route))return '';return '<nav class="path-lesson-back" aria-label="Return to your learning path"><a href="#home">← Dragon’s Path</a></nav>';}
export function bindPathTabs(root){root.querySelectorAll('[data-path-school]').forEach(button=>button.onclick=async()=>{try{await window.DWLearningNavigation.beforeLeave();window.parent.postMessage({type:'dragonswood-path-open-school',route:button.dataset.pathSchool},location.origin);}catch(error){window.DWLearningNavigation.onError(error.message);}});}
export function startPathFrame(){if(!embeddedPath)return;document.documentElement.classList.add('dragon-path-embedded');let scheduled=false;
 const report=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;const route=location.hash.slice(1)||'home';if(!routes.includes(route))return;window.parent.postMessage({type:'dragonswood-path-view',route,height:Math.ceil(document.body.scrollHeight)},location.origin);});};
 new ResizeObserver(report).observe(document.body);window.addEventListener('hashchange',()=>{report();window.parent.postMessage({type:'dragonswood-path-scroll'},location.origin);});window.addEventListener('load',report);report();
}
