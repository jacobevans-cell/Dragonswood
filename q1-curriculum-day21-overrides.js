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
          keywords:["championship","game","scoreboard","map","score","team","mascot","tunnel","bleachers","locked"]
        },
        {
          label:"Option 2 • The Moonlight Kingdom",
          prompt:"A silver fox wearing a tiny crown appeared beside the costume rack and whispered, “The Moonlight Kingdom has lost its princess—and only you can find her.” Continue the story.",
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
          keywords:["mountain","bike","race","kai","handlebars","compass","finish","abandoned","research station","glowing"]
        },
        {
          label:"Option 2 • The Crystal Locket",
          prompt:"While preparing for the school dance, Ava found a crystal locket inside an old costume box. When she opened it, the ballroom in the mirror filled with people who had disappeared one hundred years ago. Continue the story.",
          keywords:["dance","ava","crystal","locket","costume","mirror","ballroom","disappeared","past","hundred years"]
        }
      ]
    }
  };
  for(const [id,override] of Object.entries(publishQuickwrites)){
    const item=data.items.find(row=>row.id===id);
    if(item)Object.assign(item,override);
  }

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
      remember:"Faster or heavier moving objects can transfer more energy. During collisions, some energy may also become sound and heat.",
      challenge:"Collision Detective: Identify the moving object, the object receiving energy, the moment of contact, and the evidence that energy transferred."
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
