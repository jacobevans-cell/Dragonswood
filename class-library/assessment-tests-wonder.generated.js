import { WONDER_META } from "./books/wonder/meta.js?v=1";

const BOOK_ID = "wonder";
const BOOK_TITLE = "Wonder";
const SUMMARY_PROMPT = "Write one paragraph of exactly five complete sentences summarizing what happened in this chapter. Include the most important characters, events, problem or conflict, and outcome. Use your own words and describe events from this chapter only.";
const SKILLS = ["Meaningful recall", "Sequence", "Cause and effect", "Motivation or relationship", "Inference or evidence", "Character development", "Central idea, significance, or theme"];
const POSITION_PATTERNS = [
  [[1,3,2,1,3,0,2], [2,1,3,2,0,1,3], [3,2,1,3,2,0,1]],
  [[2,0,3,2,0,1,3], [3,2,0,3,1,2,0], [2,3,0,2,3,1,0]],
  [[3,1,0,3,1,2,0], [1,0,3,1,2,0,3], [3,0,1,3,0,2,1]],
  [[0,2,1,0,2,3,1], [2,1,0,2,3,1,0], [1,2,0,1,2,3,0]]
];

const chapters = [
  { n:1, q:[
    ["How does Auggie describe himself inside?", "He feels like an ordinary ten-year-old kid."],
    ["What contrast does Auggie establish after listing ordinary activities?", "He feels ordinary, but other people react to his face."],
    ["Why does Via become angry at strangers?", "She notices rude reactions and tries to protect Auggie."],
    ["Why does Auggie wish for a face no one notices?", "He wants people to meet him without staring or looking away."],
    ["What does Auggie's account suggest about the word ordinary?", "Identity can feel normal even when others treat someone as different."],
    ["How has Auggie learned to handle strangers' reactions?", "He pretends not to notice the faces they make."],
    ["What central idea opens the novel?", "A person's appearance does not define how ordinary or human they are."]
  ]},
  { n:2, q:[
    ["Why has Auggie been homeschooled?", "Frequent surgeries and illnesses made regular attendance difficult."],
    ["What change is about to happen after years of learning at home?", "Auggie will begin fifth grade at a real school."],
    ["Why is Auggie petrified about fifth grade?", "He has never attended school and expects difficult reactions from children."],
    ["Why does Auggie compare different childhood friends?", "He is judging who has included him and who has kept a distance."],
    ["What do the birthday invitations reveal?", "Some children are friendly in public but do not fully include Auggie."],
    ["How does Auggie think through his loneliness?", "He questions whether he is making too much of the missing invitations."],
    ["Why does this chapter matter?", "It explains both Auggie's isolation and the risk he is taking by starting school."]
  ]},
  { n:3, q:[
    ["What story does Auggie enjoy hearing from Mom?", "The story of his difficult birth and the funny hospital confusion."],
    ["What happened after doctors carried newborn Auggie away?", "His family waited anxiously while a kind nurse supported Mom."],
    ["Why had the family not expected Auggie's condition?", "Earlier tests suggested only small problems and Via's birth was uncomplicated."],
    ["Why does Mom remember the farting nurse fondly?", "The nurse made her laugh and stayed compassionate during a frightening time."],
    ["What evidence shows Mom accepted Auggie immediately?", "When she first saw him, she focused on his beautiful eyes."],
    ["How does humor affect the family's retelling?", "It turns a traumatic beginning into a story they can share together."],
    ["What central idea does the birth story express?", "Love can see a whole person even during fear and uncertainty."]
  ]},
  { n:4, q:[
    ["Where does Auggie first overhear Mom discussing school?", "At Christopher's house in Bridgeport."],
    ["What happens after Auggie interrupts the adults' school conversation?", "Mom and Dad explain their opposing views about sending him."],
    ["Why does Mom believe school may now be necessary?", "She thinks Auggie needs more learning and social experience than home can provide."],
    ["Why does Dad resist the plan?", "He worries Auggie is not ready for how other children may treat him."],
    ["What does Auggie's fractions comment reveal?", "He partly recognizes that Mom cannot teach him everything he needs."],
    ["How does Auggie's attitude shift during the conversation?", "He wants Dad to win but admits Mom may be right."],
    ["What conflict is established here?", "Protecting Auggie may also prevent him from gaining independence."]
  ]},
  { n:5, q:[
    ["Who is Mr. Tushman?", "The principal of the school Auggie may attend."],
    ["What happens after Auggie overhears his parents debating in the car?", "He joins the talk and learns a school visit is already arranged."],
    ["Why does Mom say the family cannot keep protecting Auggie?", "His condition will not disappear, so he must learn to face the wider world."],
    ["Why does Dad make jokes about Mr. Tushman's name?", "He uses humor to lower the tension around a frightening decision."],
    ["What does the parents' quiet argument suggest?", "Both love Auggie, but fear leads them toward different choices."],
    ["How does Auggie participate by the end?", "He listens, jokes with them, and names Mr. Tushman as his new principal."],
    ["Why is the car conversation significant?", "The possibility of school becomes a concrete next step instead of a hidden idea."]
  ]},
  { n:6, q:[
    ["Where does Auggie meet Mr. Tushman?", "At Beecher Prep before the school year begins."],
    ["What surprise follows Auggie's first conversation with the principal?", "He learns three students are waiting to show him the school."],
    ["Why does Auggie begin the visit giggling?", "Dad's jokes have made Mr. Tushman's name sound funny to him."],
    ["Why does Auggie take Mom's hand instead of Mr. Tushman's?", "The unexpected student tour makes him feel frightened and betrayed."],
    ["What does Mom's hand squeeze suggest?", "She loves Auggie and may also feel sorry for surprising him."],
    ["How does Auggie move forward despite his anger?", "He agrees to a short tour and follows the students inside."],
    ["What idea does the visit begin exploring?", "New independence can require entering discomfort before feeling ready."]
  ]},
  { n:7, q:[
    ["Who greets Auggie in the middle-school office?", "Mrs. Garcia, Mr. Tushman's assistant."],
    ["What does Auggie notice after Mrs. Garcia first greets Mom?", "Her smile briefly changes when she finally sees him."],
    ["Why is Auggie hiding behind Mom in the hallway?", "He feels exposed and is not ready to face unfamiliar reactions."],
    ["Why does Mrs. Garcia squeeze Mom's hand?", "She wants to reassure her that the school will care for Auggie."],
    ["What does Auggie infer from Mom's face?", "Mom is just as nervous about the school visit as he is."],
    ["How does Auggie evaluate Mrs. Garcia?", "He likes her kindness but distrusts the overly shiny smile."],
    ["What does this encounter show about kindness?", "Kind words matter most when they feel honest rather than performed."]
  ]},
  { n:8, q:[
    ["Which students will lead Auggie's school tour?", "Jack Will, Julian, and Charlotte."],
    ["What happens after Mr. Tushman introduces the three guides?", "Auggie realizes Mom planned the meeting and reluctantly goes with them."],
    ["Why does Mr. Tushman choose current students as guides?", "They can show Auggie the school from a fifth grader's point of view."],
    ["Why does Auggie glare at Mom?", "He is angry that she did not warn him he would meet other children."],
    ["What do the framed student pictures in the office suggest?", "Mr. Tushman treats children's work as important."],
    ["How does Auggie act when he sees Mom is scared?", "He controls his anger enough to agree to the tour."],
    ["Why is meeting the guides important?", "Auggie's fear of school becomes a real interaction with future classmates."]
  ]},
  { n:9, q:[
    ["Which rooms do the student guides begin showing Auggie?", "Their homeroom and the science room."],
    ["What do the students do after visiting the science room?", "Charlotte leads them toward the performance space."],
    ["Why does Jack become impatient with Julian?", "Julian keeps making comments and stretching out the tour."],
    ["Why does Charlotte describe teachers and rooms in detail?", "She wants to give Auggie a useful and enthusiastic introduction."],
    ["What does Julian laughing at 'Jackwill' suggest?", "He looks for small chances to embarrass other people."],
    ["How does Auggie begin participating in the tour?", "He asks Jack about his name and talks about the rooms."],
    ["What is the tour testing for Auggie?", "Whether ordinary school conversation can outweigh his fear of being judged."]
  ]},
  { n:10, q:[
    ["What school space does Charlotte proudly show Auggie?", "The auditorium and its stage."],
    ["What happens after Julian asks Auggie about his facial condition?", "Jack and Charlotte object, and the group prepares to leave."],
    ["Why does Julian claim he is only asking a scientific question?", "He wants to disguise a hurtful personal question as curiosity."],
    ["Why does Jack defend Auggie?", "He recognizes Julian's question is rude and meant to make Auggie uncomfortable."],
    ["What reveals Julian's apology is not sincere?", "He cuts in front of Auggie and looks at him without regret."],
    ["How does Auggie respond to the growing hostility?", "He keeps moving with the group while noticing exactly what Julian is doing."],
    ["What central idea appears in the tour conflict?", "Polite words are not kindness when they hide disrespectful intentions."]
  ]},
  { n:11, q:[
    ["What decision does Auggie face after the tour?", "Whether to attend Beecher Prep in the fall."],
    ["What happens after Julian mentions the science chicks?", "Auggie remembers why Mom had discussed school and becomes upset."],
    ["Why does Auggie leave the visit quickly?", "Julian's treatment has made the school feel unsafe and humiliating."],
    ["Why does Auggie tell Mr. Tushman everyone was nice?", "He does not want Jack and Charlotte blamed for Julian's behavior."],
    ["What does Auggie's careful statement reveal?", "Even while hurt, he distinguishes between the children who helped and the one who did not."],
    ["How has the tour changed Auggie?", "He leaves sad and uncertain but with real information for making his choice."],
    ["Why is the chapter called 'The Deal'?", "The school visit becomes the condition Auggie must consider before choosing enrollment."]
  ]},
  { n:12, q:[
    ["Whom does Auggie talk to first when he reaches his room?", "His dog Daisy and then Mom."],
    ["What decision follows Auggie's account of Julian's behavior?", "Auggie tells Mom he still wants to attend school."],
    ["Why does Auggie feel sad and a little happy together?", "The tour hurt him, but parts of school and some of the students appealed to him."],
    ["Why does Mom offer to cancel the plan?", "She feels guilty and does not want Auggie forced into a harmful situation."],
    ["What does Auggie's praise of Jack and Charlotte show?", "He can recognize genuine support even during a painful experience."],
    ["How does Auggie take ownership of the school decision?", "He chooses to go after being given a real chance to refuse."],
    ["What is significant about his final answer?", "Courage begins with choosing the difficult opportunity for himself."]
  ]},
  { n:13, q:[
    ["What major event makes Auggie extremely nervous?", "His first full day at Beecher Prep."],
    ["What happens after his family walks him to the entrance?", "Auggie hugs them quickly and enters the school alone."],
    ["Why had Mom and Dad reversed their earlier positions?", "The tour's pain frightened Mom, while Auggie's handling of it impressed Dad."],
    ["Why does Auggie keep Mom from having a long goodbye?", "He senses she may cry and does not want to be embarrassed."],
    ["What do the family's photographs and jokes reveal?", "They are nervous but trying to make the morning feel hopeful and normal."],
    ["How does Auggie act at the doorway?", "He accepts their love and then takes the independent step inside."],
    ["What does the first-day scene emphasize?", "Bravery can look like walking forward while fear is still present."]
  ]},
  { n:14, q:[
    ["Where does Auggie choose to sit in homeroom?", "Near the middle of the back row."],
    ["What happens after students receive their combination locks?", "Auggie opens his quickly while Henry struggles with his."],
    ["Why does Henry put his backpack between himself and Auggie?", "He wants a physical barrier because Auggie's appearance makes him uncomfortable."],
    ["Why would Auggie have helped Henry without the backpack barrier?", "Auggie is willing to be kind even to someone treating him awkwardly."],
    ["What does Auggie's seat choice reveal?", "He plans carefully to reduce how easily classmates can stare."],
    ["How does Auggie manage the unfamiliar classroom?", "He uses the earlier tour, keeps calm, and completes the lock task successfully."],
    ["What contrast gives the chapter meaning?", "Auggie's competence is ordinary, while classmates' fear creates the real obstacle."]
  ]},
  { n:15, q:[
    ["What assignment does Ms. Petosa give the class?", "Share two facts and something they want to do that year."],
    ["What happens after Ms. Petosa explains the introduction activity?", "She begins calling on students, starting with Charlotte."],
    ["Why does the teacher use an around-the-room introduction?", "She wants the new class to learn about one another."],
    ["Why is Auggie uneasy while others speak?", "He knows his turn will make the whole class focus on him."],
    ["What does Julian's confident participation suggest?", "He is comfortable drawing positive attention to himself."],
    ["How does Auggie prepare for his coming turn?", "He listens while anticipating the moment he must speak publicly."],
    ["Why does an ordinary icebreaker feel important here?", "A routine activity becomes a major test for someone used to unwanted attention."]
  ]},
  { n:16, q:[
    ["What facts does Auggie share with homeroom?", "He has a sister named Via and a dog named Daisy."],
    ["What happens after Auggie says he likes Star Wars?", "Julian asks about Darth Sidious while looking directly at him."],
    ["Why does the Darth Sidious question hurt Auggie?", "The character's burned and deformed face makes Julian's comparison clear."],
    ["Why does Julian phrase the insult as a question?", "He wants to wound Auggie while pretending he is simply making conversation."],
    ["What evidence confirms Julian knows what he is doing?", "He looks at Auggie after naming the disfigured character."],
    ["How does Auggie handle his turn?", "He forces himself to look up and speak even while feeling exposed."],
    ["What does the chapter title suggest?", "Auggie enters calmly without knowing a normal introduction will become painful."]
  ]},
  { n:17, q:[
    ["What is Mr. Browne's September precept?", "When given the choice between being right and kind, choose kind."],
    ["What happens after Mr. Browne explains how precepts will work?", "Auggie writes the first one down and decides he will like school."],
    ["Why does Mr. Browne introduce a monthly precept?", "He wants students to examine important rules for how they live."],
    ["Why does Jack sit beside Auggie again?", "He continues offering companionship when other students avoid the seat."],
    ["What does Auggie's reaction to the class suggest?", "A thoughtful teacher can make school feel safer after a cruel encounter."],
    ["How does Auggie's mood change?", "He moves from fleeing homeroom to feeling determined to like school."],
    ["Why is 'Choose Kind' central to the novel?", "It names the moral choice every character will repeatedly face."]
  ]},
  { n:18, q:[
    ["What problem does Auggie face in the cafeteria?", "He cannot find anyone willing to share a table with him."],
    ["What happens after Auggie sits alone with his packed lunch?", "He notices whispers and becomes painfully aware of how he looks while eating."],
    ["Why is eating in public especially difficult for Auggie?", "His surgeries still affect chewing, and he knows food may fall from his mouth."],
    ["Why does Auggie study himself eating a cracker at home?", "A child's earlier comment makes him want to understand what others see."],
    ["What do the saved seats and whispering girls show?", "Social exclusion can happen without anyone directly saying Auggie must leave."],
    ["How does Auggie respond to the cafeteria pressure?", "He stays at the table and eats while privately absorbing the embarrassment."],
    ["What central idea does the lunch scene develop?", "Ordinary public moments become difficult when people treat difference as a spectacle."]
  ]},
  { n:19, q:[
    ["Who chooses to sit with Auggie?", "Summer Dawson."],
    ["What happens after Summer introduces herself?", "She and Auggie invent a playful list of summer-related names for the table."],
    ["Why does another girl leave instead of joining them?", "She is uncomfortable sitting near Auggie despite the available space."],
    ["Why does Summer stay?", "She wants to talk with Auggie and treats him like an ordinary classmate."],
    ["What does the flexible summer-name rule reveal?", "Their game is really about welcoming anyone who is nice."],
    ["How does Auggie's lunch experience change?", "A lonely table becomes the beginning of an easy new friendship."],
    ["Why is Summer's small choice significant?", "Simple voluntary inclusion can directly challenge a whole group's avoidance."]
  ]},
  { n:20, q:[
    ["What scale does Mom use to ask about Auggie's day?", "A scale from one to ten."],
    ["What happens after Auggie gives school a low score?", "He tells Mom about Summer and begins talking more positively."],
    ["Why did the family first use the number scale?", "Auggie could not speak after surgery and needed to report pain."],
    ["Why does Mom ask about Summer?", "She wants to understand the friendship that made lunch less painful."],
    ["What does Auggie's Beauty and the Beast joke suggest?", "Humor helps him speak about insecurity he cannot state directly."],
    ["How does Auggie's rating of the day develop?", "He recognizes that one kind person can improve an otherwise difficult experience."],
    ["What does the chapter show about support?", "Listening for the good part of a hard day can help someone keep going."]
  ]},
  { n:21, q:[
    ["What does Auggie cut off at home?", "His Star Wars Padawan braid."],
    ["What happens after Via questions the haircut?", "Auggie becomes upset and asks Mom why he has to look the way he does."],
    ["Why does Auggie remove the braid?", "School pressure makes a once-proud interest feel like another reason to stand out."],
    ["Why is Via angry about the braid?", "She knows it mattered to Auggie and suspects someone has made him ashamed of it."],
    ["What do Auggie's tears reveal beneath his earlier jokes?", "He carries deep pain that reassurance cannot simply erase."],
    ["How does Mom respond to his question?", "She holds and kisses him while trying to make him feel loved."],
    ["What is the chapter's central conflict?", "Belonging at school begins to pressure Auggie to hide parts of himself."]
  ]},
  { n:22, q:[
    ["What makes September difficult besides classmates' staring?", "Early mornings, homework, quizzes, and lost free time."],
    ["What happens as more weeks of school pass?", "Students gradually become less openly shocked by Auggie's appearance."],
    ["Why do classmates adjust at different speeds?", "Children who see Auggie every day become familiar sooner than older students."],
    ["Why does Auggie keep attending through the hard month?", "He is learning the routines and giving people time to know him."],
    ["What does the changing level of staring suggest?", "Familiarity can weaken an automatic reaction to visible difference."],
    ["How does Auggie adapt to school life?", "He begins managing routines that once felt completely unfamiliar."],
    ["Why does September matter?", "It shows that difficult beginnings can slowly become more livable without becoming perfect."]
  ]},
  { n:23, q:[
    ["In how many classes does Auggie spend time with Jack?", "Six classes, including homeroom and science."],
    ["What happens after an older student bumps into Auggie and reacts badly?", "Jack turns the incident into a joke they can share."],
    ["Why does Auggie suspect teachers arranged their seats?", "He ends up beside Jack in every class they share."],
    ["Why does Jack joke about suing Auggie's surgeon?", "He follows Auggie's own humor instead of treating him with pity."],
    ["What evidence shows their friendship is becoming genuine?", "They laugh so hard together that a teacher separates them."],
    ["How does Auggie behave with Jack?", "He becomes relaxed enough to make bold jokes about his appearance."],
    ["What makes Jack's friendship different from forced kindness?", "Their shared humor and enjoyment create an equal relationship."]
  ]},
  { n:24, q:[
    ["What is Mr. Browne's October precept?", "Your deeds are your monuments."],
    ["What does Auggie do after receiving the precept?", "He writes a paragraph connecting deeds, memories, heroes, and pyramids."],
    ["Why are deeds compared with monuments?", "Actions remain in people's memories after a person's life ends."],
    ["Why does Auggie take the assignment seriously?", "He wants to explain how behavior creates a lasting reputation."],
    ["What does the pyramid comparison clarify?", "A memory built from actions can honor someone like a structure of stone."],
    ["How does Auggie show academic growth?", "He develops the precept through a clear original comparison."],
    ["Why is this precept important to the story?", "It asks characters to be judged by what they do rather than how they appear."]
  ]},
  { n:25, q:[
    ["When is Auggie's birthday?", "October tenth."],
    ["What happens after Auggie chooses a large bowling party?", "He invites his whole homeroom and Summer, but only some classmates attend."],
    ["Why does Auggie invite everyone in homeroom?", "He does not want excluded classmates to feel the hurt he knows himself."],
    ["Why is Mom pleased by the request for a big party?", "It shows Auggie is trying to build a social life at school."],
    ["What does the attendance reveal?", "Auggie has begun making friends, but many classmates still keep their distance."],
    ["How does Auggie experience the party?", "He focuses on the people who came and enjoys the celebration."],
    ["What central idea appears in his invitation choice?", "Someone who knows exclusion can deliberately choose wider kindness."]
  ]},
  { n:26, q:[
    ["What costume does Auggie plan to wear?", "Boba Fett."],
    ["What happens after Summer says costumes are allowed at school?", "They compare ideas and talk about her possible unicorn costume."],
    ["Why does Summer consider changing her preferred costume?", "Popular girls say they are too old, making her fear looking childish."],
    ["Why does Summer tell Auggie her honest choice?", "She trusts him not to judge what she likes."],
    ["What does their 'cool beans' exchange show?", "The friendship has developed its own comfortable language and trust."],
    ["How does Auggie support Summer?", "He treats the unicorn idea as fun rather than embarrassing."],
    ["What does the chapter suggest about fitting in?", "Social pressure can make children hide harmless interests they genuinely enjoy."]
  ]},
  { n:27, q:[
    ["Which picture can Auggie not avoid?", "The class group photograph."],
    ["What happens after he refuses an individual school portrait?", "He must still sit in the front row for the class picture."],
    ["Why does Auggie call his reaction an aversion rather than a phobia?", "He believes his dislike is reasonable because photographs preserve how others see him."],
    ["Why does he avoid smiling?", "He feels the photographer already sees him as ruining the picture."],
    ["What does the photographer's expression communicate to Auggie?", "Auggie reads it as disappointment that his face will be included."],
    ["How does Auggie handle the unavoidable photograph?", "He participates but protects himself by withholding a smile."],
    ["What does this brief chapter reveal?", "Being visibly included can still feel like rejection when attitudes remain unkind."]
  ]},
  { n:28, q:[
    ["What game do students play about touching Auggie?", "They treat contact with him like catching the Plague or Cheese Touch."],
    ["What happens after Tristan accidentally touches Auggie's hand?", "He rushes to the sink to wash as quickly as possible."],
    ["Why does Ximena panic during dance class?", "The teacher tries to assign her as Auggie's partner."],
    ["Why does Auggie compare himself to moldy cheese?", "Classmates behave as if physical contact with him causes contamination."],
    ["What evidence shows the exclusion is organized rather than imagined?", "Several students avoid touching him in different classes and activities."],
    ["How does Auggie's understanding change?", "He recognizes a school-wide rule that no one has said directly to him."],
    ["Why is this behavior especially harmful?", "It turns a person into something supposedly contagious instead of treating him as human."]
  ]},
  { n:29, q:[
    ["Why is Halloween Auggie's favorite holiday?", "A mask lets him move through the world without being singled out."],
    ["What happens after the Boba Fett costume needs last-minute work?", "Auggie wears his old Bleeding Scream costume to school instead."],
    ["Why does Auggie remember wearing an astronaut helmet?", "It once gave him the same protection from stares that costumes provide."],
    ["Why does he wish everyone wore masks?", "He wants people to know one another before judging appearances."],
    ["What does choosing an unannounced costume make possible?", "No classmate knows Auggie is under the Bleeding Scream mask."],
    ["How does Auggie enter Halloween morning?", "He feels freer and more confident than on ordinary school days."],
    ["What central idea is carried by the masks?", "Removing visible labels can reveal how unfairly appearance controls social treatment."]
  ]},
  { n:30, q:[
    ["What does Auggie overhear while wearing the Bleeding Scream mask?", "Jack telling Julian he would harm himself if he looked like Auggie."],
    ["What happens after Auggie recognizes Jack's voice?", "He leaves the room crying before anyone knows he was there."],
    ["Why can Auggie hear the conversation unseen?", "He changed costumes, so Jack believes the masked student is someone else."],
    ["Why is Jack's comment especially painful?", "Auggie trusted Jack as a real friend rather than a student assigned to help him."],
    ["What does Jack's behavior reveal about social pressure?", "He says cruel things to impress Julian that conflict with how he acts around Auggie."],
    ["How does Auggie's confidence change?", "The freedom of the costume collapses into shame and betrayal."],
    ["Why is this chapter a turning point?", "Auggie learns that friendly actions may hide hurtful private words."]
  ]},
  { n:31, q:[
    ["Where does Auggie hide after overhearing Jack?", "In a locked bathroom stall and then the nurse's office."],
    ["What happens after Nurse Molly calls Mom?", "Auggie goes home, skips Halloween activities, and stays out the next school day."],
    ["Why does Auggie report a stomach ache?", "The emotional shock feels physically painful and gives him a reason to leave."],
    ["Why does he keep the real reason from his family?", "He is overwhelmed and not ready to repeat Jack's words."],
    ["What does Auggie's list of cruel names show?", "Jack's comment joins a long history of insults Auggie already knows."],
    ["How does Auggie's plan for school change?", "He moves from determined attendance to believing he will never return."],
    ["What does the chapter show about betrayal?", "Cruelty from a trusted friend can hurt more deeply than insults from strangers."]
  ]},
  { n:32, q:[
    ["How does Via describe her family universe?", "Auggie is the sun while everyone else orbits around him."],
    ["What change does Via notice after years of accepting that pattern?", "The family's usual galaxy is beginning to fall out of alignment."],
    ["Why have Via's needs usually received less attention?", "Auggie's medical crises have always seemed more urgent than her problems."],
    ["Why has Via rarely complained?", "She understands what Auggie endures and has learned to manage on her own."],
    ["What does Daisy's place outside the orbit suggest?", "The dog responds to Auggie without ranking him by appearance or need."],
    ["How is Via changing as the narrator?", "She is beginning to question a family system she once accepted automatically."],
    ["What central conflict begins Via's section?", "Loving Auggie does not erase Via's need to be seen as a person herself."]
  ]},
  { n:33, q:[
    ["What toy did young Via treat like a baby before Auggie was born?", "A rag doll named Lilly."],
    ["What happened after Via first reacted fearfully to newborn Auggie?", "She soon began kissing, cuddling, and caring for him."],
    ["Why can Via barely imagine life before Auggie?", "His arrival reshaped the family while she was still very young."],
    ["Why does Via remember the old photographs?", "They show a family arrangement and parents she cannot personally recall."],
    ["What does abandoning Lilly suggest?", "Her attention and protective love transferred completely to her real brother."],
    ["How did Via's role change after Auggie's birth?", "She moved from being the only child to becoming an intensely protective sister."],
    ["Why is this memory significant?", "Via's devotion to Auggie began almost as early as her own memories."]
  ]},
  { n:34, q:[
    ["When does Via briefly see Auggie as strangers might?", "After returning from a long visit with Grans."],
    ["What does Via remember after describing other people's reactions?", "A private conversation in which Grans called Via her everything."],
    ["Why had Via usually become angry at staring strangers?", "Auggie's face felt normal to her, so their shock seemed cruel and unreasonable."],
    ["Why does Grans make her statement a secret?", "She knows grandparents are not supposed to name a favorite grandchild."],
    ["What does Via's moment of unfamiliarity reveal?", "Familiarity shapes perception, and even Via can briefly absorb the outside gaze."],
    ["How does Via use Grans's memory after the death?", "She holds the secret affection around herself like a comforting blanket."],
    ["What idea connects seeing and being seen here?", "Via protects Auggie from judgment while longing for someone to notice her completely."]
  ]},
  { n:35, q:[
    ["What does Via describe in unusually exact detail?", "The physical features of Auggie's face."],
    ["What conclusion follows her description of family accommodations?", "The family must begin helping Auggie grow more independent."],
    ["Why have family plans often changed around Auggie?", "His health, moods, and needs have been treated as the highest priority."],
    ["Why does Via argue that the old approach cannot continue?", "What protected a small child may prevent an older Auggie from maturing."],
    ["What tension appears in Via's statement that Auggie is not normal?", "She loves him fully while refusing the comforting story the family tells."],
    ["How does Via's perspective differ from Auggie's opening view?", "She emphasizes visible difference and family behavior rather than his ordinary inner self."],
    ["What is the chapter's larger point?", "Honest acceptance must include both a person's humanity and the realities they face."]
  ]},
  { n:36, q:[
    ["What identity does Via want at high school?", "She wants to be Olivia Pullman rather than only Auggie's sister."],
    ["What happens after Via, Miranda, and Ella are accepted together?", "High school begins and the three friends unexpectedly drift apart."],
    ["Why had middle school offered Via an escape from home?", "It was a place where fewer people defined her through Auggie."],
    ["Why is the friendship change especially confusing?", "The girls had expected acceptance at the same school to keep them close."],
    ["What does Via's preferred name suggest?", "She is trying to claim an identity that belongs to her alone."],
    ["How does Via enter high school emotionally?", "Excitement about independence becomes uncertainty and loneliness."],
    ["What central idea does the transition develop?", "A fresh start can create freedom while also disrupting relationships once taken for granted."]
  ]},
  { n:37, q:[
    ["Who originally gave Auggie his astronaut helmet?", "Miranda."],
    ["What does Via notice when she meets Miranda and Ella at school?", "Both have changed their appearance and social style without including her."],
    ["Why does Miranda call Auggie Major Tom?", "The nickname comes from the astronaut helmet and their old affectionate connection."],
    ["Why does Via feel hurt during lunch?", "Her closest friends seem to have planned new identities and left her outside them."],
    ["What does Miranda's past kindness to Auggie show?", "She once treated Via's family as part of her own close world."],
    ["How does Via respond to the friends' transformation?", "She tries to act casual while her voice and feelings reveal pain."],
    ["Why is the old helmet important?", "It symbolizes a friendship and family closeness that now appear to be disappearing."]
  ]},
  { n:38, q:[
    ["What lie does Via tell Miranda about getting home?", "She says Mom can pick her up after all."],
    ["What happens after Via refuses the offered ride?", "She travels home alone and asks Auggie about his first day."],
    ["Why does Via lie about the ride?", "She is too hurt and proud to spend time pretending the friendship is unchanged."],
    ["Why does she question Auggie closely?", "Protecting him remains important even while she is struggling with her own day."],
    ["What does Auggie's sarcastic answer reveal?", "He knows she expects cruelty and resents being asked the obvious."],
    ["How does Via manage her first-day disappointment?", "She hides it from Miranda and turns her attention toward home."],
    ["What parallel does the chapter create?", "Both siblings face school relationships where people may not treat them as they hoped."]
  ]},
  { n:39, q:[
    ["What change in Auggie upsets Via?", "He cuts off the Padawan braid he once treasured."],
    ["What happens after Via argues with Auggie about the braid?", "She retreats to her room, and Dad later checks on her."],
    ["Why does the haircut trouble Via despite disliking the braid?", "It suggests school pressure has made Auggie surrender something that expressed who he was."],
    ["Why does Via resist explaining all her feelings to Dad?", "She is tired of having her pain folded back into concern about Auggie."],
    ["What does asking for Daisy reveal?", "Via wants quiet comfort when words and family attention feel complicated."],
    ["How does Via respond to feeling overlooked?", "She becomes sharp and withdrawn rather than asking directly for attention."],
    ["What does the chapter show about protective love?", "Caring deeply for Auggie can intensify Via's anger when the family misses her needs."]
  ]},
  { n:40, q:[
    ["Where does Via once see Mom late at night?", "Standing silently outside Auggie's partly open bedroom door."],
    ["What happens after Mom notices Via in the hallway?", "She reassures Via about Auggie and walks her back to bed."],
    ["Why is Mom watching Auggie sleep?", "She remains alert to his health and safety even during an ordinary night."],
    ["Why does Via never ask for an explanation?", "The family's constant worry about Auggie is so familiar that she absorbs the question privately."],
    ["What does Mom's ghostlike appearance suggest?", "Fear and watchfulness have become a quiet, exhausting part of motherhood."],
    ["How does Via process the memory?", "She wonders whether Mom has ever watched over her door in the same way."],
    ["What central concern does the scene express?", "Invisible care for one child can feel like invisible neglect to another."]
  ]},
  { n:41, q:[
    ["What does Via ask Mom to do after school?", "Pick her up instead of making her travel home alone."],
    ["What happens after the family discusses the day's transportation?", "Via leaves for the subway with Dad while Mom calls after her."],
    ["Why is Mom focused on schedules and Auggie's lunch?", "The new school routines require her to coordinate both children's different needs."],
    ["Why does Via react impatiently during breakfast?", "She wants a simple request for attention to matter without becoming another discussion of Auggie."],
    ["What does Dad's 'War and Peace' joke suggest?", "He recognizes the family tension and uses humor as they leave."],
    ["How does Via assert more independence?", "She leaves with Dad and signals she heard Mom without turning back."],
    ["Why is this ordinary breakfast meaningful?", "Small scheduling moments reveal the larger struggle over whose needs receive family attention."]
  ]},
  { n:42, q:[
    ["What scientific topic does Via explain?", "The genetic inheritance connected to Auggie's condition."],
    ["What does she establish before discussing the mutation?", "She traces the different family backgrounds of both parents."],
    ["Why can Auggie's condition appear unexpectedly?", "Both parents carry a mutation that combined with other factors in him."],
    ["Why does Via study the medical language?", "She wants an orderly explanation for something that shaped her entire family."],
    ["What surprising fact does Via reveal about herself?", "She carries the same identified mutant gene as her parents."],
    ["How does science affect Via's perspective?", "It gives her precise terms but also makes the family risk personally immediate."],
    ["What idea does the chapter raise?", "Scientific explanation can clarify inheritance without answering every emotional question."]
  ]},
  { n:43, q:[
    ["What possibility worries Via about future children?", "She could pass on the gene connected to Auggie's condition."],
    ["What does Via do after working through the Punnett-square probabilities?", "She reflects on outcomes that medical language cannot predict perfectly."],
    ["Why do the percentages not give Via certainty?", "Auggie's condition involves multiple factors beyond one simple gene."],
    ["Why is Via drawn to technical genetic terms?", "Their order gives names to fears that otherwise feel impossible to control."],
    ["What do the imagined unborn babies reveal?", "The lesson has turned an abstract classroom tool into a personal future fear."],
    ["How does Via move beyond a school exercise?", "She applies the probability model to choices about her own adult life."],
    ["What is the chapter's central tension?", "Knowing statistical risk can increase understanding while also increasing uncertainty."]
  ]},
  { n:44, q:[
    ["Who becomes Via's new close friend?", "Eleanor, whom everyone calls Ellie."],
    ["What happens after Via stops joining Miranda and Ella for lunch?", "The old friends separate quietly and Via forms a new group."],
    ["Why does Via choose a clean break?", "Pretending to enjoy her friends' new crowd is more painful than leaving."],
    ["Why does Via not pass Miranda's greetings to Auggie?", "Auggie is absorbed in his own school life and Via has emotionally stepped away from Miranda."],
    ["What does the lack of an argument reveal?", "Important friendships can end through avoidance rather than one dramatic fight."],
    ["How does Via rebuild after the separation?", "She tolerates lonely lunches until more genuine friendships develop."],
    ["What does 'out with the old' mean here?", "Via chooses relationships that fit who she is instead of chasing friends who have changed."]
  ]},
  { n:45, q:[
    ["Why is October thirty-first sad for Via and Mom?", "It is the anniversary of Grans's death."],
    ["What happens after Auggie unexpectedly comes home sick?", "The family's usual plans and attention shift immediately toward him."],
    ["Why has Mom immersed herself in Auggie's costume?", "Preparing for his favorite holiday helps her manage grief over Grans."],
    ["Why does Via hide her own disappointment?", "She understands Auggie is in serious distress and expects his needs to come first."],
    ["What does the unused Boba Fett costume represent?", "Mom's loving work is set aside without explanation because a larger hurt has occurred."],
    ["How does Via respond to the changed evening?", "She accepts the canceled plans while quietly carrying grief and frustration."],
    ["What larger pattern does the chapter show?", "Via's personal losses repeatedly become background when Auggie needs immediate care."]
  ]},
  { n:46, q:[
    ["What does Via persuade Auggie to do?", "Put on his Boba Fett costume and go trick-or-treating with her."],
    ["What happens after Auggie insists he never wants to return to school?", "Via listens, challenges the decision, and gets him out of bed for Halloween."],
    ["Why is missing trick-or-treating especially serious for Auggie?", "Halloween is the one night he can move around without people judging his face."],
    ["Why does Via offer him all her candy?", "She wants to restore something joyful without forcing him to explain everything first."],
    ["What does Auggie's willingness to dress reveal?", "He has not lost his desire for connection even while feeling betrayed."],
    ["How does Via support him?", "She combines sympathy with a firm push toward an experience he loves."],
    ["What does the chapter suggest about helping someone?", "Comfort can include gently leading a hurt person back toward life rather than leaving them alone."]
  ]},
  { n:47, q:[
    ["What school decision is Auggie considering?", "Quitting Beecher Prep after Halloween."],
    ["What happens after Via learns what Jack said?", "She helps Auggie weigh the betrayal and argues that one person should not decide his future."],
    ["Why does Via keep the incident from their parents?", "She promised Auggie and wants him to decide when to share it."],
    ["Why does Via challenge Auggie to return?", "Leaving would give Jack's cruel words control over a choice Auggie made for himself."],
    ["What does Miranda's message through Auggie reveal?", "The broken friendship still matters deeply to both girls."],
    ["How does Via balance sisterhood and her own feelings?", "She advises Auggie firmly while quietly treasuring news that Miranda misses her."],
    ["What central idea closes Via's section?", "Honest support respects pain but does not let one hurt erase every possibility."]
  ]},
  { n:48, q:[
    ["Why does Summer say she sits with Auggie?", "She wants to be his friend because he is a nice kid."],
    ["What happens after other students call Summer a saint?", "She rejects the praise and explains that friendship is her own choice."],
    ["Why did Summer first approach Auggie's table?", "She saw a new child eating alone while everyone else avoided him."],
    ["Why does she defend Auggie from the word freak?", "Knowing him as a person makes the label feel both false and cruel."],
    ["What does the attention toward Summer reveal?", "Students treat ordinary friendship with Auggie as an extraordinary sacrifice."],
    ["How has Summer's reason for staying changed?", "Initial sympathy has become a genuine friendship she enjoys."],
    ["Who are the truly weird kids in Summer's view?", "The students who make kindness seem strange instead of seeing Auggie as a kid."]
  ]},
  { n:49, q:[
    ["What does the Plague game require students to avoid?", "Touching Auggie or an object immediately after he touches it."],
    ["What happens after Summer spends more time eating with Auggie?", "She stops feeling sorry for him and keeps returning because he is fun."],
    ["Why will Maya not play Four Square with them?", "She fears touching a ball that Auggie has just used."],
    ["Why does Summer prefer playing with Auggie?", "He still enjoys active games instead of only talking about popularity and dating."],
    ["What contradiction does Maya show?", "She admits the Plague is dumb but still obeys its rules."],
    ["How does Summer's view of Auggie develop?", "His face becomes familiar while his humor and companionship become more important."],
    ["What does the Plague symbolize?", "Prejudice spreads through group behavior even when individuals know it is unreasonable."]
  ]},
  { n:50, q:[
    ["What does Savanna pressure Summer to do at the Halloween party?", "Stop spending time with Auggie and consider dating Julian."],
    ["What happens after Summer hears the popular group's demands?", "She calls Mom, hides in the bathroom, and leaves the party early."],
    ["Why was Summer invited to the party?", "Savanna hoped the invitation could be used to control her friendships."],
    ["Why does Summer refuse the group's plan?", "Popularity is not worth betraying Auggie or pretending to like Julian."],
    ["What does the missing unicorn costume show?", "Summer has already changed one harmless choice to fit the group's expectations."],
    ["How does Summer act once the price of belonging becomes clear?", "She removes herself rather than trade her values for status."],
    ["What central choice does the chapter present?", "Real friendship matters more than an invitation to a powerful social group."]
  ]},
  { n:51, q:[
    ["What does Auggie tell Summer happened on Halloween?", "He overheard Jack saying cruel things about him."],
    ["What happens after Auggie returns to lunch acting distant?", "Summer confronts him, hears the truth, and they repair the friendship."],
    ["Why does Summer lie about leaving Savanna's party?", "She wants to avoid more pressure and keep her private decision from becoming gossip."],
    ["Why does she forgive Auggie's rude behavior?", "His betrayal by Jack explains why he is hurt and mistrustful."],
    ["What does their pinky swear provide?", "A direct promise that neither will treat the other with secret cruelty."],
    ["How does Summer respond to conflict with Auggie?", "She asks for honesty, listens, and sets a boundary instead of abandoning him."],
    ["What does the chapter show about repairing friendship?", "Understanding a hurtful action can support forgiveness without pretending it was acceptable."]
  ]},
  { n:52, q:[
    ["Whose reaction worries Summer when Auggie visits?", "Her mother's surprised reaction to Auggie's face."],
    ["What happens after the awkward first greeting?", "Auggie stays for dinner and openly explains his medical condition with humor."],
    ["Why did Summer warn her mother in advance?", "She wanted to protect Auggie from an uncontrolled look of shock."],
    ["Why does Auggie describe himself as a medical wonder?", "He turns a complicated and rare condition into a joke he controls."],
    ["What does his invitation to laugh reveal?", "He wants honest shared humor rather than tense pity."],
    ["How does Summer's mother adjust?", "She moves past surprise and welcomes Auggie into the family meal."],
    ["Why is the dinner significant?", "Auggie expands the friendship into a home where discomfort can become understanding."]
  ]},
  { n:53, q:[
    ["What project do Summer and Auggie display?", "An Egyptian tomb in the school museum."],
    ["What happens after Jack asks why Auggie is angry with him?", "Summer keeps Auggie's confidence but whispers the clue Bleeding Scream."],
    ["Why will Summer not tell Jack the full story?", "She made a firm promise not to reveal what Auggie overheard."],
    ["Why does she offer a clue at all?", "She sees that Jack is genuinely confused and hopes he can work out the harm himself."],
    ["What does the successful exhibit show about Summer and Auggie?", "Their friendship now includes productive work and family connections."],
    ["How does Summer balance competing loyalties?", "She protects Auggie's secret while giving Jack limited help."],
    ["What role does the whispered clue play?", "It creates a path toward accountability without breaking a friend's trust."]
  ]},
  { n:54, q:[
    ["What favor does Mr. Tushman ask of Jack?", "Help welcome and guide a new student named August."],
    ["What happens after Jack overhears Mom's phone conversation?", "He realizes which child she means and strongly objects."],
    ["Why does Jack identify Auggie before hearing the name?", "Auggie's appearance and neighborhood reputation make the request obvious."],
    ["Why does Jack initially refuse?", "He expects being near Auggie to feel uncomfortable and damage his social standing."],
    ["What does calling Auggie deformed reveal?", "Jack begins from the same appearance-centered assumptions as many other children."],
    ["How does Jack enter the story as a narrator?", "He honestly admits that his first response was fear and resistance."],
    ["Why is Mr. Tushman's call important?", "It begins a friendship through an assigned act that must later become a real choice."]
  ]},
  { n:55, q:[
    ["Where did Jack first see Auggie years earlier?", "Outside a Carvel ice-cream shop."],
    ["What happens after young Jamie reacts loudly to Auggie?", "Babysitter Veronica removes the children and tells them their behavior was wrong."],
    ["Why does Veronica correct the children?", "Auggie and his family can hear and be hurt by their frightened reactions."],
    ["Why does Jack still sneak second looks later?", "Knowing better does not immediately remove his shock or curiosity."],
    ["What does the neighborhood's knowledge of Auggie show?", "People have formed ideas about him without his knowing any of them."],
    ["How does Jack remember the incident?", "He recognizes his own discomfort while also remembering the lesson to act normally."],
    ["What does the memory explain?", "Jack's first response to the school request comes from a long-standing social reaction, not knowledge of Auggie."]
  ]},
  { n:56, q:[
    ["What finally changes Jack's mind about helping Auggie?", "He hears his little brother cruelly imitate running away from Auggie."],
    ["What happens after Mom names Julian and Charlotte as other guides?", "Jack thinks about their motives and later agrees to participate."],
    ["Why does Jamie's behavior affect Jack so strongly?", "If a usually kind little child can be cruel, Auggie will need someone beside him at school."],
    ["Why does Jack not trust Julian's agreement?", "He knows Julian often acts generous when adults are watching."],
    ["What does Jack infer about middle school?", "Children like Julian will make it nearly impossible for Auggie to manage alone."],
    ["How does Jack's decision develop?", "Reluctance changes into a deliberate choice to give Auggie a fair chance."],
    ["What central idea drives the change?", "Recognizing how ordinary cruelty works can create a responsibility to interrupt it."]
  ]},
  { n:57, q:[
    ["What is the first thing Jack says happens over time?", "People get used to Auggie's face."],
    ["What change follows Jack's initial assigned kindness?", "He discovers Auggie is funny and becomes the friend he would choose."],
    ["Why does Jack enjoy sitting with Auggie?", "Auggie is easy to talk to, understands jokes, and behaves like a good friend."],
    ["Why does Jack compare Auggie with every other fifth-grade boy?", "He wants to show the friendship is now voluntary rather than a duty."],
    ["What evidence disproves the idea that Jack stays from pity?", "He says he would choose Auggie even with every other boy available."],
    ["How has Jack's perception developed?", "Auggie's personality replaces his face as the feature Jack notices most."],
    ["What do the four things establish?", "Genuine familiarity can turn an assigned welcome into an equal friendship."]
  ]},
  { n:58, q:[
    ["What clue from Summer confuses Jack?", "The words Bleeding Scream."],
    ["What happens after Auggie suddenly stops talking to Jack?", "Jack searches for an explanation and feels excluded from a friendship he valued."],
    ["Why can Jack not understand Auggie's anger?", "He does not remember that the unknown Halloween listener was Auggie."],
    ["Why does Jack dislike spending more time with the popular group?", "Their company does not feel as honest or enjoyable as time with Auggie."],
    ["What does blaming Auggie reveal?", "Jack has not yet faced his own role and responds to confusion with defensiveness."],
    ["How does Jack feel about becoming an ex-friend?", "He realizes too late that losing Auggie matters more than gaining popularity."],
    ["What central problem remains unresolved?", "Jack cannot repair the friendship until he understands the harm he caused."]
  ]},
  { n:59, q:[
    ["What object does Jack rescue and name Lightning?", "A discarded wooden sled."],
    ["What happens after Jack fixes the sled with his father?", "He enjoys it on Skeleton Hill and later recognizes it came from Julian's family."],
    ["Why does Jack hide where Lightning came from?", "He fears richer classmates will mock him for using their trash."],
    ["Why does the snow day not solve Jack's sadness?", "The fun ends, but his broken friendship with Auggie remains."],
    ["What does the sled reveal about Jack's family?", "They make something valuable through work because buying expensive equipment is difficult."],
    ["How does Jack return to school?", "He exchanges only a distant greeting with Auggie and feels emotionally slushy."],
    ["What does Lightning symbolize?", "Something dismissed by a wealthier child can still have worth when another person sees it."]
  ]},
  { n:60, q:[
    ["What is Mr. Browne's December precept?", "Fortune favors the bold."],
    ["What does Jack do after considering his bravest action?", "He writes about overcoming fear of the ocean instead of befriending Auggie."],
    ["Why can Jack not write his honest answer?", "He fears classmates will hear it and judge friendship with Auggie."],
    ["Why does he privately call the friendship brave?", "Choosing Auggie required resisting the appearance fears and social pressure around him."],
    ["What does the lame ocean story reveal?", "Jack recognizes courage but is not yet brave enough to name it publicly."],
    ["How is Jack beginning to change?", "He can now identify the friendship as meaningful even while hiding that truth."],
    ["Why is the precept challenging for Jack?", "It asks for visible courage when his greatest regret came from yielding to a crowd."]
  ]},
  { n:61, q:[
    ["What truth does Jack explain about his family?", "They are not wealthy even though he attends a private school."],
    ["What happens after Julian talks about the old sled?", "Jack realizes Lightning was Julian's discarded sled and walks away embarrassed."],
    ["Why did Jack's family sell their car?", "They needed money to afford his younger brother's Beecher Prep tuition."],
    ["Why does Jack lie about needing a book?", "He wants to escape before classmates discover he happily used something they called hobo trash."],
    ["What does Julian's attitude toward the sled reveal?", "Privilege lets him dismiss an object that required effort and mattered to Jack."],
    ["How does Jack handle the class difference?", "He hides it rather than risk becoming another target for the group."],
    ["What larger issue does the chapter add?", "Belonging at school is shaped by wealth as well as appearance and popularity."]
  ]},
  { n:62, q:[
    ["What does Bleeding Scream finally make Jack remember?", "Auggie wore that costume when Jack insulted him on Halloween."],
    ["What happens while Ms. Rubin explains the science project?", "Jack reconstructs the Halloween scene and realizes Auggie heard everything."],
    ["Why had Jack believed he could speak freely that morning?", "He expected Auggie to wear Boba Fett and did not recognize the other costume."],
    ["Why does the memory make Jack feel sick?", "He now understands that his own words directly betrayed a real friend."],
    ["What does the crying mask image represent?", "The costume Jack ignored now mirrors the pain he caused beneath it."],
    ["How does Jack's understanding change?", "Confusion about Auggie's anger becomes clear personal responsibility."],
    ["Why is recognition necessary?", "Repair cannot begin until Jack stops treating the conflict as Auggie's unexplained fault."]
  ]},
  { n:63, q:[
    ["Who is assigned as Jack's science-fair partner?", "Auggie."],
    ["What happens after Julian tells Jack he need not be friends with Auggie?", "Jack punches Julian in the mouth."],
    ["Why does Jack refuse a different partner?", "He wants the chance to work with Auggie and begin repairing the friendship."],
    ["Why does Julian's insult trigger the punch?", "Jack has just accepted his guilt and can no longer tolerate calling Auggie a freak."],
    ["What does Jack's sudden action reveal?", "His loyalty has become real, but he still lacks a thoughtful way to defend it."],
    ["How does Jack move from thought to action?", "He rejects Julian publicly instead of hiding his friendship."],
    ["What complication does the punch create?", "Standing up for someone is morally important, but violence brings new harm and consequences."]
  ]},
  { n:64, q:[
    ["What consequence does Jack receive for punching Julian?", "A suspension from school."],
    ["What happens after Mr. Tushman asks why the fight occurred?", "Jack refuses to expose Auggie's private humiliation, and the principal shows some understanding."],
    ["Why will Jack not fully explain the punch?", "Repeating Julian's words would reveal a secret that belongs to Auggie."],
    ["Why does Mr. Tushman avoid the harshest punishment?", "He senses there is an important reason and recognizes Jack's remorse."],
    ["What does Jack's silence provide evidence of?", "He is now protecting Auggie even when honesty could reduce his own punishment."],
    ["How does Jack face the consequence?", "He apologizes, accepts responsibility, and leaves without blaming Auggie."],
    ["What does the detention meeting distinguish?", "A wrong action can have an understandable motive without becoming acceptable."]
  ]},
  { n:65, q:[
    ["What has Julian's mother done to the class photograph?", "She has removed Auggie with photo-editing software."],
    ["What happens after Jack sees the Pullman holiday card?", "He tells his mother the truth about Halloween and why he punched Julian."],
    ["Why does the altered photograph upset Jack's mother?", "An adult has modeled the same exclusion children are being asked to overcome."],
    ["Why can Jack finally explain the fight at home?", "The evidence of adult cruelty makes him ready to connect it with Julian's words."],
    ["What contrast do the two holiday cards create?", "One family shares a playful dog picture while the other erases a classmate."],
    ["How does Jack's honesty develop?", "He moves from protecting the secret through silence to trusting Mom with the full context."],
    ["Why are adult choices important here?", "Children learn inclusion or prejudice partly from what their parents treat as acceptable."]
  ]},
  { n:66, q:[
    ["How do Jack and Auggie finally communicate directly?", "Through online messages and text messages during winter break."],
    ["What happens after Jack apologizes and explains Halloween?", "Auggie tests his sincerity, accepts it, and declares them friends again."],
    ["Why does Jack also apologize to Julian?", "He accepts that punching was wrong even though Julian's words were cruel."],
    ["Why does Auggie ask whether Jack meant the worst comment?", "He needs an honest answer about the sentence that hurt him most."],
    ["What does their joke about Julian show?", "Shared humor returns once the apology addresses the real injury."],
    ["How does Jack repair the relationship?", "He names what he did, answers honestly, and lets Auggie decide whether to forgive."],
    ["What does the collection of messages show?", "Accountability and communication can rebuild trust that silence destroyed."]
  ]},
  { n:67, q:[
    ["What happens to Jack's social life after winter break?", "Many classmates avoid him and leave him alone at lunch."],
    ["What does Jack do after finding himself alone at the table?", "He skips lunch and goes to read in the library."],
    ["Why are students suddenly ignoring Jack?", "Julian's group is punishing him for the fight and his loyalty to Auggie."],
    ["Why does the empty table hurt Jack?", "It makes the social rejection public and leaves him feeling friendless."],
    ["What new understanding does Jack gain?", "He experiences a small version of the isolation Auggie has faced repeatedly."],
    ["How does Jack respond at first?", "He withdraws to the library rather than confront the organized exclusion."],
    ["Why is the lack of a clean slate important?", "A sincere apology repairs one friendship but does not erase wider social consequences."]
  ]},
  { n:68, q:[
    ["Who explains the organized conflict to Jack?", "Charlotte."],
    ["What happens after Jack meets Charlotte privately?", "She describes Julian's campaign and promises to share more information."],
    ["Why does Charlotte insist on secrecy?", "She wants to help without losing her neutral status or becoming a target."],
    ["Why has Julian turned the grade against Jack?", "He wants revenge for the punch and for Jack choosing Auggie's side."],
    ["What does Charlotte's fear reveal?", "Even students who recognize unfairness can be controlled by social risk."],
    ["How does Jack's understanding develop?", "He learns that the cold behavior is a planned war rather than separate accidents."],
    ["What does calling it a war emphasize?", "School popularity can organize exclusion with sides, pressure, and consequences."]
  ]},
  { n:69, q:[
    ["Where does Jack finally receive a sincere lunch invitation?", "At Summer and Auggie's table."],
    ["What happens after several boys try to force Jack away from their table?", "He leaves, and Summer and Auggie wave him over."],
    ["Why do Tristan, Nino, and Pablo switch tables?", "They fear Julian's social punishment for being seen with Jack."],
    ["Why does Jack ignore the lunch teacher calling him?", "He wants to escape the public humiliation quickly."],
    ["What does the invitation reveal about Auggie?", "Auggie offers belonging to the person who once failed to offer it to him."],
    ["How does Jack's lunch position change?", "He moves from chasing reluctant approval to accepting genuine friendship."],
    ["Why is the table switch significant?", "The smallest group demonstrates more loyalty than the larger popular crowd."]
  ]},
  { n:70, q:[
    ["What does Jack admit about the first day of school?", "He saw Auggie alone at lunch but chose not to sit with him."],
    ["What happens after Jack describes being ignored during the war?", "Auggie tells him sarcastically that he now understands Auggie's world."],
    ["Why did Jack avoid Auggie at that first lunch?", "After spending classes with him, Jack wanted time that felt socially normal."],
    ["Why does Jack call himself a hypocrite?", "He now suffers the exclusion he once helped create by staying away."],
    ["What does Auggie's response reveal?", "He can use humor while making Jack recognize the unequal experience between them."],
    ["How has Jack's perspective developed?", "Being rejected gives him empathy he did not gain from observation alone."],
    ["What is the chapter's central lesson?", "Personal experience can expose the harm hidden inside an easy, socially accepted choice."]
  ]},
  { n:71, q:[
    ["What does Charlotte's list organize?", "Students on Jack's side, Julian's side, and neutral students."],
    ["What happens after Summer shows Jack and Auggie the list?", "They discuss the sides and end up laughing together about dating."],
    ["Why are so few popular students on Jack's side?", "Supporting him risks losing Julian's approval and group status."],
    ["Why does Summer share the list?", "She wants Jack to understand who may support or avoid him."],
    ["What does Auggie's joke about girls reveal?", "He can use self-aware humor without letting the conflict control the friendship."],
    ["How do the three friends respond to the war?", "They create their own comfortable space instead of measuring themselves only by the list."],
    ["What does the chapter suggest about sides?", "A small honest friendship can matter more than a large count of uncertain allies."]
  ]},
  { n:72, q:[
    ["Why does Jack visit Auggie's house?", "They need to choose and begin their science-fair project."],
    ["What happens after Jack enters Auggie's home?", "He relaxes, works with Auggie, and meets Via before Justin arrives."],
    ["Why is Jack nervous about seeing Auggie's parents?", "He does not know whether they have heard about his Halloween betrayal."],
    ["Why does Auggie tease Jack about Via?", "Their repaired friendship is comfortable enough for joking at home."],
    ["What does the Pullmans' friendly welcome suggest?", "Auggie has kept the incident private and is giving Jack a real second chance."],
    ["How does Jack feel inside Auggie's family space?", "Anxiety gives way to ordinary friendship and playful conversation."],
    ["Why is the visit important?", "The friendship moves beyond school conflict into shared work and family life."]
  ]},
  { n:73, q:[
    ["Whom do Jack and Auggie meet at the house?", "Via's boyfriend Justin."],
    ["What happens after Justin introduces himself?", "His nervous speech and mannerisms become a private joke between the boys."],
    ["Why does Justin seem nervous?", "He is meeting Via's brother and Jack for the first time, including seeing Auggie."],
    ["Why does Via ask the boys to be nice?", "She senses Justin is anxious and wants the meeting to go well."],
    ["What does Jack notice without openly confronting?", "Justin's nerves appear in his voice and physical tics."],
    ["How do Jack and Auggie act together afterward?", "They laugh as equals over a shared observation."],
    ["What does the ending show about their friendship?", "After reconciliation, they have regained the easy humor of close friends."]
  ]},
  { n:74, q:[
    ["How does Justin react when he first sees Auggie?", "He is startled but works hard not to show it."],
    ["What happens after Justin and Auggie spend some time together?", "Justin tells Olivia he is not frightened and accepts her reassurance."],
    ["Why was Justin unprepared for Auggie's appearance?", "Descriptions of a syndrome and surgeries had made him imagine smaller differences."],
    ["Why does Olivia ask whether he is okay?", "She is protecting Auggie and testing whether Justin can accept her family."],
    ["What does the tossed polar bear signal?", "Olivia either believes Justin or chooses to trust that he will be kind."],
    ["How does Justin manage his initial surprise?", "He looks beyond the first reaction and treats Auggie as Olivia's little brother."],
    ["What central test begins Justin's section?", "Caring for Olivia requires honest acceptance of the family she fiercely loves."]
  ]},
  { n:75, q:[
    ["What gifts do Justin and Olivia exchange?", "A heart necklace and a handmade floppy-disk messenger bag."],
    ["What happens after Justin nervously meets the Pullman family for dinner?", "Their warmth relaxes him and his nervous tics stop."],
    ["Why does Olivia want to study genetics?", "She hopes science might help people with conditions like Auggie's."],
    ["Why is Justin anxious before the family meal?", "His own family is distant, so close parental attention feels unfamiliar."],
    ["What contrast does he notice between the two homes?", "The Pullmans openly express love while his parents are absent and self-involved."],
    ["How does the evening affect Justin physically?", "Feeling welcomed quiets the tics that appear when he is stressed."],
    ["What does the chapter suggest about family care?", "Consistent affection can make a guest feel safer than he feels in his own home."]
  ]},
  { n:76, q:[
    ["Which role does Justin receive in the school play?", "The Stage Manager in Our Town."],
    ["What happens after Olivia auditions?", "Miranda gets Emily, while Olivia becomes the understudy and takes a smaller role."],
    ["Why does the drama teacher change from The Elephant Man?", "Miranda says a family connection to facial difference makes that play too personal."],
    ["Why is Olivia almost relieved not to play Emily?", "She is uncomfortable being stared at despite her talent."],
    ["What does Justin notice about the casting result?", "He is more disappointed for Olivia than she appears to be for herself."],
    ["How does Olivia influence Justin?", "Her dare helps him attempt and win a lead role he never expected."],
    ["What larger idea begins through the play?", "Performance can let people try new identities while exposing what they prefer to hide."]
  ]},
  { n:77, q:[
    ["What helps Justin and Olivia rehearse on the stoop?", "They practice his Stage Manager lines together."],
    ["What happens after a ladybug lands nearby?", "They each make a private wish and share an affectionate moment."],
    ["Why is Olivia helping Justin repeatedly?", "His role contains long speeches and opening night is approaching."],
    ["Why do they keep their wishes secret?", "The private hopes matter partly because neither wants to control the other's answer."],
    ["What does the sky matching Olivia's eyes suggest?", "Justin's attention is centered lovingly on her during the ordinary evening."],
    ["How has their relationship developed?", "Shared work and playful mystery have created ease and trust."],
    ["What does the ladybug scene emphasize?", "Quiet moments of connection can carry hopes that characters cannot yet say directly."]
  ]},
  { n:78, q:[
    ["Whom does Justin walk to the bus stop?", "Jack."],
    ["What happens after Julian's friends insult Jack?", "Justin follows them, threatens them with his fiddle case, and scares them away."],
    ["Why does Justin intervene?", "He recognizes that the boys are targeting Jack because of his loyalty to Auggie."],
    ["Why does he tap the fiddle case?", "He lets the bullies imagine it holds something dangerous without actually attacking them."],
    ["What do the boys' reactions reveal?", "Their confidence disappears when someone larger challenges their behavior."],
    ["How does Justin use his unusual appearance and tics?", "He turns qualities that can draw judgment into a convincing protective performance."],
    ["What does the encounter show about allies?", "Someone outside the school conflict can interrupt bullying by refusing to ignore it."]
  ]},
  { n:79, q:[
    ["What instrument does Justin add to his Stage Manager performance?", "His fiddle."],
    ["What happens when Justin needs time to remember a line?", "He plays a short tune until the words return."],
    ["Why does the instrument improve his rehearsal?", "It fits the play and gives him a natural pause during long speeches."],
    ["Why does Miranda show Justin Auggie's photograph?", "She wants him to know her old closeness to Olivia's family."],
    ["What does carrying the picture suggest about Miranda?", "Her changed style has not erased her affection for Auggie."],
    ["How does Justin grow into the role?", "He adapts it creatively instead of letting difficult lines defeat him."],
    ["What question does Miranda's comment raise?", "Whether the universe's unfairness can be answered by the care surrounding Auggie."]
  ]},
  { n:80, q:[
    ["What fact does Justin learn Olivia hid?", "She and Miranda used to be close friends."],
    ["What happens after Justin presses Olivia about the secret?", "She admits shame about not telling her new school that Auggie is her brother."],
    ["Why did Olivia keep the connection to Miranda hidden?", "Acknowledging Miranda would expose the family history Olivia has concealed."],
    ["Why does Justin comfort rather than condemn her?", "He understands that a lifetime of responsibility can include moments of human exhaustion."],
    ["What does Olivia's birdlike image reveal?", "Her anger covers a frightened need for safety and belonging."],
    ["How does Justin respond to Olivia's vulnerability?", "He gives her emotional shelter instead of demanding a perfect sister."],
    ["What central idea does the chapter develop?", "Loving someone deeply does not prevent shame, fatigue, or the need for forgiveness."]
  ]},
  { n:81, q:[
    ["What question keeps Justin awake?", "Whether the universe has been unfair to Auggie and his family."],
    ["What conclusion follows Justin's thoughts about impossible odds?", "He decides unseen forms of love may help balance the unfairness."],
    ["Why does Auggie's condition seem like a cruel lottery?", "Its extreme rarity makes the family's suffering feel random and undeserved."],
    ["Why does Justin list parents, Via, Jack, and Miranda?", "Their different kinds of devotion show how Auggie is protected and valued."],
    ["What does the bird metaphor suggest?", "Fragile people may survive partly because others create shelter around them."],
    ["How does Justin's thinking change?", "He moves from anger at randomness toward cautious belief in human care."],
    ["What is the chapter's central idea?", "The universe may be unfair, but love can answer some of its cruelty."]
  ]},
  { n:82, q:[
    ["What grade do Auggie and Jack receive for the Spud Lamp?", "An A."],
    ["What happens as families gather around the science projects?", "Auggie observes that parents form groups similar to their children's groups."],
    ["Why is Jack especially excited by the grade?", "It is his first A in any class that school year."],
    ["Why does Auggie watch the parents instead of only the exhibits?", "Their friendships reveal another pattern behind school social groups."],
    ["What does Mom mean by like seeks like?", "People often choose company that feels socially familiar to them."],
    ["How does Auggie view the successful fair?", "He takes pride in the project while noticing the wider community around it."],
    ["Why does the observation matter?", "Children's divisions do not exist separately from the adult relationships surrounding school."]
  ]},
  { n:83, q:[
    ["What kind of messages appear during the school war?", "Cruel notes and altered pictures aimed at Auggie and Jack."],
    ["What happens after Auggie jokes about an Auggie Doll?", "Maya later gives him an Uglydoll key chain with a kind note."],
    ["Why do Auggie and Jack avoid reporting the notes?", "They fear seeking adult help will be labeled snitching and worsen the conflict."],
    ["Why can the class eventually laugh at Auggie's joke?", "Auggie's humor gives permission to reject the insult without denying it existed."],
    ["What does Maya's gift show?", "More classmates are beginning to express support openly."],
    ["How does Auggie respond to the campaign?", "He and Jack answer some cruelty with humor and notice that the social climate is changing."],
    ["What is significant about the Auggie Doll?", "A label meant to reduce him becomes an occasion for connection and kindness."]
  ]},
  { n:84, q:[
    ["What medical device must Auggie begin using?", "Behind-the-ear hearing aids."],
    ["What happens after the doctor fits the devices?", "Auggie protests before the doctor switches them on."],
    ["Why has Auggie hidden his worsening hearing?", "He fears another visible device will make his ears and appearance stand out."],
    ["Why do his parents insist on the appointment?", "The growing ocean sound is drowning out speech and interfering with school."],
    ["What do Auggie's tears reveal?", "Past medical experiences make even helpful treatment feel like another unwanted burden."],
    ["How does Auggie approach the hearing aids at first?", "He judges them by how they look before experiencing what they can do."],
    ["What conflict does the chapter set up?", "A device that improves access can still create real anxiety about visible difference."]
  ]},
  { n:85, q:[
    ["What disappears when the hearing aids are activated?", "The constant ocean-like noise inside Auggie's head."],
    ["What happens after Auggie wears the devices to school?", "Classmates and teachers respond calmly instead of mocking him."],
    ["Why does Auggie compare sound with a bright room?", "Clear hearing feels like a light turning on after unnoticed dimness."],
    ["Why does Mr. Browne ask Auggie to speak up if needed?", "He wants to support access without treating the devices as strange."],
    ["What does the ordinary response from school reveal?", "Auggie's feared humiliation was much larger than other people's actual reaction."],
    ["How does Auggie's attitude change?", "Immediate resistance becomes appreciation for hearing clearly."],
    ["What central lesson does Auggie state?", "A problem can consume our worry and then become manageable once we face it."]
  ]},
  { n:86, q:[
    ["What secret has Via kept from Mom?", "Her high school's upcoming production of Our Town."],
    ["What happens after Mom discovers the play?", "She and Via argue about secrecy, Auggie, and years of uneven attention."],
    ["Why did Via hide the performance?", "She did not want new classmates or families connecting her identity with Auggie."],
    ["Why is Mom especially hurt?", "Via excluded the family from an important event instead of trusting them with the truth."],
    ["What does Via's accusation reveal?", "She believes Mom learned to leave her alone because Auggie always needed more."],
    ["How does Auggie experience the argument?", "His hearing aids let him hear painful truths that the family did not intend to tell him."],
    ["What central conflict erupts?", "Via's need for a separate identity clashes with the family's expectation of honesty and inclusion."]
  ]},
  { n:87, q:[
    ["What is wrong with Daisy during dinner?", "She has been vomiting and has a veterinary appointment."],
    ["What happens after Auggie complains that he is not invited to Via's play?", "He retreats angrily, then Via arrives to say Daisy is seriously ill."],
    ["Why do Mom and Via consider excluding Auggie from the play?", "The mature play and Via's hidden family connection make attendance complicated."],
    ["Why does Auggie hide in his stuffed-animal cave?", "He feels rejected and expects Mom to follow and comfort him."],
    ["What does Mom's failure to come reveal?", "Auggie's hurt is no longer the most urgent problem in the house."],
    ["How is Auggie confronted with his own self-focus?", "Via bluntly tells him Daisy's crisis is not about him."],
    ["Why is the interruption significant?", "A real family emergency breaks the pattern in which every conflict centers on Auggie."]
  ]},
  { n:88, q:[
    ["Why does Mom take Daisy to the emergency veterinarian?", "Daisy is in severe pain and may be dying."],
    ["What happens after Auggie and Via say goodbye to Daisy?", "Mom and Dad leave with her while the siblings hold each other and cry."],
    ["Why does Via insist Auggie come immediately?", "There may not be another chance for him to see Daisy alive."],
    ["Why does Mom try to stay calm?", "She must care for Daisy while helping both children face what is happening."],
    ["What does the family's goodbye reveal about Daisy?", "She is not merely a pet but a source of unconditional love for everyone."],
    ["How do Auggie and Via respond together?", "Their earlier argument disappears as shared grief brings them close."],
    ["What central change occurs?", "Loss forces the siblings to look beyond resentment and support one another."]
  ]},
  { n:89, q:[
    ["What do Via and Auggie gather on the coffee table?", "Daisy's toys."],
    ["What happens after Justin joins the family?", "They remember Daisy, learn she has died, and Auggie later falls asleep imagining her."],
    ["Why do the toys matter so much?", "Ordinary objects now carry memories of a dog who will not return."],
    ["Why does Justin stay with the siblings?", "He wants to comfort Via and Auggie while their parents are gone."],
    ["What does Auggie's imagined licking reveal?", "He remembers Daisy loving his face without judgment."],
    ["How does Auggie move through the first night of grief?", "He revisits memories and uses imagination to feel Daisy beside him."],
    ["What does the chapter show about mourning?", "Small belongings and repeated memories help people remain connected to someone lost."]
  ]},
  { n:90, q:[
    ["Where does Auggie go after waking in the night?", "Into his parents' bed beside Mom."],
    ["What happens after Auggie apologizes for the dinner argument?", "Mom reassures him and talks gently as the family falls asleep."],
    ["Why does Auggie ask about heaven?", "Daisy's death makes him wonder where love and identity go after life."],
    ["Why does Daisy shape his idea of heaven?", "With Daisy, his face never affected how completely he was loved."],
    ["What does the quiet family breathing suggest?", "Auggie feels surrounded by people who share the same grief."],
    ["How does Auggie's thinking widen?", "He moves from apologizing for one fight to imagining a place beyond appearance."],
    ["What central comfort does the chapter offer?", "Unconditional love gives Auggie a way to imagine peace after loss."]
  ]},
  { n:91, q:[
    ["What surprise occurs when Emily enters during the play?", "Via performs the role instead of Miranda."],
    ["What happens after the family receives tickets?", "They attend and discover that Via has gone on as Miranda's understudy."],
    ["Why does Via have the opportunity to perform Emily?", "Miranda reports that she is too sick to take the stage."],
    ["Why does Via hug Auggie before leaving?", "After Daisy's death and their argument, she wants him to know she loves him and is proud."],
    ["What do Mom and Dad's reactions show?", "They are astonished and deeply proud to see Via at the center of the stage."],
    ["How does Auggie experience Via's school world?", "He watches his sister succeed in a place where she has her own identity."],
    ["Why is the understudy moment significant?", "Via finally receives the focused family attention and public role she has long lacked."]
  ]},
  { n:92, q:[
    ["Who finds and hugs Auggie in the crowded backstage area?", "Miranda."],
    ["What happens after Via completes the emotional final scene?", "The family goes backstage, where Auggie becomes lost before Miranda finds him."],
    ["Why does the ending of Our Town make the audience cry?", "Emily recognizes too late how precious ordinary life and family moments are."],
    ["Why is Auggie surprised by Miranda?", "He expected her onstage and has not seen her affection directly in a long time."],
    ["What does the Major Tom greeting prove?", "Miranda still remembers and values her old bond with Auggie."],
    ["How does Auggie respond to finding Miranda?", "Confusion in the crowd turns into an immediate, tight embrace."],
    ["What idea connects the play and reunion?", "People often recognize the value of ordinary relationships after distance or loss."]
  ]},
  { n:93, q:[
    ["What false story does Miranda tell at summer camp?", "She claims Auggie is her own little brother."],
    ["What happens after Miranda returns from camp?", "She adopts a new appearance, reconnects with Ella, and avoids calling Via."],
    ["Why does Miranda invent the brother story?", "Talking about Auggie earns sympathy and recreates the family closeness missing from her life."],
    ["Why does she choose Ella instead of Via afterward?", "Ella asks fewer serious questions about divorce, family, and the camp lies."],
    ["What does Miranda's distant mother reveal?", "Her home lacks the emotional attention she experienced with the Pullmans."],
    ["How does Miranda change at camp?", "Family pain and successful lies help her construct a bolder but less honest identity."],
    ["What central idea explains the camp lies?", "A person may borrow someone else's story when their own need for care feels unseen."]
  ]},
  { n:94, q:[
    ["Why is Miranda partly responsible for the school choosing Our Town?", "She asks the teacher to replace The Elephant Man because of Auggie."],
    ["What happens after Miranda and Via enter high school?", "Miranda changes groups, judges Via, and wins the role of Emily."],
    ["Why do Miranda and Ella badmouth Via?", "Pretending Via changed makes it easier to excuse their own decision to abandon her."],
    ["Why does Miranda audition for Emily?", "She knows Via wants the role and is still drawn into competition with her old friend."],
    ["What does Miranda admit about Via?", "Via remained essentially the same while Miranda and Ella became different people."],
    ["How does Miranda view the friendship break?", "She recognizes her own responsibility instead of honestly blaming Via."],
    ["What does the chapter reveal about social reinvention?", "Changing identity can require stories that hide guilt about people left behind."]
  ]},
  { n:95, q:[
    ["What does Miranda miss most about Via?", "The safety and warmth of Via's family, especially Auggie."],
    ["What happens after Miranda calls the Pullman house?", "She speaks lovingly with Auggie and asks him to tell Via she is missed."],
    ["Why does Miranda feel safer with the Pullmans?", "Their parents openly love their children and always welcomed her."],
    ["Why does she call Auggie instead of Via?", "Reaching the younger brother feels less risky than facing the friend she abandoned."],
    ["What does Auggie's report of Jack and Summer show?", "He is building a life and friendships beyond Miranda's protection."],
    ["How does Miranda begin reaching backward?", "She makes indirect contact and speaks honestly about affection for the family."],
    ["What central need drives the chapter?", "Miranda longs for a dependable belonging that popularity and her own home do not provide."]
  ]},
  { n:96, q:[
    ["Why will none of Miranda's close people attend opening night?", "Family duties, work, sports, and social choices leave her without an audience."],
    ["What happens after Miranda sees the Pullmans arrive for the play?", "She claims illness and gives Via the role of Emily."],
    ["Why does the family's arrival change Miranda's decision?", "She wants Via to perform for people whose pride and love Miranda deeply values."],
    ["Why can Miranda not explain the choice to Via?", "Her motives mix guilt, love, loneliness, and a desire to repair what she damaged."],
    ["What does giving up the lead reveal?", "Miranda values Via's happiness more than the attention she would receive onstage."],
    ["How does Miranda act differently from her recent social self?", "She makes a private sacrifice without seeking credit from the crowd."],
    ["Why is the unseen sacrifice significant?", "An action can be extraordinary because of its purpose even when no one applauds the giver."]
  ]},
  { n:97, q:[
    ["Where does Miranda watch the performance?", "From the wings beside the drama teacher."],
    ["What happens after Via and Justin complete the play?", "Miranda sees the delighted Pullman family and moves toward the lost-looking Auggie."],
    ["Why does Miranda feel a little bittersweet during curtain calls?", "Via receives the applause for the role Miranda gave up."],
    ["Why does Miranda focus on the Pullmans backstage?", "Their happiness is the result she hoped her decision would create."],
    ["What does Justin covering Via's missed line show?", "The performers support one another so the audience sees a successful whole."],
    ["How does Miranda handle regret?", "She acknowledges it briefly but chooses connection with Auggie over reclaiming attention."],
    ["What does the performance reveal about giving?", "A meaningful sacrifice can contain sadness and still be the right choice."]
  ]},
  { n:98, q:[
    ["What nickname does Miranda use when she reunites with Auggie?", "Major Tom."],
    ["What happens after the Pullmans find Miranda backstage?", "They invite her to their late dinner and Via warmly includes her."],
    ["Why does Miranda first hesitate to join them?", "She feels the distance she created and does not assume she still belongs."],
    ["Why does the family insist?", "Their affection for Miranda survived the months of separation."],
    ["What does Via's old smile show?", "She is ready to welcome Miranda back without making the moment a punishment."],
    ["How does Miranda's emotional state change?", "Loneliness gives way to genuine happiness as she rejoins the family circle."],
    ["What central idea closes Miranda's section?", "A relationship damaged by avoidance can reopen through generous action and welcome."]
  ]},
  { n:99, q:[
    ["Where will the fifth graders spend their nature retreat?", "They will spend three days and two nights at Broarwood Nature Reserve."],
    ["What past experience makes Auggie worry about the retreat?", "His only earlier sleepover, at Christopher's house, ended badly."],
    ["Why does Auggie feel nervous even though the trip sounds exciting?", "Sleeping away from home is unfamiliar and his previous attempt was difficult."],
    ["How do Auggie's mixed feelings show his relationship with new experiences?", "He wants the adventure but still needs to work through understandable fear."],
    ["What evidence shows the trip matters to Auggie?", "He thinks seriously about both its exciting activities and its overnight challenge."],
    ["How is Auggie changing as he prepares to go?", "He is becoming willing to try an experience that once felt impossible."],
    ["Why is the retreat significant at this point in the story?", "It gives Auggie a chance to test the confidence and friendships he built during the year."]
  ]},
  { n:100, q:[
    ["What kind of duffel bag does Auggie ask his mother to buy?", "He asks for a plain duffel bag instead of one decorated with Star Wars."],
    ["What does Auggie think about after choosing the plain bag?", "He considers how every student becomes known for something at school."],
    ["Why does Auggie avoid a Star Wars bag for the trip?", "He does not want that interest to be the first thing other students use to define him."],
    ["What conflict does Auggie have with the way people identify him?", "He can choose some parts of his image, but he cannot control that many people notice his face first."],
    ["What does the plain bag reveal about Auggie?", "He is increasingly aware of how identity and reputation work among his classmates."],
    ["How has Auggie's view of school life developed?", "He now recognizes the labels students give one another and thinks critically about his own."],
    ["What central idea does the chapter explore?", "A person's real identity is larger than the one trait for which other people know them."]
  ]},
  { n:101, q:[
    ["What does Mom suggest Auggie take in case he cannot sleep?", "She suggests that he pack a book and a flashlight."],
    ["What decision does Auggie consider while packing?", "He considers whether to bring his stuffed bear, Baboo."],
    ["Why does Mom suggest familiar bedtime items?", "She knows sleeping away from home may make Auggie anxious."],
    ["What does Auggie's hesitation about Baboo show?", "He wants comfort but also wants to feel older and independent around classmates."],
    ["What evidence shows that the retreat still worries Auggie?", "He plans for being unable to sleep and thinks carefully about bringing Baboo."],
    ["How does packing become a small test of Auggie's growth?", "He must decide how much familiar comfort he needs before leaving home."],
    ["Why does this quiet chapter matter?", "It shows that courage often begins with ordinary preparation while fear is still present."]
  ]},
  { n:102, q:[
    ["What does Auggie think he sees early in the morning?", "He sees a shadow that reminds him of Daisy."],
    ["What does Auggie do with Baboo before leaving?", "He leaves Baboo for Mom with a note instead of taking him."],
    ["Why does Auggie leave Baboo at home?", "He decides he can manage the retreat without the stuffed bear and thinks Mom may appreciate the comfort."],
    ["How does the note connect Auggie and his mother?", "It lets him reassure and comfort her even as he takes a more independent step."],
    ["What does the Daisy-like shadow suggest about Auggie's feelings?", "He is carrying love and grief for Daisy with him as he begins the trip."],
    ["What change does Auggie demonstrate at daybreak?", "He chooses independence without rejecting the comfort and love of home."],
    ["What is the chapter's main significance?", "Auggie's small choice shows that growing up can include both bravery and tenderness."]
  ]},
  { n:103, q:[
    ["Who sits with Auggie on the bus to the retreat?", "Jack sits with Auggie, while Summer and Maya sit in front of them."],
    ["What happens after the students arrive?", "They take part in activities, look at the stars, and settle down for the night."],
    ["Why is the trip calmer without Julian?", "Julian skipped the retreat, removing a frequent source of tension for Auggie."],
    ["How do Jack and Summer affect Auggie's first day?", "Their nearby friendship makes the unfamiliar trip feel safe and enjoyable."],
    ["What evidence shows Auggie's fear is easing?", "He enjoys the activities and falls asleep without the trouble he expected."],
    ["How does Auggie's first night compare with his earlier worries?", "He handles it much more easily than he imagined he would."],
    ["Why is Day One important?", "It proves that a feared new experience can become manageable when friendship and confidence are present."]
  ]},
  { n:104, q:[
    ["What daytime activities do the students try?", "They go horseback riding and rappelling."],
    ["Where do the students go in the evening?", "They take buses to a large outdoor fairground for a movie."],
    ["Why does the fairground feel especially exciting?", "The enormous field, lights, and gathering of students make it feel like a major event."],
    ["How does sharing the activities strengthen the class?", "The students build common memories by facing adventures and relaxing together."],
    ["What evidence shows Auggie is participating fully?", "He joins the day's demanding activities and travels with the group to the movie."],
    ["How is Auggie behaving differently from the boy who feared the trip?", "He is engaged in the experience instead of remaining focused on what might go wrong."],
    ["What does the chapter contribute to the retreat story?", "It creates a joyful sense of freedom just before the night's serious conflict."]
  ]},
  { n:105, q:[
    ["What movie is shown outdoors?", "The students watch The Sound of Music."],
    ["What does Auggie do as the movie begins?", "He settles in wearing his yellow Montauk hoodie and adjusts his hearing aids."],
    ["Why do adults give reminders about being kind to nature?", "Students from several schools are sharing the outdoor space and must care for it."],
    ["How does the huge mixed-school gathering affect the setting?", "It places Auggie among many unfamiliar students as well as his own friends."],
    ["Which details show that Auggie is comfortable at first?", "He watches the movie with his class and handles his hearing aids as part of his normal routine."],
    ["What does Auggie's ordinary enjoyment show about his development?", "He can take part in a large public event without his differences controlling the moment."],
    ["Why is the chapter's calm important?", "It establishes a normal, pleasant evening whose safety will soon be challenged."]
  ]},
  { n:106, q:[
    ["Why does Jack leave the movie area?", "He goes into the woods because he needs to use the bathroom."],
    ["What do Jack and Auggie notice in the woods?", "They smell cigarettes and hear or notice firecrackers nearby."],
    ["Why do the boys decide to return?", "The dark woods and signs of other people make the situation feel unsafe."],
    ["How does Auggie's decision to stay near Jack show their relationship?", "They look out for one another even during an awkward, ordinary errand."],
    ["What clues create a warning before the confrontation?", "The darkness, hidden voices, cigarette smell, and firecrackers signal danger."],
    ["How does the mood change during the chapter?", "A routine break from the movie turns tense and threatening."],
    ["What is the chapter's role in the retreat sequence?", "It moves the boys away from the safe crowd and prepares the conflict in the woods."]
  ]},
  { n:107, q:[
    ["Who confronts Auggie and Jack in the woods?", "An older student named Eddie and several boys with him confront them."],
    ["What happens when the older boys attack?", "Amos, Miles, and Henry intervene, pull Auggie and Jack away, and help them escape."],
    ["Why does Eddie target Auggie?", "He reacts cruelly to Auggie's appearance and treats difference as a reason to mock and threaten him."],
    ["Why is Amos's group surprising as rescuers?", "They had once sided with Julian but now choose to protect Auggie."],
    ["What evidence shows the danger is real?", "The older boys insult Auggie, shove him, and begin a physical confrontation."],
    ["How do Amos, Miles, and Henry develop in this moment?", "They move beyond passive friendliness and risk themselves to defend a classmate."],
    ["What central idea does the rescue demonstrate?", "Character is revealed when people choose courage and kindness under pressure."]
  ]},
  { n:108, q:[
    ["What does Auggie discover after the group stops running?", "He discovers that his hearing aids are missing."],
    ["What does Amos do when Auggie begins to cry?", "Amos hugs him and tells him that he was brave."],
    ["Why does Auggie finally cry?", "The shock of the attack and the loss of his hearing aids overwhelm him after the immediate danger passes."],
    ["How does Amos respond to Auggie's vulnerability?", "He offers comfort and respect instead of embarrassment or teasing."],
    ["What shows that Auggie was not helpless during the attack?", "The other boys specifically recognize his bravery while they all worked to escape."],
    ["How does this moment change Auggie's bond with the boys?", "Shared danger turns former distance into trust and genuine friendship."],
    ["Why is the chapter significant?", "It shows that receiving support can be part of courage and that empathy can transform relationships."]
  ]},
  { n:109, q:[
    ["What do the boys try to find in the dark?", "They look for Auggie's missing hearing aids but cannot locate them."],
    ["How do they return to the main group?", "They surround Auggie protectively as they walk back together."],
    ["Why do the boys stop searching?", "Remaining in the dark woods is unsafe, so protecting everyone matters more than the lost device."],
    ["Why does Auggie compare the group to an emperor's guard?", "The boys form a protective circle that makes him feel defended and important."],
    ["What evidence shows school alliances have changed?", "Boys who once supported Julian now stand beside Auggie after defending him."],
    ["How has Auggie's place among his classmates changed?", "He is no longer isolated; classmates actively claim and protect him as one of their own."],
    ["What does the image of the emperor's guard mean?", "Loyalty and shared courage have replaced the social divisions that once surrounded Auggie."]
  ]},
  { n:110, q:[
    ["What does Auggie read when he cannot sleep?", "He reads a book from The Chronicles of Narnia."],
    ["What memory keeps returning to Auggie?", "He remembers the horrified and cruel expressions he saw during the confrontation."],
    ["Why is Auggie unable to fall asleep easily?", "His mind is still processing the fear and humiliation of the attack."],
    ["How does Auggie now understand the phrase 'lamb to the slaughter'?", "His own experience helps him understand what it feels like to enter danger without expecting it."],
    ["What evidence shows the attack affected him beyond physical safety?", "Even after escaping, the faces and words from the encounter remain vivid in his thoughts."],
    ["How has Auggie's understanding of an earlier classroom phrase developed?", "A phrase he once heard abstractly now carries painful personal meaning."],
    ["What is the chapter's central idea?", "A frightening experience can continue inside a person after the visible danger has ended."]
  ]},
  { n:111, q:[
    ["What does Mr. Tushman tell Auggie about the hearing aids?", "The camp contacted families and continued searching for them."],
    ["Who is waiting when Auggie returns home?", "His mother is waiting to welcome him back."],
    ["Why do classmates make a point of saying goodbye supportively?", "They know what happened and want Auggie to feel cared for after the frightening night."],
    ["What does Mr. Tushman's hug communicate?", "It communicates concern and personal support beyond a formal school response."],
    ["What evidence shows Auggie returns to a community rather than facing the aftermath alone?", "Teachers, classmates, and his mother all respond with attention and care."],
    ["How is the trip's ending different from Auggie's fear before it began?", "He returns not as an outsider who failed, but as a student surrounded by respect and friendship."],
    ["Why does the aftermath matter?", "The community's response confirms that kindness and belonging can answer an act of cruelty."]
  ]},
  { n:112, q:[
    ["What surprise is waiting for Auggie at home?", "A new black puppy is waiting for him in a box."],
    ["What does the family do when Auggie arrives?", "They comfort him, welcome him home, and reveal the puppy."],
    ["Why is the puppy especially meaningful after the retreat?", "The joyful new companion offers comfort after Auggie's frightening experience and the loss of Daisy."],
    ["How does Auggie's family respond to what he needs?", "They surround him with affection and give him space to feel safe again."],
    ["What evidence shows the mood has shifted from fear to relief?", "Auggie is back with his family and the unexpected puppy creates excitement."],
    ["How does Auggie move forward without forgetting Daisy?", "He welcomes a new dog while still carrying his love for Daisy."],
    ["What is the chapter's central significance?", "Home becomes a place where pain can be met with love, safety, and a hopeful beginning."]
  ]},
  { n:113, q:[
    ["What name does the family give the new puppy?", "They name the puppy Bear."],
    ["What do Auggie and Via do while staying home?", "They spend the day playing with Bear and being together."],
    ["Why does Bear help the family after Daisy's death?", "His playful presence brings fresh joy without replacing their memories of Daisy."],
    ["How does the day affect Auggie and Via's relationship?", "Their shared time with Bear helps them reconnect warmly as brother and sister."],
    ["What evidence shows Bear is becoming part of the family?", "Both children devote their time and attention to playing with him."],
    ["How has Auggie's home life begun to recover?", "Grief remains, but laughter and closeness return through Bear."],
    ["What larger idea does Bear represent?", "New love can enter a family after loss without erasing the love that came before."]
  ]},
  { n:114, q:[
    ["What event does everyone at school know about?", "Students know about the attack and rescue at the nature retreat."],
    ["What happens to Auggie's social position afterward?", "More students treat him with friendliness and respect, while Julian becomes isolated."],
    ["Why do classmates begin to view Auggie differently?", "They hear about his courage and about the way other boys defended him."],
    ["How do Amos, Miles, and Henry now relate to Auggie?", "They act openly friendly and treat him as a valued classmate."],
    ["What evidence shows a major social shift?", "Students who once followed Julian now gather around Auggie instead."],
    ["How has Auggie's identity at school changed?", "He is becoming known for his courage and character rather than only for his face."],
    ["Why is the shift important?", "It shows that shared experience and moral choices can overturn a harmful social order."]
  ]},
  { n:115, q:[
    ["What does Mr. Tushman return to Auggie?", "He returns Auggie's broken hearing aids after they are found in Eddie's locker."],
    ["What choice does Auggie make about Eddie?", "He does not want the school to pursue harsher charges against Eddie."],
    ["Why does Mr. Tushman speak privately with Auggie?", "He wants to explain what was found and let Auggie have a voice in the response."],
    ["What does Auggie's decision about Eddie reveal?", "He wants accountability but does not seek revenge for its own sake."],
    ["What evidence confirms that Eddie was responsible for the missing hearing aids?", "The damaged devices are discovered in Eddie's locker."],
    ["How does Auggie show maturity in the meeting?", "He responds thoughtfully even though he has every reason to remain angry."],
    ["Why does this chapter matter after the retreat?", "It replaces uncertainty with facts and shows Auggie choosing mercy without excusing the harm."]
  ]},
  { n:116, q:[
    ["What June precept does Mr. Browne share?", "He shares: 'Just follow the day and reach for the sun.'"],
    ["What summer activity does Mr. Browne invite the class to do?", "He asks students to send him postcards with their own personal precepts."],
    ["Why does Mr. Browne ask students to create precepts?", "He wants them to keep thinking about guiding ideas after the school year ends."],
    ["How has the precept project connected Mr. Browne with the class?", "It gives them a shared language for reflecting on choices and character."],
    ["What does the final precept suggest about facing the future?", "It encourages students to keep moving forward with hope and purpose."],
    ["How are the students invited to develop beyond memorizing sayings?", "They must form and share principles drawn from their own thinking."],
    ["What central idea does the last precept reinforce?", "Wise words matter most when people carry them into their own lives and actions."]
  ]},
  { n:117, q:[
    ["Where is the Pullman family going?", "They are driving to Auggie's fifth-grade graduation ceremony."],
    ["What does Auggie ask his parents before they arrive?", "He asks them not to make an overly emotional scene with kisses."],
    ["Why does Dad joke during the drive?", "His humor eases the family's emotion and helps the important day feel manageable."],
    ["Why does Auggie set limits on his parents' affection at school?", "He wants to enjoy their support without feeling embarrassed in front of classmates."],
    ["What evidence shows the graduation matters to the whole family?", "They travel together with excitement and strong emotion about Auggie's achievement."],
    ["How is Auggie asserting greater independence?", "He communicates how he wants his parents to support him in a public setting."],
    ["Why is the drop-off significant?", "It marks the family's arrival at a celebration of a year they once feared Auggie might not manage."]
  ]},
  { n:118, q:[
    ["How are students arranged for the ceremony?", "They take seats in alphabetical order on the stage."],
    ["What happens when Jack sits in the wrong place?", "His mistake makes Auggie laugh as they settle in."],
    ["Why does Jack's seating mistake help Auggie?", "The familiar humor relaxes Auggie during a formal and emotional event."],
    ["What does the small exchange show about Jack and Auggie?", "Their friendship is comfortable enough to make an important ceremony feel ordinary."],
    ["What evidence shows Auggie belongs in the graduating class?", "He sits onstage among his classmates as part of the same alphabetical arrangement."],
    ["How does Auggie approach the ceremony compared with his first day?", "He can laugh beside a friend instead of entering school isolated and terrified."],
    ["Why does this simple moment matter?", "It shows that belonging is often felt through everyday ease with other people."]
  ]},
  { n:119, q:[
    ["Who delivers the graduation address?", "Mr. Tushman delivers the address."],
    ["What idea does Mr. Tushman emphasize in the speech?", "He urges everyone to be a little kinder than necessary."],
    ["Why does Mr. Tushman call extra kindness important?", "People carry struggles others may not see, so generous choices can make a lasting difference."],
    ["How does the address connect the principal with his students?", "He asks them to measure success by the way they treat people, not only by achievement."],
    ["What does the speech imply about a 'simple thing' like kindness?", "A small choice can require courage and greatly affect another person's life."],
    ["How does the speech reflect the class's development?", "Their year has shown them that daily choices can move a community from exclusion toward care."],
    ["What central message does the address give the novel?", "Choosing more kindness than a situation demands is a powerful way to change the world around us."]
  ]},
  { n:120, q:[
    ["What special honor does Auggie receive?", "He receives the Henry Ward Beecher medal."],
    ["When is Auggie's name announced?", "His name is announced after the regular academic honors during the special award presentation."],
    ["Why is Auggie selected for the medal?", "His quiet strength and courage have inspired the school community."],
    ["How does the award connect Auggie with Beecher Prep?", "It recognizes that his presence and choices helped other people become better."],
    ["What evidence shows the honor values character?", "The explanation focuses on courage, kindness, and the way a person lifts others' hearts."],
    ["How has Auggie changed from the student who feared being seen?", "He is able to stand before the whole school and receive recognition for who he is."],
    ["Why is the medal significant?", "It publicly honors the inner qualities that strangers once overlooked when they saw only Auggie's face."]
  ]},
  { n:121, q:[
    ["How do the students react when Auggie receives the medal?", "They applaud, cheer, pat him, and give him high-fives."],
    ["How does Auggie feel as he moves through the crowd?", "He feels as if he is floating."],
    ["Why does the applause affect Auggie so strongly?", "The public acceptance contrasts with the staring and avoidance he experienced before school."],
    ["How do the classmates' actions change the meaning of the award?", "Their celebration turns it from one adult's decision into a shared recognition of Auggie."],
    ["What does Auggie's thought that he is ordinary reveal?", "He does not see himself as a hero even though others recognize the courage his year required."],
    ["How does Auggie accept a new view of himself?", "He allows himself to receive the honor and the affection of his classmates."],
    ["What is the chapter's central idea?", "An ordinary person can show extraordinary courage simply by meeting difficult life with persistence and kindness."]
  ]},
  { n:122, q:[
    ["What happens during the reception after graduation?", "Auggie's family and many classmates gather with him for photographs."],
    ["How do classmates position themselves for the pictures?", "They crowd close around Auggie instead of avoiding a place beside him."],
    ["Why do the photographs matter to Auggie?", "They capture visible proof that his classmates now include him naturally."],
    ["How does the family's reaction add to the moment?", "Their hugs and pride show how deeply they understand what the year has required."],
    ["What evidence shows that classmates no longer focus on Auggie's face?", "They eagerly place their own faces next to his for the group photos."],
    ["How has Auggie's experience of being seen changed?", "Attention that once made him feel exposed now records friendship, belonging, and achievement."],
    ["Why are the pictures significant?", "They preserve the community's transformation from keeping a distance to standing together."]
  ]},
  { n:123, q:[
    ["Where does the group go after graduation?", "They walk home together to celebrate with cake."],
    ["What does Mom say to Auggie during the walk?", "She thanks him for being himself and calls him a wonder."],
    ["Why does Mom thank Auggie rather than only congratulate him?", "His courage and presence have changed the people who love him and the community around him."],
    ["How does the walk reflect Auggie's bond with his family and friends?", "He finishes the year surrounded by people who know, support, and celebrate him."],
    ["What evidence shows Auggie achieved more than completing fifth grade?", "His mother recognizes the way his character inspired growth in others."],
    ["How is Auggie different from the boy at the novel's beginning?", "He still sees himself as ordinary, but he now accepts belonging, recognition, and love more confidently."],
    ["What final idea does the novel leave with the reader?", "Seeing and valuing a person's full humanity can turn an ordinary life into a source of wonder."]
  ]}
];

function patternFor(chapterNumber) {
  const rarePosition = (chapterNumber - 1) % 4;
  const variant = Math.floor((chapterNumber - 1) / 4) % POSITION_PATTERNS[rarePosition].length;
  return POSITION_PATTERNS[rarePosition][variant];
}

function placeChoices(correct, distractors, correctIndex) {
  const choices = [];
  let distractorIndex = 0;
  for (let index = 0; index < 4; index += 1) {
    choices.push(index === correctIndex ? correct : distractors[distractorIndex++]);
  }
  return choices;
}

function createTest(chapter) {
  const meta = WONDER_META.chapters[chapter.n - 1];
  const positions = patternFor(chapter.n);
  const answers = chapter.q.map((item) => item[1]);
  const id = `wonder-chapter-${chapter.n}`;
  return {
    id,
    bookId: BOOK_ID,
    bookTitle: BOOK_TITLE,
    chapterNumber: chapter.n,
    chapterTitle: meta.title,
    title: `Chapter ${chapter.n} Check`,
    status: "published",
    passingPercent: 80,
    questions: chapter.q.map((item, index) => {
      const distractors = [1, 3, 5].map((offset) => answers[(index + offset) % 7]);
      return {
        id: `q${index + 1}`,
        type: "multiple-choice",
        skill: SKILLS[index],
        prompt: item[0],
        choices: placeChoices(item[1], distractors, positions[index]),
        correctIndex: positions[index],
        explanation: item[1]
      };
    }),
    summaryRequired: true,
    summarySentenceCount: 5,
    summaryPrompt: SUMMARY_PROMPT,
    summaryGuide: `Narrated by ${meta.pov}. ${answers.join(" ")}`,
    generation: {
      method: "source-grounded-curated-v1",
      sourcePages: [meta.startPage, meta.endPage]
    }
  };
}

export const WONDER_TESTS = Object.fromEntries(
  chapters.map((chapter) => {
    const test = createTest(chapter);
    return [test.id, test];
  })
);
