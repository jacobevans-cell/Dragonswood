// Source-grounded classroom assessments for this exact 370-page edition.
const BOOK_ID = "harry-potter-1";
const BOOK_TITLE = "Harry Potter and the Philosopher's Stone";
const SUMMARY_PROMPT = "Write one paragraph of exactly five complete sentences summarizing what happened in this chapter. Include the most important characters, events, problem or conflict, and outcome. Use your own words and describe events from this chapter only.";

const SKILLS = [
  "Meaningful recall",
  "Sequence",
  "Cause and effect",
  "Motivation or relationship",
  "Inference or evidence",
  "Character development",
  "Central idea, significance, or theme"
];

// The least-used answer position rotates A, B, C, D by chapter. Each row uses
// three positions twice and the rotating position once, without a simple cycle.
const ANSWER_POSITIONS = [
  [1, 3, 2, 1, 3, 0, 2],
  [2, 0, 3, 2, 0, 1, 3],
  [3, 1, 0, 3, 1, 2, 0],
  [0, 2, 1, 0, 2, 3, 1],
  [2, 1, 3, 2, 0, 1, 3],
  [3, 2, 0, 3, 1, 2, 0],
  [1, 0, 3, 1, 2, 0, 3],
  [2, 1, 0, 2, 3, 1, 0],
  [3, 2, 1, 3, 2, 0, 1],
  [0, 3, 2, 0, 3, 1, 2],
  [3, 0, 1, 3, 0, 2, 1],
  [1, 2, 0, 1, 2, 3, 0],
  [1, 2, 3, 1, 0, 3, 2],
  [2, 3, 0, 2, 1, 0, 3],
  [0, 1, 3, 0, 2, 3, 1],
  [1, 0, 2, 1, 3, 0, 2],
  [2, 3, 1, 2, 3, 0, 1]
];

const chapters = [
  {
    number: 1,
    title: "The Boy Who Lived",
    pages: [10, 29],
    guide: "After years of terror, Voldemort disappears when he attacks baby Harry, leaving Harry alive with a lightning-shaped scar. Professor McGonagall watches the ordinary Dursley family while witches and wizards celebrate. Dumbledore arrives, puts out the streetlights, and explains that Harry must grow up away from fame. Hagrid brings Harry on a flying motorcycle, grieving over the Potters. The three adults leave Harry at number four, Privet Drive, where his relatives do not yet know that the famous child is on their doorstep.",
    questions: [
      ["On what street do the Dursleys live?", "Privet Drive", ["Diagon Alley", "Spinner's End", "Godric's Hollow"], "The chapter introduces the Dursleys at number four, Privet Drive."],
      ["Which event happens last before the adults leave Privet Drive?", "Dumbledore places baby Harry on the Dursleys' doorstep with a letter.", ["McGonagall spends the day watching the Dursleys.", "Hagrid arrives on the flying motorcycle.", "Dumbledore darkens the street with his Put-Outer."], "Harry is placed safely at the door only after McGonagall, Dumbledore, and Hagrid have gathered."],
      ["Why are witches and wizards openly celebrating?", "Voldemort has disappeared after failing to kill Harry.", ["Hogwarts has won an important contest.", "The Ministry has ended all magical laws.", "Harry has already defeated a dragon."], "The magical community believes Voldemort's fall has ended years of fear."],
      ["Why does Dumbledore decide that Harry should grow up with the Dursleys?", "They are Harry's remaining family, and Dumbledore wants him raised away from fame.", ["They asked to train Harry before Hogwarts.", "They are secretly powerful witches and wizards.", "They live closer to Hogwarts than anyone else."], "Dumbledore believes Harry will be better off growing up without knowing how famous he is."],
      ["Which detail best shows that Vernon Dursley fears being connected to anything unusual?", "He worries that people might learn that the Potters are his relatives.", ["He asks strangers to explain the celebrations.", "He invites cloaked visitors into his home.", "He tells his coworkers about magic."], "Vernon is frightened that the Potters and their unusual world could be linked to his family."],
      ["What does Dumbledore's decision to trust Hagrid with Harry reveal?", "He believes Hagrid is dependable even though Hagrid can be emotional and careless.", ["He thinks Hagrid never makes mistakes.", "He expects Hagrid to raise Harry alone.", "He does not know Hagrid very well."], "Dumbledore acknowledges Hagrid's weaknesses but says he would trust him with his life."],
      ["Why is this chapter important to the rest of Harry's story?", "It establishes Harry's hidden past and the fame he will grow up not understanding.", ["It proves the Dursleys plan to teach Harry magic.", "It resolves every danger connected to Voldemort.", "It shows Harry choosing his Hogwarts house."], "The chapter gives readers the truth about Harry while the baby Harry begins a life in which that truth will be hidden." ]
    ]
  },
  {
    number: 2,
    title: "The Vanishing Glass",
    pages: [30, 45],
    guide: "Ten years later, Harry lives unhappily with the Dursleys and sleeps in a cupboard while Dudley is spoiled. When Mrs Figg breaks her leg, the Dursleys reluctantly take Harry on Dudley's birthday trip to the zoo. At the reptile house, Harry seems to communicate with a boa constrictor. The glass in front of the snake vanishes, Dudley falls inside, and the snake escapes. The Dursleys blame Harry for the strange event and punish him by locking him in his cupboard.",
    questions: [
      ["Which animal appears to understand Harry at the zoo?", "A boa constrictor", ["A gorilla", "A crocodile", "A tiger"], "Harry and the boa constrictor silently respond to one another before the glass vanishes."],
      ["What happens after the glass at the reptile enclosure vanishes?", "The snake escapes and Harry is later punished by the Dursleys.", ["Harry is given the snake as a pet.", "The zoo closes before anyone notices.", "Dudley admits that the accident was his fault."], "The snake slides away, while the Dursleys blame Harry and lock him in the cupboard."],
      ["Why do the Dursleys take Harry along on Dudley's birthday outing?", "Mrs Figg has broken her leg and cannot watch him.", ["Dudley asks Harry to come.", "Harry wins the trip at school.", "Vernon wants Harry to meet a client."], "Their usual babysitter is unavailable, and the Dursleys refuse to leave Harry alone."],
      ["What does the snake's response to Harry suggest about their interaction?", "Harry is somehow able to communicate with it.", ["The snake has been trained by Dudley.", "The snake is trying to frighten every visitor.", "Harry has secretly visited the snake before."], "The snake reacts directly to Harry's words and gestures in a way an ordinary snake should not."],
      ["Which conclusion is best supported by the strange events Harry remembers?", "Unusual things happen around Harry even when he does not plan them.", ["Harry has been studying spells in secret.", "The Dursleys create the strange events to scare him.", "Every child in Harry's school has the same abilities."], "The shrinking jumper, rooftop landing, hair growth, and vanishing glass all occur without Harry knowing how."],
      ["How does the zoo trip develop the contrast between Dudley and Harry?", "Dudley expects special treatment, while Harry is amazed by small chances to be included.", ["Dudley protects Harry from Vernon.", "Harry receives more presents than Dudley.", "Both boys are treated equally throughout the day."], "Dudley's demands and many presents sharply contrast with Harry's neglected life."],
      ["What is the main significance of the vanishing glass?", "It is clear evidence that Harry's life cannot remain completely ordinary.", ["It convinces the Dursleys to tell Harry the truth.", "It makes Dudley become kind to Harry.", "It explains where Harry's parents live."], "The event is the clearest sign so far that something extraordinary is connected to Harry." ]
    ]
  },
  {
    number: 3,
    title: "The Letters from No One",
    pages: [46, 65],
    guide: "Harry begins receiving mysterious letters addressed precisely to his cupboard under the stairs. Uncle Vernon seizes the first letter and tries increasingly desperate ways to stop the mail, including moving Harry to Dudley's second bedroom. More letters arrive through every opening, and Vernon drives the family from place to place. He finally takes them to a miserable hut on a rock in the sea. At midnight on Harry's birthday, a powerful knock shakes the hut door.",
    questions: [
      ["Where is the first letter addressed to Harry?", "The cupboard under the stairs", ["Dudley's second bedroom", "Harry's school classroom", "The hut on the rock"], "The address shows that the sender knows exactly where Harry sleeps."],
      ["Which event occurs after Uncle Vernon boards up the mail slot?", "Letters begin entering the house through many other openings.", ["Harry reads the original letter in private.", "The family returns to its normal routine.", "Petunia burns every letter before breakfast."], "Blocking one opening only leads to an even larger flood of letters."],
      ["Why does Uncle Vernon move Harry into Dudley's second bedroom?", "He hopes changing Harry's room will stop the precisely addressed letters.", ["He wants to reward Harry for good behavior.", "Dudley volunteers to share his belongings.", "The cupboard is being turned into a study."], "Vernon reacts to the fact that the sender knows Harry lives in the cupboard."],
      ["Why does Vernon keep moving the family farther from home?", "He is determined to prevent Harry from receiving a letter.", ["He wants to give Dudley a seaside holiday.", "He is searching for Harry's school supplies.", "He plans to visit Petunia's relatives."], "Every move is another attempt to escape the persistent delivery."],
      ["What can readers infer from the letters following Harry everywhere?", "The sender has unusual ways to find Harry and will not give up.", ["The post office is making random mistakes.", "Dudley is secretly rewriting the addresses.", "Harry already knows who is sending them."], "The exact addresses change as Harry moves, showing knowledge and determination beyond ordinary mail."],
      ["How does Uncle Vernon change as the letters multiply?", "He goes from confident control to frightened, unreasonable panic.", ["He becomes curious and lets Harry read them.", "He calmly asks the post office for help.", "He admits that Petunia should decide what to do."], "Vernon's attempts become more extreme until he isolates the family in a storm."],
      ["What central idea is developed by the letters?", "A hidden truth about Harry cannot be kept away from him forever.", ["Running away always solves a difficult problem.", "Only adults deserve private mail.", "The Dursleys are planning a surprise birthday party."], "Despite Vernon's efforts, the messages keep coming and the chapter ends with someone arriving in person." ]
    ]
  },
  {
    number: 4,
    title: "The Keeper of the Keys",
    pages: [66, 83],
    guide: "The visitor is Rubeus Hagrid, Keeper of Keys and Grounds at Hogwarts. He gives Harry a birthday cake and is shocked that the Dursleys have hidden Harry's magical identity. Hagrid tells Harry he is a wizard, that his parents were murdered by Voldemort, and that the attack left Harry alive and Voldemort powerless. Harry recognizes that this explains the unexplained things in his life. When Vernon insults Dumbledore, Hagrid loses his temper and gives Dudley a pig's tail before preparing to take Harry away.",
    questions: [
      ["What is Hagrid's job at Hogwarts?", "Keeper of Keys and Grounds", ["Head of Slytherin House", "Minister for Magic", "Conductor of the Hogwarts Express"], "Hagrid introduces himself as the Keeper of Keys and Grounds at Hogwarts."],
      ["Which event happens before Hagrid tells Harry that he is a wizard?", "Hagrid gives Harry a birthday cake.", ["Hagrid takes Harry shopping in Diagon Alley.", "Dudley receives a pig's tail.", "Harry reads his complete school-supply list."], "Hagrid arrives with a cake and celebrates Harry's birthday before explaining Harry's identity."],
      ["Why does Hagrid lose his temper and use magic on Dudley?", "Vernon insults Dumbledore after years of lying to Harry.", ["Dudley refuses to lend Harry a coat.", "Petunia tears up Harry's school list.", "Harry asks too many questions about Hogwarts."], "Hagrid becomes furious when Vernon calls Dumbledore a crackpot."],
      ["Why have the Dursleys hidden the truth about Harry's parents?", "They despise magic and hoped to force Harry to be ordinary.", ["They promised Dumbledore to keep Hogwarts secret until adulthood.", "They could not remember what happened to the Potters.", "They believed Harry already knew everything."], "Petunia admits that she knew Lily was a witch, while Vernon says they tried to stamp the magic out of Harry."],
      ["Which detail most strongly helps Harry accept that he may be a wizard?", "Hagrid's explanation fits the strange events Harry has caused without understanding them.", ["Dudley says that Harry looks like a wizard.", "Vernon suddenly agrees with Hagrid.", "The television reports that Hogwarts is real."], "Harry connects Hagrid's news with the impossible things that have happened around him."],
      ["What does Hagrid's behavior reveal about his character?", "He is caring toward Harry but fiercely protective of Dumbledore.", ["He is polite to the Dursleys no matter what they say.", "He enjoys keeping Harry confused.", "He cares more about rules than people."], "Hagrid brings comfort and truth to Harry, but his loyalty also makes him react impulsively."],
      ["Why is Hagrid's arrival a turning point for Harry?", "Harry learns his true identity and can finally leave the Dursleys' version of his past behind.", ["Harry decides never to use magic.", "The Dursleys become proud of the Potters.", "Voldemort is permanently defeated during the visit."], "The information in the hut completely changes Harry's understanding of himself and his family." ]
    ]
  },
  {
    number: 5,
    title: "Diagon Alley",
    pages: [84, 113],
    guide: "Hagrid takes Harry into the wizarding world to buy school supplies. In the Leaky Cauldron, strangers recognize Harry, and Professor Quirrell nervously greets him. At Gringotts, Harry discovers his parents left him a fortune, while Hagrid secretly empties vault 713 for Dumbledore. Harry buys robes, books, a cauldron, and the owl he names Hedwig. At Ollivanders, a holly wand with a phoenix-feather core chooses Harry, and Ollivander reveals that its twin gave Harry his scar.",
    questions: [
      ["Who operates Gringotts bank?", "Goblins", ["House-elves", "Giants", "Centaurs"], "Hagrid explains that Gringotts is run by goblins."],
      ["Which place do Harry and Hagrid visit before buying most of the school supplies?", "Gringotts bank", ["Ollivanders wand shop", "Madam Malkin's robe shop", "The Hogwarts library"], "They collect Harry's money and Hagrid's secret package before beginning the main shopping."],
      ["Why does Hagrid remove a small package from vault 713?", "He is carrying out secret Hogwarts business for Dumbledore.", ["It contains Harry's tuition money.", "He plans to sell it for a dragon egg.", "The goblins ask him to deliver their mail."], "Hagrid shows a letter from Dumbledore and refuses to tell Harry what the package contains."],
      ["Why does Harry leave Ollivanders with the holly-and-phoenix-feather wand?", "That wand responds to Harry and chooses him.", ["It is the least expensive wand in the shop.", "Hagrid used the same wand as a student.", "Harry selects it because of its color."], "Several wands fail before the holly wand produces a powerful response in Harry's hand."],
      ["What does the attention Harry receives in the Leaky Cauldron show?", "Harry is famous in the magical world even though he does not know its history.", ["Everyone mistakes Harry for Hagrid.", "The customers are afraid Harry will close the pub.", "Harry has visited the pub many times before."], "Strangers line up to shake Harry's hand because they recognize the Boy Who Lived."],
      ["How does Ollivander deepen the mystery of Harry's past?", "He reveals that Harry's wand and Voldemort's wand contain feathers from the same phoenix.", ["He claims Harry's parents never owned wands.", "He says Hagrid made Harry's scar.", "He proves that the Dursleys are secretly magical."], "The twin wand cores create a troubling connection between Harry and the wizard who attacked him."],
      ["What makes Diagon Alley important beyond being a shopping trip?", "Harry gains a place in the magical world while new mysteries about the package and his wand appear.", ["Harry completes his first year of school there.", "Hagrid explains how to defeat every dark wizard.", "The visit convinces Harry to return permanently to Privet Drive."], "The chapter gives Harry knowledge, tools, and belonging, but it also introduces questions that will drive the plot." ]
    ]
  },
  {
    number: 6,
    title: "The Journey from Platform Nine and Three-Quarters",
    pages: [114, 143],
    guide: "The Dursleys abandon Harry at King's Cross, where he cannot find platform nine and three-quarters. Mrs Weasley shows him how to pass through the barrier, and Harry boards the Hogwarts Express. He befriends Ron, shares a large pile of sweets, and meets Hermione and Neville. Draco Malfoy offers Harry friendship but insults Ron and claims he can identify the wrong sort of wizard. Harry rejects Draco's offer, then travels by boat with the other first-years toward Hogwarts.",
    questions: [
      ["Who explains how Harry can reach platform nine and three-quarters?", "Mrs Weasley", ["Professor McGonagall", "The station guard", "Draco Malfoy"], "Harry overhears the Weasley family and Mrs Weasley gives him clear instructions."],
      ["What happens before Harry begins getting to know Ron on the train?", "Harry runs through the barrier and finds the Hogwarts Express.", ["Hermione repairs Harry's glasses.", "Draco challenges Harry to a duel.", "The first-years cross the lake in boats."], "Harry must reach the hidden platform and board the train before he and Ron share a compartment."],
      ["Why does Harry buy and share so much food from the trolley?", "He has money now and wants to share an experience he was denied with the Dursleys.", ["The conductor orders every student to buy everything.", "Ron promises to pay Harry back at Hogwarts.", "Harry is collecting food for Hagrid."], "Harry is delighted to choose treats for himself and willingly shares them with Ron."],
      ["Why does Harry reject Draco Malfoy's offer of friendship?", "Draco insults Ron and judges families by status, so Harry chooses for himself whom to trust.", ["Harry has promised never to make school friends.", "Draco refuses to explain Quidditch.", "Ron tells Harry that Draco is not a wizard."], "Harry recognizes the same unpleasant superiority he has seen in Dudley and refuses Draco's hand."],
      ["What does Harry's response to Ron's worries about money reveal?", "Harry is sensitive to embarrassment and tries to make Ron feel accepted.", ["Harry thinks wealth makes him better than Ron.", "Harry wants Ron to leave the compartment.", "Harry does not notice Ron's discomfort."], "Because Harry knows what it is like to feel left out, he shares without treating Ron as inferior."],
      ["How does the train journey change Harry's situation?", "He moves from isolation toward a real friendship with Ron.", ["He decides Hogwarts is too dangerous and goes home.", "He becomes the leader of every first-year.", "He learns that the Dursleys were right about magic."], "The journey gives Harry his first close friend and a sense that he may belong."],
      ["What larger idea is shown by Harry's choice between Ron and Draco?", "A person's choices and treatment of others matter more than family wealth or reputation.", ["Students should only be friends with people in their house.", "The richest student should lead the group.", "First impressions can never reveal character."], "Harry bases his decision on kindness and behavior rather than the status Draco values." ]
    ]
  },
  {
    number: 7,
    title: "The Sorting Hat",
    pages: [144, 163],
    guide: "The first-years cross the lake, enter Hogwarts, and wait nervously for the Sorting Ceremony. The Sorting Hat sings about the four houses and places students one at a time. Harry silently asks not to be put in Slytherin, and the Hat sends him to Gryffindor with Ron and Hermione. During the feast, Harry sees Professor Snape staring and feels a sudden pain in his scar. Dumbledore welcomes the school, warns students away from the Forbidden Forest and a third-floor corridor, and Harry finally reaches his Gryffindor dormitory.",
    questions: [
      ["Into which house is Harry sorted?", "Gryffindor", ["Hufflepuff", "Ravenclaw", "Slytherin"], "The Hat honors Harry's request and announces Gryffindor."],
      ["What happens before the Sorting Hat begins placing students into houses?", "The Hat sings a song explaining the four houses.", ["Dumbledore awards the House Cup.", "Harry speaks with Professor Snape.", "The students go to their dormitories."], "The song introduces the qualities associated with each house before names are called."],
      ["Why does Harry silently ask the Hat not to place him in Slytherin?", "He has heard troubling things about Slytherin and does not want to join Draco there.", ["Slytherin has no Quidditch team.", "Hagrid told him Slytherin students cannot use magic.", "Ron has already been made head of Slytherin."], "Harry connects Slytherin with dark wizards and with Draco's values."],
      ["How does the Sorting Hat respond to Harry's wishes?", "It considers his abilities but allows his strong preference to influence the choice.", ["It ignores everything Harry thinks.", "It asks Draco to decide for Harry.", "It refuses to assign Harry to any house."], "The Hat says Harry could do well in Slytherin, then places him in Gryffindor after Harry's plea."],
      ["Which detail introduces a new mystery during the feast?", "Harry's scar suddenly hurts while he notices Snape looking at him.", ["Ron eats more food than Harry.", "The ghosts pass through the tables.", "Dumbledore makes a short welcome speech."], "The unexplained pain suggests that something about the moment or the professor matters."],
      ["How does Harry change during the Sorting Ceremony?", "He moves from fearing rejection to feeling that he belongs with Gryffindor.", ["He stops caring which house accepts him.", "He decides to leave Hogwarts before the feast.", "He becomes certain that Draco is his best friend."], "The applause from Gryffindor and his place beside Ron give Harry a new home within the school."],
      ["Why is Harry's request to the Sorting Hat significant?", "It shows that personal choice can help shape identity alongside natural ability.", ["It proves the Hat always makes random decisions.", "It means house qualities have no importance.", "It guarantees Harry will never face danger."], "The Hat recognizes different possibilities in Harry, but his own values help decide the result." ]
    ]
  },
  {
    number: 8,
    title: "The Potions Master",
    pages: [164, 179],
    guide: "Harry settles into Hogwarts lessons and finds that magic requires difficult study and practice. In Potions, Professor Snape singles Harry out with hard questions and treats him unfairly. Neville ruins his potion by adding porcupine quills at the wrong time, and Snape blames Harry for not helping. Later, Hagrid welcomes Harry and Ron to tea. A newspaper report says someone tried to rob Gringotts on the same day Harry visited, and Harry realizes the targeted vault was probably the mysterious vault 713 that Hagrid had just emptied.",
    questions: [
      ["Who teaches Harry's Potions class?", "Professor Snape", ["Professor Flitwick", "Professor Quirrell", "Professor McGonagall"], "Snape teaches Potions in a dungeon and immediately singles Harry out."],
      ["Which event happens first during Harry's first Potions lesson?", "Snape questions Harry about ingredients and magical substances.", ["Neville's cauldron melts.", "Students clean spilled potion from the floor.", "Snape sends Neville to the hospital wing."], "Snape's questioning occurs before the students begin brewing."],
      ["What causes Neville's cauldron to melt?", "He adds porcupine quills without first taking the cauldron off the fire.", ["Harry drops a wand into the mixture.", "Snape secretly changes Neville's ingredients.", "Hermione adds too much water."], "Neville misses an important instruction and the failed potion becomes dangerous."],
      ["How does Hagrid's treatment of Harry contrast with Snape's?", "Hagrid welcomes and supports Harry, while Snape searches for reasons to criticize him.", ["Both adults refuse to answer any of Harry's questions.", "Snape is friendly while Hagrid is suspicious.", "Both adults judge Harry because he is famous."], "Tea with Hagrid offers warmth after Snape's hostility in class."],
      ["What does Harry infer from the Gringotts newspaper report?", "The robber was probably trying to steal the package Hagrid removed from vault 713.", ["The Dursleys tried to take Harry's money.", "The goblins moved Hogwarts into the bank.", "Hagrid was arrested for robbing Harry's vault."], "The date and the emptied high-security vault connect the break-in to Hagrid's secret errand."],
      ["How does this chapter develop Harry's view of Snape?", "Snape's unfair behavior makes Harry increasingly suspicious and uncomfortable around him.", ["Harry decides Snape is his most helpful teacher.", "Harry learns Snape is secretly related to him.", "Harry stops noticing Snape after class."], "Snape's public humiliation and blame create open tension between teacher and student."],
      ["Why does the Gringotts clue matter to the chapter?", "It turns Hagrid's secret package into a mystery that may involve real danger at Hogwarts.", ["It explains how to pass every Potions exam.", "It proves the bank has lost Harry's fortune.", "It ends Harry's curiosity about vault 713."], "Harry now has evidence that someone wanted the object Hagrid brought back to the school." ]
    ]
  },
  {
    number: 9,
    title: "The Midnight Duel",
    pages: [180, 201],
    guide: "During the first flying lesson, Neville falls and Madam Hooch takes him away. Draco steals Neville's Remembrall, but Harry flies after him and makes a remarkable catch. McGonagall sees Harry's skill and recruits him as Gryffindor's new Seeker. Draco later challenges Harry to a midnight duel but secretly alerts Filch instead of appearing. Harry, Ron, Hermione, and Neville flee through the corridors and discover a huge three-headed dog standing over a trapdoor.",
    questions: [
      ["What Quidditch position is Harry chosen to play?", "Seeker", ["Keeper", "Beater", "Chaser"], "McGonagall recruits Harry as Gryffindor's new Seeker after seeing his catch."],
      ["Which event happens before Harry is selected for the Quidditch team?", "Harry retrieves Neville's Remembrall from Draco while flying.", ["Draco challenges Harry to a midnight duel.", "Filch searches the trophy room.", "The students discover the three-headed dog."], "Harry's risky, skillful catch is what convinces McGonagall to recruit him."],
      ["Why does McGonagall take Harry to meet Oliver Wood?", "She recognizes that Harry's flying skill could make him an excellent Seeker.", ["She wants Wood to punish Harry.", "She needs Harry to repair a broomstick.", "She plans to remove Harry from Gryffindor."], "Instead of expelling Harry, she sees unusual Quidditch talent."],
      ["Why does Draco propose the midnight duel?", "He intends to lure Harry out after curfew and have Filch catch him.", ["He wants to apologize for taking the Remembrall.", "He needs Harry's help finding the Great Hall.", "He plans to teach Harry a defensive spell."], "Draco never comes to the trophy room because the challenge is a trap."],
      ["What is the strongest inference about the three-headed dog?", "It is guarding something hidden beneath the trapdoor.", ["It escaped from the Forbidden Forest by accident.", "It is waiting to join a Quidditch team.", "It belongs to Filch and guards the trophies."], "Hermione notices that the animal is standing directly over a trapdoor."],
      ["How does Hermione begin to change during the nighttime adventure?", "Although she fears rule-breaking, she becomes involved and uses her knowledge to help the group escape.", ["She decides rules never matter at Hogwarts.", "She joins Draco's plan against Harry.", "She refuses to speak to Harry and Ron again."], "Hermione follows to stop the boys, then acts quickly when all four students are in danger."],
      ["Why is the discovery at the end of the chapter significant?", "It connects the students' school adventures to a guarded secret inside Hogwarts.", ["It proves Neville owns the Remembrall again.", "It resolves Harry's suspicions about vault 713.", "It ends the rivalry between Harry and Draco."], "The trapdoor gives Harry, Ron, and Hermione a physical clue that something important is being protected." ]
    ]
  },
  {
    number: 10,
    title: "Hallowe'en",
    pages: [202, 219],
    guide: "In Charms, Hermione successfully performs the levitation spell while Ron struggles. Ron makes a cruel comment that sends Hermione crying to the girls' bathroom. During the Halloween feast, a troll enters the castle, and Harry and Ron realize Hermione does not know about the danger. They rush to warn her, accidentally trap themselves with the troll, and defeat it by combining quick thinking, a wand, and the levitation spell. Hermione lies to protect the boys from punishment, and the shared danger turns the three students into friends.",
    questions: [
      ["Which spell is used to lift the troll's club?", "Wingardium Leviosa", ["Alohomora", "Petrificus Totalus", "Lumos"], "Ron uses the levitation spell from Charms to raise and drop the club."],
      ["Which event happens before the troll enters the girls' bathroom?", "Ron's unkind comment sends Hermione away from the other students.", ["Hermione tells McGonagall a false story.", "The troll is knocked unconscious.", "Harry and Ron become Hermione's friends."], "Hermione is alone and unaware of the warning because she left after hearing Ron."],
      ["Why is Hermione in special danger when the troll is announced?", "She has been crying in the bathroom and does not know that students were warned.", ["She was ordered to search for the troll.", "She is practicing a spell in the Forbidden Forest.", "She followed the troll into the castle."], "Harry and Ron remember that Hermione missed the feast and rush to find her."],
      ["Why does Hermione claim that she went looking for the troll?", "She wants to protect Harry and Ron from punishment for leaving their group.", ["She wants the teachers to believe she defeated it alone.", "She hopes to have Gryffindor lose more points.", "She is afraid to admit that the troll exists."], "Her lie repays the boys for risking themselves to help her."],
      ["Which detail best shows that teamwork defeats the troll?", "Harry distracts it while Ron uses Hermione's levitation lesson on the club.", ["One student defeats it without help.", "The troll becomes tired and leaves by itself.", "A teacher arrives before the students act."], "Each student's action creates the chance for the next one to succeed."],
      ["How does the relationship among Harry, Ron, and Hermione change?", "A shared danger and mutual protection turn them from classmates into close friends.", ["Hermione asks to be moved to another house.", "Ron decides never to speak to Hermione.", "Harry leaves the group to become Draco's friend."], "The chapter explicitly connects their friendship to what they survive together."],
      ["What idea is most important in the chapter's ending?", "Courage and loyalty can repair a conflict and build friendship.", ["Breaking rules is always the best choice.", "Being the strongest person guarantees success.", "Schoolwork has no value during a crisis."], "The students use what they learned, risk themselves for one another, and forgive the earlier hurt." ]
    ]
  },
  {
    number: 11,
    title: "Quidditch",
    pages: [220, 235],
    guide: "Harry prepares nervously for his first Quidditch match against Slytherin. During the game, his broom begins bucking and trying to throw him off. Hermione sees Snape staring at Harry and muttering, so she sets fire to Snape's robes to break what she believes is a curse; in the rush she knocks into Quirrell. Harry regains control and catches the Snitch in his mouth, winning the match. Hagrid refuses to believe Snape would steal what Dumbledore is protecting, but he accidentally gives the friends a new clue: Nicolas Flamel.",
    questions: [
      ["How does Harry catch the Golden Snitch?", "He catches it in his mouth after diving toward the ground.", ["He traps it inside his robes before the match.", "Ron catches it and throws it to him.", "It lands on Harry's broom while he is sitting still."], "Harry nearly swallows the Snitch, then holds it up to prove the winning catch."],
      ["What happens before Harry regains control of his broom?", "Hermione sets fire to Snape's robes to interrupt what she thinks is a curse.", ["Hagrid tells the friends about Nicolas Flamel.", "Harry is awarded the House Cup.", "The team returns to the common room."], "The disturbance in the stands breaks the muttering and the broom steadies."],
      ["Why does Hermione set Snape's robe on fire?", "She believes Snape is cursing Harry's broom and wants to distract him.", ["She wants Slytherin to lose points for untidy robes.", "She is trying to warm the cold spectators.", "Hagrid tells her that fire will summon the Snitch."], "Hermione acts after watching Snape's fixed stare and moving lips."],
      ["Why does Hagrid reject the idea that Snape is trying to steal the hidden object?", "He trusts Dumbledore and says Snape is one of the teachers helping protect it.", ["Snape was not present at the match.", "Hagrid believes nothing is hidden at Hogwarts.", "Snape has already told Harry what the object is."], "Hagrid's loyalty to Dumbledore makes the accusation seem impossible to him."],
      ["Which evidence best suggests Harry's broom trouble is not an ordinary malfunction?", "The broom fights Harry's control while a professor appears to be muttering continuously at him.", ["Harry has never played a full match before.", "The weather is cold and windy.", "The Slytherin team uses newer brooms."], "The broom's violent, focused behavior and the apparent spellcasting point to outside interference."],
      ["How do Harry, Ron, and Hermione develop as a group after the match?", "They begin actively investigating the secret instead of merely noticing strange clues.", ["They agree never to discuss Snape again.", "They decide the three-headed dog was imaginary.", "They ask Draco to lead their investigation."], "Their conversation with Hagrid turns suspicion into a shared search for Nicolas Flamel."],
      ["Why is Hagrid's mention of Nicolas Flamel important?", "It gives the friends a specific lead connecting the trapdoor to the secret object.", ["It teaches Harry a new Quidditch move.", "It proves the Snitch was enchanted.", "It explains why Neville missed the match."], "The name is the first concrete clue the friends can research." ]
    ]
  },
  {
    number: 12,
    title: "The Mirror of Erised",
    pages: [236, 259],
    guide: "Harry stays at Hogwarts for Christmas and receives an anonymous Invisibility Cloak that belonged to his father. Using it to search the Restricted Section, he is chased into an unused room containing the Mirror of Erised. The mirror shows Harry surrounded by the family he has never known, while Ron later sees himself successful and admired. Harry becomes obsessed with returning to the mirror. Dumbledore explains that it shows a person's deepest desire, warns that people can waste away before it, and moves it to a new location.",
    questions: [
      ["What anonymous Christmas gift once belonged to Harry's father?", "An Invisibility Cloak", ["A Firebolt broomstick", "A silver cauldron", "A book about Nicolas Flamel"], "A note with the cloak says James Potter left it with the sender before he died."],
      ["What does Harry do before he first discovers the Mirror of Erised?", "He uses the cloak to search the Restricted Section of the library.", ["He takes Ron to see the mirror.", "He asks Dumbledore to move the mirror.", "He sees his parents at the Christmas feast."], "Harry flees the library after opening a screaming book and hides in the mirror room."],
      ["Why does Harry repeatedly return to the mirror?", "He longs to see the family he never had a chance to know.", ["The mirror gives him answers to his homework.", "Ron dares him to touch the glass.", "He believes Nicolas Flamel is trapped inside it."], "The image of his parents and relatives fills a deep need for family and belonging."],
      ["What does the difference between Harry's and Ron's reflections reveal?", "Their deepest desires reflect Harry's lost family and Ron's wish to stand out.", ["The mirror shows the same future to every student.", "Ron values family while Harry only wants prizes.", "Neither boy sees anything connected to his feelings."], "The mirror responds to each viewer's private longing rather than showing ordinary reality."],
      ["What can readers infer from Dumbledore's response when he finds Harry?", "Dumbledore understands Harry's grief but believes the mirror is dangerous if used as an escape.", ["Dumbledore has never heard of the mirror.", "Dumbledore wants Harry to visit it every night.", "Dumbledore plans to use it to punish students."], "He speaks kindly, but firmly warns Harry not to seek the mirror again."],
      ["How does Harry's attitude toward the mirror change?", "His joyful discovery becomes an obsession that he must give up after Dumbledore's warning.", ["He dislikes it at first and later wants to own it.", "He immediately decides that its images are unimportant.", "He breaks the mirror when it does not answer him."], "The mirror first comforts Harry, then begins drawing his attention away from real life."],
      ["What is the main lesson of Dumbledore's warning?", "Desire can reveal what matters to a person, but living inside a wish prevents real action and growth.", ["Every strong wish will automatically come true.", "Memories of family should always be ignored.", "Only teachers are allowed to hope for success."], "Dumbledore says the mirror gives neither knowledge nor truth and can consume people who stare into it." ]
    ]
  },
  {
    number: 13,
    title: "Nicolas Flamel",
    pages: [260, 275],
    guide: "Harry, Ron, and Hermione finally identify Nicolas Flamel from Dumbledore's Chocolate Frog card and a library book. They learn that Flamel made the Philosopher's Stone, which can create gold and an elixir of life. Harry fears Snape will act during the next Quidditch match, but Dumbledore's presence reassures him and Harry wins quickly. Later, Harry secretly sees Snape confronting Quirrell in the forest and pressing him about the Stone's defenses. The friends conclude that Snape wants the Stone and that Quirrell may be giving in.",
    questions: [
      ["What can the Philosopher's Stone produce?", "Gold and an elixir that extends life", ["Invisibility cloaks and flying brooms", "Dragons and three-headed dogs", "Moving portraits and talking hats"], "The library book explains the Stone's two extraordinary powers."],
      ["Which earlier object helps Hermione identify Nicolas Flamel?", "Dumbledore's Chocolate Frog card", ["Neville's Remembrall", "Harry's Hogwarts letter", "The label on Snape's cauldron"], "Harry remembers that Flamel's name appeared on the card with Dumbledore."],
      ["Why do the friends believe the hidden Stone is in serious danger?", "They think Snape is trying to force Quirrell to reveal or weaken its protections.", ["Flamel announces that he has given it to Draco.", "The goblins display it in an open vault.", "Dumbledore asks students to search for it."], "Harry overhears Snape questioning Quirrell about the defenses and loyalty."],
      ["Why does Harry choose to play in the match even though he fears Snape?", "He refuses to abandon his team or appear too frightened to face the danger.", ["McGonagall promises to complete his homework.", "Ron says the match has been cancelled.", "Snape orders Harry to become referee."], "Harry decides that withdrawing would let fear and Slytherin control him."],
      ["What does Harry's quick victory in the match show?", "He can stay focused and perform skillfully even while worried about a threat.", ["He no longer cares about the hidden Stone.", "The other team has agreed to let him win.", "He has discovered that Snape cannot use magic."], "Harry spots and catches the Snitch rapidly despite his anxiety."],
      ["How does Hermione's research change the friends' investigation?", "It turns an unfamiliar name into an explanation of what is being guarded and why someone wants it.", ["It convinces them to stop asking questions.", "It proves Hagrid invented Nicolas Flamel.", "It reveals that Ron owns the Stone."], "Once they understand the Stone's power, the earlier clues form a more complete danger."],
      ["Why does learning about the Stone raise the stakes of the story?", "Its power over wealth and death gives a dangerous person a powerful reason to steal it.", ["It guarantees that exams will be cancelled.", "It proves the guarded trapdoor is empty.", "It makes Quidditch more important than the mystery."], "The object is no longer just a secret package; it could restore or empower someone dangerous." ]
    ]
  },
  {
    number: 14,
    title: "Norbert the Norwegian Ridgeback",
    pages: [276, 291],
    guide: "Hagrid wins a dragon egg from a hooded stranger and secretly hatches it in his hut. The baby Norwegian Ridgeback, Norbert, grows rapidly, damages the hut, and bites Ron badly enough to send him to the hospital wing. Harry, Ron, and Hermione persuade Hagrid that the illegal and dangerous dragon must go. Ron's brother Charlie arranges for friends to collect Norbert from the Astronomy Tower, but Draco discovers the plan. Harry and Hermione deliver Norbert, forget the Invisibility Cloak on the tower, and are caught by Filch on their way back.",
    questions: [
      ["What kind of dragon is Norbert?", "A Norwegian Ridgeback", ["A Hungarian Horntail", "A Chinese Fireball", "A Common Welsh Green"], "Ron identifies the baby dragon as a Norwegian Ridgeback."],
      ["Which event happens before Charlie's friends collect Norbert?", "Norbert bites Ron, and the friends decide the dragon must be moved.", ["Filch catches Harry and Hermione.", "The Invisibility Cloak is left on the tower.", "Draco receives detention in the forest."], "Norbert's growth and Ron's injury make the relocation necessary."],
      ["Why does Hagrid keep the egg and hatch it despite the rules?", "He has always wanted a dragon and lets that dream outweigh the danger.", ["Dumbledore orders him to raise it for a class.", "He believes the egg contains the Philosopher's Stone.", "The goblins pay him to protect it."], "Hagrid's excitement makes him minimize the legal and practical risks."],
      ["Why do Harry, Ron, and Hermione contact Charlie?", "They need someone with dragon experience to move Norbert safely away from Hogwarts.", ["They want Charlie to enter Norbert in a contest.", "They need help teaching Norbert to play Quidditch.", "They plan to sell the dragon to Gringotts."], "Charlie's work with dragons gives them a realistic way to solve the problem."],
      ["Which evidence most clearly proves that keeping Norbert has become unsafe?", "The rapidly growing dragon burns objects and gives Ron a poisonous bite.", ["Norbert sleeps quietly in a wooden crate.", "Hagrid reads books about dragon care.", "Charlie answers Ron's letter."], "The physical damage and serious injury show that affection cannot make the situation safe."],
      ["How does Hagrid's attitude toward Norbert change?", "He moves from delighted excitement to a tearful acceptance that the dragon must leave.", ["He dislikes Norbert at first and later refuses to separate from him.", "He never shows any feelings about the dragon.", "He decides to give Norbert to Draco as a gift."], "Hagrid still loves Norbert, but finally accepts the friends' plan."],
      ["What larger point is shown by the trouble with Norbert?", "Good intentions and strong affection do not remove the consequences of a dangerous choice.", ["Every school rule is unfair and should be ignored.", "A secret is safe as long as friends know it.", "Dangerous animals become harmless when given names."], "Hagrid's dream creates risks for himself and the children, and the solution still leads to punishment." ]
    ]
  },
  {
    number: 15,
    title: "The Forbidden Forest",
    pages: [292, 313],
    guide: "After losing many points for Gryffindor, Harry, Hermione, and Neville are rejected by their classmates. Their detention sends them with Hagrid, Draco, and Fang into the Forbidden Forest to find an injured unicorn. Harry and Draco discover a hooded figure drinking the dead unicorn's blood, and Draco flees. The centaur Firenze rescues Harry and explains that unicorn blood keeps a dying person alive at a terrible cost. Harry realizes that Voldemort is surviving in the forest and plans to use the Philosopher's Stone to return to full strength.",
    questions: [
      ["What are the detention group and Hagrid searching for in the forest?", "An injured unicorn", ["A missing three-headed dog", "A stolen broomstick", "A lost centaur foal"], "Hagrid follows silver blood because a unicorn has been wounded."],
      ["What happens after Harry and Draco find the dead unicorn?", "A hooded figure drinks its blood, Draco runs, and Firenze rescues Harry.", ["The unicorn wakes and leads them home.", "Snape arrives and awards Harry points.", "Hagrid immediately captures the figure."], "The encounter becomes dangerous when the figure moves toward Harry."],
      ["Why would someone drink unicorn blood?", "It can keep a person alive even when that person is close to death.", ["It permanently removes every magical weakness.", "It reveals the location of hidden treasure.", "It makes any animal obey the drinker."], "Firenze explains both the life-preserving effect and the cursed price."],
      ["Why does Firenze carry Harry away despite the other centaurs' objections?", "He chooses to protect Harry from immediate danger instead of standing aside because of fate.", ["He wants Harry to join the centaur herd.", "He believes Harry injured the unicorn.", "He has been ordered by Draco to help."], "Firenze acts because the hooded figure is approaching Harry, even though Bane criticizes interfering."],
      ["Which conclusion does Harry draw from Firenze's clues?", "Voldemort is using unicorn blood while waiting to regain power through the Stone.", ["Hagrid is secretly selling unicorn blood.", "The centaurs plan to steal the Stone.", "Nicolas Flamel is hiding in the forest."], "A nearly dead being desperate for life and the Stone's elixir point Harry toward Voldemort."],
      ["How does Draco's behavior change during the detention?", "His confident mocking collapses into panic when he faces a real threat.", ["He begins frightened and becomes the group's bravest member.", "He calmly protects Harry from the hooded figure.", "He decides to confess the dragon plan to Hagrid."], "Draco boasts before the danger appears but abandons Harry and Fang when frightened."],
      ["Why is the forest encounter a major turning point?", "It reveals that Voldemort may already be close and makes protecting the Stone urgent.", ["It proves the Stone has already been destroyed.", "It ends Harry's fear of the Forbidden Forest.", "It shows that the school points were never lost."], "The mystery becomes a direct threat tied to the wizard who killed Harry's parents." ]
    ]
  },
  {
    number: 16,
    title: "Through the Trapdoor",
    pages: [314, 343],
    guide: "Harry realizes that the stranger who gave Hagrid the dragon egg also learned how to get past Fluffy. With Dumbledore lured away and the teachers unconvinced, Harry, Ron, and Hermione decide to protect the Stone themselves. Neville tries bravely to stop them, so Hermione temporarily freezes him. The trio passes Fluffy, Devil's Snare, flying keys, and giant chess by using their different strengths. Ron sacrifices his chess piece, Hermione solves the potion riddle, and Harry continues alone toward the final chamber.",
    questions: [
      ["What puts Fluffy to sleep?", "Music", ["Dragon blood", "A levitation spell", "Moonlight"], "Hagrid accidentally revealed that music makes the three-headed dog fall asleep."],
      ["Which sequence correctly orders the first four protections the friends face?", "Fluffy, Devil's Snare, flying keys, giant chess", ["Giant chess, Fluffy, potions, flying keys", "Devil's Snare, troll, Fluffy, giant chess", "Flying keys, Fluffy, giant chess, Devil's Snare"], "The rooms require music, escape from the plant, broom flying, and then a chess victory."],
      ["Why does Neville try to stop the trio from leaving the common room?", "He wants to protect Gryffindor from more rule-breaking and lost points.", ["He plans to steal the Stone himself.", "Draco has ordered him to guard the portrait hole.", "He thinks the trio is going to a Quidditch match."], "Neville stands up to his friends because he believes their actions could hurt the house again."],
      ["Why does Ron allow himself to be taken in the chess game?", "His sacrifice lets Harry make the move that wins the game and opens the way forward.", ["He wants to leave Hogwarts early.", "He believes the chess pieces cannot hurt him.", "He has forgotten how the game works."], "Ron deliberately accepts injury because the team cannot advance otherwise."],
      ["What does Hermione's solution to the potion riddle demonstrate?", "Careful logic can solve a problem that ordinary spellcasting cannot.", ["Only physical strength matters in the final rooms.", "The labels clearly announce which bottle is safe.", "Harry remembers the answer from Quidditch practice."], "Hermione reasons from the written clues and identifies the correct bottles."],
      ["How do the three friends develop as a team in the protected rooms?", "Each contributes a different strength and accepts risk so the others can continue.", ["Harry solves every obstacle without help.", "They argue until the protections turn off.", "They rely on Draco to show them the route."], "Hermione handles knowledge and logic, Ron leads the chess game, and Harry flies and moves onward."],
      ["What central idea is shown by the journey through the trapdoor?", "Courage, friendship, and varied abilities are stronger together than any one person's talent.", ["Rules should be broken whenever they are inconvenient.", "Winning a game matters more than protecting people.", "The smartest person should always work alone."], "The friends reach the final chamber only because their abilities and sacrifices support one another." ]
    ]
  },
  {
    number: 17,
    title: "The Man with Two Faces",
    pages: [344, 365],
    guide: "Harry enters the final chamber expecting Snape but finds Professor Quirrell, who reveals that he served Voldemort and used the turban to hide Voldemort's face. The Mirror of Erised places the Stone in Harry's pocket because he wants to find it without using it. Voldemort orders Quirrell to seize Harry, but Harry's touch burns Quirrell because Lily Potter's loving sacrifice still protects her son. Dumbledore rescues Harry and later explains the protection, Snape's actions, and the plan to destroy the Stone. At the feast, points for Harry, Ron, Hermione, and Neville give Gryffindor the House Cup before Harry returns to the Dursleys for summer.",
    questions: [
      ["Who has actually been trying to steal the Philosopher's Stone?", "Professor Quirrell, acting for Voldemort", ["Professor Snape, acting alone", "Rubeus Hagrid", "Neville Longbottom"], "Quirrell reveals his deception and the presence of Voldemort beneath his turban."],
      ["What happens after the Mirror of Erised places the Stone in Harry's pocket?", "Quirrell and Voldemort discover Harry has it and try to take it from him.", ["Harry immediately gives it to Dumbledore.", "The mirror destroys the Stone.", "Snape enters and carries Quirrell away."], "Harry tries to hide what happened, but Voldemort realizes the Stone has moved to him."],
      ["Why is Harry able to receive the Stone from the mirror?", "He wants to find the Stone but not use it for himself.", ["He is the richest student at Hogwarts.", "He knows a secret password from Hagrid.", "He is already holding Nicolas Flamel's wand."], "Dumbledore designed the mirror's protection to reward a person seeking the Stone without selfish intent."],
      ["Why does Harry's touch injure Quirrell?", "Harry is protected by the lasting power of his mother's loving sacrifice.", ["Harry's hands are covered with dragon poison.", "Quirrell is allergic to Harry's wand wood.", "The Mirror of Erised casts a burning spell."], "Dumbledore explains that Lily's choice left a protection Voldemort cannot understand or bear."],
      ["Which fact corrects Harry's earlier judgment of Snape?", "Snape was trying to save Harry during the Quidditch match.", ["Snape had never met Quirrell.", "Snape gave Hagrid the dragon egg.", "Snape asked Voldemort to enter Hogwarts."], "Dumbledore explains that Snape's counter-curse was protecting Harry from Quirrell."],
      ["Why are Neville's final House Cup points especially meaningful?", "They reward the courage it takes to stand up to one's own friends.", ["They are awarded because Neville caught the Snitch.", "They repay Neville for helping Quirrell.", "They prove Neville earned the highest exam scores."], "Dumbledore treats Neville's difficult choice in the common room as genuine bravery."],
      ["Which idea best connects the chapter's conflicts and ending?", "Love, loyal friendship, courage, and unselfish choices defeat the pursuit of power for oneself.", ["Power belongs to whoever reaches it first.", "Adults always understand every event correctly.", "A person's family name determines every choice."], "Harry survives through Lily's love and his friends' sacrifices, while Voldemort and Quirrell fail because they seek power without care for others." ]
    ]
  }
];

function placeChoices(correct, distractors, correctIndex) {
  const choices = [];
  let distractorIndex = 0;
  for (let index = 0; index < 4; index += 1) {
    choices.push(index === correctIndex ? correct : distractors[distractorIndex++]);
  }
  return choices;
}

function createTest(chapter) {
  const positions = ANSWER_POSITIONS[chapter.number - 1];
  const id = `${BOOK_ID}-chapter-${chapter.number}`;
  return {
    id,
    bookId: BOOK_ID,
    bookTitle: BOOK_TITLE,
    chapterNumber: chapter.number,
    chapterTitle: chapter.title,
    title: `Chapter ${chapter.number} Check`,
    status: "published",
    passingPercent: 80,
    questions: chapter.questions.map((question, index) => ({
      id: `q${index + 1}`,
      type: "multiple-choice",
      skill: SKILLS[index],
      prompt: question[0],
      choices: placeChoices(question[1], question[2], positions[index]),
      correctIndex: positions[index],
      explanation: question[3]
    })),
    summaryRequired: true,
    summarySentenceCount: 5,
    summaryPrompt: SUMMARY_PROMPT,
    summaryGuide: chapter.guide,
    generation: {
      method: "source-grounded-curated-v1",
      sourcePages: chapter.pages
    }
  };
}

export const HARRY_POTTER_TESTS = Object.fromEntries(
  chapters.map(chapter => {
    const test = createTest(chapter);
    return [test.id, test];
  })
);
