(function(){
  const D=window.DRAGONSWOOD_DATA;
  if(!D||!Array.isArray(D.morphology))return;
  const lessons={
    "I-MORPH-W1-L1":{phonological:"2 syllables: for-mat",orthographic:"Spelled f-o-r-m-a-t. It contains the root form.",morphological:"form = shape or arrangement. A format is the way information is shaped or arranged.",syntactic:"Noun: The report uses a clear format.",etymological:"From Latin formare, meaning to shape or form.",application:"Describe the format of a book, webpage, or school assignment. Then use format in a complete sentence."},
    "I-MORPH-W1-L2":{phonological:"3 syllables: for-ma-tion",orthographic:"Base form + suffix -ation. The ending -tion says /shun/.",morphological:"form = shape + -ation = process or result. Formation means the process of forming or an arrangement that has been formed.",syntactic:"Noun: The geese flew in a V-shaped formation.",etymological:"From Latin formatio, meaning a shaping or forming.",application:"Identify a formation you have seen in nature, sports, or a classroom. Use formation in a complete sentence."},
    "I-MORPH-W1-L3":{phonological:"2 syllables: con-form",orthographic:"Prefix con- + root form.",morphological:"con- = together + form = shape. Conform means to match a rule, pattern, or expected form.",syntactic:"Verb: The builders must conform to the safety rules.",etymological:"From Latin conformare, meaning to form together or make similar.",application:"Explain why people or objects might need to conform to a rule or pattern. Use conform in a complete sentence."},
    "I-MORPH-W1-L4":{phonological:"2 syllables: in-form",orthographic:"Prefix in- + root form.",morphological:"in- = into + form = shape. To inform is to give knowledge that shapes what someone knows.",syntactic:"Verb: Please inform the teacher if you need help.",etymological:"From Latin informare, meaning to shape, teach, or give form to the mind.",application:"Name information someone at school needs to know. Use inform in a complete sentence."},
    "K-MORPH-W1-L1":{phonological:"3 syllables: con-ced-ed",orthographic:"Base concede + suffix -ed. The final silent e is removed before adding -ed.",morphological:"con- = together + cede = yield or give way + -ed = past tense. Conceded means admitted something was true or gave way.",syntactic:"Verb: After reviewing the evidence, Maya conceded that Luis was correct.",etymological:"From Latin concedere, meaning to yield, allow, or grant.",application:"Describe a fair situation in which someone might concede a point. Use conceded in a complete sentence."},
    "K-MORPH-W1-L2":{phonological:"3 syllables: pro-ces-sion",orthographic:"Prefix pro- + root cess + suffix -ion. The ending -sion says /shun/.",morphological:"pro- = forward + cess = go + -ion = act or process. A procession is a group moving forward in an organized way.",syntactic:"Noun: The graduation procession entered the auditorium quietly.",etymological:"From Latin procedere, meaning to go forward.",application:"Describe where you might see a procession. Use procession in a complete sentence."},
    "K-MORPH-W1-L3":{phonological:"3 syllables: pre-ced-ing",orthographic:"Prefix pre- + base cede + suffix -ing. The silent e is removed before adding -ing.",morphological:"pre- = before + cede = go + -ing = ongoing action. Preceding means coming or going before something else.",syntactic:"Adjective: Review the preceding paragraph before answering the question.",etymological:"From Latin praecedere, meaning to go before.",application:"Identify something that happens before another event. Use preceding in a complete sentence."},
    "K-MORPH-W1-L4":{phonological:"2 syllables: re-cess",orthographic:"Prefix re- + root cess.",morphological:"re- = back + cess = go. Recess originally described a withdrawal or pause; today it commonly means a break from work or class.",syntactic:"Noun: The class went outside for recess after math.",etymological:"From Latin recessus, meaning a going back, retreat, or pause.",application:"Explain how the modern meaning of recess connects to the idea of going back or pausing. Use recess in a complete sentence."},
    "I-MORPH-W5-L1":{phonological:"2 syllables: in-struct",morphological:"in- = into or upon + struct = build. To instruct is to teach or build knowledge."},
    "I-MORPH-W5-L2":{phonological:"4 syllables: re-con-struc-tion",morphological:"re- = again + construct = build + -ion = act or process. Reconstruction is the act of building again."},
    "I-MORPH-W5-L3":{phonological:"3 syllables: de-struc-tive"},
    "I-MORPH-W5-L4":{phonological:"3 syllables: in-stru-ment"}
  };
  D.morphology.forEach(row=>{if(lessons[row.id])Object.assign(row,lessons[row.id])});
})();

/* Day 26 live curriculum overrides: morphology video, Character Case Files, Quickwrite. */
(function(){
  const D=window.DRAGONSWOOD_DATA;
  if(!D||!Array.isArray(D.items))return;
  const yt="https://www.youtube.com/watch?v=60IcoXhBouU";
  const ytTitle="Introduction to Morphology (Prefixes, Suffixes, Root Words, and Base Words)";
  const q4=[
    {prompt:"What is morphology?",choices:["The study of meaningful parts of words","The study of punctuation marks","The study of story characters","The study of handwriting"],answer:"The study of meaningful parts of words"},
    {prompt:"Where is a prefix added?",choices:["At the beginning of a word","At the end of a word","In the middle of every word","Only after a suffix"],answer:"At the beginning of a word"},
    {prompt:"Where is a suffix added?",choices:["At the end of a word","At the beginning of a word","Before every prefix","Only inside a root"],answer:"At the end of a word"},
    {prompt:"Which word part usually carries the main meaning of a word?",choices:["The root or base","The punctuation","The capital letter","The sentence ending"],answer:"The root or base"},
    {prompt:"Why can breaking a word into parts help a reader?",choices:["It can help the reader figure out the word's meaning","It makes every word shorter","It removes the need to read the sentence","It changes the spelling automatically"],answer:"It can help the reader figure out the word's meaning"},
    {prompt:"If re- means again, what does reread most likely mean?",choices:["Read again","Stop reading","Read before","Read badly"],answer:"Read again"}
  ];
  const q5=[
    {prompt:"Which statement best describes morphology?",choices:["The study of meaningful word parts and how they combine","The study of sentence length only","The study of punctuation and capitalization","The study of how stories are organized"],answer:"The study of meaningful word parts and how they combine"},
    {prompt:"What is the main job of a prefix?",choices:["It is added before a base or root and changes meaning","It is added after a word and always changes tense","It replaces the root of a word","It tells where a sentence ends"],answer:"It is added before a base or root and changes meaning"},
    {prompt:"What is the main job of a suffix?",choices:["It is added after a base or root and can change meaning or function","It always comes before the base word","It has no effect on a word's meaning","It replaces every prefix"],answer:"It is added after a base or root and can change meaning or function"},
    {prompt:"Why is knowing a root or base useful when reading an unfamiliar word?",choices:["It gives the reader a clue to the word's core meaning","It tells the reader how many sentences are in the paragraph","It guarantees the word has only one meaning","It makes context unnecessary"],answer:"It gives the reader a clue to the word's core meaning"},
    {prompt:"A student breaks 'unhelpful' into un- + help + -ful. What is the student doing?",choices:["Using morphology to analyze meaningful word parts","Changing the word into a proper noun","Identifying punctuation","Finding the subject of a sentence"],answer:"Using morphology to analyze meaningful word parts"},
    {prompt:"If pre- means before and view means see, what does preview most likely mean?",choices:["See beforehand","See again","Not see","See badly"],answer:"See beforehand"},
    {prompt:"Which strategy best matches the lesson when you meet a difficult word?",choices:["Break it into meaningful parts and use each part to help determine meaning","Skip the word every time","Guess from the first letter only","Replace it with any familiar word"],answer:"Break it into meaningful parts and use each part to help determine meaning"},
    {prompt:"How can morphology help with academic vocabulary?",choices:["It helps readers use known word parts to unlock unfamiliar words","It eliminates the need to know word meanings","It only helps with one-syllable words","It works only for spelling names"],answer:"It helps readers use known word parts to unlock unfamiliar words"}
  ];
  const caseFile={
    id:"day26-missing-championship-banner-v1",
    title:"THE CHARACTER CASE FILES • THE MISSING CHAMPIONSHIP BANNER",
    report:[
      "At 2:48 p.m., the school's signed championship banner was hanging inside the locked trophy hallway display. At 3:12 p.m., the banner was gone.",
      "The glass display door was still locked and showed no damage. A fresh strip of blue painter's tape was beside the case, and the lower ventilation panel can be removed without opening the glass.",
      "A rolling art cart was parked beside the display at 3:05. One corner of the missing banner has a small silver paint smear. Build a theory from the timeline and evidence, not a guess."
    ],
    characters:[
      {id:"priya",name:"Priya Shah",role:"Student Council Photographer",color:"#4a67a1",questions:[
        {q:"When did you see the banner?",a:"I photographed the awards display from about 2:50 until 3:00. The banner was still there when I left."},
        {q:"Who arrived next?",a:"Mateo came through with the art cart just as I was leaving."},
        {q:"Did you touch the case?",a:"No. I only took pictures from the hallway side."}
      ]},
      {id:"mateo",name:"Mateo Ruiz",role:"Art Club Helper",color:"#8b5a2b",questions:[
        {q:"Why were you in the hallway?",a:"I rolled the art cart through around 3:03. One wheel got stuck beside the display, so I stopped for about a minute."},
        {q:"What was on the cart?",a:"Pep-rally supplies, blue painter's tape, and silver poster paint."},
        {q:"Did you open the display?",a:"No. I never opened the glass door."}
      ]},
      {id:"tessa",name:"Tessa Morgan",role:"Volleyball Team Manager",color:"#7d3d72",questions:[
        {q:"When were you in the hallway?",a:"Around 3:08. I was looking for Coach Reyes."},
        {q:"What did you notice?",a:"The art cart was still beside the display. I remember the lower panel looked slightly crooked."},
        {q:"Did you take the banner?",a:"No. I left through the gym doors a couple of minutes later."}
      ]}
    ],
    quiz:[
      {q:"Which clue most strongly suggests the banner could be removed without opening the glass door?",choices:["The removable lower ventilation panel","Priya's camera","The locked glass door","The gym doors"],correct:0,explain:"The removable lower panel provides another possible way to reach inside the display."},
      {q:"Which evidence connects Mateo's art supplies to the scene?",choices:["Blue painter's tape and silver paint match clues near the display and on the banner","Priya took photographs","Tessa looked for Coach Reyes","The case was locked"],correct:0,explain:"The tape and silver paint directly match physical clues from the scene."},
      {q:"Which statement is best supported by the evidence?",choices:["The glass door probably was not used","Priya definitely stole the banner","Tessa broke the case","The banner vanished before 2:50"],correct:0,explain:"The door stayed locked and undamaged, so another access point is more likely."},
      {q:"Who had the strongest combination of opportunity and matching physical evidence?",choices:["Mateo","Priya","Tessa","Coach Reyes"],correct:0,explain:"Mateo stopped beside the display with an art cart carrying both blue tape and silver paint, matching two scene clues."},
      {q:"What is the strongest theory?",choices:["Mateo likely used the removable lower panel while stopped with the art cart, and the tape/paint evidence connects his supplies to the removal","Priya broke the glass with her camera","Tessa opened the locked case with no key","The banner removed itself"],correct:0,explain:"That theory fits the access point, timeline, opportunity, and matching physical evidence."}
    ],
    applicationPrompt:"What most likely happened to the championship banner? Use at least two specific clues or statements as evidence, and explain why they support your conclusion."
  };
  const quickwrite=[
    {label:"Option 1 • The Locker That Wasn't There",prompt:"When you arrived at school, a new locker stood between lockers 214 and 215. Nobody else seemed able to see it. When you opened the door, a countdown started at 10:00. Continue the story.",finalEvent:"When you opened the door, a countdown started at 10:00.",keywords:["locker","school","countdown","door","hidden"]},
    {label:"Option 2 • The Last Bus",prompt:"You missed your usual bus after practice and climbed onto the only one left in the parking lot. The driver smiled and said, 'Good. You're the last one we were waiting for.' Continue the story.",finalEvent:"The driver said you were the last one they were waiting for.",keywords:["bus","practice","driver","waiting","parking lot"]}
  ];
  for(const grade of ["I","K"]){
    const fs=D.items.find(x=>x.id===`${grade}-HUM-D26-C1-A`)||D.items.find(x=>x.grade===grade&&Number(x.day)===26&&x.subject==="HUM"&&x.strand==="Foundational Skills");
    if(fs)Object.assign(fs,{displayTitle:"Foundational Skills • Morphology",requirement:"Foundational Skills\n\nWatch the morphology lesson, then answer the questions about prefixes, suffixes, root words, base words, and how word parts help you figure out meaning.",resourceName:ytTitle,resourceUrl:yt,resourceType:"video",videoRequired:true,videoDurationSeconds:337,kidIntro:"Morphology is the study of meaningful word parts. Watch for prefixes, suffixes, roots, and bases, then use those parts to unlock meaning.",lessonKeywords:["morphology","prefix","suffix","root","base word","word parts","meaning"],lessonQuestions:grade==="I"?q4:q5});
    const reading=D.items.find(x=>x.id===`${grade}-HUM-D26-C2-A`)||D.items.find(x=>x.grade===grade&&Number(x.day)===26&&x.subject==="HUM"&&x.strand==="Reading");
    if(reading)Object.assign(reading,{displayTitle:"The Character Case Files • The Missing Championship Banner",requirement:"Character Case Files\n\nRead the case, question the people of interest, study every clue, and decide what most likely happened. Your final theory must use evidence.",resourceName:"",resourceUrl:"",resourceType:"activity",videoRequired:false,videoDurationSeconds:0,additionalVideos:[],kidIntro:"Detectives do not guess. Build a theory that fits the timeline, physical evidence, and witness statements.",characterCase:caseFile,lessonQuestions:undefined,lessonContent:undefined,applicationPrompt:undefined});
    const writing=D.items.find(x=>x.id===`${grade}-HUM-D26-C3-A`)||D.items.find(x=>x.grade===grade&&Number(x.day)===26&&x.subject==="HUM"&&x.strand==="Writing");
    if(writing)Object.assign(writing,{displayTitle:"Writing • Quickwrite Choice",requirement:"Quickwrite Choice",resourceName:"",resourceUrl:"",resourceType:"activity",videoRequired:false,videoDurationSeconds:0,additionalVideos:[],quickWriteDirect:true,quickWriteSentenceRange:[grade==="I"?5:7,grade==="I"?5:7],quickWriteOptions:quickwrite.map(o=>({...o,prompt:`${o.prompt} Write exactly ${grade==="I"?5:7} complete sentences.`})),lessonQuestions:undefined,lessonContent:undefined,applicationPrompt:undefined});
  }
})();

/* v56.23 — load the no-video-only lesson engine. */
(function(){if(window.__DW_NO_VIDEO_ENGINE_LOADER__)return;window.__DW_NO_VIDEO_ENGINE_LOADER__=true;const s=document.createElement("script");s.src="q1-no-video-lessons.js?v=58.2.6";s.async=false;document.head.appendChild(s)})();

/* v56.24.4 — curriculum interaction layer. */
(function(){if(window.__DW_CURRICULUM_INTERACTION_LOADER__)return;window.__DW_CURRICULUM_INTERACTION_LOADER__=true;const s=document.createElement("script");s.src="q1-curriculum-interactions.js?v=56.24.5";s.async=false;document.head.appendChild(s)})();

/* v56.25.3 - answer-integrity policy. */
(function(){if(window.__DW_CURRICULUM_ANSWER_POLICY_LOADER__)return;window.__DW_CURRICULUM_ANSWER_POLICY_LOADER__=true;const s=document.createElement("script");s.src="q1-curriculum-answer-policy.js?v=56.25.4";s.async=false;document.head.appendChild(s)})();

/* v57.1.1 - Math auto-grading policy. */
(function(){if(window.__DW_MATH_AUTO_GRADING_LOADER__)return;window.__DW_MATH_AUTO_GRADING_LOADER__=true;const s=document.createElement("script");s.src="dragonswood-math-autograding.js?v=57.1.3";s.async=false;document.head.appendChild(s)})();