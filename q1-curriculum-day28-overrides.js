(function installDay28Curriculum(){
  "use strict";
  const D=window.DRAGONSWOOD_DATA;
  if(!D||!Array.isArray(D.items))return;

  const murderCase={
    id:"day28-ravencrest-observatory-murder-v1",
    title:"THE CHARACTER CASE FILES • MURDER AT RAVENCREST OBSERVATORY",
    report:[
      "At 8:18 p.m., Rowan Blackwood, director of Ravencrest Observatory, was found dead inside the observatory office after the Founders' Night event. Investigators determined that he had been murdered. The case contains no graphic evidence; your job is to solve the timeline.",
      "A brief power failure knocked out the west-hall security camera from 8:06 to 8:12. The observatory's west service door can be opened only with a staff keycard. Blackwood's desk calendar shows an 8:00 p.m. meeting marked 'A.O. — repair invoices.'",
      "Three staff members were still in the building. Compare their interviews with the badge logs, event records, and timeline. One person's story cannot be true."
    ],
    characters:[
      {id:"mira",name:"Dr. Mira Vale",role:"Astronomy Consultant",color:"#287f86",image:"assets/character-case/dr-mira-vale.jpg",questions:[
        {q:"Where were you between 8:00 and 8:15?",a:"I was presenting in the planetarium. The program began at 7:55 and ended just after 8:15."},
        {q:"Is there anything that confirms your timeline?",a:"A family took a time-stamped photo with me at 8:09, and the planetarium microphone recording runs continuously through the presentation."},
        {q:"Did you see Rowan Blackwood that evening?",a:"Only before the event. He told me he had an important staff meeting at eight and might miss the first part of my presentation."},
        {q:"Did you notice anyone near the west stairs?",a:"At about 7:52 I saw Mr. Okafor heading toward the observatory level carrying his keycard lanyard and a folder."}
      ]},
      {id:"reyes",name:"Coach Reyes",role:"Founders' Night Security Coordinator",color:"#8a3f44",image:"assets/character-case/coach-reyes.png",questions:[
        {q:"Where were you during the camera outage?",a:"At the gym entrance checking guests out of the event. I was there from about 8:02 until 8:16."},
        {q:"Can anyone confirm that?",a:"The checkout sheet has my initials every few minutes. I also answered a radio call at 8:10, and the recording includes my response from the gym entrance."},
        {q:"Why did you go to the observatory at 8:18?",a:"Blackwood had not answered two radio calls, so I went upstairs to check on him. That is when I found him and called for help."},
        {q:"Did you use the west service door?",a:"No. I entered through the main observatory hallway. My keycard log shows no west-door entry that night."}
      ]},
      {id:"okafor",name:"Mr. Ade Okafor",role:"Facilities Manager",color:"#6d5b2f",image:"assets/character-case/mr-okafor.png",questions:[
        {q:"Where were you from 8:03 to 8:13?",a:"In the basement breaker room dealing with the power problem. I stayed there the whole time until the lights were stable."},
        {q:"What does the breaker-room badge log show?",a:"It says my card entered at 8:11. The reader must have recorded it late because I was already down there."},
        {q:"Did anyone else use your keycard?",a:"No. My card stayed clipped to my lanyard all evening. I never loaned it to anyone."},
        {q:"Were you supposed to meet Blackwood at 8:00?",a:"We had discussed a meeting about repair invoices, but I thought he postponed it. I did not meet with him that night."}
      ]}
    ],
    quiz:[
      {q:"Which evidence most strongly confirms Dr. Vale's location at 8:09?",choices:["A time-stamped guest photo and the continuous planetarium recording","Her memory of seeing Mr. Okafor at 7:52","The power failure in the west hall","Blackwood's desk calendar"],correct:0,explain:"Two independent records place Dr. Vale in the planetarium during the critical time."},
      {q:"Why does the camera outage NOT prove who committed the murder?",choices:["It creates a gap in video evidence, but several people could still have moved during that gap","It proves Coach Reyes turned off the camera","It proves Dr. Vale left the planetarium","It proves Blackwood was alone all evening"],correct:0,explain:"Missing footage is an absence of evidence, not proof of one person's actions."},
      {q:"Which fact most directly contradicts Mr. Okafor's statement that he was in the breaker room the entire time?",choices:["His badge did not enter the breaker room until 8:11","Dr. Vale's presentation ended after 8:15","Coach Reyes answered a radio call at 8:10","The event began before 8:00"],correct:0,explain:"If his badge first entered the breaker room at 8:11, his claim that he was already there from 8:03 cannot be accurate."},
      {q:"Why is the 8:07 west-service-door entry using Okafor's keycard especially important?",choices:["Okafor says the card never left his lanyard, linking him personally to the card used at the observatory door","Any guest could use a staff keycard without permission","The west door leads to the planetarium stage","The keycard system stopped working before 8:00"],correct:0,explain:"His own statement rules out someone borrowing the card, making the 8:07 access record much harder to explain away."},
      {q:"Who is best supported by the evidence as Rowan Blackwood's murderer?",choices:["Mr. Okafor, because his exclusive keycard opened the observatory service door at 8:07, his breaker-room timeline is contradicted by the 8:11 badge log, and he had an 8:00 meeting about questioned repair invoices","Dr. Vale, because she knew Blackwood had a meeting","Coach Reyes, because she discovered Blackwood at 8:18","There is no evidence strong enough to identify any suspect"],correct:0,explain:"Okafor is the only suspect whose claimed timeline conflicts with access records while his personal keycard places him at the observatory during the critical window."}
    ],
    applicationPrompt:"Who murdered Rowan Blackwood? Build your final accusation using at least THREE independent pieces of evidence. Explain the timeline, identify the key contradiction, and explain why the other two suspects' alibis are stronger."
  };

  const quickwrite=[
    {label:"Option 1 • Floor Zero",prompt:"The elevator at school had buttons for floors 1, 2, and 3 until this morning, when a new button marked 0 appeared beneath them. You pressed it, and the elevator began moving down much farther than the building should allow. Continue the story.",finalEvent:"The elevator began moving down much farther than the building should allow.",keywords:["elevator","floor zero","button","school","down","building"]},
    {label:"Option 2 • The Mascot After Midnight",prompt:"You returned to the gym after dark to grab something you forgot. The mascot costume was sitting alone on the bleachers. As you walked past, its head slowly turned toward you. Continue the story.",finalEvent:"As you walked past, the mascot costume's head slowly turned toward you.",keywords:["gym","mascot","costume","bleachers","dark","turned"]}
  ];

  for(const grade of ["I","K"]){
    const reading=D.items.find(x=>x.grade===grade&&Number(x.day)===28&&x.subject==="HUM"&&x.strand==="Reading");
    if(reading){
      Object.assign(reading,{
        displayTitle:"The Character Case Files • Murder at Ravencrest Observatory",
        requirement:"Character Case Files\n\nRowan Blackwood has been murdered. Read the case report, interview all three suspects, compare the timelines and access records, complete the evidence check, and submit your final accusation.",
        resourceName:"Fluency • Character Case Files",
        resourceUrl:"",
        resourceType:"activity",
        videoRequired:false,
        videoDurationSeconds:0,
        additionalVideos:[],
        kidIntro:"This is a deduction mystery, not a gore story. Interview everyone, test every alibi, and follow the evidence before accusing anyone.",
        characterCase:murderCase
      });
      delete reading.lessonQuestions;
      delete reading.lessonContent;
      delete reading.applicationPrompt;
      delete reading.googleFileId;
      delete reading.sourceDocumentId;
      delete reading.sourceGuide;
    }

    const writing=D.items.find(x=>x.grade===grade&&Number(x.day)===28&&x.subject==="HUM"&&x.strand==="Writing");
    if(writing){
      const sentenceCount=grade==="I"?5:7;
      Object.assign(writing,{
        displayTitle:"Writing • Quickwrite Choice",
        requirement:`Quickwrite\n\nChoose ONE story starter and continue the story in exactly ${sentenceCount} complete sentences. Keep the events connected, add specific details, and move the story forward.`,
        resourceName:"",
        resourceUrl:"",
        resourceType:"activity",
        videoRequired:false,
        videoDurationSeconds:0,
        additionalVideos:[],
        quickWriteDirect:true,
        quickWriteSentenceRange:[sentenceCount,sentenceCount],
        quickWriteOptions:quickwrite,
        kidIntro:`Choose one story path and write exactly ${sentenceCount} complete sentences.`
      });
      delete writing.lessonQuestions;
      delete writing.lessonContent;
      delete writing.applicationPrompt;
      delete writing.googleFileId;
      delete writing.sourceDocumentId;
      delete writing.sourceGuide;
    }
  }

  function hasRealVideo(item){
    if(!item)return false;
    if(item.resourceType==="video")return true;
    if(Array.isArray(item.additionalVideos)&&item.additionalVideos.length)return true;
    const u=String(item.resourceUrl||"");
    return /(?:youtube\.com|youtu\.be|docs\.google\.com\/videos|drive\.google\.com\/file|\.mp4(?:$|[?#]))/i.test(u);
  }

  for(let i=D.items.length-1;i>=0;i--){
    const item=D.items[i];
    if(!item||Number(item.day)!==28||!["I","K"].includes(item.grade))continue;
    const isCase=item.subject==="HUM"&&item.strand==="Reading"&&!!item.characterCase;
    const isQuickwrite=item.subject==="HUM"&&item.strand==="Writing"&&!!item.quickWriteOptions;
    if(!isCase&&!isQuickwrite&&!hasRealVideo(item))D.items.splice(i,1);
  }
})();
