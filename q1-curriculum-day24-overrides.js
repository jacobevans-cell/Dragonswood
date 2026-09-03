(function installDay24CurriculumOverrides(){
  "use strict";
  const data=window.DRAGONSWOOD_DATA;
  if(!data||!Array.isArray(data.items))return;

  const mediaBase="https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/Shared/ELA/";
  const characterVideo=mediaBase+"D24%20-%20Characters%20-%20Character%20Traits%20and%20Analysis.mp4";
  const conjunctionVideo=mediaBase+"D24%20-%20Conjunctions.mp4";

  const characterQuestions=[
    {prompt:"What is a character trait?",choices:["A word that describes what a character is like","The time and place in which a story happens","A problem that is solved at the end of a story","The exact words spoken by the narrator"],answer:"A word that describes what a character is like"},
    {prompt:"Which detail is an example of indirect characterization?",choices:["The author directly states that Mina is a generous person","The chapter title announces that Mina is a generous friend","Mina quietly gives her lunch to a classmate who forgot one","The narrator explains the meaning of generous in a glossary"],answer:"Mina quietly gives her lunch to a classmate who forgot one"},
    {prompt:"An author says directly, “Cal was impatient.” Which type of characterization is this?",choices:["Setting","Direct characterization","Indirect characterization","Point of view"],answer:"Direct characterization"},
    {prompt:"A character returns a lost wallet even though nobody is watching. Which trait is best supported?",choices:["Forgetful","Honest","Jealous","Careless"],answer:"Honest"},
    {prompt:"Which evidence would BEST support the claim that Tori is determined?",choices:["Tori carries a red backpack to practice each morning","Tori lives close enough to walk to school with friends","Tori keeps practicing after three failed attempts","Tori watches as her closest friend finishes first"],answer:"Tori keeps practicing after three failed attempts"},
    {prompt:"Why should readers examine a character's words, actions, and thoughts?",choices:["To count how many paragraphs are in the story","To infer traits and understand the character more deeply","To identify the story's font and page size","To prove that every character has the same personality"],answer:"To infer traits and understand the character more deeply"},
    {prompt:"At first, Eli hides whenever he must speak. Later, he volunteers to present the group's project. What does this change show?",choices:["Eli has become more confident","Eli has forgotten the project","Eli wants to leave the group","Eli has become less responsible"],answer:"Eli has become more confident"},
    {prompt:"Which response makes the strongest character analysis?",choices:["Nia is brave because she enters the cave to rescue her brother despite her fear","Nia is important because she appears in the cave during the story's final scene","The cave shapes the story because it is dark, rocky, and far away from town","Nia must have several positive traits because every main character has a personality"],answer:"Nia is brave because she enters the cave to rescue her brother despite her fear"}
  ];
  const characterLesson={
    displayTitle:"Reading • Character Traits & Analysis",
    requirement:"Characters: Character Traits and Character Analysis\n\nVideo:\nCharacters • Character Traits and Analysis\n\nMission:\nIdentify direct and indirect characterization, infer traits from a character's words, actions, and thoughts, and support an analysis with specific evidence.",
    resourceName:"Characters • Character Traits and Analysis",
    resourceUrl:characterVideo,
    resourceType:"video",
    videoRequired:true,
    videoDurationSeconds:176,
    kidIntro:"Watch how authors reveal characters directly and indirectly. Then use words, actions, thoughts, and changes as evidence for character traits.",
    lessonKeywords:["character","trait","analysis","direct characterization","indirect characterization","words","actions","thoughts","evidence","change"],
    lessonContent:{
      banner:"📖 CHARACTER DETECTIVE • TRAITS NEED EVIDENCE",
      keyIdea:"Direct characterization tells what a character is like. Indirect characterization shows the character's words, actions, thoughts, feelings, appearance, or effect on others so the reader can infer a trait.",
      vocabulary:[
        {term:"Character Trait",definition:"A word describing a character's personality or usual way of behaving."},
        {term:"Direct Characterization",definition:"When the author directly states what a character is like."},
        {term:"Indirect Characterization",definition:"When the author gives clues and the reader infers what a character is like."},
        {term:"Character Analysis",definition:"An explanation of a character supported by evidence from the story."},
        {term:"Evidence",definition:"A specific detail that supports an idea or conclusion."}
      ],
      exampleLabel:"Trait + evidence + reasoning",
      example:"Claim: Jalen is responsible. Evidence: He returns to feed the class pet without being reminded. Reasoning: Keeping a promise and caring for something that depends on him show responsibility.",
      rememberLabel:"Avoid the trait trap",
      remember:"Do not choose a trait because it merely sounds positive. Choose the trait best supported by what the character repeatedly says, thinks, does, or learns.",
      challengeLabel:"Track change",
      challenge:"Compare the character near the beginning and end. A meaningful change can reveal what the character learned and why it matters.",
      missionNote:"Watch → Notice clues → Infer a trait → Cite evidence → Explain"
    },
    lessonQuestions:characterQuestions
  };

  const conjunctionQuestions=[
    {prompt:"What does a conjunction do?",choices:["Joins words, phrases, or clauses","Names a person, place, thing, or idea","Replaces every verb in a sentence","Shows only where an action happened"],answer:"Joins words, phrases, or clauses"},
    {prompt:"Which list contains all seven coordinating conjunctions?",choices:["for, and, nor, but, or, yet, so","after, although, because, since, when, while, if","a, an, the, this, that, these, those","I, you, he, she, it, we, they"],answer:"for, and, nor, but, or, yet, so"},
    {prompt:"Choose the conjunction that best shows contrast: “The trail was steep, ___ we kept climbing.”",choices:["and","or","but","so"],answer:"but"},
    {prompt:"Choose the conjunction that best shows a result: “The rain became heavy, ___ the game was postponed.”",choices:["for","nor","yet","so"],answer:"so"},
    {prompt:"Which sentence correctly joins two complete ideas?",choices:["The dragon slept, because quietly beside the gate all night.","The dragon slept near the gate, and beside the stone wall.","The dragon slept near the gate, but the guards stayed alert.","The dragon near the gate, and the guards watched from towers."],answer:"The dragon slept near the gate, but the guards stayed alert."},
    {prompt:"In “Maya packed a flashlight and a map,” what does and join?",choices:["Two complete independent clauses","Two words naming items","A dependent clause and a title","Two unrelated paragraphs"],answer:"Two words naming items"},
    {prompt:"Which sentence uses a comma correctly with a coordinating conjunction?",choices:["I wanted to explore but, the gate was locked.","I wanted, to explore but the gate was locked.","I wanted to explore, but the gate was locked.","I wanted to explore but the gate, was locked."],answer:"I wanted to explore, but the gate was locked."},
    {prompt:"Why is a comma needed in “The lantern flickered, yet it did not go out”?",choices:["Yet joins two complete independent clauses","Every conjunction must always have a comma","The comma separates a noun from its adjective","Yet begins a list of three or more items"],answer:"Yet joins two complete independent clauses"}
  ];
  const conjunctionLesson={
    displayTitle:"Writing • Conjunctions & Compound Sentences",
    requirement:"Conjunctions\n\nVideo:\nConjunctions • FANBOYS\n\nMission:\nUse coordinating conjunctions to show addition, contrast, choice, reason, and result. Correctly join two independent clauses with a comma and a FANBOYS conjunction.",
    resourceName:"Conjunctions • FANBOYS",
    resourceUrl:conjunctionVideo,
    resourceType:"video",
    videoRequired:true,
    videoDurationSeconds:176,
    kidIntro:"Meet the FANBOYS conjunctions and learn the relationship each one creates. Then join complete ideas with meaning and correct punctuation.",
    lessonKeywords:["conjunction","coordinating conjunction","FANBOYS","compound sentence","independent clause","comma","addition","contrast","choice","reason","result"],
    lessonContent:{
      banner:"🔨 SENTENCE FORGE • CONNECT IDEAS WITH FANBOYS",
      keyIdea:"Conjunctions connect ideas. FANBOYS—For, And, Nor, But, Or, Yet, So—are coordinating conjunctions. When one joins two independent clauses, place a comma before it.",
      vocabulary:[
        {term:"Conjunction",definition:"A word used to connect words, phrases, or clauses."},
        {term:"Coordinating Conjunction",definition:"A conjunction joining grammatical parts of equal importance."},
        {term:"FANBOYS",definition:"A memory tool for for, and, nor, but, or, yet, and so."},
        {term:"Independent Clause",definition:"A group of words with a subject and verb that expresses a complete thought."},
        {term:"Compound Sentence",definition:"Two independent clauses joined correctly with a comma and coordinating conjunction."}
      ],
      exampleLabel:"Two complete ideas",
      example:"The gates were closing, so the travelers hurried. “So” shows a result, and both sides can stand alone as sentences.",
      rememberLabel:"Comma test",
      remember:"Use a comma before FANBOYS when both sides are complete ideas. Do not automatically add a comma when the conjunction joins only two words or phrases.",
      challengeLabel:"Choose by meaning",
      challenge:"Do not select a conjunction only because it fits grammatically. Decide whether the relationship is addition, contrast, choice, reason, negative choice, or result.",
      missionNote:"Watch → Name the relationship → Check both clauses → Join and punctuate"
    },
    lessonQuestions:conjunctionQuestions
  };

  for(const grade of ["I","K"]){
    const reading=data.items.find(item=>item.id===`${grade}-HUM-D24-PACING-VIDEO`);
    if(reading)Object.assign(reading,characterLesson,{
      applicationPrompt:grade==="I"
        ?"In 4–5 complete sentences, identify one trait of a character from a story you know. Describe one specific action, word, or thought as evidence and explain how it proves the trait."
        :"In 5–6 complete sentences, analyze a character from a story you know. State a precise trait, cite two specific pieces of evidence from the character's words, actions, or thoughts, and explain what the evidence reveals or how the character changes."
    });
    const writing=data.items.find(item=>item.id===`${grade}-HUM-D24-C3-A`);
    if(writing)Object.assign(writing,conjunctionLesson,{
      applicationPrompt:grade==="I"
        ?"Write 4 original compound sentences. Use a different FANBOYS conjunction in each sentence. Underline or capitalize each conjunction, and use a comma before it."
        :"Write 5 original compound sentences using at least four different FANBOYS conjunctions. Each side must be an independent clause. Then choose one sentence and explain the relationship its conjunction creates."
    });
  }
})();
