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

(function installDay26Curriculum(){
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
    id:"day26-missing-championship-banner-v3",
    title:"THE CHARACTER CASE FILES • THE MISSING CHAMPIONSHIP BANNER",
    report:[
      "At 2:48 p.m., the school's signed championship banner was hanging inside the locked trophy hallway display. At 3:12 p.m., the banner was gone.",
      "The glass display door was still locked and showed no damage. A fresh strip of blue painter's tape was beside the case, and the lower ventilation panel can be removed without opening the glass.",
      "A rolling art cart was parked beside the display at 3:05. One corner of the missing banner has a small silver paint smear. Build a theory from the timeline and evidence, not a guess."
    ],
    characters:[
      {id:"priya",name:"Priya Shah",role:"Student Council Photographer",color:"#4a67a1",image:"assets/character-case/priya.png",questions:[
        {q:"When did you first see the banner?",a:"I started photographing the awards display at about 2:50. The banner was definitely still inside the case then."},
        {q:"How long were you in the hallway?",a:"Until almost 3:00. I took photos from a few angles, but I never opened or touched the display."},
        {q:"Who did you see near the display?",a:"Mateo came through pushing the art cart just as I was leaving. I remember because the cart nearly bumped my camera bag."},
        {q:"Did anything look unusual?",a:"Not while I was there. The lower panel looked normal to me, and the banner was still hanging straight."}
      ]},
      {id:"mateo",name:"Mateo Ruiz",role:"Art Club Helper",color:"#8b5a2b",image:"assets/character-case/eli-chen.jpg",questions:[
        {q:"Why were you in the trophy hallway?",a:"I was moving the art cart from the art room to the gym for pep-rally decorating. I got there around 3:03."},
        {q:"Why did you stop beside the display?",a:"The front wheel caught on something near the case, so I stopped and pulled the cart backward for about a minute."},
        {q:"What supplies were on the cart?",a:"Poster board, blue painter's tape, brushes, and silver poster paint. We were making signs for the pep rally."},
        {q:"Did you touch the display or banner?",a:"I never opened the glass door. I did kneel down beside the cart to free the wheel, but I didn't take the banner."}
      ]},
      {id:"tessa",name:"Tessa Morgan",role:"Volleyball Team Manager",color:"#7d3d72",image:"assets/character-case/nia-brooks.jpg",questions:[
        {q:"When were you in the hallway?",a:"A little after 3:08. I was looking for Coach Reyes because I needed the equipment-room key."},
        {q:"What did you notice near the trophy display?",a:"The art cart was still parked close to it. The lower ventilation panel looked crooked, like one corner wasn't sitting flat."},
        {q:"Did you see the championship banner?",a:"I didn't really look through the glass. I was focused on finding Coach Reyes and left through the gym doors a couple minutes later."},
        {q:"Did you touch the cart or the display?",a:"No. I walked around the cart because it was partly blocking the hallway, but I didn't move anything."}
      ]}
    ],
    quiz:[
      {q:"Which clue most strongly suggests the banner could be removed without opening the glass door?",choices:["The removable lower ventilation panel","Priya's camera","The locked glass door","The gym doors"],correct:0,explain:"The removable lower panel provides another possible way to reach inside the display."},
      {q:"Which evidence connects Mateo's art supplies to the scene?",choices:["Blue painter's tape and silver paint match clues near the display and on the banner","Priya took photographs","Tessa looked for Coach Reyes","The case was locked"],correct:0,explain:"The tape and silver paint directly match physical clues from the scene."},
      {q:"Which witness gives evidence that the lower panel changed after Priya left?",choices:["Tessa","Priya","Coach Reyes","No one"],correct:0,explain:"Priya says the panel looked normal before 3:00, while Tessa later says it looked crooked."},
      {q:"Who had the strongest combination of opportunity and matching physical evidence?",choices:["Mateo","Priya","Tessa","Coach Reyes"],correct:0,explain:"Mateo stopped beside the display with supplies matching two scene clues during the key time window."},
      {q:"What is the strongest theory?",choices:["Mateo likely used the removable lower panel while stopped with the art cart, and the tape/paint evidence connects his supplies to the removal","Priya broke the glass with her camera","Tessa opened the locked case with no key","The banner removed itself"],correct:0,explain:"That theory best fits the access point, timeline, opportunity, and physical evidence."}
    ],
    applicationPrompt:"What most likely happened to the championship banner? Use at least two independent clues or interview statements as evidence, explain how they fit the timeline, and identify one clue that could mislead an investigator."
  };
  const quickwrite=[
    {label:"Option 1 • The Locker That Wasn't There",prompt:"When you arrived at school, a new locker stood between lockers 214 and 215. Nobody else seemed able to see it. When you opened the door, a countdown started at 10:00. Continue the story.",finalEvent:"When you opened the door, a countdown started at 10:00.",keywords:["locker","school","countdown","door","hidden"]},
    {label:"Option 2 • The Last Bus",prompt:"You missed your usual bus after practice and climbed onto the only one left in the parking lot. The driver smiled and said, 'Good. You're the last one we were waiting for.' Continue the story.",finalEvent:"The driver said you were the last one they were waiting for.",keywords:["bus","practice","driver","waiting","parking lot"]}
  ];

  function upsert(grade,strand,id){
    let item=D.items.find(x=>x.id===id)||D.items.find(x=>x.grade===grade&&Number(x.day)===26&&x.subject==="HUM"&&x.strand===strand);
    if(!item){
      item={id,grade,day:26,subject:"HUM",strand,requirement:"",resourceName:"",resourceUrl:"",resourceType:"activity"};
      D.items.push(item);
    }
    return item;
  }

  for(const grade of ["I","K"]){
    const fs=upsert(grade,"Foundational Skills",`${grade}-HUM-D26-C1-A`);
    Object.assign(fs,{displayTitle:"Foundational Skills • Morphology",requirement:"Foundational Skills\n\nWatch the morphology lesson, then answer the questions about prefixes, suffixes, root words, base words, and how word parts help you figure out meaning.",resourceName:ytTitle,resourceUrl:yt,resourceType:"video",videoRequired:true,videoDurationSeconds:337,kidIntro:"Morphology is the study of meaningful word parts. Watch for prefixes, suffixes, roots, and bases, then use those parts to unlock meaning.",lessonKeywords:["morphology","prefix","suffix","root","base word","word parts","meaning"],lessonQuestions:grade==="I"?q4:q5});

    const reading=upsert(grade,"Reading",`${grade}-HUM-D26-C2-A`);
    Object.assign(reading,{displayTitle:"The Character Case Files • The Missing Championship Banner",requirement:"Character Case Files\n\nRead the case, question the people of interest, study every clue, and decide what most likely happened. Your final theory must use evidence.",resourceName:"Fluency • Character Case Files",resourceUrl:"",resourceType:"activity",videoRequired:false,videoDurationSeconds:0,additionalVideos:[],kidIntro:"Detectives do not guess. Build a theory that fits the timeline, physical evidence, and witness statements.",characterCase:caseFile});
    delete reading.lessonQuestions; delete reading.lessonContent; delete reading.applicationPrompt;

    const writing=upsert(grade,"Writing",`${grade}-HUM-D26-C3-A`);
    const sentenceCount=grade==="I"?5:7;
    Object.assign(writing,{displayTitle:"Writing • Quickwrite Choice",requirement:`Quickwrite\n\nChoose ONE story starter and continue the story in exactly ${sentenceCount} complete sentences. Keep the story connected to the starter, add details, and make the events flow logically.`,resourceName:"",resourceUrl:"",resourceType:"activity",videoRequired:false,videoDurationSeconds:0,additionalVideos:[],quickWriteDirect:true,quickWriteSentenceRange:[sentenceCount,sentenceCount],quickWriteOptions:quickwrite,kidIntro:`Choose one story path and write exactly ${sentenceCount} complete sentences.`});
    delete writing.lessonQuestions; delete writing.lessonContent; delete writing.applicationPrompt;
  }
})();

(function installDay27Curriculum(){
  const D=window.DRAGONSWOOD_DATA;
  if(!D||!Array.isArray(D.items))return;

  const caseFile={
    id:"day27-vanishing-tournament-medal-v1",
    title:"THE CHARACTER CASE FILES • THE VANISHING TOURNAMENT MEDAL",
    report:[
      "At 10:06 a.m., the gold tournament medal was photographed inside the locked athletics display. At 10:31 a.m., Coach Reyes opened the case for an assembly and found the medal missing.",
      "The glass door was still locked and undamaged. A narrow maintenance slot sits behind the display. A folded blue program was found beneath the case, and a strip of clear tape was stuck to the back edge of the shelf.",
      "Three people were near the hallway during the twenty-five minute window. Interview them, compare their timelines, and decide which details are evidence and which are distractions."
    ],
    characters:[
      {id:"eli",name:"Eli Chen",role:"Student Photographer",color:"#314d8f",image:"assets/character-case/eli-chen.jpg",questions:[
        {q:"Why were you near the athletics display?",a:"I photographed the medal at 10:06 for the school news page. My photo shows it inside the case and the door fully closed."},
        {q:"Where did you go after the photo?",a:"I went straight to the media room. My camera uploaded files there at 10:11 and again at 10:18."},
        {q:"Did you leave anything behind?",a:"I dropped a folded blue assembly program while taking pictures. I realized it was missing later."},
        {q:"Did you touch the display?",a:"Only the outside glass when I leaned close for the photo. I never opened the case or reached behind it."}
      ]},
      {id:"nia",name:"Nia Brooks",role:"Library Media Specialist",color:"#7b365f",image:"assets/character-case/nia-brooks.jpg",questions:[
        {q:"When were you in the hallway?",a:"Around 10:20. I was delivering a box of assembly programs to the office and stopped to straighten the display sign."},
        {q:"What did you notice about the case?",a:"The glass door looked closed. I noticed a loose strip of clear tape hanging from the back edge of the shelf."},
        {q:"Did you see the medal?",a:"I could still see something gold through the glass, but the display sign partly blocked my view, so I cannot swear it was the medal."},
        {q:"Who else did you see?",a:"Omar was coming from the equipment hallway carrying a long poster tube. We passed each other near the display."}
      ]},
      {id:"omar",name:"Omar Haddad",role:"Student Council Treasurer",color:"#8a3f44",image:"assets/character-case/omar-haddad.jpg",questions:[
        {q:"Why were you carrying a poster tube?",a:"Student Council stored assembly banners in the equipment room. I picked up a long cardboard tube at about 10:22."},
        {q:"Did you stop near the medal display?",a:"Yes. The tube cap fell off beside the case, so I set the tube against the wall while I picked it up."},
        {q:"Could the tube fit through the maintenance slot?",a:"The empty tube is narrow enough, but I never put it through the slot. I only leaned it against the wall."},
        {q:"What happened after you left?",a:"I brought the tube to the gym. Coach Reyes saw me arrive around 10:28, and the banner was still rolled inside when we opened it."}
      ]}
    ],
    quiz:[
      {q:"Which evidence proves the medal was still in the display at 10:06?",choices:["Eli's time-stamped photograph","The blue program under the case","Omar's poster tube","The clear tape on the shelf"],correct:0,explain:"Eli's time-stamped photograph directly shows the medal inside the display at 10:06."},
      {q:"Why is the blue program probably a weak clue?",choices:["Eli admits dropping it while photographing the medal before it disappeared","It was hidden inside Omar's poster tube","Nia says she placed it behind the case","Coach Reyes wrote Omar's name on it"],correct:0,explain:"The program has an innocent explanation tied to Eli's earlier photograph and does not prove anyone removed the medal."},
      {q:"Which detail creates the strongest possible access route to the locked display?",choices:["The maintenance slot behind the case","The media-room upload","The assembly program","The display sign"],correct:0,explain:"The maintenance slot provides a way to reach behind the display without opening the locked glass door."},
      {q:"Which person had an object narrow enough to possibly reach through that slot?",choices:["Omar","Eli","Nia","Coach Reyes"],correct:0,explain:"Omar admits that the empty poster tube was narrow enough to fit through the maintenance slot."},
      {q:"Which conclusion is best supported by the evidence?",choices:["Omar had the strongest opportunity, but investigators still need evidence proving the tube actually touched or removed the medal","Eli definitely stole the medal because his program was on the floor","Nia definitely stole it because she noticed clear tape","The medal could only have been removed by unlocking the glass door"],correct:0,explain:"The evidence creates suspicion and opportunity around Omar, but a strong investigator separates possibility from proof."}
    ],
    applicationPrompt:"Who is the strongest person of interest in the missing-medal case? Use at least two independent clues or interview statements, explain the timeline, and clearly separate what the evidence proves from what it only suggests."
  };

  const quickwrite=[
    {label:"Option 1 • The Door Under the Bleachers",prompt:"After the last volleyball game, you noticed a small door beneath the lowest row of bleachers. It had never been there before. When you opened it, you heard a crowd cheering somewhere far below the gym. Continue the story.",finalEvent:"When you opened the door, you heard a crowd cheering somewhere far below the gym.",keywords:["volleyball","game","door","bleachers","gym","crowd","cheering","below"]},
    {label:"Option 2 • The Message in the Yearbook",prompt:"You opened an old school yearbook and found a handwritten message addressed to you even though the book was printed twenty years before you were born. The last line said, 'Do not let them ring the bell at noon.' Continue the story.",finalEvent:"The last line said, 'Do not let them ring the bell at noon.'",keywords:["yearbook","message","school","twenty years","born","bell","noon"]}
  ];

  for(const grade of ["I","K"]){
    const reading=D.items.find(x=>x.id===`${grade}-HUM-D27-C2-A`);
    if(reading){
      Object.assign(reading,{displayTitle:"The Character Case Files • The Vanishing Tournament Medal",requirement:"Character Case Files\n\nRead the case report, interview all three witnesses, compare the timeline and physical evidence, complete the evidence check, and submit your final case theory.",resourceName:"Fluency • Character Case Files",resourceUrl:"",resourceType:"activity",videoRequired:false,videoDurationSeconds:0,additionalVideos:[],kidIntro:"A good detective separates what the evidence proves from what it only suggests. Interview everyone before choosing a theory.",characterCase:caseFile});
      delete reading.lessonQuestions; delete reading.lessonContent; delete reading.applicationPrompt;
    }

    const writing=D.items.find(x=>x.id===`${grade}-HUM-D27-C3-A`);
    if(writing){
      const sentenceCount=grade==="I"?5:7;
      Object.assign(writing,{displayTitle:"Writing • Quickwrite Choice",requirement:`Quickwrite\n\nChoose ONE story starter and continue the story in exactly ${sentenceCount} complete sentences. Add details, keep the events connected, and make something meaningful happen next.`,resourceName:"",resourceUrl:"",resourceType:"activity",videoRequired:false,videoDurationSeconds:0,additionalVideos:[],quickWriteDirect:true,quickWriteSentenceRange:[sentenceCount,sentenceCount],quickWriteOptions:quickwrite,kidIntro:`Choose one story path and write exactly ${sentenceCount} complete sentences.`});
      delete writing.lessonQuestions; delete writing.lessonContent; delete writing.applicationPrompt;
    }
  }
})();

(function trimDay27ToCaseAndQuickwrite(){
  const D=window.DRAGONSWOOD_DATA;
  if(!D||!Array.isArray(D.items))return;
  const keep=new Set(["I-HUM-D27-C2-A","I-HUM-D27-C3-A","K-HUM-D27-C2-A","K-HUM-D27-C3-A"]);
  for(let i=D.items.length-1;i>=0;i--){
    const item=D.items[i];
    if(Number(item?.day)===27&&!keep.has(item.id))D.items.splice(i,1);
  }
})();

(function(){if(window.__DW_NO_VIDEO_ENGINE_LOADER__)return;window.__DW_NO_VIDEO_ENGINE_LOADER__=true;const s=document.createElement("script");s.src="q1-no-video-lessons.js?v=58.2.7";s.async=false;document.head.appendChild(s)})();
(function(){if(window.__DW_CURRICULUM_INTERACTION_LOADER__)return;window.__DW_CURRICULUM_INTERACTION_LOADER__=true;const s=document.createElement("script");s.src="q1-curriculum-interactions.js?v=56.24.5";s.async=false;document.head.appendChild(s)})();
(function(){if(window.__DW_CURRICULUM_ANSWER_POLICY_LOADER__)return;window.__DW_CURRICULUM_ANSWER_POLICY_LOADER__=true;const s=document.createElement("script");s.src="q1-curriculum-answer-policy.js?v=56.25.4";s.async=false;document.head.appendChild(s)})();
(function(){if(window.__DW_MATH_AUTO_GRADING_LOADER__)return;window.__DW_MATH_AUTO_GRADING_LOADER__=true;const s=document.createElement("script");s.src="dragonswood-math-autograding.js?v=57.1.3";s.async=false;document.head.appendChild(s)})();