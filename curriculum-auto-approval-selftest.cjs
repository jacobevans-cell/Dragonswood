'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('dragonswood-curriculum-validation.js','utf8');
const sandbox={globalThis:{}};vm.runInNewContext(source,sandbox,{filename:'dragonswood-curriculum-validation.js'});
const V=sandbox.globalThis.DWCurriculumValidation;
const check=(label,fn)=>{fn();console.log(`PASS ${label}`)};

check('Whitney Writing Community response passes locally',()=>assert.equal(V.writingCommunity('If I were you I would play volley ball, so you can get trollyes and you can hang out with your friends.').ok,true));
check('clear suggestion and benefit passes',()=>assert.equal(V.writingCommunity('If I were you, I would play volleyball so you can spend time with friends.').ok,true));
check('suggestion without reason receives missing_reason',()=>assert.equal(V.writingCommunity('If I were you, I would play volleyball with the team.').code,'missing_reason'));
check('So alone does not pass',()=>assert.equal(V.opinion('So.').ok,false));
check('Whitney inference response passes despite spelling',()=>assert.equal(V.inference('The anthor is clearly telling use that she smile when she look at a died person on the wall of the music room. Emma is thinking about ir person that died.').ok,true));
check('clear inference and support passes',()=>assert.equal(V.inference("Emma is thinking about someone who died because she smiles at the person's picture.").ok,true));
check('unsupported inference receives missing_evidence',()=>assert.equal(V.inference('Emma is sad.').code,'missing_evidence'));
check('visible detail alone receives missing_inference',()=>assert.equal(V.inference('Emma smiles when she looks at the picture on the wall.').code,'missing_inference'));
check('adaptive missing-reason hint does not supply an answer',()=>{const hint=V.hintFor('writingCommunity',{code:'missing_reason'});assert.match(hint,/because|so/i);assert.doesNotMatch(hint,/volleyball|troph/i)});
check('short Word Forge sentence still fails for free',()=>assert.equal(V.morphologyStructure('I was subjecting myself.','subjecting').code,'too_short'));
check('complete Word Forge sentence advances to semantic AI check',()=>assert.equal(V.morphologyStructure('The harsh test was subjecting every material sample to extreme heat.','subjecting').code,'needs_meaning_check'));
check('Word Forge requires the selected word in the sentence',()=>assert.equal(V.morphologyStructure('The harsh test exposed every material sample to extreme heat.','subjecting').code,'missing_example'));
check('Word Forge response guide asks for meaning in context',()=>assert.match(V.frameFor('morph'),/context.*means|means.*context/i));
check('Word Forge vague fallback gives response-specific advice',()=>assert.match(V.morphologyAdvice('I was subjecting myself to this again.','subjecting'),/“this” is too vague.*“subjecting”/i));

const page=fs.readFileSync('curriculum-quest.html','utf8');
check('Writing Community classification runs before generic opinion',()=>assert.ok(page.indexOf('if(/writing community|peer review|\\bpqp\\b|praise|polish/')<page.indexOf('if(/opinion/.test(raw))')));
check('Math teacher-review requests are blocked',()=>{assert.match(page,/if\(x\.subject==="Math"\)\{alert\("Math is checked automatically/);assert.match(page,/Math is checked automatically\. Revise and try again/)});
check('teacher requests carry validator and AI triage',()=>{assert.match(page,/validatorCode:String\(meta\.validatorCode/);assert.match(page,/strongRetryUsed:!!meta\.strongRetryUsed/)});
check('reading excerpts force source-grounded semantic checking',()=>assert.match(page,/structural\.ok&&sourceExcerpt.*needs_source_check/));
check('high-confidence rejection requires revision',()=>assert.match(page,/lastAiTriage\?\.decision==="not_approved"&&prior\.lastAiTriage\?\.confidence==="high"/));
check('copied directions remain blocked',()=>assert.match(page,/code:"copied_prompt",reviewable:false/));
check('Word Forge semantic check uses lesson definition and existing AI',()=>{assert.match(page,/\"quickwrite\",\"morph\"/);assert.match(page,/spec\.kind===\"morph\"\?String\(spec\.meaning/);assert.match(page,/Do not approve merely because the word appears/) });
check('Kataleya subtraction expected value is correct',()=>assert.equal(75281-17136,58145));
const runtime=fs.readFileSync('v33-integration/js/integration/runtime.js','utf8');
check('legacy Math requires a real answer before auto-resolution',()=>{assert.match(runtime,/!answer\|\|!expected/);assert.match(runtime,/interactive response submitted\|no answer recorded/)});
const daily=fs.readFileSync('daily-quest.html','utf8'),math=fs.readFileSync('dragonswood-math-autograding.js','utf8');
check('Daily Math cache key matches the policy',()=>assert.equal(daily.match(/dragonswood-math-autograding\.js\?v=([0-9.]+)/)?.[1],math.match(/const VERSION="([0-9.]+)"/)?.[1]));

console.log('\n✅ CURRICULUM AUTO-APPROVAL REGRESSION TESTS PASSED');
