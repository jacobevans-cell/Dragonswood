import { WILD_ROBOT_2_META } from "./books/wild-robot-2/meta.js?v=1";

const BOOK_ID = "wild-robot-2";
const BOOK_TITLE = "The Wild Robot Escapes";
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
    ["What is inside the last crate delivered to Hilltop Farm?", "ROZZUM unit 7134, known as Roz, is inside the crate."],
    ["How does the delivery route change before the truck reaches Hilltop Farm?", "It moves from the busy city to the highway, farm country, and finally the shabby hilltop property."],
    ["Why does the delivery truck not need a human driver?", "The truck knows its route and completes its deliveries automatically."],
    ["Why is Roz's arrival at Hilltop Farm important to her?", "It begins a new life far from the wild island she considers home."],
    ["What details show that Hilltop Farm is struggling?", "It is smaller and shabbier than nearby farms, with a crooked sign and aging buildings."],
    ["How has Roz's setting changed since her old life?", "She has moved from a remote wild island into a human-controlled farming world."],
    ["Why does the trip from city to farm matter?", "It carries Roz from the factory world toward the unfamiliar place where she must adapt again."]
  ]},
  { n:2, q:[
    ["Who first comes outside to investigate the crate?", "Oscar the dog runs out before the limping man approaches."],
    ["What does the man do after opening the crate?", "He removes the packing foam and cords, then presses the button on Roz's head."],
    ["Why is Roz still motionless when the crate opens?", "She has not yet been activated by the button on her head."],
    ["What draws the man to the delivery?", "Oscar's barking and scratching alert him that something has arrived."],
    ["What detail suggests the man has difficulty moving?", "He walks with a limp and makes his way slowly to the crate."],
    ["How does Roz's condition change at the chapter's end?", "She goes from packed and lifeless to the instant just before activation."],
    ["Why is the final click significant?", "It is the action that will awaken Roz into her new life on the farm."]
  ]},
  { n:3, q:[
    ["What name does ROZZUM unit 7134 say people may use?", "She says people may call her Roz."],
    ["What happens as Roz's systems finish activating?", "She stands, steps from the crate, explains her abilities, and announces that she is ready."],
    ["Why does Roz say she will become better at tasks over time?", "She is designed to learn and improve how she completes assigned work."],
    ["What relationship does Roz initially expect with the people around her?", "She expects them to give tasks that she will obey and complete."],
    ["What evidence shows that Roz's introduction is automatic?", "She begins the prepared speech while her robotic systems are still coming online."],
    ["How is Roz presented at the start of this new life?", "She begins as a task-focused machine whose learning ability may allow her to change."],
    ["What central ability will matter most in the new setting?", "Roz's ability to learn will let her adapt beyond her original instructions."]
  ]},
  { n:4, q:[
    ["What are the names of Mr. Shareef's children?", "His daughter is Jaya and his son is Jad."],
    ["What task does Mr. Shareef give Roz before the children arrive?", "He tells her to pack her crate and carry it into the garage."],
    ["Why can Mr. Shareef always locate Roz?", "He adds her electronic signal to the farm map on his computer."],
    ["Why does Mr. Shareef refuse Jaya's homework order?", "He bought Roz to do needed farmwork, not the children's school assignments."],
    ["What shows that Jaya values Roz's identity?", "She says she likes the name Roz instead of replacing it with Farmbot."],
    ["How does Roz enter the Shareef family routine?", "She is introduced as their worker while the children immediately become curious about her."],
    ["Why does the ownership conversation matter?", "It establishes that Roz is expected to obey while her location and freedom are controlled."]
  ]},
  { n:5, q:[
    ["What kind of farm is Hilltop Farm?", "Hilltop is a dairy farm centered on its herd of cows."],
    ["What does Mr. Shareef give Roz after the tour?", "He gives her a computer containing farm information and equipment controls."],
    ["Why did Mr. Shareef buy a robot?", "His bad leg and his wife's death left him unable to handle all the farmwork."],
    ["Why does Roz suggest staying in the barn?", "She takes seriously Mr. Shareef's statement that her work revolves around the cows."],
    ["What evidence shows the farm needs major help?", "Weeds, bare fields, junk, broken machines, and brush are spreading across the property."],
    ["How does Roz begin adapting to her assigned role?", "She studies the property, accepts many kinds of work, and chooses to stay near the herd."],
    ["What is the chapter's main conflict?", "Mr. Shareef needs Roz to restore a failing family farm even though the loss behind that need remains painful."]
  ]},
  { n:6, q:[
    ["Which cow has seen robots at another farm?", "The old cow Annabelle has seen robots before."],
    ["What happens after the herd debates whether the monster is dangerous?", "Roz steps from the shadows and speaks to them in the animal language."],
    ["Why do most cows stay awake after the storm ends?", "They are frightened by the unfamiliar machine standing in their barn."],
    ["Why does Lily think the monster may be safe?", "She reasons that the farmer would not have driven it around if it were dangerous."],
    ["What evidence shows fear is shaping the herd's guesses?", "The cows imagine Roz is waiting to eat them even though she has done nothing threatening."],
    ["How does Roz change the cows' first impression?", "She identifies herself calmly and surprises them by speaking their own language."],
    ["What idea does the chapter introduce?", "Communication can begin to replace fear when strangers do not understand one another."]
  ]},
  { n:7, q:[
    ["What did Roz do to pass the Makers' test?", "She hid her unusual personality and gave answers that made her seem like a normal robot."],
    ["What happened between Roz leaving the island and arriving at Hilltop Farm?", "The airship carried her to the factory, the Makers tested and repaired her, and she awoke on the farm."],
    ["Why could Roz not stay on the island after the RECO battle?", "Her body was badly damaged and the animals could not repair her there."],
    ["Why does Roz tell the cows her true story?", "Their shared separation from loved ones may help them understand and trust her."],
    ["What evidence shows Roz's personality camouflage was necessary?", "Robots that failed the factory questions were destroyed."],
    ["How has Roz changed from an obedient new robot?", "She now has a son, a chosen home, and a private plan to resist the life assigned to her."],
    ["Why is Roz's decision to escape significant?", "Protecting her true identity is not enough; she intends to reclaim the family and freedom she chose."]
  ]},
  { n:8, q:[
    ["What does Roz study on the farm computer?", "She studies the herd, land, weather, wildlife, machines, buildings, and dairy equipment."],
    ["What happens over the course of the night?", "Roz reads the farm information and stores every detail in her computer brain."],
    ["Why can Roz become a farmer so quickly?", "Her computer brain remembers the complete set of farming information after one night."],
    ["Why does Roz work while the cows rest?", "She must prepare for the job Mr. Shareef expects her to begin the next day."],
    ["What evidence shows the information is thorough?", "The computer covers both daily equipment and larger subjects such as seasons, climate, and wildlife."],
    ["How does Roz's role change during the chapter?", "She moves from newly assigned worker to a robot equipped with the knowledge of a farmer."],
    ["What important idea appears in this short chapter?", "Knowledge can be acquired quickly, but Roz will still have to apply it in the real world."]
  ]},
  { n:9, q:[
    ["What makes Roz fall in the pasture?", "She slips on cow dung hidden in the wet grass."],
    ["What does Roz do after the herd laughs at her fall?", "She tries an awkward laugh, stands, cleans her feet, and continues more carefully."],
    ["Why does the farm begin buzzing with activity?", "Roz repairs several broken machines and returns them to service."],
    ["Why do the Shareefs leave Roz to continue alone?", "They see the repaired Drone and realize her first day is going well."],
    ["What evidence shows book knowledge did not prepare Roz for everything?", "Despite studying all night, she does not notice the cow patty until she slips."],
    ["How does Roz respond to embarrassment and difficulty?", "She joins the humor, learns from the mistake, and keeps working successfully."],
    ["Why does the first day matter?", "It proves that Roz can turn knowledge and persistence into real improvement for the farm."]
  ]},
  { n:10, q:[
    ["What kinds of jobs might Roz do in one day?", "She may work as a mechanic, veterinarian, gardener, plumber, cleaner, carpenter, electrician, and more."],
    ["What happens to the milk after cows enter the parlor?", "Machines milk the cows, pipe the milk to tanks, cool and bottle it, and load it for delivery."],
    ["Why does Mr. Shareef rarely leave the house now?", "Roz and the automatic equipment handle farm labor while he manages business from his office."],
    ["Why does Roz hide her playful and social behavior from the Shareefs?", "She fears they will discover she is not a normal robot and have her destroyed."],
    ["What evidence shows Roz finds real pleasure in farm life?", "She stops to smell flowers, watch clouds, feel cool air, and spend time with animals."],
    ["How is Roz balancing two identities?", "Alone she acts like her wild self, but near humans she performs the role of an ordinary worker."],
    ["What central conflict shapes Roz's routine?", "The farm feels unexpectedly comfortable, yet safety requires hiding who she truly is."]
  ]},
  { n:11, q:[
    ["Who leads the flock that lands at Hilltop Farm?", "A large goose named Wingtip leads the flock."],
    ["What does Roz do when the children approach the pond?", "She quickly says good-bye to the geese and returns to work."],
    ["Why is Brightbill's flock unlikely to pass Hilltop Farm?", "His flock follows eastern flyways while Hilltop lies much farther west."],
    ["Why does Wingtip promise to help Roz?", "After hearing her story, he sympathizes and offers to direct Brightbill if their paths cross."],
    ["What evidence shows the geese revise their opinion of Roz?", "Their suspicion turns to curiosity once she speaks and explains that she raised a goose."],
    ["How does the visit affect Roz emotionally?", "Hope rises when the flock offers a possible connection, then disappointment returns after they leave."],
    ["Why is the flock's promise important?", "It creates a small but real path for news to travel between Roz and her distant son."]
  ]},
  { n:12, q:[
    ["Where does Roz believe she belongs?", "She believes she belongs with her son and friends on her island."],
    ["What does Roz do while waiting for a safe chance to leave?", "She calmly completes her farmwork while secretly planning an escape."],
    ["Why can Roz not simply run away immediately?", "Any unusual behavior might make Mr. Shareef destroy her."],
    ["What motivates Roz's hidden planning?", "Homesickness and love for her island family make her determined to return."],
    ["What evidence shows Roz is patient as well as determined?", "She continues the same daily work instead of revealing her plan through a rushed attempt."],
    ["How does Roz handle homesickness?", "She turns the painful feeling into careful, purposeful planning."],
    ["What central tension is emphasized?", "Roz must protect her present safety while working toward the home and freedom she wants."]
  ]},
  { n:13, q:[
    ["Where does Roz find the fallen Drone?", "She finds it upside down in a neighbor's bean field."],
    ["What happens after Roz repairs and sends the Drone home?", "She takes a forest shortcut, considers escaping, and discovers Mr. Shareef waiting for her."],
    ["Why does Mr. Shareef race to the edge of the property?", "Roz's electronic signal tells him that she has crossed the farm boundary."],
    ["Why does the strip of forest tempt Roz to escape?", "Its wild plants and animals remind her strongly of the island she misses."],
    ["What evidence proves Roz is continuously monitored?", "Mr. Shareef knows exactly when she steps off the property and reaches her before she can leave."],
    ["How does Roz's understanding of her situation change?", "She realizes that the electronic signal makes Hilltop Farm a trap, not merely a workplace."],
    ["Why is the failed opportunity significant?", "It shows that reaching home will require more than slipping quietly into nearby woods."]
  ]},
  { n:14, q:[
    ["What subjects does Roz secretly research?", "She searches for body diagrams, maps, news, and anything that might support an escape."],
    ["What does Roz discover after searching the computer?", "She learns that it allows only farming information and no access to the outside world."],
    ["Why can Roz not create an escape plan by herself yet?", "The restricted computer leaves her without maps, technical details, or useful news."],
    ["Why can neither the cows nor Mr. Shareef provide the help she needs?", "The cows do not know how to escape, and her owner would refuse to let her go."],
    ["What evidence shows the computer is another form of control?", "Its information is deliberately limited to the work Roz is expected to perform."],
    ["How does Roz's plan develop?", "She moves from private research to recognizing that escape will require an ally."],
    ["What is the sad truth of the chapter?", "Roz cannot regain her freedom without trusting someone inside the human world."]
  ]},
  { n:15, q:[
    ["Where does Jaya hide from her brother?", "She hides inside the workshop closet."],
    ["What happens after Jad orders Roz to reveal Jaya's hiding place?", "Jad finds Jaya, and she invites Roz to join their game."],
    ["Why does Roz point to Jaya's hiding place?", "Jad directly orders her to show him where his sister is hiding."],
    ["Why does Roz want Jaya and Jad to spend time with her?", "She cares about bringing them happiness and hopes they may eventually help her escape."],
    ["What evidence shows Roz's senses give her an unfair advantage?", "She hears the children's movements and finds both hiding places within seconds."],
    ["How is Roz's relationship with the children beginning to change?", "Their suspicion becomes playful companionship, and Roz begins quietly considering them as allies."],
    ["Why must Roz build trust carefully?", "Too much pressure could expose her secret, but too little could leave her trapped forever."]
  ]},
  { n:16, q:[
    ["What continues leaving Hilltop Farm while Roz dreams?", "The milk truck keeps leaving full and returning empty."],
    ["What pattern fills the chapter before its final sentence?", "Farm life cycles through grazing, machinery, milk processing, deliveries, play, and office work."],
    ["Why does Roz keep dreaming during an otherwise successful routine?", "The farm is functioning, but her desire to escape and return home remains unresolved."],
    ["What separates Roz from everyone else in the scene?", "The others follow visible routines while Roz privately imagines a different future."],
    ["What evidence shows the farm has settled into an efficient rhythm?", "Cows, machines, bottles, trucks, children, and Mr. Shareef repeat their regular activities."],
    ["How has Roz's inner life developed?", "She can perform her assigned work while holding a private goal that no one else can see."],
    ["Why does the brief ending matter?", "The dream of escape reveals that smooth daily life has not replaced Roz's need for freedom."]
  ]},
  { n:17, q:[
    ["Which bird is Roz watching when Lily speaks to her?", "Roz is watching a hawk soar above the pasture."],
    ["What happens after Roz admits she may never reach the island?", "The conversation falls silent, the cows graze again, and Roz keeps watching the free hawk."],
    ["Why does seeing flying birds make Roz think of Brightbill?", "Her son is a goose who could travel through the sky in a way she cannot."],
    ["Why does Lily object to Tess's advice about accepting the farm as home?", "Lily understands that Roz belongs with Brightbill and wants her to reunite with him."],
    ["What evidence shows Roz's feelings about farm life are complicated?", "She says the work feels right while also saying that she deeply misses the island."],
    ["How does Roz face the possibility of failure?", "She honestly admits she may never return even though she has not stopped longing for home."],
    ["What does the hawk symbolize in this chapter?", "Its easy flight represents the freedom and connection to home that Roz lacks."]
  ]},
  { n:18, q:[
    ["What gift has each generation of Shareefs added to the old oak?", "Family members have carved their initials into the tree's bark."],
    ["What does Roz do after performing a backflip?", "She juggles acorns and then tells a story combining a robot and animals."],
    ["Why does Roz tell a robot-and-animal story?", "It combines Jad's request for a robot story with Jaya's request for an animal story."],
    ["Why are the children interested in Roz's island tale?", "The strange family formed by a robot and gosling is more meaningful than a simple trick."],
    ["What evidence shows the story is really Roz's memory?", "Its details match how she found Brightbill's egg and became his mother."],
    ["How does Roz shift from machine to companion?", "She pauses her repair task to entertain the children and shares a carefully disguised piece of her life."],
    ["Why is the children's final question important?", "Their wish to hear what happened next opens a lasting way for Roz to build trust with them."]
  ]},
  { n:19, q:[
    ["Which stories do Jaya and Jad enjoy most?", "They most enjoy stories about the island robot and her goose son."],
    ["What happens as the children grow more comfortable with Roz?", "They move from invented tales to sharing the accident and difficulties in their own family."],
    ["Why did Hilltop Farm begin falling apart?", "After their mother died and their father was injured, no one could maintain all the machines and work."],
    ["Why does Roz hide the truth behind her island stories?", "Admitting they are her own experiences could expose her unusual identity and place her in danger."],
    ["What evidence shows the children believe Roz is helping their family heal?", "They tell her she was needed to save the farm and is doing exactly that."],
    ["How does storytelling change their relationship?", "The exchange of stories creates enough trust for the children to discuss grief and fear with Roz."],
    ["What is the chapter's central idea?", "Sharing stories can let people reveal real pain and build connection even when some truths remain hidden."]
  ]},
  { n:20, q:[
    ["What does Roz find beside the forest after following a heavy scent?", "She finds the bloodied remains of a deer along with fur, tracks, and droppings."],
    ["What does Roz do after examining the signs?", "She returns to her work before Mr. Shareef comes to investigate her location."],
    ["Why has Roz allowed unused farmland to grow wild?", "Native plants attract insects and animals that pollinate, control pests, and enrich the soil."],
    ["Why does Roz leave the carcass instead of investigating longer?", "She wants to avoid alarming Mr. Shareef by remaining at the edge of the property."],
    ["What evidence suggests the killer is more dangerous than Oscar?", "The animal killed a deer and left doglike signs too large and fierce to belong to him."],
    ["How does Roz respond to the new danger?", "She cannot identify it yet, so she becomes more watchful instead of ignoring the warning signs."],
    ["Why does the discovery matter?", "The wild land that helps the farm also brings predators, showing that nature cannot be controlled only for its benefits."]
  ]},
  { n:21, q:[
    ["What sound finally identifies the hidden threat?", "A long, menacing wolf howl identifies the threat."],
    ["What signs appear before Roz hears the howl?", "She notices furry faces, musky smells, and silhouettes moving through moonlight."],
    ["Why does the howl confirm Roz's concern?", "It connects the earlier traces to wolves living near the farm."],
    ["Why has Roz continued watching the property?", "The deer carcass convinced her that a dangerous animal might return."],
    ["What evidence builds suspense before the answer is revealed?", "Only partial sights, smells, and shapes appear until the unmistakable call is heard."],
    ["How has Roz's uncertainty changed?", "A vague suspicion becomes knowledge that wolves are nearby."],
    ["Why is this short chapter significant?", "It names the danger that will force Roz to protect the herd without violating her nonviolent programming."]
  ]},
  { n:22, q:[
    ["Who leads the seven wolves attacking Annabelle?", "A dark wolf named Shadow leads the pack."],
    ["What changes the fight after Roz pries away one wolf?", "Annabelle kicks another attacker and the rest of the herd finally marches forward."],
    ["Why does the Herding Machine fail to stop the attack?", "The wolves split up and easily dart past the slow, clumsy machine."],
    ["Why does Roz defend Annabelle awkwardly instead of striking the wolves?", "Her programming prevents her from using violence even during an attack."],
    ["What evidence shows Annabelle remains frightened after the wolves leave?", "She speaks bravely, but fear is still visible in her eyes."],
    ["How does the herd change during the attack?", "The cows move from watching in fear to finding the courage to advance together."],
    ["What central lesson comes from the rescue?", "Courage shared by Roz and the herd can drive off a threat that no defender could easily stop alone."]
  ]},
  { n:23, q:[
    ["What weapon does Mr. Shareef give Roz?", "He gives her a rifle and orders her to kill the wolves."],
    ["What happens after Roz refuses to fire the weapon?", "She notices Oscar's terror, studies the rifle and Shadow's scar, and forms another plan."],
    ["Why could repeated wolf attacks threaten Roz's place on the farm?", "Frightened cows produce less milk, which costs money and may cause Mr. Shareef to return her."],
    ["Why does Mr. Shareef become angry with Roz?", "He believes protecting his family and herd requires violence that her programming forbids."],
    ["What evidence helps Roz connect Shadow with rifles?", "Oscar panics at the weapon, while Shadow carries a long straight scar from an earlier shot."],
    ["How does Roz respond to an impossible order?", "She refuses to violate her nature but still searches for a creative way to use the rifle."],
    ["Why does Roz's new idea matter?", "It may protect the farm by using fear and understanding rather than actually hurting an animal."]
  ]},
  { n:24, q:[
    ["Whose voice does Roz imitate to lure the wolves?", "She imitates a wounded calf calling helplessly from the grass."],
    ["What happens when Shadow closes in on the hidden calf?", "The camouflaged Roz rises and points the rifle directly at him."],
    ["Why does Shadow surrender even though Roz cannot fire?", "His old gunshot scar makes him believe her threat is real."],
    ["Why does Barb warn Shadow that the situation feels wrong?", "The wounded prey seems too easy, and she senses that it may be a trap."],
    ["What evidence shows Roz understands Shadow's behavior?", "She recognizes his scar, predicts his fear of rifles, and knows a defeated wolf will cower."],
    ["How does Roz use skills from the island in her farm life?", "She combines animal-language mimicry and camouflage to solve a human farm problem."],
    ["What is the larger meaning of the bluff?", "Intelligence and restraint allow Roz to end danger without becoming violent."]
  ]},
  { n:25, q:[
    ["What farm machines harvest the summer hay?", "The Mower cuts the hay and the Baler leaves bales across the fields."],
    ["What do people and animals do after the hottest part of the day?", "They come outside after sunset to graze, chase fireflies, and stretch in cooler air."],
    ["Why are the farm's powerful sprayers activated?", "Scorching heat dries the pond and fields, so the land needs water."],
    ["Why has Roz still not asked the children to help her escape?", "She cares about them but believes revealing the truth remains too risky."],
    ["What evidence foreshadows an approaching disaster?", "Funnel clouds have repeatedly formed, and tornado season is expected eventually to produce a touchdown."],
    ["How has Roz's bond with the children grown?", "They secretly seek her out to play, tell stories, ride bicycles, and watch clouds together."],
    ["What tension fills the peaceful summer scenes?", "Warm companionship and successful farming continue while both Roz's escape problem and tornado danger remain unresolved."]
  ]},
  { n:26, q:[
    ["What object knocks Roz unconscious inside the tornado?", "A heavy flying shovel strikes the back of her head."],
    ["What does Roz do after seeing the Shareefs at the house?", "She warns them, runs through the storm, and carries the frozen Jad to the shelter."],
    ["Why is Jad unable to enter the shelter by himself?", "The real tornado overwhelms him with the fear behind his old nightmares."],
    ["Why does Roz risk remaining outside?", "She puts Jad's immediate safety ahead of her own survival."],
    ["What evidence shows the storm grows faster than expected?", "Light rain becomes swirling clouds, a siren, a torn-off roof, and destructive winds within moments."],
    ["How does Roz act as a member of the family?", "She makes a protective choice for Jad that goes far beyond ordinary farm maintenance."],
    ["Why is Roz's brief thought of flight important?", "Even in mortal danger, being lifted into Brightbill's world connects her fear to love for her son."]
  ]},
  { n:27, q:[
    ["Where do the Shareefs find Roz after the tornado?", "They find her powered off and badly damaged in a roadside ditch."],
    ["What happens after Jad presses Roz's activation button?", "Her speech begins garbled, her recovery systems repair her brain, and she can speak normally again."],
    ["Why does Jad blame himself for Roz's injuries?", "She was swept away only after going back to rescue him from the storm."],
    ["Why does Mr. Shareef excuse Roz for leaving the property?", "Her movement happened during a rescue, and he is grateful that she survived."],
    ["What evidence shows the family now cares about Roz personally?", "They cry, embrace her together, touch her reassuringly, and rush her toward repairs."],
    ["How has Mr. Shareef's relationship with Roz changed?", "He responds to her as a valued living companion rather than only replaceable equipment."],
    ["What does the family embrace signify?", "Surviving the tornado reveals that Roz has become part of the Shareefs' emotional family."]
  ]},
  { n:28, q:[
    ["What is the repair robot's name?", "The short, wide repair robot is named Patch."],
    ["What does Patch do after scanning Roz?", "He removes her ruined arm and leg and quickly snaps new limbs into place."],
    ["Why does Mr. Shareef decline software upgrades and polishing?", "Those improvements cost extra, and he decides the repaired basic unit is enough."],
    ["Why do Jaya and Jad immediately demand repairs?", "They care more about restoring Roz than pausing over the price."],
    ["What evidence shows robot repair is routine at TechLab?", "Patch arrives with a prepared ROZZUM kit and replaces both limbs within seconds."],
    ["How is Roz restored after the storm?", "Her broken body becomes whole and mobile again, though her basic design and visible scratches remain."],
    ["Why does ordering a work crew matter?", "Repairing Roz alone cannot save Hilltop Farm; the damaged home around her also needs rebuilding."]
  ]},
  { n:29, q:[
    ["Why can Mr. Shareef temporarily not track Roz?", "The tornado has knocked out electricity and the farm's computer system."],
    ["What happens after the emergency robot crew arrives?", "It clears debris, repairs structures and equipment, restores utilities, and leaves the farm rebuilt."],
    ["Why does Roz refuse the chance to escape while the farm is off the grid?", "She cannot abandon the injured and frightened Shareefs immediately after the disaster."],
    ["Why do the cows agree to remain in the open pasture?", "Roz explains the barn must be cleared for repair, and they trust her guidance."],
    ["What evidence shows the crew is designed for teamwork?", "Its members divide construction tasks and rebuild the devastated property within hours."],
    ["How does Roz's choice reveal her development?", "Loyalty and compassion now outweigh the freedom she has been planning to seize."],
    ["Why is the improved farm a meaningful outcome?", "Roz gives up an escape opportunity, and that sacrifice helps her chosen human family recover stronger than before."]
  ]},
  { n:30, q:[
    ["What gift do Jaya and Jad give Roz?", "They give her a dark leather tool belt made for a ROZZUM robot."],
    ["What does Roz do after thanking the children?", "She takes them to the oak tree and tells another story about the island robot."],
    ["Why do the children choose a tool belt?", "They want a practical gift that will make Roz's many farm repairs easier."],
    ["Why does the gift make Roz reconsider telling them the truth?", "Their savings, gratitude, and hug show they may care enough to help her leave."],
    ["What evidence shows the gift required sacrifice?", "Their card says they spent all of their savings on it."],
    ["How does Roz's view of the children change?", "She increasingly sees them not just as owners' children but as loving friends she may be able to trust."],
    ["What is the gift's deeper significance?", "An object meant for work also represents affection and may become a step toward Roz's freedom."]
  ]},
  { n:31, q:[
    ["Who was Mr. Shareef's partner in work and life?", "Jamilla managed the farm business, worked beside him, and later became his wife."],
    ["What does Mr. Shareef explain after the children fall asleep?", "He tells Roz how family changes led him to run the farm with Jamilla and how an automachine killed her."],
    ["Why did the Shareefs begin buying automachines?", "Their growing family needed help with the heavy amount of farmwork."],
    ["Why does Roz keep her questions about Jamilla to herself?", "She believes a normal robot would not ask its owner personal questions."],
    ["What evidence shows the campfire awakens memories for both speakers?", "Roz recalls Brightbill while Mr. Shareef recalls childhood gatherings and his lost wife."],
    ["How does Roz behave differently inside and outside?", "She privately wants to understand his grief but outwardly maintains the silence expected of a machine."],
    ["Why is the campfire conversation important?", "A familiar family ritual reveals the love and loss beneath Mr. Shareef's strict behavior."]
  ]},
  { n:32, q:[
    ["Whose name appears on the journal Roz finds?", "The journal belongs to Cyrus Shareef."],
    ["What does Roz do after exploring the abandoned barn?", "She opens an old trunk, reads the journal completely, and stores it in her tool belt."],
    ["Why does Cyrus believe ancient farms changed civilization?", "Growing food supported villages that eventually developed into towns and cities."],
    ["Why does Roz preserve the journal?", "She recognizes its practical wisdom and family history as a treasure worth protecting."],
    ["What evidence shows the old barn connects past and present?", "Old tools, animal smells, and Cyrus's notes remain inside a sturdy building hidden by new growth."],
    ["How does reading affect Roz's understanding of the family?", "She feels almost acquainted with an ancestor she never met and sees the farm's deeper history."],
    ["What is the chapter's central idea?", "Knowledge and values left behind can connect a struggling modern farm to the people who built it."]
  ]},
  { n:33, q:[
    ["What is the Field Machine doing in autumn?", "It is preparing the harvested fields for winter."],
    ["What happens across the countryside as autumn advances?", "Green fades, crops are harvested, leaves fall, and animals prepare for cold or migration."],
    ["Why does the Drone have less to report?", "Seasonal work and wildlife activity are slowing as the landscape becomes bare."],
    ["Why do Jaya and Jad still make time for Roz?", "School keeps them busy, but they value their shared stories and friendship with her."],
    ["What evidence shows many species respond differently to winter?", "Some repair nests or store food while swallows and other birds prepare to migrate."],
    ["How has Roz become part of the farm's seasons?", "Her work and relationships continue steadily even as plants, animals, and school routines change."],
    ["Why is the first migration of autumn important?", "Passing birds may finally carry news between Roz and the island she hopes to reach."]
  ]},
  { n:34, q:[
    ["How do unfamiliar geese know Roz before she introduces herself?", "Stories about the animal-speaking robot have spread from flock to flock along migration routes."],
    ["What happens when Wingtip's flock finally arrives?", "Roz hopes for news of Brightbill, hears that there is none, and watches the flock leave."],
    ["Why are the visiting flocks delighted?", "They discover that the seemingly ridiculous legend of Roz and her goose son is true."],
    ["Why does Roz keep welcoming flock after flock?", "Each visit offers companionship and a possible connection to Brightbill."],
    ["What evidence shows Roz's story has traveled widely?", "Geese from different flocks repeat the same details before ever meeting her."],
    ["How does repeated disappointment affect Roz?", "Her early hope fades until she questions whether she will ever see her son again."],
    ["What does the chapter show about stories?", "A true story shared across a community can travel farther than the person at its center."]
  ]},
  { n:35, q:[
    ["What option does Roz consider for ending the pain of memory?", "She considers erasing all memories of her island life."],
    ["What thought stops Roz from choosing to forget?", "She asks who she would be without the experiences that formed her."],
    ["Why do Roz's perfect memories cause pain?", "Every detail of the life she misses remains vivid even as returning seems impossible."],
    ["Why does Roz decide to keep her memories?", "They are essential to her identity, not merely information she can discard."],
    ["What evidence shows Roz is losing hope?", "She wonders whether she should accept the farm and erase the old life entirely."],
    ["How does Roz's view of memory show personal growth?", "She treats remembered relationships as part of who she is rather than replaceable data."],
    ["What central question does the chapter raise?", "It asks whether escaping pain is worth losing the memories and identity created by love."]
  ]},
  { n:36, q:[
    ["Who leads the unusual northbound flock?", "Brightbill leads the flock in a perfect V formation."],
    ["What does Brightbill do after landing in the barnyard?", "He enters the barn, perches near the herd, and announces that he is Roz's son."],
    ["Why is the flock's direction unusual?", "Other autumn flocks are traveling south, but this one deliberately flies north toward Roz."],
    ["Why does Brightbill introduce himself to the cows?", "He is searching for his mother and believes the farm animals may know where she is."],
    ["What evidence identifies him before he says his name?", "The young graceful leader arrives with purpose and guides his flock directly to the farm."],
    ["How has Brightbill changed since Roz last saw him?", "He is now capable of leading a flock on a special journey to find her."],
    ["Why is his arrival significant?", "The family connection Roz feared she had lost has crossed the distance to reach her."]
  ]},
  { n:37, q:[
    ["How did Brightbill learn where Roz was living?", "Migrating geese spread her story until it reached him at the wintering grounds."],
    ["What happens immediately after the reunion fills the barn with celebration?", "Jaya and Jad appear in the doorway after witnessing Roz speak with the animals."],
    ["Why does Brightbill arrive with the rest of his old flock?", "He left at once, but Loudwing and the others caught up because they also wanted to see Roz."],
    ["Why does Roz rush to hold Brightbill?", "Love and long separation make the reunion more important than maintaining her normal-robot disguise."],
    ["What evidence shows Roz experiences emotion despite the narrator's claim about robots?", "Everyone can recognize her joy in the way she cries out, embraces, and nuzzles her son."],
    ["How does the reunion change Roz's careful farm identity?", "For the first time, happiness causes her to reveal her true language and family in front of humans."],
    ["Why does the chapter end with the children watching?", "Roz receives what she most wanted, but that moment also exposes the secret protecting her life."]
  ]},
  { n:38, q:[
    ["What do the children realize about Roz's stories?", "They realize the island adventures were true accounts of Roz's own past."],
    ["What happens after Roz identifies Brightbill?", "She explains the danger, asks them to keep her secret, and lets them decide what is right."],
    ["Why did Roz hide the truth from Jaya and Jad?", "She feared they would be frightened and tell their father, who might return her for destruction."],
    ["Why do the children agree to protect Roz's secret?", "Compassion helps them understand the real bond between Roz and her son."],
    ["What evidence shows Jaya and Jad reason carefully?", "They connect the animal sounds, the goose, and the old stories before Roz confirms anything."],
    ["How does Roz demonstrate trust?", "She gives the children control over her future instead of lying after being discovered."],
    ["Why is the truth a turning point?", "The children can now become genuine allies because they understand both Roz's identity and the danger she faces."]
  ]},
  { n:39, q:[
    ["What device lets Mr. Shareef follow Roz's movements?", "The Transmitter in Roz sends the electronic signal he tracks."],
    ["What plan do the children make after learning why Roz cannot run?", "They agree to research ROZZUM robots and prepare a safe escape before Brightbill returns in spring."],
    ["Why do Jaya and Jad understand the reunion so deeply?", "They also wish they could be reunited with their own mother."],
    ["Why does Jad promise to save Roz?", "She saved him during the tornado, and he is determined to repay that care."],
    ["What evidence supports Jaya's idea that difference is not defectiveness?", "She notes that every person is different enough to be called a little defective by that standard."],
    ["How does Roz respond to being called possibly defective?", "She calmly examines the question and defines herself as different rather than broken."],
    ["What central idea guides the new alliance?", "Love and gratitude turn understanding into a practical commitment to help someone become free."]
  ]},
  { n:40, q:[
    ["What weather signal tells the flock it must leave?", "Snow dusting the countryside confirms that winter has arrived."],
    ["What does the flock do after saying good-bye?", "Brightbill takes the lead and flies the geese toward their warm wintering grounds."],
    ["Why can Brightbill not remain longer with Roz?", "The flock's migration instincts are pulling the geese toward the climate they need for winter."],
    ["Why does Roz rush her chores during the visit?", "She wants as much time as possible to exchange news with her son and old friends."],
    ["What evidence shows the geese accept responsibility for Brightbill?", "Loudwing promises they will keep him out of trouble during the journey."],
    ["How does Roz handle the second separation?", "She voices her fear of losing Brightbill but trusts his promise to return in spring."],
    ["Why is this farewell different from the earlier one?", "Separation now includes a clear reunion plan and allies actively preparing Roz's escape."]
  ]},
  { n:41, q:[
    ["What are the children secretly researching?", "They study ROZZUM design, construction, and maintenance to find a safe escape method."],
    ["What does Roz do through the winter before leaving?", "She services machines, prepares fertilizer and crop plans, checks the herd, and orders supplies."],
    ["Why does Roz want the farm perfectly prepared for spring?", "She plans to leave and wants the Shareefs and cows to manage well without her."],
    ["Why do Jaya and Jad finish ordinary homework first?", "They must hide their escape research and maintain their usual school routine."],
    ["What evidence shows the search is difficult?", "Useful information is hard to locate and requires persistent work over several weeks."],
    ["How does Roz prepare emotionally for departure?", "She combines hope for freedom with responsible care for those she will leave behind."],
    ["What does winter represent in the plan?", "It is a waiting and preparation season that turns a distant dream into a possible spring action."]
  ]},
  { n:42, q:[
    ["Which internal device must the children remove?", "They must remove Roz's Transmitter."],
    ["What do the three planners decide after discussing the device?", "They choose the hidden old barn as an operating room and schedule the work for that night."],
    ["Why would removing the Transmitter allow escape?", "Without it, Mr. Shareef could no longer see Roz's electronic signal on his map."],
    ["Why do the children wait until their father sleeps?", "They must perform the operation without revealing Roz's identity or their plan."],
    ["What evidence shows the operation is uncertain?", "Jad has a diagram but admits they will not know the exact procedure until Roz is open."],
    ["How has the children's help developed?", "Weeks of research now become a concrete and risky action on Roz's body."],
    ["Why is choosing the old barn significant?", "A forgotten piece of Shareef history becomes the private place where Roz may gain control of her future."]
  ]},
  { n:43, q:[
    ["What helps the children identify Roz's internal parts?", "Lantern light reveals small numbers etched on the boxes and tubes."],
    ["What happens after Roz first powers on without speaking?", "The children reopen and rearrange her parts through repeated trials until she can speak and move."],
    ["Why do Jaya and Jad become confused during the operation?", "They remove several similar boxes and tubes before understanding which parts belong where."],
    ["Why does Roz let inexperienced children operate on her?", "Their plan offers her only way to disable tracking, and she trusts them to do their best."],
    ["What evidence shows the procedure finally succeeds?", "Roz can stand, speak, move, and scan herself while confirming the Transmitter is gone."],
    ["How do the children respond after their mistake?", "After arguing and fearing failure, they use observation, patience, and trial and error to solve it."],
    ["Why must the removed Transmitter stay close for now?", "Its continuing signal makes the farm map appear normal until Roz is actually ready to leave."]
  ]},
  { n:44, q:[
    ["How long has Roz been trapped at Hilltop Farm?", "She has been trapped there for nearly a year."],
    ["What does Roz do after gaining the ability to leave unseen?", "She waits for spring and for Brightbill to return."],
    ["Why would immediate escape still fail?", "Without her son's guidance, Roz would not know the route home."],
    ["Why does Roz choose patience?", "A delayed journey with Brightbill is safer and more likely to succeed than running alone."],
    ["What evidence shows physical freedom is not the whole solution?", "The Transmitter is removed, yet Roz still lacks the knowledge needed to travel home."],
    ["How has Roz's planning matured?", "She can resist the urge to act immediately and wait for the conditions her goal actually requires."],
    ["What is the chapter's central point?", "Freedom becomes useful only when it is paired with direction, support, and good timing."]
  ]},
  { n:45, q:[
    ["What future contribution excites the calves?", "They are delighted that their milk may someday help make sweet desserts."],
    ["What happens after Roz tells the herd she will soon leave?", "The cows reassure her, compare feelings about wilderness, and support her decision."],
    ["Why is Annabelle grateful for Hilltop Farm?", "She witnessed terrible things elsewhere and values the safety, herd, barn, and kindness she has now."],
    ["Why does Roz feel guilty about her escape?", "She needs risky help from the children and Brightbill and worries she is asking too much of them."],
    ["What evidence shows Roz has improved the cows' lives?", "They say she listens, treats them lovingly, and works to keep them comfortable."],
    ["How does the herd's response affect Roz?", "Their love and approval help her see that accepting help does not make the escape selfish."],
    ["What shared idea connects the barn conversations?", "Different lives contain fear and loss, but gratitude, care, and mutual support make difficult choices possible."]
  ]},
  { n:46, q:[
    ["Where do the cows give birth to their calves?", "Each mother goes into the pasture so her calf is born in soft grass."],
    ["What happens as the last snow disappears?", "The land turns green, calving begins, and newborn animals fill the farm."],
    ["Why does Roz not need to assist the first-time mothers?", "Their instincts guide them through birth without her help."],
    ["Why is Roz distracted during the happy season?", "She expects Brightbill's returning flock and keeps searching the sky."],
    ["What evidence shows spring is advancing?", "Sunlight warms, snow melts, fresh smells return, and calves begin frolicking."],
    ["How does Roz's attention differ from the farm's mood?", "The farm celebrates new life while she focuses anxiously on the journey about to begin."],
    ["Why is spring significant to Roz?", "It is both a season of birth and the promised time when she may finally begin returning home."]
  ]},
  { n:47, q:[
    ["What family item does Mr. Shareef play after dinner?", "He plays an old violin passed down since Cyrus Shareef's time."],
    ["What happens after Roz shows Mr. Shareef the journal?", "The family gathers around it while Roz leaves them learning about their history."],
    ["Why is Roz invited to stay at dinner even though she cannot eat?", "The Shareefs value her company and want to thank her as part of their gathering."],
    ["Why does the roasted chicken trouble Roz?", "Its size reminds her of Brightbill and makes her question humans' use of animals."],
    ["What evidence shows Mr. Shareef now values Roz deeply?", "He says he cannot imagine the family managing without her."],
    ["How do Roz's feelings change as she leaves?", "Warmth from belonging turns into guilt because her planned escape will remove help the family needs."],
    ["Why does the dinner matter to Roz's decision?", "It shows that returning to one family may mean hurting another family she has come to love."]
  ]},
  { n:48, q:[
    ["Where does Brightbill perch after the flock lands?", "He returns to his familiar place on Roz's shoulder."],
    ["What do Roz and Brightbill do while herd and flock greet each other?", "They slip away for a private conversation about the escape."],
    ["Why do Roz's guilt and confusion disappear?", "Brightbill's arrival makes the long-awaited route home feel immediate and possible."],
    ["Why will Roz leave at night?", "Darkness will help conceal her movement from humans and machines."],
    ["What evidence shows the farm animals and geese have formed friendships?", "They grin, moo, honk, and eagerly catch up after the flock lands."],
    ["How does Roz shift when her son returns?", "She moves from doubting her departure to cheerfully stating a direct plan."],
    ["Why is the simple plan important?", "After a year of waiting and preparation, escape finally changes from an idea into action that very night."]
  ]},
  { n:49, q:[
    ["Who carries Roz's Transmitter after she leaves?", "Annabelle hides the device beneath her collar."],
    ["What happens after Roz hesitates at the far field?", "Jaya and Jad order her to run away, giving her the final push to leave."],
    ["Why does Brightbill send his flock home without him?", "He will not expose the whole flock to the dangers of Roz's journey."],
    ["Why do the children refuse to take back the tool belt?", "It was a personal gift expressing their love, not equipment loaned only for farmwork."],
    ["What evidence shows Roz has planned responsibly?", "She prepares the farm, arranges a tracking decoy, creates a feather signal, and warns it cannot run alone forever."],
    ["How does Roz's conflict appear physically?", "She lurches forward and backward as love for both homes overwhelms her decision-making."],
    ["What do the three good-byes reveal?", "Freedom requires Roz and those who love her to accept painful separation and shared sacrifice."]
  ]},
  { n:50, q:[
    ["Who guides Roz north through farm country?", "Brightbill guides his mother north."],
    ["What does Roz do as soon as she leaves Hilltop Farm?", "She camouflages herself, avoids open fields, and moves through the trees."],
    ["Why does Roz feel fear instead of immediate freedom?", "Capture could destroy her and could also endanger Brightbill."],
    ["Why does Roz accept the risky journey?", "Reaching her island home and chosen family matters more than remaining safely trapped."],
    ["What evidence shows the escape remains dangerous after tracking is disabled?", "Roz still hides carefully and fears being seen, captured, and destroyed."],
    ["How does Roz's idea of freedom become more realistic?", "She discovers that being untracked begins freedom but does not remove its dangers."],
    ["Why is the chapter a major turning point?", "Roz finally leaves the assigned life behind and begins the physical journey toward her chosen one."]
  ]},
  { n:51, q:[
    ["What is flying inside the white triangular airship?", "Familiar-looking RECO robots are watching from its front window."],
    ["What happens when the returning ship crosses the wheat field?", "Roz drops and disguises herself as wheat while Brightbill reaches the trees and waits."],
    ["Why does the airship fail to locate Roz?", "Her rushed camouflage hides her visually and the removed Transmitter leaves no electronic signal."],
    ["Why does Brightbill fly high above the wheat?", "He scouts for the next line of trees so Roz can cross the exposed field quickly."],
    ["What evidence suggests the ship may be hunting her?", "It flies toward Hilltop and then rapidly returns along the route Roz is taking."],
    ["How do Roz and Brightbill handle their first pursuit?", "They divide roles, trust each other's skills, and keep moving after the danger passes."],
    ["Why is surviving this encounter significant?", "The children's successful operation and Roz's island skills together defeat the first test of her freedom."]
  ]},
  { n:52, q:[
    ["What does Roz resemble whenever she freezes in disguise?", "She resembles a rotten old tree trunk."],
    ["What does Brightbill do before Roz crosses roads or passes settlements?", "He scouts from the air and returns with a safe route or timing."],
    ["Why might Roz remain motionless for hours?", "Nearby humans or robots could recognize and capture her if she moved."],
    ["Why is Brightbill suited to serve as scout?", "He practiced many birds' flight styles and can dive, soar, dart, and observe without drawing suspicion."],
    ["What evidence shows the travelers depend on cooperation?", "Roz always follows Brightbill's reports while her camouflage provides the hiding he cannot give her."],
    ["How does Brightbill use skills learned on the island?", "Practice once meant for flying becomes essential leadership and protection for his mother."],
    ["What central lesson appears in their progress?", "Different strengths combined through trust can carry companions through dangers neither could manage alone."]
  ]},
  { n:53, q:[
    ["What do some modern laboratories produce without animals?", "They manufacture meat, eggs, and milk without keeping livestock."],
    ["What does Roz do while passing the many farms?", "She secretly watches robot crews working with crops, machines, and animals."],
    ["Why does Roz wonder whether the farm robots dream of escape?", "Their work resembles her own past routine, but their identical behavior does not reveal an inner life."],
    ["Why can Roz not simply ask the robots about themselves?", "Approaching them could expose her as an escaped machine."],
    ["What evidence shows food production varies greatly?", "The travelers see open fields, greenhouses, pastures, small enclosures, barns, and laboratories."],
    ["How does Roz now view ordinary worker robots?", "She sees her former outward appearance in them while recognizing that her own private desires made her different."],
    ["What question is central to the chapter?", "It asks whether outward obedience proves contentment or hides inner awareness that others cannot see."]
  ]},
  { n:54, q:[
    ["What does Roz use to keep Brightbill warm at night?", "She builds small campfires with the lighter from her tool belt."],
    ["What do the travelers do each morning before continuing?", "They remove all traces of the campsite and set off deeper into the mountains."],
    ["Why must Roz stop each night even though she can keep hiking?", "Brightbill needs rest and warmth in the cold high country."],
    ["Why does Roz keep changing her camouflage?", "Leaves, flowers, dirt, and weeds must match the different terrain she crosses."],
    ["What evidence shows the mountains feel familiar but are not home?", "Wildlife and campfires recall the island, yet Roz and Brightbill keep a brisk northward pace."],
    ["How does Roz balance speed and care?", "She could travel continuously but adjusts the journey around her son's physical needs."],
    ["Why does the ending create suspense?", "Roz believes careful concealment is working even though an unseen observer is already tracking them."]
  ]},
  { n:55, q:[
    ["Which two wolves confront Roz?", "Shadow and Barb have followed her into the mountain meadow."],
    ["What happens after Roz launches herself in great leaps?", "The wolves study her landings, knock her off course, and trap her with Brightbill in a tree."],
    ["Why does asking about the pack enrage Shadow?", "The absent pack is a painful subject, and he insists that only Barb remains his pack."],
    ["Why is Shadow hunting Roz if he cannot eat her?", "He wants revenge for the humiliation and threat at Hilltop Farm."],
    ["What evidence shows the wolves have learned since the bluff?", "They notice Roz has no rifle and adapt to her unusual bounding escape."],
    ["How does Roz protect Brightbill during the surprise attack?", "She throws him into the air first, warns him to stay high, and draws the wolves toward herself."],
    ["Why does revenge make the danger harder to solve?", "Shadow is not driven by hunger that can be satisfied; he is willing to wait simply to hurt Roz."]
  ]},
  { n:56, q:[
    ["What object does Roz turn into a torch?", "She lights the knobby end of a dead branch."],
    ["What happens after the wolves fall asleep?", "Roz makes fire, drops from the tree, frightens them with the torch, and drives them away."],
    ["Why does fire defeat Shadow and Barb?", "Their instincts recognize the unfamiliar flames as a deadly danger."],
    ["Why does Barb remain even though she dislikes the revenge hunt?", "She does not share Shadow's obsession but stays loyal to her mate."],
    ["What evidence gives Roz the idea to use fire?", "The sleeping wolves remind her of island animals' first frightened reaction to flames."],
    ["How does Roz escape without attacking?", "She transforms knowledge of animal fear into a powerful display rather than striking the wolves."],
    ["What does the torch show about problem solving?", "Memory and understanding can turn an ordinary tool into a nonviolent answer to a dangerous trap."]
  ]},
  { n:57, q:[
    ["What is the bouncing rain actually called?", "The falling stones are hail."],
    ["What does Roz do after Brightbill is struck?", "She shields him, scans for shelter, leaps the river, and runs into an old cabin."],
    ["Why is the storm more dangerous for Brightbill than for Roz?", "Hail only clangs against her metal body, but the heavy stones can kill a bird."],
    ["Why does Roz race toward the distant cabin?", "Its roof is the only shelter she can find before her injured son is struck again."],
    ["What evidence shows Brightbill is already hurt?", "One stone knocks him down and another impact makes him cry out while Roz carries him."],
    ["How does Roz respond when nature threatens her son?", "She uses her body as a shield and pushes her strength and speed entirely toward his survival."],
    ["Why is the cabin important?", "An unknown human structure becomes the one refuge that can save a wild animal from the storm."]
  ]},
  { n:58, q:[
    ["What kind of animal is Sprinkles?", "Sprinkles is a black skunk with white stripes."],
    ["What happens during Brightbill's stay in the cabin?", "Roz feeds and waters him, Sprinkles hosts them, and he heals enough to travel after several mornings."],
    ["Why does Roz refuse Brightbill's suggestion that she leave?", "A mother would not abandon her injured son to recover alone."],
    ["Why does Sprinkles become welcoming after first objecting?", "She recognizes Roz and Brightbill from stories and sympathizes with other misunderstood creatures."],
    ["What evidence challenges Roz's first reaction to the skunk?", "Although the cabin smells bad, Sprinkles listens kindly and shares her home and supplies."],
    ["How does Roz's idea of who is alive get challenged?", "Sprinkles says the robot seems alive despite Roz's technical claim that she is not living."],
    ["What central idea closes the visit?", "Creatures judged by appearance or reputation can understand and care for one another deeply."]
  ]},
  { n:59, q:[
    ["What does Roz identify among the mountain trees?", "She identifies a deserted coal mine with boxy structures, ramps, pipes, and broken walkways."],
    ["What do Roz and Brightbill do after observing active robot worksites?", "They keep a safe distance and continue their journey."],
    ["Why is the wilderness filled with abandoned machinery?", "Humans once lived and worked there, then left their roads, mines, vehicles, and towers behind."],
    ["Why do the travelers avoid the working robots?", "Contact with human-operated crews could reveal Roz's location and end the escape."],
    ["What evidence shows human influence continues even after people leave?", "Faded signs and ruins remain while robot armies build, mine, clean, and reshape the land."],
    ["How does Roz view this landscape differently from the island?", "She sees wild nature mixed with the remains and continuing work of the civilization she fled."],
    ["What makes this wilderness strange?", "It is neither untouched nature nor active human settlement, but a place where both absence and automation reshape the mountains."]
  ]},
  { n:60, q:[
    ["What are the hunters' names?", "The two hunters are Hank and Miguel."],
    ["What happens when Hank aims at Brightbill?", "Roz charges from concealment, bends both rifles into hooks, and sends the terrified men running."],
    ["Why does Brightbill reveal himself in the tree?", "A nearby gunshot startles the forest birds, and he flies up in confusion with them."],
    ["Why does Hank decide to shoot a goose during a deer hunt?", "He assumes the strange lone bird is an easy meal and knows nothing about Brightbill."],
    ["What evidence shows the hunters misread Roz?", "Her camouflage makes them see a walking tree stump rather than a protective intelligent robot."],
    ["How does Roz respond after the danger passes?", "She comforts her trembling son and regrets not intervening sooner."],
    ["Why does the encounter matter?", "It shows how ignorance can reduce an individual to prey and why Roz must act quickly to protect someone others do not understand."]
  ]},
  { n:61, q:[
    ["What is the ram's name?", "The wild ram who collides with Roz is named Thud."],
    ["What does Thud do after apologizing?", "He leads Roz and Brightbill up a hidden mountain path and points them toward the foothills."],
    ["Why does Thud sometimes charge without wanting to hurt anyone?", "Powerful instincts make him lose control and smash into things."],
    ["Why does Thud volunteer to guide the travelers?", "He feels guilty for knocking Roz down and wants to make amends."],
    ["What evidence shows Thud is trying to control himself?", "At the final crazed impulse he stops the charge, says good-bye, and leaves peacefully."],
    ["How does Roz respond to Thud's dangerous weakness?", "She identifies the cause, forgives him, stays cautious, and accepts his sincere help."],
    ["What does the encounter suggest about instincts?", "Instincts may be powerful, but understanding, responsibility, and effort can guide how someone acts on them."]
  ]},
  { n:62, q:[
    ["What does Shadow tear from Roz while pinning her?", "He bites and carries away her tool belt."],
    ["What happens after Roz reaches the ocean and cannot go deeper?", "Brightbill calls her to a rowboat, and they row away while Shadow remains on shore."],
    ["Why can Roz slip free from Shadow's grip?", "She unbuckles the tool belt he is holding and leaves it in his mouth."],
    ["Why does Shadow blame Roz for being alone?", "He believes her earlier bluff caused his pack and then Barb to leave him."],
    ["What evidence shows Roz still cannot overcome her deep-water fear?", "She automatically stops at waist depth even though the wolf is closing in."],
    ["How does Brightbill reverse the rescue role?", "He spots the boat and directs his trapped mother toward the only escape."],
    ["Why is the rowboat escape complicated rather than triumphant?", "It defeats Shadow but carries Roz directly into the deep water she fears most."]
  ]},
  { n:63, q:[
    ["Which direction offers the coastline the travelers need?", "The distant coastline lies to the north across the bay."],
    ["What happens after Roz rows faster at Brightbill's warning?", "Both oars snap, a huge wave shatters the boat, and Roz begins sinking."],
    ["Why does Roz take the abandoned boat despite disliking theft?", "The wolf blocks the south and crossing the bay is their only route forward."],
    ["Why is Brightbill unable to save Roz after the wreck?", "He can fly above the water but cannot lift or keep her heavy metal body afloat."],
    ["What evidence shows the old boat is failing before it breaks apart?", "Rough swells toss it like a toy and force Brightbill into the air."],
    ["How does Roz's effort make the emergency worse?", "Her desperate speed snaps the oars and removes the control they need in large waves."],
    ["What does the sinking emphasize?", "Courage and strength do not erase physical limits, and the journey can still become fatal without outside help."]
  ]},
  { n:64, q:[
    ["What kind of creature rises beneath Roz?", "A giant whale rises from the deep."],
    ["What does Brightbill see after the whale breaches?", "He sees Roz lying wet and motionless across the whale's back."],
    ["Why does Roz stop sinking?", "The whale lifts her body upward and carries her above the surface."],
    ["Why does Brightbill initially close his eyes?", "Watching his mother disappear makes him hope the disaster is only a nightmare."],
    ["What evidence identifies the creature as a whale?", "It has long fins, a broad curving back, a blowhole, and a misty breath."],
    ["How does Brightbill's situation change?", "He moves from helplessly watching Roz vanish to seeing an unexpected chance that she survived."],
    ["Why is the sea creature's arrival significant?", "At the moment the travelers' own abilities fail, another member of the natural world intervenes."]
  ]},
  { n:65, q:[
    ["What is the whale's name?", "The whale who rescues Roz is named Coral."],
    ["What happens after Brightbill presses Roz's activation button?", "Roz powers on unable to move, slowly dries, regains her limbs, and embraces her son."],
    ["Why did Coral follow the rowboat?", "Stories had identified Roz and Brightbill, so she stayed nearby in case they needed help."],
    ["Why does Roz lie flat while Coral approaches land?", "Humans along the busy shoreline might recognize an escaped robot riding a whale."],
    ["What evidence shows animal stories made the rescue possible?", "Geese told coastal birds, who told sea animals, allowing Coral to recognize the famous travelers."],
    ["How does Roz's relief change by the chapter's end?", "Gratitude for surviving the bay becomes dread when she remembers an entire ocean still separates her from home."],
    ["Why does Coral refuse repayment?", "Helping the travelers is valuable to her on its own, showing how community stories inspire generosity."]
  ]},
  { n:66, q:[
    ["How do Roz and Brightbill get under the busy road?", "They use a dark drainage pipe beneath it."],
    ["What decision do they make as night falls?", "They stop circling every town and enter one in camouflage to find a faster route."],
    ["Why is travel becoming slower in the new land?", "More roads, buildings, humans, robots, and towns force increasingly large detours."],
    ["Why does Brightbill support going through towns?", "He recognizes the region and knows settlements will only become larger and closer together."],
    ["What evidence shows Roz still avoids ordinary attention?", "She waits in weeds for traffic and accepts a grimy tunnel rather than crossing in view."],
    ["How does the journey strategy change?", "Total avoidance gives way to cautious entry because the safer old method is no longer practical."],
    ["What important idea drives the choice?", "Survival sometimes requires changing a careful plan when the environment makes that plan impossible."]
  ]},
  { n:67, q:[
    ["What is the first guard dog's name?", "The short-legged dog guarding the first yard is Pookie."],
    ["What does Roz do after barking dogs expose her weed disguise?", "She hides behind a school, cleans off every speck, and enters daylight looking like a normal robot."],
    ["Why does hiding in plain sight work better?", "People expect robots on the streets, so an uncovered machine looks less suspicious than moving weeds."],
    ["Why does a black airship make Roz think about home?", "It shows how quickly flight could carry her and Brightbill across the remaining distance."],
    ["What evidence shows her unit number remains a risk?", "An identical ROZZUM passes safely, but Roz knows her own identifying number could summon RECOs."],
    ["How does Roz recover from a failed plan?", "She studies why camouflage attracted attention and adopts the opposite strategy the next morning."],
    ["Why is the town episode important?", "Roz learns that fitting into civilization may require appearing ordinary rather than using wilderness concealment."]
  ]},
  { n:68, q:[
    ["Which train car is reserved for ordinary robots?", "They must ride in the windowless last car."],
    ["What happens as Roz boards?", "The door closes and the train starts before Brightbill can follow her inside."],
    ["Why does Brightbill want to take the express train?", "It passes the city they need to cross and could save a great deal of travel time."],
    ["Why does Roz enter despite her warning instincts?", "Brightbill boards the roof first, time runs out, and she must choose whether to follow him."],
    ["What evidence shows unequal treatment of passengers?", "Humans receive comfortable windowed cars while almost all robots are confined to a windowless space."],
    ["How does Roz's caution conflict with Brightbill's confidence?", "She sees unknown risks while he trusts that her successful town disguise will continue working."],
    ["Why is the closing door significant?", "A shortcut meant to keep them together unexpectedly separates mother and son in an unfamiliar region."]
  ]},
  { n:69, q:[
    ["Where is the train's final stop?", "The train ends at Center City Station."],
    ["What does Roz do after realizing Brightbill is not aboard?", "She joins the rows of silent robots, travels to the city, and plans to find him there."],
    ["Why does Roz not break through the train door?", "A dramatic escape would expose her, so she must act like an emotionless normal robot."],
    ["Why does Roz believe Brightbill can recover from the separation?", "He is resourceful, can follow the tracks, and knows a city pigeon named Graybeak."],
    ["What evidence reveals Roz's anxiety beneath her disguise?", "She repeatedly wonders whether Brightbill is safe and whether they will meet again."],
    ["How does Roz manage panic?", "She replaces the urge to act wildly with a reasoned plan based on her son's strengths."],
    ["What theme appears during the train ride?", "Trust can steady fear when loved ones are separated and direct contact is impossible."]
  ]},
  { n:70, q:[
    ["Which direction does Roz choose after leaving the robot crew?", "She marches north because that is the direction Brightbill usually guides her."],
    ["What happens after Roz follows a ROZZUM work crew outside?", "She separates in a tourist crowd and continues walking alone through an entire night."],
    ["Why does Roz initially join the crew?", "Standing without a task would look abnormal, so marching with identical robots gives her cover."],
    ["Why must Roz ignore the city's beauty?", "Admiring art and gardens would make her behavior unlike a normal task-focused robot."],
    ["What evidence shows human comfort depends on robots?", "Machines work continuously at errands, cleaning, repairs, delivery, and construction while humans enjoy the city."],
    ["How does Roz preserve her wild identity in the city?", "Although her body imitates ordinary robots, she notices beauty and keeps making independent choices."],
    ["What is significant about the nonstop march?", "Blending in protects Roz, but it requires suppressing the very awareness and freedom she is trying to save."]
  ]},
  { n:71, q:[
    ["Where do children play as city work continues?", "The children play in city parks."],
    ["What changes while Roz observes?", "Buildings rise and fall, ships dock, trucks unload, signs flash, and people move through daily life."],
    ["Why can the city keep pulsing with activity?", "Robots perform much of the constant work behind its visible human life."],
    ["Why does Roz observe instead of joining a single task?", "She is an independent traveler studying the city rather than a machine assigned to its labor."],
    ["What evidence shows construction and removal happen together?", "New buildings go up while old buildings are taken down."],
    ["How is Roz different from the other robots described?", "They sustain the city behind the scenes, while the wild robot pauses to notice the whole system."],
    ["Why is the chapter's last sentence important?", "It separates conscious observation from mere activity and emphasizes Roz's unusual perspective."]
  ]},
  { n:72, q:[
    ["What phrase do the police robots repeat?", "They repeatedly tell passing humans to have a nice day."],
    ["What happens when their eyes remain on Roz?", "They scan her for several seconds, then move on as she walks past without incident."],
    ["Why does Roz not suddenly turn away?", "Changing direction might attract the police attention she is trying to avoid."],
    ["Why is their friendly voice frightening to Roz?", "She does not know whether they cooperate with RECOs and could identify her as an escapee."],
    ["What evidence shows her outside and inside do not match?", "She marches calmly while her thoughts are scrambled with fearful questions."],
    ["How does Roz pass another test of disguise?", "She controls her movement long enough to appear like just another robot despite intense fear."],
    ["What contrast drives the chapter?", "Cheerful programmed words can feel threatening when power, surveillance, and uncertainty lie behind them."]
  ]},
  { n:73, q:[
    ["What is the curious pigeon's name?", "The pigeon who speaks with Roz is named Strutter."],
    ["What happens after Roz asks for Graybeak?", "She learns Graybeak has died, and the flock launches a citywide search for Brightbill."],
    ["Why do the pigeons agree to help?", "Graybeak was beloved, and they consider her friend and story family worthy of their loyalty."],
    ["Why does Strutter order Roz to remain in the park?", "Searchers need one known place to reunite mother and son without also hunting for Roz."],
    ["What evidence shows Roz truly shocks birds used to everything?", "The enormous city flock reacts with disbelief when a robot speaks their language."],
    ["How does Roz respond to news of Graybeak's death?", "She honors the pigeons' grief and expresses regret that she never met Brightbill's friend."],
    ["Why is the pigeon network important?", "A huge community converts Roz's private search into coordinated help across the city."]
  ]},
  { n:74, q:[
    ["How long does Roz wait before hearing familiar voices?", "She waits through the night until the eastern sky begins to brighten."],
    ["What happens after Roz hears Brightbill and Strutter?", "She follows their calls through the woods until a white airship approaches overhead."],
    ["Why does Roz not call back to them?", "The park ranger appears to be following her and might hear the unusual response."],
    ["Why does Roz move into the wooded part of the park?", "She hopes to break the ranger's view while remaining near the pigeons' meeting place."],
    ["What evidence suggests the park ranger may be suspicious?", "He has seen her repeatedly and his footsteps continue wherever she goes."],
    ["How does hope turn into danger?", "The voices promise reunion at the exact moment a possible RECO airship finds her location."],
    ["Why is the sky important in this chapter?", "It carries both the family Roz longs for and the machine threat that can end her freedom."]
  ]},
  { n:75, q:[
    ["Which RECO units step from the airship?", "RECO 4, RECO 5, and RECO 6 confront Roz."],
    ["What happens after Brightbill warns his mother?", "Roz runs into the park woods and disappears in the thick plants."],
    ["Why do the RECOs initially remain confident?", "They expect their sensors to find Roz's electronic signal even when their eyes cannot."],
    ["Why does Roz refuse their polite command?", "She remembers that retrieval threatens her chosen life and may end in destruction."],
    ["What evidence shows the Transmitter operation protects her?", "All three hunters scan repeatedly but cannot detect any signal."],
    ["How has Roz improved her defense against RECOs?", "She now combines silent wilderness movement with freedom from the electronic tracker."],
    ["Why is their failed scan significant?", "The technology designed to own Roz no longer reveals her, giving her independent choices a real chance."]
  ]},
  { n:76, q:[
    ["Where does Strutter tell Roz to hide?", "She directs Roz through a street panel and down a ladder into a deep hole."],
    ["What happens after the construction crew rejects Roz?", "She bumps a woman, draws a crowd, sees the RECO ship, and follows the birds into a side street."],
    ["Why does the work crew immediately recognize something is wrong?", "Unlike the earlier group, these robots stop instead of accepting an unassigned unit in their line."],
    ["Why does Roz enter the underground opening without knowing the plan?", "Brightbill and Strutter insist a trusted helper is waiting and the airship is closing in."],
    ["What evidence shows Roz's plain-sight disguise has collapsed?", "A woman calls her defective, crowds point and whisper, and the RECO airship arrives."],
    ["How does Roz respond when her own plans fail?", "She accepts guidance from her animal allies even though it separates her from Brightbill again."],
    ["Why is the hidden entrance important?", "The city animals know routes and helpers outside the systems used by humans and hunting robots."]
  ]},
  { n:77, q:[
    ["What animal guides Roz through the sewers?", "A city rat guides her through the underground tunnels."],
    ["What happens after the guide realizes his legs are too slow?", "Roz carries him on her shoulder while he gives directions through miles of passages."],
    ["Why does Roz climb pipes in the large chambers?", "Crossing above the damp floor helps her follow the route through obstacles like trees in a forest."],
    ["Why does Roz avoid spying on underground robot crews?", "They could expose the escaped robot moving secretly through their workplace."],
    ["What evidence shows the rat knows a complex hidden world?", "He directs Roz through side tunnels, narrow passages, subway tracks, chambers, and a final ladder."],
    ["How does Roz treat the small guide as a partner?", "She speeds their shared travel, thanks him, and gives him an affectionate scratch before leaving."],
    ["What does the underground journey reveal?", "Communities overlooked by the city above can provide knowledge and passage unavailable through official routes."]
  ]},
  { n:78, q:[
    ["Which RECO units first land in the empty street?", "RECOs 10, 11, and 12 descend with rifles."],
    ["What happens after Roz reaches the rooftops?", "Pigeons swarm the airships, Roz runs from pursuing RECOs, and a shot melts her leg as she throws Brightbill to safety."],
    ["Why do the RECOs delay firing at first?", "Their orders prefer retrieving Roz without damage if possible."],
    ["Why do thousands of pigeons attack the ships?", "Strutter rallies birds who hate the machines crowding their skies and want to protect Roz."],
    ["What evidence shows the rescue is costly?", "Beams burn feathers, pigeons fall, and damaged airships spiral away while Roz watches in horror."],
    ["How does Roz act when she believes escape is over?", "She stops, says what matters to Brightbill, and spends her last free action saving him."],
    ["What makes the chase's ending significant?", "The city's animals defend the wild robot, but love—not winning—guides Roz's final choice under capture."]
  ]},
  { n:79, q:[
    ["Who appears instead of the Makers?", "Dr. Molovo, the founder and robot designer, comes to speak with Roz."],
    ["What does Roz realize as the room comes into focus?", "Her head and computer brain survived, but her smashed body lies in pieces below."],
    ["Why did Dr. Molovo repair Roz's computer brain?", "She wants to understand the unusual robot's behavior and conversation with a goose."],
    ["Why does Roz initially remain silent?", "Her true identity is exposed, she is helpless, and she does not yet know the woman's intentions."],
    ["What evidence distinguishes Dr. Molovo from an ordinary elegant visitor?", "Grease smudges her otherwise precise appearance, connecting her personally to mechanical work."],
    ["How has Roz's position changed since the rooftop?", "The independent runner is now only a powered head entirely dependent on the person who created her."],
    ["Why is meeting the Designer important?", "Roz finally faces the human responsible for her body, programming, purpose, and possible destruction."]
  ]},
  { n:80, q:[
    ["What purpose does Dr. Molovo say ROZZUM robots were designed for?", "They were designed simply to work for humans."],
    ["What happens after Roz tells her complete story?", "She and Dr. Molovo debate violence, freedom, identity, purpose, family, and the meaning of Roz's supposed defect."],
    ["Why did kindness help Roz survive on the island?", "It gradually built trust, especially after caring for Brightbill made the animals accept her."],
    ["Why does Roz call Dr. Molovo her mother?", "The Designer created her, and Roz's experience taught her that parenthood can exist beyond biology."],
    ["What evidence challenges the claim that Roz's feelings are unreal?", "She turns the same question on the human and describes choices, love, memory, and sacrifice shaping her life."],
    ["How does Roz define the possible glitch in her brain?", "She accepts that it may be a defect but calls it beautiful because it gave her identity and family."],
    ["What central question does their conversation explore?", "It asks whether a creator's assigned function or a being's learned choices determine that being's true purpose."]
  ]},
  { n:81, q:[
    ["What identifying number appears on the body in the video?", "The torso is marked ROZZUM 7134."],
    ["What happens after the bright beam fills the image?", "Every visible robot part melts into a puddle and a destruction notice appears."],
    ["Why are screens across the city showing the same event?", "The public wants proof that the robot they were told was defective and dangerous is gone."],
    ["Why would the displayed unit number matter to viewers?", "It links the destroyed body directly to the escaped robot from the city chase."],
    ["What evidence makes the destruction seem final?", "The video shows limbs, torso, and head all melting before the official message."],
    ["How is Roz presented to the public?", "Her complex life is reduced to a labeled defective object whose removal is announced as safety."],
    ["Why is the public video significant?", "It closes the city's search while leaving open whether the visible destruction tells the complete truth."]
  ]},
  { n:82, q:[
    ["Where does Dr. Molovo live?", "She lives in a luxurious apartment built inside the robot factory."],
    ["What happens after her butler enters the living room?", "He lays a new robot on the sofa, leaves, and Dr. Molovo tells Roz to wake up."],
    ["Why can Dr. Molovo both destroy the unit and still hold a secret?", "The public body can be eliminated while her private new creation contains something they do not know."],
    ["Why has Dr. Molovo brought the special robot into her home?", "She has decided it is time to activate the years-long project privately."],
    ["What evidence suggests she planned more than the public meltdown?", "Her newest creation already exists and is quietly carried in immediately afterward."],
    ["How does Dr. Molovo act after deciding destruction was correct?", "She follows the public decision outwardly while secretly preserving Roz in another form."],
    ["Why is the final command a turning point?", "The name Roz reveals that the apparent ending was a disguise for a new beginning."]
  ]},
  { n:83, q:[
    ["What two identifying features are missing from Roz's new body?", "The new body has neither a shutdown button nor a unit number."],
    ["What does Roz do after learning her mind was transferred?", "She thanks Dr. Molovo, studies her stronger body, and identifies herself simply as Roz."],
    ["Why did Dr. Molovo melt the old body?", "Only visible destruction of unit 7134 could satisfy the frightened public while she secretly saved Roz's mind."],
    ["Why does the Designer remove the number and button?", "She believes Roz has outgrown an assigned label and an external control over her life."],
    ["What evidence shows identity remains despite physical change?", "Roz retains her memories, voice, mind, concern for family, and immediate sense of who she is."],
    ["How does Roz answer the question of who she is?", "She stops defining herself by the manufactured unit and claims her chosen personal name."],
    ["What does the new body symbolize?", "It gives physical form to Roz's independence while preserving the experiences that created her identity."]
  ]},
  { n:84, q:[
    ["What answer finally proves Roz's identity to Brightbill?", "She gives the clumsy but exact answer that he was younger than zero when adopted inside his egg."],
    ["What happens after Brightbill enters the apartment?", "He fears the unfamiliar robot, questions her memories, recognizes his mother, and embraces her."],
    ["Why does Brightbill remain near the factory after the fall?", "He has seen Roz return from apparent death before and cannot give up hope yet."],
    ["Why does Roz avoid rushing him after his first fear?", "She understands that her new appearance requires patience and evidence, not force."],
    ["What evidence goes beyond facts anyone might have learned?", "Roz recalls intimate shared moments and speaks with the familiar imperfect reasoning Brightbill knows."],
    ["How does Brightbill adapt to Roz's changed body?", "He accepts unfamiliar arms once her memories, language, and love prove the person inside is the same."],
    ["What does the reunion show about identity?", "A person's meaningful relationships and remembered life can matter more than outward appearance."]
  ]},
  { n:85, q:[
    ["What final favor does Roz ask of Dr. Molovo?", "She asks for an airship ride back to the island."],
    ["What do Roz and Brightbill do during their stay?", "They rest, read and explore, view the city, enjoy the butler's care, and eventually grow ready to leave."],
    ["Why is the island still necessary despite Roz's new safety?", "Most humans are not ready for her emotional wild nature, while the island lets her be fully herself."],
    ["Why does Dr. Molovo insist that the travelers stay briefly?", "She wants them to recover in comfort and values their company before taking them home."],
    ["What evidence shows Dr. Molovo's work remains central to her?", "She repeatedly leaves the guests to design robots, supervise factory crews, and manage TechLab."],
    ["How does Roz experience receiving robotic service?", "The former worker feels odd being cared for, revealing her movement into a freer relationship with machines."],
    ["Why do the guests become restless in luxury?", "Comfort cannot replace the friends, wilderness, and belonging waiting at their chosen home."]
  ]},
  { n:86, q:[
    ["What destination does Dr. Molovo give the airship?", "She orders it to the island where ROZZUM unit 7134 was originally found."],
    ["What happens as the ship flies north?", "City becomes countryside, coastline becomes ocean, and finally the island grows from a green smudge into familiar land."],
    ["Why does a white airship no longer frighten Roz?", "Dr. Molovo controls this one to restore her freedom instead of using it for capture."],
    ["Why is Roz absorbed by the view near the destination?", "She recognizes the shore, mountain, waterfall, forests, meadows, and ponds she has missed."],
    ["What evidence suggests the world has changed beneath the ocean?", "Shallow areas contain formations that may be ruins of old buildings."],
    ["How does the flight transform an old symbol?", "The machine once associated with RECO danger becomes the means of fulfilling Roz's longest-held dream."],
    ["Why is the landing significant?", "A journey that nearly killed Roz by land and water ends safely because understanding changed the person with power to help."]
  ]},
  { n:87, q:[
    ["Who first publicly confirms the new robot is Roz?", "Brightbill perches on her shoulder and tells the hidden animals she is his mother."],
    ["What happens after Roz covers herself with mud and plants?", "Animals cautiously emerge, recognize her voice and wild appearance, and gather for a celebration."],
    ["Why does Roz make herself look wild again?", "Her new metal body confuses the animals, so familiar camouflage helps them recognize the friend within it."],
    ["Why is the homecoming bittersweet?", "Many loved ones welcome her, but several friends have died during her absence."],
    ["What evidence shows the whole island community remembers Roz?", "Creatures from water, trees, hills, burrows, day, and night all come to greet her."],
    ["How does Roz reconnect her new and old selves?", "She keeps the stronger body but restores the muddy wild appearance and animal voice tied to home."],
    ["What does the homecoming reveal about belonging?", "Home includes joyful recognition and painful change because a real community continues living while someone is away."]
  ]},
  { n:88, q:[
    ["What promise does Dr. Molovo make to the animals?", "She promises to keep the island secret and never return."],
    ["What happens after Roz translates the Designer's speech?", "The animals bow in respect, Dr. Molovo explains her departure, and she embraces Roz good-bye."],
    ["Why does Dr. Molovo believe Roz belongs on the island?", "The animals taught and saved her, and the wild community accepts the person she became."],
    ["Why can the Designer not visit again?", "Any continued human contact could reveal the island and endanger Roz and the animals."],
    ["What evidence shows the animals understand her sacrifice?", "Their bowed heads spread across the crowd like a wave of respect."],
    ["How has Dr. Molovo's relationship with Roz changed?", "She moves from detached creator to someone willing to risk herself, feel love, and release Roz into her chosen life."],
    ["Why are her final words important?", "Telling Roz to be wild recognizes that the creation's authentic purpose can grow beyond the creator's original plan."]
  ]},
  { n:89, q:[
    ["Which direction does Dr. Molovo's airship travel?", "The ship turns south after rising above the island."],
    ["What happens after the airship door closes?", "Its engines start, the animals step back, and the ship lifts away until it disappears."],
    ["Why do the animals back away?", "The powering engines and rising craft require space as it departs."],
    ["Why must Dr. Molovo leave alone?", "Her promise to protect the island requires ending her visit while Roz remains home."],
    ["What evidence makes the farewell final?", "The airship turns away and vanishes completely into the sky."],
    ["How does this departure differ from Roz's earlier flight?", "Roz once left broken and uncertain; now she stays restored and free while the human world leaves her."],
    ["Why is the short chapter significant?", "The disappearing ship completes the separation that makes Roz's return to wild life real."]
  ]},
  { n:90, q:[
    ["Where do Roz and Brightbill watch the sunset?", "They sit together on the slanted rocks at the island mountain's highest point."],
    ["What does Roz do as daylight fades?", "She scans the island, notices animals and evening sounds, and rests safely beside her son."],
    ["Why can Roz now feel at peace despite unanswered questions?", "She knows her origin, the life others planned, and the life she freely wants."],
    ["Why does Roz choose simply to watch the sunset?", "After constant work and escape, freedom lets her decide that quiet presence with Brightbill is enough."],
    ["What evidence shows her home satisfies more than survival?", "She feels not only safe but happy and loved amid familiar sights, scents, and sounds."],
    ["How has Roz's understanding of herself changed?", "She has moved from a unit following tasks to a person who knows her own history, desires, and belonging."],
    ["What final idea closes the story?", "Home is the place and community where Roz can live as her true self by choice."]
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
  const meta = WILD_ROBOT_2_META.chapters[chapter.n - 1];
  const positions = patternFor(chapter.n);
  const answers = chapter.q.map((item) => item[1]);
  const id = `wild-robot-2-chapter-${chapter.n}`;
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
    summaryGuide: answers.join(" "),
    generation: {
      method: "source-grounded-curated-v1",
      sourcePages: [meta.startPage, meta.endPage]
    }
  };
}

export const WILD_ROBOT_2_TESTS = Object.fromEntries(
  chapters.map((chapter) => {
    const test = createTest(chapter);
    return [test.id, test];
  })
);
