import { WILD_ROBOT_3_META } from "./books/wild-robot-3/meta.js?v=1";

const BOOK_ID = "wild-robot-3";
const BOOK_TITLE = "The Wild Robot Protects";
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
    ["Who leads the geese home from their wintering grounds?", "Brightbill leads the flock north in a V formation."],
    ["What happens after the flock reaches its home island?", "The geese land at the pond, and Brightbill enters the forest to find Roz."],
    ["Why do the geese rest on several islands during the ocean crossing?", "They need dune grass for food and time to recover their strength."],
    ["Why is Brightbill happy when a robot bursts from the ground?", "He recognizes Roz as the mother he has missed all winter."],
    ["What evidence shows Brightbill is an alert leader?", "He watches constantly for bad weather and airships while guiding the flock."],
    ["How has Brightbill changed since learning to fly?", "He now leads an entire flock across long migrations and returns confidently to his family."],
    ["Why does the opening journey matter?", "It reconnects Brightbill's wider traveling life with the island and mother he still calls home."]
  ]},
  { n:2, q:[
    ["What important news does Chitchat share?", "Chitchat has become the mother of three young kits."],
    ["What happens after nearby animals gather around Brightbill?", "Gale flies inland crying for Roz to help with an emergency."],
    ["Why do the animals realize Gale's arrival is serious?", "Seagulls rarely travel so far inland, and she is frantic and calling for help."],
    ["Why do more animals approach the reunion?", "Chitchat's excited voice draws friends who also want to welcome Brightbill home."],
    ["What evidence shows Brightbill is important to the community?", "Foxes, beavers, an owl, and many other animals eagerly gather to greet him."],
    ["How does the mood change during the reunion?", "Warm celebration quickly becomes concern when Gale's warning interrupts everyone."],
    ["Why is the interruption significant?", "Brightbill's return begins not with rest but with a crisis that will involve the whole island."]
  ]},
  { n:3, q:[
    ["What injuries does Roz observe on the seal?", "His nose is bleeding and his eyes are swollen shut."],
    ["What does Roz do after the seal asks to feel the ocean?", "She carries him across the rocks and gently places him in the shallows."],
    ["Why did the seal swim for days toward the island?", "Shimmering poisoned water burned him and separated him from his family."],
    ["Why do the gathered animals remain unable to save him?", "They do not understand the poison tide or have a treatment for his severe injuries."],
    ["What evidence shows the poison affects living tissue immediately?", "The seal says it burned mouths, noses, and eyes as soon as his group approached."],
    ["How does Roz respond to a problem she cannot solve?", "She listens, examines the seal, and honors his final request with gentle care."],
    ["Why is the seal's warning important?", "His suffering turns a mysterious distant danger into an urgent threat heading toward the island."]
  ]},
  { n:4, q:[
    ["Where do the island animals hold the Dawn Truce?", "They meet safely in the Great Meadow."],
    ["What happens after Gale announces that the tide is coming?", "The animals argue until Roz calms them and says the enormous ocean makes danger unlikely."],
    ["Why does Swooper say land animals should care about the ocean?", "Land, water, and air are connected, so harm in one can affect the others."],
    ["Why does Roz reassure the crowd?", "She uses her knowledge of the ocean's size to prevent panic and believes the island is too remote to be reached."],
    ["What evidence shows the animals do not fully trust that reassurance?", "Nettle and Thorn demand certainty rather than being told that Roz only thinks they are safe."],
    ["How does Roz act as a leader in the argument?", "She silences the noise and gives a reasoned judgment, even though her conclusion may be wrong."],
    ["What central problem appears in the discussion?", "Communities must act under uncertainty when a serious threat is known but not yet understood."]
  ]},
  { n:5, q:[
    ["What name is used for Brightbill's new mate?", "Glimmerwing is usually called Glimmer."],
    ["What does Brightbill explain before introducing her?", "He tells Roz about the loss of Glimmer's parents and how friendship grew into a partnership."],
    ["Why did Brightbill first begin spending time with Glimmer?", "He checked on her after coyotes killed her parents and found that they enjoyed each other's company."],
    ["Why does he bring Roz to the grassy ridge?", "The meaningful private place gives him room to share important family news."],
    ["What evidence shows the news carries grief and hope together?", "The same tragedy that left Glimmer without parents also led Brightbill and Glimmer to become inseparable."],
    ["How does Roz respond to her son's growing independence?", "She expresses sympathy, happiness, and an eager wish to know Glimmer personally."],
    ["Why does the conversation matter?", "It shows family continuing to grow even while its newest bond began through loss."]
  ]},
  { n:6, q:[
    ["What does Roz call her forest home?", "Roz calls the dome-shaped home the Nest."],
    ["What happens after Roz offers Brightbill and Glimmer her home?", "They politely explain that they want their own nest and want to build it themselves."],
    ["Why do the geese decline Roz's nest-building gift?", "Building together in their own way is part of beginning their life as mates."],
    ["Why does Roz prepare everything before their visit?", "She is excited about the new family relationship and wants Glimmer to feel welcome."],
    ["What evidence suggests Roz may feel hurt despite her words?", "Brightbill repeatedly checks whether she is upset while Roz insists too strongly that the choice is completely fine."],
    ["How does Roz support Brightbill's independence?", "She accepts the couple's boundaries and promises to help only when they ask."],
    ["What does the chapter show about caring for grown children?", "Love sometimes means stepping back so a new family can build its own home and traditions."]
  ]},
  { n:7, q:[
    ["Which passing flock confirms when the poison tide will arrive?", "A flock of ducks says it will reach the island the next day."],
    ["What does Roz order after hearing the report?", "She calls for an immediate evacuation of coastal animals."],
    ["Why do visiting birds keep flying instead of resting?", "They are fleeing the poisonous flow spreading south through the ocean."],
    ["Why do the island animals become angry with Roz?", "She had confidently told them the tide would not reach their shores."],
    ["What evidence shows the Ancient Shark may offer hope but not an easy plan?", "Birds call her wise and powerful, but nobody knows exactly where in the north she lives."],
    ["How does Roz respond to being proven wrong?", "She apologizes directly and changes from reassurance to urgent protective action."],
    ["Why is the evacuation the most important immediate choice?", "Finding the tide's cause can wait, but creatures already living near the coast may die without quick help."]
  ]},
  { n:8, q:[
    ["Which creatures leave their lifelong reef homes?", "Fish abandon the reefs and swim into open water."],
    ["What happens after night falls?", "Roz keeps wading through the shallows with her headlights, warning creatures after others must rest."],
    ["Why does the evacuation require many different messengers?", "Coastal animals live in the air, on shore, in waves, and underwater, so each group reaches different neighbors."],
    ["Why can Roz continue when the animals stop?", "Her robotic body does not need the same sleep and physical recovery."],
    ["What evidence shows the island community works together?", "Geese, otters, crabs, fish, land animals, and Roz all carry warnings or help residents move."],
    ["How does Roz act after her mistaken prediction?", "She takes the longest shift and personally searches for anyone who might still be in danger."],
    ["What is the chapter's central idea?", "A coordinated community can move quickly when different members use their abilities for a shared rescue."]
  ]},
  { n:9, q:[
    ["Who first spots the shimmering water from above?", "A vulture sees the poison tide while soaring over the mountain."],
    ["What happens just before the tide surrounds the island?", "Roz rescues a frightened otter pup from a rock and reunites him with his parents."],
    ["Why does Roz remain in the shallows despite her warning instincts?", "Small slow-moving creatures still need to be removed before the poisoned wave arrives."],
    ["Why does she risk herself for the otter pup?", "Protecting a helpless child matters more to her than immediately obeying her own survival alarm."],
    ["What evidence shows animals detect environmental danger early?", "They notice the subtle shimmer like an underwater storm before a human observer likely would."],
    ["How does Roz repeat a defining part of her character?", "She again chooses a child's safety over her own, using all her speed and strength to save him."],
    ["Why does the rescue not create a happy ending?", "One family is safe, but the tide now encircles the entire island and threatens every habitat."]
  ]},
  { n:10, q:[
    ["What ocean plant begins washing ashore dead?", "Dead kelp from the underwater forests washes onto the coast."],
    ["What happens after sea spray carries poison inland?", "Plants die, animals crowd inward, food webs change, conflicts grow, and the Dawn Truce collapses."],
    ["Why does the insect population explode?", "Many insect-eating birds abandon the island, removing an important predator."],
    ["Why do land animals begin fighting one another?", "More species are forced into less space with too little food, water, shelter, and territory."],
    ["What evidence shows one ecological change spreads through many species?", "Fish loss changes bear diets, which increases competition for food used by deer, hares, and squirrels."],
    ["How does the island community change under pressure?", "A once-balanced system and trusted truce give way to displacement, competition, and anger."],
    ["Why does the chapter matter to the larger story?", "It demonstrates that the poison tide threatens relationships and the whole ecosystem, not only creatures touching seawater."]
  ]},
  { n:11, q:[
    ["What shape does the poison tide have across the ocean?", "It moves like a huge winding river that widens, sinks, and resurfaces."],
    ["What do Brightbill and Glimmer do after Roz suggests close study?", "They fly north above the tide for four days and return with observations and news."],
    ["Why does Brightbill object to Roz entering the poisoned shallows?", "Her leadership is essential to the island, so risking her body could endanger everyone."],
    ["Why are the geese better suited to investigate?", "They can follow the flow from safely above without touching poisoned water."],
    ["What evidence suggests the cause remains difficult to locate?", "The flow eventually vanishes into deep water, and witnesses offer several possible explanations but no source."],
    ["How do Brightbill and Glimmer contribute as a team?", "They protect Roz from unnecessary risk and return together with detailed evidence from beyond the island."],
    ["Why does the Ancient Shark become more important?", "Ordinary observation cannot find the source, while many northern birds independently say the shark alone may help."]
  ]},
  { n:12, q:[
    ["Who stops the leaders from quarreling?", "Loudwing silences them with a powerful honk and reminds them they share the same goal."],
    ["What happens after Roz explains her water plan?", "Animals dam streams, dredge ponds, dig pits, and redirect rainwater into new storage basins."],
    ["Why must fresh water be kept from reaching the ocean?", "The tide makes ocean water unusable while the crowded island is consuming its limited drinking supply."],
    ["Why does Roz call animals from many species?", "Different bodies are suited to building, digging, hauling, dredging, and organizing the large project."],
    ["What evidence shows the plan improves conditions without fully solving them?", "Storms fill dozens of deeper ponds, but summer evaporation will keep the supply at risk."],
    ["How does Roz lead animals who no longer trust one another?", "She focuses them on the shared need for survival and assigns concrete work each group can perform."],
    ["What is the larger lesson of the project?", "Cooperation can build resilience during a crisis even when it cannot remove the crisis itself."]
  ]},
  { n:13, q:[
    ["What starts the wildfire?", "Lightning strikes a tree and ignites the dry coastal underbrush."],
    ["What happens after Roz breaks a new dam?", "Released pond water reaches the flames but fails to stop the growing fire."],
    ["Why does the blaze spread so quickly?", "The poison tide has turned coastal plants into dead, dry fuel while rain has not yet arrived."],
    ["Why does Roz send everyone to the Great Meadow?", "The crowd needs a safer central place away from the burning edge of the island."],
    ["What evidence shows nature both causes and limits the disaster?", "Lightning begins the fire, but later drizzle slowly weakens it."],
    ["How does Roz react when her first solution fails?", "She continues organizing evacuation rather than freezing or pretending the danger is controlled."],
    ["Why is the fire significant?", "It shows how environmental damage can make a separate natural event far more destructive."]
  ]},
  { n:14, q:[
    ["Who leads the five geese that decide to leave?", "Finefeather leads the small departing group."],
    ["What happens after Brightbill advises the flock to find safety?", "Most geese choose to stay with him, while five separate and fly toward the mainland."],
    ["Why does Brightbill remain on the island?", "Roz and his friends are trapped there, and he believes his duty is to help them."],
    ["Why does Glimmer reject the safer path?", "Her commitment to her mate and Roz matters more than leaving danger behind."],
    ["What evidence shows the decision breaks a long tradition?", "The flock has remained united through generations of difficult journeys until this crisis divides it."],
    ["How does Brightbill respond to members who leave?", "He respects their choice and offers a sincere wish for favorable winds instead of condemning them."],
    ["What difficult idea does the split explore?", "Loyalty may lead reasonable individuals toward different choices when no option can protect everyone."]
  ]},
  { n:15, q:[
    ["Which familiar seabird apologizes before leaving?", "Gale repeatedly apologizes because she cannot remain through the poison tide."],
    ["What happens after Finefeather's group departs?", "Most other birds follow, leaving only Brightbill's flock, Swooper, and a few determined birds."],
    ["Why do some birds depart without saying good-bye?", "Their guilt about abandoning friends makes a direct farewell too painful."],
    ["Why is it difficult to blame the flyaways?", "Flight gives them access to a safer life that trapped animals cannot reach."],
    ["What evidence shows departure carries emotional cost?", "Good-byes are tearful, Gale apologizes repeatedly, and nobody knows whether the birds will return."],
    ["How does the crisis reshape the island community?", "It removes many voices and relationships while revealing the small group determined to stay."],
    ["Why do the flyaways matter?", "Their choice shows that survival and loyalty can conflict even among friends who care about one another."]
  ]},
  { n:16, q:[
    ["Who welcomes the sea otters to live in the beaver pond?", "Mrs. Beaver says the enlarged pond is big enough for both families."],
    ["What happens after Mr. Beaver slaps the water with his tail?", "The noise startles Roz, who loses her balance and sinks into the deep pond."],
    ["Why do the sea otters prefer the beaver pond to the new ponds?", "Its plants, fish, insects, geese, and beavers make it feel like a living home."],
    ["Why does Paddler defend the otters' play?", "He knows they have lost their sea home and is glad to see them enjoying themselves."],
    ["What evidence shows Mr. Beaver is treating shared space as private property?", "He insists that building the pond means it belongs only to him."],
    ["How does Mrs. Beaver respond to her husband's behavior?", "She directly names his stubborn rudeness and chooses generosity toward the displaced otters."],
    ["Why is Roz's plunge significant?", "An argument about adapting to change unexpectedly reveals that Roz's own old limits may also have changed."]
  ]},
  { n:17, q:[
    ["Which animal's movement teaches Roz how to swim?", "A frog kicking away from her shows Roz how to move underwater."],
    ["What happens after Roz reaches the muddy bottom?", "She notices the frog, copies its kick, swims upward, and climbs safely onto the dam."],
    ["Why had Roz continued fearing deep water?", "Her mind remembered the danger to her original body even after being transferred into a stronger one."],
    ["Why are the animals satisfied despite not understanding the transfer?", "Their main concern is that their friend is alive and unharmed."],
    ["What evidence proves the new body is waterproof?", "Roz sinks through deep water, remains fully functional, and swims back without damage."],
    ["How does Roz revise her understanding of herself?", "She separates an old learned fear from the actual abilities of her current body."],
    ["What central idea comes from the discovery?", "Past experience can protect someone, but it can also hide new possibilities when circumstances change."]
  ]},
  { n:18, q:[
    ["Where does Brightbill find Roz at midnight?", "He finds her in the quiet rocky cove where the poison tide first arrived."],
    ["What happens during Roz's secret experiment?", "She lowers herself step by step into the poisoned water, emerges unharmed, and then goes to rinse off."],
    ["Why might Roz survive what harms animals?", "Her new waterproof body is mechanical rather than living tissue affected by the poison."],
    ["Why does Brightbill refuse to let Roz experiment alone?", "He understands the need but wants to watch, support her, and respond if something goes wrong."],
    ["What evidence shows Roz still protects Brightbill after proving herself safe?", "She jumps away from his hug because poisonous dust still coats her body."],
    ["How does Roz act toward fear and uncertainty?", "She tests one foot first, observes carefully, and increases the risk only after detecting no harm."],
    ["Why is the experiment a turning point?", "Roz discovers she can enter the exact environment no animal can survive, giving the island a new kind of hope."]
  ]},
  { n:19, q:[
    ["What is the poison tide made of up close?", "It consists of countless tiny particles that form dust clouds underwater."],
    ["What does Roz decide after practicing in the pond?", "She will travel north alone to find the Ancient Shark and stop the poison tide."],
    ["Why can Roz now attempt the ocean journey?", "She knows both deep water and poisoned water are safe for her new body."],
    ["Why do Glimmer and Roz ask Brightbill to remain?", "The damaged island needs his leadership more than Roz needs another traveler."],
    ["What evidence shows Brightbill's response is emotionally complicated?", "His feelings swing among fear, anger, pride, and reluctant understanding."],
    ["How does Brightbill handle the decision he dislikes?", "He cools himself, admits Roz is the island's only hope, and lets her choose the mission."],
    ["Why does Roz accept a mission that may fail?", "Her unique abilities create a responsibility to try when every living creature is otherwise helpless."]
  ]},
  { n:20, q:[
    ["What new family news does Brightbill share?", "Glimmer has laid her first egg, making Roz a future grandmother."],
    ["What happens after Roz says farewell to Brightbill?", "She looks back at the weakened island, hears the animals' support, and marches into the waves."],
    ["Why does Brightbill advise Roz to stay underwater?", "Boats or airships might spot an unusual robot traveling across the ocean."],
    ["Why does the coming generation make Roz feel stronger?", "Protecting Brightbill's future goslings gives her another loved reason to face danger."],
    ["What evidence shows the island no longer feels like paradise?", "Its animals look frail among dead plants, scorched rocks, and drifting ash."],
    ["How does Roz transform fear before leaving?", "She acknowledges the frightening world but draws courage from family and commits all her power to the mission."],
    ["Why does the good-bye matter?", "Roz leaves both the people she loves and a new life she hopes to meet, making the mission personally urgent."]
  ]},
  { n:21, q:[
    ["How long does it take Roz to reach clear water?", "She enters clear water about half a day after leaving the island."],
    ["What happens as Roz continues beyond the lifeless seabed?", "Sand, seagrass, sponges, coral, crabs, snails, fish, and underwater sounds gradually return."],
    ["Why is the clear water still unhealthy at first?", "The poison tide has already passed and left toxic dust with no living community behind."],
    ["Why does Roz reconsider Crag's old story?", "The long shallow seabed suggests land once connected the island before ocean flooding."],
    ["What evidence marks the return of a healthy ecosystem?", "Many kinds of plants and animals appear together and fill the water with movement and sound."],
    ["How does the lively sea affect Roz?", "After marching through devastation, she feels relief and renewed attention to the natural world."],
    ["Why is the contrast important?", "It shows both what the tide destroys and what Roz is trying to preserve for every ocean habitat."]
  ]},
  { n:22, q:[
    ["What tragedy does the sea turtle describe?", "Poison water destroyed thousands of turtle eggs even though the adult turtles escaped."],
    ["What happens after Roz explains her mission?", "The turtle softens, apologizes, accepts hope, and leaves to tell others about her."],
    ["Why does the turtle initially snap at Roz?", "Grief and danger make her apparent immunity and calm journey seem unfair."],
    ["Why does Roz promise to keep trying after hearing the loss?", "The destroyed future generation makes the cost of failure even more real."],
    ["What evidence shows hope itself has practical value?", "The turtle immediately plans to share Roz's effort with others fighting to survive."],
    ["How does the turtle's view of Roz change?", "He moves from resentment to respect once he understands that she is risking herself for everyone."],
    ["Why is the brief encounter significant?", "Roz's mission cannot restore the lost eggs, but it gives a suffering community reason not to surrender."]
  ]},
  { n:23, q:[
    ["When do the sea creatures make their vertical migration?", "They rise from the deep at night and descend again before daylight."],
    ["What does Roz observe after switching on her headlights?", "Millions of creatures rise from the abyss, move through starlight, and return before sunrise."],
    ["Why does this migration help ocean health?", "The animals' movement churns water and distributes nutrients through the depths."],
    ["Why can Roz witness the migration closely?", "Her underwater journey places her beside the deep edge during its nightly movement."],
    ["What evidence shows the migration includes great variety?", "Microscopic life rises alongside fish, squid, and unusual jellylike animals."],
    ["How does Roz's first ocean night differ from the island crisis?", "Instead of only seeing death, she is able to notice and learn from a vast hidden natural process."],
    ["Why does the chapter matter?", "It reminds readers that the threatened ocean contains essential life and wonders usually invisible from the surface."]
  ]},
  { n:24, q:[
    ["What captures the school of fish?", "A large net lowered from a fishing boat sweeps up most of the school."],
    ["What happens after Roz hears the approaching engine?", "She hides, tries to warn the fish, and watches the net haul them above the surface."],
    ["Why do the fish fail to hear Roz's warning?", "The boat's loud engine drowns out her voice."],
    ["Why does Roz hide instead of confronting the boat?", "Being seen by humans could interrupt her mission and reveal a robot traveling freely."],
    ["What evidence shows the capture changes the ecosystem instantly?", "A vast glittering school becomes only a few scattered survivors within minutes."],
    ["How does Roz experience another limit to her power?", "She recognizes danger and speaks, but noise and machinery prevent her from protecting the animals."],
    ["Why is the fishing scene important?", "It shows ocean creatures face serious human-made dangers in addition to the poison tide."]
  ]},
  { n:25, q:[
    ["Which animals repeat the sad song across the ocean?", "Whales in many distant places sing the same warning."],
    ["What happens as Roz keeps marching?", "The song moves among faraway voices while she listens without seeing its singers."],
    ["Why can the whales communicate across great distances?", "Sound travels especially fast and far through water."],
    ["Why are the whales leaving their homes?", "The southward-moving poison tide makes migration their only way to survive."],
    ["What evidence shows the danger spans many seas?", "Whales from different directions share one song about homes from warm water to frozen oceans."],
    ["How does Roz's mission connect with the singers?", "She moves toward the source while entire whale communities are forced away from it."],
    ["What does the song add to the story?", "It turns ecological disaster into shared memory and warning carried through the ocean by its inhabitants."]
  ]},
  { n:26, q:[
    ["How does Roz recognize the object as a road?", "Painted yellow lines show that the hard path is not a natural lava flow."],
    ["What does Roz find after the road slopes underwater again?", "She passes mailboxes, a car, fences, and finally approaches a completely submerged town."],
    ["Why are former hills now small islands?", "Rising ocean water flooded the lowlands that once connected them."],
    ["Why does the road make Roz remember Hilltop Farm?", "The drowned human landscape recalls the family and fields where children once helped her escape."],
    ["What evidence shows civilization has been underwater for a long time?", "Barnacles coat mailboxes, seaweed covers a car, and urchins live on old fencing."],
    ["How does Roz interpret the ruins?", "She uses them to imagine past communities and to connect environmental change with her own history."],
    ["Why is the underwater road significant?", "A route built for an earlier world now guides Roz through evidence that the world itself has changed."]
  ]},
  { n:27, q:[
    ["What object does Scoot use instead of a shell?", "The hermit crab carries a rusty soup can on his back."],
    ["What happens after Zap shocks Roz?", "Roz recovers, meets Scoot and Ripple, explains her mission, and receives directions toward the far north."],
    ["Why did humans abandon the town?", "Repeated flooding defeated their barriers until the rising ocean submerged the streets and buildings."],
    ["Why is Zap so aggressive at first?", "She is protecting the grocery store home and mistakes Roz for a dangerous sea monster."],
    ["What evidence helps Roz feel connected to nature?", "Ripple and many other species show that bodies and sex do not always fit one simple pattern."],
    ["How does Roz respond to creatures who call her different?", "She learns about their differences without shame and recognizes that her own identity also belongs in nature."],
    ["What central idea links the meeting to the mission?", "Understanding difference builds community, while distant problems become urgent once their effects and witnesses arrive."]
  ]},
  { n:28, q:[
    ["What man-made material does Roz see floating everywhere?", "Small pieces of plastic are scattered throughout the water."],
    ["What range of activity does Roz observe?", "She sees currents, animals, ships, wrecks, cargo, mountains, coral, and movement in the deep."],
    ["Why do corals grow on shipwrecks?", "The sunken structures provide hard surfaces within the underwater habitat."],
    ["Why does Roz keep observing during a dangerous mission?", "Learning how the ocean works may help her understand the threat and find its source."],
    ["What evidence shows surface and deep ocean are connected?", "Ships and seabirds above appear alongside fallen cargo and mysterious creatures below."],
    ["How is Roz different from a machine merely crossing the seabed?", "She notices relationships, beauty, damage, and mysteries rather than only calculating a route."],
    ["Why is the list-like chapter significant?", "Its many details reveal the ocean as a complicated world shaped by nature and human activity together."]
  ]},
  { n:29, q:[
    ["What living things survive across the dead island?", "Certain mushrooms remain and improve the soil around them."],
    ["What happens after a wave throws Roz onto shore?", "She crosses the silent island, studies the fungal growth, sees new sprouts, and returns to the sea."],
    ["Why is the island otherwise dead?", "Wind-blown poison spray has killed its plants and the creatures that depended on them."],
    ["Why do the mushrooms give Roz hope?", "They absorb toxic substances and create healthier ground where new plants can begin."],
    ["What evidence suggests recovery is possible but blocked?", "Tiny green shoots are taking root, yet continuing poison keeps threatening them."],
    ["How does the discovery affect Roz?", "A place of total loss becomes evidence that her own island could heal if the pollution stops."],
    ["Why is natural recovery important to the mission?", "Roz does not need to rebuild every habitat herself; stopping the cause may let living systems repair damage."]
  ]},
  { n:30, q:[
    ["What is the booming sound beneath the surface?", "Lightning striking an ocean wave creates the underwater blast."],
    ["What happens after the current resists Roz's northward march?", "She swims with it at high speed, crosses an undersea cliff, and dives below the storm."],
    ["Why is lightning dangerous to Roz?", "A direct electrical strike could destroy her robotic systems."],
    ["Why does Roz choose the deep ocean?", "Descending removes her from the violent water and lightning concentrated near the surface."],
    ["What evidence shows her escape is urgent?", "Repeated flashes sizzle across waves while her Survival Instincts flare and her body reaches its limits."],
    ["How does Roz turn an opposing current into help?", "She stops forcing a direct march and uses the current to gain the speed needed to escape."],
    ["What does the dive represent?", "Avoiding one danger carries Roz into a darker, less familiar world where new risks await."]
  ]},
  { n:31, q:[
    ["What does Roz find around the hot-water rock towers?", "Corals, sponges, anemones, shellfish, and other creatures thrive in the warmth."],
    ["What happens after Roz notices the colorful sea slug?", "She cannot identify its species, speaks with it, and realizes she has discovered an unknown animal."],
    ["Why does Roz turn on her headlights?", "Almost no sunlight reaches the deep ocean floor, so she needs light to see her surroundings."],
    ["Why is the sea slug afraid of the poison tide?", "The pollution could reach the deep and destroy the unusual community living there."],
    ["What evidence shows that the deep ocean is both dangerous and full of life?", "Crushing pressure and darkness surround vents where many bizarre creatures gather."],
    ["How does discovering the slug affect Roz's thinking?", "It makes her wonder how many unknown species could disappear before anyone discovers them."],
    ["Why does this deep-sea discovery matter to Roz's mission?", "It reveals that stopping the poison tide protects living communities people may not even know exist."]
  ]},
  { n:32, q:[
    ["How long has Roz been traveling since leaving the island?", "She has been traveling for one month."],
    ["What does Roz do when the water pressure becomes dangerous?", "She leaves the descending slope and swims forward at a safer depth."],
    ["Why is the deep dark even though the far north has constant summer daylight?", "Roz is swimming below the depth that sunlight can reach."],
    ["Why do Roz's thoughts wander while she swims?", "Her limbs paddle automatically, leaving her mind free to remember home and the people she loves."],
    ["What evidence shows that the darkness is not completely empty?", "Glowing fish and jellyfish appear briefly before slipping back into the haze."],
    ["What do Roz's memories reveal about her?", "Even far from home, she remains emotionally connected to Brightbill, Glimmer, and her other friends."],
    ["What central contrast shapes this chapter?", "Roz travels through a strange, dark ocean while her memories keep the warmth of home close."]
  ]},
  { n:33, q:[
    ["What animal bites Roz while hunting the fleeing squid?", "A hungry sperm whale mistakes her for prey and bites her."],
    ["What happens after the whale learns Roz seeks the Ancient Shark?", "He stops laughing and admits that the shark's help might give her mission a chance."],
    ["Why does the whale spit Roz out?", "He expected a soft squid but found her hard robotic body instead."],
    ["Why is the whale having trouble finding food?", "Many ocean animals are fleeing south to escape the spreading poison tide."],
    ["What do the whale's scars suggest?", "He has survived dangerous encounters and understands being in the wrong place at the wrong time."],
    ["How does the whale's attitude toward Roz change?", "He moves from anger and mockery to hope that she and the Ancient Shark might succeed."],
    ["Why is this encounter significant?", "It shows that the poison tide is disrupting even powerful predators and that Roz's mission matters across the food web."]
  ]},
  { n:34, q:[
    ["Which animals inspire Roz to try echolocation?", "Dolphins, porpoises, and certain whales inspire her experiment."],
    ["How does Roz finally prove her echolocation works?", "She follows increasingly strong echoes until she reaches a huge jellyfish."],
    ["Why does Roz keep clicking after her first attempt produces no echo?", "She believes practice and continued listening may help her locate something."],
    ["Why can Roz switch off her headlights at the end?", "Her clicks and their returning echoes now help her navigate the darkness."],
    ["What evidence shows Roz is learning from ocean animals?", "She copies their sound-navigation method and improves it through repeated practice."],
    ["What does Roz's excitement about the jellyfish reveal?", "She values discovery and feels encouraged when a difficult new skill succeeds."],
    ["What is the chapter's main idea?", "Careful practice and learning from other creatures give Roz a new way to handle an unfamiliar environment."]
  ]},
  { n:35, q:[
    ["What creates the glowing haze around Roz?", "A swarm of tiny bioluminescent plants and animals rises from the depths."],
    ["What does Roz discover after nearly a day without echoes?", "She notices countless living specks glowing all around her."],
    ["Why had Roz believed she was alone?", "Her echolocation returned no echoes and the surrounding ocean seemed dark and empty."],
    ["Why does examining one glowing speck change her understanding?", "She sees that something as small as a grain of sand can be a living creature."],
    ["What evidence supports Roz's realization that life is everywhere?", "The apparently empty water is filled with an enormous swarm of glowing organisms."],
    ["How does Roz's mood change?", "Her loneliness gives way to wonder as the lights make the ocean feel like a sky full of stars."],
    ["What does the chapter suggest about noticing the natural world?", "Life may be present even when it is too small or hidden to see at first."]
  ]},
  { n:36, q:[
    ["In what direction does Roz keep swimming?", "She keeps swimming north."],
    ["What does Roz do throughout the chapter?", "She swims continuously without stopping or slowing."],
    ["Why does the journey feel endless?", "Roz keeps moving but sees no sign that the vast ocean is ending."],
    ["Why is the repeated word swam effective?", "It emphasizes the long, tiring sameness of Roz's travel."],
    ["What evidence shows Roz's determination?", "She never stops, never slows, and continues toward her goal."],
    ["What does Roz's steady movement reveal about her character?", "She remains persistent even when progress feels invisible."],
    ["Why does this very short chapter matter?", "It makes the enormous distance and endurance required by Roz's mission feel clear."]
  ]},
  { n:37, q:[
    ["How does Roz normally recharge her battery on land?", "Her battery recharges when her body is in sunlight."],
    ["What happens as Roz rushes toward the surface?", "The water changes from black to blue to aqua, grows warmer, and becomes sunnier."],
    ["Why does Roz need to leave the deep ocean?", "Weeks below sunlight have caused her battery power to run low."],
    ["Why can Roz rise faster than a human diver?", "Her robotic body does not need time to adjust to changing water pressure."],
    ["What evidence shows she is nearing the surface?", "The water brightens and warms while the currents grow stronger."],
    ["How does Roz respond to a physical limitation?", "She recognizes the warning and changes course before her battery fails."],
    ["What is important about sunlight in this chapter?", "It is not just scenery; it is the energy source Roz needs to continue her mission."]
  ]},
  { n:38, q:[
    ["What creatures surround Roz and ask what she is?", "A lively pod of dolphins surrounds and studies her."],
    ["What do the dolphins do after Roz asks for help finding seabirds?", "They herd fish together and lift them toward the surface with bubbles to attract birds."],
    ["Why do the dolphins suggest that Roz speak with seabirds?", "They know little about land, while seabirds may know whether crossing it will shorten her route."],
    ["Why does the pod want to help Roz?", "The dolphins know the poison tide is causing damage and believe it must be stopped."],
    ["What evidence shows Roz has improved at echolocation?", "She can identify mountains, a whale, and driftwood before seeing them."],
    ["How does the dolphins' reaction to Roz change?", "Playful curiosity becomes serious cooperation once they hear about her mission."],
    ["Why is the pod's help significant?", "Their knowledge and teamwork connect Roz with the next guides she needs for her journey."]
  ]},
  { n:39, q:[
    ["Who is Kerplunk?", "Kerplunk is a puffin who guides Roz toward a route across the land."],
    ["What happens after the skuas chase Kerplunk?", "They steal his fish and knock him into the sea, so he must return to fishing."],
    ["Why did Kerplunk move his family away from their old coast?", "Birds that ate fish killed by the poison tide died, and the area was no longer safe."],
    ["Why does Kerplunk tell Roz to follow the stream?", "It leads across the land to a glacier overlooking the northern ocean."],
    ["What evidence shows Kerplunk understood the danger before other birds did?", "He noticed the dead fish smelled wrong and warned the flock not to eat them."],
    ["What does Kerplunk's response to losing his meal reveal?", "He is resilient and practical, accepting that he must simply fish again."],
    ["Why is Kerplunk's story important?", "It shows how poisoned prey can kill other animals and makes Roz's mission more urgent."]
  ]},
  { n:40, q:[
    ["What animal follows Roz through the kelp forest?", "A curious red octopus named Limber follows her."],
    ["How do Roz and Limber reach the shore safely?", "Limber pulls Roz through a reef cave that opens onto the beach."],
    ["Why does Roz's underwater camouflage fail?", "The kelp unwraps, the sand drifts away, and the shells slide off her body."],
    ["Why is stopping the poison tide especially personal to Limber?", "She will die while guarding her eggs and needs a safe ocean for the hatchlings she will never meet."],
    ["What evidence shows Limber is helpful rather than dangerous?", "She demonstrates camouflage and guides Roz away from waves that would smash her into rocks."],
    ["How does Limber change after hearing about the mission?", "Her cheerful curiosity becomes serious fear and concern for her future young."],
    ["What central idea connects Roz and Limber?", "Both are driven to protect young lives even when they may not be present for everything that follows."]
  ]},
  { n:41, q:[
    ["What natural feature does Roz use as her guide across the tundra?", "She follows the stream Kerplunk told her would lead to a glacier."],
    ["What happens when musk oxen charge at Roz?", "She leaps over the herd, apologizes, lands, and keeps running."],
    ["Why are there no trees on the tundra?", "Cold temperatures and short growing seasons prevent trees from taking root."],
    ["Why does Roz become more cautious after waving to the distant man?", "She knows that a closer human would recognize that she is a robot."],
    ["What evidence shows the northern environment is changing?", "Permafrost now thaws in summer, leaving the ground soggy beneath Roz's feet."],
    ["What does Roz's choice to stop analyzing the aurora reveal?", "She can set facts aside and simply appreciate beauty."],
    ["Why does the glacier at the chapter's end matter?", "It confirms that Roz's guide has led her closer to the northern ocean and her goal."]
  ]},
  { n:42, q:[
    ["What does Roz find frozen inside the glacier?", "She finds an ancient mouse preserved in a clear wall of ice."],
    ["How does Roz finally escape the glacier?", "After days of searching tunnels, she follows the sound of waves and smell of salt air to daylight."],
    ["Why does the lake on the glacier suddenly drain?", "A shift in the ice opens a large crack beneath the water."],
    ["Why does Roz abandon the vertical shaft she tries to climb?", "The shaft becomes too narrow for her body to continue upward."],
    ["What evidence shows the glacier is always moving and dangerous?", "It groans, opens cracks, drops icicles, and finally breaks an entire cliff into the sea."],
    ["How does Roz feel after the collapsing cliff sends her underwater?", "Despite new dents and scrapes, she feels delighted to have reached the northern ocean."],
    ["What does Roz's journey through the glacier demonstrate?", "Persistence and adaptation can carry her through a route that repeatedly changes and threatens her."]
  ]},
  { n:43, q:[
    ["Who is Big Shot?", "Big Shot is the largest, toughest walrus and the herd's beach master."],
    ["What happens when a polar bear appears?", "The walruses stampede toward the sea, and the bear attacks a separated youngster."],
    ["Why does the polar bear stop attacking the young walrus?", "Big Shot places himself between them and challenges the bear to fight him first."],
    ["Why does Roz first approach the crowded beach?", "She hopes one of the walruses can tell her where to find the Ancient Shark."],
    ["What evidence shows Roz is endangered by the herd even though it is not hunting her?", "Panicked walruses knock her down, strike her with tusks, and crawl over her."],
    ["What does Big Shot's rescue reveal about him?", "His leadership includes courageously protecting a vulnerable member of the herd."],
    ["Why does the emptied beach create a turning point?", "Roz loses her chance to question the walruses and is left alone with the hungry polar bear."]
  ]},
  { n:44, q:[
    ["What landmark does the polar bear tell Roz to follow?", "He tells her to follow the guiding star that stays fixed in the sky."],
    ["What does Roz do after learning how to find the Ancient Shark's waters?", "She thanks the bear, promises to try to stop the tide, and marches into the waves."],
    ["Why does the polar bear stop stalking Roz?", "His nose confirms that her metal body is not edible."],
    ["Why is the bear considering leaving his hunting ground?", "Fish, birds, and seals are fleeing the feared poison tide, leaving him little meat."],
    ["What evidence shows the poison tide harms places before it arrives?", "Fear has already driven prey away from a coast the pollution has not yet reached."],
    ["How does Roz respond to the bear's doubt about the Ancient Shark?", "She accepts his question and decides to ask the shark why she has not acted."],
    ["Why is the guiding star significant?", "It gives Roz a dependable natural direction through the vast ocean toward the next stage of her mission."]
  ]},
  { n:45, q:[
    ["What animals does Roz see racing through the starlit waves?", "She sees a family of tusked narwhals."],
    ["What does Roz do when the guiding star is directly overhead?", "She stops and treads water above the Ancient Shark's home waters."],
    ["Why are there fewer fish, squid, and seabirds in the far north?", "Fear of the poison tide has driven many ocean animals away."],
    ["Why does Roz watch the guiding star as she swims?", "Its rising position tells her when she has reached the correct location."],
    ["What evidence shows the far north is a place of extremes?", "Seas freeze and melt, and months of daylight are followed by months of darkness."],
    ["What does Roz's question about the narwhals reveal?", "She is thinking about how fear and environmental danger are changing other animals' lives."],
    ["Why does the chapter end with the shark still unseen?", "It builds suspense by placing Roz at her destination while leaving the difficult search below her."]
  ]},
  { n:46, q:[
    ["What is the Ancient Shark's true name?", "The Ancient Shark tells Roz to call her Gurry."],
    ["How does Roz locate Gurry on the dark seabed?", "She searches in widening circles and follows an echolocation echo shaped like a shark."],
    ["Why can blind Gurry know so much about Roz's journey?", "Her sharp senses and animal messengers serve as eyes and ears throughout the north."],
    ["Why has Gurry been waiting for Roz?", "Roz can survive the poison tide and understands robots in ways Gurry's animal armies do not."],
    ["What evidence suggests Gurry is more than five hundred years old?", "She remembers wooden sailing ships from the old days of human whaling."],
    ["How do Gurry's memories shape her view of humans?", "She has watched their ships grow stronger, the ice grow thinner, and ocean dangers increase."],
    ["Why is Gurry's final revelation important?", "Learning that robots created the poison tide connects Roz personally to the enemy and changes the mission."]
  ]},
  { n:47, q:[
    ["What is creating the poison tide?", "A giant crablike mining robot is tearing apart an underwater mountain and releasing toxic dust."],
    ["What agreement do Roz and Gurry make?", "Roz will try a peaceful solution first, and Gurry's armies will attack if that attempt fails."],
    ["Why does Gurry plan to attack the station at the surface?", "The deep mining site is inside the poison tide, while the station holds the humans controlling it."],
    ["Why does Roz strike Gurry?", "Gurry's teeth trigger Roz's Survival Instincts, and her new body fights back to prevent destruction."],
    ["What evidence shows Roz's new ability troubles her?", "She feels sorrow and loss because peacefulness is a quality she loves about herself."],
    ["How do Roz and Gurry differ in their idea of strength?", "Gurry trusts violence and revenge, while Roz trusts thought, planning, and reason."],
    ["What is the chapter's central question?", "It asks whether having the power to fight means Roz must use it to solve the crisis."]
  ]},
  { n:48, q:[
    ["In what direction does Roz swim from Gurry's waters?", "She follows Gurry's directions west toward the mining station."],
    ["What appears after the rumbling grows louder?", "The distant shape of a large industrial mining station comes into view."],
    ["Why does Roz keep thinking about Dr. Molovo?", "She wonders why her new body was given the ability to fight."],
    ["Why does Roz want to prove Gurry wrong?", "She hopes to show that peaceful reasoning can solve even this dangerous problem."],
    ["What evidence shows Roz remains committed to peace?", "She decides she will never choose to attack anyone despite her new ability."],
    ["What do Roz's thoughts about Brightbill and Glimmer reveal?", "Her family remains a source of love and motivation during the lonely journey."],
    ["Why is seeing the station significant?", "After a vast journey, Roz has finally reached the human-controlled source of the crisis."]
  ]},
  { n:49, q:[
    ["What is the mining station called?", "The floating industrial station is called the Juggernaut."],
    ["How does Roz secretly reach the station's control tower?", "She hides beneath an iceberg, climbs a ladder, crosses the platform at twilight, and scales pipes to a balcony."],
    ["Why do four underwater engines keep running?", "They constantly adjust against wind, waves, and currents so the station stays in one place."],
    ["Why does Roz wait before climbing onto the platform?", "She fears the BOSUN work robots might see and attack her before she can reach the humans."],
    ["What evidence shows the HYDRO robots are built for underwater work?", "Their streamlined bodies, powerful engines, extendable arms, and steel-cutting claws let them move and work in the deep."],
    ["How does Roz react when the floodlights suddenly illuminate her?", "She first believes she has been caught, then realizes the lights switched on automatically at dusk."],
    ["Why does finding the control room matter?", "It offers Roz the information and human contact she needs to understand and stop the mining operation."]
  ]},
  { n:50, q:[
    ["What does the tabletop screen display?", "It displays a map of the area and current weather information."],
    ["What does Roz discover after seeing the live video feed?", "She sees the mining robot creating the dust clouds that become the poison tide."],
    ["Why does Roz initially feel hopeful?", "She thinks the humans may not know about the distant damage and might stop when told."],
    ["Why does the video screen extinguish that hope?", "It proves the station is directly watching the toxic clouds coming from the mining site."],
    ["What evidence shows humans still operate the highly automated station?", "Jackets, food wrappers, binoculars, and the arriving manager show that people live and work there."],
    ["How does learning Akiko's role affect Roz's view of her?", "Roz identifies the station manager as the person responsible for the operation causing the tide."],
    ["Why is the control-room discovery a turning point?", "Roz moves from guessing about the cause to seeing the source and locating the human in charge."]
  ]},
  { n:51, q:[
    ["Who appears on Akiko's video call?", "Her husband Leo and their young daughter appear from home."],
    ["What happens after Akiko's daughter asks about their camping trip?", "Akiko delays it again, the disappointed girl leaves, and Leo reminds Akiko that the children are growing up."],
    ["Why does Leo hate the mining station?", "Akiko's distant job is keeping their family apart."],
    ["Why does Akiko say she will request a headquarters job?", "She recognizes that she is missing her family and wants to return home."],
    ["What evidence shows Akiko is deeply unhappy?", "After the call she cries and asks herself why she is doing a job she no longer likes."],
    ["How does this private conversation complicate Roz's view of Akiko?", "The responsible manager is also shown as a loving, conflicted person rather than a simple villain."],
    ["Why does the chapter focus on Akiko's family?", "It gives Roz and the reader reasons to believe a personal, peaceful appeal may reach her."]
  ]},
  { n:52, q:[
    ["Who is Nimbus?", "Nimbus is the sick-looking gull who nests alone on the control-tower roof."],
    ["What does the station drone do at daybreak?", "It inspects equipment and robots, then stops directly above the hidden Roz."],
    ["Why is the dark roof a good hiding place for Roz?", "Her mechanical body blends with the communication antennas and equipment."],
    ["Why has Nimbus stayed when the other gulls left?", "He has been feeding on the many dead crabs created by the poison tide."],
    ["What evidence suggests the poisoned food is harming Nimbus?", "One eye is crusted shut, feathers are missing, and he admits feeling unwell."],
    ["How does Roz interpret Akiko after hearing her call?", "She sees Akiko as an unhappy but reasonable person who might choose to protect the ocean."],
    ["Why is the drone's discovery significant?", "Roz's careful plan to approach the humans peacefully is suddenly threatened before she can begin."]
  ]},
  { n:53, q:[
    ["What sets off alarms across the Juggernaut?", "The station drone detects Roz as an intruder."],
    ["What happens when Roz leaps toward the ocean?", "A HYDRO robot rises and catches her in a giant claw before she reaches the water."],
    ["Why can Roz not simply outrun the station's robots?", "Although the BOSUNs are slower, the flying drone tracks every route she takes."],
    ["Why does Roz refuse to fight when surrounded?", "She still believes there is a peaceful way to solve the problem."],
    ["What evidence shows Nimbus tries to help?", "He chases the drone, kicking and pecking it to distract it from Roz."],
    ["What does Roz's escape attempt reveal about her?", "She acts quickly and risks a long fall while remaining committed to avoiding violence."],
    ["Why is the ending important?", "Roz's only escape route becomes a capture, placing her directly under the mining station's control."]
  ]},
  { n:54, q:[
    ["Where do the humans imprison Roz?", "They place her in an empty room with small round windows."],
    ["What does BOSUN 10 do after carrying Roz inside?", "He orders her not to escape, locks the door, and stands guard in the hall."],
    ["Why is an ordinary room used as a jail?", "The Juggernaut has never had an intruder and has no real prison."],
    ["Why must a BOSUN guard the door?", "The makeshift cell was not designed to hold a capable robot on its own."],
    ["What evidence shows the crew is improvising?", "They debate where to put Roz and choose the best available empty room."],
    ["How does Roz's situation change in this brief chapter?", "She changes from a visitor seeking a conversation into a locked and guarded prisoner."],
    ["Why does the chapter emphasize the station's first intruder?", "It explains the crew's uncertainty while showing how quickly fear replaces communication."]
  ]},
  { n:55, q:[
    ["Who questions Roz in the jail room?", "Station manager Akiko Fuji and assistant manager George Sammortuk question her."],
    ["What does Akiko agree to do after hearing Roz's case?", "She promises to send the HYDROs to inspect the runoff and try to fix it if Roz is right."],
    ["Why had the crew believed the toxic runoff was acceptable?", "Their calculations said it would not travel far, and they thought the nearby seafloor was barren."],
    ["Why can Akiko not simply stop the operation herself?", "She manages the station but says headquarters would never allow the job to stop midway."],
    ["What evidence shows the humans' predictions are unreliable?", "Changing waterways have altered ocean currents, while Roz has witnessed damage far beyond their expected range."],
    ["How does learning what the mine produces affect Roz?", "She is shocked that her home could be destroyed to obtain metals for making more robots like her."],
    ["What central conflict does the conversation reveal?", "Human dependence on useful technology is colliding with the responsibility to protect the environment it harms."]
  ]},
  { n:56, q:[
    ["What agreement has Roz just gained?", "The mining station manager has agreed to cooperate with her."],
    ["What happens as the humans leave the jail room?", "Alarms suddenly begin blaring throughout the station."],
    ["Why does Roz initially feel good?", "Her long and difficult mission finally seems to be producing a peaceful solution."],
    ["Why do her good feelings end quickly?", "The sudden alarm signals that a new emergency is interrupting the agreement."],
    ["What evidence shows the agreement matters deeply to Roz?", "She sees it as the payoff for all the distance and danger she endured."],
    ["How does the chapter's mood change?", "Relief and hope abruptly turn into alarm and uncertainty."],
    ["Why is this short chapter significant?", "It interrupts a nearly successful peaceful solution and prepares the reader for an unexpected conflict."]
  ]},
  { n:57, q:[
    ["What do the countless dots on the control-room map represent?", "They represent an enormous force of ocean animals surrounding the Juggernaut."],
    ["What happens after fish tighten their circle around the station?", "Fish strike the base, followed by dolphins, sharks, walruses, squid, and other animals."],
    ["Why does Gurry begin the attack?", "She hears Roz has been captured and assumes the peaceful attempt failed."],
    ["Why can Roz do nothing but watch?", "She remains locked inside the jail room high above the battle."],
    ["What evidence shows Gurry is actively commanding the attack?", "Her fish messengers report events and carry instructions about safety, pacing, and the poison tide."],
    ["How does Roz view the battle?", "She sees it as a tragic interruption because peaceful cooperation was almost achieved."],
    ["Why is the attack important to the chapter's larger conflict?", "A lack of communication turns allies' desire to help into the very violence Roz hoped to prevent."]
  ]},
  { n:58, q:[
    ["What is the dark cloud approaching the Juggernaut?", "It is a gigantic mixed flock of northern birds."],
    ["What happens after the damaged drone crashes onto the control tower?", "It destroys antennas and cuts the station's wireless contact with robots and the outside world."],
    ["Why does Nimbus direct the birds toward robots and equipment?", "He knows attacking the station's solid buildings and platforms would accomplish little."],
    ["Why does Akiko connect the animal attack to Roz?", "Roz claimed she could speak with animals, and Akiko has no better explanation for their organized arrival."],
    ["What evidence shows the battle is dangerous for both sides?", "A BOSUN falls and fails, while laser fire burns feathers and sends birds into the sea."],
    ["How does Nimbus's role develop?", "The sick lone gull becomes a knowledgeable guide who helps an entire flock target the station."],
    ["Why is losing wireless communication significant?", "It isolates the Juggernaut and prevents normal control of its external systems during the attack."]
  ]},
  { n:59, q:[
    ["Which communication system still works after the antennas fail?", "The station's internal wired communication system still works."],
    ["What do the HYDROs do after plowing through the animals?", "They circle the station, churn rough water, and fire powerful sound cannons."],
    ["Why can Akiko still activate the HYDRO robots?", "Her commands travel through the Juggernaut's physical wiring rather than the broken wireless antennas."],
    ["Why do the animal armies fall back despite Gurry's command?", "The deafening sound blasts frighten and physically overwhelm them."],
    ["What evidence shows ordinary animal attacks do not stop the HYDROs?", "Fish, ink, and dolphin ramming fail to disturb the large streamlined robots."],
    ["How does the battle's momentum change?", "The animals' huge attack is pushed away as the HYDROs take control of the surrounding water."],
    ["What does this chapter show about technology in the conflict?", "Machines designed for useful work can become powerful defenses when people redirect their abilities."]
  ]},
  { n:60, q:[
    ["What animals form the super pod?", "Hundreds of northern whales of many species unite into one force."],
    ["What happens to the three HYDROs?", "HYDRO 3 is smashed into the station, HYDRO 2 is crushed by ice, and HYDRO 1 is battered until it sinks."],
    ["Why do the whales dive before reaching the HYDROs?", "They let their giant wave continue while they position below to block the robots' escape."],
    ["Why do bubbles help defeat HYDRO 3?", "The rising layer forces the robot upward into the tidal wave's path."],
    ["What evidence shows the whales use strategy as well as strength?", "They coordinate waves, bubbles, icebergs, distractions, and attacks from several directions."],
    ["How is the whales' victory costly?", "Several whales are badly injured even though they destroy the defending robots."],
    ["Why is HYDRO 3 piercing the wall significant?", "Its destruction opens the Juggernaut to flooding and makes the once-mighty station vulnerable."]
  ]},
  { n:61, q:[
    ["What are the tiniest warriors in Gurry's plan?", "Billions of zooplankton are the tiniest warriors."],
    ["What happens as the zooplankton gather around the engines?", "They form glowing slime that enters the machinery and begins slowing the propellers."],
    ["Why are the station's engines the animals' next target?", "The four engines are keeping the damaged Juggernaut afloat."],
    ["Why can zooplankton approach the spinning blades?", "They are so tiny that the blades cannot cut them apart like larger animals."],
    ["What evidence shows the plan depends on enormous numbers?", "A glowing haze grows into a storm and a never-ending stream of sludge enters the engines."],
    ["How do the zooplankton challenge the idea of power?", "Individually tiny creatures become strong enough together to threaten giant machinery."],
    ["What is the chapter's central message?", "Successful teamwork values the special abilities of the smallest members as well as the largest."]
  ]},
  { n:62, q:[
    ["Which two geese arrive at the Juggernaut?", "Brightbill and Glimmer arrive after flying for three days."],
    ["How do the birds free Roz?", "Seabirds lure BOSUN 10 away, then Roz smashes the locked door after Brightbill cannot open it."],
    ["Why do Brightbill and Glimmer come to the station?", "They hear about the battle and believe Roz may need their help."],
    ["Why are their goslings safe while they are away?", "Loudwing is caring for the newly hatched goslings on the island."],
    ["What evidence shows the wider bird community cooperates?", "Several species pass the geese from one helper to another until Nimbus directs them to Roz."],
    ["How does the news from home affect Roz?", "The island's struggles worry her, but learning she is a grandmother brings her joy."],
    ["Why is the family's arrival significant?", "It reconnects Roz's dangerous mission to the island and loved ones she is trying to protect."]
  ]},
  { n:63, q:[
    ["What finally stops all four station propellers?", "Hardened zooplankton sludge gums up the engines until they grind to a halt."],
    ["What happens after Akiko orders the crew to abandon the Juggernaut?", "The airship is swept away as flooding, ice, fires, and explosions spread across the sinking station."],
    ["Why does George decide Roz may be trustworthy?", "The organized animal attack makes him reconsider her claim that she communicates with animals."],
    ["Why do the crew members panic when the engines stop?", "The unstable, damaged station begins sinking while their safe escape routes disappear."],
    ["What evidence shows conditions worsen rapidly?", "Waves flood rooms, ice forms, electricity pops, fires spread, and explosions shake the station."],
    ["How does Akiko respond as the crisis grows?", "She moves from disbelief to a firm decision to abandon the operation and save her crew."],
    ["Why is the loss of the airship important?", "It removes the crew's planned escape and makes outside help essential to their survival."]
  ]},
  { n:64, q:[
    ["Where do Roz and the geese flee from BOSUN 10?", "They climb through the stairwell and escape onto the roof."],
    ["What happens when BOSUN 10 copies Roz's leap?", "He falls short, crashes into the tower, and drops into the flames."],
    ["Why do the ocean animals pull back?", "Their victory calms their anger, and they expect the damaged Juggernaut to sink."],
    ["Why does Roz return toward the trapped crew?", "She refuses to let the humans die even though their operation caused the poison tide."],
    ["What evidence proves Roz's offer is not another attack?", "She sends the geese for help and asks which crew member she should carry to safety first."],
    ["How does Akiko's attitude change when Roz offers help?", "She lowers her rifle and admits that the crew has no other escape option."],
    ["What principle does Roz's choice demonstrate?", "Protecting life matters to her even when the people in danger have made harmful choices."]
  ]},
  { n:65, q:[
    ["Who is the first crew member Roz carries down?", "George is the first person to trust Roz and be carried to the main platform."],
    ["What happens after the whole crew reaches the platform?", "Whales line up as living rafts and carry the humans toward shore."],
    ["Why do the humans hesitate to ride the whales?", "The same animals had recently attacked their station, so the crew fears them."],
    ["Why does Akiko tell Roz to go home?", "She says the unstoppable mining robot will keep working until a cleanup fleet arrives to shut it down."],
    ["What evidence shows the humans begin to see the animals differently?", "While seated on the whales, they feel awestruck by the creatures they had feared."],
    ["How does George's trust develop during the rescue?", "His nervous first leap becomes a smile when Roz lands gently and keeps him safe."],
    ["Why is the rescue significant?", "Roz and the whales save their former opponents, proving that the animals fought to stop harm rather than to seek human deaths."]
  ]},
  { n:66, q:[
    ["What does Roz plan to do after the crew leaves?", "She plans to dive to the mining site and try to stop the robot still producing the poison tide."],
    ["What happens after Roz says goodbye?", "Brightbill and Glimmer fly toward home while Roz dives from the sinking station into the sea."],
    ["Why does Brightbill ask Roz not to take another risk?", "He fears losing his mother and wants her to meet his goslings."],
    ["Why does Roz believe protecting the wilderness is now her purpose?", "Raising Brightbill gave her an earlier purpose, and his adulthood has allowed her care to widen."],
    ["What evidence connects Roz's choice to Limber the octopus?", "Roz recalls the mother who will sacrifice her life guarding eggs she will never see hatch."],
    ["How does becoming a parent help Brightbill understand Roz?", "His willingness to do anything for his goslings lets him recognize her need to protect what she loves."],
    ["What does the chapter say about parenthood?", "Love can create a responsibility to protect others even when that protection requires painful separation or sacrifice."]
  ]},
  { n:67, q:[
    ["What is the last part of the Juggernaut to disappear?", "The control tower is the final structure to slip beneath the water."],
    ["What do Brightbill and Glimmer do after one final circle?", "They turn away from the vanished station and fly home to their goslings."],
    ["Why does Brightbill hesitate to leave?", "He feels as though returning home means abandoning Roz to face Crusher alone."],
    ["Why does Glimmer insist they must go?", "Roz can care for herself, while their young goslings urgently need their parents."],
    ["What evidence shows the goodbye remains emotionally difficult?", "The geese circle long after Roz disappears and cannot stop watching the sinking station."],
    ["How does Glimmer help Brightbill make his decision?", "She reframes leaving Roz as fulfilling their own responsibility to their children."],
    ["Why is the sinking station significant here?", "Its disappearance marks the end of the battle while the family's uncertain future remains unresolved."]
  ]},
  { n:68, q:[
    ["What debris does Roz see during her descent?", "Equipment and supplies from the sunken station drift downward through the water."],
    ["What does Roz find after swimming through the dust clouds?", "She finds Crusher grinding across the top of a bare underwater mountain."],
    ["Why does the grinding grow louder as Roz descends?", "She is moving closer to the mining robot that is tearing apart the mountain."],
    ["Why is the mountain's surface bare?", "Strong currents have blown away its sand and silt, exposing craggy rock."],
    ["What evidence shows Roz has entered the poison tide itself?", "Toxic dust clouds surround her before she emerges into clearer water near their source."],
    ["How does reaching Crusher complete Roz's search?", "After months of travel, she finally sees the exact machine causing the disaster."],
    ["Why is this discovery a major turning point?", "The mission changes from finding the problem to confronting and stopping its active source."]
  ]},
  { n:69, q:[
    ["What is the mining robot's name?", "The giant crablike mining robot is named Crusher."],
    ["What happens when Roz first tries to speak with Crusher?", "He decides she does not belong, knocks her aside, and resumes mining."],
    ["Why does Crusher keep working without signals from the Juggernaut?", "Temporary signal failures are common in the deep, so he assumes communication will return."],
    ["Why must Roz rely on her wits?", "Crusher's huge size, armor, claws, and sound cannon make him far stronger than she is."],
    ["What evidence shows Roz refuses to give up after being hurt?", "Her recovery program restores her, and she repeatedly returns after being struck and stunned."],
    ["How does the fish messenger affect Roz's next task?", "He tells her Gurry needs Crusher held still and distracted for a plan to work."],
    ["Why is Crusher difficult to reason with?", "His narrow programming treats Roz as an unauthorized obstacle and prioritizes completing the mining task."]
  ]},
  { n:70, q:[
    ["What false order does Roz give Crusher?", "She claims the Juggernaut ordered him to stop mining and await instructions."],
    ["What happens when Roz cannot provide a command code?", "Crusher counts down, attacks, and traps her tightly in one claw."],
    ["Why does Roz lie to Crusher?", "She must keep him from moving or creating more dust while Gurry's plan develops."],
    ["Why does Roz ask Crusher to reveal his own code first?", "She has no code and uses the question to stall for more time."],
    ["What evidence shows her lie is almost believable?", "Crusher pauses to verify her authority instead of immediately dismissing the order."],
    ["How does Roz's new fighting ability help and fail her?", "She strikes quickly in self-defense, but Crusher's greater size lets him capture her anyway."],
    ["Why does the narrator treat this lie differently from ordinary lying?", "The deception is presented as a rare necessity used to protect lives rather than gain selfish advantage."]
  ]},
  { n:71, q:[
    ["What truth does Roz tell Crusher?", "She admits she came on her own to stop him because his runoff is destroying the ocean and her home."],
    ["What happens after the animal army releases the sinking Juggernaut?", "The station falls toward Crusher, he releases Roz to brace himself, and it crashes onto them."],
    ["Why does Gurry use the Juggernaut as a weapon?", "The enormous sinking station can crush the mining robot that the animals cannot defeat directly."],
    ["Why must whales take turns guiding the station?", "Deep diving exhausts their limited breath, so fresh whales replace those returning to the surface."],
    ["What evidence shows Roz understands Crusher is not acting from cruelty?", "She tells him he was simply doing his assigned job, just as she was following her purpose."],
    ["How does Roz respond when she realizes she may die?", "She remains calm, understands the plan, and apologizes to Crusher instead of blaming him."],
    ["Why is the crash significant?", "Stopping the poison tide appears to require the destruction of both its source and the robot who came to protect the ocean."]
  ]},
  { n:72, q:[
    ["How long does the geese's flight home take?", "Brightbill and Glimmer fly for three days."],
    ["What happens when the goslings see their parents?", "They rush forward, bump and tumble together, and share a long family embrace."],
    ["Why does the island look both gray and green?", "Its dead outer areas show the tide's damage, while the protected interior still supports life."],
    ["Why have the goslings changed since their parents left?", "They are growing quickly and have already replaced their fluff with silky feathers."],
    ["What evidence shows Loudwing cared for and taught the goslings?", "She leads them through the forest while teaching a walking song they repeat."],
    ["How does the reunion affect Brightbill and Glimmer?", "Their dangerous journey ends in relief and closeness as they hold all five young geese."],
    ["Why is the return important even without Roz?", "It restores the goslings' parents while reminding the family and reader that Roz's fate is still unknown."]
  ]},
  { n:73, q:[
    ["What are Brightbill and Glimmer preparing their goslings to do?", "They are strengthening and teaching them for their first winter migration."],
    ["What do the geese discover during a morning practice flight?", "They see that the poison tide's flow has completely stopped."],
    ["Why can geese manage the island crisis more easily than most animals?", "They need simple resources and can fly away if conditions become impossible."],
    ["Why are the island's problems not over?", "Toxic dust still coats parts of the seabed and coastline even though no more is arriving."],
    ["What evidence shows the community remains worried?", "Animals speak about lost homes, scarce resources, Roz's absence, and wanting normal life back."],
    ["How does the discovery change the island's outlook?", "It provides real hope that Roz succeeded, while the remaining dust keeps that hope cautious."],
    ["Why is the stopped flow momentous?", "It is the first visible proof that the source of the disaster has been shut down."]
  ]},
  { n:74, q:[
    ["What does the approaching fleet turn out to be?", "It is a fleet of specialized cleanup robots rather than ordinary ships."],
    ["What happens after the small robots finish cleaning the coast?", "They return to the ocean and the whole cleanup fleet continues south."],
    ["Why do different robots use different tools?", "Toxic dust lies on the surface, in deep water, and along land, so each location needs a specialized method."],
    ["Why has the fleet come to the island?", "Akiko is keeping her promise to trace the poison tide and remove its toxic particles."],
    ["What evidence shows the cleanup is thorough?", "Drums skim the surface, magnets collect deep particles, drones scan from above, and small robots search cracks and tide pools."],
    ["How do the animals' feelings likely change as the fleet approaches?", "They move from hiding fear to recognizing that the robots are repairing the damage."],
    ["Why is the fleet significant?", "Human technology that helped cause the crisis is now being used responsibly to restore the ocean."]
  ]},
  { n:75, q:[
    ["Who checks the coast for remaining poison dust?", "Swooper the owl searches with his sharp vision."],
    ["What happens after Shelly and the other otters enter the water?", "They confirm it is safe and happily link arms into a floating raft."],
    ["Why do Brightbill and Glimmer keep the goslings out of the water at first?", "The ocean looks clean, but the parents do not want their children to be the test of its safety."],
    ["Why is the empty reef painful to see?", "The poison is gone, but the seaweed, fish, and busy life that once filled it have been lost."],
    ["What evidence shows the animals feel more than simple happiness?", "Their relief is mixed with grief for the damaged habitat and worry that Roz may never return."],
    ["How does Brightbill interpret the end of the poison tide?", "He sees it as proof that his mother found a way to complete her mission."],
    ["Why does the movement offshore matter?", "It interrupts the animals' quiet thanks and creates hope that the missing Roz may be returning."]
  ]},
  { n:76, q:[
    ["How do the animals recognize the arriving robot as Roz?", "She speaks their language and greets everyone by saying it is good to be home."],
    ["What does Roz ask to do before explaining her delay?", "She asks to meet Brightbill and Glimmer's five goslings."],
    ["Why do the animals wait instead of running forward immediately?", "From a distance, they cannot tell whether the robot is Roz or another cleanup machine."],
    ["Why does Brightbill say the island feared she would not return?", "Roz has been missing for nearly a month after facing the mining robot alone."],
    ["What evidence shows how deeply the island values Roz?", "Animals of many kinds surround her with cheers, tears, laughter, and hugs."],
    ["How does Roz's first priority reveal her character?", "Even after surviving danger, she turns immediately toward family and meeting her grandchildren."],
    ["Why is the simple greeting so significant?", "A few familiar words transform a mysterious figure into the beloved friend the island had mourned."]
  ]},
  { n:77, q:[
    ["What are the five goslings' names?", "They are Cloudfeather, Widestride, Quickwit, Moontail, and Lighteyes."],
    ["What do the goslings do after speaking with Roz?", "They inspect her body, flutter around her, and perch on her shoulders and head."],
    ["Why does Roz promise never to mix up the goslings?", "Her robotic memory can recognize each grandchild accurately."],
    ["Why are the goslings not afraid of Roz's unusual appearance?", "Their parents have already told them all about their robotic grandmother."],
    ["What evidence shows the goslings quickly feel comfortable?", "They tease Roz about looking funny, giggle with her, and climb all over her."],
    ["How does meeting the goslings affect Roz?", "Her bright eyes, sweet voice, giggling, and happiness show immediate grandmotherly love."],
    ["Why does this quiet meeting matter after the dangerous mission?", "It shows the family future Roz risked herself to protect and gives her sacrifice a personal reward."]
  ]},
  { n:78, q:[
    ["Where did Roz hide during the Juggernaut's crash?", "She escaped into a small cave that was then buried by falling wreckage."],
    ["How does Roz finally return to the island?", "Cleanup robots accidentally carry her in a barge, and she dives out when the fleet passes her home."],
    ["Why does it take Roz a week to escape?", "She must squeeze and push through layers of crushed structures and equipment."],
    ["Why does Roz remain hidden from the cleanup robots?", "She fears they may discover and capture her, so she stays beneath wreckage and inside the barge."],
    ["What evidence proves Crusher and the poison source were stopped?", "Roz sees Crusher flattened under the wreckage and no new toxic dust being produced."],
    ["How does Roz describe the island's future?", "She admits life will be different but trusts that communities and habitats can gradually heal."],
    ["Why is Roz's speech important?", "It explains her survival, confirms the cleanup, and gives the frightened community truthful reasons for hope."]
  ]},
  { n:79, q:[
    ["Why will Brightbill's family leave the next day?", "The geese must begin their winter migration south."],
    ["What happens after the goslings compare Roz to the old oak?", "Roz climbs the tree and the whole family perches together among its branches."],
    ["Why does Roz say she did not raise Brightbill alone?", "Many island animals shared advice and skills that helped her care for him."],
    ["Why does Brightbill understand his childhood differently now?", "Becoming a parent makes him appreciate how Roz and the community shaped him."],
    ["What evidence supports the goslings' comparison between Roz and the oak?", "Like connected roots sharing resources, Roz helps others and brings a diverse community together."],
    ["How does the family respond to being called strange?", "They happily agree that their unusual family is something they like."],
    ["What theme does the old tree help express?", "Families and communities grow strong through connections, shared care, and support from many different members."]
  ]},
  { n:80, q:[
    ["Why do the island animals gather in the Great Meadow?", "They resume the Dawn Truce and gather especially to say goodbye to the migrating geese."],
    ["What happens after Brightbill gives the signal to fly?", "The flock rises, organizes into a V, turns south, and disappears beyond the island."],
    ["Why does Roz run after the flock?", "She wants to remain near her family and watch them for as long as possible."],
    ["Why is the first migration important for the young geese?", "It begins their experience of the wide world beyond the island and teaches them to travel as a group."],
    ["What evidence shows the island community is recovering?", "The Dawn Truce has returned and many different animals again gather peacefully in the meadow."],
    ["How does Roz face the farewell?", "She follows until the edge of the island, watches the flock vanish, and remains ready for what comes next."],
    ["What does the final promise about the future mean?", "Once her home has healed, Roz's life of learning, travel, and protecting the wider world can continue."]
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
  const meta = WILD_ROBOT_3_META.chapters[chapter.n - 1];
  const positions = patternFor(chapter.n);
  const answers = chapter.q.map((item) => item[1]);
  const id = `wild-robot-3-chapter-${chapter.n}`;
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

export const WILD_ROBOT_3_TESTS = Object.fromEntries(
  chapters.map((chapter) => {
    const test = createTest(chapter);
    return [test.id, test];
  })
);
