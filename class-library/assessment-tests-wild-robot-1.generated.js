import { WILD_ROBOT_1_META } from "./books/wild-robot-1/meta.js?v=1";

const BOOK_ID = "wild-robot-1";
const BOOK_TITLE = "The Wild Robot";
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
    ["How many crates remain floating after the hurricane?", "Five crates remain on the ocean after the others sink."],
    ["What happens to the surviving crates as they reach the island?", "Four smash on the rocks, while the fifth lands on their wreckage and stays intact."],
    ["Why is the robot inside the fifth crate unharmed?", "The broken crates cushion its landing instead of letting it strike the bare rocks."],
    ["How does the ocean determine the robot's arrival?", "The hurricane and current carry the sealed crate from the sinking ship to the island."],
    ["What evidence shows the hurricane is extremely powerful?", "It sinks a cargo ship and swallows nearly all the floating crates."],
    ["How does the setting change from the chapter's beginning to its end?", "The scene changes from a violent ocean storm to a calm island shore with one safe crate."],
    ["Why is the surviving crate significant?", "A chain of chance events brings a new artificial life safely into the wilderness."]
  ]},
  { n:2, q:[
    ["What creatures discover the broken robots on the shore?", "A gang of curious sea otters discovers the robot pieces."],
    ["What happens just before the robot opens her eyes?", "An otter accidentally presses the activation button and a low whirring begins."],
    ["Why does the robot turn on?", "A playful otter slaps the small button on the back of her head."],
    ["Why do the otters approach the strange objects?", "Their curiosity grows when the sparkling pieces seem harmless."],
    ["What shows that the otters are cautious as well as playful?", "They freeze, sniff the air, creep closer, and jump back after touching a part."],
    ["How does the otters' behavior change during the discovery?", "They move from caution to excited play and then become still when the crate starts whirring."],
    ["Why does this chapter matter to the story?", "The animals' curiosity accidentally awakens the robot and begins her life on the island."]
  ]},
  { n:3, q:[
    ["What is the robot's full model name?", "She is ROZZUM unit 7134 and says she may be called Roz."],
    ["What does Roz do after her programs begin coming online?", "She introduces herself, explains her abilities, and announces that she is fully activated."],
    ["Why does Roz begin speaking while still inside the crate?", "Her startup programming automatically delivers an introduction as her systems activate."],
    ["What relationship is Roz designed to have with someone who gives her a task?", "She is designed to obey the task and improve the way she completes it over time."],
    ["What detail suggests Roz can adapt beyond a single fixed action?", "She explains that she can learn and find better ways to complete tasks."],
    ["How does Roz's condition change in this brief chapter?", "She moves from a computer brain booting up to a fully activated robot ready to work."],
    ["What important ability is established here?", "Roz begins as a programmed machine, but her ability to learn will let experience change her."]
  ]},
  { n:4, q:[
    ["What source gives Roz energy inside the damaged crate?", "The sunlight charges Roz's battery."],
    ["How does Roz get out of the crate?", "She snaps the restraining cords, pulls the crate apart, and climbs out."],
    ["Why does Roz break the cords around her arms?", "She identifies that the restraints prevent movement and applies more force."],
    ["What motivates Roz to begin examining her surroundings?", "Something like curiosity draws her attention to the warm light above."],
    ["Why does the narrator compare Roz to a hatchling?", "She breaks through her container and enters the world as if emerging from an egg."],
    ["What first sign shows Roz can respond to a new environment?", "She identifies the sun, uses its energy, and solves the problem of escaping her crate."],
    ["What is significant about Roz 'hatching'?", "The image makes her mechanical activation resemble the beginning of an animal's life."]
  ]},
  { n:5, q:[
    ["What does Roz find scattered across the shore?", "She finds the broken bodies of the other four robots."],
    ["What does Roz do after the otters flee?", "She takes her first steps, studies the wreckage, and then heads away from the ocean."],
    ["Why does Roz decide to climb the sea cliffs?", "Her survival instincts lead her toward the lush land that appears safer than the shore."],
    ["Why do the otters race away from Roz?", "Her sudden movement and voice make her seem like a frightening sparkling monster."],
    ["What evidence suggests Roz is the only robot to survive?", "Every robot body on the shore is broken except for Roz."],
    ["How does Roz progress during the chapter?", "She goes from standing beside her crate to walking independently and choosing a direction."],
    ["Why is the robot gravesite important?", "It shows both the danger Roz survived and the urgency of learning how to survive next."]
  ]},
  { n:6, q:[
    ["Which animal gives Roz the idea for climbing the cliffs?", "A crab gives Roz the idea through its wide stance and grippy feet."],
    ["What does Roz do after watching the crab?", "She copies its technique and methodically climbs to the soil above the cliffs."],
    ["Why does Roz change her climbing method?", "Her upright attempts cause dents and scrapes, while the crab moves easily over rock."],
    ["How does Roz learn from the crab without receiving instructions?", "She observes the crab's body position and imitates what works."],
    ["What evidence shows Roz persists despite difficulty?", "She keeps climbing after rocks crumble and after struggling to find handholds."],
    ["How does Roz become better suited to the island?", "She replaces an awkward method with a movement learned from a native animal."],
    ["What central idea appears in the climb?", "Careful observation and adaptation can solve a problem that strength alone cannot."]
  ]},
  { n:7, q:[
    ["Why is walking through the forest difficult for Roz?", "Rocks, fallen trees, and tangled underbrush repeatedly trip and unbalance her."],
    ["What does Roz do after falling and getting dirty?", "She cleans every speck from herself before continuing."],
    ["Why does Roz stop on the pine-needle clearing?", "The flat open ground seems safer than the rough forest."],
    ["How do the animals react to Roz's arrival?", "They fall silent and watch the unfamiliar sparkling monster from hiding places."],
    ["What detail shows Roz's programming still controls her priorities?", "She immediately cleans herself because she must stay in good working order."],
    ["How does the wilderness challenge Roz's original design?", "Its irregular ground makes her perfect mechanical lines and movements awkward."],
    ["What does the chapter establish about Roz's new home?", "The wilderness may be alive and beautiful, but Roz must learn new ways to move and belong there."]
  ]},
  { n:8, q:[
    ["What repeatedly falls onto Roz in the forest?", "Pinecones repeatedly strike her head and body."],
    ["What does Roz do when the pinecone storm becomes too much?", "She scans for shelter and notices the large rocky mountain above the trees."],
    ["Why does Roz finally leave the clearing?", "Strong wind makes pinecones rain down until remaining there is no longer comfortable."],
    ["How does Roz's response to the pinecones change?", "She first ignores them, then feels annoyance and actively searches for safety."],
    ["What evidence shows a small problem is becoming serious to Roz?", "Single occasional thunks grow into a rapid shower that forces her to move."],
    ["What new behavior does Roz demonstrate?", "She recognizes discomfort and makes a plan instead of simply standing motionless."],
    ["Why are the pinecones significant?", "A minor natural irritation pushes Roz to explore more of the island and make decisions for herself."]
  ]},
  { n:9, q:[
    ["What does Roz discover from the mountain peak?", "She discovers that ocean surrounds her and that she is on an island."],
    ["What does Roz do after reaching the highest stone?", "She turns her head around, surveys the island, and observes its many animals."],
    ["Why does Roz climb to the treeless peak?", "The mountaintop offers safety from falling pinecones and a clear view."],
    ["How does the island's life contrast with Roz?", "The animals are natural life, while Roz is a new form of artificial life."],
    ["What evidence shows the island contains many habitats?", "Roz sees beaches, forests, streams, foothills, and many different animals."],
    ["How does Roz's understanding of her location change?", "She moves from wandering through unknown land to recognizing the whole island around her."],
    ["Why is the view from the mountain important?", "It reveals both Roz's isolation and the living community she will need to understand."]
  ]},
  { n:10, q:[
    ["What important fact does Roz not know about herself?", "She does not know that a factory built her or that a wrecked cargo ship carried her."],
    ["What conclusion does Roz reach while looking over the island?", "Because she knows no other place, she accepts the island as home."],
    ["Why does Roz fail to question whether she belongs?", "She has no memory of the factory, warehouse, shipwreck, or accidental activation."],
    ["How does the reader's knowledge differ from Roz's?", "The reader knows the chain of events that brought her, while Roz knows only her present surroundings."],
    ["What evidence shows Roz begins without a personal history?", "None of the events before her activation exist in her memory."],
    ["How does Roz begin forming an identity?", "She defines home through her current experience rather than through an unknown origin."],
    ["What idea does the reminder introduce?", "Belonging can grow from where someone lives and learns, not only from where that person was made."]
  ]},
  { n:11, q:[
    ["What does Roz use as headlights?", "Bright beams shine from her eyes."],
    ["What does Roz do after watching night cover the island?", "She anchors herself to the rocks, switches off nonessential programs, and sleeps."],
    ["Why does Roz switch off some programs?", "Her computer brain decides to conserve energy."],
    ["How does Roz adjust the light from her eyes?", "She dims and then turns off the beams when they are too bright for the dark mountaintop."],
    ["What evidence shows Roz experiences the night carefully?", "She watches the stars, listens to chirps, and adjusts her headlights to the darkness."],
    ["How does robot sleep differ from animal sleep?", "Roz remains anchored while selected systems shut down instead of sleeping biologically."],
    ["Why does the first night matter?", "It shows Roz beginning a daily rhythm within the island while remaining distinctly mechanical."]
  ]},
  { n:12, q:[
    ["What dangerous force races down the mountain during the storm?", "A rushing mudflow races down the mountainside."],
    ["How does Roz escape the mudflow?", "She reaches a pine tree, climbs into its branches, and locks herself around the trunk."],
    ["Why does Roz leave the mountaintop?", "A storm as fierce as the shipwreck hurricane makes the exposed peak dangerous."],
    ["Why do the pinecones no longer bother Roz?", "Compared with the mudflow below, their impacts are a small price for safety in the tree."],
    ["What evidence shows Roz reacts quickly to danger?", "She recognizes the approaching storm, slides from the peak, runs, and climbs before the mud reaches her."],
    ["How has Roz's survival behavior improved?", "She now uses the island's landscape actively instead of merely searching for a motionless safe spot."],
    ["What central lesson does the storm reinforce?", "Safety in the wilderness is temporary, so survival requires alertness and flexible choices."]
  ]},
  { n:13, q:[
    ["What does Roz find when she examines the island after the storm?", "She finds floods, uprooted trees, mud, debris, and animals that have largely survived."],
    ["Where does Roz go after seeing the storm damage?", "She approaches a quiet hole in the mountainside that looks safe."],
    ["Why did the animals survive better than Roz expected?", "They sensed the storm early and found shelter before it arrived."],
    ["Why is Roz attracted to the cave?", "Her battered condition makes the dark quiet opening seem like needed protection."],
    ["What evidence shows the wilderness is taking a toll on Roz?", "Her body has collected clangs, damage, mud, and wear after only a week."],
    ["How does Roz compare with the animals after the storm?", "She realizes the native animals possess survival knowledge that she still lacks."],
    ["Why is the cave ending important?", "Roz's search for safety leads her toward a new danger she has not learned to recognize."]
  ]},
  { n:14, q:[
    ["What animals does Roz accidentally wake in the cave?", "She wakes a young brother and sister pair of bears."],
    ["What happens after Roz runs out of the cave?", "The bears chase, catch, bite, claw, and ram her until she suddenly vanishes."],
    ["Why do the bears chase Roz?", "Their instinct urges them to attack a strange creature that runs away from them."],
    ["Why does Roz keep asking the bears to stay away instead of fighting?", "Her programming prevents her from using violence against them."],
    ["What evidence shows Roz is poorly designed for this encounter?", "She cannot outrun the bears or defend herself while they damage her body."],
    ["How does the chapter change Roz's idea of the cave?", "A place that looked like shelter becomes one of her most dangerous mistakes."],
    ["What does the bear attack demonstrate?", "Good intentions and strong machinery cannot replace knowledge of animal behavior."]
  ]},
  { n:15, q:[
    ["Where does Roz land when she jumps away from the bears?", "She lands on a tree branch above them."],
    ["What does Roz do after pinecones annoy the bears?", "She deliberately throws more pinecones until their mother calls them home."],
    ["Why can Roz throw pinecones even though she cannot be violent?", "She treats the tactic as annoying and distracting rather than as an attack."],
    ["Why do the young bears finally leave?", "They hear their mother calling and know they are in trouble."],
    ["What evidence shows Roz can improvise under pressure?", "She turns an accidental pinecone impact into a successful escape strategy."],
    ["How does Roz use an earlier annoyance differently now?", "Pinecones change from a problem that drove her away into a tool that protects her."],
    ["What central idea does the escape show?", "Creative thinking can find a nonviolent solution even in immediate danger."]
  ]},
  { n:16, q:[
    ["What sticky substance spreads across Roz in the tree?", "Pine resin coats her fingers, arms, legs, and torso."],
    ["What happens after a robin protests Roz's presence?", "The branch eventually snaps and Roz crashes to the forest floor under debris."],
    ["Why does the robin screech at Roz?", "Roz is sitting directly below the bird's newly built nest."],
    ["Why does Roz remain in the tree after the bears leave?", "She wants peace, safety, and time to inspect and clean her damaged body."],
    ["What evidence shows cleaning is making the situation worse?", "Scrubbing the resin spreads it farther, and bird droppings add another mess."],
    ["How is Roz forced away from her preference for perfect cleanliness?", "Natural materials cover her body and the broken branch drops her into even more debris."],
    ["Why is the mess important to Roz's development?", "What seems like a failure of cleanliness prepares the camouflage idea that will help her survive."]
  ]},
  { n:17, q:[
    ["What unusual moving object does Roz notice among the branches?", "She notices a stick insect that looks like a twig."],
    ["What does Roz do after studying the insect?", "She thanks it, returns it gently, and considers using camouflage herself."],
    ["Why does the insect remain difficult to see?", "Its shape, colors, and markings closely match a real twig."],
    ["How does Roz treat the tiny insect?", "She handles it gently and regards it as a teacher rather than as an unimportant creature."],
    ["What evidence supports Roz's conclusion about camouflage?", "The insect can sit in plain sight while appearing to be part of a branch."],
    ["How does Roz turn an observation into learning?", "She connects the insect's survival method to her own need to avoid danger."],
    ["What central idea does the stick insect introduce?", "A small creature can teach a powerful lesson when someone observes it with care."]
  ]},
  { n:18, q:[
    ["What does Roz first spread over her body to camouflage herself?", "She covers herself with thick mud."],
    ["What disguises does Roz use over the following weeks?", "She becomes plants in a clearing, seaweed, a bramble, a log, and a rock."],
    ["Why does Roz accept becoming dirty?", "Her desire to stay alive becomes stronger than her programming-driven wish to remain clean."],
    ["How does Roz adapt the stick insect's example?", "Instead of copying a twig, she uses local materials to match each surrounding landscape."],
    ["What evidence shows the camouflage works?", "Animals pass close by while the disguised robot remains unnoticed."],
    ["What important priority changes for Roz?", "Survival and learning now take priority over keeping her metal body spotless."],
    ["Why is camouflage a turning point?", "It lets Roz stop frightening animals long enough to study how island life actually works."]
  ]},
  { n:19, q:[
    ["What kinds of transformations does Roz observe?", "She sees tadpoles become frogs and caterpillars become butterflies."],
    ["What does the camouflaged robot do while island life continues?", "She quietly watches many plants, animals, and natural cycles."],
    ["Why can Roz observe ordinary wildlife now?", "Her camouflage prevents animals from reacting to her as a sparkling monster."],
    ["How is Roz relating to the island in this chapter?", "She becomes a patient observer instead of disturbing everything she approaches."],
    ["What evidence shows her observations are broad?", "The chapter moves from skies and webs to hunting, growth, water, decay, and changing animals."],
    ["How has Roz changed from her first forest walk?", "She now stays still to learn from the wilderness rather than stumbling noisily through it."],
    ["What is the significance of the observations?", "Understanding a community begins with noticing its many connected patterns."]
  ]},
  { n:20, q:[
    ["Which animals does Roz begin understanding first?", "She first begins understanding the repeated songs of birds."],
    ["What does Roz learn after weeks of listening?", "She learns that different species share a common animal language spoken in different ways."],
    ["Why can Roz learn what the birds' songs mean?", "She hears the same songs in the same situations and studies their patterns repeatedly."],
    ["How does camouflage change Roz's relationship with animals?", "It lets her listen nearby without causing them to flee or alter their normal behavior."],
    ["What evidence shows animal sounds carry specific messages?", "Frogs use calls to locate one another, and birds repeat songs for regular purposes."],
    ["How does Roz's perception of the island change?", "What once sounded like meaningless noise becomes understandable words."],
    ["Why is learning animal language essential?", "Communication gives Roz the first real possibility of joining the island community."]
  ]},
  { n:21, q:[
    ["What is the Dawn Truce?", "It is one hour at dawn when the island animals agree not to hunt or harm one another."],
    ["What happens when Roz reveals herself at the gathering?", "She introduces herself, but the frightened animals scatter when the truce ends."],
    ["Why has an unusually large group gathered in the meadow?", "Swooper's report of a mysterious camouflaged creature has alarmed the island."],
    ["Why does Roz introduce herself to animals who fear her?", "She can finally speak their language and wants them to understand who she is."],
    ["What evidence shows the animals do not yet trust Roz?", "They discuss her as a monster and leave her alone as soon as hunting time returns."],
    ["How does Roz's role change at the Dawn Truce?", "She steps out of secret observation and tries to become a known member of the community."],
    ["Why is the introduction an important first step?", "Belonging cannot begin until Roz risks being seen and tries to communicate openly."]
  ]},
  { n:22, q:[
    ["What new word spreads across the island?", "The new word spreading among the animals is Roz."],
    ["What happens when animals notice Roz approaching?", "They whisper warnings and hurry away from her."],
    ["Why do the animals want nothing to do with Roz?", "They still imagine the unfamiliar robot as a prowling monster."],
    ["How does island gossip shape Roz's relationships?", "Fearful comments create a reputation before most animals know her personally."],
    ["What evidence shows Roz is socially isolated?", "Everywhere she goes, animals speak unkindly and leave."],
    ["How does Roz's lack of ordinary emotion protect her here?", "The rejection does not make her as sad as it would make most creatures."],
    ["What larger idea does the new word reveal?", "A name can spread quickly while the true character of the person behind it remains unknown."]
  ]},
  { n:23, q:[
    ["Why is Fink the fox unable to walk normally?", "Porcupine quills are stuck in his face and paws."],
    ["What does Roz do after Fink asks for help?", "She calmly removes every quill and places them in a neat pile."],
    ["Why was Fink struck by the porcupine's quills?", "He tried to attack the porcupine for food and underestimated its defense."],
    ["Why does Fink accept help from someone he distrusted?", "His pain and danger matter more than his fear of Roz."],
    ["What evidence shows Roz helps carefully?", "She kneels beside Fink and removes the quills one at a time until none remain."],
    ["How does Fink's view of Roz begin to change?", "He leaves grateful and admits that he owes her after she saves him."],
    ["Why is helping Fink significant?", "A useful act of kindness begins replacing Roz's frightening reputation with earned trust."]
  ]},
  { n:24, q:[
    ["What family does Roz accidentally destroy?", "Her fall kills two geese and smashes four of their eggs."],
    ["What happens when the wet stone breaks under Roz?", "She crashes down the cliff through branches and lands among the ruined goose nest."],
    ["Why does the block of stone break?", "Rain makes the cliff dangerous and the stone cannot support Roz's heavy weight."],
    ["How is Roz connected to the dead geese?", "She did not intend harm, but her falling body directly caused the family's deaths."],
    ["What evidence shows Roz understands the seriousness of the accident?", "Something clicks in her computer brain as she recognizes that she caused the destruction."],
    ["How does this event change Roz's place in the wilderness?", "She becomes responsible for damage to other lives instead of being only a creature trying to survive."],
    ["Why is the accident a major turning point?", "Its terrible consequence creates the responsibility that will transform Roz into a caregiver."]
  ]},
  { n:25, q:[
    ["What does Roz find alive near the destroyed nest?", "She finds one perfect goose egg peeping beneath wet leaves."],
    ["What does Roz do after deciding to protect the egg?", "She carries it away, makes a woven nest, and climbs an oak with it."],
    ["Why does Roz refuse to leave the egg?", "Without a family it will die, and she will not let her accident cause another death."],
    ["Why does Roz prevent Fink from treating the egg as food?", "She has accepted responsibility for protecting the living gosling inside it."],
    ["What evidence suggests the gosling already seeks a parent?", "A tiny voice inside the egg repeatedly peeps for its mama."],
    ["How does Roz respond differently to life and death now?", "Instead of only observing nature's losses, she chooses to save the survivor she endangered."],
    ["What is the egg's significance?", "The fragile survivor gives Roz her first purpose based on responsibility for another life."]
  ]},
  { n:26, q:[
    ["What animal does the badger attack beneath Roz's tree?", "The badger attacks Pinktail the opossum."],
    ["What happens when Pinktail appears to die?", "The badger loses interest, leaves, and Pinktail later gets up unharmed."],
    ["Why does Pinktail become limp instead of running?", "Playing dead is the opossum's natural defense against danger."],
    ["Why is Roz fascinated by Pinktail's behavior?", "The performance is another survival strategy that her own programming did not teach her."],
    ["What evidence shows the performance fools the badger?", "He sniffs and examines the motionless opossum, then abandons her."],
    ["How does Roz continue learning from island animals?", "She treats an unfamiliar instinct as useful knowledge and speaks respectfully with Pinktail afterward."],
    ["What idea does the performer reinforce?", "Survival can depend on understanding when not to fight, flee, or appear threatening."]
  ]},
  { n:27, q:[
    ["What is the first thing the hatchling sees?", "He first sees Roz looking back at him."],
    ["What does Roz do when the hungry gosling cannot name a food?", "She carries him in his nest and searches the forest for an adult goose."],
    ["Why does the gosling call Roz Mama?", "Like a newly hatched bird, he identifies the first figure he sees as his mother."],
    ["Why does Roz seek a grown goose?", "She lacks the specific knowledge needed to feed and raise a gosling."],
    ["What evidence shows the gosling is completely dependent?", "He can say only simple needs such as Mama and Food and cannot explain what he requires."],
    ["How does Roz begin acting like a parent despite denying the title?", "She uses a gentle voice, protects the hatchling, and looks for knowledgeable help."],
    ["Why does the hatching echo Roz's earlier arrival?", "Both Roz and the gosling break from containers and enter the world needing to learn how to live."]
  ]},
  { n:28, q:[
    ["What name does Loudwing give the gosling?", "The old goose names him Brightbill."],
    ["What advice does Loudwing give after explaining the gosling's needs?", "She tells Roz to build a ground home near the pond and ask Mr. Beaver for help."],
    ["Why do the forest animals help Roz find Loudwing?", "Seeing her protect a hatchling challenges their belief that she is only a monster."],
    ["Why is Loudwing willing to advise Roz?", "The orphaned gosling needs a caregiver, and Roz has committed herself to keeping him alive."],
    ["What evidence shows raising Brightbill will require a community?", "Different animals direct Roz to Loudwing, who then sends her to Mr. Beaver."],
    ["How does Roz's identity change during the conversation?", "She is given the practical responsibilities of Brightbill's mother even though she is a robot."],
    ["What central idea emerges from Loudwing's help?", "Family can begin through chosen care and can be supported by knowledge shared across a community."]
  ]},
  { n:29, q:[
    ["What does Roz offer the beavers?", "She offers freshly cut healthy trees that they need for their dam."],
    ["What bargain does Mr. Beaver finally propose?", "If Roz brings four more trees, he may build a home for her and Brightbill."],
    ["Why does Roz carry a tree onto the dam?", "She notices the beavers' constant need for wood and uses that need to offer a fair trade."],
    ["Why is Mr. Beaver hesitant at first?", "The sight of a powerful robot carrying a tree with a gosling still seems bizarre and potentially dangerous."],
    ["What evidence shows Roz negotiates patiently?", "She stops when warned, explains her request, and waits on the dam for an answer."],
    ["How does Roz improve her way of seeking help?", "She offers something valuable in return instead of expecting animals to trust her immediately."],
    ["Why is the bargain important?", "Cooperation begins when Roz understands another family's needs as well as her own."]
  ]},
  { n:30, q:[
    ["What name is given to Roz and Brightbill's new lodge?", "Their new home is called the Nest."],
    ["What does Mr. Beaver recommend after building the lodge?", "He recommends a garden and sends Roz to Tawny for help growing it."],
    ["Why does Mr. Beaver make the lodge sturdy and roomy?", "Roz does not know how long they will stay, and he expects a garden may attract future friends."],
    ["How does Roz respond to the beavers' work?", "She thanks them and clearly recognizes that she and Brightbill could not build the home alone."],
    ["What evidence shows Mr. Beaver sees more in Roz than a monster?", "He calls her likable, plans for her visitors, and offers advice for making friends."],
    ["How has Roz's situation changed since standing alone in the clearing?", "She now has a son, a strong home, helpful neighbors, and a plan for community."],
    ["What does building the Nest represent?", "A physical shelter becomes the foundation for a family and a place of belonging."]
  ]},
  { n:31, q:[
    ["Where does Brightbill finally choose to sleep?", "He sleeps in Roz's arms."],
    ["What does Brightbill do before bedtime?", "He explores every corner of the warm new lodge."],
    ["Why does Brightbill reject the moss cushion and little nest?", "He feels safest and most loved when his mother holds him."],
    ["How can Roz comfort Brightbill despite her hard body?", "Her strength, stillness, and dependable care make her mechanical arms feel safe."],
    ["What evidence shows the Nest already feels like home?", "Brightbill explores happily, rests beside a fire, and sleeps peacefully with Roz."],
    ["How does Roz move beyond performing a parenting task?", "She responds to Brightbill's emotional need for closeness as well as his physical need for shelter."],
    ["Why is their first night significant?", "It confirms that love and safety can make an unconventional robot-and-goose pair into a real family."]
  ]},
  { n:32, q:[
    ["Whom does Roz ask the deer family to find?", "She asks for Tawny the doe."],
    ["What agreement do Roz and Tawny make?", "Tawny will help create a garden if her family may eat from it."],
    ["Why does Tawny agree to help?", "Roz's fair exchange with the beavers suggests that she can cooperate and return help."],
    ["Why do the deer remain instead of running from Roz?", "They have heard about Roz and Brightbill and believe the pair means no harm."],
    ["What evidence shows trust is spreading?", "Crownpoint allows Tawny to step forward, and Tawny follows Roz back to the Nest."],
    ["How has Roz's reputation changed since her introduction?", "Animals now know enough about her actions to meet and bargain with her calmly."],
    ["What does the agreement with Tawny show?", "Lasting community grows through reciprocal help rather than one-sided favors."]
  ]},
  { n:33, q:[
    ["What unusual contribution does Tawny ask the neighbors to leave?", "She asks animals to leave droppings that will enrich the garden soil."],
    ["What happens after neighbors gather around the project?", "They contribute, talk with Roz, and help transplant many wild plants."],
    ["Why are moles and groundhogs invited to the garden?", "Their burrowing loosens the soil so plants can take root."],
    ["How does the garden project help Roz socially?", "Working together gives neighbors a comfortable reason to meet and talk with her."],
    ["What evidence shows the project feels communal?", "Animals come and go, laugh, chat, contribute fertilizer, and move plants together."],
    ["How does Roz's home begin changing?", "The bare area around the Nest becomes a planted space visited and supported by neighbors."],
    ["Why is the garden more than a source of food?", "It turns mutual work into friendship and helps Roz become part of island life."]
  ]},
  { n:34, q:[
    ["Which family visits the thriving garden every morning?", "Tawny, Crownpoint, and their three fawns visit to graze."],
    ["What happens as Roz combines advice with experience?", "She becomes increasingly skilled at feeding, protecting, teaching, and comforting Brightbill."],
    ["Why does the garden become successful?", "Roz's design makes her good with plants, and she gives the garden careful attention."],
    ["How do Roz and Brightbill spend much of their time together?", "They walk slowly through the forest and pond area and remain near their busy garden."],
    ["What evidence shows Roz is an attentive mother?", "She answers questions, plays, protects Brightbill, and rocks him to sleep."],
    ["How does Roz's parenting develop?", "She combines information from others with lessons learned through daily care."],
    ["What central idea does the chapter express?", "Excellent parenting comes from steady attention and learning, not from matching a traditional family shape."]
  ]},
  { n:35, q:[
    ["What danger does Brightbill encounter during his first swim?", "The large fish Rockmouth tries to attack him."],
    ["How does the swimming lesson end?", "Loudwing drives off Rockmouth and returns Brightbill safely to Roz."],
    ["Why does Roz stay on shore?", "She cannot swim and fears she would be unable to protect Brightbill in the pond."],
    ["Why does Roz allow Brightbill to join Swimming Day anyway?", "She trusts Loudwing and the flock to teach and guard the gosling where Roz cannot."],
    ["What evidence shows Brightbill is eager rather than afraid?", "He excitedly repeats the word swim and enters the water with the other goslings."],
    ["How does Roz grow as a mother during the lesson?", "She learns that protecting Brightbill sometimes means trusting others to guide him."],
    ["Why is the first swim important?", "Brightbill must develop as a goose even when his robot mother cannot share every experience."]
  ]},
  { n:36, q:[
    ["Why does Brightbill swallow small pebbles?", "The pebbles naturally help a goose grind food in its gizzard."],
    ["What routine do Roz and Brightbill develop at night?", "Roz adjusts his comfort, brings food or water, and rocks him after nightmares."],
    ["Why does Loudwing stop Roz from holding Brightbill upside down?", "Roz mistakes normal goose behavior for a dangerous problem."],
    ["How does Loudwing support Roz's parenting?", "She explains unfamiliar goose needs without taking Roz's place as Brightbill's mother."],
    ["What evidence shows Brightbill is growing well?", "He becomes a strong swimmer and speaker and gains size, strength, and appetite."],
    ["How does Roz respond when her stored advice is insufficient?", "She accepts correction and keeps learning from Brightbill and experienced animals."],
    ["What does Brightbill's growth reveal?", "A child can thrive when devoted care is combined with help from a wider community."]
  ]},
  { n:37, q:[
    ["What is the young squirrel's name?", "The squirrel introduces herself as Chitchat."],
    ["What does Brightbill say after listening to Chitchat's long introduction?", "He says she talks just enough, that he likes her, and that they should be friends."],
    ["Why does Chitchat speak in a nervous rush?", "She wants to meet Brightbill but feels anxious about approaching someone new."],
    ["Why does Brightbill respond so warmly?", "He listens past Chitchat's nervousness and genuinely wants a friend."],
    ["What evidence shows Brightbill is patient?", "He waits through her uninterrupted speech and answers kindly instead of mocking her."],
    ["How does Chitchat change by the end?", "The nonstop talker becomes speechless with happiness when Brightbill accepts her."],
    ["What idea does their meeting emphasize?", "A generous response to someone's awkwardness can begin an immediate friendship."]
  ]},
  { n:38, q:[
    ["What kinds of activities do Brightbill and Chitchat share?", "They play, explore, eat, and trade stories together."],
    ["What does Chitchat do when it is Brightbill's turn to speak?", "She becomes quiet and listens closely to every word."],
    ["Why does their conversation work despite Chitchat talking so much?", "Her interest in Brightbill is sincere, and she gives him attention in return."],
    ["How does Roz feel about the new friendship?", "She feels amusement at their talk and something like happiness for her son."],
    ["What evidence shows Chitchat trusts Brightbill?", "She tells him both exciting and ordinary details about her life while they explore."],
    ["How does friendship expand Brightbill's world?", "He gains a companion his own age with whom he can share play and conversation."],
    ["Why is the new friendship significant to Roz too?", "A mother's happiness grows when her child forms a healthy bond beyond the family."]
  ]},
  { n:39, q:[
    ["Where does Brightbill practice his first flight?", "He practices on the grassy western ridge above the ocean."],
    ["What happens after repeated running, flapping, and tumbling?", "The wind catches Brightbill's wings and he finally flies."],
    ["Why does Roz take Brightbill to the ridge?", "His curiosity about the wider island gives her a reason to show him the ocean and open sky."],
    ["Why is Brightbill's success bittersweet?", "He is thrilled to fly but wishes his mother could fly beside him."],
    ["What evidence shows flight requires persistence?", "Brightbill tries repeatedly and continues even though his early landings end in tumbles."],
    ["How does Brightbill become more independent?", "He gains a natural ability that can carry him beyond the places Roz can go."],
    ["What does the first flight represent?", "Growing up opens freedom for Brightbill while also revealing a limit his mother cannot share."]
  ]},
  { n:40, q:[
    ["What do Roz and Brightbill see far out at sea?", "They see a very large ship crossing the ocean."],
    ["What do they do until the ship disappears?", "They watch it move south and wonder about its origin, destination, and passengers."],
    ["Why does the ship appear small and slow?", "Its great distance hides its true size and speed."],
    ["Why can Roz define a ship but not answer Brightbill's deeper questions?", "Her stored knowledge explains the object, but she lacks experience with the world beyond the island."],
    ["What evidence shows the outside world is still mysterious to both characters?", "Neither has seen a ship before, and their questions remain unanswered."],
    ["How does the sighting expand their understanding?", "They realize that unknown beings and places exist beyond their isolated home."],
    ["Why is the ship significant?", "It quietly connects the island to the human world that will eventually come looking for Roz."]
  ]},
  { n:41, q:[
    ["Where do Roz, Brightbill, and Chitchat explore on clear days?", "They explore places such as the southern point, waterfall, forest canopy, and other island habitats."],
    ["What do the friends do after safely avoiding a fishing bear?", "They meet again at the Nest and tell the neighbors about their danger."],
    ["Why do the three friends separate when they see a bear?", "Each uses a different safe escape: flight, treetop travel, or camouflage."],
    ["Why does Roz ask the youngsters about dreaming, flying, and eating?", "She wants to understand experiences that animals have but a robot cannot share."],
    ["What evidence shows their summer has both adventure and comfort?", "They explore and face danger on clear days but play and tell stories together during rain."],
    ["How has Roz's life changed since her lonely arrival?", "Her days now center on friendship, curiosity, shared stories, and caring for her son."],
    ["What does the summer chapter celebrate?", "A family can build a rich everyday life from exploration, safety, learning, and time together."]
  ]},
  { n:42, q:[
    ["Why do the other goslings make fun of Brightbill?", "They call Roz a monster and tease him for having a robot mother."],
    ["What choice does Brightbill make after hearing Roz explain their history?", "He decides to keep calling Roz Mama, and she keeps calling him son."],
    ["Why does Brightbill refuse Roz's offer to confront the goslings?", "He believes a parent's intervention would increase the teasing."],
    ["How does Roz answer Brightbill's questions about their family?", "She tells him the truth about being a robot while making clear that her care will not change."],
    ["What evidence shows Brightbill accepts their difference?", "He smiles and says their family is strange but that he likes it that way."],
    ["How does Brightbill move through the conflict?", "He changes from embarrassed anger to a more secure understanding of his bond with Roz."],
    ["What central idea does the strange family express?", "A family is defined by lasting love and care rather than by its members looking alike."]
  ]},
  { n:43, q:[
    ["Where does Brightbill demand to go?", "He demands to see the dead robots on the northern shore."],
    ["What does Brightbill do when Roz tries to stop the argument?", "He runs toward the pond and flies away."],
    ["Why does Brightbill become angry with Roz?", "Mystery about her origin and her refusal to show him the robots make him feel confused and controlled."],
    ["Why is Roz reluctant to take him to the gravesite?", "She believes the broken robots and questions about death may be too disturbing for him."],
    ["What evidence shows Brightbill has new power in the relationship?", "He points out that he can fly away where Roz cannot follow."],
    ["How is Brightbill changing as he grows?", "He begins demanding answers and independence instead of accepting every decision his mother makes."],
    ["Why is his departure significant?", "Growing independence creates conflict when a parent tries to protect a child from difficult truth."]
  ]},
  { n:44, q:[
    ["Where does Roz find Brightbill?", "She finds him on the cliffs above the robot gravesite."],
    ["What do mother and son decide at the end?", "They agree to climb down and face the dead robots together."],
    ["Why does Roz immediately race north?", "She believes the gravesite is Brightbill's destination and imagines the dangers he may face alone."],
    ["Why has Brightbill waited instead of visiting the shore by himself?", "His need to understand remains strong, but he wants his mother's support when he faces it."],
    ["What evidence shows Roz worries like a parent?", "She rapidly computes storms, predators, injury, and other threats while searching for him."],
    ["How do Roz and Brightbill repair their argument?", "Roz listens to his need for truth, and Brightbill admits that he needs her beside him."],
    ["What does the runaway episode teach?", "Independence and family trust can grow together when both sides replace control with honest support."]
  ]},
  { n:45, q:[
    ["What do Roz and Brightbill examine on the northern shore?", "They examine a wrecked robot of the same model as Roz."],
    ["What happens after they discuss whether living things die?", "They prepare to leave, Brightbill flies upward, and Roz climbs toward two waiting bears."],
    ["Why does Brightbill ask whether Roz will die?", "The ruined robot makes death and his mother's vulnerability real to him."],
    ["Why does Roz take Brightbill to the gravesite now?", "She accepts that honest knowledge is more helpful than continuing to shield him."],
    ["What evidence shows the shore has changed since Roz arrived?", "Her crate and some parts are gone, while sand, seaweed, and small creatures cover what remains."],
    ["How does Brightbill's understanding of Roz develop?", "He learns that she belongs to a manufactured kind and can eventually stop functioning."],
    ["Why are the dead robots significant?", "They connect Roz to an unknown past while reminding the family that their time together is not guaranteed."]
  ]},
  { n:46, q:[
    ["What are the two young bears named?", "The sister is Nettle and the brother is Thorn."],
    ["What happens when Thorn goes over the cliff?", "Roz catches him and holds on while the bear family pulls them back to safety."],
    ["Why do Nettle and Thorn confront Roz?", "They remember their earlier defeat and still insist that the robot is a monster."],
    ["Why does Roz refuse to drop Thorn despite his attack?", "Her commitment to preventing harm is stronger than any wish for revenge."],
    ["What evidence shows Roz risks herself to save an enemy?", "She hangs over the cliff supporting Thorn while the others struggle to pull her up."],
    ["How does the rescue change the conflict with the bears?", "The robot they wanted to destroy becomes the one creature keeping Thorn alive."],
    ["What central idea does the fight reveal?", "Mercy during conflict can expose true character more powerfully than winning a battle."]
  ]},
  { n:47, q:[
    ["What part of Roz is missing after the rescue?", "One of her feet has broken off."],
    ["How does the group get Roz home?", "Animals gather around her in a supportive parade and help her reach the Nest."],
    ["Why is walking through the forest nearly impossible?", "Roz's smooth leg stump slips on the ground and one-footed hopping quickly fails."],
    ["Why does Mother Bear promise that her cubs will leave Roz alone?", "Roz saved Thorn even after both cubs attacked her."],
    ["What evidence shows the rescue earns broad respect?", "The bears apologize and animals help escort the injured robot through the island."],
    ["How has Roz's relationship with the bears changed?", "Former enemies leave the garden as grateful new friends."],
    ["Why is the parade significant?", "The island community now carries the robot who once had to survive entirely by herself."]
  ]},
  { n:48, q:[
    ["What material does Mr. Beaver use for Roz's replacement foot?", "He shapes the new foot from a section of hard tree trunk."],
    ["What happens after early designs are tested?", "Mr. Beaver and his helpers keep improving the foot until Roz can rely on it."],
    ["Why must the design solve several different problems?", "The foot needs grip and durability and must attach securely to a mechanical leg."],
    ["Why does Mr. Beaver enjoy the difficult project?", "He loves a building challenge and wants to help his friend walk again."],
    ["What evidence shows the first idea is not treated as good enough?", "The builders repeatedly test and modify the wooden foot before declaring success."],
    ["How does Roz adapt to permanent damage?", "She accepts a slower pace and slight limp while learning to use a dependable natural replacement."],
    ["What does the new foot symbolize?", "Island friendship and natural materials repair a machine in a way her distant makers never planned."]
  ]},
  { n:49, q:[
    ["What makes Brightbill exceptional even though he is small?", "He studies carefully and becomes the smartest, most skillful flier."],
    ["What do the other goslings begin doing each morning?", "They wait for Brightbill to lead them into the sky."],
    ["Why can Brightbill circle without much flapping?", "He understands that rising warm air creates an updraft."],
    ["How does Roz help with an ability she cannot perform?", "She studies other birds with Brightbill and coaches him from their observations."],
    ["What evidence shows the young geese trust Brightbill's judgment?", "They prefer following him in formation and join his airborne adventures."],
    ["How has Brightbill developed since his first tumbling flight?", "He becomes a confident leader who reads weather and combines techniques from many birds."],
    ["What central idea does his flying success show?", "Intelligence, observation, and practice can matter more than being the biggest or strongest."]
  ]},
  { n:50, q:[
    ["What happens when Brightbill first presses Roz's button?", "Roz powers down, her eyes go dark, and her whirring stops."],
    ["What does Brightbill do after hesitating beside the silent robot?", "He presses the button again and waits fearfully for her to restart."],
    ["Why is Brightbill afraid both to press and not press the button again?", "Leaving Roz off means losing her, but restarting her might change or fail to restore her."],
    ["Why do mother and son test the button?", "Their shared curiosity eventually becomes stronger than their uncertainty about what it does."],
    ["What evidence shows time feels different to each of them?", "The shutdown feels instantaneous to Roz but lasts like forever for Brightbill."],
    ["How does the experiment affect Brightbill?", "It makes the possibility of losing his mother immediate and deepens his relief when she returns."],
    ["What is the button's larger significance?", "A simple mechanical control reveals the emotional difference between a robot's function and a son's love."]
  ]},
  { n:51, q:[
    ["What first visible sign tells Roz that autumn has arrived?", "She finds frost covering the garden."],
    ["What do migratory birds prepare to do as the island cools?", "They prepare for a long journey south to warmer wintering grounds."],
    ["Why do many animals change fur, feathers, homes, or habits?", "Shorter days and colder weather require preparation for winter survival."],
    ["How does autumn affect the island community differently?", "Some creatures grow protective coats, some hibernate, some stay active, and others migrate."],
    ["What evidence shows the rich summer season is ending?", "Leaves fall, flowers wither, colors fade, and food becomes less plentiful."],
    ["How does Roz's awareness of seasons develop?", "For the first time she watches an entire environment transform and understands that animal routines must change."],
    ["Why is the arrival of autumn especially important to the family?", "The seasonal change means Brightbill must soon follow his species away from Roz."]
  ]},
  { n:52, q:[
    ["Why must Brightbill leave the island?", "As a goose, his instincts direct him to migrate south with the flock for winter."],
    ["What does Roz do when Brightbill asks questions she cannot answer?", "She takes him to Loudwing and the other geese for accurate guidance."],
    ["Why does Roz discourage Brightbill from staying with her?", "Migration is the safest and most natural way for him to survive the cold season."],
    ["Why does Brightbill worry about Roz?", "She cannot join the flock, so they will face their first long separation during an unknown winter."],
    ["What evidence shows Brightbill accepts his goose instincts?", "Even while wishing Roz could come, he says those instincts definitely tell him to fly south."],
    ["How does Roz again put Brightbill's needs before her own?", "She supports a painful separation because joining the flock is best for him."],
    ["What does the flock represent for Brightbill?", "It connects him to the needs and shared journey of his species beyond his unusual family."]
  ]},
  { n:53, q:[
    ["Who promises to look after Roz while Brightbill is away?", "Chitchat promises to watch over her friend's mother."],
    ["How does the migration begin?", "The geese form a wobbly V, circle until it points south, and fly away behind Longneck."],
    ["Why does Brightbill sleep fitfully before leaving?", "Excitement, fear, and sadness about the long journey and separation keep troubling him."],
    ["How do Roz and Brightbill say goodbye?", "They share affection and reassurance even though neither wants the separation."],
    ["What evidence shows Brightbill has earned a place in the flock?", "He flies directly behind the leader as the geese organize their formation."],
    ["How has Brightbill grown since hatching?", "The dependent gosling now leaves home as a capable flier on a major journey."],
    ["Why is the migration emotionally important?", "Love allows a child to leave and grow while a parent remains behind watching."]
  ]},
  { n:54, q:[
    ["What does Roz do during the first quiet weeks of winter?", "She powers down inside the Nest in her own form of hibernation."],
    ["What does Roz do after discovering animals frozen outside?", "She gathers firewood, warms the Nest, and calls others to shelter."],
    ["Why does Roz abandon remaining inactive all winter?", "The deadly cold reveals that animals around her need immediate help."],
    ["Why does Roz invite every listening animal?", "Her concern extends beyond friends because any creature left outside may freeze."],
    ["What evidence shows the winter is unusually dangerous?", "Even native animals die and their frozen bodies appear beneath the snow."],
    ["How does Roz's purpose change when she is alone?", "Without Brightbill to care for, she expands her caregiving to the whole winter community."],
    ["What central idea begins in the winter crisis?", "A sense of responsibility can wake someone from isolation and turn shelter into shared survival."]
  ]},
  { n:55, q:[
    ["Who is the first freezing animal to reach the Nest?", "Chitchat is the first lodger to crawl inside."],
    ["What happens as the night continues?", "Hares, birds, Pinktail, Fink, and many other animals crowd together around the fire."],
    ["Why does Roz establish peace inside the lodge?", "Predators and prey cannot share the small shelter unless everyone agrees not to hunt."],
    ["Why does Roz begin thinking about more shelter?", "The Nest becomes completely full, so later arrivals would be left in the cold."],
    ["What evidence shows animals trust Roz with their lives?", "They enter her home, accept her truce, and sleep packed together around her fire."],
    ["How does the Nest's role change?", "A private family home becomes an emergency refuge for many kinds of animals."],
    ["Why are the lodgers significant?", "A community that once fled Roz now survives because of her hospitality and fair rules."]
  ]},
  { n:56, q:[
    ["For which large animal must the second lodge be designed?", "The second lodge must be large enough for Broadfoot the bull moose."],
    ["What happens after the second lodge is completed?", "Roz continues through snow and wind to build a third, fourth, and fifth shelter."],
    ["Why does Roz test the pond ice with a heavy rock?", "She needs a safe shortcut across the pond before carrying materials to the other side."],
    ["Why do animals emerge when Roz lights a fire at the building site?", "The warmth and her reassuring voice offer hope to creatures suffering in the cold."],
    ["What evidence shows Roz refuses to let weather stop the work?", "She powers through deep drifts and fierce winds to finish multiple lodges."],
    ["How does Roz become a community leader?", "She identifies a widespread need, organizes safe places, and keeps working until many groups are protected."],
    ["What do the glowing lodges represent?", "Cooperation and practical compassion create islands of life within the deadly winter."]
  ]},
  { n:57, q:[
    ["Who remains trapped inside the burning lodge?", "A mother hare's baby remains inside."],
    ["What happens after Roz rescues the baby?", "The animals work with her to rebuild a larger and safer lodge."],
    ["Why does the lodge catch fire?", "The lodgers overload the fire pit until flames reach the wooden ceiling."],
    ["Why does Roz enter the burning structure immediately?", "Saving the trapped baby matters more to her than protecting her own body from smoke and flame."],
    ["What evidence shows the animals learn from the disaster?", "They add a taller ceiling, deeper pit, more stone, emergency water, and greater respect for fire."],
    ["How does the community respond differently after the accident?", "Instead of relying entirely on Roz, the animals help rebuild and accept responsibility for safety."],
    ["What central lesson comes from the fire?", "A mistake becomes useful when a community repairs the harm and changes its behavior."]
  ]},
  { n:58, q:[
    ["What question do the animals ask Roz about her design?", "They ask what she is meant to do."],
    ["What answer does Roz reach after hearing their suggestions?", "She considers that she may simply be meant to help others."],
    ["Why can life outside the winter lodges remain dangerous?", "The indoor truce does not erase natural predator-and-prey behavior elsewhere."],
    ["Why do the animals disagree when Roz says she has no purpose?", "They have personally seen her build, garden, parent, rescue, and protect."],
    ["What evidence shows Roz misses Brightbill?", "She says she thinks about him all the time while the lodgers imagine his journey."],
    ["How does Roz's understanding of purpose develop?", "She moves from waiting for an assigned task to recognizing a purpose created through her choices."],
    ["What central idea do the conversations express?", "Purpose does not always arrive as programming; it can grow from the good someone repeatedly chooses to do."]
  ]},
  { n:59, q:[
    ["What returns as winter's snow and ice melt?", "Buds, flowers, animals, scents, and colors return across the island."],
    ["What do the surviving animals do when spring arrives?", "Lodgers return home, hibernators emerge, and Roz visits friends before tending her garden."],
    ["Why is the spring quieter than usual?", "The bitter winter killed many insects, birds, rodents, and other animals."],
    ["How does death contribute to the spring bloom?", "The bodies return nutrients to the soil and support unusually bright new growth."],
    ["What evidence keeps the chapter from pretending nature is only beautiful?", "The melting snow reveals corpses even as flowers rise around them."],
    ["How has Roz's place in spring life changed?", "She moves through the island checking on friends and caring for a garden rooted in community."],
    ["What theme is shown by the return of spring?", "Nature holds loss and renewal together, with new life growing from what has ended."]
  ]},
  { n:60, q:[
    ["Who is gripping Paddler's tail in the pond?", "Rockmouth the pike is hanging from the young beaver's tail."],
    ["What does Roz do after hearing Rockmouth's explanation?", "She carries him in water across the island and releases him into the river."],
    ["Why does Rockmouth attack Paddler?", "Conditions in the pond have left the hungry old fish desperate for food."],
    ["Why does Roz refuse Mrs. Beaver's demand to feed him to vultures?", "She will not kill Rockmouth and instead looks for a solution to the conflict."],
    ["What evidence shows Roz helps both sides?", "She frees Paddler from danger while also relocating Rockmouth to water where he can survive."],
    ["How has Roz's problem-solving matured?", "She now seeks an outcome that protects a victim without treating the desperate attacker as disposable."],
    ["Why is the fish rescue important?", "Compassion can address the cause of harmful behavior while still stopping the harm."]
  ]},
  { n:61, q:[
    ["What kinds of helpful stories spread about Roz?", "Animals tell of her growing gardens, healing the sick, making tools, and helping Rockmouth."],
    ["What does Roz do as the stories of her wildness grow?", "She joins animals in barking, singing, hissing, romping, sunbathing, and leaping."],
    ["Why does Roz act increasingly wild?", "She notices that animals like and understand her more when she shares their behaviors."],
    ["How does Roz connect with different species?", "She participates in each species' familiar sounds and activities rather than expecting them to act like robots."],
    ["What evidence shows Roz is fully known across the island?", "Many separate stories about her skills and behavior travel through both river and land communities."],
    ["How has Roz changed from the spotless machine that frightened everyone?", "She now happily behaves like the wild neighbors whose trust she earned."],
    ["What is the significance of the robot stories?", "A reputation once built from fear is rebuilt through helpful actions and shared life."]
  ]},
  { n:62, q:[
    ["Who leads the returning flock?", "Brightbill leads the geese in a fast, perfect V."],
    ["What does Brightbill do after the flock lands?", "He leaves the group, swims to the Nest, and flutters onto Roz's shoulder."],
    ["Why do the sounds over the pond grow steadily louder?", "The long-absent geese are approaching the island in flight."],
    ["How do Roz and Brightbill greet each other?", "Their simple words and immediate closeness show the comfort of a family reunion."],
    ["What evidence shows Brightbill became a strong leader?", "The unusually fast flock flies in a precise formation with the small goose at its head."],
    ["How has Brightbill changed while away?", "He returns not merely as a flock member but as the graceful leader others follow."],
    ["Why is the return important?", "The family's months of separation end with proof that Brightbill has grown and still chooses home with Roz."]
  ]},
  { n:63, q:[
    ["Where does the flock first rest after crossing open ocean?", "The geese rest and eat dune grass on small islands."],
    ["What does Brightbill do after returning to the Nest?", "He sits by the fire and tells Roz the full story of the migration and winter."],
    ["Why do some weaker geese die during the journey?", "Unexpected early snow and the exhausting migration overwhelm them."],
    ["How does Longneck affect Brightbill's journey?", "The experienced leader guides the flock until a human kills him, leaving others to continue without him."],
    ["What evidence shows Brightbill encountered the human world?", "He describes farms, cities, factories, people, and hundreds of robots beyond the island."],
    ["How does Brightbill develop through the migration?", "He survives loss and danger, learns about the wider world, and helps lead the flock home."],
    ["Why is the journey significant?", "Brightbill returns with knowledge about Roz's possible origins and the dangers connecting their island to humanity."]
  ]},
  { n:64, q:[
    ["What does Roz tell Brightbill about her winter?", "She tells of hibernation, deadly storms, rescue lodges, a fire, and new friendships."],
    ["What realization does Brightbill reach after comparing Roz with other robots?", "He realizes that his mother is unlike every robot he saw and is truly special."],
    ["Why had Roz feared Brightbill's absence?", "She once believed he might be the only animal who would ever care about her."],
    ["How do their separate stories strengthen their relationship?", "Each listens to the other's hardships and understands how much both changed while apart."],
    ["What evidence makes Roz unique among robots?", "She speaks animal languages, saves island creatures, adopts a gosling, and behaves with wild gestures."],
    ["How has Roz's sense of belonging changed?", "She now knows she can create friendships herself and is accepted beyond her bond with Brightbill."],
    ["What does being a special robot mean here?", "Roz's ability to learn from relationships has made her far more than an ordinary machine."]
  ]},
  { n:65, q:[
    ["What new truce does Roz propose?", "She proposes a Party Truce for a celebration at dusk."],
    ["What does Roz promise after Mr. Beaver warns that the night will be moonless?", "She promises that the celebration will not be dark."],
    ["Why does Roz want the island to celebrate?", "The community survived a terrible winter, welcomed new young, and saw Brightbill's flock return."],
    ["Why do the animals listen to Roz's announcement?", "They now regard her as a trusted friend whose plans serve the community."],
    ["What evidence shows Roz has planned beyond merely inviting everyone?", "She promises to handle everything and hints at a very large surprise."],
    ["How has Roz's role at the Dawn Truce changed?", "The former feared intruder now speaks first and organizes an event for the entire island."],
    ["Why is the invitation significant?", "Roz uses her leadership to create joy and peaceful connection, not only emergency survival."]
  ]},
  { n:66, q:[
    ["What is the giant tower of wood used for?", "Roz lights it as a huge bonfire for the island celebration."],
    ["What happens while the animals party through the night?", "A cargo ship passes, sees the bonfire and Roz, and quietly continues onward."],
    ["Why does Roz describe the animals as friends and family?", "Their relationships taught her how to live rather than merely function."],
    ["Why does Roz wear mud and wildflowers?", "Her old camouflage has become a proud party dress instead of a way to hide."],
    ["What evidence shows the whole island accepts Roz?", "Animals of many species gather, listen, sing, laugh, and dance at the party she created."],
    ["How has the meaning of wildness changed for Roz?", "Wildness now expresses joyful belonging rather than only a survival technique."],
    ["Why does the celebration also create danger?", "Its brilliant fire reveals Roz's location to the outside human world."]
  ]},
  { n:67, q:[
    ["Where do Roz and Brightbill watch the sunrise?", "They watch from the craggy mountain peak."],
    ["What does Brightbill notice after they share their happiness?", "He sees an airship approaching from the south."],
    ["Why does Roz remember her first visit to the peak?", "The same place once represented loneliness, but now it lets her measure how completely her life changed."],
    ["How do Roz and Brightbill feel in the quiet morning?", "They both say they are happy and enjoy the wind, sun, and each other's company."],
    ["What evidence shows Roz no longer feels alone?", "She looks over an island filled with family and friends and explicitly says her old belief was wrong."],
    ["How has the mountain's meaning developed?", "It changes from a lookout over an unknown island into a favorite place shared with her son."],
    ["Why is the final buzzing sound important?", "It interrupts a moment of fulfillment and signals that the outside world has found Roz."]
  ]},
  { n:68, q:[
    ["What are the three arriving robots called?", "They are RECO 1, RECO 2, and RECO 3."],
    ["What do the RECOs do after circling the island?", "They land near the mountain, step into the meadow, and face Roz at the forest edge."],
    ["Why do the RECOs inspect the shore and island from above?", "They are searching for evidence of the missing ROZZUM units."],
    ["How does Roz's appearance contrast with the RECOs?", "They are identical, bulky, and shiny, while she is dirty, flower-covered, damaged, and fitted with wood."],
    ["What evidence shows the airship's arrival disturbs the island?", "Its engines bend trees, tear grass, and drive landing gear into the soil."],
    ["How does Roz present herself to the strangers?", "She calmly steps from hiding and gives the same friendly introduction she once gave the animals."],
    ["What does the contrast among the robots reveal?", "Life on the island has made Roz visibly individual in a way the factory robots are not."]
  ]},
  { n:69, q:[
    ["Why have the RECOs come to the island?", "They were sent to retrieve the final five ROZZUM units lost in the shipwreck."],
    ["What happens when Roz refuses to leave without answers?", "The RECOs label her defective and move to take her until Brightbill's flock attacks."],
    ["Why do the RECOs call Roz defective?", "Her questions, independence, damage, and wild behavior do not match their expectations for her model."],
    ["Why does Roz resist their order?", "The island is her home, and she will not abandon her son and community without understanding why."],
    ["What evidence shows the RECOs value obedience over understanding?", "They repeatedly command Roz not to ask questions and expect immediate compliance."],
    ["How does Roz differ from the newly arrived robots?", "She thinks independently and protects chosen relationships rather than following a mission without question."],
    ["Why is being called defective important?", "What the Makers consider a malfunction is actually the learning and love that made Roz fully herself."]
  ]},
  { n:70, q:[
    ["What does Brightbill search for on the RECOs?", "He searches for shutdown buttons like the one on Roz's head."],
    ["What do the RECOs carry when they return from the airship?", "Each robot returns holding a silver rifle."],
    ["Why does Brightbill's shutdown plan fail?", "The retrieval robots have smooth bodies and were designed without easily reached buttons."],
    ["Why does the flock attack before Roz runs?", "The geese risk themselves to distract the stronger robots and give her time to escape."],
    ["What evidence shows the RECOs are built for force?", "They swat away geese, fling Loudwing, resist shutdown, and arm themselves with rifles."],
    ["How does Brightbill use earlier experience in a new crisis?", "He remembers turning Roz off and tries to apply that knowledge to her hunters."],
    ["Why does the hunt's beginning raise the danger?", "A retrieval mission becomes an armed search across the island after peaceful control fails."]
  ]},
  { n:71, q:[
    ["Who directs the forest animals from above?", "Swooper the owl calls out the aerial parts of the coordinated assault."],
    ["How is RECO 3 finally destroyed?", "The animals lure him into mud, and Broadfoot crushes and kicks off his head."],
    ["Why do animals dart before the robot's eyes and legs?", "Their coordinated distractions draw him deeper into a trap while making it hard to aim and walk."],
    ["Why does Chitchat attack a machine much larger than she is?", "She refuses to let an intruder take her friend's mother away."],
    ["What evidence shows the assault requires many species?", "Birds block vision, quick animals confuse his steps, Chitchat attacks, and Broadfoot delivers the final blows."],
    ["How has the island community changed since Roz arrived?", "Animals that once hid separately now organize together to defend her as one of their own."],
    ["What central idea does the forest assault show?", "Cooperation allows many small and different strengths to defeat a much stronger threat."]
  ]},
  { n:72, q:[
    ["Which animals ambush RECO 2 in the cave?", "Mother Bear, Nettle, and Thorn ambush him."],
    ["What happens after the rifle damages the cave?", "Rock collapses, the bears escape with injuries, and the RECO falls shattered below the waterfall."],
    ["Why does RECO 2 enter the cave?", "He senses movement and believes Roz may be hiding inside."],
    ["Why does the bear family fight for Roz?", "Her earlier mercy and rescue of Thorn transformed them from enemies into loyal friends."],
    ["What evidence shows the victory is costly?", "Nettle and Thorn are bruised and bleeding, and Mother Bear is hurt even more badly."],
    ["How have Nettle and Thorn developed since their first attack?", "They now risk themselves beside their mother to protect the robot they once hated."],
    ["Why is the mountain battle significant?", "A relationship changed by kindness becomes powerful enough to defend the entire community."]
  ]},
  { n:73, q:[
    ["Where does RECO 1 finally locate Roz's electronic signal?", "He traces the signal to the robot gravesite and a clump of seaweed."],
    ["What happens when he looks away from the seaweed disguise?", "The camouflaged Roz reaches up and grabs his rifle."],
    ["Why must RECO 1 continue alone?", "He loses communication with the other two RECOs and realizes they have been destroyed."],
    ["Why can the hunter follow Roz despite animal distractions?", "His equipment detects her electronic signal even when camouflage hides her from sight."],
    ["What evidence shows RECO 1 does not understand island life?", "He cannot make sense of the bonfire, lodges, tracks, or animals protecting an escaped robot."],
    ["How does Roz combine old and new survival skills?", "She uses the camouflage learned from animals while confronting a weapon from her mechanical world."],
    ["Why does the chapter end with Roz seizing the rifle?", "After fleeing and hiding, she must directly challenge the last threat to protect her home."]
  ]},
  { n:74, q:[
    ["What happens when Roz and RECO 1 pull against the rifle?", "The rifle explodes and blasts both robots apart."],
    ["What does RECO 1 do after surviving the explosion?", "He rises, approaches the helpless Roz, and presses her shutdown button."],
    ["Why is Roz unable to escape after the blast?", "All of her arms and legs have been blown away, leaving only her torso and head."],
    ["Why does Roz keep holding the weapon despite the stronger robot?", "Disarming the hunter is her only chance to stop him from taking her and threatening the island."],
    ["What evidence shows RECO 1 was designed for combat while Roz was not?", "He remains able to move after the explosion, while her survival system warns that she cannot endure more damage."],
    ["How does the struggle leave Roz changed?", "The once mobile wild robot becomes completely dependent and can use only her voice."],
    ["Why is the final click significant?", "The same button once explored safely within her family is now used by an enemy to silence her."]
  ]},
  { n:75, q:[
    ["Who switches Roz back on?", "Brightbill slips into the pile of parts and presses her button."],
    ["How is RECO 1 finally stopped?", "Geese and otters fire a recovered rifle, melting a hole through his torso."],
    ["Why does Brightbill approach despite the flock's warning?", "He cannot leave his mother deactivated and is determined to bring her back."],
    ["Why does Roz beg RECO 1 to spare Brightbill?", "Her first concern after rebooting is her son's life rather than her own ruined body."],
    ["What evidence shows the animals have learned from the battle?", "They recover the weapon, remember how its trigger works, and coordinate well enough to aim it."],
    ["How does Brightbill return the care Roz once gave him?", "The son she saved from an egg risks himself to restore her life."],
    ["Why is RECO 1's final warning important?", "It reveals that more hunters will keep coming unless Roz seeks repairs and removes the reason for retrieval."]
  ]},
  { n:76, q:[
    ["What do the animals try to attach to Roz?", "They press recovered robot arms and legs against her damaged torso."],
    ["What does Roz ask after the repair attempts fail?", "She asks the animals to help carry her home."],
    ["Why do none of the limbs reconnect?", "The explosion damaged Roz's body too severely for the parts to snap back into place."],
    ["Why does Roz joke and speak calmly?", "She wants to ease Brightbill's and her friends' fear even while understanding the seriousness herself."],
    ["What evidence shows the animals cannot hide their feelings?", "They try to smile but remain visibly sad as they look at their mangled friend."],
    ["How does Roz face her broken condition?", "She acknowledges what the island cannot repair and asks directly for the help she now needs."],
    ["What central idea does the broken robot convey?", "Strength includes accepting dependence when damage cannot be solved alone."]
  ]},
  { n:77, q:[
    ["Whom does Roz ask Brightbill to gather?", "She asks him to call a meeting of their closest and wisest friends."],
    ["What decision does the group finally accept?", "Roz must return to the Makers in the airship for a chance to be repaired."],
    ["Why can the island animals not simply keep Roz home?", "They cannot repair her body, and endless new RECOs would endanger everyone."],
    ["Why is Roz willing to trust the airship despite uncertainty?", "It offers her only chance to regain her body and eventually live wild with her family again."],
    ["What evidence shows the decision is carefully considered?", "Roz hears objections, explains the risks on both sides, and seeks advice from many trusted friends."],
    ["How does Roz act as a leader while helpless?", "She makes a difficult plan based on the long-term good of both herself and the island."],
    ["Why is the meeting important?", "Love sometimes requires choosing a risky separation instead of a comforting path that cannot last."]
  ]},
  { n:78, q:[
    ["What must the animals load into the airship?", "They load every robot part, rifle, and tiny piece from across the island."],
    ["What happens after Roz and Brightbill exchange their final words?", "Brightbill returns to his flock and the airship door closes."],
    ["Why does Roz insist that absolutely everything mechanical be removed?", "Clearing the island may prevent the Makers from sending RECOs back for missing parts."],
    ["Why does Roz promise to return?", "Brightbill is her son and the island remains the home and community she chose."],
    ["What evidence shows the whole island cares about Roz?", "Every kind of animal gathers in the mist to work, watch, and say farewell."],
    ["How has Roz changed from her arrival on the same shore?", "She leaves surrounded by loved ones and with a purpose, unlike the unknown machine that arrived alone."],
    ["What does the farewell show about belonging?", "Home is not merely where Roz remains physically; it is the community she intends to find again."]
  ]},
  { n:79, q:[
    ["What powers on before the airship rises?", "The airship's engines automatically fire up."],
    ["What route does the airship take?", "It rises above the island, turns south, and disappears into the clouds."],
    ["Why does the airship depart with Roz?", "Her decision to seek repairs has been carried out and the farewell is complete."],
    ["How is Roz separated from the animals?", "The closed ship carries her into the sky while her family and friends remain on the island."],
    ["What detail proves the departure is final for this moment?", "The airship vanishes from sight inside the clouds."],
    ["How does Roz's situation change in a single movement?", "She goes from being physically present at home to traveling beyond it with no control over the ship."],
    ["Why is this very short chapter significant?", "Its simple departure turns the planned sacrifice into an irreversible journey away from home."]
  ]},
  { n:80, q:[
    ["What does Roz remember while traveling through the sky?", "She remembers her arrival, the island, Brightbill, and the wild life recorded in her computer brain."],
    ["What plan does Roz begin computing by the ending?", "She will get repaired, escape her new life, and find her way back home."],
    ["Why does Roz believe she must continue living?", "She wants to return to the son, friends, and island that gave her life meaning."],
    ["How does Roz interpret the possibility that she is defective?", "She considers that learning and changing extraordinarily well may explain what others call a glitch."],
    ["What evidence shows Roz's past remains present to her?", "Her earliest sights, sounds, smells, and every later moment remain clearly stored in memory."],
    ["How has Roz changed across the story?", "A task-driven machine has become an independent, loving, hopeful wild robot with a chosen home."],
    ["What final idea closes the book?", "Identity is built through learning, love, and determined choices, and Roz's story is not finished."]
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
  const meta = WILD_ROBOT_1_META.chapters[chapter.n - 1];
  const positions = patternFor(chapter.n);
  const answers = chapter.q.map((item) => item[1]);
  const id = `wild-robot-1-chapter-${chapter.n}`;
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

export const WILD_ROBOT_1_TESTS = Object.fromEntries(
  chapters.map((chapter) => {
    const test = createTest(chapter);
    return [test.id, test];
  })
);
