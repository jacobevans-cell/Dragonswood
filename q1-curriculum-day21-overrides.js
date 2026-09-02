(function installDay21CurriculumOverrides(){
  "use strict";
  const data=window.DRAGONSWOOD_DATA;
  if(!data||!Array.isArray(data.items))return;

  const spectacular=data.items.find(item=>item.id==="I-HUM-D21-C1-A");
  if(spectacular)Object.assign(spectacular,{
    resourceName:"Spectacular • 4th Grade Word Study Video",
    resourceUrl:"https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Morphology/D21%20-%20Spectacular%20Meaning.mp4",
    resourceType:"video",
    videoDurationSeconds:70
  });

  const publishQuickwrites={
    "I-HUM-D21-C3-A":{
      quickWriteSentenceRange:[3,5],
      quickWriteOptions:[
        {
          label:"Option 1 • The Secret Scoreboard",
          prompt:"During the championship game, the scoreboard suddenly displayed a secret map instead of the score. Then the team mascot pointed toward a locked tunnel beneath the bleachers. Continue the story.",
          finalEvent:"Then the team mascot pointed toward a locked tunnel beneath the bleachers.",
          keywords:["championship","game","scoreboard","map","score","team","mascot","tunnel","bleachers","locked"]
        },
        {
          label:"Option 2 • The Moonlight Kingdom",
          prompt:"A silver fox wearing a tiny crown appeared beside the costume rack and whispered, “The Moonlight Kingdom has lost its princess—and only you can find her.” Continue the story.",
          finalEvent:"A silver fox wearing a tiny crown appeared beside the costume rack and whispered, “The Moonlight Kingdom has lost its princess—and only you can find her.”",
          keywords:["silver fox","fox","crown","costume","moonlight","kingdom","princess","find","whisper","magic"]
        }
      ]
    },
    "K-HUM-D21-C3-A":{
      quickWriteSentenceRange:[5,7],
      quickWriteOptions:[
        {
          label:"Option 1 • The Compass in the Handlebars",
          prompt:"During a mountain-bike race, Kai’s handlebars opened to reveal a glowing compass. It pointed away from the finish line and toward an abandoned research station. Continue the story.",
          finalEvent:"It pointed away from the finish line and toward an abandoned research station.",
          keywords:["mountain","bike","race","kai","handlebars","compass","finish","abandoned","research station","glowing"]
        },
        {
          label:"Option 2 • The Crystal Locket",
          prompt:"While preparing for the school dance, Ava found a crystal locket inside an old costume box. When she opened it, the ballroom in the mirror filled with people who had disappeared one hundred years ago. Continue the story.",
          finalEvent:"When she opened it, the ballroom in the mirror filled with people who had disappeared one hundred years ago.",
          keywords:["dance","ava","crystal","locket","costume","mirror","ballroom","disappeared","past","hundred years"]
        }
      ]
    },
    "I-HUM-D22-C3-A":{
      quickWriteDirect:true,
      quickWriteSentenceRange:[5,5],
      quickWriteOptions:[
        {
          label:"Option 1 • The Hidden Level",
          prompt:"During the final round of a school gaming tournament, Kai’s screen suddenly showed a hidden level that was not part of the game. A message appeared: “Win this level before the timer reaches zero, or your entire school will disappear.” Continue the story.",
          finalEvent:"A message appeared: “Win this level before the timer reaches zero, or your entire school will disappear.”",
          keywords:["gaming","tournament","kai","screen","hidden level","game","message","timer","school","disappear","level"]
        },
        {
          label:"Option 2 • The Dragon’s Bracelet",
          prompt:"While helping backstage at the school play, Ava found a silver bracelet shaped like a tiny dragon. The moment she put it on, the dragon opened its eyes and whispered, “They finally found us.” Continue the story.",
          finalEvent:"The moment she put it on, the dragon opened its eyes and whispered, “They finally found us.”",
          keywords:["backstage","school play","ava","silver","bracelet","dragon","eyes","whispered","found","us"]
        }
      ]
    },
    "K-HUM-D22-C3-A":{
      quickWriteDirect:true,
      quickWriteSentenceRange:[7,7],
      quickWriteOptions:[
        {
          label:"Option 1 • The Hidden Level",
          prompt:"During the final round of a school gaming tournament, Kai’s screen suddenly showed a hidden level that was not part of the game. A message appeared: “Win this level before the timer reaches zero, or your entire school will disappear.” Continue the story.",
          finalEvent:"A message appeared: “Win this level before the timer reaches zero, or your entire school will disappear.”",
          keywords:["gaming","tournament","kai","screen","hidden level","game","message","timer","school","disappear","level"]
        },
        {
          label:"Option 2 • The Dragon’s Bracelet",
          prompt:"While helping backstage at the school play, Ava found a silver bracelet shaped like a tiny dragon. The moment she put it on, the dragon opened its eyes and whispered, “They finally found us.” Continue the story.",
          finalEvent:"The moment she put it on, the dragon opened its eyes and whispered, “They finally found us.”",
          keywords:["backstage","school play","ava","silver","bracelet","dragon","eyes","whispered","found","us"]
        }
      ]
    }
  };
  for(const [id,override] of Object.entries(publishQuickwrites)){
    const item=data.items.find(row=>row.id===id);
    if(item)Object.assign(item,override);
  }

  const theoNinaPassage="Theo sat alone on the bench by the fence, at the far edge of the school garden. He had a shoebox full of tiny gears, wires, and bottle caps, and he was carefully building a little robot out of the pieces. Across the field, the other kids were laughing and racing each other in a game of kickball. Theo watched the ball fly past, wishing he could feel that easy and loud, but his hands stayed still on his robot, and he felt like he was watching everything through a window.\n\nA girl named Nina wandered over from the kickball game. Nina was quick and a little clumsy, and she had grass stains on both knees from sliding into home plate.\n\n\"Whoa,\" she said, crouching down. \"Is that a robot? Are you going to play kickball with us?\"\n\nTheo shook his head. \"I like building things. I'm not very good at kicking.\"\n\n\"That's fine,\" Nina said, shrugging. \"I'm not very good at building. Everything I make falls apart. But it's still fun to try.\"\n\nShe pointed back at the field. \"We actually need one more player for second base. Come on — I'll stand next to you the whole time.\"\n\nTheo paused. He looked down at his half-finished robot, then up at Nina's eager, dirt-smudged grin. He set the shoebox on the bench. \"Okay,\" he said quietly.\n\nNina cheered and pulled him up by the sleeve. They jogged together to second base. Theo missed the first ball that came his way, but he didn't care much. When the game ended, they walked back to the bench together.\n\n\"You're really quick, Nina,\" Theo said, catching his breath.\n\n\"And you're really clever, Theo,\" she replied. \"Maybe you can build me a tiny robot of my own sometime. And I can teach you how to catch a pop fly.\"\n\nThey both smiled. Theo knew that he liked quiet, careful things, and Nina liked fast, loud things — but he also knew that didn't matter nearly as much as he'd thought. What mattered was that Nina had noticed him, and had made him feel like he belonged. From that afternoon on, Theo and Nina ate lunch together almost every day, trading half a sandwich for a spare gear whenever they could.";
  const themeQuestions=[
  {
    "prompt": "Which statement best explains the difference between a summary and a theme?",
    "choices": [
      "A summary retells the key events, while a theme states a universal message the events reveal",
      "A summary explains the author's opinion, while a theme lists every event in exact order",
      "A summary names one broad topic, while a theme describes only what the main character did",
      "A summary and a theme both retell the same events, but a theme always uses fewer words"
    ],
    "answer": "A summary retells the key events, while a theme states a universal message the events reveal"
  },
  {
    "prompt": "Which choice is the best summary of Theo and Nina?",
    "choices": [
      "Theo builds a robot alone, Nina invites him to play kickball, and their willingness to share their different strengths begins a friendship",
      "Nina wins a kickball game, Theo completes a robot, and the two students receive prizes for being the best players at school",
      "Theo refuses to speak to Nina, hides his robot from her, and decides that people with different interests cannot become friends",
      "Nina asks Theo to repair the kickball equipment, but he leaves the garden before the other students finish their game"
    ],
    "answer": "Theo builds a robot alone, Nina invites him to play kickball, and their willingness to share their different strengths begins a friendship"
  },
  {
    "prompt": "Which action by Nina most clearly helps Theo begin to feel that he belongs?",
    "choices": [
      "She notices Theo, invites him to join the game, and promises to stand beside him",
      "She tells Theo that kickball is more important than building small robots",
      "She takes Theo's unfinished robot and carries it onto the kickball field",
      "She asks the other players to end the game before Theo reaches second base"
    ],
    "answer": "She notices Theo, invites him to join the game, and promises to stand beside him"
  },
  {
    "prompt": "Which statement expresses a universal theme of Theo and Nina?",
    "choices": [
      "A small act of inclusion can help someone feel that they truly belong",
      "Theo should practice catching a pop fly before returning to second base",
      "Nina has grass stains because she slid into home plate during kickball",
      "Building a tiny robot requires gears, wires, bottle caps, and a shoebox"
    ],
    "answer": "A small act of inclusion can help someone feel that they truly belong"
  },
  {
    "prompt": "Which evidence best supports the theme that friendship can grow when people value one another's differences?",
    "choices": [
      "Theo praises Nina's speed, Nina praises Theo's cleverness, and they offer to teach each other",
      "Theo keeps the half-finished robot inside a shoebox at the edge of the garden while the kickball game continues across the field",
      "Nina has grass stains on both knees because she slid during the kickball game",
      "The kickball flies past the bench while the other students laugh across the field"
    ],
    "answer": "Theo praises Nina's speed, Nina praises Theo's cleverness, and they offer to teach each other"
  },
  {
    "prompt": "Why is the word belonging by itself not a complete theme statement?",
    "choices": [
      "It names a topic but does not communicate a universal message about that topic",
      "It summarizes every important event but does not identify the main character",
      "It gives too much evidence from the story and includes unnecessary dialogue",
      "It can apply only to Theo and cannot be connected to any other person or story"
    ],
    "answer": "It names a topic but does not communicate a universal message about that topic"
  },
  {
    "prompt": "Why is sharing with those who need it a theme rather than a summary of Robin Hood or Pip's actions?",
    "choices": [
      "It is a universal message that can apply beyond the characters and events in one story",
      "It retells all the important actions in the exact order that they happened in the story",
      "It identifies where Robin Hood lived and explains which character appeared in each scene",
      "It describes only Pip's movements and does not communicate an idea about life or people"
    ],
    "answer": "It is a universal message that can apply beyond the characters and events in one story"
  },
  {
    "prompt": "Which sentence is a theme rather than a summary?",
    "choices": [
      "People can build friendship by noticing others and making room for them",
      "Nina walks from the kickball field to the bench and asks about Theo's robot",
      "Theo sets down his shoebox, joins Nina at second base, and misses the first ball",
      "After the game, Theo and Nina return to the bench and discuss their different skills"
    ],
    "answer": "People can build friendship by noticing others and making room for them"
  }
];
  const themeLessonBase={
    displayTitle:"Theme Detective: Summary vs. Theme",
    requirement:"Theme Detective: Summary vs. Theme\n\nVideo:\nPip Hood and the Universal Message • Determining Theme\n\nReading:\nTheo and Nina\n\nVocabulary:\nTheme, Summary, Universal Message, Character, Generosity\n\nMission:\nWatch the lesson, read Theo and Nina, complete the theme check, and support a universal theme with evidence.",
    resourceName:"Pip Hood and the Universal Message • Determining Theme",
    resourceUrl:"https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/Shared/ELA/D22%20-%20Pip%20Hood%20and%20the%20Universal%20Message%20Determining%20the%20Theme.mp4",
    resourceType:"video",
    videoDurationSeconds:175,
    readingThemeMission:true,
    readingPassage:theoNinaPassage,
    sourceExcerpt:"Theo sits alone building a robot while other children play kickball, wishing he could join them. Nina notices him, asks about his robot, invites him to play, and promises to stand beside him. Theo joins even though he misses the first ball. Afterward, they praise each other's different strengths and agree to teach one another. Theo realizes their differences matter less than Nina making him feel that he belongs, and they begin eating lunch together almost every day.",
    kidIntro:"Watch Pip show the difference between a summary and a theme. Then read Theo and Nina, trace what the characters do and learn, and turn those details into a universal message.",
    lessonKeywords:["theme","summary","universal message","character","generosity","belonging","inclusion","friendship","evidence","dialogue"],
    lessonContent:{
      banner:"📚 THEME DETECTIVE • SUMMARY OR UNIVERSAL MESSAGE?",
      keyIdea:"A summary tells the most important events in order. A theme states a universal message about life or people that the story's events, dialogue, and character changes reveal.",
      vocabulary:[
        {term:"Theme",definition:"The important message or lesson a story shows about life or people."},
        {term:"Summary",definition:"A short retelling of the most important events in a story in order."},
        {term:"Universal Message",definition:"A lesson from a story that can be true for many people, not just the characters."},
        {term:"Character",definition:"A person or animal in a story."},
        {term:"Generosity",definition:"The quality of being kind and willing to share what you have."}
      ],
      readingTitle:"Read: Theo and Nina",
      readingPassage:theoNinaPassage,
      exampleLabel:"Summary versus theme",
      example:"Summary: Nina notices Theo sitting alone, invites him to play, and they become friends. Theme: Including someone who feels left out can help that person feel that they belong.",
      rememberLabel:"Theme test",
      remember:"A theme is not one word, a character's name, or a list of events. It is a complete message that the story supports and that could apply to people outside the story.",
      challengeLabel:"Look for evidence",
      challenge:"As you read, notice what Theo wants, what prevents him from joining in, what Nina does, and what Theo understands by the end.",
      missionNote:"Watch → Read → Summarize → Determine the theme"
    },
    lessonQuestions:themeQuestions
  };
  const grade4Theme=data.items.find(item=>item.id==="I-HUM-D22-C1-A");
  if(grade4Theme)Object.assign(grade4Theme,themeLessonBase,{
    applicationPrompt:"In 3–4 complete sentences, state one theme of Theo and Nina. Use two specific actions or lines of dialogue as evidence, then explain how the theme could apply outside this story."
  });
  const grade5Theme=data.items.find(item=>item.id==="K-HUM-D22-C1-A");
  if(grade5Theme)Object.assign(grade5Theme,themeLessonBase,{
    applicationPrompt:"In 4–5 complete sentences, write a universal theme statement for Theo and Nina. Use two specific pieces of dialogue or character action, explain how they develop the theme, and distinguish your theme from a summary."
  });

  const plantLifeCycle=data.items.find(item=>item.id==="K-Science-D22-C3-A");
  if(plantLifeCycle)Object.assign(plantLifeCycle,{
    displayTitle:"Plant Growth & Life Cycle Challenge",
    requirement:"Plant Growth & Life Cycle Challenge\n\nVideo:\nThe Amazing Plant Life Cycle • From Seed to Flower\n\nKey Ideas:\nGermination, plant structures, pollination, fertilization, photosynthesis, seed formation, and seed dispersal\n\nChallenge:\nWatch the full lesson, then use evidence from the video to complete the eight-question Plant Growth Challenge Quiz.",
    resourceName:"The Amazing Plant Life Cycle • From Seed to Flower",
    resourceUrl:"https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/K%20-%205th/Science/D22%20-%20The%20Amazing%20Plant%20Life%20Cycle%20-%20From%20Seed%20to%20Flower.mp4",
    resourceType:"video",
    videoDurationSeconds:648,
    kidIntro:"Follow a flowering plant from seed to flower. Watch for the conditions seeds need, the jobs of roots, stems, leaves, and flowers, and how pollination leads to new seeds.",
    applicationPrompt:"Choose one stage in a flowering plant's life cycle. Explain what happens during that stage, what the plant needs, and how the stage helps the life cycle continue.",
    lessonKeywords:["plant","seed","germination","seedling","roots","stem","leaves","flower","pollination","fertilization","photosynthesis","sunlight","dispersal"],
    lessonContent:{
      banner:"🌱 PLANT GROWTH CHALLENGE • FROM SEED TO FLOWER",
      keyIdea:"A flowering plant's life cycle moves from seed to germination, seedling, adult plant, flower, fertilization, and new seed formation. Each structure has a job that helps the plant survive and reproduce.",
      vocabulary:[
        {term:"Germination",definition:"The process in which a seed begins to sprout and grow."},
        {term:"Seedling",definition:"A young plant with developing roots, a stem, and small leaves."},
        {term:"Pollination",definition:"The transfer of pollen to a flower's stigma."},
        {term:"Fertilization",definition:"When a pollen cell joins with an egg so a new seed can begin forming."},
        {term:"Photosynthesis",definition:"The process plants use to make food from sunlight, water, and carbon dioxide."},
        {term:"Seed Dispersal",definition:"The movement of seeds away from the parent plant by wind, water, animals, or other methods."}
      ],
      exampleLabel:"Trace the process",
      example:"A seed floats downstream and lands on a warm, moist bank. Water enters the seed coat, the embryo begins growing, the first root pushes downward, and a shoot grows upward. Dispersal happened first; germination happened after the seed reached suitable conditions.",
      rememberLabel:"Do not mix these up",
      remember:"Pollination moves pollen to the stigma. Fertilization happens later, when a cell from the pollen joins an egg inside an ovule. The fertilized ovule then develops into a seed, while the flower's ovary may develop into fruit.",
      challengeLabel:"Make a prediction",
      challenge:"A plant has healthy roots, stems, and leaves but receives very few insect visits. Predict which part of its life cycle will be affected most, and explain why it may produce fewer seeds.",
      missionNote:"Watch → Trace each stage → Use evidence"
    },
    lessonQuestions:[
      {prompt:"Four seeds are placed in different conditions. Which seed is most likely to germinate successfully?",choices:["A dry seed in a warm, brightly lit open container","A moist seed in a warm, dark, open container","A moist seed in a cold, open container","A moist seed in a warm, sealed container"],answer:"A moist seed in a warm, dark, open container"},
      {prompt:"A plant's stem becomes blocked and can no longer perform its main function. What will most likely happen first?",choices:["Its flowers will immediately produce more pollen","Its roots will stop holding the plant in place","Its seeds will change from dicots into monocots","Its leaves will receive less water from the roots"],answer:"Its leaves will receive less water from the roots"},
      {prompt:"Pollen reaches a flower's stigma but never joins with an egg. Which statement correctly describes what occurred?",choices:["Pollination occurred, but fertilization did not","Fertilization occurred, but pollination did not","Germination occurred before the pollen arrived","Seed dispersal occurred without fertilization"],answer:"Pollination occurred, but fertilization did not"},
      {prompt:"What should happen directly after successful fertilization in a flower?",choices:["The seed immediately grows its first leaves","The plant changes into a non-flowering plant","A new seed begins forming inside the flower","Pollen moves from the stigma to the anther"],answer:"A new seed begins forming inside the flower"},
      {prompt:"Two identical plants receive equal amounts of water and carbon dioxide. One plant's leaves are covered so that sunlight cannot reach them. What is the most likely result?",choices:["The covered plant will make additional pollen","The covered plant will germinate a second time","Both plants will make equal amounts of food","The covered plant will make less food than the other"],answer:"The covered plant will make less food than the other"},
      {prompt:"A seed falls into a stream, floats several miles, and later begins growing along the bank. Which two processes occurred in order?",choices:["Water dispersal followed by germination","Fertilization followed by pollination","Photosynthesis followed by seed formation","Germination followed by animal dispersal"],answer:"Water dispersal followed by germination"},
      {prompt:"A flowering plant normally depends on insects for pollination. If its colorful petals are removed, what is the most reasonable prediction?",choices:["Its roots will stop absorbing water from the soil","Its seeds will automatically travel through water","Fewer insects may visit, so fewer seeds may form","Its stem will begin producing pollen instead"],answer:"Fewer insects may visit, so fewer seeds may form"},
      {prompt:"A student discovers a young plant with small leaves and developing roots but no flowers. Which conclusion is best supported?",choices:["It is already an adult flowering plant","It has germinated and is now a seedling","It is a seed waiting for enough oxygen","It has completed its entire life cycle"],answer:"It has germinated and is now a seedling"}
    ]
  });

  const collisions=data.items.find(item=>item.id==="I-Science-D21-C3-A");
  if(!collisions)return;

  Object.assign(collisions,{
    displayTitle:"Collision Lab: Energy Transfer",
    requirement:"Collision Lab: Energy Transfer\n\nVideo:\nGeneration Genius • Collisions & Energy Transfer\n\nVocabulary:\nEnergy, Rube Goldberg Machine, Energy Transfer, Collision, Contact, Stationary Object\n\nIn Class:\nWatch the collision investigation, complete the energy-transfer check, then design a three-step Rube Goldberg chain reaction.",
    resourceName:"Collisions & Energy Transfer • School-Authorized Video",
    resourceUrl:"https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Science/D21%20-%20Collisions%20School%20Authorized.mp4",
    resourceType:"video",
    videoDurationSeconds:686,
    kidIntro:"Watch how collisions transfer energy. Then use speed, weight, contact, and motion evidence to explain what happens during a collision.",
    applicationPrompt:"Design a three-step Rube Goldberg machine that completes one simple task. Name the objects that collide at each step and explain how energy transfers from one object to the next.",
    lessonKeywords:["energy","transfer","collision","contact","speed","weight","moving","stationary","sound","heat","rube goldberg"],
    lessonContent:{
      banner:"⚡ COLLISION LAB • ENERGY IN MOTION",
      keyIdea:"A collision happens when one object runs into another. At contact, energy transfers from one object to the other and can change an object's motion.",
      vocabulary:[
        {term:"Energy",definition:"The ability to do work or make things happen."},
        {term:"Rube Goldberg Machine",definition:"A complex contraption that uses many steps to perform one simple task."},
        {term:"Energy Transfer",definition:"Energy moving from one object to another during contact or a collision."},
        {term:"Collision",definition:"When one object runs into another object."},
        {term:"Contact",definition:"When two objects touch each other."},
        {term:"Stationary Object",definition:"An object that is not moving."}
      ],
      example:"A moving bowling ball collides with stationary pins. At contact, energy transfers from the ball to the pins, causing the pins to move.",
      exampleLabel:"Collision example",
      remember:"Faster or heavier moving objects can transfer more energy. During collisions, some energy may also become sound and heat.",
      challenge:"Collision Detective: Identify the moving object, the object receiving energy, the moment of contact, and the evidence that energy transferred.",
      missionNote:"Watch → Investigate → Explain the energy transfer"
    },
    lessonQuestions:[
      {prompt:"What is energy?",choices:["The ability to make things happen","The place where moving objects stop","The weight of a stationary object","The empty space between two objects"],answer:"The ability to make things happen"},
      {prompt:"At what moment does energy transfer during a collision?",choices:["When the objects make contact","Before either object starts moving","After the objects are far apart","Only when both objects stop moving"],answer:"When the objects make contact"},
      {prompt:"Which description best defines a collision?",choices:["One object runs into another object","Two objects remain far from each other","One object stays still without contact","Two objects have the same exact weight"],answer:"One object runs into another object"},
      {prompt:"If the same object moves faster before a collision, what usually happens?",choices:["It can transfer more energy","It can transfer less energy","It transfers the same energy every time","It cannot transfer any energy"],answer:"It can transfer more energy"},
      {prompt:"If two objects move at the same speed, which can usually transfer more energy?",choices:["The heavier moving object","The lighter moving object","The object with the brighter color","The object farthest from contact"],answer:"The heavier moving object"},
      {prompt:"What is a stationary object?",choices:["An object that is not moving","An object that is moving quickly","An object that is changing color","An object that is making sound"],answer:"An object that is not moving"},
      {prompt:"How does a Rube Goldberg machine complete a task?",choices:["A chain of collisions transfers energy through many steps","A single object completes every step without contact","All objects remain stationary during the entire task","Energy disappears before the final step of the task"],answer:"A chain of collisions transfers energy through many steps"},
      {prompt:"What can some collision energy change into?",choices:["Sound and heat","Only empty space","Color and weight","Nothing at all"],answer:"Sound and heat"}
    ]
  });
})();


/* Day 23 five-mission restoration: harder Character Case + grade-level Quickwrite. */
(function(){
  const D=window.DRAGONSWOOD_DATA;if(!D?.items)return;
  const sharedCase={"id":"midnight-map-v2","title":"CASE 02 • THE VANISHED MIDNIGHT MAP","report":["A rare hand-drawn map disappeared from the library history display between 3:24 and 3:42 p.m.","The display latch was not forced. A ceiling pipe had begun dripping above the case, and the custodian announced the leak over the intercom at 3:24.","A red hoodie, a blue poster tube, a cracked coffee lid, and several overlapping timelines may matter—but some clues may be distractions."],"characters":[{"id":"coach","name":"Coach Reyes","role":"P.E. Teacher","color":"#7fb3d5","image":"assets/character-case/coach-reyes.png","questions":[{"q":"Where were you during the leak announcement?","a":"I was grading in my office. After the 3:24 announcement, I checked the gym hallway for water and returned before 3:40."},{"q":"Did you carry anything into the hallway?","a":"I had used a blue poster tube earlier for old team schedules. I thought I left it beside my filing cabinet."},{"q":"Did anything unusual happen in your office?","a":"My coffee lid cracked around 3:20, so I threw it away and wiped my desk. I did not return to the library after 3:40."}]},{"id":"janitor","name":"Mr. Okafor","role":"Custodian","color":"#e0a83a","image":"assets/character-case/mr-okafor.png","questions":[{"q":"What did you observe at the display?","a":"At 3:24 the map was still inside. I placed a wet-floor sign nearby and went to shut off the pipe."},{"q":"Did you see anyone in the hallway afterward?","a":"At about 3:34 I saw an adult-sized person leave the library hall carrying a long blue tube. I could not see the person's face."},{"q":"What other clue did you notice?","a":"A red debate hoodie hung near the equipment closet, but it had a lost-and-found tag and no one was wearing it."}]},{"id":"priya","name":"Priya N.","role":"Class President","color":"#c9789a","image":"assets/character-case/priya.png","questions":[{"q":"Where were you between 3:24 and 3:42?","a":"I checked out a research book in the library at 3:32. The librarian stamped my slip, then I went to student council."},{"q":"What did you see near the display?","a":"The map was still inside when my book was stamped. When I passed again around 3:42, the display was empty."},{"q":"Did anything else stand out?","a":"A blue poster tube was leaning just inside Coach Reyes's office doorway. One end looked damp, but I never opened it."}]}],"quiz":[{"q":"Which evidence most clearly shows that the map disappeared after 3:32?","choices":["Priya saw it inside the display when her book was stamped at 3:32","Coach Reyes cracked a coffee lid around 3:20","A red hoodie had a lost-and-found tag","The custodian announced the leak at 3:24"],"correct":0,"explain":"Priya's stamped checkout time supports her statement that the map remained in the case at 3:32."},{"q":"Why is the red hoodie probably a distraction?","choices":["It was tagged as lost-and-found and no witness saw anyone wearing it","It belonged to every member of the debate team","It was discovered inside the locked display","It was carried into Coach Reyes's office at 3:42"],"correct":0,"explain":"The hoodie was hanging unused with a lost-and-found tag, so it does not connect a person to the missing map."},{"q":"Who most likely removed the map from the leaking display?","choices":["Coach Reyes","Mr. Okafor","Priya","The librarian"],"correct":0,"explain":"The adult-sized person carried a blue tube after 3:32, and that tube later appeared in Coach Reyes's office."},{"q":"Which pair of clues provides the strongest combined evidence?","choices":["Mr. Okafor saw an adult carrying a blue tube, and Priya later saw that tube in Coach Reyes's office","Coach Reyes spilled coffee, and Priya checked out a research book","A red hoodie was in lost-and-found, and the pipe began dripping","The library had a display latch, and the librarian owned a stamp"],"correct":0,"explain":"The two independent statements trace the same distinctive tube from the library hallway to Coach Reyes's office."}],"applicationPrompt":"Who most likely moved the Midnight Map, and which two independent clues best support your conclusion? Explain why one other clue is probably a distraction."};
  for(const grade of ["I","K"]){
    const readingId=`${grade}-HUM-D23-C2-A`;
    if(!D.items.some(item=>item.id===readingId))D.items.push({id:readingId,grade,day:23,subject:"HUM",strand:"Reading",requirement:"Fluency: Character Case File evidence investigation",resourceName:"",resourceUrl:"",resourceType:"activity",displayTitle:"The Character Case Files",characterCase:sharedCase});
    const writing=D.items.find(item=>item.id===`${grade}-HUM-D23-C3-A`);
    if(writing)Object.assign(writing,{requirement:"Quickwrite Choice",quickWriteDirect:true,quickWriteSentenceRange:[grade==="I"?5:7,grade==="I"?5:7],quickWriteOptions:grade==="I"?[{"label":"Option 1 • The Door Beneath the Playground","prompt":"During recess, Mateo found a metal door under the sandbox that had not been there that morning. When he brushed away the sand, someone knocked three times from below. Continue the story in exactly 5 complete sentences.","finalEvent":"Someone knocked three times from below the playground.","keywords":["mateo","metal door","playground","sandbox","sand","knocked","below","recess"]},{"label":"Option 2 • The Substitute from Tomorrow","prompt":"The new substitute teacher knew every student's name, every answer, and exactly what would happen five minutes before it occurred. Then she quietly told Lila, “You are the reason I came back.” Continue the story in exactly 5 complete sentences.","finalEvent":"The substitute told Lila, “You are the reason I came back.”","keywords":["substitute","tomorrow","teacher","students","lila","reason","came back","future"]}]:[{"label":"Option 1 • The Door Beneath the Playground","prompt":"During recess, Mateo found a metal door under the sandbox that had not been there that morning. When he brushed away the sand, someone knocked three times from below. Continue the story in exactly 7 complete sentences.","finalEvent":"Someone knocked three times from below the playground.","keywords":["mateo","metal door","playground","sandbox","sand","knocked","below","recess"]},{"label":"Option 2 • The Substitute from Tomorrow","prompt":"The new substitute teacher knew every student's name, every answer, and exactly what would happen five minutes before it occurred. Then she quietly told Lila, “You are the reason I came back.” Continue the story in exactly 7 complete sentences.","finalEvent":"The substitute told Lila, “You are the reason I came back.”","keywords":["substitute","tomorrow","teacher","students","lila","reason","came back","future"]}]});
  }
})();


/* Day 23 replacement: Titanic explicit information and inference video lesson. */
(function installDay23TitanicLesson(){
  const D=window.DRAGONSWOOD_DATA;if(!D?.items)return;
  const segmentUrls=Array.from({length:10},(_,i)=>"assets/curriculum/video/titanic-day23.mp4.part"+String(i).padStart(2,"0"));
  const shared={
    displayTitle:"Titanic Clues: Explicit Information & Inferences",
    requirement:"Titanic Clues: Explicit Information & Inferences\n\nVideo:\nTitanic Clues • Using Explicit Information and Inferences\n\nVocabulary:\nExplicit, Inference, Text Evidence, Passenger, Luxurious, Elegance, Nervous, Seasick, Iceberg, Journal\n\nMission:\nWatch the lesson, use details from the Titanic journal to answer the evidence check, then complete all three application levels.",
    resourceName:"Titanic Clues • Using Explicit Information and Inferences Video",
    resourceUrl:"",
    resourceType:"video",
    videoDurationSeconds:188,
    kidIntro:"Read the journal clues as you watch. Decide what the writer states directly, what the clues allow you to infer, and which exact details support each conclusion.",
    lessonKeywords:["explicit","inference","text evidence","journal","passenger","luxurious","elegance","nervous","seasick","iceberg","Titanic"],
    lessonContent:{
      banner:"🚢 TITANIC CLUES • WHAT IS STATED, AND WHAT CAN YOU INFER?",
      keyIdea:"Explicit information is stated directly in a text. An inference combines text evidence with what a reader already knows to reach a supported conclusion.",
      vocabulary:[
        {term:"Explicit",definition:"Information that is clearly stated in the text; it says it right there."},
        {term:"Inference",definition:"A conclusion made by combining clues from the text with what you already know."},
        {term:"Text Evidence",definition:"Words, phrases, or sentences from the text used to support an answer or idea."},
        {term:"Passenger",definition:"A person traveling in a car, ship, airplane, or another vehicle."},
        {term:"Luxurious",definition:"Very fancy, comfortable, and expensive."},
        {term:"Elegance",definition:"Beauty that is graceful and stylish."},
        {term:"Nervous",definition:"Feeling worried or scared about what might happen."},
        {term:"Seasick",definition:"Feeling sick because of a boat or ship's movement."},
        {term:"Iceberg",definition:"A huge piece of ice floating in the ocean."},
        {term:"Journal",definition:"A personal record of someone's thoughts, feelings, and experiences."}
      ],
      exampleLabel:"Explicit detail → supported inference",
      example:"The journal explicitly says, “I wore my best shoes and smiled, but my hands wouldn’t stop shaking.” The shaking hands support the inference that the writer felt nervous even while trying to appear confident.",
      rememberLabel:"Evidence rule",
      remember:"An inference is not a random guess. Strong answers name the inference and point to a specific detail that makes it reasonable.",
      challengeLabel:"Three levels",
      challenge:"Level 1: identify explicit information and an example. Level 2: state an inference and its supporting evidence. Level 3: explain how separating stated facts from inferences improves the questions readers ask and answer.",
      missionNote:"Watch → Identify explicit details → Infer → Cite evidence → Explain"
    },
    lessonQuestions:[
      {prompt:"What is explicit information?",choices:["Information stated directly in the text","A prediction with no supporting clues","A reader's personal opinion about a character","A detail that the author deliberately leaves out"],answer:"Information stated directly in the text"},
      {prompt:"What is an inference?",choices:["A conclusion supported by text clues and what the reader knows","A sentence copied without explaining its meaning","A list of every event in the text","Information the text states word for word"],answer:"A conclusion supported by text clues and what the reader knows"},
      {prompt:"The writer says, “I wore my best shoes and smiled, but my hands wouldn’t stop shaking.” What is the best inference?",choices:["The writer felt nervous despite trying to look confident","The writer disliked the shoes and wanted to remove them","The writer was cold because the ship had no heat","The writer had already seen an iceberg"],answer:"The writer felt nervous despite trying to look confident"},
      {prompt:"Which detail is the strongest evidence that the writer was nervous?",choices:["My hands wouldn’t stop shaking","I wore my best shoes","People talked quietly","The ship looked elegant"],answer:"My hands wouldn’t stop shaking"},
      {prompt:"When the writer waves to a little brother while “holding back tears,” what can a reader infer?",choices:["The writer cares about the brother and feels sad about leaving","The writer is angry because the brother took the best shoes","The writer does not recognize the brother on the dock","The writer believes the brother is already aboard the ship"],answer:"The writer cares about the brother and feels sad about leaving"},
      {prompt:"Passengers talked quietly about icebergs, but nobody seemed worried. What is the best inference?",choices:["They underestimated the danger the icebergs could cause","They had already decided to leave the ship","They believed the journal writer caused the danger","They could not see or hear one another"],answer:"They underestimated the danger the icebergs could cause"},
      {prompt:"Which answer correctly separates an explicit detail from an inference?",choices:["Explicit: people discussed icebergs; inference: they did not take the danger seriously","Explicit: the passengers were doomed; inference: people spoke quietly","Explicit: the writer hated the ship; inference: the ship carried passengers","Explicit: an iceberg struck immediately; inference: the writer owned shoes"],answer:"Explicit: people discussed icebergs; inference: they did not take the danger seriously"},
      {prompt:"Why should a reader ask for text evidence after making an inference?",choices:["Evidence shows that the conclusion is supported rather than guessed","Evidence makes every reader reach a different answer","Evidence replaces the need to understand the text","Evidence proves that all possible inferences are correct"],answer:"Evidence shows that the conclusion is supported rather than guessed"}
    ]
  };
  for(const grade of ["I","K"]){
    const item=D.items.find(row=>row.id===grade+"-HUM-D23-C1-A");
    if(!item)continue;
    Object.assign(item,shared,{
      applicationPrompt:grade==="I"
        ?"Complete all three levels in 5–6 sentences total. Level 1: Define explicit information and give one explicit example from the Titanic journal. Level 2: State one inference and quote or accurately describe the evidence supporting it. Level 3: Explain how knowing the difference helps a reader ask and answer better questions."
        :"Complete all three levels in 6–8 sentences total. Level 1: Define explicit information and cite one explicit detail from the Titanic journal. Level 2: Make a supported inference and explain how specific evidence leads to it. Level 3: Explain how distinguishing stated facts from inferences improves the quality and accuracy of questions and answers."
    });
  }
  window.DRAGONSWOOD_TITANIC_VIDEO_READY=Promise.all(segmentUrls.map(url=>fetch(url,{cache:"force-cache"}).then(response=>{
    if(!response.ok)throw new Error("Titanic video segment unavailable: "+url);
    return response.arrayBuffer();
  }))).then(parts=>{
    const blobUrl=URL.createObjectURL(new Blob(parts,{type:"video/mp4"}))+"#titanic-day23.mp4";
    for(const grade of ["I","K"]){
      const item=D.items.find(row=>row.id===grade+"-HUM-D23-C1-A");
      if(item)item.resourceUrl=blobUrl;
    }
    window.dispatchEvent(new CustomEvent("dragonswood:curriculum-media-ready",{detail:{lesson:"titanic-day23"}}));
    if(typeof window.requestCurriculumRefresh==="function")window.requestCurriculumRefresh("titanic-media-ready");
    else if(typeof window.render==="function")window.render();
    return blobUrl;
  }).catch(error=>{
    console.error("[Dragonswood] Titanic lesson video failed to load.",error);
    return "";
  });
})();
