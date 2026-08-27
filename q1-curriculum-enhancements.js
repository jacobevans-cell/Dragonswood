(function(){
  const D=window.DRAGONSWOOD_DATA;
  if(!D||!Array.isArray(D.morphology))return;
  const lessons={
    "I-MORPH-W1-L1":{
      phonological:"2 syllables: for-mat",
      orthographic:"Spelled f-o-r-m-a-t. It contains the root form.",
      morphological:"form = shape or arrangement. A format is the way information is shaped or arranged.",
      syntactic:"Noun: The report uses a clear format.",
      etymological:"From Latin formare, meaning to shape or form.",
      application:"Describe the format of a book, webpage, or school assignment. Then use format in a complete sentence."
    },
    "I-MORPH-W1-L2":{
      phonological:"3 syllables: for-ma-tion",
      orthographic:"Base form + suffix -ation. The ending -tion says /shun/.",
      morphological:"form = shape + -ation = process or result. Formation means the process of forming or an arrangement that has been formed.",
      syntactic:"Noun: The geese flew in a V-shaped formation.",
      etymological:"From Latin formatio, meaning a shaping or forming.",
      application:"Identify a formation you have seen in nature, sports, or a classroom. Use formation in a complete sentence."
    },
    "I-MORPH-W1-L3":{
      phonological:"2 syllables: con-form",
      orthographic:"Prefix con- + root form.",
      morphological:"con- = together + form = shape. Conform means to match a rule, pattern, or expected form.",
      syntactic:"Verb: The builders must conform to the safety rules.",
      etymological:"From Latin conformare, meaning to form together or make similar.",
      application:"Explain why people or objects might need to conform to a rule or pattern. Use conform in a complete sentence."
    },
    "I-MORPH-W1-L4":{
      phonological:"2 syllables: in-form",
      orthographic:"Prefix in- + root form.",
      morphological:"in- = into + form = shape. To inform is to give knowledge that shapes what someone knows.",
      syntactic:"Verb: Please inform the teacher if you need help.",
      etymological:"From Latin informare, meaning to shape, teach, or give form to the mind.",
      application:"Name information someone at school needs to know. Use inform in a complete sentence."
    },
    "K-MORPH-W1-L1":{
      phonological:"3 syllables: con-ced-ed",
      orthographic:"Base concede + suffix -ed. The final silent e is removed before adding -ed.",
      morphological:"con- = together + cede = yield or give way + -ed = past tense. Conceded means admitted something was true or gave way.",
      syntactic:"Verb: After reviewing the evidence, Maya conceded that Luis was correct.",
      etymological:"From Latin concedere, meaning to yield, allow, or grant.",
      application:"Describe a fair situation in which someone might concede a point. Use conceded in a complete sentence."
    },
    "K-MORPH-W1-L2":{
      phonological:"3 syllables: pro-ces-sion",
      orthographic:"Prefix pro- + root cess + suffix -ion. The ending -sion says /shun/.",
      morphological:"pro- = forward + cess = go + -ion = act or process. A procession is a group moving forward in an organized way.",
      syntactic:"Noun: The graduation procession entered the auditorium quietly.",
      etymological:"From Latin procedere, meaning to go forward.",
      application:"Describe where you might see a procession. Use procession in a complete sentence."
    },
    "K-MORPH-W1-L3":{
      phonological:"3 syllables: pre-ced-ing",
      orthographic:"Prefix pre- + base cede + suffix -ing. The silent e is removed before adding -ing.",
      morphological:"pre- = before + cede = go + -ing = ongoing action. Preceding means coming or going before something else.",
      syntactic:"Adjective: Review the preceding paragraph before answering the question.",
      etymological:"From Latin praecedere, meaning to go before.",
      application:"Identify something that happens before another event. Use preceding in a complete sentence."
    },
    "K-MORPH-W1-L4":{
      phonological:"2 syllables: re-cess",
      orthographic:"Prefix re- + root cess.",
      morphological:"re- = back + cess = go. Recess originally described a withdrawal or pause; today it commonly means a break from work or class.",
      syntactic:"Noun: The class went outside for recess after math.",
      etymological:"From Latin recessus, meaning a going back, retreat, or pause.",
      application:"Explain how the modern meaning of recess connects to the idea of going back or pausing. Use recess in a complete sentence."
    },
    "I-MORPH-W5-L1":{
      phonological:"2 syllables: in-struct",
      morphological:"in- = into or upon + struct = build. To instruct is to teach or build knowledge."
    },
    "I-MORPH-W5-L2":{
      phonological:"4 syllables: re-con-struc-tion",
      morphological:"re- = again + construct = build + -ion = act or process. Reconstruction is the act of building again."
    },
    "I-MORPH-W5-L3":{
      phonological:"3 syllables: de-struc-tive"
    },
    "I-MORPH-W5-L4":{
      phonological:"3 syllables: in-stru-ment"
    }
  };
  D.morphology.forEach(row=>{if(lessons[row.id])Object.assign(row,lessons[row.id])});
})();

/* v56.23 — load the no-video-only lesson engine.
   The engine itself hard-stops on every mission classified as a video lesson. */
(function(){
  if(window.__DW_NO_VIDEO_ENGINE_LOADER__)return;
  window.__DW_NO_VIDEO_ENGINE_LOADER__=true;
  const s=document.createElement("script");
  s.src="q1-no-video-lessons.js?v=56.25.3";
  s.async=false;
  document.head.appendChild(s);
})();


/* v56.24.2 — curriculum interaction layer.
   Practice-only enhancement. Required-video playback/tracking remains in curriculum-quest.html. */
(function(){
  if(window.__DW_CURRICULUM_INTERACTION_LOADER__)return;
  window.__DW_CURRICULUM_INTERACTION_LOADER__=true;
  const s=document.createElement("script");
  s.src="q1-curriculum-interactions.js?v=56.24.2";
  s.async=false;
  document.head.appendChild(s);
})();


/* v56.25.3 - answer-integrity policy.
   Separates selection from submission and applies practice/check/assessment attempt rules. */
(function(){
  if(window.__DW_CURRICULUM_ANSWER_POLICY_LOADER__)return;
  window.__DW_CURRICULUM_ANSWER_POLICY_LOADER__=true;
  const s=document.createElement("script");
  s.src="q1-curriculum-answer-policy.js?v=56.25.3";
  s.async=false;
  document.head.appendChild(s);
})();


/* v57.1.1 - Math auto-grading policy.
   Math uses deterministic grading or automatic AI reasoning checks, never teacher approval. */
(function(){
  if(window.__DW_MATH_AUTO_GRADING_LOADER__)return;
  window.__DW_MATH_AUTO_GRADING_LOADER__=true;
  const s=document.createElement("script");
  s.src="dragonswood-math-autograding.js?v=57.1.2";
  s.async=false;
  document.head.appendChild(s);
})();
