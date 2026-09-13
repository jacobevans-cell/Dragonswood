const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const svg=(label,body)=>`<svg class="diagram coach-diagram" role="img" aria-label="${esc(label)}" viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg"><title>${esc(label)}</title><rect width="600" height="220" rx="12" fill="#f2ecdf"/><g fill="#183e43" font-family="system-ui,sans-serif" font-size="16">${body}</g></svg>`;
const box=(title,visual,guide)=>`<details class="assessment-method-coach"><summary>Visual coach · ${esc(title)}</summary><p class="small muted">Practice the method with a different example.</p>${visual}<p>${esc(guide)}</p></details>`;
const car=(x,y,angle=0)=>`<g transform="translate(${x} ${y}) rotate(${angle})"><rect width="42" height="17" rx="4" fill="#7865a0"/><path d="M8 0 L15 -12 H31 L36 0" fill="#087f79"/><circle cx="9" cy="20" r="6" fill="#243842"/><circle cx="34" cy="20" r="6" fill="#243842"/></g>`;
function scienceCoach(qid) {
  if(qid==='s-video-pendulum')return box('Compare positions on a swing',svg('One swing shown at three positions. Its rope length stays the same; its seat height changes.',
    `<path d="M75 36 H525" stroke="#867451" stroke-width="9"/>
    <path d="M160 40 L90 120 M300 40 V160 M440 40 L510 120" stroke="#7865a0" stroke-width="4"/>
    <path d="M64 127 L108 110 M277 167 H323 M492 110 L536 127" stroke="#087f79" stroke-width="9"/>
    <path d="M110 149 Q300 213 489 149" fill="none" stroke="#bf854e" stroke-dasharray="6 6" stroke-width="3"/>
    <text x="300" y="25" text-anchor="middle">One swing · three moments</text>
    <text x="300" y="208" text-anchor="middle">Compare height and motion at each moment.</text>`),
    'Picture the swing moving along its curved path. At which positions would you look for changes in height and speed? Use that comparison to reason about the video’s pendulum.');
  const focus={
    's-energy-motion':'Notice the motion marks beside the rolling car. Distinguish what an object is doing from the name of a force or material.',
    's-energy-height':'Compare the car held near the top of the ramp with the car on the floor. Think about what could happen after the car is released.',
    's-video-conservation':'Compare the car, foam and nearby floor before and after the collision. A car stopping is one observation; think about what else can change.',
    's-sequence-first':'Find the moment before anyone releases this car. Then look for the same kind of moment in the supplied egg pictures.',
    's-sequence-next':'Find the car after release and before it reaches the foam. Use that change to distinguish a starting moment from a moving moment.',
    's-sequence-last':'Compare the object and the landing material after they meet. Use visible changes to identify an outcome; do not choose only because of a picture’s letter.',
  }[qid]||'Compare what changes between the three moments. Return to the supplied video and pictures to support your answer.';
  return box('Follow a toy car through a change',svg('A toy car is held near the top of a ramp, then rolls toward foam, then presses into the foam. The surrounding floor remains visible.',
    `<text x="300" y="26" text-anchor="middle">A different example: a toy car and foam</text>
    <path d="M20 95 L170 167 H580" fill="none" stroke="#867451" stroke-width="6"/>
    ${car(45,78,26)}<path d="M30 72 V110" stroke="#bf854e" stroke-width="7"/>
    ${car(256,141)}<path d="M217 141 H244 M215 152 H240" stroke="#bf854e" stroke-width="3"/>
    <rect x="337" y="124" width="26" height="41" fill="#d49a62"/>
    ${car(465,141)}<path d="M507 125 L514 136 L508 146 L514 157 L508 165 H532 V125 Z" fill="#d49a62"/>
    <text x="38" y="193">Held in place</text><text x="236" y="193">Rolling</text><text x="450" y="193">Meets foam</text>`),focus);
}

/** Reviewed local support. Exact worked solutions remain available after finality. */
export function stageSafeQuestionCoach(assignment,qid,grade,originalHtml,{finalized=false}={}) {
  if(finalized)return originalHtml;
  if(assignment==='science')return scienceCoach(qid);
  if(assignment==='math'&&Number(grade)===4&&qid==='m6')return box('Test a shape against a family rule',svg('A triangle fits inside the broader polygon family: it is closed and has straight sides.',
    `<rect x="36" y="30" width="528" height="166" rx="15" fill="#e1d9ec" stroke="#7865a0" stroke-width="3"/>
    <text x="65" y="59">Polygon family: a closed shape with straight sides</text>
    <path d="M84 171 L145 83 L206 171 Z" fill="#b9ddd1" stroke="#087f79" stroke-width="4"/>
    <text x="251" y="104">Check the whole rule:</text><text x="251" y="135">✓ Closed outline</text><text x="251" y="164">✓ Straight sides</text>`),
    'A shape can have a specific name and still meet a broader family rule. Read the rectangle rule in your lesson, then check each required feature of the assigned shape.');
  if(assignment==='math'&&Number(grade)===4&&qid==='m7')return box('Match sides before counting pairs',svg('A trapezoid example has a short top edge and a longer bottom edge. Those two parallel edges make one pair. The slanted side edges do not make another pair.',
    `<path d="M166 66 L105 164 H341 L281 66 Z" fill="#e2dcea" stroke="#7865a0" stroke-width="4"/>
    <path d="M166 66 H281 M105 164 H341" stroke="#087f79" stroke-width="7"/>
    <path d="M223 83 V146" stroke="#bf854e" stroke-width="2" stroke-dasharray="5 5"/>
    <text x="370" y="99">Two matching sides</text><text x="370" y="129">make one pair.</text>
    <text x="300" y="202" text-anchor="middle">Different example · count each pair once</text>`),
    'Match two sides that would never meet if extended. Count that match once. Apply the method to T; its answer may differ from this example.');
  if(assignment==='math'&&Number(grade)===5&&qid==='m4')return box('Connect repeated steps with a factor',svg('A different pattern starts at 2, doubles to 4, then doubles to 8. Two factors of 2 combine into a factor of 4.',
    `<text x="68" y="98" font-size="34">2</text><text x="273" y="98" font-size="34">4</text><text x="479" y="98" font-size="34">8</text>
    <path d="M110 87 H240 L228 79 M240 87 L228 95 M317 87 H447 L435 79 M447 87 L435 95" stroke="#087f79" stroke-width="4" fill="none"/>
    <text x="157" y="61">× 2</text><text x="361" y="61">× 2</text>
    <text x="300" y="148" text-anchor="middle">Combined factor: 2 × 2 = 4</text>
    <text x="300" y="188" text-anchor="middle">Connect the repeated factor with the whole change.</text>`),
    'Repeated multiplication combines factors. Your question uses tens and place values. Identify the factor for one jump and reason about repeating it.');
  return originalHtml;
}
