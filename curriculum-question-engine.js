function hashSeed(n){let x=Number(n)||1;return()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296}}
function pick(r,a){return a[Math.floor(r()*a.length)]}
function shuffle(r,a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function uniqChoices(a,v){const s=[String(a)];for(const x of v)if(!s.includes(String(x)))s.push(String(x));return s.slice(0,4)}

/* ==========================================================================
   DRAGONSWOOD CURRICULUM ENGINE v51  — added 2026-08-22
   WHY THIS EXISTS
   The lesson map's skill names came out of PDF extraction with stray spaces
   inside words ("T H Ree -Digit B Y O Ne -Digit M Ultiplication"). The old
   generators chose which question to build by substring-testing that text
   (skill.includes("multip")), so a mangled label silently fell through to a
   generic branch and taught the WRONG SKILL without any error.
   This engine dispatches on a stable skillId instead. Display text can never
   again change what is taught.
   ========================================================================== */
/* seed-sensitive bank pick, so the duplicate-avoidance retry in
   buildUniqueQuestionPlan can actually surface a different question */
function bp(r,a,i){return a[(i+Math.floor(r()*a.length))%a.length]}
/* ==========================================================================
   SENTENCE FACTORY
   Builds grammatically labelled sentences procedurally, so grammar skills have
   effectively unlimited supply instead of a short fixed list. Every part
   (complete subject, simple subject, predicate, prepositional phrase, object
   of the preposition) is known exactly because we assembled it.
   ========================================================================== */
const F_ADJ=["brave","weary","restless","quiet","ragged","young","watchful","silent",
 "hooded","patient","stubborn","careful","hurried","lonely","clever","tireless"];
const F_NOUN=[["scout","scouts"],["knight","knights"],["dragon","dragons"],["rider","riders"],
 ["shepherd","shepherds"],["ferryman","ferrymen"],["raven","ravens"],["mapmaker","mapmakers"],
 ["sentry","sentries"],["traveler","travelers"],["hunter","hunters"],["messenger","messengers"],
 ["climber","climbers"],["stonemason","stonemasons"],["falconer","falconers"],["healer","healers"]];
const F_VERB=[["climbed","climb","climbs","was climbing","were climbing","has climbed","have climbed"],
 ["crossed","cross","crosses","was crossing","were crossing","has crossed","have crossed"],
 ["guarded","guard","guards","was guarding","were guarding","has guarded","have guarded"],
 ["circled","circle","circles","was circling","were circling","has circled","have circled"],
 ["blocked","block","blocks","was blocking","were blocking","has blocked","have blocked"],
 ["searched","search","searches","was searching","were searching","has searched","have searched"],
 ["followed","follow","follows","was following","were following","has followed","have followed"],
 ["reached","reach","reaches","was reaching","were reaching","has reached","have reached"]];
const F_PREP=["above","beneath","beside","through","across","near","within","along","behind","beyond"];
const F_OBJ=[["the frozen river","river"],["the iron gate","gate"],["the narrow ridge","ridge"],
 ["the hidden cavern","cavern"],["the old keep","keep"],["the misty forest","forest"],
 ["the stone bridge","bridge"],["the northern pass","pass"],["the quiet valley","valley"],
 ["the crumbling wall","wall"],["the tall watchtower","watchtower"],["the dark tunnel","tunnel"]];
const F_CONJ=["and","but","so","yet","or"];

/* Build one labelled sentence. plural=true uses the plural subject. */
function makeSentence(r,plural){
  const adj=pick(r,F_ADJ), nounPair=pick(r,F_NOUN), verbSet=pick(r,F_VERB),
        prep=pick(r,F_PREP);
  let objPair=pick(r,F_OBJ), guard=0;
  while(objPair[1]===nounPair[0]&&guard++<8) objPair=pick(r,F_OBJ);
  const noun=plural?nounPair[1]:nounPair[0];
  const det=plural?"The":"The";
  const completeSubject=`${det} ${adj} ${noun}`;
  const phrase=`${prep} ${objPair[0]}`;
  const past=verbSet[0];
  const completePredicate=`${past} ${phrase}`;
  return {
    text:`${completeSubject} ${completePredicate}.`,
    completeSubject, simpleSubject:noun,
    completePredicate, simplePredicate:past,
    phrase, prepObject:objPair[1], prep,
    verbSet, plural, adj, noun
  };
}
function twoClauses(r){
  let a=makeSentence(r,false), b=makeSentence(r,false), guard=0;
  while((b.simpleSubject===a.simpleSubject||b.simplePredicate===a.simplePredicate)&&guard++<12)
    b=makeSentence(r,false);
  return [a,b];
}
/* A fragment: a subject with no predicate, or a predicate with no subject. */
function makeFragment(r){
  const s=makeSentence(r,false);
  const cap=t=>t.charAt(0).toUpperCase()+t.slice(1);
  const forms=[
    `${s.completeSubject} ${s.phrase}.`,          // no verb
    `${cap(s.completePredicate)}.`,               // no subject
    `Because ${s.completeSubject.charAt(0).toLowerCase()}${s.completeSubject.slice(1)} ${s.completePredicate}.`,
    `${s.phrase}.`                                // phrase alone
  ];
  return pick(r,forms)
}
function makeRunOn(r){
  const [a,b]=twoClauses(r);
  return `${a.text.slice(0,-1)} ${b.text.charAt(0).toLowerCase()}${b.text.slice(1)}`
}
function makeCompound(r){
  const [a,b]=twoClauses(r);
  return `${a.text.slice(0,-1)}, ${pick(r,F_CONJ)} ${b.text.charAt(0).toLowerCase()}${b.text.slice(1)}`
}

/* ---- proper-noun banks for capitalization ---- */
const C_PERSON=["Maya","Leo","Priya","Sam","Ana","Kofi","Elena","Marcus","Nina","Theo"];
const C_TITLE=["Dr.","Mrs.","Mr.","Ms.","Professor","Captain"];
const C_PLACE=["Arizona","Colorado","Lake Erie","Denver","the Rocky Mountains","Texas","Oregon",
 "the Pacific Ocean","Chicago","the Mississippi River"];
const C_MONTH=["January","March","May","July","August","September","November","December"];
const C_DAY=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const C_BOOK=["Charlotte's Web","The Hobbit","Hatchet","Wonder","Holes","The Giver"];
/* Real question content mined from the 22 NO PREP packets. */
const DW_PACKET_BANK={"similes":["After a long afternoon at football practice, I was sweating like a pig.","After a long day at school, Cooper slept like a baby.","After receiving his trophy, Chris was like a puppy with a new toy.","Beth swims like a fish in the ocean.","Emily\u2019s Halloween costume fits like a glove.","I slept like a log last night.","It sounds like we are going to my grandmother\u2019s","Jacob\u2019s swim instructor is as sweet as sugar.","My basketball coach has eyes like a hawk.","My big brother eats like a horse.","My fifth grade teacher is as sweet as sugar.","My grandfather is as fit as a fiddle.","My little sister is as silly as a goose.","My little sister was as pale as a ghost.","Our new soccer uniforms are as blue as the deepest ocean.","Our new stove works like a dream.","The boy\u2019s scream was like nails on a chalkboard.","The bus ride to school was as quick as a wink.","The classroom is like a library today.","The directions for the homework assignment were as clear as mud.","The students were as noisy as a herd of elephants in the gymnasium.","The teacher was as pleased as punch after reviewing my homework.","The wait at the doctor\u2019s office was as quick as a wink.","Valerie was as timid as a rabbit on her first day of school.","Your answer was as clear as mud.","\u201cTime moved like a snail on the first day of school,\u201d said Monica."],"metaphors":["After the dancing competition, Ethan\u2019s legs were rubber.","Emily\u2019s hair was a lion\u2019s mane.","Jeremy\u2019s backyard was a lake after the storm.","My brother\u2019s bedroom is a pig pen.","My grandfather always says that life is a rollercoaster.","My homework assignment was a breeze.","My memory is a little cloudy about that event.","Our plans for the weekend are rock solid.","Our school\u2019s dumpster is a grocery store for squirrels.","Owen\u2019s stomach is a bottomless pit.","The diving board was a hot stove.","The highway was a parking lot.","The movie theater was a refrigerator.","The news that my dad was going to help me rake the leaves was music to my ears.","The parking lot was a zoo.","The principal\u2019s office is a well-oiled machine.","The pumpkin patch was a shopping mall during the holiday season.","The singer\u2019s voice is velvet.","The television in our family room is a dinosaur.","Uncle Dave\u2019s auto shop is a well-oiled machine."],"prepositional":[{"text":"We carved pumpkins on the table.","prep":"on","phrase":"on the table","object":"table"},{"text":"We walked carefully across the street.","prep":"across","phrase":"across the street","object":"street"},{"text":"The trick-or-treater held the flashlight in his hands.","prep":"in","phrase":"in his hands","object":"hands"},{"text":"The decorations were placed around the house.","prep":"around","phrase":"around the house","object":"house"},{"text":"We baked Halloween cookies during the storm.","prep":"during","phrase":"during the storm","object":"storm"},{"text":"Our Halloween pictures hung beside the shelf.","prep":"beside","phrase":"beside the shelf","object":"shelf"},{"text":"After the last trick-or-treater, I turned off the lights.","prep":"After","phrase":"After the last trick or treater","object":"treater"},{"text":"I put the Halloween candy inside the little girl\u2019s treat bag.","prep":"inside","phrase":"inside the little girl\u2019s treat bag","object":"bag"},{"text":"We carved pumpkins on the table.","prep":"on","phrase":"on the table","object":"table"},{"text":"We walked carefully across the street.","prep":"across","phrase":"across the street","object":"street"},{"text":"The trick-or-treater held the flashlight in his hands.","prep":"in","phrase":"in his hands","object":"hands"},{"text":"The decorations were placed around the house.","prep":"around","phrase":"around the house","object":"house"},{"text":"We baked Halloween cookies during the storm.","prep":"during","phrase":"during the storm","object":"storm"},{"text":"Our Halloween pictures hung beside the shelf.","prep":"beside","phrase":"beside the shelf","object":"shelf"},{"text":"After the last trick-or-treater, I turned off the lights.","prep":"After","phrase":"After the last trick or treater","object":"treater"},{"text":"I put the Halloween candy inside the little girl\u2019s treat bag.","prep":"inside","phrase":"inside the little girl\u2019s treat bag","object":"bag"},{"text":"We put the boxes in the basement.","prep":"in","phrase":"in the basement","object":"basement"},{"text":"During the play, Jessica was a pilgrim.","prep":"During","phrase":"During the play","object":"play"},{"text":"The football was thrown above his head.","prep":"above","phrase":"above his head","object":"head"},{"text":"The drive to my grandparent\u2019s house is two hours long.","prep":"to","phrase":"to my grandparent\u2019s house is two","object":"two"},{"text":"The clean dishes were placed inside the cabinet.","prep":"inside","phrase":"inside the cabinet","object":"cabinet"},{"text":"Tim walked around the museum today.","prep":"around","phrase":"around the museum today","object":"today"},{"text":"We put the boxes in the basement.","prep":"in","phrase":"in the basement","object":"basement"},{"text":"During the play, Jessica was a pilgrim.","prep":"During","phrase":"During the play","object":"play"},{"text":"The football was thrown above his head.","prep":"above","phrase":"above his head","object":"head"},{"text":"The drive to my grandparent\u2019s house is two hours long.","prep":"to","phrase":"to my grandparent\u2019s house is two","object":"two"},{"text":"The clean dishes were placed inside the cabinet.","prep":"inside","phrase":"inside the cabinet","object":"cabinet"},{"text":"Tim walked around the museum today.","prep":"around","phrase":"around the museum today","object":"today"},{"text":"The party we threw for her was a big","prep":"for","phrase":"for her was a big","object":"big"},{"text":"During batting practice, I hit a home run.","prep":"During","phrase":"During batting practice","object":"practice"},{"text":"Paul put the wheelbarrow behind the shed.","prep":"behind","phrase":"behind the shed","object":"shed"},{"text":"Madison put the shells inside the pail.","prep":"inside","phrase":"inside the pail","object":"pail"},{"text":"We rode our bikes around the neighborhood.","prep":"around","phrase":"around the neighborhood","object":"neighborhood"},{"text":"From my bedroom window, I can see the stars.","prep":"From","phrase":"From my bedroom window","object":"window"},{"text":"The party we threw for her was a big","prep":"for","phrase":"for her was a big","object":"big"},{"text":"During batting practice, I hit a home run.","prep":"During","phrase":"During batting practice","object":"practice"},{"text":"Paul put the wheelbarrow behind the shed.","prep":"behind","phrase":"behind the shed","object":"shed"},{"text":"Madison put the shells inside the pail.","prep":"inside","phrase":"inside the pail","object":"pail"},{"text":"We rode our bikes around the neighborhood.","prep":"around","phrase":"around the neighborhood","object":"neighborhood"},{"text":"From my bedroom window, I can see the stars.","prep":"From","phrase":"From my bedroom window","object":"window"},{"text":"The children are waiting for the bus across the street.","prep":"for","phrase":"for the bus across the street","object":"street"},{"text":"We are going to have lunch after science class.","prep":"to","phrase":"to have lunch after science class","object":"class"},{"text":"Jeff and his family spent their summer vacation at a cabin","prep":"at","phrase":"at a cabin","object":"cabin"},{"text":"Please place the books on the shelf above the counter.","prep":"on","phrase":"on the shelf above the counter","object":"counter"},{"text":"Amy\u2019s backpack was beside the bookcase and it is now","prep":"beside","phrase":"beside the bookcase and it is","object":"is"},{"text":"The new boxes of crayons are in that drawer.","prep":"of","phrase":"of crayons are in that drawer","object":"drawer"},{"text":"Before we went to the library, our teacher gave us our homework","prep":"Before","phrase":"Before we went to the library","object":"library"},{"text":"Emily sat between her two best friends in the cafeteria.","prep":"in","phrase":"in the cafeteria","object":"cafeteria"},{"text":"Mrs. Henderson asked her students to not lean against the newly","prep":"to","phrase":"to not lean against the newly","object":"newly"},{"text":"The children are waiting for the bus across the street.","prep":"for","phrase":"for the bus across the street","object":"street"},{"text":"Jeff and his family spent their summer vacation at a cabin","prep":"at","phrase":"at a cabin","object":"cabin"},{"text":"Please place the books on the shelf above the counter.","prep":"on","phrase":"on the shelf above the counter","object":"counter"},{"text":"Amy\u2019s backpack was beside the bookcase and it is now","prep":"beside","phrase":"beside the bookcase and it is","object":"is"},{"text":"Before we went to the library, our teacher gave us our homework","prep":"Before","phrase":"Before we went to the library","object":"library"},{"text":"Mrs. Henderson asked her student sto not lean against the newly","prep":"against","phrase":"against the newly","object":"newly"},{"text":"My mom placed the scarecrow by the oak tree.","prep":"by","phrase":"by the oak tree","object":"tree"},{"text":"There is a great orchard near the park.","prep":"near","phrase":"near the park","object":"park"},{"text":"My family and I are going on a hayride tomorrow.","prep":"on","phrase":"on a hayride tomorrow","object":"tomorrow"},{"text":"During the football game\u2019s final minute, our team scored ten points.","prep":"During","phrase":"During the football game\u2019s final minute","object":"minute"},{"text":"The flock of birds flew over the barn on the hill.","prep":"of","phrase":"of birds flew over the barn","object":"barn"},{"text":"At the pumpkin patch, Ella and Todd sipped warm apple cider.","prep":"At","phrase":"At the pumpkin patch","object":"patch"},{"text":"Ava stood beside the pumpkin stand so her dad could take her","prep":"beside","phrase":"beside the pumpkin stand so her","object":"her"},{"text":"My mom placed the scarecrow by the oak tree.","prep":"by","phrase":"by the oak tree","object":"tree"},{"text":"There is a great orchard near the park.","prep":"near","phrase":"near the park","object":"park"},{"text":"My family and I are going on a hayride tomorrow.","prep":"on","phrase":"on a hayride tomorrow","object":"tomorrow"},{"text":"During the football game\u2019s final minute, our team scored ten points","prep":"During","phrase":"During the football game\u2019s final minute","object":"minute"},{"text":"The flock of birds flew over the barn on the hill .","prep":"of","phrase":"of birds flew over the barn","object":"barn"},{"text":"At the pumpkin patch, Ella and Todd sipped warm apple cider.","prep":"At","phrase":"At the pumpkin patch","object":"patch"},{"text":"Ava stood beside the pumpkin stand so her dad could take her","prep":"beside","phrase":"beside the pumpkin stand so her","object":"her"}],"helping":[{"text":"He is becoming a great soccer player.","aux":"is","distractors":["becoming","great","soccer"]},{"text":"The kids were playing nicely during recess.","aux":"were","distractors":["The","kids","playing"]},{"text":"Brandon had received an \u201cA\u201d on his book report.","aux":"had","distractors":["Brandon","received","his"]},{"text":"Matt and Chris are walking home from school.","aux":"are","distractors":["Matt","and","Chris"]},{"text":"My sister had wanted a new bike for her birthday.","aux":"had","distractors":["sister","wanted","new"]},{"text":"Lisa will decorate her new home with pumpkins and scarecrows.","aux":"will","distractors":["Lisa","decorate","her"]},{"text":"We have studied for our test on Monday.","aux":"have","distractors":["studied","for","our"]},{"text":"He is becoming a great soccer player.","aux":"is","distractors":["becoming","great","soccer"]},{"text":"The kids were playing nicely during recess.","aux":"were","distractors":["The","kids","playing"]},{"text":"Brandon had received an \u201cA\u201d on his book report.","aux":"had","distractors":["Brandon","received","his"]},{"text":"Matt and Chris are walking home from school.","aux":"are","distractors":["Matt","and","Chris"]},{"text":"My sister had wanted a new bike for her birthday.","aux":"had","distractors":["sister","wanted","new"]},{"text":"We have studied for our test on Monday.","aux":"have","distractors":["studied","for","our"]},{"text":"They have prepared a delicious meal forthes tudents.","aux":"have","distractors":["They","prepared","delicious"]},{"text":"Carly has studied her lines for the school play.","aux":"has","distractors":["Carly","studied","her"]},{"text":"Adam and Mark are playing footb all outside.","aux":"are","distractors":["Adam","and","Mark"]},{"text":"David had wanted a new computer for his birthday.","aux":"had","distractors":["David","wanted","new"]},{"text":"Paul and his brother are walking to the bus stop.","aux":"are","distractors":["Paul","and","his"]},{"text":"She is completing her homework assignment.","aux":"is","distractors":["She","completing","her"]},{"text":"Matt will bring his lunch to school tomorrow.","aux":"will","distractors":["Matt","bring","his"]},{"text":"Alexis was talking to her teacher about her grade on the test.","aux":"was","distractors":["Alexis","talking","her"]},{"text":"The kids were discussing their plans for the upcoming weekend.","aux":"were","distractors":["The","kids","discussing"]},{"text":"They have prepared a delicious meal forthes tudents.","aux":"have","distractors":["They","prepared","delicious"]},{"text":"Carly has studied her lines for the school play.","aux":"has","distractors":["Carly","studied","her"]},{"text":"Adam and Mark are playing footb all outside.","aux":"are","distractors":["Adam","and","Mark"]},{"text":"David had wanted a new computer for his birthday.","aux":"had","distractors":["David","wanted","new"]},{"text":"Paul and his brother are walking to the bus stop.","aux":"are","distractors":["Paul","and","his"]},{"text":"She is completing her homework assignment.","aux":"is","distractors":["She","completing","her"]},{"text":"Alexis was talking to her teacher about her grade on the test.","aux":"was","distractors":["Alexis","talking","her"]},{"text":"The kids were discussing their plans for the upcoming weekend.","aux":"were","distractors":["The","kids","discussing"]}],"dialogue":[{"quote":"I had a great day at school","verb":"said","who":"Spencer","end":",","correct":"\"I had a great day at school,\" said Spencer."},{"quote":"What is your favorite book","verb":"asked","who":"Melissa","end":"?","correct":"\"What is your favorite book?\" asked Melissa."},{"quote":"I can\u2019t find my math book","verb":"cried","who":"Lucy","end":",","correct":"\"I can\u2019t find my math book,\" cried Lucy."},{"quote":"Do you want to play soccer during recess","verb":"asked","who":"Cameron","end":"?","correct":"\"Do you want to play soccer during recess?\" asked Cameron."},{"quote":"Yes I finished my homework","verb":"replied","who":"Sam","end":",","correct":"\"Yes I finished my homework,\" replied Sam."},{"quote":"Did you enjoy art class today","verb":"asked","who":"Grandma","end":"?","correct":"\"Did you enjoy art class today?\" asked Grandma."},{"quote":"The party begins in one hour","verb":"replied","who":"Amanda","end":",","correct":"\"The party begins in one hour,\" replied Amanda."},{"quote":"Yes I mailed the Christmas cards this morning","verb":"said","who":"Ben","end":",","correct":"\"Yes I mailed the Christmas cards this morning,\" said Ben."},{"quote":"Do you want to watch a Christmas movie tonight","verb":"asked","who":"Tom","end":"?","correct":"\"Do you want to watch a Christmas movie tonight?\" asked Tom."},{"quote":"No I haven\u2019t finished wrapping presents yet","verb":"answered","who":"Kate","end":",","correct":"\"No I haven\u2019t finished wrapping presents yet,\" answered Kate."},{"quote":"Did you make this pie","verb":"asked","who":"Mike","end":"?","correct":"\"Did you make this pie?\" asked Mike."},{"quote":"Yes I can help you hang the Earth Day posters","verb":"answered","who":"Kyle","end":",","correct":"\"Yes I can help you hang the Earth Day posters,\" answered Kyle."},{"quote":"When I was young, I loved to play outside in the rain","verb":"said","who":"Brad","end":"?","correct":"\"When I was young, I loved to play outside in the rain?\" said Brad."},{"quote":"I need to replace the windshield wipers on my car","verb":"said","who":"Dad","end":",","correct":"\"I need to replace the windshield wipers on my car,\" said Dad."},{"quote":"How was the baseball game","verb":"asked","who":"Julie","end":"?","correct":"\"How was the baseball game?\" asked Julie."},{"quote":"Sure I can meet you at the skating rink at noon","verb":"replied","who":"Alex","end":",","correct":"\"Sure I can meet you at the skating rink at noon,\" replied Alex."},{"quote":"I just finished shoveling our neighbor\u2019s driveway","verb":"said","who":"Ben","end":",","correct":"\"I just finished shoveling our neighbor\u2019s driveway,\" said Ben."},{"quote":"Those bunnies hopping in the backyard are adorable","verb":"said","who":"Julia","end":",","correct":"\"Those bunnies hopping in the backyard are adorable,\" said Julia."},{"quote":"Hey I can drive you to your game this afternoon","verb":"said","who":"Ethan","end":",","correct":"\"Hey I can drive you to your game this afternoon,\" said Ethan."},{"quote":"No I do not have a zoo membership","verb":"replied","who":"Ella","end":",","correct":"\"No I do not have a zoo membership,\" replied Ella."},{"quote":"Tyler come in the house for dinner","verb":"said","who":"Ashley","end":",","correct":"\"Tyler come in the house for dinner,\" said Ashley."},{"quote":"Mason let\u2019s go to the park and play ball","verb":"said","who":"Andrew","end":",","correct":"\"Mason let\u2019s go to the park and play ball,\" said Andrew."}],"commonproper":[{"text":"My family is going to Florida in February.","proper":"Florida"},{"text":"We spent the day at the Georgia Aquarium.","proper":"Georgia"},{"text":"My mother is teaching me Spanish.","proper":"Spanish"},{"text":"Uncle Leo works at a zoo.","proper":"Leo"},{"text":"My cousin is graduating from college in June.","proper":"June"},{"text":"Aunt Susan is a talented chef.","proper":"Susan"},{"text":"My grandparents sold their home and moved to Texas.","proper":"Texas"},{"text":"Anderson\u2019s Pumpkin Patch allows its customers to pick","proper":"Pumpkin"},{"text":"My family is going to Florida in February .","proper":"Florida"},{"text":"We spent the day at the Georgia Aquarium .","proper":"Georgia"},{"text":"My mother is teaching me Spanish .","proper":"Spanish"},{"text":"Uncle Leo works at a zoo.","proper":"Leo"},{"text":"My cousin is graduating from college in June .","proper":"June"},{"text":"Aunt Susan is a talented chef.","proper":"Susan"},{"text":"My grandparents sold their home and moved to Texas .","proper":"Texas"},{"text":"Anderson\u2019s Pumpkin Patch allows its customers to pick","proper":"Pumpkin"}]};
/* 6th-grade 5-A-Day items, answers recovered by diffing the answer key. */
const DW_G6={"contextclue":[{"word":"impeccable","passage":"Impeccable was the word to describe Rosemary that evening. Her clothes were neatly pressed, and her hair was done so carefully that not a strand was out of place. Of course, she wore the latest fashion. Even her fingernails were absolutely perfect.","definition":"To have a neat, orderly appearance; perfect; flawless"},{"word":"deception","passage":"I was not looking forward to the school musical. During rehearsals, I always pretended to sing, mouthing the words with a fake smile on my face. This deception went unnoticed by my teacher for weeks, until she finally announced that she was assigning me to the lead roll!","definition":"To fake something; to pretend; to mislead or lie"},{"word":"acclaim","passage":"The play performance was going extremely well, and the audience\u2019s acclaim proved this. The cast members bowed and basked in the endless applause. There wasn\u2019t one person sitting in their seats. The play had been a great success!","definition":"To applaud; to show approval with shouts or clapping"},{"word":"efficient","passage":"Growing up on a farm, I learned how to clean stalls and feed and water the cows. No matter how hard I tried though, I was never faster or better at these jobs than my older brother. I studied his every move to learn why he was so efficient.","definition":"To complete a task with accuracy and speed; to do a good job in a short amount of time"},{"word":"rustic","passage":"Living in the city my whole life, I was used to the clean, sharp lines of skyscrapers and the cold feel of concrete. For a nice change of pace, I loved visiting my aunt in the country every summer. I loved the rustic charm of her simple home and the endless fields that surrounded it.","definition":"Country; natural; not as sophisticated or sharp; simple"},{"word":"hectic","passage":"My mother is an expert when it comes to handling our busy household. She is skilled at making great changes at a moments notice and handles many details in a calm manner. Thanks to her, our family doesn\u2019t find life to be hectic at all.","definition":"Busy; crazy; stressful; many events occurring at once"},{"word":"floundering","passage":"The storm had passed, and the sea grew calm. After hours of floundering, our small boat had survived. I never thought our little vessel would hold up to the tossing and thrashing of the unforgiving ocean.","definition":"Struggling in a helpless and/or clumsy way"},{"word":"treacherous","passage":"A day could begin with glorious sunshine, only to instantly change as a violent storm suddenly arrived. This unpredictable weather was too treacherous to go boating. One would never know what to expect once out on the water.","definition":"Unpredictable danger; hazardous"},{"word":"plethora","passage":"Countless tables held a plethora of food: salads, casseroles, bread, dips, appetizers, and drinks. The attractive spread of food made my mouth water. We were all eager to eat and enjoy the great variety of deliciousness that was set forth.","definition":"A wide variety of things; abundance; excess"},{"word":"ailment","passage":"The symptoms of my ailment had our family doctor baffled. I had a running fever and constant cough. No remedy or medicine seemed to help. After several weeks of rest, my health returned, and I was feeling like myself again.","definition":"A sickness; an illness; a disease"},{"word":"relish","passage":"Everything at the restaurant looked delicious. We ordered one of each dessert and ate them with great relish. We thoroughly enjoyed each tasty bite as if it were our very last. My favorite item was the chocolate lava cake.","definition":"The thorough enjoyment of something"},{"word":"sultry","passage":"We landed in Maui and were greeted with the warm, moist, tropical air. After spending some time in the sultry island air, it was a nice relief to cool down in our air-conditioned hotel room.","definition":"Hot and moist; sweltering"},{"word":"isolated","passage":"I studied the tiny island on my map, sitting so isolated in the middle of the ocean. I wondered how it was possible for a plane to even land on it. How was it even possible for supplies to be flown in? It is hundreds of miles from anywhere.","definition":"Alone; away from others; by itself"},{"word":"consistent","passage":"My mom always describes me as a \u201ccreature of habit.\u201d She says my daily routines are so consistent that she could tell time by what I am doing. I brush my teeth everyday at 8:05, have breakfast at 8:10, and am out the door at exactly 8:30.","definition":"To occur in a regular, predictable pattern"},{"word":"provision","passage":"My dad finally agreed to buy me a pet snake. His one provision was that the creature must never come into the house. Of course, I agreed to his request. I would have cooperated in any way to get his permission.","definition":"A condition or requirement that must be met before something will/can be done"},{"word":"competent","passage":"The surgeon performing my grandfather\u2019s operation quickly calmed our fears. He told about his training and experience with this procedure, as well as the thousands of successful operations he has completed. We knew our grandfather was in the good hands of a competent doctor.","definition":"To be qualified and skilled at something"},{"word":"anecdote","passage":"There was nothing better than listening to my grandpa tell amusing stories from his childhood. My cousins and I looked forward to this yearly tradition every summer. His most interesting anecdote was about how he raised a litter of kittens after their mother abandoned them.","definition":"A short and amusing or interesting story about a real incident or person"},{"word":"abode","passage":"My pet pig was quite happy in the outdoor abode I built him. I made sure the shelter provided protection from the sun during the day and kept him nice and warm at night. I spent many hours with him there. My sister, however, refused to visit his dwelling.","definition":"A structure where someone or something lives"},{"word":"implored","passage":"I implored my mother to let me keep the new puppy in my room that first night. He was only six weeks old, and I was afraid he might be lonely in the living room all night. At first she denied my pleas, but eventually, she agreed.","definition":"To beg over and over again with great urgency"},{"word":"relented","passage":"At first I tried to make her feel sorry for me. I appealed to her emotions in hopes that she would grant me one more chance to make up the missing assignments. It took a lot of convincing, but eventually, my teacher relented and allowed me to make up the work.","definition":"To give in to someone\u2019s wishes and/or requests"},{"word":"predicament","passage":"I had created quite a difficult predicament for myself. Because I ignored my mom\u2019s warnings about keeping my grades up, when my report card arrived she was very disappointed, to say the least. Now I am unable to use my computer or go to my best friend\u2019s birthday party.","definition":"A difficult or unpleasant situation"},{"word":"singed","passage":"Luckily, the foolish child who decided to run through the campfire was not badly burned. Her leg had been singed, however. She needed to receive some basic medical attention but is expected to make a full recovery without any scarring.","definition":"To slightly burn"},{"word":"conviction","passage":"A conviction might mean a jail sentence for the young boy. His lawyer felt that he was at heart a good boy who simply made a poor choice. He was sure that jail would do the boy far more harm than good.","definition":"To be proven or declared guilty of a crime"},{"word":"corrupt","passage":"The judge could see that the young criminal was genuinely remorseful about what she had done. Since this juvenile had no history of violence, he agreed with her lawyer that the hardened criminals in an adult prison would corrupt her.","definition":"To spoil or ruin"},{"word":"immune","passage":"Since many children receive the chicken pox vaccine when they are babies, they are immune to the virus. Children who have not been vaccinated are not protected and do risk the chance of catching the illness.","definition":"To be safe from catching an illness or disease"},{"word":"inoculated","passage":"After they had been inoculated with the virus serum, they would contract a very mild form of the disease. As a result, they would not suffer from the more dangerous form of the illness. This medical discovery prevented many serious diseases from spreading further.","definition":"To protect a person from a disease by exposing them to a form of it"},{"word":"loathed","passage":"My dad was not particularly fond of cats; in fact, he loathed them. Their smelly litter boxes disgusted him, and he detested their clawing at the furniture. If I am ever to have a pet cat, it will be when I live on my own as an adult.","definition":"To really hate something; to detest; a strong form of hate"},{"word":"epidemic","passage":"To prevent an epidemic of the flu, health care workers advise that people take important measures to stay healthy. To keep illness from spreading it\u2019s important to wash your hands through out the day and avoid touching your eyes, nose, or mouth.","definition":"When an illness spreads to many people"},{"word":"indulged","passage":"Since it was her birthday, she indulged in her love for chocolate cake. She doesn\u2019t eat sweets very often, and although she loves chocolate cake, she rarely gives into her cravings. This was a special occasion indeed!","definition":"To give into or satisfy a craving"},{"word":"controversy","passage":"All the parents agreed that a new school was needed, but there was quite a controversy about the cost. Some parents argued that a swimming pool was unnecessary and would cost too much money. Others replied that a pool would benefit the whole community, not just the school.","definition":"A topic or issue that people have drastically different opinions on"}],"spelling":[{"options":["acceptible","acquit","refine"],"correct":"acceptable","misspelled":"acceptible"},{"options":["casual","render","beleive"],"correct":"believe","misspelled":"casual"},{"options":["resourceful","definitly","exercise"],"correct":"definitely","misspelled":"resourceful"},{"options":["judgmental","changable","crucial"],"correct":"changeable","misspelled":"judgmental"},{"options":["excede","impede","modest"],"correct":"exceed","misspelled":"excede"},{"options":["recreation","retort","catagory"],"correct":"category","misspelled":"recreation"},{"options":["greatful","commend","generate"],"correct":"grateful","misspelled":"greatful"},{"options":["several","insist","foriegn"],"correct":"foreign","misspelled":"several"},{"options":["respective","accidentaly","corrode"],"correct":"accidentally","misspelled":"respective"},{"options":["calender","exception","remain"],"correct":"calendar","misspelled":"calender"},{"options":["royalty","traditional","ignorence"],"correct":"ignorance","misspelled":"royalty"},{"options":["bibliography","maintainence","conductor"],"correct":"maintenance","misspelled":"bibliography"},{"options":["possesion","remember","application"],"correct":"possession","misspelled":"possesion"},{"options":["vacume","flourish","generous"],"correct":"vacuum","misspelled":"vacume"},{"options":["schedule","syllable","resturant"],"correct":"restaurant","misspelled":"schedule"},{"options":["beginning","acheive","basically"],"correct":"achieve","misspelled":"beginning"},{"options":["amature","professional","claim"],"correct":"amateur","misspelled":"amature"},{"options":["reside","rehearsal","cemetary"],"correct":"cemetery","misspelled":"reside"},{"options":["mispell","rebound","fracture"],"correct":"misspell","misspelled":"mispell"},{"options":["supreme","disipline","fashionable"],"correct":"discipline","misspelled":"supreme"},{"options":["arguement","possible","friendly"],"correct":"argument","misspelled":"arguement"},{"options":["pretend","rearrange","embarass"],"correct":"embarrass","misspelled":"pretend"},{"options":["perhaps","firey","sentence"],"correct":"fiery","misspelled":"perhaps"},{"options":["harrass","equipment","nourish"],"correct":"harass","misspelled":"harrass"},{"options":["deliberate","libary","flustered"],"correct":"library","misspelled":"deliberate"},{"options":["choreography","pliers","manuver"],"correct":"maneuver","misspelled":"choreography"},{"options":["responsible","noticable","retractable"],"correct":"noticeable","misspelled":"responsible"},{"options":["privlige","fester","infection"],"correct":"privilege","misspelled":"privlige"},{"options":["perspective","reciept","favorite"],"correct":"receipt","misspelled":"perspective"},{"options":["resistance","founder","seperate"],"correct":"separate","misspelled":"resistance"},{"options":["kernel","sargent","preventative"],"correct":"sergeant","misspelled":"kernel"},{"options":["twelth","fictitious","evade"],"correct":"twelfth","misspelled":"twelth"},{"options":["refrigerator","persuade","relevent"],"correct":"relevant","misspelled":"refrigerator"},{"options":["occasionaly","persistent","famous"],"correct":"occasionally","misspelled":"occasionaly"},{"options":["constitution","nieghbor","embark"],"correct":"neighbor","misspelled":"constitution"},{"options":["pasttime","commander","experiment"],"correct":"pastime","misspelled":"pasttime"}],"intensive":[{"sentence":"She baked the cake for my birthday .","answer":"herself"},{"sentence":"The judge selected the winner .","answer":"himself"},{"sentence":"The parrot opened its cage door and flew away.","answer":"itself"},{"sentence":"We have to pack our lunches .","answer":"ourselves"},{"sentence":"The president came to visit after the storm.","answer":"himself"},{"sentence":"The team planned the trip .","answer":"themselves"},{"sentence":"All of you will need to raise the money .","answer":"yourselves"},{"sentence":"They recommend the movie although they haven\u2019t seen it .","answer":"themselves"},{"sentence":"You don\u2019t need to help her because she can do it .","answer":"herself"},{"sentence":"You can only be a witness if you have seen the crime.","answer":"yourself"},{"sentence":"Well look who just arrived; it\u2019s the Queen of England .","answer":"herself"},{"sentence":"He restored the 1964 Mustang .","answer":"himself"},{"sentence":"My mom let us choose the restaurant for lunch .","answer":"ourselves"},{"sentence":"I found it difficult to believe .","answer":"myself"},{"sentence":"The earthquake was devastating, not to mention the fires that followed.","answer":"itself"},{"sentence":"The coach wasn\u2019t great, but the team members were amazing.","answer":"themselves"},{"sentence":"Can all of you please clean up the classroom ?","answer":"yourselves"},{"sentence":"I couldn\u2019t be more pleased with the results.","answer":"myself"},{"sentence":"Diana found the story difficult to believe .","answer":"herself"},{"sentence":"The judges selected the winners.","answer":"themselves"},{"sentence":"We finished the huge puzzle .","answer":"ourselves"},{"sentence":"I am going right to bed when I get home.","answer":"myself"},{"sentence":"He wanted to see the Grand Canyon .","answer":"himself"},{"sentence":"The cat climbed the telephone pole .","answer":"itself"},{"sentence":"They completed all of the chores.","answer":"themselves"},{"sentence":"If we are late to dinner, we will have to cook.","answer":"ourselves"},{"sentence":"That is something that you will need to decide.","answer":"yourself"},{"sentence":"I am not sure that I am going to the party .","answer":"myself"},{"sentence":"The puppies learned to roll over .","answer":"themselves"},{"sentence":"We painted our neighbor\u2019s fence.","answer":"ourselves"},{"sentence":"She needed a moment to catch her breath .","answer":"herself"},{"sentence":"The players are the reason why fans come to watch the games.","answer":"themselves"},{"sentence":"My father planned the party and ordered the food.","answer":"himself"}],"roots6":[{"root":"ab","meaning":"away from","words":["abstract","abrasion","abstain","absent","abnormal"]},{"root":"anti","meaning":"against, opposed to, preventati","words":["antibiotics","antagonist","anticlimactic","antithesis","antidote"]},{"root":"calc","meaning":"stone","words":["descale","calcium","calculate","calcite","calcify"]},{"root":"astr","meaning":"star, star","words":["asterisk","asteroid","asteria","astrology","astronomy"]},{"root":"cand","meaning":"glowing, iridescent","words":["candor","candle","candidate","incandescent","candelabra"]},{"root":"auto","meaning":"self","words":["autograph","automobile","autopilot","autonomy","autobiography"]},{"root":"chrom","meaning":"color","words":["monochrome","chromatic","chromium","chromosome","chromatography"]},{"root":"cogn","meaning":"to know","words":["incognito","recognize","cognition","cognizant","cognitive"]},{"root":"circum","meaning":"around","words":["circle","circumference","circa","circuit","circumnavigate"]},{"root":"con","meaning":"with, together","words":["connotation","connect","contain","commence","compress"]},{"root":"iso","meaning":"equal, the same","words":["isosceles","isogon","isotope","isometric","isobar"]},{"root":"mon","meaning":"to warn","words":["admonish","premonition","summon","monster","monument"]},{"root":"inter","meaning":"among, between","words":["intergalactic","intermission","intersection","interpersonal","interplanetary"]},{"root":"cruc","meaning":"cross","words":["crux","crucifix","excruciating","crucify","crucial"]},{"root":"hosp","meaning":"guest","words":["hostel","hospital","hospice","inhospitable","hospitality"]},{"root":"duct","meaning":"lead","words":["reduce","aqueduct","production","deduce","introduce"]},{"root":"gran","meaning":"grain","words":["granary","granola","granulated","granule","granite"]},{"root":"form","meaning":"to shape","words":["formula","formation","reform","deform","conform"]},{"root":"ject","meaning":"to cast or throw","words":["interject","reject","deject","inject","trajectory"]},{"root":"phon","meaning":"sound","words":["phonograph","phone","phonics","microphone","homophone"]},{"root":"labor","meaning":"to work","words":["laboratory","labor","belabor","elaborate","collaborate"]},{"root":"peri","meaning":"around","words":["peripheral","perimeter","period","periscope","perennial"]},{"root":"liber","meaning":"free","words":["deliberate","liberate","liberty","liberal","deliver"]},{"root":"morph","meaning":"to form or shape","words":["geomorphic","metaphoric","morphology","morphine","morph"]},{"root":"log","meaning":"thought, word, speech","words":["analogue","logic","logistics","dialogue","monologue"]},{"root":"min","meaning":"less, smaller","words":["minute","miniature","diminish","diminutive","minimize"]},{"root":"man","meaning":"to stay","words":["mandate","permanent","mandatory","adamant","immanent"]},{"root":"sol","meaning":"alone, lonely","words":["solitary","desolate","absolute","solo","isolate"]},{"root":"ortho","meaning":"straight","words":["orthotics","orthodontist","orthopedic","orthodox","orthography"]},{"root":"struct","meaning":"to make or build","words":["instruct","construct","destruct","structure","construe"]},{"root":"prim","meaning":"first","words":["primate","primer","prime","primary","primitive"]},{"root":"temp","meaning":"time","words":["contemporary","temporary","tempo","temporal","extempore"]},{"root":"sta","meaning":"to stand","words":["status","stable","station","statue","state"]},{"root":"typ","meaning":"stamp, model","words":["typewriter","prototype","archetype","typical","atypical"]},{"root":"syn","meaning":"with","words":["sympathy","synchronize","sync","symbol","symptoms"]},{"root":"leg","meaning":"law","words":["illegal","legal","legalize","legislate","legitimate"]}]};
const DW_SKILLS={
 "curric.morph":["Word Mission","curricmorph",{}],
 "curric.vocab":["Lesson Vocabulary","curricvocab",{}],
 "ela.abbreviations":["Abbreviations","abbreviations",{}],
 "ela.abcorder":["ABC Order","abcorder",{}],
 "ela.addresses":["Formatting Addresses","capitalization",{"kind":"address"}],
 "ela.analogies":["Analogies","analogy",{"kind":"any"}],
 "ela.analogies.connection":["Analogies: Identifying the Connection","analogy",{"kind":"connection"}],
 "ela.analogies.part":["Part to Whole Analogies","analogy",{"kind":"part"}],
 "ela.analogies.pattern":["Word Pattern Analogies","analogy",{"kind":"pattern"}],
 "ela.analogies.synant":["Synonym and Antonym Analogies","analogy",{"kind":"synant"}],
 "ela.antonyms":["Antonyms","wordrel",{"rel":"antonym"}],
 "ela.antonyms.context":["Finding Antonyms in Context","wordcontext",{"rel":"antonym"}],
 "ela.articles":["Articles","articles",{}],
 "ela.capitalization":["Capitalization","capitalization",{"kind":"any"}],
 "ela.capitalization.tf":["Capitalization: True or False","capitalization",{"kind":"any"}],
 "ela.capitalization.titles":["Formatting and Capitalizing Titles","capitalization",{"kind":"titles"}],
 "ela.character":["Showing Character Emotions and Traits","composition",{"kind":"character"}],
 "ela.commas":["Commas","commas",{}],
 "ela.conj.coordinating":["Coordinating Conjunctions","conjunctions",{"kind":"coordinating"}],
 "ela.conj.spincoord":["Spin a Coordinating Conjunction","conjunctions",{"kind":"coordinating"}],
 "ela.conj.subordinating":["Subordinating Conjunctions","conjunctions",{"kind":"subordinating"}],
 "ela.conj.usingcoord":["Using Coordinating Conjunctions","conjunctions",{"kind":"coordinating"}],
 "ela.conj.usingsub":["Using Subordinating Conjunctions","conjunctions",{"kind":"subordinating"}],
 "ela.conjunctions":["Conjunctions","conjunctions",{"kind":"any"}],
 "ela.connotation":["Positive and Negative Connotation","connotation",{}],
 "ela.contractions":["Contractions","contractions",{"kind":"any"}],
 "ela.contractions.not":["Contractions with Not","contractions",{"kind":"not"}],
 "ela.contractions.pronoun":["Pronoun-Verb Contractions","contractions",{"kind":"pronoun"}],
 "ela.descriptive":["Using Descriptive Words","shades",{}],
 "ela.dialogue":["Punctuating Dialogue","dialogue",{}],
 "ela.dictionary":["Dictionary Search","guidewords",{}],
 "ela.editing":["Sentence Editing","usage",{}],
 "ela.fig.adage":["Adages","figurative",{"kind":"adage"}],
 "ela.fig.alliteration":["Alliteration","figurative",{"kind":"alliteration"}],
 "ela.fig.hyperbole":["Hyperboles","figurative",{"kind":"hyperbole"}],
 "ela.fig.idiom":["Idioms","figurative",{"kind":"idiom"}],
 "ela.fig.idiomadage":["Idioms and Adages","figurative",{"kind":"idiom"}],
 "ela.fig.metaphor":["Metaphors","figurative",{"kind":"metaphor"}],
 "ela.fig.onomatopoeia":["Onomatopoeia","figurative",{"kind":"onomatopoeia"}],
 "ela.fig.personhyper":["Personification or Hyperbole?","figurative",{"kind":"personhyper"}],
 "ela.fig.personification":["Personification","figurative",{"kind":"personification"}],
 "ela.fig.simile":["Similes","figurative",{"kind":"simile"}],
 "ela.fig.similemetaphor":["Similes and Metaphors","figurative",{"kind":"similemetaphor"}],
 "ela.genres":["Genres","composition",{"kind":"genre"}],
 "ela.guidewords":["Guide Words","guidewords",{}],
 "ela.homographs":["Homographs","homograph",{}],
 "ela.homophones":["Homophones","homophone",{}],
 "ela.homophones.using":["Using Homophones","homophone",{}],
 "ela.meaning":["Determining the Meaning of Words","wordcontext",{"rel":"meaning"}],
 "ela.mod.adjadv":["Adjectives and Adverbs","modifiers",{"kind":"adjadv"}],
 "ela.mod.comparative":["Comparative Adjectives","modifiers",{"kind":"comparative"}],
 "ela.mod.compsuper":["Comparative and Superlative Adjectives","modifiers",{"kind":"compsuper"}],
 "ela.mod.compsuperadv":["Comparative and Superlative Adverbs","modifiers",{"kind":"compsuperadv"}],
 "ela.mod.ordering":["Ordering Adjectives","modifiers",{"kind":"ordering"}],
 "ela.mod.relativeadv":["Using Relative Adverbs","modifiers",{"kind":"relativeadv"}],
 "ela.mod.spinrelativeadv":["Spin a Relative Adverb","modifiers",{"kind":"relativeadv"}],
 "ela.mod.superlative":["Superlative Adjectives","modifiers",{"kind":"superlative"}],
 "ela.mod.which":["Adjective or Adverb","modifiers",{"kind":"adjadv"}],
 "ela.multimeaning":["Multiple-Meaning Words","homograph",{}],
 "ela.nouns.concrete":["Concrete and Abstract Nouns","nounsconcrete",{}],
 "ela.nouns.plural":["Plural Nouns","nounsplural",{}],
 "ela.nouns.possessive":["Plural and Possessive Nouns","nounspossessive",{}],
 "ela.opinion":["Giving Reasons to Support an Opinion","composition",{"kind":"opinion"}],
 "ela.pk.alphabetical_order":["Alphabetical Order","abcorder",{}],
 "ela.pk.capitalizing_titles":["Capitalizing Titles","capitalization",{"kind":"titles"}],
 "ela.pk.choosing_between_the_past_and_past_perfect_ten":["Choosing Between the Past and Past Perfect Tense","tenseshift",{}],
 "ela.pk.choosing_the_best_transition":["Choosing the Best Transition","transitions",{}],
 "ela.pk.combining_sentences":["Combining Sentences","sentencecraft",{}],
 "ela.pk.commas_direct_address_and_tag":["Commas Direct Address and Tag","commas",{}],
 "ela.pk.commas_in_a_series":["Commas in a Series","commas",{}],
 "ela.pk.commas_with_direct_addresses":["Commas with Direct Addresses","commas",{}],
 "ela.pk.common_and_proper_nouns":["Common and Proper Nouns","commonproper",{}],
 "ela.pk.commonly_confused_verbs_rise_raise_lie_lay_sit":["Commonly Confused Verbs: Rise/Raise, Lie/Lay, Sit/Set","confusedwords",{}],
 "ela.pk.comparing_and_contrasting":["Comparing and Contrasting","comparecontrast",{}],
 "ela.pk.compound_subjects_and_objects":["Compound Subjects and Objects","subjpred",{"kind":"compound"}],
 "ela.pk.conjunctions_prepositions_and_interjections":["Conjunctions, Prepositions and Interjections","partsofspeech",{}],
 "ela.pk.context_clues":["Context Clues","wordcontext",{"rel":"meaning"}],
 "ela.pk.correcting_capitalization_errors":["Correcting Capitalization Errors","capitalization",{"kind":"any"}],
 "ela.pk.correcting_errors_with_frequently_confused_wor":["Correcting Errors with Frequently Confused Words","confusedwords",{}],
 "ela.pk.correcting_errors_with_signs":["Correcting Errors with Signs","usage",{}],
 "ela.pk.correcting_inappropriate_shifts_in_verb_tense":["Correcting Inappropriate Shifts in Verb Tense","tenseshift",{}],
 "ela.pk.correlative_conjunctions":["Correlative Conjunctions","correlative",{}],
 "ela.pk.declarative_interrogative_imperative_and_excla":["Declarative, Interrogative, Imperative and Exclamatory Sentences","sentencetypes",{}],
 "ela.pk.determining_the_meaning_of_idioms":["Determining the Meaning of Idioms","figurative",{"kind":"idiom"}],
 "ela.pk.determining_the_meanings_of_greek":["Determining the Meanings of Greek","roots",{}],
 "ela.pk.determining_the_meanings_of_words_with_affixes":["Determining the Meanings of Words with Affixes","wordcontext",{"rel":"meaning"}],
 "ela.pk.dictionary_definitions":["Dictionary Definitions","guidewords",{}],
 "ela.pk.elements_of_poetry":["Elements of Poetry","poetryelements",{}],
 "ela.pk.expanding_sentences":["Expanding Sentences","sentencecraft",{}],
 "ela.pk.facts_and_opinions":["Facts and Opinions","factopinion",{}],
 "ela.pk.figurative_language":["Figurative Language","figurative",{"kind":"similemetaphor"}],
 "ela.pk.filling_in_the_missing_correlative_conjunction":["Filling in the Missing Correlative Conjunctions","correlative",{}],
 "ela.pk.finding_synonyms_in_context":["Finding Synonyms in Context","wordcontext",{"rel":"antonym"}],
 "ela.pk.formal_writing":["Formal Writing","register",{}],
 "ela.pk.formatting_street_addresses":["Formatting Street Addresses","capitalization",{"kind":"address"}],
 "ela.pk.forming_and_using_the_irregular_past_tense":["Forming and Using the Irregular Past Tense","verbs",{"kind":"irregular"}],
 "ela.pk.forming_and_using_the_perfect_verb_tenses":["Forming and Using the Perfect Verb Tenses","perfecttense",{}],
 "ela.pk.forming_plurals_of_nouns_ending_in_y_and_f":["Forming Plurals of Nouns Ending in -y and -f","nounsplural",{}],
 "ela.pk.forming_the_perfect_verb_tenses":["Forming the Perfect Verb Tenses","perfecttense",{}],
 "ela.pk.greek_and_latin_roots":["Greek and Latin Roots","roots",{}],
 "ela.pk.identifying_dependent_clauses":["Identifying Dependent Clauses","clauses",{}],
 "ela.pk.identifying_independent_clauses":["Identifying Independent Clauses","clauses",{}],
 "ela.pk.identifying_main_and_helping_verbs":["Identifying Main and Helping Verbs","verbs",{"kind":"helping"}],
 "ela.pk.identifying_prepositions":["Identifying Prepositions","prepositions",{"kind":"identify"}],
 "ela.pk.identifying_relative_pronouns":["Identifying Relative Pronouns","pronouns",{"kind":"relative"}],
 "ela.pk.identifying_subordinating_conjunctions":["Identifying Subordinating Conjunctions","conjunctions",{"kind":"subordinating"}],
 "ela.pk.identifying_the_complete_subject_and_predicate":["Identifying the Complete Subject and Predicate","subjpred",{"kind":"simple"}],
 "ela.pk.identifying_the_meanings_of_word_parts":["Identifying the Meanings of Word Parts","wordcontext",{"rel":"meaning"}],
 "ela.pk.informal_writing":["Informal Writing","register",{}],
 "ela.pk.interjections":["Interjections","interjections",{}],
 "ela.pk.part_to_whole_and_whole_to_part_analogies":["Part to Whole and Whole to Part Analogies","analogy",{"kind":"part"}],
 "ela.pk.parts_of_speech":["Parts of Speech","partsofspeech",{}],
 "ela.pk.perfect_verb_tenses":["Perfect Verb Tenses","perfecttense",{}],
 "ela.pk.perimeter_with_decimal_side_lengths":["Perimeter with Decimal Side Lengths","perimeterfrac",{}],
 "ela.pk.perimeter_with_fractional_side_lengths":["Perimeter with Fractional Side Lengths","perimeterfrac",{}],
 "ela.pk.personal_possessive_reflexive_and_relative_pro":["Personal, Possessive, Reflexive and Relative Pronouns","pronouns",{"kind":"types"}],
 "ela.pk.possessive_nouns":["Possessive Nouns","nounspossessive",{}],
 "ela.pk.preposition_or_adverb":["Preposition or Adverb","prepadverb",{}],
 "ela.pk.prepositional_poem":["Prepositional Poem","poetry",{"kind":"form"}],
 "ela.pk.reducing_sentences":["Reducing Sentences","sentencecraft",{}],
 "ela.pk.simile_or_metaphor":["Simile or Metaphor","figurative",{"kind":"similemetaphor"}],
 "ela.pk.simple_compound_and_complex_sentences":["Simple Compound and Complex Sentences","sentence",{"kind":"simplecompound"}],
 "ela.pk.sorting_words_by_shared_greek":["Sorting Words by Shared Greek","roots",{}],
 "ela.pk.subject_and_object_pronouns":["Subject and Object Pronouns","pronouns",{"kind":"subjobj"}],
 "ela.pk.synonyms_and_antonyms":["Synonyms and Antonyms","wordrel",{"rel":"mixed"}],
 "ela.pk.text_structures":["Text Structures","textstructure",{}],
 "ela.pk.using_a_thesaurus":["Using a Thesaurus","reference",{}],
 "ela.pk.using_adjectives_with_more_or_most":["Using Adjectives with More or Most","modifiers",{"kind":"compsuper"}],
 "ela.pk.using_alliteration_in_acrostic_poems":["Using Alliteration in Acrostic Poems","poetry",{"kind":"form"}],
 "ela.pk.using_relative_pronouns":["Using Relative Pronouns","pronouns",{"kind":"relative"}],
 "ela.pk.using_the_correct_frequently_confused_word":["Using the Correct Frequently Confused Word","confusedwords",{}],
 "ela.pk.using_the_correct_pair_of_correlative_conjunct":["Using the Correct Pair of Correlative Conjunctions","correlative",{}],
 "ela.pk.using_the_meanings_of_words_as_clues":["Using the Meanings of Words as Clues","wordcontext",{"rel":"meaning"}],
 "ela.pk.using_the_perfect_verb_tenses":["Using the Perfect Verb Tenses","perfecttense",{}],
 "ela.pk.using_the_progressive_verb_tenses":["Using the Progressive Verb Tenses","verbs",{"kind":"progressive"}],
 "ela.pk.using_thesaurus_entries":["Using Thesaurus Entries","reference",{}],
 "ela.pk.using_words_as_clues_to_meaning":["Using Words as Clues to Meaning","wordcontext",{"rel":"meaning"}],
 "ela.pk.words_with_able_and_ible":["Words with -able and -ible","affix",{"kind":"auto"}],
 "ela.pk.words_with_less":["Words with Less","affix",{"kind":"auto"}],
 "ela.pk.words_with_un_dis_in_im_and_non":["Words with un-, dis-, in-, im- and non-","affix",{"kind":"auto"}],
 "ela.pk.wordswithful":["Wordswithful","affix",{"kind":"auto"}],
 "ela.pk.wordswithm_is":["Wordswithm Is","affix",{"kind":"auto"}],
 "ela.pk.wordswithpre":["Wordswithpre","affix",{"kind":"auto"}],
 "ela.pk.wordswithre":["Wordswithre","affix",{"kind":"auto"}],
 "ela.pk.wordswithsub":["Wordswithsub","affix",{"kind":"auto"}],
 "ela.pk.writing_a_limerick":["Writing a Limerick","poetry",{"kind":"form"}],
 "ela.pk.writing_sentences_with_correlative":["Writing Sentences with Correlative","correlative",{}],
 "ela.pk.writing_sentences_with_interjections":["Writing Sentences with Interjections","interjections",{}],
 "ela.poetry.cinquain":["Cinquain Poem","poetry",{"kind":"cinquain"}],
 "ela.poetry.haiku":["Haiku Poem","poetry",{"kind":"haiku"}],
 "ela.pov":["Point of View","composition",{"kind":"pov"}],
 "ela.prefixes":["Prefixes","affix",{"kind":"prefix"}],
 "ela.prepositions":["Prepositions","prepositions",{"kind":"identify"}],
 "ela.prepositions.forming":["Forming Prepositional Phrases","prepositions",{"kind":"phrase"}],
 "ela.prepositions.objects":["Prepositions and Their Objects","prepositions",{"kind":"object"}],
 "ela.prepositions.phrases":["Prepositional Phrases","prepositions",{"kind":"phrase"}],
 "ela.pronouns.relative":["Relative Pronouns","pronouns",{"kind":"relative"}],
 "ela.pronouns.types":["Personal, Possessive, and Reflexive Pronouns","pronouns",{"kind":"types"}],
 "ela.pronouns.whowhom":["Who or Whom","pronouns",{"kind":"whowhom"}],
 "ela.purpose":["Identifying the Purpose of a Text","composition",{"kind":"purpose"}],
 "ela.reference":["Reference Materials","reference",{}],
 "ela.register":["Formal Versus Informal English","register",{}],
 "ela.relatedwords":["Related Words","relatedwords",{}],
 "ela.roots":["Greek and Latin Root Words","roots",{"mode":"meaning"}],
 "ela.roots.clues":["Using Greek and Latin Roots as Clues","roots",{"mode":"meaning"}],
 "ela.roots.define":["Identifying and Defining Greek and Latin Roots","roots",{"mode":"meaning"}],
 "ela.roots.form":["Forming Words with Greek and Latin Roots","roots",{"mode":"match"}],
 "ela.roots.match":["Matching Words with Greek and Latin Roots","roots",{"mode":"match"}],
 "ela.roots.sort":["Sorting Words by Greek or Latin Roots","roots",{"mode":"match"}],
 "ela.sent.completepredicate":["Identifying the Complete Predicate","subjpred",{"kind":"predicate"}],
 "ela.sent.completesubject":["Identifying the Complete Subject","subjpred",{"kind":"subject"}],
 "ela.sent.compound":["Compound Sentences","sentence",{"kind":"compound"}],
 "ela.sent.compoundsubj":["Compound Subjects and Objects","subjpred",{"kind":"compound"}],
 "ela.sent.createcompound":["Creating Compound Sentences","sentence",{"kind":"compound"}],
 "ela.sent.fixfragment":["Find and Fix the Sentence Fragments","sentence",{"kind":"fragment"}],
 "ela.sent.fixrunon":["Fix the Run-On Sentences","sentence",{"kind":"runon"}],
 "ela.sent.fragment":["Complete Sentence or Fragment","sentence",{"kind":"fragment"}],
 "ela.sent.runon":["Complete Sentence or Run-On","sentence",{"kind":"runon"}],
 "ela.sent.simplecompound":["Simple and Compound Sentences","sentence",{"kind":"simplecompound"}],
 "ela.sent.simplesubjpred":["Identifying the Simple Subject and Predicate","subjpred",{"kind":"simple"}],
 "ela.sent.subjpred":["Subjects and Predicates","subjpred",{"kind":"both"}],
 "ela.sent.three":["Complete Sentence, Fragment, or Run-On?","sentence",{"kind":"three"}],
 "ela.sentencewriting":["Sentence Writing","writing",{"kind":"any"}],
 "ela.shades":["Shades of Meaning","shades",{}],
 "ela.suffixes":["Suffixes","affix",{"kind":"suffix"}],
 "ela.suffixes.sort":["Sorting Words with Shared Suffixes","affix",{"kind":"suffix"}],
 "ela.supporting":["Topic and Supporting Sentences","composition",{"kind":"support"}],
 "ela.synonyms":["Synonyms","wordrel",{"rel":"synonym"}],
 "ela.thesaurus":["Thesaurus Search","reference",{}],
 "ela.timeorder":["Identifying Time-Order Words","timeorder",{}],
 "ela.timeorder.using":["Using Time-Order Words","timeorder",{}],
 "ela.topicsentence":["Topic Sentences","composition",{"kind":"topic"}],
 "ela.transitions":["Transitions","transitions",{}],
 "ela.usage":["Usage Errors","usage",{}],
 "ela.usage.correct":["Identifying and Correcting Errors","usage",{}],
 "ela.usage.verbs":["Identifying and Correcting Errors with Verbs","usage",{}],
 "ela.verbs.agreement":["Using the Correct Subject or Verb","verbs",{"kind":"agreement"}],
 "ela.verbs.formprogressive":["Forming Progressive Verb Tenses","verbs",{"kind":"progressive"}],
 "ela.verbs.helping":["Main and Helping Verbs","verbs",{"kind":"helping"}],
 "ela.verbs.irregular":["Irregular Past Tense Verbs","verbs",{"kind":"irregular"}],
 "ela.verbs.modal":["Modal Verbs","verbs",{"kind":"modal"}],
 "ela.verbs.progressive":["Progressive Verb Tenses","verbs",{"kind":"progressive"}],
 "ela.verbs.tobe":["Present and Past Tense Forms of To Be","verbs",{"kind":"tobe"}],
 "ela.verbs.usingmodal":["Using Modal Verbs","verbs",{"kind":"modal"}],
 "ela.wordanalysis":["Word Analysis","roots",{"mode":"meaning"}],
 "ela.wordrel.mixed":["Synonyms, Antonyms, and Homophones","wordrel",{"rel":"mixed"}],
 "ela.writing":["Writing","writing",{"kind":"any"}],
 "g6.contextclue":["Use Context Clues (L.6.4a)","g6contextclue",{}],
 "g6.intensive":["Intensive Pronouns (L.6.1b)","g6intensive",{}],
 "g6.roots":["Greek & Latin Roots (L.6.4b)","g6roots",{}],
 "g6.spelling":["Spell Correctly (L.6.2b)","g6spelling",{}],
 "math.add.4":["Four-Digit Addition","addsub",{"op":"+","digits":4}],
 "math.add.5":["Five-Digit Addition","addsub",{"op":"+","digits":5}],
 "math.add.6":["Six-Digit Addition","addsub",{"op":"+","digits":6}],
 "math.add.7":["Seven-Digit Addition","addsub",{"op":"+","digits":7}],
 "math.add.multi":["Multi-Digit Addition","addsub",{"op":"+","digits":5}],
 "math.addsub.mixed":["Adding and Subtracting","addsub",{"op":"mix","digits":4}],
 "math.angle.adjacent":["Adjacent Angles","angleadjacent",{}],
 "math.angle.draw":["Drawing Angles with a Protractor","angletype",{}],
 "math.angle.estimate":["Estimate Angle Measurements","angletype",{}],
 "math.angle.measure":["Measuring Angles with a Protractor","angletype",{}],
 "math.angle.turns":["Angles of 90, 180, 270, and 360 Degrees","angleturns",{}],
 "math.area":["Area","arearect",{"mode":"area"}],
 "math.area.compare":["Comparing the Area of Two Figures","areacompare",{"mode":"area"}],
 "math.area.missing":["Finding the Area and the Missing Side","areamissing",{}],
 "math.area.relationship":["Relationship Between Area and Perimeter","arearelation",{}],
 "math.area.using":["Using Area and Perimeter","arearelation",{}],
 "math.choose.decimal":["Choosing Decimal Numbers with a Particular Sum","choosenum",{"kind":"decimal"}],
 "math.choose.sum":["Choosing Numbers with a Particular Sum","choosenum",{"kind":"whole"}],
 "math.choose.two":["Choosing Two Numbers","choosenum",{"kind":"whole"}],
 "math.compare.whole":["Comparing Numbers","comparenum",{"kind":"whole"}],
 "math.coordinate":["Coordinate Plane","coordinate",{}],
 "math.dec.add":["Adding Decimal Numbers","decaddsub",{"op":"+"}],
 "math.dec.compare":["Comparing Decimal Numbers","comparenum",{"kind":"decimal"}],
 "math.dec.expanded":["Writing Decimals in Expanded Form","decexpanded",{}],
 "math.dec.inequal":["Decimals-Inequalities with Decimals","comparenum",{"kind":"decimal"}],
 "math.dec.maze":["Decimal Number Maze","decaddsub",{"op":"mix"}],
 "math.dec.order":["Ordering Decimals","decorder",{}],
 "math.dec.sub":["Subtracting Decimal Numbers","decaddsub",{"op":"-"}],
 "math.dec.wordform":["Writing Decimals in Word Form","decwordform",{}],
 "math.div.3":["Dividing Three-Digit Numbers","divide",{"digits":3,"rem":false}],
 "math.div.4":["Dividing Four-Digit Numbers","divide",{"digits":4,"rem":false}],
 "math.div.basic":["Division","divide",{"digits":2,"rem":false}],
 "math.div.rem":["Division with Remainders","divide",{"digits":3,"rem":true}],
 "math.div.spin":["Spin and Divide","divide",{"digits":2,"rem":true}],
 "math.equations":["Completing Equations","equations",{}],
 "math.equations.twovar":["Writing Two-Variable Equations","equations",{"twovar":true}],
 "math.est.differences":["Estimating Differences","estimate",{"op":"-"}],
 "math.est.products":["Estimating Products","estimate",{"op":"*"}],
 "math.est.quotients":["Estimating Quotients","estimate",{"op":"/"}],
 "math.est.sums":["Estimating Sums","estimate",{"op":"+"}],
 "math.factors":["Factors","factors",{}],
 "math.factors.missing":["Missing Factors","missingfactor",{}],
 "math.frac.add10100":["Adding Fractions with Denominators of 10 and 100","fracaddsub",{"op":"+","like":true}],
 "math.frac.add3":["Adding Three or More Fractions","fracadd3",{}],
 "math.frac.addsub":["Adding and Subtracting Fractions","fracaddsub",{"op":"mix","like":true}],
 "math.frac.compare":["Comparing Fractions","fraccompare",{}],
 "math.frac.comparesums":["Comparing Sums and Differences of Fractions","fraccomparesums",{}],
 "math.frac.compdec":["Comparing Decimals and Fractions on a Number Line","fraccompdec",{}],
 "math.frac.convertmixed":["Converting Fractions and Mixed Numbers","fracconvert",{}],
 "math.frac.decimals":["Fractions and Decimals","fractodecimal",{}],
 "math.frac.decompose":["Decomposing Fractions","fracdecompose",{}],
 "math.frac.denom10100":["Fractions with Denominators of 10 and 100","fracdenom",{}],
 "math.frac.divwhole":["Dividing Fractions by Whole Numbers","fracdivide",{"mode":"fracbywhole"}],
 "math.frac.equiv":["Equivalent Fractions","fracequiv",{}],
 "math.frac.mixedaddsub":["Adding and Subtracting Mixed Numbers","fracmixed",{"op":"mix"}],
 "math.frac.mixedtodec":["Converting Mixed Numbers to Decimals","fractodecimal",{}],
 "math.frac.mult":["Multiplying Fractions","fracxwhole",{"unit":false}],
 "math.frac.multiples":["Multiples of Fractions","fracmultiples",{}],
 "math.frac.multmixed":["Multiply Fractions and Mixed Numbers","fracmultmixed",{}],
 "math.frac.ofnumber":["Fractions of a Number","fracofnumber",{}],
 "math.frac.puzzle":["Fractions Puzzle","fracequiv",{}],
 "math.frac.subregroup":["Subtracting Fractions with Regrouping","fracaddsub",{"op":"-","like":true}],
 "math.frac.unitmult":["Multiplying Unit Fractions","fracxwhole",{"unit":true}],
 "math.frac.unitxwhole":["Multiplying Unit Fractions by Whole Numbers","fracxwhole",{"unit":true}],
 "math.frac.xwhole":["Multiplying Fractions by Whole Numbers","fracxwhole",{"unit":false}],
 "math.geom.lines":["Points, Line Segments, Lines, and Rays","geomlines",{}],
 "math.geom.parallel":["Parallel, Perpendicular, and Intersecting Lines","geomparallel",{}],
 "math.geom.polygons":["Polygons","polygons",{}],
 "math.geom.shapes":["Shapes","polygons",{}],
 "math.graphs":["Interpreting Graphs","graphs",{}],
 "math.integers":["Integers","integers",{}],
 "math.iotable":["Input/Output Tables","iotable",{"op":"+"}],
 "math.magicnumbers":["Magic Numbers","magicnum",{}],
 "math.measure":["Measurement","measure",{"system":"customary"}],
 "math.measure.customary":["Converting Mixed Customary Units","measure",{"system":"customary"}],
 "math.measure.metric":["Converting Mixed Metric Units","measure",{"system":"metric"}],
 "math.measure.tables":["Measurement Conversion Tables","measure",{"system":"customary"}],
 "math.money":["Money","money",{"mode":"add"}],
 "math.money.add":["Adding Money Amounts","money",{"mode":"add"}],
 "math.money.compare":["Comparing Money Amounts","money",{"mode":"compare"}],
 "math.money.patterns":["Money Patterns","money",{"mode":"pattern"}],
 "math.money.pricelist":["Price Lists with Multiplication","money",{"mode":"pricelist"}],
 "math.moreorless":["More or Less","moreless",{}],
 "math.mult.2x1":["Multiplication","mult",{"a":2,"b":1}],
 "math.mult.2x1b":["Two-Digit by One-Digit Multiplication","mult",{"a":2,"b":1}],
 "math.mult.3x1":["Three-Digit by One-Digit Multiplication","mult",{"a":3,"b":1}],
 "math.mult.3x2":["Three-Digit by Two-Digit Multiplication","mult",{"a":3,"b":2}],
 "math.mult.facts":["Multiplication Facts","mult",{"a":1,"b":1}],
 "math.mult.iotable":["Multiplication Input/Output Tables","iotable",{"op":"*"}],
 "math.mult.props":["Properties of Multiplication","multprops",{}],
 "math.mult.three":["Multiplying Three Numbers","mult3",{"digits":1}],
 "math.mult.three2":["Multiplying Three Two-Digit Numbers","mult3",{"digits":2}],
 "math.mult.zeros":["Multiplying Numbers Ending in Zeroes","multzeros",{}],
 "math.multiples":["Multiples","multiples",{}],
 "math.mystery":["Mystery Number","mystery",{}],
 "math.mystery.plural":["Mystery Numbers","mystery",{}],
 "math.oporder":["Order of Operations","oporder",{}],
 "math.patterns.number":["Number Patterns","patterns",{"kind":"number"}],
 "math.percent":["Percents","percent",{}],
 "math.perimeter":["Perimeter","arearect",{"mode":"perimeter"}],
 "math.perimeter.compare":["Comparing the Perimeter of Two Figures","areacompare",{"mode":"perimeter"}],
 "math.pk.acute_right_and_obtuse_triangles":["Acute, Right and Obtuse Triangles","triangles",{}],
 "math.pk.acute_right_obtuse_and_straight_angles":["Acute, Right, Obtuse and Straight Angles","angletype",{}],
 "math.pk.adding_fractions_with_unlike_denominators":["Adding Fractions with Unlike Denominators","fracadd3",{}],
 "math.pk.adding_mixed_numbers_with_regrouping":["Adding Mixed Numbers with Regrouping","fracmixed",{"op":"mix"}],
 "math.pk.adding_up_to_four_fractions_with_unlike_denomi":["Adding up to Four Fractions with Unlike Denominators","fracadd3",{}],
 "math.pk.addition_and_subtraction_sentences":["Addition and Subtraction Sentences","fracaddsub",{"op":"mix"}],
 "math.pk.area_between_two_rectangles_with_fractional_si":["Area Between Two Rectangles with Fractional Sides","areafrac",{}],
 "math.pk.area_of_squares_and_rectangles_with_fractional":["Area of Squares and Rectangles with Fractional Sides","areafrac",{}],
 "math.pk.choosing_decimals_with_a_particular_sum":["Choosing Decimals with a Particular Sum","choosenum",{"kind":"decimal"}],
 "math.pk.classifying_quadrilaterals":["Classifying Quadrilaterals","quadrilaterals",{}],
 "math.pk.comparing_and_contrasting_shapes":["Comparing and Contrasting Shapes","shapecompare",{}],
 "math.pk.comparing_customary_units":["Comparing Customary Units","measure",{"system":"customary"}],
 "math.pk.comparing_decimals_on_number_lines":["Comparing Decimals on Number Lines","decnumberline",{}],
 "math.pk.comparing_fractions_and_mixed_numbers":["Comparing Fractions and Mixed Numbers","fraccompare",{}],
 "math.pk.completing_a_table_from_a_graph":["Completing a Table from a Graph","graphtable",{}],
 "math.pk.completing_decimal_addition_and_subtraction":["Completing Decimal Addition and Subtraction","decaddsub",{"op":"+"}],
 "math.pk.completing_division_sentences":["Completing Division Sentences","equations",{}],
 "math.pk.completing_fraction_multiplication":["Completing Fraction Multiplication","fracmultfrac",{}],
 "math.pk.completing_mixed_number_multiplication":["Completing Mixed Number Multiplication","fracmultmixed",{}],
 "math.pk.conversion_tables_customary_and_metric":["Conversion Tables: Customary and Metric","measure",{"system":"mixed"}],
 "math.pk.converting_and_comparing_customary_units":["Converting and Comparing Customary Units","measure",{"system":"customary"}],
 "math.pk.converting_and_comparing_metric_units":["Converting and Comparing Metric Units","measure",{"system":"metric"}],
 "math.pk.converting_between_metric_and_customary_units":["Converting Between Metric and Customary Units","measure",{"system":"mixed"}],
 "math.pk.converting_between_standard_and_expanded_form":["Converting Between Standard and Expanded Form","decexpanded",{}],
 "math.pk.converting_customary_units":["Converting Customary Units","measure",{"system":"customary"}],
 "math.pk.converting_decimals_from_expanded_form":["Converting Decimals from Expanded Form","decexpanded",{}],
 "math.pk.converting_decimals_from_standard_form":["Converting Decimals from Standard Form","decexpanded",{}],
 "math.pk.converting_decimals_to_fractions":["Converting Decimals to Fractions","fractodecimal",{"dir":"dec2frac"}],
 "math.pk.converting_decimals_to_mixed_numbers":["Converting Decimals to Mixed Numbers","fractodecimal",{"dir":"dec2frac"}],
 "math.pk.converting_improper_fractions_into_mixed_numbe":["Converting Improper Fractions into Mixed Numbers","fracconvert",{}],
 "math.pk.converting_mixed_numbers_into_improper_fractio":["Converting Mixed Numbers into Improper Fractions","fracconvert",{}],
 "math.pk.coordinate_plane_all_four_quadrants":["Coordinate Plane: All Four Quadrants","coordinate",{"mode":"quadrant"}],
 "math.pk.coordinate_planes_as_maps":["Coordinate Planes as Maps","coordinate",{"mode":"quadrant"}],
 "math.pk.creating_a_line_plot":["Creating a Line Plot","lineplot",{}],
 "math.pk.creating_and_interpreting_line_plots":["Creating and Interpreting Line Plots","lineplot",{}],
 "math.pk.creating_line_plots":["Creating Line Plots","lineplot",{}],
 "math.pk.decimal_division_patterns_over_increasing_plac":["Decimal Division Patterns over Increasing Place Values","opspattern",{"op":"decdiv"}],
 "math.pk.decimal_number_lines":["Decimal Number Lines","decnumberline",{}],
 "math.pk.decimal_number_patterns":["Decimal Number Patterns","patterns",{"kind":"decimal"}],
 "math.pk.decimals_expressed_in_words":["Decimals Expressed in Words","decwordform",{}],
 "math.pk.dividing_by_powers_of_ten":["Dividing by Powers of Ten","decdiv",{"mode":"power"}],
 "math.pk.dividing_five_digit_numbers_by_two_digit_numbe":["Dividing Five-Digit Numbers by Two-Digit Numbers","divide",{"digits":5,"rem":false}],
 "math.pk.dividing_four_digit_and_five_digit":["Dividing Four Digit and Five Digit","divide",{"digits":4,"rem":false}],
 "math.pk.dividing_four_digit_numbers_by_one_digit_numbe":["Dividing Four-Digit Numbers by One-Digit Numbers","divide",{"digits":4,"rem":false}],
 "math.pk.dividing_fractions_and_mixed_numbers":["Dividing Fractions and Mixed Numbers","fracdivide",{"mode":"fracbyfrac"}],
 "math.pk.dividing_fractions_by_whole_numbers":["Dividing Fractions by Whole Numbers","fracdivide",{"mode":"fracbywhole"}],
 "math.pk.dividing_multi_digit_numbers_by_two_digit_numb":["Dividing Multi-Digit Numbers by Two-Digit Numbers","divide",{"digits":3,"rem":false}],
 "math.pk.dividing_numbers_ending_in_zeroes":["Dividing Numbers Ending in Zeroes","divzeros",{}],
 "math.pk.dividing_two_digit_and_three_digit_numbers":["Dividing Two-Digit and Three-Digit Numbers","divide",{"digits":2,"rem":false}],
 "math.pk.dividing_two_digit_numbers_by_one_digit_number":["Dividing Two-Digit Numbers by One-Digit Numbers","divide",{"digits":2,"rem":false}],
 "math.pk.dividing_two_fractions":["Dividing Two Fractions","fracdivide",{"mode":"fracbyfrac"}],
 "math.pk.dividing_unit_fractions_by_whole_numbers":["Dividing Unit Fractions by Whole Numbers","fracdivide",{"mode":"unitbywhole"}],
 "math.pk.dividing_whole_numbers_by_fractions":["Dividing Whole Numbers by Fractions","fracdivide",{"mode":"wholebyfrac"}],
 "math.pk.dividing_whole_numbers_by_unit_fractions":["Dividing Whole Numbers by Unit Fractions","fracdivide",{"mode":"wholebyfrac"}],
 "math.pk.divisibility_rules":["Divisibility Rules","divisibility",{}],
 "math.pk.division_input_output_tables":["Division Input Output Tables","iotable",{"op":"/"}],
 "math.pk.division_patterns":["Division Patterns","opspattern",{"op":"div"}],
 "math.pk.division_patterns_over_increasing":["Division Patterns Over Increasing","opspattern",{"op":"div"}],
 "math.pk.division_true_or_false":["Division True or False","divtf",{}],
 "math.pk.division_with_decimal_quotients":["Division with Decimal Quotients","decdiv",{"mode":"quotient"}],
 "math.pk.division_with_decimal_quotients_and_rounding":["Division with Decimal Quotients and Rounding","decdiv",{"mode":"quotient"}],
 "math.pk.equivalent_decimals":["Equivalent Decimals","decequiv",{}],
 "math.pk.estimating_angle_measurements":["Estimating Angle Measurements","angletype",{}],
 "math.pk.estimating_products_of_decimals":["Estimating Products of Decimals","decmult",{"mode":"estimate"}],
 "math.pk.estimating_products_of_mixed_numbers":["Estimating Products of Mixed Numbers","estimate",{"op":"*"}],
 "math.pk.estimating_sums_and_differences":["Estimating Sums and Differences","estimate",{"op":"+"}],
 "math.pk.estimating_sums_and_differences_of_fractions":["Estimating Sums and Differences of Fractions","fraccomparesums",{}],
 "math.pk.evaluating_numerical_expressions":["Evaluating Numerical Expressions","oporder",{}],
 "math.pk.factors_multiples_prime_and_composite_numbers":["Factors, Multiples, Prime and Composite Numbers","primecomposite",{}],
 "math.pk.finding_angles_within_shapes":["Finding Angles Within Shapes","angleinshape",{}],
 "math.pk.five_digit_by_two_digit_multiplication":["Five Digit by Two Digit Multiplication","mult",{"a":5,"b":2}],
 "math.pk.following_directions_on_a_coordinate_plane":["Following Directions on a Coordinate Plane","coordinate",{"mode":"quadrant"}],
 "math.pk.four_digit_by_one_digit_multiplication":["Four Digit by One Digit Multiplication","mult",{"a":4,"b":1}],
 "math.pk.four_digit_by_two_digit_multiplication":["Four Digit by Two Digit Multiplication","mult",{"a":4,"b":2}],
 "math.pk.fractions_and_mixed_numbers":["Fractions and Mixed Numbers","fracconvert",{}],
 "math.pk.fractions_true_or_false":["Fractions True or False","fractf",{}],
 "math.pk.geometry_true_or_false":["Geometry True or False","shapecompare",{}],
 "math.pk.graphing_a_two_variable_relationship":["Graphing a Two Variable Relationship","equations",{"twovar":true}],
 "math.pk.graphing_points_on_a_coordinate":["Graphing Points on a Coordinate","coordinate",{}],
 "math.pk.graphing_points_on_a_coordinate_plane":["Graphing Points on a Coordinate Plane","coordinate",{}],
 "math.pk.graphs":["Graphs","graphs",{}],
 "math.pk.greatest_and_least_products":["Greatest and Least Products","extremeproduct",{}],
 "math.pk.identifying_and_describing_shapes":["Identifying and Describing Shapes","shapecompare",{}],
 "math.pk.identifying_parallelograms":["Identifying Parallelograms","quadrilaterals",{}],
 "math.pk.inequalities_with_addition_and_subtraction":["Inequalities with Addition and Subtraction","inequality",{"op":"whole"}],
 "math.pk.inequalities_with_decimal_addition":["Inequalities with Decimal Addition","inequality",{"op":"decadd"}],
 "math.pk.inequalities_with_decimal_division":["Inequalities with Decimal Division","inequality",{"op":"decdiv"}],
 "math.pk.inequalities_with_decimal_multiplication":["Inequalities with Decimal Multiplication","inequality",{"op":"decmul"}],
 "math.pk.inequalities_with_multiplication":["Inequalities with Multiplication","inequality",{"op":"whole"}],
 "math.pk.interpreting_line_plots":["Interpreting Line Plots","lineplot",{}],
 "math.pk.math_puzzles":["Math Puzzles","mystery",{}],
 "math.pk.measuring_angles":["Measuring Angles","angletype",{}],
 "math.pk.multi_digit_multiplication":["Multi Digit Multiplication","mult",{"a":3,"b":1}],
 "math.pk.multiplication_patterns":["Multiplication Patterns","opspattern",{"op":"mult"}],
 "math.pk.multiplication_patterns_over_increasing_place_":["Multiplication Patterns over Increasing Place Values","opspattern",{"op":"mult"}],
 "math.pk.multiplying_a_decimal_by_a_multi_digit_number":["Multiplying a Decimal by a Multi-Digit Number","decmult",{"mode":"whole"}],
 "math.pk.multiplying_a_decimal_by_a_one_digit_number":["Multiplying a Decimal by a One-Digit Number","decmult",{"mode":"whole"}],
 "math.pk.multiplying_a_decimal_by_a_power_of_ten":["Multiplying a Decimal by a Power of Ten","decmult",{"mode":"power"}],
 "math.pk.multiplying_a_mixed_number_by_a_whole_number":["Multiplying a Mixed Number by a Whole Number","fracmultmixed",{}],
 "math.pk.multiplying_four_digit_numbers_by_one_digit_nu":["Multiplying Four-Digit Numbers by One-Digit Numbers","mult",{"a":4,"b":1}],
 "math.pk.multiplying_fractions_and_mixed_numbers":["Multiplying Fractions and Mixed Numbers","fracmultmixed",{}],
 "math.pk.multiplying_larger_numbers":["Multiplying Larger Numbers","mult",{"a":3,"b":1}],
 "math.pk.multiplying_three_digit_numbers_by_two_digit_n":["Multiplying Three-Digit Numbers by Two-Digit Numbers","mult",{"a":3,"b":1}],
 "math.pk.multiplying_three_or_more_fractions":["Multiplying Three or More Fractions","fracmultfrac",{"three":true}],
 "math.pk.multiplying_three_or_more_mixed_numbers":["Multiplying Three or More Mixed Numbers","fracmultmixed",{}],
 "math.pk.multiplying_three_or_more_numbers":["Multiplying Three or More Numbers","mult3",{}],
 "math.pk.multiplying_two_fractions_fill_in_the_missing_":["Multiplying Two Fractions: Fill in the Missing Number","fracmultfrac",{}],
 "math.pk.multiplying_two_three_and_four_digit_numbers":["Multiplying Two-, Three- and Four-Digit Numbers","mult",{"a":4,"b":1}],
 "math.pk.multiplying_two_unit_fractions":["Multiplying Two Unit Fractions","fracmultfrac",{"unit":true}],
 "math.pk.number_mazes":["Number Mazes","mystery",{}],
 "math.pk.number_of_sides_in_polygons":["Number of Sides in Polygons","polygons",{}],
 "math.pk.objects_on_a_coordinate_plane":["Objects on a Coordinate Plane","coordinate",{"mode":"quadrant"}],
 "math.pk.parallel_sides_in_quadrilaterals":["Parallel Sides in Quadrilaterals","quadrilaterals",{}],
 "math.pk.price_lists":["Price Lists","unitprice",{}],
 "math.pk.quadrants":["Quadrants","coordinate",{"mode":"quadrant"}],
 "math.pk.reasonable_temperature_celsius":["Reasonable Temperature Celsius","temperature",{}],
 "math.pk.regular_and_irregular_polygons":["Regular and Irregular Polygons","polygons",{}],
 "math.pk.repeating_decimals":["Repeating Decimals","decrepeat",{}],
 "math.pk.rounding_decimals":["Rounding Decimals","rounding",{"mode":"decimal"}],
 "math.pk.sale_prices":["Sale Prices","unitprice",{}],
 "math.pk.scalene_isosceles_and_equilateral_triangles":["Scalene, Isosceles and Equilateral Triangles","triangles",{}],
 "math.pk.scaling_fractions_by_fractions":["Scaling Fractions by Fractions","scaling",{}],
 "math.pk.scaling_mixed_numbers_by_fractions":["Scaling Mixed Numbers by Fractions","scaling",{}],
 "math.pk.scaling_whole_numbers_by_fractions":["Scaling Whole Numbers by Fractions","scaling",{}],
 "math.pk.scientific_notation":["Scientific Notation","scinotation",{}],
 "math.pk.solving_equations_with_decimals":["Solving Equations with Decimals","equations",{}],
 "math.pk.two_digit_by_two_digit_multiplication":["Two Digit by Two Digit Multiplication","mult",{"a":2,"b":2}],
 "math.pk.unit_prices":["Unit Prices","unitprice",{}],
 "math.pk.volume":["Volume","volume",{}],
 "math.pk.volume_of_cubes_and_rectangular":["Volume of Cubes and Rectangular","volume",{}],
 "math.pk.volume_of_irregular_figures":["Volume of Irregular Figures","volume",{"mode":"irregular"}],
 "math.pk.volume_of_rectangular_prisms":["Volume of Rectangular Prisms","volume",{}],
 "math.pk.writing_expressions_as_decimal_numbers":["Writing Expressions as Decimal Numbers","decexpanded",{}],
 "math.pk.writing_fractions_in_lowest_terms":["Writing Fractions in Lowest Terms","fraclowest",{}],
 "math.pk.writing_numerical_expressions":["Writing Numerical Expressions","oporder",{}],
 "math.placevalue":["Place Value","placevalue",{}],
 "math.prime":["Prime Numbers","primecomposite",{}],
 "math.primecomposite":["Prime and Composite Numbers","primecomposite",{}],
 "math.probability":["Probability","probability",{}],
 "math.probability.find":["Finding the Probability","probability",{}],
 "math.puzzles":["Number Puzzles","mystery",{}],
 "math.rounding":["Rounding","rounding",{"mode":"whole"}],
 "math.rounding.money":["Rounding Money Amounts","rounding",{"mode":"money"}],
 "math.sub.4":["Four-Digit Subtraction","addsub",{"op":"-","digits":4}],
 "math.sub.5":["Five-Digit Subtraction","addsub",{"op":"-","digits":5}],
 "math.sub.6":["Six-Digit Subtraction","addsub",{"op":"-","digits":6}],
 "math.sub.7":["Seven-Digit Subtraction","addsub",{"op":"-","digits":7}],
 "math.sub.multi":["Multi-Digit Subtraction","addsub",{"op":"-","digits":5}],
 "math.symmetry":["Symmetry","symmetry",{}],
 "math.symmetry.count":["Counting Lines of Symmetry","symmetry",{}],
 "math.symmetry.draw":["Drawing Lines of Symmetry","symmetry",{}],
 "math.symmetry.identify":["Identifying Lines of Symmetry","symmetry",{}],
 "math.symmetry.rotational":["Rotational Symmetry","symmetry",{}],
 "math.tables.rule":["Completing Tables for a Rule","iotable",{"op":"*"}],
 "math.time":["Time","time",{"mode":"convert"}],
 "math.time.convert":["Converting Time Units","time",{"mode":"convert"}],
 "math.time.elapsed":["Elapsed Time","time",{"mode":"elapsed"}],
 "math.time.elapsedwp":["Elapsed Time Word Problems","time",{"mode":"elapsed"}],
 "math.time.fractions":["Fractions of Time Units","time",{"mode":"fraction"}],
 "math.time.patterns":["Time Patterns","time",{"mode":"pattern"}],
 "math.time.schedule":["Transportation Schedule","time",{"mode":"schedule"}],
 "math.time.wordproblems":["Time Word Problems","time",{"mode":"elapsed"}],
 "math.time.zones":["Time Zones","time",{"mode":"zone"}],
 "math.volume":["Volume","volume",{}],
 "math.wordproblems":["Word Problems","wordproblem",{}],
 "math.write.multidigit":["Writing Multi-Digit Numbers","writenum",{}],
 "sci.collisions":["Collisions and Energy (4-PS3-3)","collisions",{}],
 "sci.compare_solutions":["Comparing Solutions (ETS1-2)","compare_solutions",{}],
 "sci.design_problem":["Defining a Design Problem (ETS1-1)","design_problem",{}],
 "sci.energy_conversion":["Energy Conversion Devices (4-PS3-4)","energy_conversion",{}],
 "sci.energy_resources":["Energy Resources and Impact (4-ESS3-1)","energy_resources",{}],
 "sci.energy_transfer":["Energy Transfer (4-PS3-2)","energy_transfer",{}],
 "sci.fair_test":["Fair Testing and Refining (ETS1-3)","fair_test",{}],
 "sci.food_energy":["Energy in Food (5-PS3-1)","food_energy",{}],
 "sci.matter_movement":["Movement of Matter (5-LS2-1)","matter_movement",{}],
 "sci.plant_materials":["How Plants Get Materials (5-LS1-1)","plant_materials",{}],
 "sci.speed_energy":["Speed and Energy (4-PS3-1)","speed_energy",{}]
};
const DW_PACKET_INDEX={
 "abbreviations":"ela.abbreviations",
 "abcorder":"ela.abcorder",
 "acuterightandobtusetriangles":"math.pk.acute_right_and_obtuse_triangles",
 "acuterightobtuseandstraightangles":"math.pk.acute_right_obtuse_and_straight_angles",
 "adages":"ela.fig.adage",
 "addingandsubtracting":"math.addsub.mixed",
 "addingandsubtractingfractions":"math.frac.addsub",
 "addingandsubtractingmixed":"math.frac.mixedaddsub",
 "addingandsubtractingmixednumbers":"math.frac.mixedaddsub",
 "addingdecimalnumbers":"math.dec.add",
 "addingfractionswithdenominators":"math.frac.add10100",
 "addingfractionswithdenominatorsof10and100":"math.frac.add10100",
 "addingfractionswithunlike":"math.pk.adding_fractions_with_unlike_denominators",
 "addingmixednumberswith":"math.pk.adding_mixed_numbers_with_regrouping",
 "addingmoneyamounts":"math.money.add",
 "addingthreeormorefractions":"math.frac.add3",
 "addinguptofourfractionswith":"math.pk.adding_up_to_four_fractions_with_unlike_denomi",
 "additionandsubtractionsentences":"math.pk.addition_and_subtraction_sentences",
 "adjacentangles":"math.angle.adjacent",
 "adjectiveoradverb":"ela.mod.which",
 "adjectivesandadverbs":"ela.mod.adjadv",
 "alliteration":"ela.fig.alliteration",
 "alphabeticalorder":"ela.pk.alphabetical_order",
 "analogies":"ela.analogies",
 "analogiesidentifyingtheconnection":"ela.analogies.connection",
 "angleso f90180270and360degrees":"math.angle.turns",
 "anglesof90180270and360degrees":"math.angle.turns",
 "antonyms":"ela.antonyms",
 "area":"math.area",
 "areabetweentworectangleswith":"math.pk.area_between_two_rectangles_with_fractional_si",
 "areaofsquaresandrectangleswith":"math.pk.area_of_squares_and_rectangles_with_fractional",
 "articles":"ela.articles",
 "capitalization":"ela.capitalization",
 "capitalizationtrueorfalse":"ela.capitalization.tf",
 "capitalizingtitles":"ela.pk.capitalizing_titles",
 "choosingbetweenthepasttenseand":"ela.pk.choosing_between_the_past_and_past_perfect_ten",
 "choosingdecimalnumberswith":"math.choose.decimal",
 "choosingdecimalnumberswithaparticularsum":"math.choose.decimal",
 "choosingdecimalswithaparticular":"math.pk.choosing_decimals_with_a_particular_sum",
 "choosingnumberswithaparticular":"math.choose.sum",
 "choosingnumberswithaparticularsum":"math.choose.sum",
 "choosingthebesttransition":"ela.pk.choosing_the_best_transition",
 "choosingtwonumbers":"math.choose.two",
 "cinquainpoem":"ela.poetry.cinquain",
 "classifyingquadrilaterals":"math.pk.classifying_quadrilaterals",
 "combiningsentences":"ela.pk.combining_sentences",
 "commas":"ela.commas",
 "commasdirectaddressandtag":"ela.pk.commas_direct_address_and_tag",
 "commasinaseries":"ela.pk.commas_in_a_series",
 "commaswithdirectaddresses":"ela.pk.commas_with_direct_addresses",
 "commonandpropernouns":"ela.pk.common_and_proper_nouns",
 "comparativeadjectives":"ela.mod.comparative",
 "comparativeandsuperlativeadjectives":"ela.mod.compsuper",
 "comparativeandsuperlativeadverbs":"ela.mod.compsuperadv",
 "comparingandcontrasting":"ela.pk.comparing_and_contrasting",
 "comparingandcontrastingshapes":"math.pk.comparing_and_contrasting_shapes",
 "comparingcustomaryunits":"math.pk.comparing_customary_units",
 "comparingdecimalnumbers":"math.dec.compare",
 "comparingdecimalsandfractions":"math.frac.compdec",
 "comparingdecimalsandfractionson":"math.frac.compdec",
 "comparingdecimalsandfractionsonanumberline":"math.frac.compdec",
 "comparingdecimalsonnumberlines":"math.pk.comparing_decimals_on_number_lines",
 "comparingfractions":"math.frac.compare",
 "comparingfractionsandmixednumbers":"math.pk.comparing_fractions_and_mixed_numbers",
 "comparingmoneyamounts":"math.money.compare",
 "comparingnumbers":"math.compare.whole",
 "comparingsumsanddifferencesoffractions":"math.frac.comparesums",
 "comparingtheareaoftwofigures":"math.area.compare",
 "comparingtheperimeteroftwofigures":"math.perimeter.compare",
 "completesentencefragmentorrunon":"ela.sent.three",
 "completesentenceorfragment":"ela.sent.fragment",
 "completesentenceorrunon":"ela.sent.runon",
 "completingatablefromagraph":"math.pk.completing_a_table_from_a_graph",
 "completingdecimaladditionand":"math.pk.completing_decimal_addition_and_subtraction",
 "completingdivisionsentences":"math.pk.completing_division_sentences",
 "completingequations":"math.equations",
 "completingfractionmultiplication":"math.pk.completing_fraction_multiplication",
 "completingmixednumber":"math.pk.completing_mixed_number_multiplication",
 "completingtablesfora":"math.tables.rule",
 "completingtablesforarule":"math.tables.rule",
 "compoundsentences":"ela.sent.compound",
 "compoundsubjectsandobjects":"ela.sent.compoundsubj",
 "compoundsubjectsandobjectswith":"ela.pk.compound_subjects_and_objects",
 "concreteandabstractnouns":"ela.nouns.concrete",
 "conjunctions":"ela.conjunctions",
 "conjunctionsprepositionsandinterjections":"ela.pk.conjunctions_prepositions_and_interjections",
 "contextclues":"ela.pk.context_clues",
 "contractions":"ela.contractions",
 "contractionswithnot":"ela.contractions.not",
 "conversiontablescustomaryand":"math.pk.conversion_tables_customary_and_metric",
 "convertingandcomparingcustomary":"math.pk.converting_and_comparing_customary_units",
 "convertingandcomparingmetric":"math.pk.converting_and_comparing_metric_units",
 "convertingbetweenmetricandcustomaryunits":"math.pk.converting_between_metric_and_customary_units",
 "convertingbetweenstandardand":"math.pk.converting_between_standard_and_expanded_form",
 "convertingcustomaryunits":"math.pk.converting_customary_units",
 "convertingdecimalsfromexpanded":"math.pk.converting_decimals_from_expanded_form",
 "convertingdecimalsfromstandard":"math.pk.converting_decimals_from_standard_form",
 "convertingdecimalstofractions":"math.pk.converting_decimals_to_fractions",
 "convertingdecimalstomixednumbers":"math.pk.converting_decimals_to_mixed_numbers",
 "convertingfractionsandmixednumbers":"math.frac.convertmixed",
 "convertingimproperfractionsinto":"math.pk.converting_improper_fractions_into_mixed_numbe",
 "convertingmixedcustomaryunits":"math.measure.customary",
 "convertingmixedmetricunits":"math.measure.metric",
 "convertingmixednumbersinto":"math.pk.converting_mixed_numbers_into_improper_fractio",
 "convertingmixednumberstodecimals":"math.frac.mixedtodec",
 "convertingtimeunits":"math.time.convert",
 "coordinateplane":"math.coordinate",
 "coordinateplaneallfourquadrants":"math.pk.coordinate_plane_all_four_quadrants",
 "coordinateplanesasmaps":"math.pk.coordinate_planes_as_maps",
 "coordinatingconjunctions":"ela.conj.coordinating",
 "correctingcapitalizationerrors":"ela.pk.correcting_capitalization_errors",
 "correctingerrorswithfrequently":"ela.pk.correcting_errors_with_frequently_confused_wor",
 "correctingerrorswithsigns":"ela.pk.correcting_errors_with_signs",
 "correctinginappropriateshiftsin":"ela.pk.correcting_inappropriate_shifts_in_verb_tense",
 "correlativeconjunctions":"ela.pk.correlative_conjunctions",
 "countinglinesofsymmetry":"math.symmetry.count",
 "creatingalineplot":"math.pk.creating_a_line_plot",
 "creatingandinterpretinglineplots":"math.pk.creating_and_interpreting_line_plots",
 "creatingcompoundsentences":"ela.sent.createcompound",
 "creatinglineplots":"math.pk.creating_line_plots",
 "decimaldivisionpatternsover":"math.pk.decimal_division_patterns_over_increasing_plac",
 "decimalnumberlines":"math.pk.decimal_number_lines",
 "decimalnumbermaze":"math.dec.maze",
 "decimalnumberpatterns":"math.pk.decimal_number_patterns",
 "decimalsexpressedinwords":"math.pk.decimals_expressed_in_words",
 "decimalsinequalitieswith":"math.dec.inequal",
 "decimalsinequalitieswithdecimals":"math.dec.inequal",
 "declarativeinterrogativeimperative":"ela.pk.declarative_interrogative_imperative_and_excla",
 "decomposingfractions":"math.frac.decompose",
 "determiningthemeaningofidioms":"ela.pk.determining_the_meaning_of_idioms",
 "determiningthemeaningofwords":"ela.meaning",
 "determiningthemeaningsofgreek":"ela.pk.determining_the_meanings_of_greek",
 "determiningthemeaningsofwordswith":"ela.pk.determining_the_meanings_of_words_with_affixes",
 "dictionarydefinitions":"ela.pk.dictionary_definitions",
 "dictionarysearch":"ela.dictionary",
 "dividingbypowersoften":"math.pk.dividing_by_powers_of_ten",
 "dividingfivedigitnumbersby":"math.pk.dividing_five_digit_numbers_by_two_digit_numbe",
 "dividingfourdigitandfivedigit":"math.pk.dividing_four_digit_and_five_digit",
 "dividingfourdigitnumbers":"math.div.4",
 "dividingfourdigitnumbersby":"math.pk.dividing_four_digit_numbers_by_one_digit_numbe",
 "dividingfractionsandmixednumbers":"math.pk.dividing_fractions_and_mixed_numbers",
 "dividingfractionsbywholenumbers":"math.pk.dividing_fractions_by_whole_numbers",
 "dividingmultidigitnumbersby":"math.pk.dividing_multi_digit_numbers_by_two_digit_numb",
 "dividingnumbersendinginzeroes":"math.pk.dividing_numbers_ending_in_zeroes",
 "dividingthreedigitnumbers":"math.div.3",
 "dividingtwodigitandthreedigit":"math.pk.dividing_two_digit_and_three_digit_numbers",
 "dividingtwodigitnumbersby":"math.pk.dividing_two_digit_numbers_by_one_digit_number",
 "dividingtwofractions":"math.pk.dividing_two_fractions",
 "dividingunitfractionsby":"math.pk.dividing_unit_fractions_by_whole_numbers",
 "dividingwholenumbersby":"math.pk.dividing_whole_numbers_by_unit_fractions",
 "dividingwholenumbersbyfractions":"math.pk.dividing_whole_numbers_by_fractions",
 "divisibilityrules":"math.pk.divisibility_rules",
 "division":"math.div.basic",
 "divisioninputoutputtables":"math.pk.division_input_output_tables",
 "divisionpatterns":"math.pk.division_patterns",
 "divisionpatternsoverincreasing":"math.pk.division_patterns_over_increasing",
 "divisiontrueorfalse":"math.pk.division_true_or_false",
 "divisionwithdecimalquotients":"math.pk.division_with_decimal_quotients",
 "divisionwithdecimalquotientsandrounding":"math.pk.division_with_decimal_quotients_and_rounding",
 "divisionwithremainders":"math.div.rem",
 "drawingangleswithaprotractor":"math.angle.draw",
 "drawinglinesofsymmetry":"math.symmetry.draw",
 "elapsedtime":"math.time.elapsed",
 "elapsedtimewordproblems":"math.time.elapsedwp",
 "elementsofpoetry":"ela.pk.elements_of_poetry",
 "equivalentdecimals":"math.pk.equivalent_decimals",
 "equivalentfractions":"math.frac.equiv",
 "estimateanglemeasurements":"math.angle.estimate",
 "estimatinganglemeasurements":"math.pk.estimating_angle_measurements",
 "estimatingdifferences":"math.est.differences",
 "estimatingproducts":"math.est.products",
 "estimatingproductsofdecimals":"math.pk.estimating_products_of_decimals",
 "estimatingproductsofmixednumbers":"math.pk.estimating_products_of_mixed_numbers",
 "estimatingquotients":"math.est.quotients",
 "estimatingsums":"math.est.sums",
 "estimatingsumsanddifferences":"math.pk.estimating_sums_and_differences",
 "estimatingsumsanddifferencesof":"math.pk.estimating_sums_and_differences_of_fractions",
 "evaluatingnumericalexpressions":"math.pk.evaluating_numerical_expressions",
 "expandingsentences":"ela.pk.expanding_sentences",
 "factors":"math.factors",
 "factorsmultiplesprimeand":"math.pk.factors_multiples_prime_and_composite_numbers",
 "factsandopinions":"ela.pk.facts_and_opinions",
 "figurativelanguage":"ela.pk.figurative_language",
 "fillinginthemissingcorrelative":"ela.pk.filling_in_the_missing_correlative_conjunction",
 "findandfixthesentencefragments":"ela.sent.fixfragment",
 "findingangleswithinshapes":"math.pk.finding_angles_within_shapes",
 "findingantonymsincontext":"ela.antonyms.context",
 "findingsynonymsincontext":"ela.pk.finding_synonyms_in_context",
 "findingtheareaandthemissing":"math.area.missing",
 "findingtheareaandthemissingside":"math.area.missing",
 "findingtheprobability":"math.probability.find",
 "fivedigitaddition":"math.add.5",
 "fivedigitbytwodigitmultiplication":"math.pk.five_digit_by_two_digit_multiplication",
 "fivedigitsubtraction":"math.sub.5",
 "fixtherunonsentences":"ela.sent.fixrunon",
 "followingdirectionsona":"math.pk.following_directions_on_a_coordinate_plane",
 "formalversusinformalenglish":"ela.register",
 "formalwriting":"ela.pk.formal_writing",
 "formattingaddresses":"ela.addresses",
 "formattingandcapitalizingtitles":"ela.capitalization.titles",
 "formattingstreetaddresses":"ela.pk.formatting_street_addresses",
 "formingandusingtheirregularpasttense":"ela.pk.forming_and_using_the_irregular_past_tense",
 "formingandusingtheperfectverbtenses":"ela.pk.forming_and_using_the_perfect_verb_tenses",
 "formingpluralsofnounsendingin":"ela.pk.forming_plurals_of_nouns_ending_in_y_and_f",
 "formingprepositionalphrases":"ela.prepositions.forming",
 "formingprogressiveverbtenses":"ela.verbs.formprogressive",
 "formingtheperfectverbtenses":"ela.pk.forming_the_perfect_verb_tenses",
 "formingwordswithgreekandlatinroots":"ela.roots.form",
 "fourdigitaddition":"math.add.4",
 "fourdigitbyonedigitmultiplication":"math.pk.four_digit_by_one_digit_multiplication",
 "fourdigitbytwodigitmultiplication":"math.pk.four_digit_by_two_digit_multiplication",
 "fourdigitsubtraction":"math.sub.4",
 "fractionsanddecimals":"math.frac.decimals",
 "fractionsandmixednumbers":"math.pk.fractions_and_mixed_numbers",
 "fractionsofanumber":"math.frac.ofnumber",
 "fractionsoftimeunits":"math.time.fractions",
 "fractionspuzzle":"math.frac.puzzle",
 "fractionstrueorfalse":"math.pk.fractions_true_or_false",
 "fractionswithdenominatorsof":"math.frac.denom10100",
 "fractionswithdenominatorsof10and100":"math.frac.denom10100",
 "genres":"ela.genres",
 "geometrytrueorfalse":"math.pk.geometry_true_or_false",
 "givingreasonstosupportanopinion":"ela.opinion",
 "graphingatwovariablerelationship":"math.pk.graphing_a_two_variable_relationship",
 "graphingpointsonacoordinate":"math.pk.graphing_points_on_a_coordinate",
 "graphingpointsonacoordinateplane":"math.pk.graphing_points_on_a_coordinate_plane",
 "graphs":"math.pk.graphs",
 "greatestandleastproducts":"math.pk.greatest_and_least_products",
 "greekandlatinroots":"ela.pk.greek_and_latin_roots",
 "greekandlatinrootword":"ela.roots",
 "greekandlatinrootwords":"ela.roots",
 "guidewords":"ela.guidewords",
 "haikupoem":"ela.poetry.haiku",
 "homographs":"ela.homographs",
 "homophones":"ela.homophones",
 "hyperboles":"ela.fig.hyperbole",
 "identifyingandcorrectingerrors":"ela.usage.correct",
 "identifyingandcorrectingerrorswith":"ela.usage.verbs",
 "identifyingandcorrectingerrorswithverbs":"ela.usage.verbs",
 "identifyinganddefininggreek":"ela.roots.define",
 "identifyinganddefininggreekandlatinroots":"ela.roots.define",
 "identifyinganddescribingthe":"math.pk.identifying_and_describing_shapes",
 "identifyingdependentclauses":"ela.pk.identifying_dependent_clauses",
 "identifyingindependentclauses":"ela.pk.identifying_independent_clauses",
 "identifyinglinesofsymmetry":"math.symmetry.identify",
 "identifyingmainandhelpingverbs":"ela.pk.identifying_main_and_helping_verbs",
 "identifyingparallelograms":"math.pk.identifying_parallelograms",
 "identifyingprepositions":"ela.pk.identifying_prepositions",
 "identifyingrelativepronouns":"ela.pk.identifying_relative_pronouns",
 "identifyingsubordinatingconjunctions":"ela.pk.identifying_subordinating_conjunctions",
 "identifyingthecompletepredicate":"ela.sent.completepredicate",
 "identifyingthecompletesubject":"ela.sent.completesubject",
 "identifyingthecompletesubjectand":"ela.pk.identifying_the_complete_subject_and_predicate",
 "identifyingthecompletesubjectof":"ela.sent.completesubject",
 "identifyingthemeaningsof":"ela.pk.identifying_the_meanings_of_word_parts",
 "identifyingthepurposeofatext":"ela.purpose",
 "identifyingthesimplesubjectand":"ela.sent.simplesubjpred",
 "identifyingthesimplesubjectandpredicate":"ela.sent.simplesubjpred",
 "identifyingtimeorderwords":"ela.timeorder",
 "idioms":"ela.fig.idiom",
 "idiomsandadages":"ela.fig.idiomadage",
 "inequalitieswithadditionand":"math.pk.inequalities_with_addition_and_subtraction",
 "inequalitieswithdecimaladdition":"math.pk.inequalities_with_decimal_addition",
 "inequalitieswithdecimaldivision":"math.pk.inequalities_with_decimal_division",
 "inequalitieswithdecimalmultiplication":"math.pk.inequalities_with_decimal_multiplication",
 "inequalitieswithmultiplication":"math.pk.inequalities_with_multiplication",
 "informalwriting":"ela.pk.informal_writing",
 "inputoutputtables":"math.iotable",
 "integers":"math.integers",
 "interjections":"ela.pk.interjections",
 "interpretinggraphs":"math.graphs",
 "interpretinglineplots":"math.pk.interpreting_line_plots",
 "irregularpasttenseverbs":"ela.verbs.irregular",
 "magicnumbers":"math.magicnumbers",
 "mainandhelpingverbs":"ela.verbs.helping",
 "matchingwordswithgreekandlatin":"ela.roots.match",
 "matchingwordswithgreekandlatinroots":"ela.roots.match",
 "mathpuzzles":"math.pk.math_puzzles",
 "measurement":"math.measure",
 "measurementconversiontables":"math.measure.tables",
 "measuringangles":"math.pk.measuring_angles",
 "measuringangleswithaprotractor":"math.angle.measure",
 "metaphors":"ela.fig.metaphor",
 "missingfactors":"math.factors.missing",
 "modalverbs":"ela.verbs.modal",
 "money":"math.money",
 "moneypatterns":"math.money.patterns",
 "moreorless":"math.moreorless",
 "multidigitaddition":"math.add.multi",
 "multidigitmultiplication":"math.pk.multi_digit_multiplication",
 "multidigitsubtraction":"math.sub.multi",
 "multiplemeaningwords":"ela.multimeaning",
 "multiples":"math.multiples",
 "multiplesoffractions":"math.frac.multiples",
 "multiplication":"math.mult.2x1",
 "multiplicationfacts":"math.mult.facts",
 "multiplicationinputoutputtables":"math.mult.iotable",
 "multiplicationpatterns":"math.pk.multiplication_patterns",
 "multiplicationpatternsover":"math.pk.multiplication_patterns_over_increasing_place_",
 "multiplyfractionsandmixednumbers":"math.frac.multmixed",
 "multiplyingadecimalbyamultidigit":"math.pk.multiplying_a_decimal_by_a_multi_digit_number",
 "multiplyingadecimalbyaonedigit":"math.pk.multiplying_a_decimal_by_a_one_digit_number",
 "multiplyingadecimalbyapoweroften":"math.pk.multiplying_a_decimal_by_a_power_of_ten",
 "multiplyingamixednumberby":"math.pk.multiplying_a_mixed_number_by_a_whole_number",
 "multiplyingfourdigitnumbersby":"math.pk.multiplying_four_digit_numbers_by_one_digit_nu",
 "multiplyingfractions":"math.frac.mult",
 "multiplyingfractionsandmixed":"math.pk.multiplying_fractions_and_mixed_numbers",
 "multiplyingfractionsbywhole":"math.frac.xwhole",
 "multiplyingfractionsbywholenumbers":"math.frac.xwhole",
 "multiplyinglargernumbers":"math.pk.multiplying_larger_numbers",
 "multiplyingnumbersendinginzeroes":"math.mult.zeros",
 "multiplyingthreedigitnumbersby":"math.pk.multiplying_three_digit_numbers_by_two_digit_n",
 "multiplyingthreenumbers":"math.mult.three",
 "multiplyingthreeormorefractions":"math.pk.multiplying_three_or_more_fractions",
 "multiplyingthreeormoremixed":"math.pk.multiplying_three_or_more_mixed_numbers",
 "multiplyingthreeormorenumbers":"math.pk.multiplying_three_or_more_numbers",
 "multiplyingthreetwodigitnumbers":"math.mult.three2",
 "multiplyingtwofractionsfillinthe":"math.pk.multiplying_two_fractions_fill_in_the_missing_",
 "multiplyingtwothreeandfourdigit":"math.pk.multiplying_two_three_and_four_digit_numbers",
 "multiplyingtwounitfractions":"math.pk.multiplying_two_unit_fractions",
 "multiplyingunitfractions":"math.frac.unitmult",
 "multiplyingunitfractionsbywhole":"math.frac.unitxwhole",
 "multiplyingunitfractionsbywholenumbers":"math.frac.unitxwhole",
 "mysterynumber":"math.mystery",
 "mysterynumbers":"math.mystery.plural",
 "numbermazes":"math.pk.number_mazes",
 "numberofsidesinpolygons":"math.pk.number_of_sides_in_polygons",
 "numberpatterns":"math.patterns.number",
 "numberpuzzles":"math.puzzles",
 "objectsonacoordinateplane":"math.pk.objects_on_a_coordinate_plane",
 "onomatopoeia":"ela.fig.onomatopoeia",
 "orderingadjectives":"ela.mod.ordering",
 "orderingdecimals":"math.dec.order",
 "orderofoperations":"math.oporder",
 "parallelperpendicularand":"math.geom.parallel",
 "parallelperpendicularandintersectinglines":"math.geom.parallel",
 "parallelsidesinquadrilaterals":"math.pk.parallel_sides_in_quadrilaterals",
 "partsofspeech":"ela.pk.parts_of_speech",
 "parttowholeanalogies":"ela.analogies.part",
 "parttowholeandwholetopartanalogies":"ela.pk.part_to_whole_and_whole_to_part_analogies",
 "percents":"math.percent",
 "perfectverbtenses":"ela.pk.perfect_verb_tenses",
 "perimeter":"math.perimeter",
 "perimeterwithdecimalsidelengths":"ela.pk.perimeter_with_decimal_side_lengths",
 "perimeterwithfractionalsidelengths":"ela.pk.perimeter_with_fractional_side_lengths",
 "personalpossessiveandreflexivepronouns":"ela.pronouns.types",
 "personalpossessivereflexiveandrelative":"ela.pk.personal_possessive_reflexive_and_relative_pro",
 "personification":"ela.fig.personification",
 "personificationorhyperbole":"ela.fig.personhyper",
 "placevalue":"math.placevalue",
 "pluralandpossessivenouns":"ela.nouns.possessive",
 "pluralnouns":"ela.nouns.plural",
 "pointofview":"ela.pov",
 "pointslinesegmentslinesandrays":"math.geom.lines",
 "polygons":"math.geom.polygons",
 "positiveandnegativeconnotation":"ela.connotation",
 "possessivenouns":"ela.pk.possessive_nouns",
 "prefixes":"ela.prefixes",
 "prepositionalphrases":"ela.prepositions.phrases",
 "prepositionalpoem":"ela.pk.prepositional_poem",
 "prepositionoradverb":"ela.pk.preposition_or_adverb",
 "prepositions":"ela.prepositions",
 "prepositionsandtheirobjects":"ela.prepositions.objects",
 "presentandpasttenseformoftobe":"ela.verbs.tobe",
 "presentandpasttenseformsoftobe":"ela.verbs.tobe",
 "pricelists":"math.pk.price_lists",
 "pricelistswithmultiplication":"math.money.pricelist",
 "primeandcompositenumbers":"math.primecomposite",
 "primenumbers":"math.prime",
 "probability":"math.probability",
 "progressiveverbtenses":"ela.verbs.progressive",
 "pronounverbcontractions":"ela.contractions.pronoun",
 "propertiesofmultiplication":"math.mult.props",
 "punctuatingdialogue":"ela.dialogue",
 "quadrants":"math.pk.quadrants",
 "reasonabletemperaturecelsius":"math.pk.reasonable_temperature_celsius",
 "reducingsentences":"ela.pk.reducing_sentences",
 "referencematerials":"ela.reference",
 "regularandirregularpolygons":"math.pk.regular_and_irregular_polygons",
 "relatedwords":"ela.relatedwords",
 "relationshipbetweenareaandperimeter":"math.area.relationship",
 "relativepronouns":"ela.pronouns.relative",
 "repeatingdecimals":"math.pk.repeating_decimals",
 "rotationalsymmetry":"math.symmetry.rotational",
 "rounding":"math.rounding",
 "roundingdecimals":"math.pk.rounding_decimals",
 "roundingmoneyamounts":"math.rounding.money",
 "saleprices":"math.pk.sale_prices",
 "scaleneisoscelesandequilateraltriangles":"math.pk.scalene_isosceles_and_equilateral_triangles",
 "scalingfractionsbyfractions":"math.pk.scaling_fractions_by_fractions",
 "scalingmixednumbersbyfractions":"math.pk.scaling_mixed_numbers_by_fractions",
 "scalingwholenumbersbyfractions":"math.pk.scaling_whole_numbers_by_fractions",
 "scientificnotation":"math.pk.scientific_notation",
 "sentenceediting":"ela.editing",
 "sentencewriting":"ela.sentencewriting",
 "sevendigitaddition":"math.add.7",
 "sevendigitsubtraction":"math.sub.7",
 "shadesofmeaning":"ela.shades",
 "shapes":"math.geom.shapes",
 "showingcharacteremotionsandtraits":"ela.character",
 "simileormetaphor":"ela.pk.simile_or_metaphor",
 "similes":"ela.fig.simile",
 "similesandmetaphors":"ela.fig.similemetaphor",
 "simpleandcompoundsentences":"ela.sent.simplecompound",
 "simplecompoundandcomplexsentences":"ela.pk.simple_compound_and_complex_sentences",
 "sixdigitaddition":"math.add.6",
 "sixdigitsubtraction":"math.sub.6",
 "solvingequationswithdecimals":"math.pk.solving_equations_with_decimals",
 "sortingwordsbygreekorlatinroots":"ela.roots.sort",
 "sortingwordsbysharedgreek":"ela.pk.sorting_words_by_shared_greek",
 "sortingwordswithsharedsuffixes":"ela.suffixes.sort",
 "spinacoordinatingconjunction":"ela.conj.spincoord",
 "spinanddivide":"math.div.spin",
 "spinarelativeadverb":"ela.mod.spinrelativeadv",
 "subjectandobjectpronouns":"ela.pk.subject_and_object_pronouns",
 "subjectsandpredicates":"ela.sent.subjpred",
 "subordinatingconjunctions":"ela.conj.subordinating",
 "subtractingdecimalnumbers":"math.dec.sub",
 "subtractingfractionswith":"math.frac.subregroup",
 "subtractingfractionswithregrouping":"math.frac.subregroup",
 "suffixes":"ela.suffixes",
 "superlativeadjectives":"ela.mod.superlative",
 "symmetry":"math.symmetry",
 "synonymandantonymanalogies":"ela.analogies.synant",
 "synonyms":"ela.synonyms",
 "synonymsandantonyms":"ela.pk.synonyms_and_antonyms",
 "synonymsantonymsandhomophones":"ela.wordrel.mixed",
 "textstructures":"ela.pk.text_structures",
 "thesaurussearch":"ela.thesaurus",
 "threedigitbyonedigitmultiplication":"math.mult.3x1",
 "threedigitbytwodigitmultiplication":"math.mult.3x2",
 "time":"math.time",
 "timepatterns":"math.time.patterns",
 "timewordproblems":"math.time.wordproblems",
 "timezones":"math.time.zones",
 "topicandsupportingsentences":"ela.supporting",
 "topicsentences":"ela.topicsentence",
 "transitions":"ela.transitions",
 "transportationschedule":"math.time.schedule",
 "twodigitbyonedigitmultiplication":"math.mult.2x1b",
 "twodigitbytwodigitmultiplication":"math.pk.two_digit_by_two_digit_multiplication",
 "unitprices":"math.pk.unit_prices",
 "usageerrors":"ela.usage",
 "usingadjectiveswithmoreormost":"ela.pk.using_adjectives_with_more_or_most",
 "usingalliterationinacrosticpoems":"ela.pk.using_alliteration_in_acrostic_poems",
 "usingareaandperimeter":"math.area.using",
 "usingathesaurus":"ela.pk.using_a_thesaurus",
 "usingcoordinatingconjunctions":"ela.conj.usingcoord",
 "usingdescriptivewords":"ela.descriptive",
 "usinggreekandlatinrootsasclues":"ela.roots.clues",
 "usinghomophones":"ela.homophones.using",
 "usingmodalverbs":"ela.verbs.usingmodal",
 "usingrelativeadverbs":"ela.mod.relativeadv",
 "usingrelativepronouns":"ela.pk.using_relative_pronouns",
 "usingsubordinatingconjunctions":"ela.conj.usingsub",
 "usingthecorrectfrequentlyconfused":"ela.pk.using_the_correct_frequently_confused_word",
 "usingthecorrectpairofcorrelative":"ela.pk.using_the_correct_pair_of_correlative_conjunct",
 "usingthecorrectsubjectorverb":"ela.verbs.agreement",
 "usingthemeaningsofwordsasclues":"ela.pk.using_the_meanings_of_words_as_clues",
 "usingtheperfectverbtenses":"ela.pk.using_the_perfect_verb_tenses",
 "usingtheprogressiveverbtenses":"ela.pk.using_the_progressive_verb_tenses",
 "usingthesaurusentries":"ela.pk.using_thesaurus_entries",
 "usingtimeorderwords":"ela.timeorder.using",
 "usingwordsascluestothe":"ela.pk.using_words_as_clues_to_meaning",
 "verbsriseraiselielaysitset":"ela.pk.commonly_confused_verbs_rise_raise_lie_lay_sit",
 "volume":"math.pk.volume",
 "volumeofcubesandrectangular":"math.pk.volume_of_cubes_and_rectangular",
 "volumeofirregularfigures":"math.pk.volume_of_irregular_figures",
 "volumeofrectangularprisms":"math.pk.volume_of_rectangular_prisms",
 "whoorwhom":"ela.pronouns.whowhom",
 "wordanalysis":"ela.wordanalysis",
 "wordpatternanalogies":"ela.analogies.pattern",
 "wordproblems":"math.wordproblems",
 "wordswithableandible":"ela.pk.words_with_able_and_ible",
 "wordswithful":"ela.pk.wordswithful",
 "wordswithless":"ela.pk.words_with_less",
 "wordswithmis":"ela.pk.wordswithm_is",
 "wordswithpre":"ela.pk.wordswithpre",
 "wordswithre":"ela.pk.wordswithre",
 "wordswithsub":"ela.pk.wordswithsub",
 "wordswithundisinimandnon":"ela.pk.words_with_un_dis_in_im_and_non",
 "writing":"ela.writing",
 "writingalimerick":"ela.pk.writing_a_limerick",
 "writingdecimalsinexpandedform":"math.dec.expanded",
 "writingdecimalsinwordform":"math.dec.wordform",
 "writingexpressionsasdecimalnumbers":"math.pk.writing_expressions_as_decimal_numbers",
 "writingfractionsinlowestterms":"math.pk.writing_fractions_in_lowest_terms",
 "writingmultidigitnumbers":"math.write.multidigit",
 "writingnumericalexpressions":"math.pk.writing_numerical_expressions",
 "writingsentenceswithcorrelative":"ela.pk.writing_sentences_with_correlative",
 "writingsentenceswithinterjections":"ela.pk.writing_sentences_with_interjections",
 "writingtwovariableequations":"math.equations.twovar"
};
/* ==========================================================================
   DRAGONSWOOD CURRICULUM ENGINE — MATH GENERATORS
   Every generator dispatches on a stable skillId, never on display text.
   Signature: fn(r, p, i) -> {prompt, answer, choices, acceptedAnswers?}
     r = seeded rng, p = params from the skill registry, i = question index
   ========================================================================== */

function ri(r,lo,hi){return lo+Math.floor(r()*(hi-lo+1))}
function opts(r,answer,wrongs){
  const seen=new Set([String(answer)]),out=[String(answer)];
  for(const w of wrongs){const s=String(w);if(!seen.has(s)&&s!=="NaN"&&s!=="undefined"){seen.add(s);out.push(s)}if(out.length===4)break}
  let guard=0;
  while(out.length<4&&guard++<40){
    const n=Number(answer);
    const s=String(isFinite(n)?n+ri(r,-9,9)*(guard%3+1):"Option "+out.length);
    if(!seen.has(s)&&s!=="NaN"){seen.add(s);out.push(s)}
  }
  return shuffle(r,out)
}
function digitsNum(r,d){const lo=Math.pow(10,d-1),hi=Math.pow(10,d)-1;return ri(r,lo,hi)}
function gcd(a,b){return b?gcd(b,a%b):a}
function fracStr(n,d){return n+"/"+d}
function simplify(n,d){const g=gcd(n,d)||1;return[n/g,d/g]}
function comma(n){return Number(n).toLocaleString("en-US")}
function money(n){return "$"+Number(n).toFixed(2)}
const ORD=["ones","tens","hundreds","thousands","ten thousands","hundred thousands","millions"];
const NUMWORD=["zero","one","two","three","four","five","six","seven","eight","nine","ten",
 "eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty"];

const MATH_GEN = {

/* ---------------------------------------------------- whole-number ops */
addsub(r,p,i){
  const d=p.digits;
  let op=p.op; if(op==="mix") op = i%2 ? "-" : "+";
  let a=digitsNum(r,d), b=digitsNum(r,d);
  if(op==="-"&&b>a){const t=a;a=b;b=t}
  if(op==="-"&&a===b) a+=ri(r,10,99);
  const ans = op==="+" ? a+b : a-b;
  return {prompt:`${comma(a)} ${op==="+"?"+":"−"} ${comma(b)} = ?`,
    answer:comma(ans),
    choices:opts(r,comma(ans),[comma(ans+10),comma(ans-10),comma(ans+100),comma(ans-100),comma(op==="+"?a-b:a+b)])}
},
mult(r,p,i){
  const a=digitsNum(r,p.a), b=p.b===1?ri(r,2,9):digitsNum(r,p.b);
  const ans=a*b;
  return {prompt:`${comma(a)} × ${comma(b)} = ?`,answer:comma(ans),
    choices:opts(r,comma(ans),[comma(ans+b),comma(ans-b),comma(ans+a),comma(a+b),comma(ans*10)])}
},
mult3(r,p,i){
  const d=p.digits;
  const a=d===1?ri(r,2,9):ri(r,11,29), b=d===1?ri(r,2,9):ri(r,11,29), c=ri(r,2,9);
  const ans=a*b*c;
  return {prompt:`${a} × ${b} × ${c} = ?`,answer:comma(ans),
    choices:opts(r,comma(ans),[comma(a*b+c),comma(ans+c),comma(ans-a),comma(a*b*c+10)])}
},
multzeros(r,p,i){
  const a=ri(r,2,9)*Math.pow(10,ri(r,1,3)), b=ri(r,2,9)*Math.pow(10,ri(r,1,2));
  const ans=a*b;
  return {prompt:`${comma(a)} × ${comma(b)} = ?`,answer:comma(ans),
    choices:opts(r,comma(ans),[comma(ans*10),comma(ans/10),comma(ans+Math.pow(10,3))])}
},
multprops(r,p,i){
  const a=ri(r,3,9),b=ri(r,3,9),c=ri(r,2,6);
  const props=[
    ["Commutative Property of Multiplication",`${a} × ${b} = ${b} × ${a}`],
    ["Associative Property of Multiplication",`(${a} × ${b}) × ${c} = ${a} × (${b} × ${c})`],
    ["Distributive Property",`${a} × (${b} + ${c}) = ${a}×${b} + ${a}×${c}`],
    ["Identity Property of Multiplication",`${a} × 1 = ${a}`],
    ["Zero Property of Multiplication",`${a} × 0 = 0`]
  ];
  const idx=Math.floor(r()*props.length);
  const [name,eq]=props[idx];
  const others=props.filter((_,k)=>k!==idx);
  if(i%2===0)
    return {prompt:`Which equation shows the ${name}?`,answer:eq,
      choices:shuffle(r,[eq,...others.slice(0,3).map(x=>x[1])])};
  return {prompt:`Which property does this equation show?\n${eq}`,answer:name,
    choices:shuffle(r,[name,...others.slice(0,3).map(x=>x[0])])}
},
divide(r,p,i){
  const divisor=ri(r,2,9);
  const quotient=p.digits>=4?ri(r,200,1200):p.digits===3?ri(r,20,180):ri(r,6,40);
  const rem=p.rem?ri(r,1,divisor-1):0;
  const dividend=divisor*quotient+rem;
  if(p.rem){
    const ans=`${comma(quotient)} R${rem}`;
    return {prompt:`${comma(dividend)} ÷ ${divisor} = ?  (write the remainder)`,answer:ans,
      choices:opts(r,ans,[`${comma(quotient)} R${(rem%(divisor-1))+1===rem?rem+1:(rem%(divisor-1))+1}`,
        `${comma(quotient+1)} R${rem}`,`${comma(quotient-1)} R${rem}`,`${comma(quotient)} R0`])}
  }
  return {prompt:`${comma(dividend)} ÷ ${divisor} = ?`,answer:comma(quotient),
    choices:opts(r,comma(quotient),[comma(quotient+1),comma(quotient-1),comma(quotient+divisor),comma(quotient*divisor)])}
},
missingfactor(r,p,i){
  const a=ri(r,3,12),b=ri(r,4,12),prod=a*b;
  return {prompt:`${a} × ___ = ${prod}`,answer:String(b),
    choices:opts(r,b,[b+1,b-1,prod-a,a])}
},
estimate(r,p,i){
  if(p.op==="+"||p.op==="-"){
    const a=ri(r,12,89)*10+ri(r,1,9), b=ri(r,11,79)*10+ri(r,1,9);
    const ra=Math.round(a/10)*10, rb=Math.round(b/10)*10;
    const ans=p.op==="+"?ra+rb:Math.abs(ra-rb);
    const exact=p.op==="+"?a+b:Math.abs(a-b);
    return {prompt:`Estimate by rounding each number to the nearest ten: ${a} ${p.op==="+"?"+":"−"} ${b}`,
      answer:comma(ans),choices:opts(r,comma(ans),[comma(exact),comma(ans+10),comma(ans-10),comma(ans+100)])}
  }
  if(p.op==="*"){
    const a=ri(r,21,89), b=ri(r,3,9);
    const ra=Math.round(a/10)*10, ans=ra*b;
    return {prompt:`Estimate by rounding to the nearest ten: ${a} × ${b}`,
      answer:comma(ans),choices:opts(r,comma(ans),[comma(a*b),comma(ans+10),comma(ans-b*10),comma(ans*10)])}
  }
  const divisor=ri(r,3,9), q=ri(r,4,9)*10, dividend=divisor*q+ri(r,1,divisor-1);
  return {prompt:`Estimate the quotient using compatible numbers: ${comma(dividend)} ÷ ${divisor}`,
    answer:comma(q),choices:opts(r,comma(q),[comma(q+10),comma(q-10),comma(q*divisor),comma(q+1)])}
},

/* ---------------------------------------------------- place value & rounding */
placevalue(r,p,i){
  const n=ri(r,10000,999999), s=String(n);
  const posFromRight=ri(r,0,s.length-1);
  const place=ORD[posFromRight];
  const digit=Number(s[s.length-1-posFromRight]);
  const modes=i%2;
  if(modes===0){
    return {prompt:`In ${comma(n)}, which digit is in the ${place} place?`,answer:String(digit),
      choices:opts(r,digit,[(digit+1)%10,(digit+2)%10,(digit+7)%10,(digit+4)%10])}
  }
  const val=digit*Math.pow(10,posFromRight);
  return {prompt:`In ${comma(n)}, what is the VALUE of the digit ${digit} in the ${place} place?`,
    answer:comma(val),choices:opts(r,comma(val),[String(digit),comma(val*10),comma(val/10),comma(digit*10)])}
},
writenum(r,p,i){
  const n=ri(r,1000,99999);
  const expanded=String(n).split("").reverse()
    .map((d,idx)=>Number(d)?Number(d)*Math.pow(10,idx):0).filter(Boolean).reverse().map(comma).join(" + ");
  return {prompt:`Which is ${comma(n)} written in expanded form?`,answer:expanded,
    choices:opts(r,expanded,[String(n).split("").join(" + "),
      expanded.split(" + ").reverse().join(" + "),
      expanded.replace(/,/g,"")+" + 0"])}
},
rounding(r,p,i){
  if(p.mode==="money"){
    const amt=(ri(r,100,9999)/100);
    const ans=Math.round(amt);
    return {prompt:`Round ${money(amt)} to the nearest dollar.`,answer:money(ans),
      choices:opts(r,money(ans),[money(ans+1),money(Math.max(0,ans-1)),money(Math.floor(amt)),money(Math.ceil(amt))])}
  }
  const places=[[10,"ten"],[100,"hundred"],[1000,"thousand"],[10000,"ten thousand"]];
  const [to,name]=bp(r,places,i);
  const n=ri(r,to*2,to*90)+ri(r,1,to-1);
  const ans=Math.round(n/to)*to;
  return {prompt:`Round ${comma(n)} to the nearest ${name}.`,answer:comma(ans),
    choices:opts(r,comma(ans),[comma(ans+to),comma(Math.max(0,ans-to)),comma(Math.floor(n/to)*to),comma(n)])}
},
comparenum(r,p,i){
  if(p.kind==="decimal"){
    let a=(ri(r,101,999)/100), b=(ri(r,101,999)/100);
    if(a===b) b+=0.07;
    const A=a.toFixed(2),B=b.toFixed(2),ans=a>b?A:B;
    return {prompt:`Which decimal is greater: ${A} or ${B}?`,answer:ans,
      choices:shuffle(r,[A,B,"They are equal","Cannot be determined"])}
  }
  let a=digitsNum(r,ri(r,4,6)), b=digitsNum(r,ri(r,4,6));
  if(a===b) b+=17;
  const ans=String(Math.max(a,b));
  return {prompt:`Which number is greater: ${comma(a)} or ${comma(b)}?`,answer:comma(Math.max(a,b)),
    choices:shuffle(r,[comma(a),comma(b),"They are equal","Cannot be determined"])}
},
moreless(r,p,i){
  const n=ri(r,1200,8900), step=[10,100,1000][i%3];
  const more=i%2===0;
  const ans=more?n+step:n-step;
  return {prompt:`What is ${comma(step)} ${more?"more":"less"} than ${comma(n)}?`,answer:comma(ans),
    choices:opts(r,comma(ans),[comma(more?n-step:n+step),comma(n+step*10),comma(n)])}
},
magicnum(r,p,i){
  const target=ri(r,20,60), a=ri(r,3,target-4);
  return {prompt:`A magic number puzzle: ${a} + ___ = ${target}. What is the missing number?`,
    answer:String(target-a),choices:opts(r,target-a,[target+a,target-a+1,target-a-1,a])}
},
mystery(r,p,i){
  const modes=i%4;
  if(modes===0){
    const n=ri(r,20,99);
    return {prompt:`Mystery number: I am even, greater than ${n-3}, and less than ${n+3}. Which could I be?`,
      answer:String(n%2?n+1:n),choices:opts(r,n%2?n+1:n,[n%2?n:n+1,n+5,n-5])}
  }
  if(modes===1){
    const a=ri(r,4,12),b=ri(r,4,12);
    return {prompt:`Mystery number: my factors include ${a} and ${b}, and I am their product. What am I?`,
      answer:String(a*b),choices:opts(r,a*b,[a+b,a*b+a,a*b-b])}
  }
  if(modes===2){
    const n=ri(r,100,900);
    return {prompt:`Number puzzle: I am ${comma(n)}. Round me to the nearest hundred. What do you get?`,
      answer:comma(Math.round(n/100)*100),
      choices:opts(r,comma(Math.round(n/100)*100),[comma(Math.floor(n/100)*100),comma(Math.ceil(n/100)*100+100),comma(n)])}
  }
  const d=ri(r,2,9),q=ri(r,5,20);
  return {prompt:`Number puzzle: I am a multiple of ${d}. Dividing me by ${d} gives ${q}. What am I?`,
    answer:String(d*q),choices:opts(r,d*q,[d+q,d*q+d,d*q-q])}
},
choosenum(r,p,i){
  if(p.kind==="decimal"){
    const a=(ri(r,11,49)/10), b=(ri(r,11,49)/10);
    const ans=(a+b).toFixed(1);
    return {prompt:`Which two decimals have a sum of ${ans}?`,answer:`${a.toFixed(1)} and ${b.toFixed(1)}`,
      choices:opts(r,`${a.toFixed(1)} and ${b.toFixed(1)}`,
        [`${(a+0.5).toFixed(1)} and ${b.toFixed(1)}`,`${a.toFixed(1)} and ${(b+1).toFixed(1)}`,`${(a-0.3).toFixed(1)} and ${(b-0.3).toFixed(1)}`])}
  }
  const a=ri(r,12,60),b=ri(r,12,60);
  return {prompt:`Which two numbers have a sum of ${a+b}?`,answer:`${a} and ${b}`,
    choices:opts(r,`${a} and ${b}`,[`${a+2} and ${b}`,`${a} and ${b-3}`,`${a+5} and ${b+5}`])}
},

/* ---------------------------------------------------- patterns & equations */
patterns(r,p,i){
  const start=ri(r,2,15), step=ri(r,2,12), mult=i%3===2;
  if(mult){
    const k=ri(r,2,3), seq=[start,start*k,start*k*k,start*k*k*k];
    return {prompt:`Find the pattern and continue it: ${seq.slice(0,3).join(", ")}, ___`,
      answer:comma(seq[3]),choices:opts(r,comma(seq[3]),[comma(seq[2]+k),comma(seq[3]+k),comma(seq[2]*2)])}
  }
  const up=i%2===0;
  const seq=[0,1,2,3].map(n=>up?start+step*n:start+step*4-step*n);
  return {prompt:`Find the pattern and continue it: ${seq.slice(0,3).join(", ")}, ___`,
    answer:comma(seq[3]),choices:opts(r,comma(seq[3]),[comma(seq[3]+step),comma(seq[3]-step),comma(seq[2]+1)])}
},
iotable(r,p,i){
  const k=ri(r,2,9), add=ri(r,3,20);
  const isMul=p.op==="*";
  const rule=isMul?`multiply by ${k}`:`add ${add}`;
  const ins=[ri(r,2,9),ri(r,10,19),ri(r,20,29)];
  const f=x=>isMul?x*k:x+add;
  const q=ri(r,30,60);
  return {prompt:`Input/Output table — the rule is “${rule}”.\nIn ${ins[0]} → Out ${f(ins[0])} · In ${ins[1]} → Out ${f(ins[1])} · In ${q} → Out ___`,
    answer:comma(f(q)),choices:opts(r,comma(f(q)),[comma(q),comma(f(q)+k),comma(isMul?q+k:q*add)])}
},
equations(r,p,i){
  if(p.twovar){
    const k=ri(r,2,8), x=ri(r,3,12);
    return {prompt:`A pattern follows the rule y = ${k}x. When x = ${x}, what is y?`,answer:String(k*x),
      choices:opts(r,k*x,[k+x,k*x+k,x])}
  }
  const modes=i%3;
  if(modes===0){const a=ri(r,12,60),b=ri(r,5,40);
    return {prompt:`Complete the equation: ${a} + ___ = ${a+b}`,answer:String(b),choices:opts(r,b,[a,a+b,b+a])}}
  if(modes===1){const a=ri(r,30,90),b=ri(r,5,25);
    return {prompt:`Complete the equation: ${a} − ___ = ${a-b}`,answer:String(b),choices:opts(r,b,[a-b,a,b+2])}}
  const a=ri(r,3,12),b=ri(r,3,12);
  return {prompt:`Complete the equation: ${a} × ___ = ${a*b}`,answer:String(b),choices:opts(r,b,[a,a*b,b+1])}
},
oporder(r,p,i){
  const a=ri(r,3,9),b=ri(r,2,8),c=ri(r,2,6);
  const forms=[
    {p:`Evaluate: (${a} + ${b}) × ${c}`,a:(a+b)*c,w:[a+b*c,a+b+c,a*b+c]},
    {p:`Evaluate: ${a} + ${b} × ${c}`,a:a+b*c,w:[(a+b)*c,a*b+c,a+b+c]},
    {p:`Evaluate: ${a} × ${b} − ${c}`,a:a*b-c,w:[a*(b-c),a*b+c,a-b*c]},
    {p:`Evaluate: ${a*c} ÷ ${c} + ${b}`,a:a+b,w:[a*c/(c+b),a+b*c,a*b]}
  ];
  const f=bp(r,forms,i);
  return {prompt:f.p,answer:String(f.a),choices:opts(r,f.a,f.w)}
},
factors(r,p,i){
  const n=[12,16,18,20,24,28,30,36,40,42,48][i%11];
  const all=[];for(let k=1;k<=n;k++)if(n%k===0)all.push(k);
  const good=all[ri(r,1,all.length-2)];
  const bad=[];for(let k=2;k<=n;k++)if(n%k!==0)bad.push(k);
  return {prompt:`Which number is a factor of ${n}?`,answer:String(good),
    choices:opts(r,good,shuffle(r,bad).slice(0,3))}
},
multiples(r,p,i){
  const n=ri(r,3,12), k=ri(r,3,9), ans=n*k;
  const bad=[ans+1,ans-1,ans+n-1].filter(x=>x%n!==0);
  return {prompt:`Which number is a multiple of ${n}?`,answer:String(ans),
    choices:opts(r,ans,bad.length?bad:[ans+1,ans+2,ans+3])}
},
primecomposite(r,p,i){
  const primes=[11,13,17,19,23,29,31,37,41,43], comps=[15,21,25,27,33,35,39,45,49,51];
  const usePrime=i%2===0, n=usePrime?pick(r,primes):pick(r,comps);
  return {prompt:`Is ${n} prime or composite?`,answer:usePrime?"prime":"composite",
    choices:shuffle(r,["prime","composite","neither","both"])}
},

/* ---------------------------------------------------- fractions */
fracequiv(r,p,i){
  const d=pick(r,[3,4,5,6,8,10,12]), n=ri(r,1,d-1), k=pick(r,[2,3,4]);
  const ans=fracStr(n*k,d*k);
  return {prompt:`Which fraction is equivalent to ${fracStr(n,d)}?`,answer:ans,
    choices:opts(r,ans,[fracStr(n+k,d+k),fracStr(n*k,d),fracStr(n,d*k),fracStr(n+1,d+1)])}
},
fraccompare(r,p,i){
  const d=pick(r,[4,5,6,8,10,12]);
  let n1=ri(r,1,d-1),n2=ri(r,1,d-1); if(n1===n2)n2=n1===1?d-1:n1-1;
  const ans=fracStr(Math.max(n1,n2),d);
  return {prompt:`Which fraction is greater: ${fracStr(n1,d)} or ${fracStr(n2,d)}?`,answer:ans,
    choices:shuffle(r,[fracStr(n1,d),fracStr(n2,d),"They are equal","Cannot be determined"])}
},
fracdecompose(r,p,i){
  const d=pick(r,[4,5,6,8]), n=ri(r,2,d-1);
  const ans=Array(n).fill(fracStr(1,d)).join(" + ");
  return {prompt:`Which sum shows ${fracStr(n,d)} decomposed into unit fractions?`,answer:ans,
    choices:opts(r,ans,[Array(n).fill(fracStr(1,d+1)).join(" + "),
      Array(Math.max(1,n-1)).fill(fracStr(1,d)).join(" + "),
      Array(n+1).fill(fracStr(1,d)).join(" + ")])}
},
fracdenom(r,p,i){
  const mode=i%3;
  if(mode===0){
    const n=ri(r,1,9), ans=fracStr(n*10,100);
    return {prompt:`Which fraction with a denominator of 100 is equivalent to ${fracStr(n,10)}?`,answer:ans,
      choices:opts(r,ans,[fracStr(n,100),fracStr(n*100,100),fracStr(n+10,100),fracStr(n*10,10)])}
  }
  if(mode===1){
    const n=ri(r,1,9)*10, ans=fracStr(n/10,10);
    return {prompt:`Which fraction with a denominator of 10 is equivalent to ${fracStr(n,100)}?`,answer:ans,
      choices:opts(r,ans,[fracStr(n,10),fracStr(n/10,100),fracStr(n+10,10)])}
  }
  const a=ri(r,1,9), b=ri(r,11,89);
  const ans=fracStr(a*10+b,100);
  return {prompt:`${fracStr(a,10)} + ${fracStr(b,100)} = ?  (write with a denominator of 100)`,answer:ans,
    choices:opts(r,ans,[fracStr(a+b,100),fracStr(a+b,110),fracStr(a*10+b,10)])}
},
fracaddsub(r,p,i){
  const d=pick(r,[5,6,8,10,12]);
  let op=p.op; if(op==="mix") op=i%2?"-":"+";
  let n1=ri(r,1,d-2),n2=ri(r,1,Math.max(1,d-n1-1));
  if(op==="-"){ n1=ri(r,2,d-1); n2=ri(r,1,Math.max(1,n1-1)) }
  const num=op==="+"?n1+n2:n1-n2;
  const ans=redStr(num,d);
  return {prompt:`${fracStr(n1,d)} ${op==="+"?"+":"−"} ${fracStr(n2,d)} = ?  (reduce your answer)`,answer:ans,
    choices:opts(r,ans,[fracStr(num,d),fracStr(num,d*2),fracStr(op==="+"?n1+n2:Math.abs(n1-n2),d+d),
      redStr(num+1,d),redStr(Math.max(1,num-1),d)])}
},
fracadd3(r,p,i){
  const d=pick(r,[8,10,12]);
  const a=ri(r,1,3),b=ri(r,1,3),c=ri(r,1,3);
  const ans=redStr(a+b+c,d);
  return {prompt:`${fracStr(a,d)} + ${fracStr(b,d)} + ${fracStr(c,d)} = ?  (reduce your answer)`,answer:ans,
    choices:opts(r,ans,[fracStr(a+b+c,d),fracStr(a+b+c,d*3),redStr(a+b,d),redStr(a+b+c+1,d)])}
},
fracmixed(r,p,i){
  const d=pick(r,[4,5,6,8]);
  const w1=ri(r,1,5),n1=ri(r,1,d-1),w2=ri(r,1,3),n2=ri(r,1,d-n1);
  const add=i%2===0;
  if(add){
    const totN=n1+n2, w=w1+w2+Math.floor(totN/d), rem=totN%d;
    const ans=rem?`${w} ${redStr(rem,d)}`:`${w}`;
    return {prompt:`${w1} ${fracStr(n1,d)} + ${w2} ${fracStr(n2,d)} = ?`,answer:ans,
      choices:opts(r,ans,[`${w1+w2} ${fracStr(totN,d)}`,`${w+1} ${fracStr(rem,d)}`,`${w1+w2} ${fracStr(n1+n2,d*2)}`])}
  }
  const big=w1+2;
  const ans=`${big-w2} ${redStr(n1,d)}`;
  return {prompt:`${big} ${fracStr(n1+n2,d)} − ${w2} ${fracStr(n2,d)} = ?`,answer:ans,
    choices:opts(r,ans,[`${big-w2} ${fracStr(n1+n2,d)}`,`${big+w2} ${fracStr(n1,d)}`,`${big-w2-1} ${fracStr(n1,d)}`])}
},
fraccomparesums(r,p,i){
  const d=pick(r,[6,8,10,12]);
  const a=ri(r,1,3),b=ri(r,1,3),c=ri(r,1,3),e=ri(r,1,3);
  const s1=a+b,s2=c+e;
  if(s1===s2) return MATH_GEN.fracaddsub(r,{op:"+"},i);
  const ans=s1>s2?`${fracStr(a,d)} + ${fracStr(b,d)}`:`${fracStr(c,d)} + ${fracStr(e,d)}`;
  return {prompt:`Which sum is greater?`,answer:ans,
    choices:shuffle(r,[`${fracStr(a,d)} + ${fracStr(b,d)}`,`${fracStr(c,d)} + ${fracStr(e,d)}`,"They are equal","Cannot be determined"])}
},
fracxwhole(r,p,i){
  const d=pick(r,[3,4,5,6,8]);
  const n=p.unit?1:ri(r,2,d-1);
  const w=ri(r,2,9);
  const num=n*w;
  const ans=redStr(num,d);
  return {prompt:`${fracStr(n,d)} × ${w} = ?  (reduce your answer)`,answer:ans,
    choices:opts(r,ans,[fracStr(num,d),fracStr(n,d*w),fracStr(num,d*w),fracStr(n+w,d)])}
},
fracmultmixed(r,p,i){
  const d=pick(r,[2,3,4]), w=ri(r,1,3), n=ri(r,1,d-1)||1, k=ri(r,2,5);
  const improper=w*d+n, num=improper*k;
  const ans=mixedStr(num,d);
  return {prompt:`${w} ${fracStr(n,d)} × ${k} = ?  (write the answer as a mixed number in lowest terms)`,answer:ans,
    choices:opts(r,ans,[fracStr(num,d),mixedStr(improper,d*k),mixedStr(w*k,d),mixedStr(num+k,d)])}
},
fracmultiples(r,p,i){
  const d=pick(r,[4,5,6,8]), n=ri(r,1,d-1), k=ri(r,2,5);
  const ans=fracStr(n*k,d);
  return {prompt:`Which fraction is a multiple of ${fracStr(n,d)}?`,answer:ans,
    choices:opts(r,ans,[fracStr(n,d*k),fracStr(n+k,d),fracStr(n*k,d*k),fracStr(n*k+1,d)])}
},
fracofnumber(r,p,i){
  const d=pick(r,[2,3,4,5,6]), n=ri(r,1,d-1), whole=d*ri(r,3,12);
  const ans=whole/d*n;
  return {prompt:`What is ${fracStr(n,d)} of ${whole}?`,answer:String(ans),
    choices:opts(r,ans,[whole/d,whole-ans,ans+d,whole*n])}
},
fracconvert(r,p,i){
  const d=pick(r,[3,4,5,6,8]), w=ri(r,2,6), n=ri(r,1,d-1);
  const improper=w*d+n;
  if(i%2===0)
    return {prompt:`Write ${w} ${fracStr(n,d)} as an improper fraction.`,answer:fracStr(improper,d),
      choices:opts(r,fracStr(improper,d),[fracStr(w+n,d),fracStr(w*d,d),fracStr(improper+1,d)])};
  return {prompt:`Write ${fracStr(improper,d)} as a mixed number.`,answer:`${w} ${fracStr(n,d)}`,
    choices:opts(r,`${w} ${fracStr(n,d)}`,[`${w+1} ${fracStr(n,d)}`,`${w} ${fracStr(n+1,d)}`,`${d} ${fracStr(w,n||1)}`])}
},
fractodecimal(r,p,i){
  const useHundredths=i%2===1;
  const n=useHundredths?ri(r,11,99):ri(r,1,9);
  const d=useHundredths?100:10;
  const dec=(n/d).toFixed(useHundredths?2:1);
  return {prompt:`Write ${fracStr(n,d)} as a decimal.`,answer:dec,
    choices:opts(r,dec,[(n/(d*10)).toFixed(3),String(n),(n/(d/10)).toFixed(1),"0."+n])}
},
fraccompdec(r,p,i){
  const n=ri(r,1,9), dec=(n/10).toFixed(1), other=((n+ri(r,1,3))/10).toFixed(1);
  const bigger=Math.max(Number(dec),Number(other)).toFixed(1);
  return {prompt:`On a number line, which is farther to the right: ${fracStr(n,10)} or ${other}?`,
    answer:bigger===dec?fracStr(n,10):other,
    choices:shuffle(r,[fracStr(n,10),other,"They are at the same point","Cannot be determined"])}
},

/* ---------------------------------------------------- decimals */
decaddsub(r,p,i){
  let op=p.op; if(op==="mix")op=i%2?"-":"+";
  let a=ri(r,101,999)/100, b=ri(r,101,999)/100;
  if(op==="-"&&b>a){const t=a;a=b;b=t}
  const ans=(op==="+"?a+b:a-b).toFixed(2);
  return {prompt:`${a.toFixed(2)} ${op==="+"?"+":"−"} ${b.toFixed(2)} = ?`,answer:ans,
    choices:opts(r,ans,[(Number(ans)+0.1).toFixed(2),(Number(ans)-0.1).toFixed(2),(Number(ans)*10).toFixed(2),(op==="+"?a-b:a+b).toFixed(2)])}
},
decorder(r,p,i){
  const set=[];while(set.length<4){const v=(ri(r,10,99)/10).toFixed(1);if(!set.includes(v))set.push(v)}
  const sorted=[...set].sort((x,y)=>Number(x)-Number(y));
  const ans=sorted.join(", ");
  return {prompt:`Put these decimals in order from LEAST to GREATEST: ${set.join(", ")}`,answer:ans,
    choices:opts(r,ans,[[...sorted].reverse().join(", "),set.join(", "),[...sorted].sort().join(", ")])}
},
decexpanded(r,p,i){
  const whole=ri(r,1,9), t=ri(r,1,9), h=ri(r,1,9);
  const num=`${whole}.${t}${h}`;
  const ans=`${whole} + 0.${t} + 0.0${h}`;
  return {prompt:`Which is ${num} written in expanded form?`,answer:ans,
    choices:opts(r,ans,[`${whole} + ${t} + ${h}`,`${whole} + 0.0${t} + 0.${h}`,`${whole} + 0.${t}${h}`])}
},
decwordform(r,p,i){
  const whole=ri(r,1,9), t=ri(r,1,9);
  const ans=`${NUMWORD[whole]} and ${NUMWORD[t]} tenths`;
  return {prompt:`Write ${whole}.${t} in word form.`,answer:ans,
    choices:opts(r,ans,[`${NUMWORD[whole]} and ${NUMWORD[t]} hundredths`,
      `${NUMWORD[whole]} point ${NUMWORD[t]}`,`${NUMWORD[t]} and ${NUMWORD[whole]} tenths`])}
},

/* ---------------------------------------------------- money / time / measure */
money(r,p,i){
  if(p.mode==="compare"){
    let a=ri(r,150,900)/100,b=ri(r,150,900)/100; if(a===b)b+=0.25;
    return {prompt:`Which is more money: ${money(a)} or ${money(b)}?`,answer:money(Math.max(a,b)),
      choices:shuffle(r,[money(a),money(b),"They are equal","Cannot be determined"])}
  }
  if(p.mode==="pattern"){
    const start=ri(r,2,6), step=ri(r,1,4)*0.25;
    const seq=[0,1,2].map(k=>money(start+step*k));
    return {prompt:`Money pattern — what comes next? ${seq.join(", ")}, ___`,answer:money(start+step*3),
      choices:opts(r,money(start+step*3),[money(start+step*4),money(start+step*2),money(start)])}
  }
  if(p.mode==="pricelist"){
    const price=ri(r,125,899)/100, qty=ri(r,2,7);
    const ans=(price*qty).toFixed(2);
    return {prompt:`A shop sells lantern oil for ${money(price)} each. What do ${qty} cost?`,answer:money(ans),
      choices:opts(r,money(ans),[money((price*(qty+1)).toFixed(2)),money((price+qty).toFixed(2)),money((price*qty/2).toFixed(2))])}
  }
  const a=ri(r,125,899)/100, b=ri(r,125,899)/100;
  const ans=(a+b).toFixed(2);
  return {prompt:`${money(a)} + ${money(b)} = ?`,answer:money(ans),
    choices:opts(r,money(ans),[money((a-b).toFixed(2)),money((Number(ans)+1).toFixed(2)),money((Number(ans)-0.1).toFixed(2))])}
},
time(r,p,i){
  if(p.mode==="elapsed"){
    const h=ri(r,1,10), m=pick(r,[0,15,30,45]);
    const addH=ri(r,1,4), addM=pick(r,[15,30,45]);
    let eh=h+addH, em=m+addM; if(em>=60){em-=60;eh++}
    const f=(H,M)=>`${((H-1)%12)+1}:${String(M).padStart(2,"0")}`;
    const ans=`${addH} hour${addH>1?"s":""} ${addM} minutes`;
    return {prompt:`A quest begins at ${f(h,m)} and ends at ${f(eh,em)}. How much time passed?`,answer:ans,
      choices:opts(r,ans,[`${addH+1} hour${addH+1>1?"s":""} ${addM} minutes`,`${addH} hour${addH>1?"s":""} ${addM+15} minutes`,`${addH} hours 0 minutes`])}
  }
  if(p.mode==="fraction"){
    const d=pick(r,[2,3,4,6]), n=1, ans=60/d*n;
    return {prompt:`What is ${fracStr(n,d)} of an hour, in minutes?`,answer:String(ans),
      choices:opts(r,ans,[60-ans,ans*2,d*10])}
  }
  if(p.mode==="pattern"){
    const start=ri(r,1,8), step=pick(r,[15,20,30]);
    const mk=k=>{let t=start*60+step*k;return `${((Math.floor(t/60)-1)%12)+1}:${String(t%60).padStart(2,"0")}`};
    return {prompt:`Time pattern — what comes next? ${[0,1,2].map(mk).join(", ")}, ___`,answer:mk(3),
      choices:opts(r,mk(3),[mk(4),mk(2),mk(0)])}
  }
  if(p.mode==="zone"){
    const diff=ri(r,1,3), h=ri(r,1,9);
    const ans=`${h+diff}:00`;
    return {prompt:`It is ${h}:00 in Dragonswood. A city ${diff} time zone${diff>1?"s":""} east is ${diff} hour${diff>1?"s":""} ahead. What time is it there?`,
      answer:ans,choices:opts(r,ans,[`${h-diff}:00`,`${h}:00`,`${h+diff+1}:00`])}
  }
  if(p.mode==="schedule"){
    const dep=ri(r,6,10), dur=ri(r,2,5);
    return {prompt:`The wagon leaves at ${dep}:00 and the trip takes ${dur} hours. When does it arrive?`,
      answer:`${dep+dur}:00`,choices:opts(r,`${dep+dur}:00`,[`${dep-dur}:00`,`${dep+dur+1}:00`,`${dur}:00`])}
  }
  const units=[["hours","minutes",60],["minutes","seconds",60],["days","hours",24],["weeks","days",7]];
  const [big,small,k]=bp(r,units,i);
  const n=ri(r,2,9);
  return {prompt:`How many ${small} are in ${n} ${big}?`,answer:comma(n*k),
    choices:opts(r,comma(n*k),[comma(n+k),comma(n*k/2),comma(k)])}
},
measure(r,p,i){
  const cust=[["feet","inches",12],["yards","feet",3],["pounds","ounces",16],["gallons","quarts",4],["quarts","cups",4]];
  const met=[["meters","centimeters",100],["kilometers","meters",1000],["kilograms","grams",1000],["liters","milliliters",1000]];
  const table=p.system==="metric"?met:cust;
  const [big,small,k]=bp(r,table,i);
  const n=ri(r,2,9);
  return {prompt:`Convert: ${n} ${big} = ___ ${small}`,answer:comma(n*k),
    choices:opts(r,comma(n*k),[comma(n+k),comma(k),comma(n*k*10),comma(Math.round(n*k/10)),comma((n+1)*k)])}
},

/* ---------------------------------------------------- geometry & data */
arearect(r,p,i){
  const a=ri(r,3,14), b=ri(r,2,12);
  const isArea=p.mode==="area";
  const ans=isArea?a*b:2*(a+b);
  return {prompt:`A rectangle is ${a} units by ${b} units. What is its ${isArea?"area":"perimeter"}?`,
    answer:`${ans}${isArea?" square units":" units"}`,
    choices:opts(r,`${ans}${isArea?" square units":" units"}`,
      [`${isArea?2*(a+b):a*b}${isArea?" square units":" units"}`,`${a+b}${isArea?" square units":" units"}`,`${ans+2}${isArea?" square units":" units"}`])}
},
areacompare(r,p,i){
  const isArea=p.mode==="area";
  const a1=ri(r,3,10),b1=ri(r,3,10);
  let a2=ri(r,3,10),b2=ri(r,3,10);
  const v=(x,y)=>isArea?x*y:2*(x+y);
  if(v(a1,b1)===v(a2,b2)) a2+=1;
  const bigger=v(a1,b1)>v(a2,b2)?"Figure A":"Figure B";
  return {prompt:`Figure A is ${a1} × ${b1}. Figure B is ${a2} × ${b2}. Which has the greater ${isArea?"area":"perimeter"}?`,
    answer:bigger,choices:shuffle(r,["Figure A","Figure B","They are equal","Cannot be determined"])}
},
areamissing(r,p,i){
  const w=ri(r,3,12), area=w*ri(r,4,15);
  return {prompt:`A rectangle has an area of ${area} square units and a width of ${w} units. What is its length?`,
    answer:String(area/w),choices:opts(r,area/w,[area-w,area*w,area/w+1])}
},
arearelation(r,p,i){
  const a=ri(r,4,10),b=ri(r,2,8);
  if(i%2===0)
    return {prompt:`A garden is ${a} m by ${b} m. You need fencing for the border. Do you calculate area or perimeter?`,
      answer:"perimeter",choices:shuffle(r,["perimeter","area","volume","both"])};
  return {prompt:`A garden is ${a} m by ${b} m. You need soil to cover the whole surface. Do you calculate area or perimeter?`,
    answer:"area",choices:shuffle(r,["area","perimeter","volume","both"])}
},
angletype(r,p,i){
  const a=pick(r,[15,30,45,60,75,89,90,100,120,135,160,180]);
  const ans=a<90?"acute":a===90?"right":a<180?"obtuse":"straight";
  return {prompt:`What kind of angle measures ${a}°?`,answer:ans,
    choices:shuffle(r,["acute","right","obtuse","straight"])}
},
angleadjacent(r,p,i){
  const total=pick(r,[90,180]);
  const a=ri(r,20,total-20);
  return {prompt:`Two adjacent angles together form a ${total===90?"right":"straight"} angle (${total}°). One measures ${a}°. What does the other measure?`,
    answer:`${total-a}°`,choices:opts(r,`${total-a}°`,[`${a}°`,`${total+a}°`,`${180-a}°`,`${total-a+10}°`])}
},
angleturns(r,p,i){
  const mode=i%4;
  const turns=[["a quarter turn",90],["a half turn",180],["three-quarters of a turn",270],["a full turn",360]];
  if(mode===0){
    const [name,deg]=bp(r,turns,i);
    return {prompt:`How many degrees is ${name}?`,answer:`${deg}°`,
      choices:shuffle(r,["90°","180°","270°","360°"])}
  }
  if(mode===1){
    const [name,deg]=bp(r,turns,i);
    return {prompt:`A dial rotates ${deg}°. How much of a full turn is that?`,answer:name,
      choices:shuffle(r,turns.map(t=>t[0]))}
  }
  if(mode===2){
    const k=ri(r,2,7);
    return {prompt:`A wheel makes ${k} quarter turns. Through how many degrees has it turned?`,
      answer:`${k*90}°`,choices:opts(r,`${k*90}°`,[`${k*45}°`,`${k*90+90}°`,`${(k-1)*90}°`,`${k*180}°`])}
  }
  const start=pick(r,["north","east","south","west"]);
  const dirs=["north","east","south","west"];
  const q=ri(r,1,3);
  const ans=dirs[(dirs.indexOf(start)+q)%4];
  return {prompt:`You face ${start} and turn ${q*90}° clockwise. Which direction do you face now?`,
    answer:ans,choices:shuffle(r,[...dirs])}
},
geomlines(r,p,i){
  const defs=[
    ["Which has TWO endpoints?","line segment",["line","ray","point"]],
    ["Which has ONE endpoint and continues forever in one direction?","ray",["line","line segment","point"]],
    ["Which continues forever in BOTH directions?","line",["ray","line segment","point"]],
    ["Which shows an exact location and has no size?","point",["line","ray","line segment"]],
    ["Which figure can be measured with a ruler because it has a definite length?","line segment",["line","ray","plane"]],
    ["A flashlight beam is most like which figure?","a ray",["a line segment","a line","a point"]],
    ["The tip of a sharpened pencil best represents which figure?","a point",["a ray","a line","a line segment"]],
    ["How many endpoints does a ray have?","1",["0","2","infinitely many"]],
    ["How many endpoints does a line have?","0",["1","2","infinitely many"]],
    ["How many endpoints does a line segment have?","2",["0","1","infinitely many"]],
    ["Which figure would you name using exactly two capital letters and a bar above them?","a line segment",["a ray","a point","a plane"]],
    ["A straight road that stretches out of sight in both directions models which figure?","a line",["a ray","a line segment","a point"]]
  ];
  const d=bp(r,defs,i);
  return {prompt:d[0],answer:d[1],choices:shuffle(r,[d[1],...d[2]])}
},
geomparallel(r,p,i){
  const defs=[
    ["Which lines never cross, no matter how far they extend?","parallel",["perpendicular","intersecting","curved"]],
    ["Which lines cross to form RIGHT angles?","perpendicular",["parallel","intersecting","curved"]],
    ["Which lines cross at a point but NOT at right angles?","intersecting",["parallel","perpendicular","curved"]],
    ["The two rails of a straight train track are ___ lines.","parallel",["perpendicular","intersecting","curved"]],
    ["The corner of a square shows two ___ sides.","perpendicular",["parallel","curved","intersecting"]],
    ["Opposite sides of a rectangle are ___.","parallel",["perpendicular","intersecting","curved"]],
    ["A capital letter T is formed by two ___ lines.","perpendicular",["parallel","curved","skew"]],
    ["A capital letter X is formed by two ___ lines.","intersecting",["parallel","perpendicular","curved"]],
    ["Lines that meet at 90° are said to be ___.","perpendicular",["parallel","intersecting","equal"]],
    ["The symbol ∥ between two lines means they are ___.","parallel",["perpendicular","intersecting","equal"]],
    ["The rungs of a ladder are ___ to each other.","parallel",["perpendicular","intersecting","curved"]],
    ["A ladder's rungs are ___ to its side rails.","perpendicular",["parallel","intersecting","curved"]]
  ];
  const d=bp(r,defs,i);
  return {prompt:d[0],answer:d[1],choices:shuffle(r,[d[1],...d[2]])}
},
polygons(r,p,i){
  const shapes=[["triangle",3],["quadrilateral",4],["pentagon",5],["hexagon",6],
    ["heptagon",7],["octagon",8],["nonagon",9],["decagon",10]];
  const quads=[["square","four equal sides and four right angles"],
    ["rectangle","four right angles and opposite sides equal"],
    ["rhombus","four equal sides but not always right angles"],
    ["trapezoid","exactly one pair of parallel sides"],
    ["parallelogram","two pairs of parallel sides"]];
  const mode=i%4;
  const [name,sides]=bp(r,shapes,i);
  if(mode===0)
    return {prompt:`How many sides does a ${name} have?`,answer:String(sides),
      choices:opts(r,sides,[sides+1,sides-1,sides+2,sides+3])};
  if(mode===1)
    return {prompt:`Which polygon has exactly ${sides} sides?`,answer:name,
      choices:shuffle(r,[name,...shuffle(r,shapes.filter(s=>s[0]!==name)).slice(0,3).map(s=>s[0])])};
  if(mode===2){
    const [q,desc]=bp(r,quads,i);
    return {prompt:`Which quadrilateral has ${desc}?`,answer:q,
      choices:shuffle(r,[q,...shuffle(r,quads.filter(x=>x[0]!==q)).slice(0,3).map(x=>x[0])])}
  }
  return {prompt:`How many ANGLES does a ${name} have?`,answer:String(sides),
    choices:opts(r,sides,[sides+1,sides-1,sides*2,sides+2])}
},
symmetry(r,p,i){
  const items=[["square",4],["rectangle",2],["equilateral triangle",3],["regular hexagon",6],
    ["regular pentagon",5],["regular octagon",8],["isosceles triangle",1],["scalene triangle",0],
    ["rhombus",2],["parallelogram",0],["kite",1],["regular decagon",10]];
  const [name,n]=bp(r,items,i);
  const mode=i%3;
  if(mode===0 && name==="square")
    return {prompt:`How many lines of symmetry does a circle have?`,answer:"infinitely many",
      choices:shuffle(r,["infinitely many","1","4","0"])};
  if(mode===1)
    return {prompt:`Which figure has exactly ${n} line${n===1?"":"s"} of symmetry?`,answer:name,
      choices:shuffle(r,[name,...shuffle(r,items.filter(x=>x[1]!==n)).slice(0,3).map(x=>x[0])])};
  return {prompt:`How many lines of symmetry does a ${name} have?`,answer:String(n),
    choices:opts(r,n,[n+1,Math.max(0,n-1),n+2,n*2])}
},
probability(r,p,i){
  const total=pick(r,[6,8,10,12]), want=ri(r,1,total-1);
  const [n,d]=simplify(want,total);
  const ans=fracStr(n,d);
  return {prompt:`A bag holds ${total} runestones. ${want} of them glow. What is the probability of drawing a glowing stone? (simplify)`,
    answer:ans,choices:opts(r,ans,[fracStr(want,total-want),fracStr(total,want),fracStr(want+1,total)])}
},
graphs(r,p,i){
  const cats=["Mon","Tue","Wed","Thu"];
  const vals=cats.map(()=>ri(r,2,20));
  const maxI=vals.indexOf(Math.max(...vals));
  const modes=i%3;
  const bars=cats.map((c,k)=>`${c}: ${vals[k]}`).join(" · ");
  if(modes===0)
    return {prompt:`Quests completed — ${bars}. Which day had the MOST?`,answer:cats[maxI],
      choices:shuffle(r,[...cats])};
  if(modes===1){
    const minI=vals.indexOf(Math.min(...vals));
    return {prompt:`Quests completed — ${bars}. Which day had the FEWEST?`,answer:cats[minI],
      choices:shuffle(r,[...cats])}
  }
  const tot=vals.reduce((a,b)=>a+b,0);
  return {prompt:`Quests completed — ${bars}. What is the TOTAL for all four days?`,answer:String(tot),
    choices:opts(r,tot,[tot-vals[0],tot+10,Math.max(...vals)])}
},
wordproblem(r,p,i){
  const modes=i%4;
  const name=pick(r,["Maya","Leo","Priya","Sam","Ana","Kofi"]);
  if(modes===0){
    const packs=ri(r,4,12), per=ri(r,6,12);
    return {prompt:`${name} buys ${packs} packs of arrows with ${per} arrows in each pack. How many arrows in all?`,
      answer:comma(packs*per),choices:opts(r,comma(packs*per),[comma(packs+per),comma(packs*per-per),comma(packs*per+per)])}
  }
  if(modes===1){
    const total=ri(r,8,15)*ri(r,3,8), groups=ri(r,3,8);
    const t=total-(total%groups);
    return {prompt:`${name} shares ${comma(t)} gold coins equally among ${groups} companions. How many does each get?`,
      answer:comma(t/groups),choices:opts(r,comma(t/groups),[comma(t-groups),comma(t/groups+1),comma(t*groups)])}
  }
  if(modes===2){
    const start=ri(r,200,900), spent=ri(r,50,190), found=ri(r,20,90);
    return {prompt:`${name} has ${comma(start)} gold, spends ${comma(spent)}, then finds ${comma(found)} more. How much gold now?`,
      answer:comma(start-spent+found),choices:opts(r,comma(start-spent+found),
        [comma(start-spent-found),comma(start+spent+found),comma(start-spent)])}
  }
  const rows=ri(r,4,9), cols=ri(r,5,12), extra=ri(r,2,9);
  return {prompt:`A courtyard has ${rows} rows of ${cols} tiles, plus ${extra} spare tiles. How many tiles altogether?`,
    answer:comma(rows*cols+extra),choices:opts(r,comma(rows*cols+extra),
      [comma(rows*cols),comma(rows*cols-extra),comma((rows+cols)*extra)])}
}

};
/* ==========================================================================
   ADDITIONAL MATH GENERATORS — 4th & 5th grade packet coverage
   ========================================================================== */

/* Reduced fraction string. The packets say "reduce to lowest terms", so the
   ANSWER is always reduced and the un-reduced form becomes a distractor —
   which is exactly the mistake these worksheets are designed to catch. */
function red(n,d){const g=gcd(Math.abs(n),Math.abs(d))||1;return [n/g,d/g]}
function redStr(n,d){const [a,b]=red(n,d);return b===1?String(a):a+"/"+b}
function mixedStr(n,d){
  if(n%d===0) return String(n/d);
  if(n<d) return redStr(n,d);
  const w=Math.floor(n/d), [a,b]=red(n%d,d);
  return `${w} ${a}/${b}`;
}
function dec(x,p){return Number(x).toFixed(p)}

Object.assign(MATH_GEN, {

/* ---------------------------------------------------- fractions */
fracdivide(r,p,i){
  const mode=p.mode||"fracbywhole";
  if(mode==="wholebyfrac"){
    const w=ri(r,2,8), d=pick(r,[2,3,4,5,6]);
    const ans=w*d;                              // w ÷ (1/d) = w·d
    return {prompt:`${w} ÷ ${fracStr(1,d)} = ?`,answer:String(ans),
      choices:opts(r,ans,[redStr(w,d),w+d,Math.round(w/d*100)/100,ans+d])}
  }
  if(mode==="fracbyfrac"){
    const a=ri(r,1,5), b=pick(r,[2,3,4,6,8]), c=ri(r,1,4), e=pick(r,[2,3,4,5]);
    const ans=redStr(a*e, b*c);                 // (a/b) ÷ (c/e) = a·e / b·c
    return {prompt:`${fracStr(a,b)} ÷ ${fracStr(c,e)} = ?  (reduce your answer)`,answer:ans,
      choices:opts(r,ans,[redStr(a*c,b*e),`${a*e}/${b*c}`,redStr(a+c,b+e),redStr(b*c,a*e)])}
  }
  if(mode==="unitbywhole"){
    const d=pick(r,[2,3,4,5,6]), k=pick(r,[2,3,4,5]);
    const ans=redStr(1,d*k);
    return {prompt:`${fracStr(1,d)} ÷ ${k} = ?`,answer:ans,
      choices:opts(r,ans,[redStr(k,d),redStr(1,d+k),`${k}/${d*k}`,redStr(d,k)])}
  }
  const a=ri(r,1,5), b=pick(r,[2,3,4,6,8]), k=pick(r,[2,3,4]);
  const ans=redStr(a,b*k);
  return {prompt:`${fracStr(a,b)} ÷ ${k} = ?  (reduce your answer)`,answer:ans,
    choices:opts(r,ans,[redStr(a*k,b),`${a}/${b*k}`,redStr(a+k,b),redStr(b*k,a)])}
},
fracmultfrac(r,p,i){
  if(p.three){
    const n=[ri(r,1,3),ri(r,1,3),ri(r,1,3)], d=[pick(r,[2,3,4]),pick(r,[2,3,5]),pick(r,[2,4,6])];
    const ans=redStr(n[0]*n[1]*n[2], d[0]*d[1]*d[2]);
    return {prompt:`${fracStr(n[0],d[0])} × ${fracStr(n[1],d[1])} × ${fracStr(n[2],d[2])} = ?  (reduce)`,
      answer:ans,choices:opts(r,ans,[`${n[0]*n[1]*n[2]}/${d[0]*d[1]*d[2]}`,
        redStr(n[0]+n[1]+n[2],d[0]+d[1]+d[2]),redStr(n[0]*n[1],d[0]*d[1])])}
  }
  const a=p.unit?1:ri(r,1,4), b=pick(r,[2,3,4,5,6]);
  const c=p.unit?1:ri(r,1,4), d=pick(r,[2,3,4,5,7]);
  const ans=redStr(a*c,b*d);
  return {prompt:`${fracStr(a,b)} × ${fracStr(c,d)} = ?  (reduce your answer)`,answer:ans,
    choices:opts(r,ans,[`${a*c}/${b*d}`,redStr(a+c,b+d),redStr(a*d,b*c),redStr(a*c,b+d)])}
},
scaling(r,p,i){
  const w=pick(r,[8,12,16,20,24]), n=ri(r,1,3), d=pick(r,[2,4,6,8]);
  const mode=i%3;
  if(mode===0){
    const ans=redStr(w*n,d);
    return {prompt:`Scale ${w} by ${fracStr(n,d)} — what is ${fracStr(n,d)} × ${w}?  (reduce)`,answer:ans,
      choices:opts(r,ans,[`${w*n}/${d}`,redStr(w,d),String(w*n),redStr(w+n,d)])}
  }
  if(mode===1){
    const bigger=n>d;
    return {prompt:`Without multiplying: is ${fracStr(n,d)} × ${w} greater than, less than, or equal to ${w}?`,
      answer:bigger?"greater than":(n===d?"equal to":"less than"),
      choices:shuffle(r,["greater than","less than","equal to","cannot tell"])}
  }
  const k=ri(r,2,5);
  return {prompt:`Scaling: ${w} × ${fracStr(k,1)} — is the result larger or smaller than ${w}?`,
    answer:"larger",choices:shuffle(r,["larger","smaller","the same","cannot tell"])}
},
fraclowest(r,p,i){
  let d=pick(r,[8,10,12,16,18,20,24]), n=ri(r,2,d-1);
  const g=gcd(n,d); if(g===1){n=Math.max(2,n-(n%2===0?0:1)); }
  const ans=redStr(n,d);
  return {prompt:`Write ${fracStr(n,d)} in lowest terms.`,answer:ans,
    choices:opts(r,ans,[fracStr(n,d),redStr(n,d*2),redStr(n*2,d),fracStr(d,n)])}
},
fractf(r,p,i){
  const d=pick(r,[4,6,8,10,12]), a=ri(r,1,d-1), b=ri(r,1,d-1);
  const trueStmt = a>b;
  const stmt=`${fracStr(a,d)} > ${fracStr(b,d)}`;
  return {prompt:`True or false?  ${stmt}`,answer:trueStmt?"true":"false",
    choices:shuffle(r,["true","false","only sometimes","cannot tell"])}
},

/* ---------------------------------------------------- decimals */
decmult(r,p,i){
  if(p.mode==="power"){
    const a=ri(r,105,989)/100, k=pick(r,[10,100,1000]);
    const ans=dec(a*k, k===10?1:(k===100?0:0));
    return {prompt:`${dec(a,2)} × ${k} = ?`,answer:String(Number(ans)),
      choices:opts(r,Number(ans),[dec(a/k,4),dec(a*k*10,0),dec(a*(k/10),1)])}
  }
  if(p.mode==="estimate"){
    const a=ri(r,11,89)/10, b=ri(r,2,9);
    const ans=Math.round(a)*b;
    return {prompt:`Estimate by rounding the decimal to the nearest whole number: ${dec(a,1)} × ${b}`,
      answer:String(ans),choices:opts(r,ans,[dec(a*b,1),ans+b,ans-b,Math.floor(a)*b])}
  }
  const a=ri(r,105,989)/100, b=ri(r,2,9);
  const ans=dec(a*b,2);
  return {prompt:`${dec(a,2)} × ${b} = ?`,answer:ans,
    choices:opts(r,ans,[dec(a*b*10,2),dec(a*b/10,2),dec(a+b,2),dec(a*b+0.1,2)])}
},
decdiv(r,p,i){
  if(p.mode==="power"){
    const a=ri(r,120,9800)/10, k=pick(r,[10,100,1000]);
    const ans=dec(a/k,3).replace(/0+$/,'').replace(/\.$/,'');
    return {prompt:`${dec(a,1)} ÷ ${k} = ?`,answer:ans,
      choices:opts(r,ans,[dec(a*k,1),dec(a/(k*10),4),dec(a/(k/10),2)])}
  }
  const divisor=ri(r,2,8), q=ri(r,12,89)/10;
  const dividend=dec(q*divisor,1);
  const ans=dec(q,1);
  return {prompt:`${dividend} ÷ ${divisor} = ?`,answer:ans,
    choices:opts(r,ans,[dec(q*10,1),dec(q/10,2),dec(q+divisor,1),dec(q-0.1,1)])}
},
decnumberline(r,p,i){
  const a=ri(r,11,89)/10, b=(a+pick(r,[0.1,0.2,0.3,0.5]));
  const mode=i%2;
  if(mode===0)
    return {prompt:`On a number line, which decimal sits farther to the RIGHT: ${dec(a,1)} or ${dec(b,1)}?`,
      answer:dec(b,1),choices:shuffle(r,[dec(a,1),dec(b,1),"they are at the same point","cannot tell"])};
  const mid=dec((a+b)/2,2);
  return {prompt:`Which decimal lies BETWEEN ${dec(a,1)} and ${dec(b,1)} on a number line?`,answer:mid,
    choices:opts(r,mid,[dec(a-0.4,2),dec(b+0.4,2),dec(a-0.1,2)])}
},
decequiv(r,p,i){
  const n=ri(r,1,9);
  const forms=[[`0.${n}`,`0.${n}0`],[`0.${n}0`,`0.${n}`],[`${n}.50`,`${n}.5`]];
  const [a,b]=bp(r,forms,i);
  return {prompt:`Which decimal is equivalent to ${a}?`,answer:b,
    choices:opts(r,b,[`0.0${n}`,`${n}.0`,`0.${n}${n}`,`00.${n}`])}
},
decrepeat(r,p,i){
  const items=[["1/3","0.333…",["0.3","0.13","3.33"]],["2/3","0.666…",["0.6","0.23","6.66"]],
    ["1/9","0.111…",["0.1","0.19","1.11"]],["1/6","0.1666…",["0.16","0.6","1.66"]],
    ["5/9","0.555…",["0.5","0.59","5.55"]]];
  const x=bp(r,items,i);
  return {prompt:`Write ${x[0]} as a decimal. (Use … for a repeating digit.)`,answer:x[1],
    choices:shuffle(r,[x[1],...x[2]])}
},

/* ---------------------------------------------------- number sense */
opspattern(r,p,i){
  const base=ri(r,2,9), other=ri(r,2,9);
  if(p.op==="mult"){
    const rows=[1,10,100].map(k=>`${base} × ${other*k} = ${base*other*k}`);
    const k=1000;
    return {prompt:`Look at the pattern:\n${rows.join("  ·  ")}\nWhat is ${base} × ${other*k}?`,
      answer:comma(base*other*k),choices:opts(r,comma(base*other*k),
        [comma(base*other*100),comma(base*other*k*10),comma(base+other*k)])}
  }
  if(p.op==="decdiv"){
    const a=base*100;
    return {prompt:`Look at the pattern:\n${a} ÷ 1 = ${a}  ·  ${a} ÷ 10 = ${a/10}  ·  ${a} ÷ 100 = ${a/100}\nWhat is ${a} ÷ 1000?`,
      answer:String(a/1000),choices:opts(r,a/1000,[a/100,a/10,a*1000])}
  }
  const prod=base*other*100;
  return {prompt:`Look at the pattern:\n${prod} ÷ ${other} = ${prod/other}  ·  ${prod/10} ÷ ${other} = ${prod/10/other}\nWhat is ${prod/100} ÷ ${other}?`,
    answer:String(prod/100/other),choices:opts(r,prod/100/other,[prod/10/other,prod/other,base*other])}
},
inequality(r,p,i){
  const mk=()=>{
    if(p.op==="decadd"){const a=ri(r,11,89)/10,b=ri(r,11,89)/10;return [`${dec(a,1)} + ${dec(b,1)}`,a+b]}
    if(p.op==="decmul"){const a=ri(r,11,49)/10,b=ri(r,2,6);return [`${dec(a,1)} × ${b}`,a*b]}
    if(p.op==="decdiv"){const b=ri(r,2,6),q=ri(r,11,59)/10;return [`${dec(q*b,1)} ÷ ${b}`,q]}
    const a=ri(r,12,90),b=ri(r,2,9);
    const which=i%3;
    if(which===0)return [`${a} + ${b}`,a+b];
    if(which===1)return [`${a} × ${b}`,a*b];
    return [`${a*b} ÷ ${b}`,a];
  };
  const [expr,val]=mk();
  const off=pick(r,[-3,-2,-1,1,2,3]);
  const target=Math.round((val+off)*10)/10;
  const ans = val>target ? ">" : (val<target ? "<" : "=");
  return {prompt:`Write <, > or = to make this true:\n${expr}  ___  ${target}`,answer:ans,
    choices:shuffle(r,["<",">","=","cannot tell"])}
},
divisibility(r,p,i){
  const rules=[[2,"ends in 0, 2, 4, 6, or 8"],[3,"its digits add up to a multiple of 3"],
    [5,"ends in 0 or 5"],[10,"ends in 0"],[9,"its digits add up to a multiple of 9"],
    [4,"its last two digits form a multiple of 4"]];
  const [d,why]=bp(r,rules,i);
  if(i%2===0){
    const yes=d*ri(r,12,80);
    let no=yes+1; while(no%d===0) no++;
    return {prompt:`Which number is divisible by ${d}?`,answer:comma(yes),
      choices:opts(r,comma(yes),[comma(no),comma(no+1),comma(yes+1),comma(yes-1)])}
  }
  return {prompt:`A number is divisible by ${d} when ___`,answer:why,
    choices:shuffle(r,[why,...shuffle(r,rules.filter(x=>x[0]!==d)).slice(0,3).map(x=>x[1])])}
},
divzeros(r,p,i){
  const q=ri(r,2,9)*Math.pow(10,ri(r,1,3)), d=ri(r,2,9);
  return {prompt:`${comma(q*d)} ÷ ${d} = ?`,answer:comma(q),
    choices:opts(r,comma(q),[comma(q*10),comma(q/10),comma(q+d),comma(q*d)])}
},
divtf(r,p,i){
  const d=ri(r,2,9), q=ri(r,6,40), correct=i%2===0;
  const shown=correct?q:q+ri(r,1,3);
  return {prompt:`True or false?  ${comma(d*q)} ÷ ${d} = ${comma(shown)}`,answer:correct?"true":"false",
    choices:shuffle(r,["true","false","only sometimes","cannot tell"])}
},
extremeproduct(r,p,i){
  const digs=shuffle(r,[2,3,4,5,6,7,8,9]).slice(0,4);
  const s=[...digs].sort((a,b)=>b-a);
  const greatest=(s[0]*10+s[2])*(s[1]*10+s[3]);
  const asc=[...digs].sort((a,b)=>a-b);
  const least=(asc[0]*10+asc[2])*(asc[1]*10+asc[3]);
  const wantMax=i%2===0;
  return {prompt:`Using the digits ${digs.join(", ")} exactly once each, form two 2-digit numbers.\nWhat is the ${wantMax?"GREATEST":"LEAST"} product you can make?`,
    answer:comma(wantMax?greatest:least),
    choices:opts(r,comma(wantMax?greatest:least),[comma(wantMax?least:greatest),
      comma(greatest+10),comma(Math.abs(least-10))])}
},
scinotation(r,p,i){
  const c=ri(r,11,99)/10, e=ri(r,2,6);
  const full=c*Math.pow(10,e);
  if(i%2===0)
    return {prompt:`Write ${comma(full)} in scientific notation.`,answer:`${dec(c,1)} × 10^${e}`,
      choices:opts(r,`${dec(c,1)} × 10^${e}`,[`${dec(c,1)} × 10^${e+1}`,`${dec(c*10,0)} × 10^${e}`,`${dec(c,1)} × 10^${e-1}`])};
  return {prompt:`What is ${dec(c,1)} × 10^${e} in standard form?`,answer:comma(full),
    choices:opts(r,comma(full),[comma(full*10),comma(full/10),comma(c*e)])}
},
temperature(r,p,i){
  const items=[["a snowy winter day","-5°C",["35°C","20°C","100°C"]],
    ["a hot summer afternoon","32°C",["-10°C","5°C","100°C"]],
    ["a comfortable classroom","21°C",["0°C","45°C","70°C"]],
    ["boiling water","100°C",["10°C","37°C","50°C"]],
    ["a glass of ice water","2°C",["25°C","60°C","90°C"]],
    ["normal body temperature","37°C",["5°C","15°C","75°C"]]];
  const x=bp(r,items,i);
  return {prompt:`What is a reasonable Celsius temperature for ${x[0]}?`,answer:x[1],
    choices:shuffle(r,[x[1],...x[2]])}
},
unitprice(r,p,i){
  const mode=i%3;
  const item=pick(r,["rope","lantern oil","dried fruit","parchment","candles","arrows"]);
  if(mode===0){
    const qty=pick(r,[2,3,4,5,6]), unit=ri(r,125,799)/100;
    const total=dec(unit*qty,2);
    return {prompt:`${qty} units of ${item} cost $${total}. What is the price per unit?`,
      answer:money(unit),choices:opts(r,money(unit),[money(Number(total)),money(unit*qty/2),money(unit+qty)])}
  }
  if(mode===1){
    const uA=ri(r,150,400)/100, qA=pick(r,[3,4,5]);
    const uB=uA+pick(r,[0.15,0.25,0.4]);
    return {prompt:`Shop A sells ${item} at ${money(uA)} each. Shop B sells it at ${money(uB)} each.\nWhich is the better buy?`,
      answer:"Shop A",choices:shuffle(r,["Shop A","Shop B","they cost the same","cannot tell"])}
  }
  const orig=ri(r,400,2000)/100, pct=pick(r,[10,20,25,50]);
  const sale=dec(orig*(100-pct)/100,2);
  return {prompt:`${item} normally costs ${money(orig)}. It is ${pct}% off. What is the sale price?`,
    answer:money(sale),choices:opts(r,money(sale),[money(orig*pct/100),money(orig),money(Number(sale)+1)])}
},

/* ---------------------------------------------------- geometry & data */
lineplot(r,p,i){
  const vals=[0.5,1,1.5,2,2.5];
  const counts=vals.map(()=>ri(r,0,4));
  if(counts.reduce((a,b)=>a+b,0)===0) counts[2]=3;
  const plot=vals.map((v,k)=>`${v}: ${"X".repeat(counts[k])||"-"}`).join("   ");
  const mode=i%3;
  if(mode===0){
    const maxI=counts.indexOf(Math.max(...counts));
    return {prompt:`Line plot of ribbon lengths (inches):\n${plot}\nWhich length appears MOST often?`,
      answer:String(vals[maxI]),choices:opts(r,vals[maxI],vals.filter(v=>v!==vals[maxI]))}
  }
  if(mode===1){
    const tot=counts.reduce((a,b)=>a+b,0);
    return {prompt:`Line plot of ribbon lengths (inches):\n${plot}\nHow many ribbons were measured in all?`,
      answer:String(tot),choices:opts(r,tot,[tot+1,tot-1,Math.max(...counts)])}
  }
  const present=vals.filter((v,k)=>counts[k]>0);
  const range=Math.max(...present)-Math.min(...present);
  return {prompt:`Line plot of ribbon lengths (inches):\n${plot}\nWhat is the difference between the longest and shortest ribbon?`,
    answer:String(range),choices:opts(r,range,[range+0.5,Math.max(...present),Math.min(...present)])}
},
graphtable(r,p,i){
  const k=ri(r,2,6);
  const xs=[1,2,3,4];
  const shown=xs.slice(0,3).map(x=>`(${x}, ${x*k})`).join("  ");
  return {prompt:`A graph passes through these points:\n${shown}\nIf the pattern continues, what is the y-value when x = 4?`,
    answer:String(4*k),choices:opts(r,4*k,[4+k,3*k,4*k+k])}
},
triangles(r,p,i){
  const bySide=[["all three sides equal","equilateral",["isosceles","scalene","right"]],
    ["exactly two sides equal","isosceles",["equilateral","scalene","obtuse"]],
    ["no sides equal","scalene",["equilateral","isosceles","right"]]];
  const byAngle=[["one angle of exactly 90°","right",["acute","obtuse","equilateral"]],
    ["all three angles less than 90°","acute",["right","obtuse","scalene"]],
    ["one angle greater than 90°","obtuse",["acute","right","isosceles"]]];
  const bank=i%2===0?bySide:byAngle;
  const x=bp(r,bank,i);
  return {prompt:`A triangle has ${x[0]}. What kind of triangle is it?`,answer:x[1],
    choices:shuffle(r,[x[1],...x[2]])}
},
quadrilaterals(r,p,i){
  const q=[["four equal sides and four right angles","square",["rectangle","rhombus","trapezoid"]],
   ["four right angles, opposite sides equal","rectangle",["square","rhombus","trapezoid"]],
   ["four equal sides, but not always right angles","rhombus",["square","rectangle","trapezoid"]],
   ["exactly one pair of parallel sides","trapezoid",["parallelogram","rhombus","rectangle"]],
   ["two pairs of parallel sides","parallelogram",["trapezoid","kite","triangle"]],
   ["two pairs of adjacent sides equal, no parallel sides","kite",["rhombus","trapezoid","square"]]];
  const x=bp(r,q,i);
  if(i%3===2){
    const pairs={"square":2,"rectangle":2,"rhombus":2,"trapezoid":1,"parallelogram":2,"kite":0};
    const n=pairs[x[1]];
    return {prompt:`How many pairs of PARALLEL sides does a ${x[1]} have?`,answer:String(n),
      choices:opts(r,n,[n+1,Math.max(0,n-1),4])}
  }
  return {prompt:`Which quadrilateral has ${x[0]}?`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
},
shapecompare(r,p,i){
  const q=[["A square and a rhombus both have four equal sides.","true",["false","only sometimes","cannot tell"]],
   ["Every rectangle is a square.","false",["true","only sometimes","cannot tell"]],
   ["Every square is a rectangle.","true",["false","only sometimes","cannot tell"]],
   ["A trapezoid has two pairs of parallel sides.","false",["true","only sometimes","cannot tell"]],
   ["All triangles have three angles.","true",["false","only sometimes","cannot tell"]],
   ["A regular polygon has all sides the same length.","true",["false","only sometimes","cannot tell"]],
   ["A rhombus is always a parallelogram.","true",["false","only sometimes","cannot tell"]],
   ["A parallelogram is always a rhombus.","false",["true","only sometimes","cannot tell"]]];
  const x=bp(r,q,i);
  return {prompt:`True or false?\n“${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
},
angleinshape(r,p,i){
  const mode=i%3;
  if(mode===0){
    const a=ri(r,30,80), b=ri(r,30,80);
    return {prompt:`Two angles of a triangle measure ${a}° and ${b}°. What is the third angle?`,
      answer:`${180-a-b}°`,choices:opts(r,`${180-a-b}°`,[`${a+b}°`,`${360-a-b}°`,`${90-a}°`])}
  }
  if(mode===1){
    const a=ri(r,60,140), b=ri(r,60,140), c=ri(r,40,100);
    return {prompt:`Three angles of a quadrilateral measure ${a}°, ${b}° and ${c}°. What is the fourth?`,
      answer:`${360-a-b-c}°`,choices:opts(r,`${360-a-b-c}°`,[`${180-c}°`,`${a+b+c}°`,`${360-a-b}°`])}
  }
  const a=ri(r,20,70);
  return {prompt:`Inside a rectangle, a diagonal makes a ${a}° angle with one side. What angle does it make with the other side at that corner?`,
    answer:`${90-a}°`,choices:opts(r,`${90-a}°`,[`${a}°`,`${180-a}°`,`${90+a}°`])}
},
areafrac(r,p,i){
  const mode=i%2;
  if(mode===0){
    const wN=ri(r,1,3), wD=pick(r,[2,4]), l=ri(r,2,8);
    const ans=redStr(wN*l,wD);
    return {prompt:`A rectangle is ${l} units long and ${fracStr(wN,wD)} units wide. What is its area?  (reduce)`,
      answer:`${ans} square units`,
      choices:opts(r,`${ans} square units`,[`${l*wN}/${wD} square units`,`${l} square units`,
        `${redStr(wN+l,wD)} square units`])}
  }
  const outerL=ri(r,8,14), outerW=ri(r,6,12), innerL=ri(r,2,5), innerW=ri(r,2,4);
  const ans=outerL*outerW-innerL*innerW;
  return {prompt:`A ${outerL} × ${outerW} rectangle has a smaller ${innerL} × ${innerW} rectangle cut out of it.\nWhat is the remaining area?`,
    answer:`${ans} square units`,choices:opts(r,`${ans} square units`,
      [`${outerL*outerW} square units`,`${innerL*innerW} square units`,`${ans+innerL} square units`])}
},
perimeterfrac(r,p,i){
  if(i%2===0){
    const a=ri(r,11,49)/10, b=ri(r,11,49)/10;
    const ans=dec(2*(a+b),1);
    return {prompt:`A rectangle measures ${dec(a,1)} units by ${dec(b,1)} units. What is its perimeter?`,
      answer:`${ans} units`,choices:opts(r,`${ans} units`,[`${dec(a*b,2)} units`,`${dec(a+b,1)} units`,`${dec(2*a+b,1)} units`])}
  }
  const n=ri(r,1,3), d=pick(r,[2,4]), w=ri(r,2,6);
  const [pn,pd]=red(2*n + 2*w*d, d);
  const ans=mixedStr(2*n+2*w*d, d);
  return {prompt:`A rectangle is ${w} units long and ${fracStr(n,d)} units wide. What is its perimeter?  (reduce)`,
    answer:`${ans} units`,choices:opts(r,`${ans} units`,[`${mixedStr(n+w*d,d)} units`,`${w*2} units`,
      `${mixedStr(2*n+w*d,d)} units`])}
}

});
/* ==========================================================================
   DRAGONSWOOD CURRICULUM ENGINE — ELA GENERATORS
   Content banks are sized so a student doing five questions in a row on one
   skill sees five genuinely different questions.
   ========================================================================== */

const SYN=[["rapid","quick",["slow","rough","late"]],["tiny","small",["huge","noisy","empty"]],
 ["fortunate","lucky",["angry","plain","careless"]],["ancient","old",["modern","bright","eager"]],
 ["generous","giving",["selfish","quiet","narrow"]],["difficult","hard",["simple","gentle","early"]],
 ["brave","courageous",["fearful","clumsy","dull"]],["enormous","gigantic",["tiny","narrow","brief"]],
 ["intelligent","clever",["foolish","silent","heavy"]],["calm","peaceful",["wild","harsh","sudden"]],
 ["examine","inspect",["ignore","shout","waste"]],["create","construct",["destroy","forget","borrow"]],
 ["evidence","proof",["opinion","rumor","guess"]],["method","procedure",["accident","reward","puzzle"]],
 ["weary","tired",["eager","swift","clever"]],["conceal","hide",["reveal","polish","gather"]],
 ["assist","help",["hinder","ignore","scatter"]],["vacant","empty",["crowded","sturdy","narrow"]],
 ["furious","angry",["pleased","curious","patient"]],["sturdy","strong",["fragile","hollow","damp"]],
 ["gather","collect",["scatter","destroy","forget"]],["reply","answer",["ask","wonder","ignore"]]];
const ANT=[["ancient","modern",["aged","historic","antique"]],["generous","selfish",["kind","giving","helpful"]],
 ["increase","decrease",["grow","expand","raise"]],["rapid","slow",["quick","swift","brisk"]],
 ["tiny","enormous",["small","little","miniature"]],["brave","cowardly",["bold","daring","fearless"]],
 ["permanent","temporary",["lasting","stable","fixed"]],["visible","hidden",["clear","obvious","plain"]],
 ["accurate","incorrect",["exact","precise","true"]],["expand","shrink",["widen","stretch","grow"]],
 ["include","exclude",["contain","add","gather"]],["accept","reject",["receive","take","allow"]],
 ["arrive","depart",["reach","enter","approach"]],["ascend","descend",["climb","rise","soar"]],
 ["scatter","gather",["spread","toss","sprinkle"]],["harsh","gentle",["rough","severe","bitter"]],
 ["vacant","occupied",["empty","bare","hollow"]],["conceal","reveal",["hide","cover","mask"]],
 ["victory","defeat",["triumph","success","win"]],["ancient","recent",["elderly","antique","aged"]]];
const HOMO=[["pair","pear",["peer","pure","par"]],["their","there",["thin","them","then"]],
 ["knight","night",["kite","light","right"]],["flour","flower",["floor","flavor","flour mill"]],
 ["principal","principle",["principled","prince","pinnacle"]],["weather","whether",["wither","weathered","wearer"]],
 ["piece","peace",["pierce","pace","police"]],["allowed","aloud",["allot","aloof","alloy"]],
 ["plain","plane",["plan","planet","plait"]],["berry","bury",["bury it","barry","burrow"]],
 ["cent","scent",["center","certain","sender"]],["heard","herd",["hurried","hoard","heart"]],
 ["mail","male",["mall","mild","meal"]],["tail","tale",["tall","till","toll"]],
 ["waist","waste",["wait","west","wrist"]],["hour","our",["hover","ore","hare"]]];
const HOMOGRAPH=[
 ["bark","The dog began to bark loudly.","the sound a dog makes",["the outer covering of a tree","a small boat","to complain"]],
 ["bark","We peeled the rough bark from the log.","the outer covering of a tree",["the sound a dog makes","a type of song","to shout"]],
 ["light","The feather was very light.","not heavy",["brightness","to set on fire","a lamp"]],
 ["light","Please turn on the light.","a source of brightness",["not heavy","pale in color","easy"]],
 ["fair","The judge made a fair decision.","just and equal",["a carnival","light in color","a price"]],
 ["fair","We rode the ferris wheel at the fair.","a carnival or festival",["just and equal","pale","reasonable"]],
 ["wave","She gave a friendly wave.","a motion of the hand",["a moving ridge of water","to give up a right","a hairstyle"]],
 ["wave","A huge wave crashed on the rocks.","a moving ridge of water",["a motion of the hand","to give up a right","a curl"]],
 ["match","Do these socks match?","to be alike",["a stick that makes fire","a contest","a marriage"]],
 ["match","He struck a match to light the lantern.","a stick that makes fire",["to be alike","a contest","a pair"]],
 ["park","We walked through the park.","a public green space",["to leave a vehicle","a fee","a path"]],
 ["park","Please park the wagon by the gate.","to leave a vehicle somewhere",["a public green space","a fee","a slope"]],
 ["trunk","The elephant lifted its trunk.","an elephant's long nose",["a tree's main stem","a large box","the back of a car"]],
 ["trunk","Lightning split the tree's trunk.","a tree's main stem",["an elephant's nose","a large box","a suitcase"]],
 ["ring","I heard the bell ring.","to make a clear sound",["a circular band","a boxing area","a group"]],
 ["ring","She wore a silver ring.","a circular band worn on a finger",["to make a sound","a boxing area","a circle of people"]]];
const ROOTS=[["port","to carry",["to see","to write","to hear"],["transport","import","portable"]],
 ["scrib / script","to write",["to carry","to break","to lead"],["scribble","manuscript","describe"]],
 ["aud","to hear",["to see","to build","to throw"],["audience","audible","auditorium"]],
 ["spect","to look or see",["to carry","to speak","to bend"],["inspect","spectator","spectacle"]],
 ["tele","far or distant",["under","around","against"],["telephone","telescope","television"]],
 ["geo","earth",["water","fire","air"],["geography","geology","geometry"]],
 ["bio","life",["light","sound","earth"],["biology","biography","biome"]],
 ["struct","to build",["to break","to hear","to carry"],["construct","structure","instruct"]],
 ["dict","to speak or say",["to write","to see","to pull"],["dictate","predict","dictionary"]],
 ["photo","light",["sound","heat","water"],["photograph","photosynthesis","photocopy"]],
 ["meter / metr","measure",["middle","many","small"],["thermometer","perimeter","metric"]],
 ["therm","heat",["cold","light","time"],["thermometer","thermal","thermos"]],
 ["gram / graph","to write or draw",["to hear","to carry","to build"],["telegram","paragraph","autograph"]],
 ["vis / vid","to see",["to hear","to say","to move"],["visible","video","envision"]],
 ["mit / miss","to send",["to hold","to break","to see"],["transmit","mission","dismiss"]],
 ["rupt","to break",["to build","to carry","to hear"],["erupt","interrupt","rupture"]],
 ["tract","to pull or drag",["to push","to see","to write"],["tractor","attract","subtract"]],
 ["cent","one hundred",["one thousand","ten","one half"],["century","centipede","percent"]],
 ["auto","self",["other","many","far"],["automatic","autograph","autobiography"]],
 ["micro","very small",["very large","round","fast"],["microscope","microphone","microwave"]]];
const PREFIX=[["un-","not or the opposite of",["again","before","after"],"unhappy"],
 ["re-","again",["not","before","under"],"rewrite"],["pre-","before",["after","not","again"],"preview"],
 ["dis-","not or opposite of",["again","many","under"],"disagree"],["mis-","wrongly",["again","before","fully"],"misplace"],
 ["im- / in-","not",["again","into","over"],"impossible"],["sub-","under or below",["above","again","against"],"submarine"],
 ["over-","too much",["under","again","before"],"overcook"],["under-","too little or beneath",["above","again","fully"],"underestimate"],
 ["non-","not",["again","many","before"],"nonfiction"],["mid-","middle",["end","before","outside"],"midnight"],
 ["inter-","between",["inside","above","against"],"international"],["trans-","across",["under","before","against"],"transport"],
 ["anti-","against",["for","before","under"],"antifreeze"],["semi-","half",["whole","double","before"],"semicircle"]];
const SUFFIX=[["-ful","full of",["without","one who","the act of"],"hopeful"],
 ["-less","without",["full of","one who","again"],"fearless"],["-er","one who does",["full of","without","not"],"teacher"],
 ["-ly","in a certain way",["full of","one who","without"],"quickly"],["-ness","the state of being",["one who","without","again"],"kindness"],
 ["-able","able to be",["without","one who","before"],"readable"],["-ment","the act or result of",["without","full of","not"],"movement"],
 ["-ion","the act or process of",["full of","without","one who"],"celebration"],["-ist","one who practices",["without","full of","again"],"scientist"],
 ["-ous","full of or having",["without","before","one who"],"dangerous"],["-ish","somewhat or like",["fully","without","again"],"reddish"],
 ["-ward","in the direction of",["without","one who","again"],"westward"],["-en","made of or to make",["without","one who","before"],"wooden"]];

/* ---- sentence-structure banks -------------------------------------------- */
const COMPLETE=["The dragon flew over the castle.","Maya sharpened her sword before dawn.",
 "The old bridge groaned under the wagon.","Leo found a silver key in the ashes.",
 "Three scouts returned from the northern pass.","The lantern flickered in the damp cavern.",
 "A cold wind swept across the courtyard.","The council argued late into the night.",
 "Priya mapped every tunnel beneath the keep.","The river froze solid by midwinter.",
 "Our guide knew every path through the forest.","The gates opened at the first bell."];
const FRAGMENT=["Over the castle wall.","Because the dragon roared.","Flying very quickly toward us.",
 "When the gate finally opened.","Under the frozen river.","Running through the dark tunnels.",
 "Although Maya knew the way.","The tall scout with the silver lantern.","After the council adjourned.",
 "Beneath a sky full of stars.","Since we left the village.","Hoping for a safe passage."];
const RUNON=["The dragon flew over the castle it was enormous.","We found the map we opened it right away.",
 "Maya climbed the tower Leo waited below.","The storm arrived we sheltered in the cave.",
 "The gate was locked we searched for another way.","Priya drew the map she marked every tunnel.",
 "The fire went out we could not see anything.","Leo shouted no one answered him.",
 "The bridge collapsed we had to swim across.","The bell rang everyone ran to the courtyard."];
const COMPOUND=["The gate was locked, so we searched for another way in.",
 "Maya climbed the tower, and Leo waited below.","We could rest now, or we could press on until dawn.",
 "The storm arrived, but the scouts kept moving.","Priya drew the map, and she marked every tunnel.",
 "The fire went out, so we lit a second lantern.","Leo shouted, yet no one answered him.",
 "The bridge collapsed, so we swam across the river.","The bell rang, and everyone ran to the courtyard.",
 "We packed the wagon, but the road was already flooded."];
const SIMPLE=["The scout climbed the tower.","Maya read the ancient map.","The dragon slept.",
 "Leo repaired the broken wheel.","Three ravens circled the keep.","The council decided quickly.",
 "Priya lit the signal fire.","Our horses drank from the stream."];

/* ---- figurative-language banks ------------------------------------------- */
const SIMILE=["The moon was like a silver shield.","Her courage was as steady as stone.",
 "The tunnel was as dark as ink.","He ran like a startled deer.","The old map felt like dry leaves.",
 "The wind howled like a hungry wolf.","Their armor shone like still water.","The path twisted like a serpent."];
const METAPHOR=["The moon was a silver shield.","Her courage was solid stone.","The tunnel was a bottomless well of ink.",
 "He was a startled deer on the open road.","The map was a brittle leaf in her hands.",
 "The wind was a hungry wolf at the door.","Their armor was still water under torchlight.","The path was a serpent through the hills."];
const PERSON=["The wind whispered through the trees.","The old gate groaned in protest.",
 "The mountains watched over the valley.","The fire danced in the hearth.",
 "The river argued with the stones.","Shadows crept along the corridor.",
 "The lantern winked out.","The forest held its breath."];
const HYPER=["I have told you a million times.","This pack weighs a ton.",
 "We waited forever at the gate.","The tower is a thousand miles high.",
 "I'm so hungry I could eat a horse.","Her smile lit up the entire kingdom.",
 "That staircase went on for eternity.","He has a brain the size of a planet."];
const LITERAL=["The moon rose above the hills.","She carried a heavy pack up the trail.",
 "The gate opened at sunrise.","We waited about ten minutes.","The tower is forty feet tall.",
 "The fire warmed the small room.","The river ran beside the road.","Leo repaired the broken wheel."];
const ALLIT=["Silver swords shimmered silently.","Brave banners billowed on the battlements.",
 "Priya packed plenty of provisions.","The dragon's dark den drew near.","Cold cavern currents carried the sound."];
const ONOMAT=["The gate creaked and the thunder boomed.","The arrow whooshed past and thudded into the door.",
 "Rain pattered while the fire crackled.","The bell clanged and the horses whinnied.","Leaves rustled and a twig snapped."];
const IDIOM=[["It's raining cats and dogs.","It is raining very hard.",["Animals are falling from the sky.","There are pets outside.","The weather is mild."]],
 ["Break a leg!","Good luck!",["Injure yourself.","Run away quickly.","Sit down and rest."]],
 ["That test was a piece of cake.","That test was very easy.",["The test involved baking.","The test was delicious.","The test was long."]],
 ["He let the cat out of the bag.","He revealed a secret.",["He freed a trapped animal.","He lost his belongings.","He made a mess."]],
 ["She hit the nail on the head.","She was exactly right.",["She used a hammer.","She injured herself.","She built something."]],
 ["We're in the same boat.","We are in the same difficult situation.",["We are sailing together.","We bought a boat.","We are lost at sea."]],
 ["Don't bite off more than you can chew.","Don't take on more than you can handle.",["Take smaller bites of food.","Chew your food slowly.","Avoid hard foods."]],
 ["That costs an arm and a leg.","That is very expensive.",["That is dangerous.","That requires surgery.","That is very heavy."]]];
const ADAGE=[["Don't count your chickens before they hatch.","Don't depend on something before it actually happens.",["Chickens are hard to count.","Always check your eggs.","Farming takes patience."]],
 ["The early bird catches the worm.","People who act promptly get the best results.",["Birds wake before people.","Worms come out in the morning.","Waking early is healthy."]],
 ["Actions speak louder than words.","What you do matters more than what you say.",["Speak more quietly.","Shouting is rude.","Words are unimportant."]],
 ["Better late than never.","Doing something late is better than not at all.",["Being late is good.","Never be on time.","Time does not matter."]],
 ["Practice makes perfect.","Repeating a skill improves it.",["Perfection is easy.","Only experts should practice.","Practice is a waste."]],
 ["Two heads are better than one.","Working together produces better results.",["People should have two heads.","Thinking alone is best.","Groups are confusing."]]];

/* ---- mechanics banks ----------------------------------------------------- */
const CAPS=[["We visited Arizona in May.",["we visited Arizona in May.","We visited arizona in May.","We visited Arizona in may."]],
 ["Dr. Alvarez read The Hobbit aloud.",["dr. Alvarez read The Hobbit aloud.","Dr. alvarez read the hobbit aloud.","Dr. Alvarez read the Hobbit Aloud."]],
 ["On Tuesday, Leo traveled to Lake Erie.",["on tuesday, Leo traveled to Lake Erie.","On tuesday, Leo traveled to lake Erie.","On Tuesday, leo traveled to Lake erie."]],
 ["Maya moved to Denver last August.",["Maya moved to denver last August.","maya moved to Denver last august.","Maya Moved to Denver last August."]],
 ["The Pacific Ocean borders California.",["the Pacific ocean borders California.","The pacific Ocean borders california.","The Pacific Ocean borders california."]],
 ["My aunt Priya speaks Spanish and French.",["my aunt Priya speaks spanish and French.","My Aunt priya speaks Spanish and french.","my aunt priya speaks Spanish and French."]],
 ["We read Charlotte's Web in Mrs. Kim's class.",["We read charlotte's web in Mrs. Kim's class.","we read Charlotte's Web in mrs. Kim's class.","We read Charlotte's Web in Mrs. kim's Class."]],
 ["The Rocky Mountains rise west of Evans.",["The rocky mountains rise west of Evans.","the Rocky Mountains rise West of evans.","The Rocky mountains rise west of evans."]],
 ["In December, Grandpa visits from Texas.",["in december, Grandpa visits from Texas.","In December, grandpa visits from texas.","In december, Grandpa visits From Texas."]],
 ["Leo joined the Explore Academy Chess Club.",["Leo joined the explore academy chess club.","leo joined the Explore Academy chess Club.","Leo joined the Explore academy Chess club."]]];
const COMMAS=[["We packed rope, lanterns, and dried fruit.",["We packed rope lanterns and dried fruit.","We packed, rope, lanterns and dried fruit.","We packed rope, lanterns and, dried fruit."]],
 ["After the storm passed, we continued north.",["After the storm passed we continued north.","After, the storm passed we continued north.","After the storm, passed we continued north."]],
 ["Yes, I found the hidden door.",["Yes I found the hidden door.","Yes I found, the hidden door.","Yes, I found the, hidden door."]],
 ["Maya, please hand me the map.",["Maya please hand me the map.","Maya please, hand me the map.","Maya, please hand, me the map."]],
 ["The scout, who was exhausted, sat down.",["The scout who was exhausted, sat down.","The scout, who was exhausted sat down.","The scout who was, exhausted sat down."]],
 ["We left on June 14, 2026, before sunrise.",["We left on June 14 2026 before sunrise.","We left on June, 14, 2026 before sunrise.","We left on June 14, 2026 before, sunrise."]],
 ["She was tired, but she kept climbing.",["She was tired but, she kept climbing.","She was, tired but she kept climbing.","She was tired but she kept, climbing."]],
 ["Leo lives in Evans, Colorado.",["Leo lives in Evans Colorado.","Leo, lives in Evans Colorado.","Leo lives in, Evans Colorado."]]];
const DIALOGUE=[['"Stop!" shouted Leo.',['Stop! shouted "Leo".','"Stop! shouted Leo.','Stop!" shouted Leo.']],
 ['Maya said, "We should turn back."',['Maya said "We should turn back."','Maya said, We should turn back.','Maya said, "we should turn back".']],
 ['"Look at this map," she whispered.',['"Look at this map." she whispered.','"Look at this map", she whispered.','Look at this map," she whispered.']],
 ['"Who goes there?" asked the guard.',['"Who goes there"? asked the guard.','"Who goes there?" Asked the guard.','Who goes there?" asked the guard.']],
 ['Priya answered, "The tunnel is flooded."',['Priya answered "The tunnel is flooded."','Priya answered, "the tunnel is flooded."','Priya answered, The tunnel is flooded.']],
 ['"Follow me," Leo said, "and stay close."',['"Follow me" Leo said "and stay close."','"Follow me," Leo said "And stay close."','"Follow me, Leo said, and stay close."']]];
const USAGE=[["Their going to the tower.","They're going to the tower.",["There going to the tower.","Theyre going to the tower.","Their going to the tower."]],
 ["The knights was ready.","The knights were ready.",["The knights is ready.","The knights been ready.","The knight were ready."]],
 ["Me and Leo found the map.","Leo and I found the map.",["Me and Leo found the map.","I and Leo found the map.","Leo and me found the map."]],
 ["She done her homework.","She did her homework.",["She done her homework.","She have did her homework.","She doed her homework."]],
 ["Its a long journey.","It's a long journey.",["Its' a long journey.","Its a long journey.","It is'nt a long journey."]],
 ["There are less students today.","There are fewer students today.",["There are lesser students today.","There are little students today.","There is less students today."]],
 ["Him and me went first.","He and I went first.",["Him and I went first.","He and me went first.","Me and him went first."]],
 ["I seen the dragon.","I saw the dragon.",["I seen the dragon.","I have saw the dragon.","I did seen the dragon."]],
 ["We was tired.","We were tired.",["We is tired.","We been tired.","We are was tired."]],
 ["Your the fastest rider.","You're the fastest rider.",["Your the fastest rider.","Youre the fastest rider.","Yours the fastest rider."]],
 ["He don't know the way.","He doesn't know the way.",["He do not know the way.","He don't knows the way.","He doesn't knows the way."]],
 ["The map is more better.","The map is better.",["The map is more better.","The map is bestest.","The map is more good."]]];

function bankOther(r,bank,not,n){
  return shuffle(r,bank.filter(x=>x!==not)).slice(0,n)
}

const ELA_GEN = {

/* ---------------------------------------------------- vocabulary */
wordrel(r,p,i){
  let rel=p.rel;
  if(rel==="mixed") rel=["synonym","antonym","homophone"][i%3];
  if(rel==="homophone") return ELA_GEN.homophone(r,{},i);
  const bank=rel==="antonym"?ANT:SYN;
  const [word,ans,wrongs]=bp(r,bank,i);
  return {prompt:`Choose the ${rel} for “${word}”.`,answer:ans,choices:shuffle(r,[ans,...wrongs]),
    acceptedAnswers:[ans]}
},
wordcontext(r,p,i){
  const items=[
   ["The path was treacherous, so the travelers moved with great care.","treacherous","dangerous","safe",["ordinary","pleasant","crowded"]],
   ["Maya was elated when she found the lost map.","elated","very happy","miserable",["very confused","quite worried","deeply tired"]],
   ["The ancient bridge was fragile and creaked underfoot.","fragile","easily broken","sturdy",["firmly attached","painted brightly","recently built"]],
   ["He spoke in a feeble voice after the long climb.","feeble","weak","powerful",["loud","calm","slow"]],
   ["The scholars debated the meaning of the inscription.","debated","argued about","agreed on",["talked quietly","wrote it down","read it aloud"]],
   ["The cavern was immense, swallowing the torchlight.","immense","very large","tiny",["slightly damp","brightly lit","rather narrow"]],
   ["Leo was reluctant to enter the dark tunnel.","reluctant","unwilling","eager",["very curious","fully prepared","quite relaxed"]],
   ["The council reached a unanimous decision.","unanimous","agreed by everyone","divided",["postponed until later","recorded in writing","finished very quickly"]],
   ["She scrutinized the map for hidden marks.","scrutinized","examined closely","glanced at",["folded carefully","copied by hand","put away safely"]],
   ["The guard's tone was hostile.","hostile","unfriendly","welcoming",["very quiet","quite formal","rather tired"]],
   ["Their supplies were meager after the storm.","meager","very small in amount","plentiful",["too heavy to carry","completely fresh","slightly wet inside"]],
   ["The knight's response was prompt.","prompt","quick and on time","delayed",["polite but delayed","loud and repeated","written in advance"]]];
  const [s,w,ans,ant,wrongs]=bp(r,items,i);
  if(p.rel==="antonym")
    return {prompt:`Read the sentence: “${s}”\nWhich word means the OPPOSITE of “${w}”?`,answer:ant,
      choices:shuffle(r,[ant,ans,...wrongs.slice(0,2)])};
  return {prompt:`Read the sentence: “${s}”\nWhat does “${w}” mean here?`,answer:ans,
    choices:shuffle(r,[ans,...wrongs])}
},
homophone(r,p,i){
  const [a,b,wrongs]=bp(r,HOMO,i);
  return {prompt:`Which word is a homophone of “${a}”?`,answer:b,choices:shuffle(r,[b,...wrongs])}
},
homograph(r,p,i){
  const [word,s,ans,wrongs]=bp(r,HOMOGRAPH,i);
  return {prompt:`Read the sentence: “${s}”\nWhat does “${word}” mean in this sentence?`,answer:ans,
    choices:shuffle(r,[ans,...wrongs])}
},
shades(r,p,i){
  const sets=[["warm","hot","scorching","cool"],["small","tiny","microscopic","large"],
    ["happy","joyful","ecstatic","sad"],["walk","jog","sprint","sit"],["like","love","adore","hate"],
    ["cool","cold","freezing","warm"],["big","huge","colossal","little"],["good","great","superb","poor"],
    ["upset","angry","furious","calm"],["damp","wet","soaked","dry"],["quiet","silent","soundless","loud"],
    ["tired","exhausted","drained","alert"],["quick","fast","blistering","slow"],["glad","delighted","overjoyed","gloomy"]];
  const s=bp(r,sets,i);
  const wantStrong=i%2===0;
  return {prompt:wantStrong?`Which word shows the STRONGEST version of “${s[0]}”?`
      :`Which word is the MILDEST — the weakest version of the idea?`,
    answer:wantStrong?s[2]:s[0],choices:shuffle(r,[s[2],s[1],s[0],s[3]])}
},
connotation(r,p,i){
  const pairs=[["thrifty","stingy"],["confident","arrogant"],["curious","nosy"],
    ["determined","stubborn"],["youthful","childish"],["relaxed","lazy"],
    ["assertive","pushy"],["unique","weird"],["frugal","cheap"],["talkative","mouthy"],
    ["careful","fussy"],["proud","conceited"],["generous","extravagant"],["quiet","withdrawn"]];
  const [pos,neg]=bp(r,pairs,i);
  const wantPos=i%2===0;
  const fillers=shuffle(r,["table","running","yellow","bucket","corner","paper"]).slice(0,2);
  return {prompt:`Which word has a ${wantPos?"POSITIVE":"NEGATIVE"} connotation?`,answer:wantPos?pos:neg,
    choices:shuffle(r,[pos,neg,...fillers])}
},
relatedwords(r,p,i){
  const groups=[["violin","cello","flute","hammer","musical instruments"],
    ["maple","oak","pine","granite","trees"],["sprint","jog","dash","whisper","ways to move quickly"],
    ["blizzard","drizzle","hurricane","boulder","kinds of weather"],
    ["copper","silver","iron","lantern","metals"],["robin","sparrow","falcon","salmon","birds"],
    ["triangle","hexagon","pentagon","cylinder","flat shapes with straight sides"],
    ["whisper","shout","mumble","gallop","ways of speaking"],
    ["cottage","cabin","mansion","meadow","places people live"],
    ["ruby","emerald","sapphire","pebble","precious gems"],
    ["kayak","canoe","raft","saddle","things that travel on water"],
    ["thyme","basil","parsley","marble","herbs"]];
  const g=bp(r,groups,i);
  return {prompt:`Three of these words are ${g[4]}. Which word does NOT belong?`,answer:g[3],
    choices:shuffle(r,[g[0],g[1],g[2],g[3]])}
},
analogy(r,p,i){
  const part=[["finger","hand","petal","flower"],["page","book","room","house"],
    ["wheel","bicycle","key","keyboard"],["branch","tree","fin","fish"],
    ["string","guitar","tooth","comb"],["brick","wall","word","sentence"],
    ["island","archipelago","tree","forest"],["scale","fish","feather","bird"]];
  const synant=[["big","large","small","little"],["hot","cold","up","down"],
    ["begin","start","finish","end"],["happy","sad","brave","fearful"],
    ["swift","rapid","weary","tired"],["ancient","modern","tiny","enormous"],
    ["conceal","hide","assist","help"],["arrive","depart","ascend","descend"]];
  const pattern=[["run","running","swim","swimming"],["mouse","mice","goose","geese"],
    ["one","first","three","third"],["write","wrote","sing","sang"],
    ["child","children","tooth","teeth"],["happy","happier","sad","sadder"],
    ["walk","walked","carry","carried"],["leaf","leaves","knife","knives"]];
  let bank,label;
  if(p.kind==="part"){bank=part;label="part to whole"}
  else if(p.kind==="synant"){bank=synant;label="synonym or antonym"}
  else if(p.kind==="pattern"){bank=pattern;label="word pattern"}
  else {bank=[...part,...synant,...pattern];label="a consistent relationship"}
  const q=bp(r,bank,i);
  if(p.kind==="connection"){
    const ans=label==="a consistent relationship"?"they are related in a consistent way":label;
    return {prompt:`${q[0]} is to ${q[1]} as ${q[2]} is to ${q[3]}.\nWhat is the connection in each pair?`,
      answer:ans,choices:shuffle(r,[ans,"they rhyme","they start with the same letter","they have the same number of letters"])}
  }
  return {prompt:`Complete the analogy: ${q[0]} is to ${q[1]} as ${q[2]} is to ___`,answer:q[3],
    choices:shuffle(r,[q[3],q[1],q[0],q[2]]),acceptedAnswers:[q[3]]}
},
affix(r,p,i){
  const bank=p.kind==="prefix"?PREFIX:SUFFIX;
  const [fix,meaning,wrongs,example]=bp(r,bank,i);
  if(i%2===0)
    return {prompt:`What does the ${p.kind} “${fix}” mean?`,answer:meaning,choices:shuffle(r,[meaning,...wrongs])};
  const fillers=shuffle(r,["castle","running","bright","lantern","harbor","silver"]).slice(0,3);
  return {prompt:`Which word uses the ${p.kind} “${fix}”?`,answer:example,choices:shuffle(r,[example,...fillers])}
},
roots(r,p,i){
  const [root,meaning,wrongs,words]=bp(r,ROOTS,i);
  if(p.mode==="match"){
    const fillers=shuffle(r,["garden","sudden","yellow","basket","meadow","pillow"]).slice(0,3);
    return {prompt:`Which word contains the root “${root}” (meaning “${meaning}”)?`,answer:pick(r,words),
      choices:shuffle(r,[pick(r,words),...fillers])}
  }
  return {prompt:`The Greek or Latin root “${root}” appears in words like ${words.slice(0,2).join(" and ")}. What does it mean?`,
    answer:meaning,choices:shuffle(r,[meaning,...wrongs])}
},

/* ---------------------------------------------------- reference skills */
abcorder(r,p,i){
  const pools=[["dragon","dream","drift","dune"],["castle","cavern","cinder","crown"],
    ["banner","battle","beacon","blade"],["shield","shimmer","shore","silver"],
    ["forest","forge","fortune","fountain"],["mantle","marble","meadow","mirror"],
    ["harbor","harvest","hearth","hollow"],["quarry","quartz","quest","quiver"],
    ["tavern","tempest","thicket","tunnel"],["ember","emerald","empire","envoy"],
    ["lantern","ledger","legend","lichen"],["pillar","pilgrim","pinnacle","pioneer"],
    ["raven","ravine","reckon","relic"],["saddle","sapphire","scholar","scroll"]];
  const set=shuffle(r,bp(r,pools,i));
  const sorted=[...set].sort();
  const wantFirst=i%2===0;
  return {prompt:`Which word comes ${wantFirst?"FIRST":"LAST"} in ABC order?\n${set.join(", ")}`,
    answer:wantFirst?sorted[0]:sorted[3],choices:shuffle(r,[...set])}
},
guidewords(r,p,i){
  const pages=[["market","mistake",["middle","mellow","mirror"],["lantern","noble","apple"]],
    ["candle","cavern",["carve","castle","cauldron"],["bridge","cinder","dragon"]],
    ["forest","fountain",["forge","fortune","found"],["ember","garden","harbor"]],
    ["banner","bridge",["battle","beacon","blade"],["apple","cavern","dragon"]],
    ["saddle","scroll",["sapphire","scholar","scatter"],["raven","tavern","umbrella"]],
    ["harbor","hollow",["harvest","hearth","hinge"],["glimmer","ivory","jungle"]],
    ["pillar","pioneer",["pilgrim","pinnacle","pincer"],["oyster","quarry","raven"]],
    ["tavern","tunnel",["tempest","thicket","trellis"],["summit","umbrella","violet"]]];
  const [g1,g2,inside,outside]=bp(r,pages,i);
  const ans=pick(r,inside);
  return {prompt:`A dictionary page has the guide words ${g1} / ${g2}. Which word would appear on that page?`,
    answer:ans,choices:shuffle(r,[ans,...outside])}
},
reference(r,p,i){
  const q=[["find a word that means the same as “brave”","a thesaurus",["a dictionary","an atlas","an almanac"]],
   ["find out how to pronounce an unfamiliar word","a dictionary",["a thesaurus","an atlas","a novel"]],
   ["find a map of a country","an atlas",["a dictionary","a thesaurus","a glossary"]],
   ["look up key terms defined at the back of your textbook","the glossary",["the index","the preface","the appendix"]],
   ["find which page discusses volcanoes in a textbook","the index",["the glossary","the title page","the appendix"]],
   ["find last year's rainfall totals","an almanac",["a thesaurus","a dictionary","a novel"]],
   ["find general background on the Roman Empire","an encyclopedia",["a thesaurus","an atlas","a dictionary"]],
   ["find today's news about a local election","a newspaper",["an atlas","a dictionary","a thesaurus"]]];
  const x=bp(r,q,i);
  return {prompt:`Which reference would you use to ${x[0]}?`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
},

/* ---------------------------------------------------- parts of speech */
nounsconcrete(r,p,i){
  const concrete=["castle","dragon","sword","lantern","river","banner","scroll","harbor","boulder","cloak"];
  const abstract=["courage","freedom","honesty","fear","wisdom","loyalty","justice","hope","patience","pride"];
  const wantAbstract=i%2===1;
  const ans=pick(r,wantAbstract?abstract:concrete);
  const pool=wantAbstract?concrete:abstract;
  return {prompt:`Which word is ${wantAbstract?"an ABSTRACT":"a CONCRETE"} noun (${wantAbstract?"an idea or feeling you cannot touch":"something you can see or touch"})?`,
    answer:ans,choices:shuffle(r,[ans,...shuffle(r,pool).slice(0,3)])}
},
nounsplural(r,p,i){
  const pairs=[["child","children"],["goose","geese"],["mouse","mice"],["leaf","leaves"],
    ["knife","knives"],["city","cities"],["hero","heroes"],["tooth","teeth"],["wolf","wolves"],
    ["woman","women"],["foot","feet"],["shelf","shelves"],["berry","berries"],["loaf","loaves"],
    ["ox","oxen"],["potato","potatoes"],["thief","thieves"],["cactus","cacti"]];
  const [s,pl]=bp(r,pairs,i);
  return {prompt:`What is the correct plural of “${s}”?`,answer:pl,
    choices:shuffle(r,[pl,s+"s",s+"es",s])}
},
nounspossessive(r,p,i){
  const items=[["the shield that belongs to one knight","the knight’s shield",["the knights shield","the knights’ shield","the knight shield’s"]],
   ["the banners that belong to several knights","the knights’ banners",["the knight’s banners","the knights banners","the knights’s banners"]],
   ["the map that belongs to one scout","the scout’s map",["the scouts map","the scouts’ map","the scout maps"]],
   ["the nests that belong to several birds","the birds’ nests",["the bird’s nests","the birds nests","the birds’s nests"]],
   ["the toys that belong to several children","the children’s toys",["the childrens’ toys","the childrens toys","the child’s toys"]],
   ["the lantern that belongs to Maya","Maya’s lantern",["Mayas lantern","Mayas’ lantern","Maya lantern’s"]],
   ["the saddles that belong to several horses","the horses’ saddles",["the horse’s saddles","the horses saddles","the horses’s saddles"]],
   ["the den that belongs to one wolf","the wolf’s den",["the wolfs den","the wolves’ den","the wolf den’s"]]];
  const x=bp(r,items,i);
  return {prompt:`How do you write ${x[0]}?`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
},
pronouns(r,p,i){
  if(p.kind==="whowhom"){
    const q=[["___ wrote this letter?","Who",["Whom","Whose","Which"]],
      ["To ___ should I give the key?","whom",["who","whose","which"]],
      ["___ did you see at the gate?","Whom",["Who","Whose","What"]],
      ["___ is knocking at the door?","Who",["Whom","Whose","Which"]],
      ["For ___ did you build the raft?","whom",["who","whose","what"]],
      ["___ left the lantern burning?","Who",["Whom","Whose","Which"]],
      ["With ___ will you travel north?","whom",["who","whose","which"]],
      ["___ do you trust most?","Whom",["Who","Whose","What"]]];
    const x=bp(r,q,i);
    return {prompt:`Choose the correct word: “${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
  }
  if(p.kind==="relative"){
    const q=[["The knight ___ found the map is here.","who",["which","whose","where"]],
      ["The sword, ___ blade was silver, gleamed.","whose",["who","which","that"]],
      ["This is the cave ___ we discovered.","that",["who","whose","whom"]],
      ["The scout ___ we met knew the pass.","whom",["which","whose","what"]],
      ["The lantern, ___ was nearly out, flickered.","which",["who","whom","whose"]],
      ["The village ___ we left lies east.","that",["who","whom","whose"]],
      ["The rider ___ horse bolted returned late.","whose",["who","which","that"]],
      ["The map ___ Priya drew was accurate.","that",["who","whom","whose"]]];
    const x=bp(r,q,i);
    return {prompt:`Choose the correct relative pronoun: “${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
  }
  const q=[["Maya packed the bag ___.","herself",["her","hers","she"]],
    ["That map is ___.","hers",["her","herself","she"]],
    ["___ and Leo climbed the tower.","She",["Her","Hers","Herself"]],
    ["The idea was ___ own.","his",["him","himself","he"]],
    ["We built the raft ___.","ourselves",["us","our","ours"]],
    ["The silver cloak is ___.","theirs",["them","their","themselves"]],
    ["Leo hurt ___ on the rocks.","himself",["him","his","he"]],
    ["___ found the tunnel first.","They",["Them","Their","Themselves"]],
    ["Give the scroll to ___.","me",["I","my","myself"]],
    ["The choice is ___ to make.","yours",["your","you","yourself"]]];
  const x=bp(r,q,i);
  return {prompt:`Choose the correct pronoun: “${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
},
contractions(r,p,i){
  const notb=[["do not","don't"],["is not","isn't"],["could not","couldn't"],["will not","won't"],
    ["has not","hasn't"],["are not","aren't"],["was not","wasn't"],["should not","shouldn't"],
    ["did not","didn't"],["cannot","can't"],["have not","haven't"],["would not","wouldn't"]];
  const pron=[["they are","they're"],["we will","we'll"],["I have","I've"],["she is","she's"],
    ["you would","you'd"],["he will","he'll"],["it is","it's"],["we have","we've"],
    ["I will","I'll"],["they have","they've"],["you are","you're"],["I am","I'm"]];
  const bank=p.kind==="not"?notb:p.kind==="pronoun"?pron:[...notb,...pron];
  const [full,short]=bp(r,bank,i);
  return {prompt:`Choose the contraction for “${full}”.`,answer:short,
    choices:shuffle(r,[short,...bankOther(r,bank.map(x=>x[1]),short,3)]),
    acceptedAnswers:[short,short.replace("'","’")]}
},
verbs(r,p,i){
  if(p.kind==="irregular"){
    const b=[["run","ran"],["bring","brought"],["catch","caught"],["think","thought"],["swim","swam"],
      ["fly","flew"],["teach","taught"],["begin","began"],["choose","chose"],["draw","drew"],
      ["freeze","froze"],["ride","rode"],["speak","spoke"],["steal","stole"],["wear","wore"],
      ["write","wrote"],["break","broke"],["drink","drank"],["grow","grew"],["know","knew"]];
    const [pres,past]=bp(r,b,i);
    return {prompt:`What is the past tense of “${pres}”?`,answer:past,
      choices:shuffle(r,[past,pres+"ed",pres+"d",pres])}
  }
  if(p.kind==="progressive"){
    const q=[["Right now, Maya ___ the map.","is reading",["reads","read","has read"]],
      ["Yesterday at noon, they ___ across the bridge.","were walking",["walk","walked","will walk"]],
      ["Tomorrow at dawn, we ___ toward the peak.","will be climbing",["climb","climbed","have climbed"]],
      ["At this moment, the scouts ___ the north gate.","are watching",["watch","watched","have watched"]],
      ["Last night, Leo ___ by the fire.","was sitting",["sits","sat","will sit"]],
      ["Next week, Priya ___ the new map.","will be drawing",["draws","drew","has drawn"]],
      ["Right now, the river ___ over its banks.","is rising",["rises","rose","has risen"]],
      ["All morning, we ___ for a safe path.","were searching",["search","searched","will search"]]];
    const x=bp(r,q,i);
    return {prompt:`Choose the progressive verb form: “${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
  }
  if(p.kind==="helping"){
    const PB=(typeof DW_PACKET_BANK!=="undefined")?DW_PACKET_BANK:{};
    if(PB.helping&&PB.helping.length&&i%2===0){
      const h=pick(r,PB.helping);
      return {prompt:`In this sentence, which word is the HELPING verb?\n“${h.text}”`,answer:h.aux,
        choices:opts(r,h.aux,h.distractors)}
    }
    const q=[["Leo has finished the quest.","has",["finished","Leo","the"]],
      ["They were searching the cavern.","were",["searching","They","the"]],
      ["She will return by nightfall.","will",["return","She","by"]],
      ["We have crossed the river twice.","have",["crossed","We","twice"]],
      ["The gate is closing quickly.","is",["closing","gate","quickly"]],
      ["Maya had packed the lanterns.","had",["packed","Maya","the"]],
      ["The scouts are climbing the ridge.","are",["climbing","scouts","the"]],
      ["Priya does know the way.","does",["know","Priya","the"]]];
    const x=bp(r,q,i);
    return {prompt:`In this sentence, which word is the HELPING verb?\n“${x[0]}”`,answer:x[1],
      choices:shuffle(r,[x[1],...x[2]])}
  }
  if(p.kind==="modal"){
    const q=[["You should bring a lantern.","gives advice",["shows past ability","asks permission","shows certainty"]],
      ["She can lift the heavy shield.","shows ability",["gives advice","shows the past","asks a question"]],
      ["We must leave before dark.","shows necessity",["shows ability","gives a choice","shows the past"]],
      ["May I enter the hall?","asks permission",["shows necessity","shows ability","gives advice"]],
      ["He might return by morning.","shows possibility",["shows necessity","shows ability","gives advice"]],
      ["You ought to rest now.","gives advice",["shows ability","asks permission","shows certainty"]],
      ["They could swim when they were young.","shows past ability",["shows necessity","asks permission","gives advice"]],
      ["Would you hand me the map?","makes a polite request",["shows necessity","shows past ability","shows certainty"]]];
    const x=bp(r,q,i);
    return {prompt:`In “${x[0]}”, what does the modal verb show?`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
  }
  if(p.kind==="tobe"){
    const q=[["I ___ ready for the journey.","am",["is","are","be"]],
      ["They ___ at the gate yesterday.","were",["was","are","is"]],
      ["She ___ the fastest rider last year.","was",["were","is","are"]],
      ["We ___ explorers.","are",["is","am","was"]],
      ["The lanterns ___ nearly out.","are",["is","am","was"]],
      ["Leo ___ late to the council last night.","was",["were","are","am"]],
      ["You ___ the one who found the map.","are",["is","am","was"]],
      ["I ___ tired after the long climb.","was",["were","are","am"]]];
    const x=bp(r,q,i);
    return {prompt:`Choose the correct form of “to be”: “${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
  }
  const q=[["The group of students ___ quietly.","works",["work","working","were works"]],
    ["Each of the knights ___ a shield.","carries",["carry","carrying","have carry"]],
    ["The maps on the table ___ old.","are",["is","was","being"]],
    ["Neither Leo nor Maya ___ the answer.","knows",["know","knowing","have know"]],
    ["One of the lanterns ___ broken.","is",["are","were","being"]],
    ["The scouts ___ before sunrise.","leave",["leaves","leaving","has leave"]],
    ["Everyone in the tunnels ___ a rope.","needs",["need","needing","have need"]],
    ["The pack of wolves ___ the ridge.","crosses",["cross","crossing","have cross"]]];
  const x=bp(r,q,i);
  return {prompt:`Choose the correct verb so the subject and verb agree:\n“${x[0]}”`,answer:x[1],
    choices:shuffle(r,[x[1],...x[2]])}
},
modifiers(r,p,i){
  const k=p.kind;
  if(k==="adjadv"){
    const q=[["The explorer moved ___ through the cave.","carefully",["careful","carefulness","carefuller"]],
      ["The ___ dragon guarded the gate.","ancient",["anciently","ancientness","more ancient than"]],
      ["Maya spoke ___ to the council.","boldly",["bold","boldness","bolder"]],
      ["The rope held ___ under the weight.","firmly",["firm","firmness","firmer"]],
      ["A ___ wind swept the courtyard.","bitter",["bitterly","bitterness","more bitterly"]],
      ["Leo climbed ___ toward the ledge.","slowly",["slow","slowness","slower than"]],
      ["The ___ map crumbled in her hands.","fragile",["fragilely","fragility","more fragile than"]],
      ["The bell rang ___ across the valley.","loudly",["loud","loudness","louder than"]]];
    const x=bp(r,q,i);
    return {prompt:`Choose the word that fits: “${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
  }
  if(k==="comparative"||k==="superlative"||k==="compsuper"){
    const b=[["tall","taller","tallest"],["bright","brighter","brightest"],["heavy","heavier","heaviest"],
      ["good","better","best"],["bad","worse","worst"],["dangerous","more dangerous","most dangerous"],
      ["swift","swifter","swiftest"],["narrow","narrower","narrowest"],["cold","colder","coldest"],
      ["beautiful","more beautiful","most beautiful"],["strong","stronger","strongest"],["far","farther","farthest"]];
    const [base,comp,sup]=bp(r,b,i);
    const wantSup=k==="superlative"||(k==="compsuper"&&i%2===1);
    return {prompt:wantSup
      ? `Which form of “${base}” compares THREE or more things?`
      : `Which form of “${base}” compares exactly TWO things?`,
      answer:wantSup?sup:comp,choices:shuffle(r,[comp,sup,base,base+"ly"])}
  }
  if(k==="compsuperadv"){
    const b=[["quickly","more quickly","most quickly"],["carefully","more carefully","most carefully"],
      ["well","better","best"],["hard","harder","hardest"],["soon","sooner","soonest"],
      ["quietly","more quietly","most quietly"],["late","later","latest"],["badly","worse","worst"]];
    const [base,comp,sup]=bp(r,b,i);
    const wantSup=i%2===1;
    return {prompt:wantSup?`Which form of “${base}” compares THREE or more actions?`
      :`Which form of “${base}” compares exactly TWO actions?`,
      answer:wantSup?sup:comp,choices:shuffle(r,[comp,sup,base,base+"er"])}
  }
  if(k==="ordering"){
    const q=[["three old stone towers",["old three stone towers","stone old three towers","three stone old towers"]],
      ["a beautiful little wooden box",["a wooden little beautiful box","a little wooden beautiful box","a beautiful wooden little box"]],
      ["two enormous green dragons",["green two enormous dragons","enormous green two dragons","two green enormous dragons"]],
      ["a lovely round silver mirror",["a silver round lovely mirror","a round lovely silver mirror","a lovely silver round mirror"]],
      ["four tiny black iron keys",["black four tiny iron keys","tiny four black iron keys","four black tiny iron keys"]],
      ["an ancient red leather book",["a red ancient leather book","a leather ancient red book","an ancient leather red book"]],
      ["several long wooden bridges",["long several wooden bridges","wooden several long bridges","several wooden long bridges"]],
      ["a small square silver locket",["a silver square small locket","a square small silver locket","a small silver square locket"]],
      ["five heavy iron chains",["heavy five iron chains","iron five heavy chains","five iron heavy chains"]],
      ["an old thin paper map",["a thin old paper map","a paper old thin map","an old paper thin map"]],
      ["two enormous grey stones",["grey two enormous stones","enormous two grey stones","two grey enormous stones"]],
      ["a lovely little wooden chest",["a wooden little lovely chest","a little wooden lovely chest","a lovely wooden little chest"]]];
    const x=bp(r,q,i);
    return {prompt:`Which phrase puts the adjectives in the correct order?`,answer:x[0],choices:shuffle(r,[x[0],...x[1]])}
  }
  const q=[["This is the tower ___ the treasure is hidden.","where",["when","why","who"]],
    ["Dawn is the hour ___ we set out.","when",["where","why","which"]],
    ["No one knows the reason ___ the gate closed.","why",["where","when","who"]],
    ["That is the cavern ___ the river begins.","where",["when","why","whom"]],
    ["Midwinter is the season ___ the pass freezes.","when",["where","why","which"]],
    ["Explain the reason ___ you turned back.","why",["where","when","who"]],
    ["Show me the ledge ___ you found the scroll.","where",["when","why","whose"]],
    ["Tell me the moment ___ the bell rang.","when",["where","why","which"]]];
  const x=bp(r,q,i);
  return {prompt:`Choose the correct relative adverb: “${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
},
articles(r,p,i){
  const q=[["Maya found ___ ancient map.","an",["a","the","some"]],
    ["We crossed ___ narrow bridge.","a",["an","those","many"]],
    ["___ sun rose over the peaks.","The",["A","An","Some"]],
    ["He waited ___ hour before entering.","an",["a","the","this"]],
    ["Leo carried ___ heavy pack.","a",["an","those","many"]],
    ["She spotted ___ eagle above the ridge.","an",["a","the","some"]],
    ["___ moon lit the whole valley.","The",["A","An","Some"]],
    ["They built ___ raft from fallen logs.","a",["an","those","many"]],
    ["It was ___ honest mistake.","an",["a","the","this"]],
    ["We followed ___ oldest path.","the",["a","an","some"]]];
  const x=bp(r,q,i);
  return {prompt:`Choose the correct article: “${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
},
prepositions(r,p,i){
  const PB=(typeof DW_PACKET_BANK!=="undefined")?DW_PACKET_BANK:{};
  const packet=(PB.prepositional&&PB.prepositional.length&&i%2===0)?pick(r,PB.prepositional):null;
  if(p.kind==="object"){
    if(packet){
      const words=packet.text.replace(/[.,!?]/g,"").split(/\s+/).filter(w=>w.length>2&&w!==packet.object);
      return {prompt:`In “${packet.text}”, what is the OBJECT of the preposition?`,answer:packet.object,
        choices:opts(r,packet.object,[packet.prep,...shuffle(r,words).slice(0,3)])}
    }
    const s=makeSentence(r,false);
    return {prompt:`In “${s.text}”, what is the OBJECT of the preposition?`,answer:s.prepObject,
      choices:shuffle(r,[s.prepObject,s.simplePredicate,s.simpleSubject,s.prep])}
  }
  if(p.kind==="phrase"){
    if(packet){
      const parts=packet.text.replace(/[.!?]$/,"").split(" "+packet.prep+" ")[0];
      return {prompt:`Which group of words is the PREPOSITIONAL PHRASE?\n“${packet.text}”`,answer:packet.phrase,
        choices:opts(r,packet.phrase,[parts,packet.prep+" "+packet.object,packet.object])}
    }
    const s=makeSentence(r,false);
    return {prompt:`Which group of words is the PREPOSITIONAL PHRASE?\n“${s.text}”`,answer:s.phrase,
      choices:shuffle(r,[s.phrase,s.completeSubject,`${s.simplePredicate} ${s.prep}`,s.completePredicate])}
  }
  const preps=["under","between","through","beside","above","across","beneath","toward","during","without","within","along","behind","beyond","among","against"];
  const nonpreps=["dragon","bravely","shouted","lantern","quickly","silver","climbed","harbor","gently","banner","frozen","searched"];
  const ans=pick(r,preps);
  return {prompt:`Which word is a preposition?`,answer:ans,choices:shuffle(r,[ans,...shuffle(r,nonpreps).slice(0,3)])}
},
conjunctions(r,p,i){
  if(p.kind==="subordinating"){
    const q=[["___ the storm arrived, we sheltered in the cave.","Because",["But","And","Or"]],
      ["We waited ___ the gates opened.","until",["and","but","yet"]],
      ["___ you finish the quest, you may rest.","After",["So","And","Or"]],
      ["Leo kept climbing ___ he was exhausted.","although",["but","and","so"]],
      ["___ the bell rings, everyone gathers.","When",["And","But","Or"]],
      ["Priya drew the map ___ we could find the way back.","so that",["but","and","yet"]],
      ["___ we cross the bridge, check the ropes.","Before",["And","But","So"]],
      ["The scouts rested ___ the sun set.","while",["and","but","or"]]];
    const x=bp(r,q,i);
    return {prompt:`Choose the subordinating conjunction: “${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
  }
  if(p.kind==="coordinating"){
    const q=[["I wanted to explore, ___ the gate was locked.","but",["because","although","unless"]],
      ["Bring a lantern ___ a rope.","and",["although","since","while"]],
      ["We can rest now, ___ we can press on.","or",["because","after","unless"]],
      ["The path was steep, ___ we climbed it anyway.","yet",["because","while","until"]],
      ["The bridge was out, ___ we swam across.","so",["although","while","unless"]],
      ["Leo packed food ___ water for the trip.","and",["because","while","since"]],
      ["She did not stop, ___ did she look back.","nor",["because","although","until"]],
      ["The map was old, ___ it was still accurate.","but",["since","while","unless"]]];
    const x=bp(r,q,i);
    return {prompt:`Choose the coordinating conjunction: “${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
  }
  const fanboys=["and","but","or","yet","so","for","nor"];
  const notconj=["because","quickly","under","although","silver","while","gently"];
  const ans=pick(r,fanboys);
  return {prompt:`Which word is a coordinating conjunction (FANBOYS)?`,answer:ans,
    choices:shuffle(r,[ans,...shuffle(r,notconj).slice(0,3)])}
},

/* ---------------------------------------------------- sentences */
sentence(r,p,i){
  const complete=makeSentence(r,i%2===0).text, frag=makeFragment(r),
        runon=makeRunOn(r), compound=makeCompound(r), simple=makeSentence(r,false).text;
  if(p.kind==="fragment"){
    if(i%2===0)
      return {prompt:`Which is a COMPLETE sentence?`,answer:complete,
        choices:shuffle(r,[complete,frag,makeFragment(r),makeFragment(r)])};
    return {prompt:`Which is a FRAGMENT (not a complete sentence)?`,answer:frag,
      choices:shuffle(r,[frag,complete,simple,makeSentence(r,true).text])}
  }
  if(p.kind==="runon"){
    if(i%2===0)
      return {prompt:`Which sentence is a RUN-ON (two complete thoughts with nothing joining them)?`,
        answer:runon,choices:shuffle(r,[runon,complete,simple,compound])};
    return {prompt:`Which sentence correctly FIXES this run-on?\n“${runon}”`,answer:compound,
      choices:shuffle(r,[compound,runon,frag,simple])}
  }
  if(p.kind==="three"){
    const trio=[[complete,"complete sentence"],[frag,"fragment"],[runon,"run-on"]];
    const x=bp(r,trio,i);
    return {prompt:`Is this a complete sentence, a fragment, or a run-on?\n“${x[0]}”`,answer:x[1],
      choices:shuffle(r,["complete sentence","fragment","run-on","none of these"])}
  }
  if(p.kind==="compound")
    return {prompt:`Which is a COMPOUND sentence (two complete thoughts joined correctly)?`,answer:compound,
      choices:shuffle(r,[compound,simple,frag,runon])};
  const wantSimple=i%2===0;
  return {prompt:`Which sentence is ${wantSimple?"SIMPLE (exactly one complete thought)":"COMPOUND (two complete thoughts joined correctly)"}?`,
    answer:wantSimple?simple:compound,choices:shuffle(r,[simple,compound,frag,runon])}
},
subjpred(r,p,i){
  const s=makeSentence(r, i%3===2);
  if(p.kind==="subject")
    return {prompt:`What is the COMPLETE SUBJECT?\n“${s.text}”`,answer:s.completeSubject,
      choices:shuffle(r,[s.completeSubject,s.completePredicate,s.simpleSubject,s.simplePredicate])};
  if(p.kind==="predicate")
    return {prompt:`What is the COMPLETE PREDICATE?\n“${s.text}”`,answer:s.completePredicate,
      choices:shuffle(r,[s.completePredicate,s.completeSubject,s.simpleSubject,s.simplePredicate])};
  if(p.kind==="simple"){
    const wantSubj=i%2===0;
    return {prompt:`What is the SIMPLE ${wantSubj?"SUBJECT":"PREDICATE"}?\n“${s.text}”`,
      answer:wantSubj?s.simpleSubject:s.simplePredicate,
      choices:shuffle(r,[s.simpleSubject,s.simplePredicate,s.completeSubject,s.completePredicate])}
  }
  if(p.kind==="compound"){
    const a=makeSentence(r,false), b=makeSentence(r,false);
    if(i%2===0){
      const cs=`The ${a.noun} and the ${b.noun}`;
      const text=`${cs} ${a.completePredicate}.`;
      return {prompt:`Which part is the COMPOUND SUBJECT?\n“${text}”`,answer:cs,
        choices:shuffle(r,[cs,a.completePredicate,a.noun,a.simplePredicate])}
    }
    const o1=pick(r,F_OBJ)[0], o2=pick(r,F_OBJ)[0];
    const co=`${o1} and ${o2}`;
    const t2=`The ${a.adj} ${a.noun} searched ${co}.`;
    return {prompt:`Which part is the COMPOUND OBJECT?\n“${t2}”`,answer:co,
      choices:shuffle(r,[co,`The ${a.adj} ${a.noun}`,a.noun,"searched"])}
  }
  const wantSubj=i%2===0;
  return {prompt:`What is the complete ${wantSubj?"SUBJECT":"PREDICATE"}?\n“${s.text}”`,
    answer:wantSubj?s.completeSubject:s.completePredicate,
    choices:shuffle(r,[s.completeSubject,s.completePredicate,s.simpleSubject,s.simplePredicate])}
},

/* ---------------------------------------------------- mechanics */
capitalization(r,p,i){
  if(p.kind==="titles"){
    const words=[["the","secret","of","the","silver","gate"],["a","journey","through","the","frozen","pass"],
      ["the","last","dragon","of","dragonswood"],["maps","and","other","useful","things"],
      ["the","river","that","would","not","freeze"],["nine","nights","in","the","northern","pass"],
      ["a","lantern","for","the","long","road"],["the","mapmaker","and","the","raven"]];
    const w=bp(r,words,i);
    const small=["a","an","the","of","and","in","for","that","not","through","on","to"];
    const cap=x=>x[0].toUpperCase()+x.slice(1);
    const title=w.map((x,k)=>(k===0||!small.includes(x))?cap(x):x).join(" ");
    const allCap=w.map(cap).join(" ");
    const noFirst=w.map((x,k)=>(k!==0&&!small.includes(x))?cap(x):x).join(" ");
    const lastLower=w.map((x,k)=>(k===0||(!small.includes(x)&&k!==w.length-1))?cap(x):x).join(" ");
    return {prompt:`How should the title “${w.join(" ")}” be capitalized?`,answer:title,
      choices:opts(r,title,[allCap,noFirst,lastLower])}
  }
  if(p.kind==="address"){
    const n=ri(r,12,1980);
    const street=pick(r,["Wisteria Lane","Harbor Street","Lantern Court","Ridge Road","Banner Avenue","Quarry Way"]);
    const city=pick(r,["Evans","Denver","Greeley","Boulder","Loveland","Windsor"]);
    const zip=ri(r,80001,80699);
    const ans=`${n} ${street}, ${city}, CO ${zip}`;
    return {prompt:`Which address is formatted and capitalized correctly?`,answer:ans,
      choices:opts(r,ans,[`${n} ${street.toLowerCase()}, ${city.toLowerCase()}, co ${zip}`,
        `${n} ${street} ${city} CO ${zip}`,
        `${n} ${street}, ${city}, Co ${zip}`])}
  }
  const person=pick(r,C_PERSON), place=pick(r,C_PLACE), month=pick(r,C_MONTH),
        day=pick(r,C_DAY), book=pick(r,C_BOOK), title=pick(r,C_TITLE);
  const forms=[
    {ok:`${person} visited ${place} in ${month}.`,
     bad:[`${person.toLowerCase()} visited ${place} in ${month}.`,
          `${person} visited ${place.toLowerCase()} in ${month}.`,
          `${person} visited ${place} in ${month.toLowerCase()}.`]},
    {ok:`On ${day}, ${person} read ${book} aloud.`,
     bad:[`on ${day}, ${person} read ${book} aloud.`,
          `On ${day.toLowerCase()}, ${person} read ${book} aloud.`,
          `On ${day}, ${person} read ${book.toLowerCase()} aloud.`]},
    {ok:`${title} ${person} teaches at Explore Academy.`,
     bad:[`${title.toLowerCase()} ${person} teaches at Explore Academy.`,
          `${title} ${person.toLowerCase()} teaches at Explore Academy.`,
          `${title} ${person} teaches at explore academy.`]},
    {ok:`Every ${day} in ${month}, we hike near ${place}.`,
     bad:[`Every ${day.toLowerCase()} in ${month}, we hike near ${place}.`,
          `Every ${day} in ${month.toLowerCase()}, we hike near ${place}.`,
          `every ${day} in ${month}, we hike near ${place.toLowerCase()}.`]}
  ];
  const f=bp(r,forms,i);
  return {prompt:`Which sentence is capitalized correctly?`,answer:f.ok,choices:opts(r,f.ok,f.bad)}
},
abbreviations(r,p,i){
  const b=[["Doctor","Dr."],["Street","St."],["Mister","Mr."],["Avenue","Ave."],
    ["Junior","Jr."],["Company","Co."],["Tuesday","Tues."],["September","Sept."],
    ["Mountain","Mt."],["Boulevard","Blvd."],["Professor","Prof."],["Wednesday","Wed."],
    ["November","Nov."],["Road","Rd."],["Senior","Sr."],["Incorporated","Inc."]];
  const [full,ab]=bp(r,b,i);
  return {prompt:`What is the correct abbreviation for “${full}”?`,answer:ab,
    choices:shuffle(r,[ab,ab.replace(".",""),full.slice(0,2).toUpperCase()+".",full.slice(0,4)+"."])}
},
commas(r,p,i){
  const x=bp(r,COMMAS,i);
  return {prompt:`Which sentence uses commas correctly?`,answer:x[0],choices:shuffle(r,[x[0],...x[1]])}
},
dialogue(r,p,i){
  const PB=(typeof DW_PACKET_BANK!=="undefined")?DW_PACKET_BANK:{};
  if(PB.dialogue&&PB.dialogue.length&&i%2===0){
    const d=pick(r,PB.dialogue);
    return {prompt:`Add the missing punctuation. Which version is correct?\n${d.quote} ${d.verb} ${d.who}.`,
      answer:d.correct,
      choices:opts(r,d.correct,[`"${d.quote}${d.end}" ${d.verb} ${d.who}`,
        `"${d.quote}" ${d.verb} ${d.who}.`,`${d.quote}${d.end}" ${d.verb} ${d.who}.`])}
  }
  const who=pick(r,["Leo","Maya","Priya","Sam","Ana","Kofi","the guard","the captain"]);
  const said=pick(r,["shouted","whispered","answered","called","muttered","replied"]);
  const line=pick(r,["Stop right there","We should turn back","Look at this map","The tunnel is flooded",
    "Follow me closely","Someone has been here","Bring the lantern","The gate is open"]);
  const mode=i%3;
  if(mode===0){
    const ok=`"${line}!" ${said} ${who}.`;
    return {prompt:`Which sentence punctuates the dialogue correctly?`,answer:ok,
      choices:opts(r,ok,[`${line}! ${said} "${who}".`,`"${line}! ${said} ${who}.`,`${line}!" ${said} ${who}.`])}
  }
  if(mode===1){
    const W=who.charAt(0).toUpperCase()+who.slice(1);
    const ok=`${W} ${said}, "${line}."`;
    return {prompt:`Which sentence punctuates the dialogue correctly?`,answer:ok,
      choices:opts(r,ok,[`${W} ${said} "${line}."`,`${W} ${said}, ${line}.`,`${W} ${said}, "${line.toLowerCase()}".`])}
  }
  const ok=`"${line}," ${said} ${who}.`;
  return {prompt:`Which sentence punctuates the dialogue correctly?`,answer:ok,
    choices:opts(r,ok,[`"${line}." ${said} ${who}.`,`"${line}", ${said} ${who}.`,`${line}," ${said} ${who}.`])}
},
usage(r,p,i){
  const x=bp(r,USAGE,i);
  return {prompt:`Which is the CORRECTED version of “${x[0]}”?`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
},
register(r,p,i){
  const q=[["a letter to your principal","I am writing to request permission to start a chess club.",
     ["Hey, can I start a chess club or what?","Gonna start a chess club, cool?","Chess club. Yes? No?"]],
   ["a text to a close friend","Want to meet at the park later?",
     ["I hereby request your presence at the park.","One wonders whether you might attend the park.","Please be advised of a park meeting."]],
   ["an email to a teacher","Could you please explain the homework directions again?",
     ["yo what was the hw","Explain the hw. Now.","idk what ur talking about"]],
   ["a note to your teammate","Meet me by the bike rack after practice.",
     ["I formally request a rendezvous at the bicycle storage facility.","Be advised: bike rack. Post-practice.","One shall await you at the bicycle rack."]],
   ["a thank-you letter to a guest speaker","Thank you for taking the time to visit our class.",
     ["Thanks for coming I guess.","Cool talk, later.","That was fine."]],
   ["a formal book report","The author develops the main character through a series of difficult choices.",
     ["The author made the guy do stuff.","This character was super cool tbh.","So basically he changes a lot."]],
   ["a message to your cousin","Are you coming to the game on Saturday?",
     ["I wish to ascertain your Saturday availability.","Please confirm attendance at the athletic event.","Kindly advise regarding Saturday."]],
   ["a letter to the town council","I respectfully request that the council consider adding a crosswalk.",
     ["You guys need to add a crosswalk.","Add a crosswalk already.","Crosswalk. Please. Thanks."]],
   ["a caption for a friend's photo","This came out great!",
     ["This photograph is of superior quality.","I hereby commend this image.","Said photograph meets expectations."]],
   ["a school newspaper article","The team finished its season with a record of nine wins and two losses.",
     ["The team was awesome this year!!","They totally crushed it.","Nine and two, not bad right?"]]];
  const x=bp(r,q,i);
  return {prompt:`Which sentence uses the right tone for ${x[0]}?`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
},

/* ---------------------------------------------------- figurative language */
figurative(r,p,i){
  const k=p.kind;
  const PB=(typeof DW_PACKET_BANK!=="undefined")?DW_PACKET_BANK:{};
  const S=pick(r,(PB.similes&&PB.similes.length)?PB.similes:SIMILE),
        M=pick(r,(PB.metaphors&&PB.metaphors.length)?PB.metaphors:METAPHOR),
        P=pick(r,PERSON),H=pick(r,HYPER),L=pick(r,LITERAL);
  if(k==="simile") return {prompt:`Which sentence contains a SIMILE (a comparison using like or as)?`,
    answer:S,choices:shuffle(r,[S,M,L,P])};
  if(k==="metaphor") return {prompt:`Which sentence contains a METAPHOR (a direct comparison without like or as)?`,
    answer:M,choices:shuffle(r,[M,S,L,H])};
  if(k==="similemetaphor"){
    const wantSimile=i%2===0;
    return {prompt:`Is this a simile or a metaphor?\n“${wantSimile?S:M}”`,answer:wantSimile?"simile":"metaphor",
      choices:shuffle(r,["simile","metaphor","hyperbole","personification"])}
  }
  if(k==="personification") return {prompt:`Which sentence uses PERSONIFICATION (human traits given to something not human)?`,
    answer:P,choices:shuffle(r,[P,S,L,H])};
  if(k==="hyperbole") return {prompt:`Which sentence uses HYPERBOLE (extreme exaggeration)?`,answer:H,
    choices:shuffle(r,[H,S,L,P])};
  if(k==="personhyper"){
    const wantP=i%2===0;
    return {prompt:`Is this personification or hyperbole?\n“${wantP?P:H}”`,answer:wantP?"personification":"hyperbole",
      choices:shuffle(r,["personification","hyperbole","simile","metaphor"])}
  }
  if(k==="alliteration"){
    const A=pick(r,ALLIT);
    return {prompt:`Which sentence uses ALLITERATION (repeated beginning sounds)?`,answer:A,
      choices:shuffle(r,[A,L,S,H])}
  }
  if(k==="onomatopoeia"){
    const O=pick(r,ONOMAT);
    return {prompt:`Which sentence uses ONOMATOPOEIA (words that imitate sounds)?`,answer:O,
      choices:shuffle(r,[O,L,S,M])}
  }
  if(k==="adage"){
    const x=bp(r,ADAGE,i);
    return {prompt:`What does this adage mean?\n“${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
  }
  const x=bp(r,IDIOM,i);
  return {prompt:`What does this idiom mean?\n“${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
},

/* ---------------------------------------------------- composition */
transitions(r,p,i){
  const q=[["The trail was steep; ___, the hikers continued.","however",["because","for example","first"]],
   ["We packed food. ___, we filled the water skins.","Next",["However","Although","Despite"]],
   ["The bridge was out. ___, we had to find another route.","Therefore",["For example","Meanwhile","In contrast"]],
   ["Many creatures live here — ___, owls, foxes, and deer.","for example",["however","therefore","finally"]],
   ["Leo searched the tower. ___, Maya checked the cellar.","Meanwhile",["Therefore","For example","However"]],
   ["The map was old. ___, it was still accurate.","Nevertheless",["Therefore","For example","Finally"]],
   ["We gathered wood. ___, we built the fire.","Then",["However","Although","In contrast"]],
   ["The pass was frozen. ___, the valley road was clear.","In contrast",["Therefore","For example","Finally"]],
   ["We checked every tunnel. ___, we found the exit.","Finally",["However","For example","In contrast"]],
   ["The storm grew worse. ___, we turned back.","As a result",["For example","However","Meanwhile"]]];
  const x=bp(r,q,i);
  return {prompt:`Choose the best transition: “${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
},
timeorder(r,p,i){
  const seqs=[["___, gather your supplies. Then study the map. Finally, set out at dawn.","First",["Finally","However","Because"]],
   ["Pack the wagon. ___, check the ropes. Last, wake the horses.","Next",["Finally","However","Because"]],
   ["Light the lantern. Then descend the stairs. ___, follow the left tunnel.","After that",["However","Because","Although"]],
   ["___ we crossed the bridge, we rested by the river.","After",["However","Therefore","Although"]],
   ["Study the map first. ___, mark the safe paths.","Second",["However","Because","Although"]]];
  const finds=[["We crossed the bridge. Later, we reached the tower.","Later",["crossed","bridge","tower"]],
   ["First, Maya lit the lantern.","First",["Maya","lit","lantern"]],
   ["The scouts left at dawn. Afterward, the wagons followed.","Afterward",["scouts","dawn","wagons"]],
   ["Before the storm, we secured the camp.","Before",["storm","secured","camp"]],
   ["Meanwhile, Leo searched the cellar.","Meanwhile",["Leo","searched","cellar"]]];
  if(i%2===0){
    const x=bp(r,seqs,i);
    return {prompt:`Which time-order word best fits?\n“${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
  }
  const x=bp(r,finds,i);
  return {prompt:`Which word in this passage is a time-order word?\n“${x[0]}”`,answer:x[1],
    choices:shuffle(r,[x[1],...x[2]])}
},
composition(r,p,i){
  const k=p.kind;
  if(k==="topic"){
    const q=[["Dragons appear in stories from many different cultures.",
      ["My favorite color is green.","I once saw a lizard.","Dragons are cool."]],
     ["Learning to read a map is a valuable skill for any traveler.",
      ["Maps are made of paper.","I like traveling.","North is up."]],
     ["Keeping a daily journal helps writers improve in three important ways.",
      ["I have a journal.","Journals have pages.","Writing is hard sometimes."]],
     ["Lanterns were essential tools for medieval travelers.",
      ["Lanterns are old.","I saw a lantern once.","Fire is hot."]],
     ["Working as a team makes difficult tasks manageable.",
      ["Teams have people.","I like my team.","Some tasks are hard."]],
     ["Rivers shaped where early villages were built.",
      ["Rivers are wet.","I swam in a river.","Villages are small."]]];
    const x=bp(r,q,i);
    return {prompt:`Which sentence is the best TOPIC SENTENCE for a paragraph?`,answer:x[0],
      choices:shuffle(r,[x[0],...x[1]])}
  }
  if(k==="support"){
    const q=[["Learning to read a map is a valuable skill for any traveler.",
      "A map helps a traveler find water, shelter, and safe paths.",
      ["Some travelers collect old maps because the paper and artwork look interesting.","Maps may be printed in several colors and folded into a traveler's pack.","The oldest map in the museum hangs inside a heavy wooden frame."]],
     ["Keeping a daily journal helps writers improve.",
      "Writing every day builds fluency and makes ideas easier to organize.",
      ["Journals are sold with plain covers, colored covers, and many different page sizes.","A new journal can be purchased at a store or made by folding paper together.","Some writers prefer a blue pen, while other writers choose a black pencil."]],
     ["Working as a team makes difficult tasks manageable.",
      "When members divide the work, each person can focus on what they do best.",
      ["A team may choose matching shirts so that every member looks alike at the event.","Some teams meet on Tuesdays, while other teams practice later in the week.","Team names are often printed on signs, schedules, or colorful banners."]],
     ["Winter travel in the mountains requires careful preparation.",
      "Travelers who pack extra fuel and dry layers can survive an unexpected storm.",
      ["Winter begins after autumn and brings shorter days to mountain communities.","Mountains may be covered with snow that looks bright under the morning sun.","Travelers often take photographs of the mountains before beginning the trip."]],
     ["Rivers shaped where early villages were built.",
      "Settlements grew beside rivers because water powered mills and carried goods.",
      ["Rivers may curve across a landscape before reaching a lake or ocean.","Some people visit rivers to take photographs or listen to moving water.","A river can appear blue, green, or brown depending on light and soil."]],
     ["Lanterns were essential tools for medieval travelers.",
      "A shielded flame let a traveler read a map without the wind snuffing it out.",
      ["Medieval lanterns were often made from metal pieces joined around clear panels.","Travelers carried many objects, including blankets, rope, and cooking pots.","Museum visitors can see old lanterns displayed behind glass today."]],
     ["Handmade maps reveal what their makers valued most.",
      "Mapmakers drew trade routes in careful detail while leaving empty land vague.",
      ["Handmade maps can use colored ink, decorated borders, and carefully drawn letters.","A finished map may be rolled into a tube or folded between pages of a book.","Some mapmakers sharpened their tools before drawing the first line."]],
     ["Practicing a skill in short daily sessions beats one long session.",
      "Spacing practice over several days gives the brain time to consolidate what it learned.",
      ["Practice sessions can happen before school, after school, or during free time.","Some students keep practice charts with stickers for each day they remember.","A long session may require a quiet room, a timer, and several short breaks."]]];
    const x=bp(r,q,i);
    return {prompt:`Topic sentence: “${x[0]}”\nWhich sentence best SUPPORTS it?`,answer:x[1],
      choices:shuffle(r,[x[1],...x[2]])}
  }
  if(k==="opinion"){
    const q=[["Recess should be longer because students focus better after physical activity.",
      ["Recess should be longer.","Recess is at 10:30.","I like recess a lot."]],
     ["Students should learn a second language because it strengthens memory and opens career paths.",
      ["Everyone should learn a language.","Spanish is a language.","I like languages."]],
     ["Libraries should stay open later because many students study after dinner.",
      ["Libraries should stay open later.","The library has books.","I go to the library."]],
     ["Schools should serve breakfast because hungry students cannot concentrate.",
      ["Breakfast is important.","Schools have cafeterias.","I eat breakfast."]]];
    const x=bp(r,q,i);
    return {prompt:`Which sentence gives an OPINION supported by a REASON?`,answer:x[0],
      choices:shuffle(r,[x[0],...x[1]])}
  }
  if(k==="character"){
    const q=[["fear","Maya's hands trembled as she reached for the door, and she swallowed hard.",
      ["Maya was afraid.","Maya felt scared.","Maya had fear."]],
     ["excitement","Leo bounced on his toes and could not stop grinning.",
      ["Leo was excited.","Leo felt excitement.","Leo had joy."]],
     ["anger","Priya's jaw tightened and she slammed the ledger shut.",
      ["Priya was angry.","Priya felt mad.","Priya had anger."]],
     ["exhaustion","Sam's shoulders sagged and each step landed heavier than the last.",
      ["Sam was tired.","Sam felt exhausted.","Sam had fatigue."]]];
    const x=bp(r,q,i);
    return {prompt:`Which sentence SHOWS a character's ${x[0]} instead of just telling it?`,answer:x[1],
      choices:shuffle(r,[x[1],...x[2]])}
  }
  if(k==="purpose"){
    const q=[["an article explaining how volcanoes form","to inform",["to entertain","to persuade","to apologize"]],
     ["an advertisement urging you to buy new boots","to persuade",["to inform","to entertain","to describe"]],
     ["a funny story about a talking goat","to entertain",["to inform","to persuade","to instruct"]],
     ["a letter asking the town council to build a park","to persuade",["to inform","to entertain","to describe"]],
     ["a manual showing how to assemble a bookshelf","to instruct",["to entertain","to persuade","to amuse"]],
     ["an encyclopedia entry about the water cycle","to inform",["to persuade","to entertain","to instruct"]],
     ["a poem about the first snowfall","to entertain",["to instruct","to persuade","to inform"]]];
    const x=bp(r,q,i);
    return {prompt:`What is the author's PURPOSE?\n${x[0]}`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
  }
  if(k==="pov"){
    const q=[['"I climbed the tower alone."',"first person",["second person","third person","third person omniscient"]],
     ['"She climbed the tower alone."',"third person",["first person","second person","narrator"]],
     ['"You climb the tower alone."',"second person",["first person","third person","narrator"]],
     ['"We searched every tunnel that night."',"first person",["second person","third person","omniscient"]],
     ['"Leo knew what Maya was thinking, and so did she."',"third person omniscient",["first person","second person","third person limited"]],
     ['"You should check the ropes before crossing."',"second person",["first person","third person","omniscient"]],
     ['"My hands shook as I lifted the latch."',"first person",["second person","third person","omniscient"]],
     ['"They followed the river until dusk."',"third person",["first person","second person","omniscient"]],
     ['"Turn left at the broken gate, then wait."',"second person",["first person","third person","omniscient"]],
     ['"Priya felt afraid, though no one else in the party guessed it."',"third person limited",["first person","second person","third person omniscient"]]];
    const x=bp(r,q,i);
    return {prompt:`What point of view is used?\n${x[0]}`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
  }
  const q=[["a made-up story with talking animals and a lesson","fable",["biography","autobiography","news article"]],
   ["a true account of a real person's life written by someone else","biography",["fable","fantasy","poetry"]],
   ["a story with magic, dragons, and imaginary worlds","fantasy",["biography","news article","how-to guide"]],
   ["writing that gives facts about a real topic","nonfiction",["fantasy","fable","folktale"]],
   ["a person's own life story, told by that person","autobiography",["biography","fable","fantasy"]],
   ["a short traditional story explaining a natural event","myth",["biography","news article","manual"]],
   ["a story set in the real past with invented characters","historical fiction",["biography","myth","manual"]],
   ["writing arranged in lines and stanzas, often with rhythm","poetry",["biography","news article","manual"]]];
  const x=bp(r,q,i);
  return {prompt:`Which genre is described?\n${x[0]}`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
},
poetry(r,p,i){
  if(p.kind==="haiku"){
    const q=[["What is the syllable pattern of a haiku?","5 – 7 – 5",["7 – 5 – 7","5 – 5 – 5","3 – 5 – 3"]],
     ["How many lines does a haiku have?","3",["5","7","4"]],
     ["How many syllables are in the FIRST line of a haiku?","5",["7","3","4"]],
     ["How many syllables are in the SECOND line of a haiku?","7",["5","3","4"]],
     ["Haiku traditionally describe images from which subject?","nature",["sports","machines","politics"]],
     ["How many syllables does a haiku have in total?","17",["15","12","20"]],
     ["How many syllables are in the THIRD line of a haiku?","5",["7","3","4"]],
     ["Which line of a haiku is the longest?","the second",["the first","the third","they are equal"]],
     ["Does a haiku need to rhyme?","no",["yes, every line","yes, lines 1 and 3","yes, lines 2 and 3"]],
     ["Haiku originally came from which country?","Japan",["Greece","Ireland","Egypt"]],
     ["A haiku usually captures what?","a single moment or image",["a long story","an argument","a list of facts"]],
     ["Which line pattern is a correct haiku?","5, 7, 5",["4, 6, 4","6, 8, 6","5, 5, 7"]]];
    const x=bp(r,q,i);
    return {prompt:x[0],answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
  }
  const q=[["How many lines does a cinquain have?","5",["3","7","4"]],
   ["What is the first line of a cinquain usually?","a one-word title",["a full sentence","a rhyme","a question"]],
   ["How many words are in the second line of a classic cinquain?","2",["3","4","5"]],
   ["How many words are in the third line of a classic cinquain?","3",["2","4","5"]],
   ["The fourth line of a classic cinquain has how many words?","4",["2","3","5"]],
   ["The last line of a cinquain usually does what?","restates the subject in one word",["asks a question","rhymes with line one","lists three nouns"]]];
  const x=bp(r,q,i);
  return {prompt:x[0],answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
}

};
/* ==========================================================================
   ADDITIONAL ELA GENERATORS — 4th & 5th grade packet coverage
   ========================================================================== */
Object.assign(ELA_GEN, {

commonproper(r,p,i){
  const pairs=[["city","Denver"],["month","August"],["teacher","Mrs. Alvarez"],["river","the Mississippi"],
    ["book","Charlotte's Web"],["state","Colorado"],["holiday","Thanksgiving"],["school","Explore Academy"],
    ["dog","Rufus"],["ocean","the Pacific"],["day","Tuesday"],["mountain","Pikes Peak"]];
  const [common,proper]=bp(r,pairs,i);
  if(i%2===0)
    return {prompt:`Which word is a PROPER noun (a specific name, always capitalized)?`,answer:proper,
      choices:shuffle(r,[proper,common,...shuffle(r,pairs.filter(x=>x[0]!==common)).slice(0,2).map(x=>x[0])])};
  return {prompt:`Which word is a COMMON noun (a general person, place or thing)?`,answer:common,
    choices:shuffle(r,[common,proper,...shuffle(r,pairs.filter(x=>x[1]!==proper)).slice(0,2).map(x=>x[1])])}
},
partsofspeech(r,p,i){
  const items=[["lantern","noun"],["quickly","adverb"],["ancient","adjective"],["climbed","verb"],
    ["beneath","preposition"],["and","conjunction"],["she","pronoun"],["wow","interjection"],
    ["courage","noun"],["silently","adverb"],["frozen","adjective"],["searched","verb"],
    ["through","preposition"],["but","conjunction"],["they","pronoun"],["ouch","interjection"]];
  const [word,pos]=bp(r,items,i);
  if(i%2===0)
    return {prompt:`What part of speech is “${word}”?`,answer:pos,
      choices:shuffle(r,[pos,...shuffle(r,[...new Set(items.map(x=>x[1]))].filter(x=>x!==pos)).slice(0,3)])};
  const others=shuffle(r,items.filter(x=>x[1]!==pos)).slice(0,3).map(x=>x[0]);
  return {prompt:`Which word is ${/^[aeiou]/.test(pos)?"an":"a"} ${pos}?`,answer:word,
    choices:shuffle(r,[word,...others])}
},
interjections(r,p,i){
  const words=["Wow","Ouch","Hooray","Oh no","Yikes","Hey","Whoa","Ugh"];
  const w=pick(r,words);
  if(i%3===0)
    return {prompt:`Which word is an INTERJECTION (a word that shows sudden feeling)?`,answer:w,
      choices:shuffle(r,[w,"lantern","climbed","beneath"])};
  if(i%3===1)
    return {prompt:`Which sentence uses an interjection correctly?`,answer:`${w}! That tunnel goes on forever.`,
      choices:opts(r,`${w}! That tunnel goes on forever.`,
        [`That tunnel ${w.toLowerCase()} goes on forever.`,`That tunnel goes ${w.toLowerCase()} forever.`,
         `${w} that tunnel goes on forever`])};
  return {prompt:`What punctuation usually follows a strong interjection at the start of a sentence?`,
    answer:"an exclamation point",choices:shuffle(r,["an exclamation point","a colon","a semicolon","no punctuation"])}
},
sentencetypes(r,p,i){
  const items=[["Close the gate behind you.","imperative"],["Where did you find the map?","interrogative"],
    ["The river froze overnight.","declarative"],["What a climb that was!","exclamatory"],
    ["Bring the lantern.","imperative"],["Who left the door open?","interrogative"],
    ["Leo mapped every tunnel.","declarative"],["How cold it is up here!","exclamatory"]];
  const [s,kind]=bp(r,items,i);
  return {prompt:`What kind of sentence is this?\n“${s}”`,answer:kind,
    choices:shuffle(r,["declarative","interrogative","imperative","exclamatory"])}
},
clauses(r,p,i){
  const indep=["we crossed the bridge","the lantern went out","Maya drew the map","the gate was locked"];
  const dep=["because the storm arrived","after we reached the ridge","although the map was old","when the bell rang"];
  const a=pick(r,indep), b=pick(r,dep);
  const mode=i%3;
  if(mode===0)
    return {prompt:`Which group of words is an INDEPENDENT clause (it can stand alone as a sentence)?`,
      answer:a.charAt(0).toUpperCase()+a.slice(1)+".",
      choices:opts(r,a.charAt(0).toUpperCase()+a.slice(1)+".",
        [b.charAt(0).toUpperCase()+b.slice(1)+".",pick(r,dep).replace(/^./,c=>c.toUpperCase())+".","Beneath the frozen river."])};
  if(mode===1)
    return {prompt:`Which group of words is a DEPENDENT clause (it cannot stand alone)?`,
      answer:b.charAt(0).toUpperCase()+b.slice(1)+".",
      choices:opts(r,b.charAt(0).toUpperCase()+b.slice(1)+".",
        [a.charAt(0).toUpperCase()+a.slice(1)+".",pick(r,indep).replace(/^./,c=>c.toUpperCase())+".","The scouts rested."])};
  return {prompt:`In this sentence, which part is the DEPENDENT clause?\n“${b.charAt(0).toUpperCase()+b.slice(1)}, ${a}.”`,
    answer:b.charAt(0).toUpperCase()+b.slice(1),
    choices:opts(r,b.charAt(0).toUpperCase()+b.slice(1),[a,a.split(" ")[0],b.split(" ")[0]])}
},
correlative(r,p,i){
  const pairs=[["either","or"],["neither","nor"],["both","and"],["not only","but also"],["whether","or"]];
  const [x,y]=bp(r,pairs,i);
  const mode=i%3;
  if(mode===0)
    return {prompt:`Correlative conjunctions come in pairs. Which word completes this pair: “${x} … ___”?`,
      answer:y,choices:shuffle(r,[y,...shuffle(r,pairs.filter(q=>q[1]!==y)).slice(0,3).map(q=>q[1])])};
  if(mode===1)
    return {prompt:`Fill in the missing correlative conjunctions:\n“___ Leo ___ Maya knew the way back.”`,
      answer:`${x} … ${y}`,choices:shuffle(r,[`${x} … ${y}`,...shuffle(r,pairs.filter(q=>q[0]!==x)).slice(0,3).map(q=>`${q[0]} … ${q[1]}`)])};
  return {prompt:`Which sentence uses a correlative conjunction pair CORRECTLY?`,
    answer:`${x.charAt(0).toUpperCase()+x.slice(1)} the map ${y} the compass was missing.`,
    choices:opts(r,`${x.charAt(0).toUpperCase()+x.slice(1)} the map ${y} the compass was missing.`,
      [`${x.charAt(0).toUpperCase()+x.slice(1)} the map and the compass was missing.`,
       `The map ${y} the compass ${x} was missing.`,
       `${x.charAt(0).toUpperCase()+x.slice(1)} the map, the compass was missing.`])}
},
perfecttense(r,p,i){
  const q=[["By noon, the scouts ___ the ridge.","had reached","present perfect? no — past perfect",["reached","reach","were reaching"]],
   ["Maya ___ that trail three times already.","has climbed","present perfect",["climbed","climbs","was climbing"]],
   ["By next spring, we ___ the whole valley.","will have mapped","future perfect",["map","mapped","are mapping"]],
   ["They ___ the gate before the storm hit.","had closed","past perfect",["close","closed","are closing"]],
   ["Leo ___ every tunnel on this map.","has explored","present perfect",["explore","explored","was exploring"]],
   ["By dawn, the river ___ completely.","will have frozen","future perfect",["freezes","froze","is freezing"]]];
  const x=bp(r,q,i);
  if(i%2===0)
    return {prompt:`Choose the PERFECT tense verb form:\n“${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[3]])};
  const label=x[2].includes("past")?"past perfect":x[2].includes("future")?"future perfect":"present perfect";
  return {prompt:`Which perfect tense is used here?\n“${x[0].replace("___",x[1])}”`,answer:label,
    choices:shuffle(r,["present perfect","past perfect","future perfect","present progressive"])}
},
tenseshift(r,p,i){
  const q=[["Maya opened the gate and walks inside.","Maya opened the gate and walked inside.",
    ["Maya opens the gate and walked inside.","Maya open the gate and walks inside.","Maya opened the gate and walking inside."]],
   ["We packed the wagon and then we leave at dawn.","We packed the wagon and then we left at dawn.",
    ["We pack the wagon and then we left at dawn.","We packed the wagon and then we leaving at dawn.","We packing the wagon and then we leave at dawn."]],
   ["Leo climbs the ridge and found the marker.","Leo climbed the ridge and found the marker.",
    ["Leo climbs the ridge and finds the marker yesterday.","Leo climbing the ridge and found the marker.","Leo climb the ridge and found the marker."]],
   ["The scouts search the cavern and reported back.","The scouts searched the cavern and reported back.",
    ["The scouts search the cavern and report back yesterday.","The scouts searching the cavern and reported back.","The scout search the cavern and reported back."]]];
  const x=bp(r,q,i);
  return {prompt:`This sentence shifts tense incorrectly. Which version FIXES it?\n“${x[0]}”`,answer:x[1],
    choices:shuffle(r,[x[1],...x[2]])}
},
confusedwords(r,p,i){
  const q=[["Please ___ the lantern on the table.","set",["sit","sat","setted"]],
   ["I need to ___ down before the next climb.","sit",["set","sat down it","setted"]],
   ["___ the flag at sunrise.","Raise",["Rise","Raised up","Risen"]],
   ["The sun will ___ at six tomorrow.","rise",["raise","rose up","raised"]],
   ["Go ___ down in the shade for a while.","lie",["lay","laid","lied"]],
   ["Please ___ the map on the table.","lay",["lie","lied","laying down"]],
   ["___ going to be a long climb.","It's",["Its","Its'","It is'nt"]],
   ["The dragon guarded ___ hoard.","its",["it's","its'","it is"]],
   ["___ boots are these?","Whose",["Who's","Whos","Whose's"]],
   ["___ ready to leave now.","They're",["Their","There","Theyre"]],
   ["We hiked ___ than we planned.","farther",["further more","farthest","more far"]],
   ["There were ___ people than yesterday.","fewer",["less","lesser","little"]]];
  const x=bp(r,q,i);
  return {prompt:`Choose the correct word:\n“${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
},
prepadverb(r,p,i){
  const q=[["The scout looked up the steep path.","preposition",["adverb","conjunction","noun"]],
   ["The scout looked up.","adverb",["preposition","conjunction","noun"]],
   ["Maya ran inside the tower.","preposition",["adverb","verb","adjective"]],
   ["Maya ran inside.","adverb",["preposition","verb","adjective"]],
   ["We waited outside the gate.","preposition",["adverb","noun","verb"]],
   ["We waited outside.","adverb",["preposition","noun","verb"]]];
  const x=bp(r,q,i);
  return {prompt:`Is the underlined word a preposition or an adverb?\n“${x[0]}”\n(A preposition always has an object after it.)`,
    answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
},
sentencecraft(r,p,i){
  const combine=[["Leo found the map. The map was torn.","Leo found the torn map.",
    ["Leo found the map and the map was torn.","Leo found the map, the map was torn.","Leo found. The torn map."]],
   ["The scouts were tired. They kept walking.","The scouts were tired, but they kept walking.",
    ["The scouts were tired they kept walking.","The scouts were tired and tired walking.","Tired scouts, kept walking."]],
   ["Priya drew a map. Maya carried it.","Priya drew a map, and Maya carried it.",
    ["Priya drew a map Maya carried it.","Priya drew a map, Maya carried it.","Drew a map Priya, carried Maya."]]];
  const expand=[["The dragon slept.","The enormous dragon slept beneath the crumbling tower.",
    ["The dragon slept slept.","Slept the dragon did.","The dragon was sleeping sleep."]],
   ["We walked.","We walked three miles through knee-deep snow.",
    ["We walked walked.","Walking, we did.","We was walking far."]]];
  const reduce=[["Due to the fact that it was raining, we stayed inside.","Because it was raining, we stayed inside.",
    ["Due to the rain fact, we stayed inside.","It was raining and due to that fact we stayed inside.","We stayed inside, due to the fact of rain."]],
   ["He made his way in the direction of the gate.","He headed toward the gate.",
    ["He made a way direction to the gate.","In the direction of the gate he made his way going.","He went in the gate direction."]]];
  const mode=i%3;
  if(mode===0){const x=bp(r,combine,i);
    return {prompt:`Which sentence BEST COMBINES these two?\n“${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}}
  if(mode===1){const x=bp(r,expand,i);
    return {prompt:`Which version EXPANDS this sentence with useful detail?\n“${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}}
  const x=bp(r,reduce,i);
  return {prompt:`Which version says the same thing MORE CONCISELY?\n“${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
},
factopinion(r,p,i){
  const facts=["The library has twelve windows.","Water freezes at 0 degrees Celsius.",
    "Colorado borders Wyoming.","A hexagon has six sides.","The book has 214 pages.",
    "Our school day ends at 3:15."];
  const ops=["Recess is the best part of the day.","Blue is a prettier color than green.",
    "That book was too long.","Winter is the worst season.","Math is more fun than reading.",
    "This is the most beautiful trail in the state."];
  const wantFact=i%2===0;
  const s=wantFact?pick(r,facts):pick(r,ops);
  if(i%3===2)
    return {prompt:`Which statement is a FACT (it can be checked and proven)?`,answer:pick(r,facts),
      choices:opts(r,pick(r,facts),shuffle(r,ops).slice(0,3))};
  return {prompt:`Is this a fact or an opinion?\n“${s}”`,answer:wantFact?"fact":"opinion",
    choices:shuffle(r,["fact","opinion","both","neither"])}
},
textstructure(r,p,i){
  const q=[["First, gather your gear. Next, check the ropes. Finally, set out.","sequence",["compare and contrast","cause and effect","problem and solution"]],
   ["The river flooded, so the village moved to higher ground.","cause and effect",["sequence","description","compare and contrast"]],
   ["Unlike the northern pass, the southern route stays clear all winter.","compare and contrast",["sequence","cause and effect","problem and solution"]],
   ["The bridge kept washing out. Engineers rebuilt it from stone.","problem and solution",["sequence","description","compare and contrast"]],
   ["The tower is forty feet tall, built of grey stone, with narrow windows.","description",["sequence","cause and effect","problem and solution"]],
   ["Because the snow melted early, the planting season began sooner.","cause and effect",["description","sequence","compare and contrast"]]];
  const x=bp(r,q,i);
  return {prompt:`What text structure does this passage use?\n“${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
},
comparecontrast(r,p,i){
  const q=[["Both the raven and the falcon are birds that hunt.","comparing (showing how they are alike)",
    ["contrasting (showing how they differ)","sequencing","explaining a cause"]],
   ["The raven scavenges, while the falcon hunts live prey.","contrasting (showing how they differ)",
    ["comparing (showing how they are alike)","sequencing","describing a setting"]],
   ["Like the old bridge, the new one is built of stone.","comparing (showing how they are alike)",
    ["contrasting (showing how they differ)","giving directions","stating an opinion"]],
   ["Unlike the old bridge, the new one has a railing.","contrasting (showing how they differ)",
    ["comparing (showing how they are alike)","sequencing","describing a cause"]]];
  const x=bp(r,q,i);
  if(i%3===2){
    const signal=[["both","comparing"],["unlike","contrasting"],["similarly","comparing"],["however","contrasting"],["likewise","comparing"],["whereas","contrasting"]];
    const [w,kind]=bp(r,signal,i);
    return {prompt:`The signal word “${w}” tells you the writer is ___`,answer:kind,
      choices:shuffle(r,["comparing","contrasting","sequencing","summarizing"])}
  }
  return {prompt:`Is this sentence comparing or contrasting?\n“${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
},
poetryelements(r,p,i){
  const q=[["Words at the ends of lines that sound alike","rhyme",["rhythm","stanza","simile"]],
   ["A group of lines set apart, like a paragraph in a poem","stanza",["rhyme","meter","refrain"]],
   ["The beat or pattern of stressed and unstressed syllables","rhythm",["rhyme","stanza","imagery"]],
   ["A line or group of lines repeated through a poem","refrain",["stanza","meter","simile"]],
   ["Language that appeals to the five senses","imagery",["rhyme","stanza","refrain"]],
   ["Repeating the same beginning sound in nearby words","alliteration",["rhyme","rhythm","stanza"]],
   ["A poem of five lines with a bouncy rhythm and an AABBA rhyme","limerick",["haiku","cinquain","sonnet"]],
   ["A poem where the first letters of each line spell a word","acrostic",["haiku","limerick","cinquain"]]];
  const x=bp(r,q,i);
  return {prompt:`Which element of poetry is being described?\n“${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
}

});
/* ==========================================================================
   6TH-GRADE GENERATORS — from the 5-A-Day Language spiral review.
   Every item's answer was recovered by diffing the student page against the
   resource's own answer key, so these are the publisher's answers, not mine.
   ========================================================================== */
Object.assign(ELA_GEN, {

  g6spelling(r,p,i){
    const B=(typeof DW_G6!=="undefined"&&DW_G6.spelling)||[];
    if(!B.length) return null;
    const x=bp(r,B,i);
    if(i%2===0)
      return {prompt:`Which word is MISSPELLED?`,answer:x.misspelled,
        choices:shuffle(r,[...new Set(x.options)]).slice(0,4)};
    return {prompt:`“${x.misspelled}” is spelled incorrectly. What is the correct spelling?`,
      answer:x.correct,choices:opts(r,x.correct,[x.misspelled,
        x.correct.replace(/e$/,'')+"ible", x.correct+"e", x.correct.replace(/a/,'e')])}
  },

  g6contextclue(r,p,i){
    const B=(typeof DW_G6!=="undefined"&&DW_G6.contextclue)||[];
    if(!B.length) return null;
    const x=bp(r,B,i);
    const others=shuffle(r,B.filter(y=>y.definition!==x.definition)).slice(0,3).map(y=>y.definition);
    if(others.length<3) return null;
    if(i%2===0)
      return {prompt:`Read the passage, then use the context clues.\n\n${x.passage}\n\nWhat does “${x.word}” mean?`,
        answer:x.definition,choices:shuffle(r,[x.definition,...others])};
    return {prompt:`Which word means “${x.definition}”?`,answer:x.word,
      choices:shuffle(r,[x.word,...shuffle(r,B.filter(y=>y.word!==x.word)).slice(0,3).map(y=>y.word)])}
  },

  g6intensive(r,p,i){
    const B=(typeof DW_G6!=="undefined"&&DW_G6.intensive)||[];
    if(!B.length) return null;
    const x=bp(r,B,i);
    const all=["myself","yourself","himself","herself","itself","ourselves","yourselves","themselves"];
    return {prompt:`Complete the sentence with the correct INTENSIVE pronoun.\n“${x.sentence}”`,
      answer:x.answer,choices:shuffle(r,[x.answer,...shuffle(r,all.filter(a=>a!==x.answer)).slice(0,3)])}
  },

  g6roots(r,p,i){
    const B=(typeof DW_G6!=="undefined"&&DW_G6.roots6)||[];
    if(!B.length) return null;
    const x=bp(r,B,i);
    const others=shuffle(r,B.filter(y=>y.meaning!==x.meaning)).slice(0,3).map(y=>y.meaning);
    if(others.length<3) return null;
    const mode=i%3;
    if(mode===0)
      return {prompt:`What does the Greek or Latin root “${x.root}” mean?`,answer:x.meaning,
        choices:shuffle(r,[x.meaning,...others])};
    if(mode===1)
      return {prompt:`Which word contains the root “${x.root}” (meaning “${x.meaning}”)?`,
        answer:pick(r,x.words),
        choices:opts(r,pick(r,x.words),shuffle(r,B.filter(y=>y.root!==x.root)).slice(0,3).flatMap(y=>y.words.slice(0,1)))};
    const w=pick(r,x.words);
    return {prompt:`The word “${w}” contains the root “${x.root}”. What does that root add to its meaning?`,
      answer:x.meaning,choices:shuffle(r,[x.meaning,...others])}
  }

});
/* ==========================================================================
   WRITING / REVISION GENERATOR
   The packet's "Writing" and "Sentence Writing" days were open-response.
   Rendered here as revision work: combining, precision, detail, clarity.
   ========================================================================== */
const W_WEAK=[
 ["The dragon went across the bridge.","The dragon hurtled across the bridge.",
  ["The dragon did a thing across it.","The dragon was bridge.","Across the dragon went."]],
 ["The soup was good.","The soup was rich and peppery.",
  ["The soup was good good.","Soup, it was good.","The soup were good."]],
 ["Maya walked to the tower.","Maya trudged to the tower.",
  ["Maya did walking to the tower.","Maya, walking, tower.","Maya walk to the tower."]],
 ["It was a big storm.","It was a ferocious storm.",
  ["It was a big big storm.","Storm was big it.","It were a big storm."]],
 ["The room was nice.","The room was warm and softly lit.",
  ["The room was nice nice.","Nice, the room.","The room were nice."]],
 ["He said he was tired.","He mumbled that he was exhausted.",
  ["He said said tired.","Tired he was saying.","He say he was tired."]],
 ["The gate made a noise.","The gate shrieked on rusted hinges.",
  ["The gate made noise noise.","Noise the gate made it.","The gate make a noise."]],
 ["She looked at the map.","She studied the map closely.",
  ["She looked look at map.","Map she at looked.","She look at the map."]]];
const W_COMBINE=[
 ["Leo found the map. The map was torn.","Leo found the torn map.",
  ["Leo found the map and the map was torn map.","Leo found the map, the map was torn.","Leo found. The torn map."]],
 ["The scouts were tired. The scouts kept walking.","The scouts were tired, but they kept walking.",
  ["The scouts were tired the scouts kept walking.","The scouts were tired and tired walking.","Tired scouts, kept walking they."]],
 ["Priya drew a map. Maya carried it.","Priya drew a map, and Maya carried it.",
  ["Priya drew a map Maya carried it.","Priya drew a map, Maya carried it.","Drew a map Priya, carried Maya."]],
 ["The river froze. We could cross it.","Because the river froze, we could cross it.",
  ["The river froze we could cross it.","The river froze, we could cross it.","Froze river, cross we could."]],
 ["The lantern was old. The lantern still worked.","The old lantern still worked.",
  ["The lantern was old the lantern still worked.","The lantern old, still worked it.","Old lantern was, worked still."]],
 ["Sam packed rope. Sam packed food.","Sam packed rope and food.",
  ["Sam packed rope Sam packed food.","Sam packed rope, Sam packed food.","Rope and food, Sam packing."]]];
const W_DETAIL=[
 ["We walked.","We walked three miles through knee-deep snow.",
  ["We walked walked.","Walking, we.","We was walking."]],
 ["The bird flew away.","The startled raven burst from the hedge and vanished over the ridge.",
  ["The bird flew flew away.","Away flew bird the.","The bird flied away."]],
 ["It was cold.","Frost webbed the windows and our breath hung in the air.",
  ["It was cold cold.","Cold it was being.","It were cold."]],
 ["The room was messy.","Books, boots, and half-drawn maps covered every surface.",
  ["The room was messy messy.","Messy the room was it.","The room were messy."]]];
const W_TOPIC=[
 ["Dragons appear in stories from many different cultures.",["My favorite color is green.","I once saw a lizard.","Dragons are cool."]],
 ["Learning to read a map is a valuable skill for any traveler.",["Maps are made of paper.","I like traveling.","North is up."]],
 ["Keeping a daily journal helps writers improve in three important ways.",["I have a journal.","Journals have pages.","Writing is hard."]],
 ["Lanterns were essential tools for medieval travelers.",["Lanterns are old.","I saw a lantern once.","Fire is hot."]],
 ["Working as a team makes difficult tasks manageable.",["Teams have people.","I like my team.","Some tasks are hard."]],
 ["Rivers shaped where early villages were built.",["Rivers are wet.","I swam in a river.","Villages are small."]],
 ["Winter travel in the mountains requires careful preparation.",["Winter is cold.","I own a coat.","Mountains are tall."]],
 ["Handmade maps reveal what their makers valued most.",["Maps are drawings.","I drew a map.","Paper is thin."]]];
const W_CONCLUDE=[
 ["a paragraph about why maps matter","For any traveler, a good map is the difference between a journey and a rescue.",
  ["Maps are made of paper.","I like maps a lot.","The end."]],
 ["a paragraph about teamwork","When each member contributes a strength, the whole group moves farther than any one person could.",
  ["Teams are groups of people.","That is all about teams.","Teamwork, the end."]],
 ["a paragraph about winter preparation","A little planning in autumn is what makes a winter crossing survivable.",
  ["Winter is a season.","So that is winter.","The end of winter."]]];

const WRITING_GEN = {
  writing(r,p,i){
    const mode=i%5;
    if(mode===0){
      const x=bp(r,W_WEAK,i);
      return {prompt:`Which revision is the MOST PRECISE?\n“${x[0]}”`,answer:x[1],choices:shuffle(r,[x[1],...x[2]])}
    }
    if(mode===1){
      const x=bp(r,W_COMBINE,i);
      return {prompt:`Which sentence BEST COMBINES these two sentences?\n“${x[0]}”`,answer:x[1],
        choices:shuffle(r,[x[1],...x[2]])}
    }
    if(mode===2){
      const x=bp(r,W_DETAIL,i);
      return {prompt:`Which revision adds the MOST USEFUL DETAIL?\n“${x[0]}”`,answer:x[1],
        choices:shuffle(r,[x[1],...x[2]])}
    }
    if(mode===3){
      const x=bp(r,W_TOPIC,i);
      return {prompt:`Which sentence is the best TOPIC SENTENCE for a paragraph?`,answer:x[0],
        choices:shuffle(r,[x[0],...x[1]])}
    }
    const x=bp(r,W_CONCLUDE,i);
    return {prompt:`Which sentence is the best CONCLUDING SENTENCE for ${x[0]}?`,answer:x[1],
      choices:shuffle(r,[x[1],...x[2]])}
  }
};
/* ==========================================================================
   SCIENCE GENERATORS — Explore Academy Q1
   Built directly from the NGSS codes and "I can" statements in the pacing
   guide, and from the 108 science vocabulary terms already in the data.
     4-PS3-1  faster objects have more energy
     4-PS3-2  energy moves through sound, light, heat, electricity
     4-PS3-3  collisions
     4-PS3-4  energy conversion devices
     4-ESS3-1 energy resources and environmental impact
     3-5 ETS1-1/2/3  define a problem, compare solutions, fair testing
     5-PS3-1  energy in food comes from the sun
     5-LS1-1  plants get materials from air and water
     5-LS2-1  movement of matter among organisms
   ========================================================================== */
const SCI_GEN = {

/* -------------------------------------------------- 4-PS3-1 speed & energy */
speed_energy(r,p,i){
  const mode=i%5;
  if(mode===0){
    const a=ri(r,2,9), b=a+ri(r,2,8);
    return {prompt:`Two identical carts roll down a ramp. Cart A moves at ${a} m/s and Cart B moves at ${b} m/s.\nWhich cart has MORE energy of motion?`,
      answer:`Cart B, because it is moving faster`,
      choices:shuffle(r,[`Cart B, because it is moving faster`,`Cart A, because it is moving slower`,
        `They have the same energy because the carts are identical`,`Cart A, because slower objects store more energy`])}
  }
  if(mode===1)
    return {prompt:`What happens to an object's energy of motion when its speed increases?`,
      answer:`The energy increases`,choices:shuffle(r,["The energy increases","The energy decreases",
        "The energy stays the same","The energy disappears"])};
  if(mode===2){
    const items=[["a bike coasting slowly downhill","a bike racing downhill","the racing bike"],
      ["a rolling marble","a rolling bowling ball at the same speed","the bowling ball"],
      ["a thrown tennis ball","a gently tossed tennis ball","the thrown ball"],
      ["a walking student","a sprinting student","the sprinting student"]];
    const x=bp(r,items,i);
    return {prompt:`Compare ${x[0]} and ${x[1]}. Which has more energy?`,answer:x[2],
      choices:shuffle(r,[x[2],x[2].replace("the ","the other "),"They have exactly the same energy","Neither has any energy"])}
  }
  if(mode===3)
    return {prompt:`A ball rolls faster and faster down a hill. What is the evidence that its energy is increasing?`,
      answer:`It would hit an object harder and move it farther`,
      choices:shuffle(r,["It would hit an object harder and move it farther","It gets smaller as it rolls",
        "It changes color as it speeds up","It becomes lighter"])};
  const v=pick(r,["speed","kinetic energy","motion","evidence"]);
  const defs={speed:"how fast an object is moving",
    "kinetic energy":"the energy an object has because it is moving",
    motion:"a change in an object's position",
    evidence:"observations or data used to support an explanation"};
  return {prompt:`In science, what does “${v}” mean?`,answer:defs[v],
    choices:shuffle(r,[defs[v],...shuffle(r,Object.values(defs).filter(d=>d!==defs[v])).slice(0,3)])}
},

/* ------------------------------------------- 4-PS3-2 energy transfer */
energy_transfer(r,p,i){
  const forms=[["a drum being struck and you feel the vibration","sound"],
    ["a flashlight beam warming your hand","light"],
    ["a metal spoon getting hot in soup","heat"],
    ["a wire carrying power to a bulb","electricity"],
    ["a ringing bell you can hear across the room","sound"],
    ["the sun shining on a solar panel","light"],
    ["a stove burner warming a pan","heat"],
    ["a battery lighting a circuit","electricity"]];
  const mode=i%4;
  if(mode===0){
    const x=bp(r,forms,i);
    return {prompt:`Which type of energy transfer is shown?\n“${x[0]}”`,answer:x[1],
      choices:shuffle(r,["sound","light","heat","electricity"])}
  }
  if(mode===1)
    return {prompt:`Energy can move from place to place. Which list shows FOUR ways energy transfers?`,
      answer:"sound, light, heat, and electricity",
      choices:shuffle(r,["sound, light, heat, and electricity","solid, liquid, gas, and plasma",
        "push, pull, lift, and drop","north, south, east, and west"])};
  if(mode===2){
    const c=[["copper wire","conductor"],["rubber glove","insulator"],["metal spoon","conductor"],
      ["wooden handle","insulator"],["aluminum foil","conductor"],["plastic cup","insulator"]];
    const x=bp(r,c,i);
    return {prompt:`Is a ${x[0]} a conductor or an insulator?`,answer:x[1],
      choices:shuffle(r,["conductor","insulator","neither one","both at once"])}
  }
  return {prompt:`A lamp is plugged in and turned on. Trace the energy pathway.`,
    answer:"electrical energy → light energy and heat energy",
    choices:shuffle(r,["electrical energy → light energy and heat energy",
      "light energy → electrical energy","sound energy → electrical energy",
      "heat energy → sound energy"])}
},

/* ------------------------------------------- 4-PS3-3 collisions */
collisions(r,p,i){
  const mode=i%5;
  if(mode===0){
    const s=ri(r,3,9);
    return {prompt:`A cart moving at ${s} m/s collides with a cart sitting still. What will most likely happen?`,
      answer:`Energy transfers to the still cart and it starts to move`,
      choices:shuffle(r,["Energy transfers to the still cart and it starts to move",
        "Both carts stop instantly and energy disappears","The still cart stays still and nothing changes",
        "The moving cart speeds up after the collision"])}
  }
  if(mode===1)
    return {prompt:`During a collision, what happens to energy?`,
      answer:"It transfers between the objects and into sound and heat",
      choices:shuffle(r,["It transfers between the objects and into sound and heat",
        "It is destroyed completely","It turns into new matter","It stays only in the first object"])};
  if(mode===2)
    return {prompt:`Two identical carts collide. One was moving fast, the other slowly.\nWhich collision would cause the LOUDER sound and MORE damage?`,
      answer:"the faster collision, because faster objects carry more energy",
      choices:shuffle(r,["the faster collision, because faster objects carry more energy",
        "the slower collision, because slow objects push harder",
        "both exactly the same","neither would make any sound"])};
  if(mode===3){
    const v=pick(r,["collision","impact","momentum","outcome"]);
    const defs={collision:"when two objects crash into each other",
      impact:"the moment and force of one object striking another",
      momentum:"how hard it is to stop a moving object",
      outcome:"what happens as a result of an event"};
    return {prompt:`What does “${v}” mean in science?`,answer:defs[v],
      choices:shuffle(r,[defs[v],...shuffle(r,Object.values(defs).filter(d=>d!==defs[v])).slice(0,3)])}
  }
  return {prompt:`You roll a marble into a line of blocks and they scatter. What is the BEST evidence that energy transferred?`,
    answer:"the blocks moved and made noise after being hit",
    choices:shuffle(r,["the blocks moved and made noise after being hit","the marble changed color",
      "the blocks got heavier","the room got darker"])}
},

/* ------------------------------------------- 4-PS3-4 energy conversion */
energy_conversion(r,p,i){
  const dev=[["a solar-powered calculator","light energy","electrical energy"],
    ["a wind-up toy car","stored (elastic) energy","motion energy"],
    ["a flashlight","electrical energy","light energy"],
    ["a wind turbine","motion energy","electrical energy"],
    ["an electric heater","electrical energy","heat energy"],
    ["a speaker","electrical energy","sound energy"],
    ["a hand-crank radio","motion energy","electrical energy"]];
  const x=bp(r,dev,i);
  const mode=i%3;
  if(mode===0)
    return {prompt:`${x[0].charAt(0).toUpperCase()+x[0].slice(1)} converts energy from one form to another.\nWhat is the energy converted INTO?`,
      answer:x[2],choices:shuffle(r,[x[2],x[1],"sound energy into matter","matter into light"].slice(0,4))};
  if(mode===1)
    return {prompt:`${x[0].charAt(0).toUpperCase()+x[0].slice(1)} — what form of energy does it START with?`,
      answer:x[1],choices:shuffle(r,[x[1],x[2],"chemical energy","nuclear energy"])};
  return {prompt:`You build a device that changes energy from one form to another. After testing, it works poorly.\nWhat should an engineer do NEXT?`,
    answer:"use the test evidence to improve the design and test again",
    choices:shuffle(r,["use the test evidence to improve the design and test again",
      "throw it away and start a completely different project","decide the test was wrong and ignore it",
      "change the goal so the device already passes"])}
},

/* ------------------------------------------- 4-ESS3-1 energy resources */
energy_resources(r,p,i){
  const res=[["solar","renewable"],["wind","renewable"],["coal","nonrenewable"],["oil","nonrenewable"],
    ["natural gas","nonrenewable"],["hydroelectric","renewable"],["geothermal","renewable"]];
  const mode=i%4;
  if(mode===0){
    const x=bp(r,res,i);
    return {prompt:`Is ${x[0]} energy a renewable or a nonrenewable resource?`,answer:x[1],
      choices:shuffle(r,["renewable","nonrenewable","both","neither"])}
  }
  if(mode===1)
    return {prompt:`What makes a resource NONRENEWABLE?`,
      answer:"once it is used up it cannot be replaced in a human lifetime",
      choices:shuffle(r,["once it is used up it cannot be replaced in a human lifetime",
        "it can be reused forever with no limit","it is always cheaper than other resources",
        "it never causes pollution"])};
  if(mode===2)
    return {prompt:`Burning fossil fuels for energy affects the environment. Which is a REAL effect?`,
      answer:"it releases pollution into the air",
      choices:shuffle(r,["it releases pollution into the air","it creates more fossil fuel underground",
        "it makes the sun brighter","it has no effect at all"])};
  const v=pick(r,["natural resources","fossil fuels","conservation","sustainability"]);
  const defs={"natural resources":"materials from the Earth that people use",
    "fossil fuels":"fuels formed from the remains of ancient living things",
    conservation:"using resources carefully so less is wasted",
    sustainability:"meeting today's needs without using up what the future needs"};
  return {prompt:`What does “${v}” mean?`,answer:defs[v],
    choices:shuffle(r,[defs[v],...shuffle(r,Object.values(defs).filter(d=>d!==defs[v])).slice(0,3)])}
},

/* ------------------------------------------- 3-5 ETS1-1 define a problem */
design_problem(r,p,i){
  const mode=i%4;
  if(mode===0)
    return {prompt:`Engineers define a problem before solving it. A well-defined problem always states ___`,
      answer:"the goal and the limits (criteria and constraints)",
      choices:shuffle(r,["the goal and the limits (criteria and constraints)",
        "the final answer before any testing","who is to blame for the problem",
        "the cost of every possible material"])};
  if(mode===1)
    return {prompt:`“The device must lift 2 kilograms.” Is that a criterion (a goal) or a constraint (a limit)?`,
      answer:"a criterion",choices:shuffle(r,["a criterion","a constraint","neither","both"])};
  if(mode===2)
    return {prompt:`“You may only use materials from the classroom bin.” Is that a criterion or a constraint?`,
      answer:"a constraint",choices:shuffle(r,["a constraint","a criterion","neither","both"])};
  const v=pick(r,["criteria","constraints","success criteria","prototype"]);
  const defs={criteria:"the goals a solution must meet to count as successful",
    constraints:"the limits a solution has to work within, like time or materials",
    "success criteria":"how you will decide whether the solution worked",
    prototype:"an early test version of a design"};
  return {prompt:`In engineering, what are “${v}”?`,answer:defs[v],
    choices:shuffle(r,[defs[v],...shuffle(r,Object.values(defs).filter(d=>d!==defs[v])).slice(0,3)])}
},

/* ------------------------------------------- 3-5 ETS1-2 compare solutions */
compare_solutions(r,p,i){
  const mode=i%3;
  if(mode===0)
    return {prompt:`Three designs are tested. How should an engineer decide which is BEST?`,
      answer:"compare each design against the criteria and constraints",
      choices:shuffle(r,["compare each design against the criteria and constraints",
        "pick the one that looks nicest","pick the one that was built first",
        "pick whichever the most people voted for"])};
  if(mode===1){
    const a=ri(r,60,95), b=ri(r,40,a-5);
    return {prompt:`Design A meets ${a}% of the success criteria. Design B meets ${b}%.\nBoth cost the same and use allowed materials. Which should you choose?`,
      answer:"Design A",choices:shuffle(r,["Design A","Design B","Neither one","It cannot be decided"])}
  }
  return {prompt:`Why do engineers generate MULTIPLE solutions instead of just one?`,
    answer:"comparing several ideas leads to a better final design",
    choices:shuffle(r,["comparing several ideas leads to a better final design",
      "it uses up more materials","it makes the project take longer on purpose",
      "the first idea is always the worst"])}
},

/* ------------------------------------------- 3-5 ETS1-3 fair test */
fair_test(r,p,i){
  const mode=i%4;
  if(mode===0)
    return {prompt:`In a FAIR test, how many things should you change at one time?`,
      answer:"one",choices:shuffle(r,["one","two","as many as possible","none"])};
  if(mode===1)
    return {prompt:`You test which ramp height makes a car roll farthest. To keep it fair, what must stay the SAME?`,
      answer:"the car, the ramp surface, and the starting position",
      choices:shuffle(r,["the car, the ramp surface, and the starting position",
        "the ramp height","the person watching","the day of the week"])};
  if(mode===2)
    return {prompt:`Your first test gives a surprising result. What should you do?`,
      answer:"repeat the test to see if the result happens again",
      choices:shuffle(r,["repeat the test to see if the result happens again",
        "delete the result because it looks wrong","change the goal so the result fits",
        "stop testing and report the surprise as final"])};
  return {prompt:`After testing, your design fails one criterion. What does an engineer do with that evidence?`,
    answer:"use it to refine the design and test again",
    choices:shuffle(r,["use it to refine the design and test again","hide the failed result",
      "declare the design finished anyway","blame the materials and stop"])}
},

/* ------------------------------------------- 5-PS3-1 energy in food */
food_energy(r,p,i){
  const mode=i%4;
  if(mode===0)
    return {prompt:`Where does the energy in the food an animal eats ORIGINALLY come from?`,
      answer:"the sun",choices:shuffle(r,["the sun","the soil","the animal itself","the moon"])};
  if(mode===1)
    return {prompt:`A rabbit eats grass, and a fox eats the rabbit. Trace the energy.`,
      answer:"sun → grass → rabbit → fox",
      choices:shuffle(r,["sun → grass → rabbit → fox","fox → rabbit → grass → sun",
        "soil → fox → grass → rabbit","rabbit → sun → grass → fox"])};
  if(mode===2)
    return {prompt:`Animals use the energy from food for three things. Which list is correct?`,
      answer:"growth, motion, and body warmth",
      choices:shuffle(r,["growth, motion, and body warmth","making soil, rain, and wind",
        "photosynthesis, roots, and leaves","gravity, magnetism, and light"])};
  return {prompt:`Why do scientists use MODELS to show energy moving through living things?`,
    answer:"a model makes an invisible process easier to see and explain",
    choices:shuffle(r,["a model makes an invisible process easier to see and explain",
      "models are always exactly correct","a model replaces the need for evidence",
      "models are quicker than thinking"])}
},

/* ------------------------------------------- 5-LS1-1 plant materials */
plant_materials(r,p,i){
  const mode=i%4;
  if(mode===0)
    return {prompt:`Where do plants get MOST of the material they need to grow?`,
      answer:"from air and water",choices:shuffle(r,["from air and water","mostly from the soil",
        "from sunlight alone","from animals"])};
  if(mode===1)
    return {prompt:`Which gas do plants take in from the air to build their material?`,
      answer:"carbon dioxide",choices:shuffle(r,["carbon dioxide","oxygen","nitrogen","helium"])};
  if(mode===2)
    return {prompt:`A plant grown in a pot gains many kilograms of mass, but the soil barely loses any.\nWhat does this evidence support?`,
      answer:"the plant's material came mostly from air and water, not soil",
      choices:shuffle(r,["the plant's material came mostly from air and water, not soil",
        "the soil turned directly into the plant","the pot added mass to the plant",
        "plants do not gain mass at all"])};
  return {prompt:`What role does sunlight play for a plant?`,
    answer:"it provides the energy the plant uses to build its material",
    choices:shuffle(r,["it provides the energy the plant uses to build its material",
      "it is the material the plant is made from","it keeps the soil from drying out",
      "it has no effect on plants"])}
},

/* ------------------------------------------- 5-LS2-1 movement of matter */
matter_movement(r,p,i){
  const mode=i%4;
  if(mode===0)
    return {prompt:`What is the role of DECOMPOSERS in an ecosystem?`,
      answer:"they break down dead material and return matter to the environment",
      choices:shuffle(r,["they break down dead material and return matter to the environment",
        "they make their own food from sunlight","they hunt and eat living animals",
        "they stop matter from moving"])};
  if(mode===1)
    return {prompt:`In a food web, which organisms make their own food?`,
      answer:"producers, such as plants",choices:shuffle(r,["producers, such as plants",
        "consumers, such as deer","decomposers, such as fungi","predators, such as wolves"])};
  if(mode===2)
    return {prompt:`A model shows arrows between plants, animals, decomposers and the environment.\nWhat do the arrows represent?`,
      answer:"the movement of matter and energy",
      choices:shuffle(r,["the movement of matter and energy","the age of each organism",
        "the size of each organism","the names of the species"])};
  return {prompt:`If all the decomposers in an ecosystem disappeared, what would most likely happen?`,
    answer:"dead material would build up and nutrients would stop cycling",
    choices:shuffle(r,["dead material would build up and nutrients would stop cycling",
      "plants would grow much faster","nothing would change","the sun would provide less energy"])}
}

};
/* ==========================================================================
   CURRICULUM VOCABULARY + MORPHOLOGY
   Terms come straight from the Vocabulary strand of the Q1 pacing guide.
   Roots and target words come from D.morphology.
   ========================================================================== */
const DW_TERMS = {
  /* ---- 4th/5th grade math, Q1 ---- */
  "digit":"any one of the symbols 0 through 9 used to write numbers",
  "value":"how much a digit is worth because of its place in a number",
  "ten times":"ten of something; a digit is ten times the value of the same digit one place to its right",
  "expanded form":"a number written as the sum of the value of each digit",
  "standard form":"a number written with digits in the usual way",
  "word form":"a number written out in words",
  "greater than":"larger in value; shown by the symbol >",
  "less than":"smaller in value; shown by the symbol <",
  "equal":"exactly the same in value; shown by the symbol =",
  "round":"to replace a number with a nearby simpler number",
  "nearest ten":"the closest multiple of ten",
  "nearest hundred":"the closest multiple of one hundred",
  "benchmark":"a familiar number used to estimate or compare",
  "addend":"a number being added in an addition problem",
  "sum":"the answer to an addition problem",
  "regroup":"to trade between place values when adding or subtracting",
  "difference":"the answer to a subtraction problem",
  "exchange":"to trade an amount in one place value for its equal in another",
  "algorithm":"a step-by-step procedure for solving a problem",
  "operation":"a math action such as adding, subtracting, multiplying or dividing",
  "clue words":"words in a word problem that hint at which operation to use",
  "remainder":"the amount left over after dividing",
  "strategy":"a plan or method for solving a problem",
  "explain":"to tell how or why, using reasons and evidence",
  "point":"an exact location with no size",
  "line":"a straight path that goes on forever in both directions",
  "ray":"a straight path with one endpoint that goes on forever in one direction",
  "segment":"a straight path with two endpoints",
  "angle":"the figure formed by two rays that share an endpoint",
  "vertex":"the point where two rays or sides meet",
  "parallel":"lines that never cross",
  "perpendicular":"lines that cross to form right angles",
  "symmetry":"when a figure can be folded so both halves match exactly",
  "decimal":"a number that uses a decimal point to show parts of a whole",
  "tenths":"the first place to the right of the decimal point",
  "hundredths":"the second place to the right of the decimal point",
  "thousandths":"the third place to the right of the decimal point",
  "power of ten":"the result of multiplying ten by itself a number of times",
  "product":"the answer to a multiplication problem",
  "quotient":"the answer to a division problem",
  "estimate":"a careful guess close to the exact answer",
  "compare":"to decide which is greater, less, or equal",
  "classify":"to sort things into groups by their properties",
  "category":"a group of things that share a property",
  /* ---- Q1 science ---- */
  "motion":"a change in an object's position",
  "speed":"how fast an object is moving",
  "kinetic energy":"the energy an object has because it is moving",
  "evidence":"observations or data used to support an explanation",
  "force":"a push or a pull on an object",
  "transfer":"to move energy from one place or object to another",
  "sound energy":"energy that travels as vibrations you can hear",
  "light energy":"energy that travels as light you can see",
  "heat energy":"energy that moves from warmer things to cooler things",
  "electrical current":"the flow of electricity through a path",
  "conductor":"a material that lets energy pass through it easily",
  "insulator":"a material that does not let energy pass through easily",
  "energy pathway":"the route energy follows as it moves and changes form",
  "collision":"when two objects crash into each other",
  "impact":"the moment and force of one object striking another",
  "momentum":"how hard it is to stop a moving object",
  "outcome":"what happens as a result of an event",
  "natural resources":"materials from the Earth that people use",
  "fossil fuels":"fuels formed from the remains of ancient living things",
  "renewable":"able to be replaced naturally in a short time",
  "nonrenewable":"not able to be replaced once it is used up",
  "environment":"the living and nonliving surroundings of an organism",
  "conservation":"using resources carefully so less is wasted",
  "sustainability":"meeting today's needs without using up what the future needs",
  "criteria":"the goals a solution must meet to count as successful",
  "constraints":"the limits a solution has to work within",
  "success criteria":"how you will decide whether a solution worked",
  "solution":"a way of solving a problem",
  "prototype":"an early test version of a design",
  "model":"a representation used to explain how something works",
  "energy conversion":"changing energy from one form into another",
  "producer":"a living thing that makes its own food",
  "consumer":"a living thing that eats other living things",
  "decomposer":"a living thing that breaks down dead material",
  "ecosystem":"all the living and nonliving things in an area and how they interact",
  "photosynthesis":"the process plants use to make food from light, air and water",
  "matter":"anything that has mass and takes up space"
};

/* One vocabulary question about a specific term from the day's lesson. */
function DW_TERM_Q(r, term, i){
  const def = DW_TERMS[String(term).toLowerCase()];
  if(!def) return null;
  const others = shuffle(r, Object.entries(DW_TERMS)
    .filter(([k,v])=>v!==def).map(([k,v])=>v)).slice(0,3);
  if(i%3===0)
    return {prompt:`What does “${term}” mean?`, answer:def, choices:shuffle(r,[def,...others])};
  if(i%3===1){
    const wrongTerms = shuffle(r, Object.keys(DW_TERMS)
      .filter(k=>k.toLowerCase()!==String(term).toLowerCase())).slice(0,3);
    return {prompt:`Which word means “${def}”?`, answer:term,
      choices:shuffle(r,[term,...wrongTerms])};
  }
  return {prompt:`A classmate says “${term}” means “${others[0]}.”\nIs that correct?`,
    answer:`No — it means ${def}`,
    choices:shuffle(r,[`No — it means ${def}`,"Yes, that is exactly right",
      "It means both of those things","The word has no science or math meaning"])};
}

const VOCAB_GEN = {
  /* params carry the day's term list, injected by the curriculum planner */
  curricvocab(r,p,i){
    const terms=(p.terms||[]).filter(t=>DW_TERMS[String(t).toLowerCase()]);
    if(!terms.length) return null;
    const t=bp(r,terms,i);
    return DW_TERM_Q(r,t,i);
  }
};

/* ------------------------------------------------------- morphology */
const DW_ROOT_MEANING = {
  "form":"shape","port":"to carry","scrib":"to write","script":"to write",
  "spec":"to look or see","spect":"to look or see","struc":"to build","struct":"to build",
  "flect":"to bend","flex":"to bend","dic":"to speak","dict":"to speak",
  "cede":"to go or yield","cess":"to go or yield","ceed":"to go or yield",
  "cred":"to believe","fer":"to carry or bring","ject":"to throw",
  "tract":"to pull or drag","mit":"to send","miss":"to send",
  "ven":"to come","vent":"to come"
};
function DW_ROOT_MEANING_OF(root){
  const parts=String(root||"").toLowerCase().split(/\s*\/\s*/);
  for(const p of parts) if(DW_ROOT_MEANING[p]) return DW_ROOT_MEANING[p];
  return null;
}

const MORPH_GEN = {
  /* params carry this week's root and the day's target word */
  curricmorph(r,p,i){
    const root=p.root||"", word=p.word||"";
    const meaning=DW_ROOT_MEANING_OF(root);
    if(!meaning) return null;
    const wrong=shuffle(r,Object.values(DW_ROOT_MEANING).filter(m=>m!==meaning)).slice(0,3);
    const mode=i%4;
    if(mode===0)
      return {prompt:`The root “${root}” means what?`,answer:meaning,
        choices:shuffle(r,[meaning,...wrong])};
    if(mode===1 && word){
      const sentence=String(p.syntactic||"").replace(new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\b`,"i"),"_____");
      if(sentence&&sentence!==p.syntactic){
        const decoys=shuffle(r,["formation","credible","portable","predict","rejected","invention","transportation"].filter(w=>w!==word)).slice(0,3);
        return {prompt:`Which target word correctly completes the sentence?\n${sentence}`,answer:word,choices:shuffle(r,[word,...decoys])};
      }
      return {prompt:`The word “${word}” is built from the root “${root}”.\nWhat does that root add to the meaning?`,answer:meaning,choices:shuffle(r,[meaning,...wrong])};
    }
    if(mode===2){
      if(p.morphological){
        const decoys=[`The root means “${wrong[0]},” so the word names something unrelated.`,`The word has no meaningful parts and must only be memorized.`,`The ending changes the word into the opposite of its actual meaning.`];
        return {prompt:`Which explanation best shows how “${word}” is built and what it means?`,answer:p.morphological,choices:shuffle(r,[p.morphological,...decoys])};
      }
      const family=Object.keys(DW_ROOT_MEANING).filter(k=>DW_ROOT_MEANING[k]===meaning);
      const decoys=shuffle(r,["garden","sudden","yellow","basket","meadow","pillow","harbor"]).slice(0,3);
      return {prompt:`Which word contains the root “${root}” (meaning “${meaning}”)?`,answer:word||family[0],choices:shuffle(r,[word||family[0],...decoys])};
    }
    return {prompt:`Knowing that “${root}” means “${meaning}”, what is the best strategy when you meet an unfamiliar word containing it?`,
      answer:"use the root plus the surrounding sentence to predict the meaning",
      choices:shuffle(r,["use the root plus the surrounding sentence to predict the meaning",
        "skip the word entirely","guess the longest definition you can find",
        "replace it with any word you already know"])};
  }
};
/* ==========================================================================
   ADDITIONAL SKILLS used by the 5th-Grade and Challenge tracks, which build
   their lessons in code rather than from the lesson map.
   ========================================================================== */
Object.assign(MATH_GEN, {
  percent(r,p,i){
    const pct=pick(r,[10,20,25,50,75]), whole=pick(r,[40,60,80,100,120,160,200,240]);
    const ans=whole*pct/100;
    return {prompt:`What is ${pct}% of ${whole}?`,answer:comma(ans),
      choices:opts(r,comma(ans),[comma(whole-pct),comma(pct),comma(ans+10),comma(whole/pct)])}
  },
  integers(r,p,i){
    const a=pick(r,[-12,-9,-6,-4,3,5,8,11]), b=pick(r,[-7,-3,2,4,6]);
    const sub=i%2===1;
    const ans=sub?a-b:a+b;
    return {prompt:`Evaluate ${a} ${sub?"−":"+"} (${b}). Use a number line if it helps.`,answer:String(ans),
      choices:opts(r,ans,[sub?a+b:a-b,-ans,Math.abs(ans),ans+b])}
  },
  volume(r,p,i){
    const l=ri(r,2,9),w=ri(r,2,9),h=ri(r,2,9);
    if(i%3===2){
      const vol=l*w*h;
      return {prompt:`A rectangular prism has a volume of ${vol} cubic units, a length of ${l}, and a width of ${w}. What is its height?`,
        answer:String(h),choices:opts(r,h,[h+1,h-1,vol/l,l*w])}
    }
    return {prompt:`A rectangular prism is ${l} by ${w} by ${h} units. What is its volume?`,
      answer:`${l*w*h} cubic units`,
      choices:opts(r,`${l*w*h} cubic units`,[`${l*w} cubic units`,`${2*(l*w+w*h+l*h)} cubic units`,
        `${l+w+h} cubic units`,`${l*w*h+h} cubic units`])}
  },
  coordinate(r,p,i){
    const x=ri(r,1,9),y=ri(r,1,9);
    const mode=i%3;
    if(mode===0)
      return {prompt:`Starting at the origin, move ${x} units right and ${y} units up. What ordered pair names that point?`,
        answer:`(${x}, ${y})`,choices:opts(r,`(${x}, ${y})`,[`(${y}, ${x})`,`(${x}, ${y+1})`,`(${x+1}, ${y})`])};
    if(mode===1)
      return {prompt:`In the ordered pair (${x}, ${y}), which number tells you how far to move ALONG the x-axis?`,
        answer:String(x),choices:opts(r,x,[y,x+y,0])};
    return {prompt:`Which ordered pair lies on the x-axis?`,answer:`(${x}, 0)`,
      choices:opts(r,`(${x}, 0)`,[`(0, ${y})`,`(${x}, ${y})`,`(0, 0)`])}
  },
  fracdivwhole(r,p,i){
    const d=pick(r,[2,3,4,5]), k=pick(r,[2,3,4]);
    const ans=fracStr(1,d*k);
    return {prompt:`${fracStr(1,d)} ÷ ${k} = ?`,answer:ans,
      choices:opts(r,ans,[fracStr(k,d),fracStr(1,d+k),fracStr(k,d*k),fracStr(1,d*k+1)])}
  }
});


/* Label -> skillId index. Built from the registry's own labels, then extended
   with the free-text names the 5th-Grade and Challenge tracks use, so those
   lessons route through the same verified generators instead of falling back. */
const DW_LABEL_INDEX = (function(){
  const ix = Object.create(null);
  const norm = s => String(s||"").toLowerCase().replace(/[^a-z0-9]/g,"");
  for(const id in DW_SKILLS) ix[norm(DW_SKILLS[id][0])] = id;
  // every worksheet title from the 22 packets, mangled spellings included
  if(typeof DW_PACKET_INDEX!=="undefined")
    for(const k in DW_PACKET_INDEX) if(DW_SKILLS[DW_PACKET_INDEX[k]]) ix[k]=DW_PACKET_INDEX[k];
  const alias = {
    "contextclues":"ela.meaning","academicvocabulary":"ela.meaning",
    "grammarusage":"ela.usage","grammarandusage":"ela.usage","usage":"ela.usage",
    "rootsandaffixes":"ela.roots","figurativelanguage":"ela.fig.similemetaphor",
    "wordrelationships":"ela.wordrel.mixed","sentencestructure":"ela.sent.three",
    "completesentences":"ela.sent.fragment","nouns":"ela.nouns.concrete",
    "verbs":"ela.verbs.irregular","adjectives":"ela.mod.compsuper",
    "adverbs":"ela.mod.compsuperadv","pronouns":"ela.pronouns.types",
    "sentenceediting":"ela.editing","mixedreview":"ela.usage",
    "numericalexpressions":"math.oporder","pemdas":"math.oporder",
    "percents":"math.percent","integers":"math.integers","volume":"math.volume",
    "coordinateplane":"math.coordinate","twovariablerelationships":"math.equations.twovar",
    "placevaluedecimals":"math.placevalue","decimalplacevalue":"math.placevalue",
    "decimaladdition":"math.dec.add","decimalsubtraction":"math.dec.sub",
    "decimaloperations":"math.dec.maze","decimals":"math.dec.compare",
    "fractions":"math.frac.compare","mixednumbers":"math.frac.mixedaddsub",
    "fractionmultiplication":"math.frac.mult","fractionoperations":"math.frac.addsub",
    "estimatingproductsoffractions":"math.frac.xwhole",
    "estimatingproductsofmixednumbers":"math.frac.multmixed",
    "multiplyingmixednumbers":"math.frac.multmixed","mixednumbermultiplication":"math.frac.multmixed",
    "multiplyingfractionsandmixednumbers":"math.frac.multmixed",
    "dividingfractionsbywholenumbers":"math.frac.divwhole",
    "dividingfractionsandmixednumbers":"math.frac.divwhole",
    "geometry":"math.geom.polygons","measurementconversions":"math.measure",
    "areaandcompositearea":"math.area","multidigitmultiplication":"math.mult.3x2",
    "multidigitdivision":"math.div.3",
    /* Labels exactly as they appear in the LIVE Firestore dailyQuests documents,
       including the PDF-mangled and truncated ones. Because normalisation strips
       the stray spaces, this engine routes correctly off the existing data with
       no reseed required. */
    "abbreviations":"ela.abbreviations",
    "abcorder":"ela.abcorder",
    "adages":"ela.fig.adage",
    "addingandsubtracting":"math.addsub.mixed",
    "addingandsubtractingfractions":"math.frac.addsub",
    "addingandsubtractingmixed":"math.frac.mixedaddsub",
    "addingandsubtractingmixednumbers":"math.frac.mixedaddsub",
    "addingdecimalnumbers":"math.dec.add",
    "addingfractionswithdenominators":"math.frac.add10100",
    "addingmoneyamounts":"math.money.add",
    "addingthreeormorefractions":"math.frac.add3",
    "adjacentangles":"math.angle.adjacent",
    "adjectiveoradverb":"ela.mod.which",
    "adjectivesandadverbs":"ela.mod.adjadv",
    "alliteration":"ela.fig.alliteration",
    "analogies":"ela.analogies",
    "analogiesidentifyingtheconnection":"ela.analogies.connection",
    "angleso f90180270and360degrees":"math.angle.turns",
    "anglesof90180270and360degrees":"math.angle.turns",
    "antonyms":"ela.antonyms",
    "area":"math.area",
    "articles":"ela.articles",
    "capitalization":"ela.capitalization",
    "capitalizationtrueorfalse":"ela.capitalization.tf",
    "choosingdecimalnumberswith":"math.choose.decimal",
    "choosingnumberswithaparticular":"math.choose.sum",
    "choosingtwonumbers":"math.choose.two",
    "cinquainpoem":"ela.poetry.cinquain",
    "commas":"ela.commas",
    "comparativeadjectives":"ela.mod.comparative",
    "comparativeandsuperlativeadjectives":"ela.mod.compsuper",
    "comparativeandsuperlativeadverbs":"ela.mod.compsuperadv",
    "comparingdecimalnumbers":"math.dec.compare",
    "comparingdecimalsandfractions":"math.frac.compdec",
    "comparingdecimalsandfractionson":"math.frac.compdec",
    "comparingfractions":"math.frac.compare",
    "comparingmoneyamounts":"math.money.compare",
    "comparingnumbers":"math.compare.whole",
    "comparingsumsanddifferencesoffractions":"math.frac.comparesums",
    "comparingtheareaoftwofigures":"math.area.compare",
    "comparingtheperimeteroftwofigures":"math.perimeter.compare",
    "completesentencefragmentorrunon":"ela.sent.three",
    "completesentenceorfragment":"ela.sent.fragment",
    "completesentenceorrunon":"ela.sent.runon",
    "completingequations":"math.equations",
    "completingtablesfora":"math.tables.rule",
    "compoundsentences":"ela.sent.compound",
    "compoundsubjectsandobjects":"ela.sent.compoundsubj",
    "concreteandabstractnouns":"ela.nouns.concrete",
    "conjunctions":"ela.conjunctions",
    "contractions":"ela.contractions",
    "contractionswithnot":"ela.contractions.not",
    "convertingfractionsandmixednumbers":"math.frac.convertmixed",
    "convertingmixedcustomaryunits":"math.measure.customary",
    "convertingmixedmetricunits":"math.measure.metric",
    "convertingmixednumberstodecimals":"math.frac.mixedtodec",
    "convertingtimeunits":"math.time.convert",
    "coordinatingconjunctions":"ela.conj.coordinating",
    "countinglinesofsymmetry":"math.symmetry.count",
    "creatingcompoundsentences":"ela.sent.createcompound",
    "decimalnumbermaze":"math.dec.maze",
    "decimalsinequalitieswith":"math.dec.inequal",
    "decomposingfractions":"math.frac.decompose",
    "determiningthemeaningofwords":"ela.meaning",
    "dictionarysearch":"ela.dictionary",
    "dividingfourdigitnumbers":"math.div.4",
    "dividingthreedigitnumbers":"math.div.3",
    "division":"math.div.basic",
    "divisionwithremainders":"math.div.rem",
    "drawingangleswithaprotractor":"math.angle.draw",
    "drawinglinesofsymmetry":"math.symmetry.draw",
    "elapsedtime":"math.time.elapsed",
    "elapsedtimewordproblems":"math.time.elapsedwp",
    "equivalentfractions":"math.frac.equiv",
    "estimateanglemeasurements":"math.angle.estimate",
    "estimatingdifferences":"math.est.differences",
    "estimatingproducts":"math.est.products",
    "estimatingquotients":"math.est.quotients",
    "estimatingsums":"math.est.sums",
    "factors":"math.factors",
    "findandfixthesentencefragments":"ela.sent.fixfragment",
    "findingantonymsincontext":"ela.antonyms.context",
    "findingtheareaandthemissing":"math.area.missing",
    "findingtheprobability":"math.probability.find",
    "fivedigitaddition":"math.add.5",
    "fivedigitsubtraction":"math.sub.5",
    "fixtherunonsentences":"ela.sent.fixrunon",
    "formalversusinformalenglish":"ela.register",
    "formattingaddresses":"ela.addresses",
    "formattingandcapitalizingtitles":"ela.capitalization.titles",
    "formingprepositionalphrases":"ela.prepositions.forming",
    "formingprogressiveverbtenses":"ela.verbs.formprogressive",
    "formingwordswithgreekandlatinroots":"ela.roots.form",
    "fourdigitaddition":"math.add.4",
    "fourdigitsubtraction":"math.sub.4",
    "fractionsanddecimals":"math.frac.decimals",
    "fractionsofanumber":"math.frac.ofnumber",
    "fractionsoftimeunits":"math.time.fractions",
    "fractionspuzzle":"math.frac.puzzle",
    "fractionswithdenominatorsof":"math.frac.denom10100",
    "genres":"ela.genres",
    "givingreasonstosupportanopinion":"ela.opinion",
    "greekandlatinrootword":"ela.roots",
    "guidewords":"ela.guidewords",
    "haikupoem":"ela.poetry.haiku",
    "homographs":"ela.homographs",
    "homophones":"ela.homophones",
    "hyperboles":"ela.fig.hyperbole",
    "identifyingandcorrectingerrors":"ela.usage.correct",
    "identifyingandcorrectingerrorswith":"ela.usage.verbs",
    "identifyinganddefininggreek":"ela.roots.define",
    "identifyinglinesofsymmetry":"math.symmetry.identify",
    "identifyingthecompletepredicate":"ela.sent.completepredicate",
    "identifyingthecompletesubjectof":"ela.sent.completesubject",
    "identifyingthepurposeofatext":"ela.purpose",
    "identifyingthesimplesubjectand":"ela.sent.simplesubjpred",
    "identifyingtimeorderwords":"ela.timeorder",
    "idioms":"ela.fig.idiom",
    "idiomsandadages":"ela.fig.idiomadage",
    "inputoutputtables":"math.iotable",
    "interpretinggraphs":"math.graphs",
    "irregularpasttenseverbs":"ela.verbs.irregular",
    "magicnumbers":"math.magicnumbers",
    "mainandhelpingverbs":"ela.verbs.helping",
    "matchingwordswithgreekandlatin":"ela.roots.match",
    "measurement":"math.measure",
    "measurementconversiontables":"math.measure.tables",
    "measuringangleswithaprotractor":"math.angle.measure",
    "metaphors":"ela.fig.metaphor",
    "missingfactors":"math.factors.missing",
    "modalverbs":"ela.verbs.modal",
    "money":"math.money",
    "moneypatterns":"math.money.patterns",
    "moreorless":"math.moreorless",
    "multidigitaddition":"math.add.multi",
    "multidigitsubtraction":"math.sub.multi",
    "multiplemeaningwords":"ela.multimeaning",
    "multiples":"math.multiples",
    "multiplesoffractions":"math.frac.multiples",
    "multiplication":"math.mult.2x1",
    "multiplicationfacts":"math.mult.facts",
    "multiplyfractionsandmixednumbers":"math.frac.multmixed",
    "multiplyingfractions":"math.frac.mult",
    "multiplyingfractionsbywhole":"math.frac.xwhole",
    "multiplyingfractionsbywholenumbers":"math.frac.xwhole",
    "multiplyingnumbersendinginzeroes":"math.mult.zeros",
    "multiplyingthreenumbers":"math.mult.three",
    "multiplyingthreetwodigitnumbers":"math.mult.three2",
    "multiplyingunitfractions":"math.frac.unitmult",
    "multiplyingunitfractionsbywhole":"math.frac.unitxwhole",
    "mysterynumber":"math.mystery",
    "mysterynumbers":"math.mystery.plural",
    "numberpatterns":"math.patterns.number",
    "numberpuzzles":"math.puzzles",
    "onomatopoeia":"ela.fig.onomatopoeia",
    "orderingadjectives":"ela.mod.ordering",
    "orderingdecimals":"math.dec.order",
    "orderofoperations":"math.oporder",
    "parallelperpendicularand":"math.geom.parallel",
    "parttowholeanalogies":"ela.analogies.part",
    "perimeter":"math.perimeter",
    "personalpossessiveandreflexivepronouns":"ela.pronouns.types",
    "personification":"ela.fig.personification",
    "placevalue":"math.placevalue",
    "pluralandpossessivenouns":"ela.nouns.possessive",
    "pluralnouns":"ela.nouns.plural",
    "pointslinesegmentslinesandrays":"math.geom.lines",
    "polygons":"math.geom.polygons",
    "positiveandnegativeconnotation":"ela.connotation",
    "prefixes":"ela.prefixes",
    "prepositionalphrases":"ela.prepositions.phrases",
    "prepositions":"ela.prepositions",
    "prepositionsandtheirobjects":"ela.prepositions.objects",
    "presentandpasttenseformoftobe":"ela.verbs.tobe",
    "pricelistswithmultiplication":"math.money.pricelist",
    "primeandcompositenumbers":"math.primecomposite",
    "primenumbers":"math.prime",
    "probability":"math.probability",
    "progressiveverbtenses":"ela.verbs.progressive",
    "pronounverbcontractions":"ela.contractions.pronoun",
    "propertiesofmultiplication":"math.mult.props",
    "punctuatingdialogue":"ela.dialogue",
    "referencematerials":"ela.reference",
    "relatedwords":"ela.relatedwords",
    "relationshipbetweenareaandperimeter":"math.area.relationship",
    "relativepronouns":"ela.pronouns.relative",
    "rotationalsymmetry":"math.symmetry.rotational",
    "rounding":"math.rounding",
    "roundingmoneyamounts":"math.rounding.money",
    "sentenceediting":"ela.editing",
    "sentencewriting":"ela.sentencewriting",
    "sevendigitaddition":"math.add.7",
    "sevendigitsubtraction":"math.sub.7",
    "shadesofmeaning":"ela.shades",
    "shapes":"math.geom.shapes",
    "showingcharacteremotionsandtraits":"ela.character",
    "similes":"ela.fig.simile",
    "similesandmetaphors":"ela.fig.similemetaphor",
    "simpleandcompoundsentences":"ela.sent.simplecompound",
    "sixdigitaddition":"math.add.6",
    "sixdigitsubtraction":"math.sub.6",
    "sortingwordsbygreekorlatinroots":"ela.roots.sort",
    "sortingwordswithsharedsuffixes":"ela.suffixes.sort",
    "spinacoordinatingconjunction":"ela.conj.spincoord",
    "spinanddivide":"math.div.spin",
    "spinarelativeadverb":"ela.mod.spinrelativeadv",
    "subjectsandpredicates":"ela.sent.subjpred",
    "subordinatingconjunctions":"ela.conj.subordinating",
    "subtractingdecimalnumbers":"math.dec.sub",
    "subtractingfractionswith":"math.frac.subregroup",
    "suffixes":"ela.suffixes",
    "superlativeadjectives":"ela.mod.superlative",
    "symmetry":"math.symmetry",
    "synonymandantonymanalogies":"ela.analogies.synant",
    "synonyms":"ela.synonyms",
    "synonymsantonymsandhomophones":"ela.wordrel.mixed",
    "thesaurussearch":"ela.thesaurus",
    "threedigitbyonedigitmultiplication":"math.mult.3x1",
    "threedigitbytwodigitmultiplication":"math.mult.3x2",
    "time":"math.time",
    "timepatterns":"math.time.patterns",
    "timewordproblems":"math.time.wordproblems",
    "timezones":"math.time.zones",
    "topicandsupportingsentences":"ela.supporting",
    "topicsentences":"ela.topicsentence",
    "transitions":"ela.transitions",
    "transportationschedule":"math.time.schedule",
    "twodigitbyonedigitmultiplication":"math.mult.2x1b",
    "usageerrors":"ela.usage",
    "usingareaandperimeter":"math.area.using",
    "usingcoordinatingconjunctions":"ela.conj.usingcoord",
    "usingdescriptivewords":"ela.descriptive",
    "usinggreekandlatinrootsasclues":"ela.roots.clues",
    "usinghomophones":"ela.homophones.using",
    "usingmodalverbs":"ela.verbs.usingmodal",
    "usingrelativeadverbs":"ela.mod.relativeadv",
    "usingsubordinatingconjunctions":"ela.conj.usingsub",
    "usingthecorrectsubjectorverb":"ela.verbs.agreement",
    "usingtimeorderwords":"ela.timeorder.using",
    "whoorwhom":"ela.pronouns.whowhom",
    "wordanalysis":"ela.wordanalysis",
    "wordpatternanalogies":"ela.analogies.pattern",
    "wordproblems":"math.wordproblems",
    "writing":"ela.writing",
    "writingdecimalsinexpandedform":"math.dec.expanded",
    "writingdecimalsinwordform":"math.dec.wordform",
    "writingmultidigitnumbers":"math.write.multidigit",
    "writingtwovariableequations":"math.equations.twovar"
  };
  for(const k in alias) if(DW_SKILLS[alias[k]]) ix[k]=alias[k];
  return ix;
})();
function dwSkillIdForLabel(label){
  const n = s => String(s||"").toLowerCase().replace(/[^a-z0-9]/g,"");
  const raw = String(label||"");
  let id = DW_LABEL_INDEX[n(raw)];
  if(id) return id;
  // Challenge-track labels look like "Number of the Day • Percents" or
  // "Word of the Day • analyze • Context Clues" — try each segment, last first.
  const parts = raw.split("\u2022").map(x=>x.trim()).filter(Boolean);
  for(let k=parts.length-1;k>=0;k--){ id = DW_LABEL_INDEX[n(parts[k])]; if(id) return id }
  return null;
}

/* Returns the registry's clean display label for a skill, so students never see
   the PDF-mangled text ("T H Ree -Digit...") even when the Firestore document
   still contains it. Falls back to the original string if unknown. */
function dwCleanLabel(label){
  const id = dwSkillIdForLabel(label);
  if(id && DW_SKILLS[id]) return DW_SKILLS[id][0];
  const raw = String(label||"");
  // Composite Challenge-track labels: clean each segment we recognise.
  if(raw.indexOf("•")>-1)
    return raw.split("•").map(p=>{
      const t=p.trim(), s=dwSkillIdForLabel(t);
      return s&&DW_SKILLS[s]?DW_SKILLS[s][0]:t;
    }).join(" • ");
  return raw;
}
/* Day-by-day skill sequences, stored as indexes into a skill-id table.
   5TH GRADE follows the real page order of the eleven fifth-grade packets.
   CHALLENGE is a curated early-6th sequence. Task shape (engines, counts,
   seeds) is rebuilt at runtime by dwTrackLesson so this stays small. */
const DW_T5_IDS=["math.patterns.number","ela.usage.verbs","math.est.quotients","ela.pk.identifying_relative_pronouns","math.add.multi","ela.pk.identifying_main_and_helping_verbs","math.sub.multi","ela.verbs.modal","math.time.convert","ela.conj.coordinating","math.money","ela.pk.identifying_prepositions","math.frac.equiv","ela.pk.alphabetical_order","math.pk.writing_fractions_in_lowest_terms","ela.wordrel.mixed","math.frac.addsub","ela.analogies.synant","math.frac.multiples","ela.roots.match","math.frac.decimals","ela.fig.simile","math.dec.compare","ela.pk.identifying_the_complete_subject_and_predicate","math.geom.lines","ela.sent.three","math.puzzles","ela.pk.using_relative_pronouns","math.tables.rule","ela.mod.comparative","math.pk.evaluating_numerical_expressions","ela.verbs.usingmodal","math.pk.converting_between_standard_and_expanded_form","ela.pk.using_the_perfect_verb_tenses","math.pk.converting_improper_fractions_into_mixed_numbe","ela.conj.usingcoord","math.pk.converting_mixed_numbers_into_improper_fractio","ela.prepositions.objects","math.pk.adding_fractions_with_unlike_denominators","ela.pk.forming_plurals_of_nouns_ending_in_y_and_f","math.pk.adding_up_to_four_fractions_with_unlike_denomi","math.pk.decimals_expressed_in_words","ela.synonyms","math.pk.objects_on_a_coordinate_plane","ela.antonyms","math.geom.polygons","math.pk.converting_and_comparing_customary_units","ela.pk.sorting_words_by_shared_greek","math.pk.two_digit_by_two_digit_multiplication","ela.fig.metaphor","math.mult.3x2","ela.pk.commas_in_a_series","math.pk.dividing_multi_digit_numbers_by_two_digit_numb","ela.editing","math.wordproblems","ela.sent.compound","math.pk.creating_a_line_plot","ela.dictionary","ela.writing","math.pk.math_puzzles","math.pk.completing_a_table_from_a_graph","ela.mod.superlative","math.pk.writing_numerical_expressions","ela.pk.forming_the_perfect_verb_tenses","math.frac.subregroup","ela.pk.identifying_subordinating_conjunctions","math.frac.add3","ela.pk.interjections","math.pk.addition_and_subtraction_sentences","ela.pk.finding_synonyms_in_context","math.pk.inequalities_with_addition_and_subtraction","ela.antonyms.context","math.pk.converting_decimals_from_expanded_form","ela.homographs","math.pk.converting_decimals_from_standard_form","ela.analogies.connection","math.pk.graphing_points_on_a_coordinate_plane","ela.roots.clues","math.pk.number_of_sides_in_polygons","ela.pk.commas_with_direct_addresses","math.pk.converting_and_comparing_metric_units","ela.pk.formatting_street_addresses","math.pk.volume_of_rectangular_prisms","math.pk.scientific_notation","ela.pk.expanding_sentences","ela.pk.using_thesaurus_entries","math.pk.dividing_numbers_ending_in_zeroes","math.pk.graphing_a_two_variable_relationship","ela.pk.using_adjectives_with_more_or_most","ela.pk.using_the_progressive_verb_tenses","math.pk.adding_mixed_numbers_with_regrouping","ela.pk.choosing_between_the_past_and_past_perfect_ten","ela.pk.forming_and_using_the_irregular_past_tense","ela.mod.relativeadv","ela.pk.using_the_correct_pair_of_correlative_conjunct","ela.pk.conjunctions_prepositions_and_interjections","math.pk.equivalent_decimals","ela.homophones","math.pk.coordinate_planes_as_maps","ela.pk.wordswithpre","math.pk.regular_and_irregular_polygons","ela.pk.using_the_meanings_of_words_as_clues","math.pk.conversion_tables_customary_and_metric","ela.pk.determining_the_meaning_of_idioms","math.pk.volume_of_irregular_figures","ela.pk.using_the_correct_frequently_confused_word","ela.pk.capitalizing_titles","math.pk.multiplication_patterns_over_increasing_place_","ela.pk.correcting_errors_with_signs","math.pk.four_digit_by_two_digit_multiplication","math.pk.dividing_two_digit_and_three_digit_numbers","ela.pk.reducing_sentences","ela.thesaurus","math.pk.number_mazes","ela.verbs.formprogressive","math.pk.comparing_fractions_and_mixed_numbers","math.pk.estimating_sums_and_differences_of_fractions","ela.conj.usingsub","math.frac.xwhole","ela.pk.filling_in_the_missing_correlative_conjunction","math.pk.decimal_number_lines","ela.prepositions","math.pk.comparing_decimals_on_number_lines","ela.pk.part_to_whole_and_whole_to_part_analogies","math.pk.following_directions_on_a_coordinate_plane","ela.pk.wordswithre","math.pk.acute_right_and_obtuse_triangles","ela.pk.using_words_as_clues_to_meaning","math.pk.comparing_customary_units","ela.fig.adage","math.pk.volume_of_cubes_and_rectangular","ela.pk.correcting_errors_with_frequently_confused_wor","math.pk.multiplying_two_three_and_four_digit_numbers","ela.capitalization.titles","math.pk.five_digit_by_two_digit_multiplication","ela.pk.commas_direct_address_and_tag","math.pk.division_patterns_over_increasing","ela.pk.identifying_independent_clauses","math.pk.dividing_four_digit_numbers_by_one_digit_numbe","ela.pk.identifying_dependent_clauses","math.mystery","ela.pronouns.relative","math.est.products","ela.verbs.progressive","math.pk.multiplying_two_unit_fractions","ela.pk.correlative_conjunctions","math.pk.multiplying_two_fractions_fill_in_the_missing_","math.pk.rounding_decimals","math.frac.compdec","math.pk.repeating_decimals","math.pk.scalene_isosceles_and_equilateral_triangles","ela.pk.wordswithm_is","math.pk.converting_customary_units","ela.pk.determining_the_meanings_of_greek","ela.fig.idiomadage","math.mult.zeros","ela.fig.personification","math.choose.sum","ela.pk.simple_compound_and_complex_sentences","math.pk.dividing_five_digit_numbers_by_two_digit_numbe","ela.pk.correcting_capitalization_errors","math.pk.division_true_or_false","ela.dialogue","ela.pk.compound_subjects_and_objects","ela.pk.correcting_inappropriate_shifts_in_verb_tense","math.pk.scaling_whole_numbers_by_fractions","math.pk.scaling_fractions_by_fractions","math.pk.scaling_mixed_numbers_by_fractions","ela.connotation","math.pk.multiplying_three_or_more_fractions","ela.analogies","math.pk.completing_fraction_multiplication","ela.pk.wordswithful","math.pk.choosing_decimals_with_a_particular_sum","ela.pk.determining_the_meanings_of_words_with_affixes","ela.fig.hyperbole","math.pk.parallel_sides_in_quadrilaterals","ela.pk.using_alliteration_in_acrostic_poems","math.measure.customary","ela.register","math.pk.volume","ela.transitions","math.pk.inequalities_with_multiplication","ela.commas","math.pk.dividing_four_digit_and_five_digit","ela.pk.combining_sentences","ela.reference","math.pk.estimating_products_of_mixed_numbers","math.pk.multiplying_a_mixed_number_by_a_whole_number","ela.pk.writing_sentences_with_interjections","math.pk.multiplying_three_or_more_mixed_numbers","math.pk.completing_decimal_addition_and_subtraction","math.pk.inequalities_with_decimal_addition","math.pk.estimating_sums_and_differences","ela.multimeaning","math.pk.quadrants","ela.pk.words_with_less","math.pk.identifying_parallelograms","ela.pk.greek_and_latin_roots","ela.pk.perimeter_with_decimal_side_lengths","ela.pk.perimeter_with_fractional_side_lengths","ela.fig.personhyper","ela.fig.onomatopoeia","ela.pk.choosing_the_best_transition","math.pk.identifying_and_describing_shapes","math.pk.multiplying_fractions_and_mixed_numbers","math.pk.completing_mixed_number_multiplication","ela.pk.personal_possessive_reflexive_and_relative_pro","math.pk.dividing_unit_fractions_by_whole_numbers","ela.pk.perfect_verb_tenses","math.pk.dividing_whole_numbers_by_unit_fractions","math.pk.estimating_products_of_decimals","math.pk.multiplying_a_decimal_by_a_power_of_ten","math.pk.multiplying_a_decimal_by_a_one_digit_number","ela.pk.words_with_able_and_ible","math.pk.multiplying_a_decimal_by_a_multi_digit_number","ela.roots","math.pk.price_lists","ela.pk.elements_of_poetry","math.pk.graphing_points_on_a_coordinate","ela.pk.figurative_language","math.pk.comparing_and_contrasting_shapes","math.measure.metric","ela.pk.formal_writing","math.pk.area_of_squares_and_rectangles_with_fractional","math.pk.multiplying_three_digit_numbers_by_two_digit_n","math.pk.multiplying_four_digit_numbers_by_one_digit_nu","ela.verbs.irregular","math.pk.dividing_fractions_by_whole_numbers","ela.pk.commonly_confused_verbs_rise_raise_lie_lay_sit","math.pk.dividing_whole_numbers_by_fractions","ela.pk.preposition_or_adverb","math.pk.dividing_two_fractions","ela.conjunctions","math.pk.multiplying_three_or_more_numbers","math.pk.inequalities_with_decimal_multiplication","ela.pk.context_clues","math.pk.dividing_by_powers_of_ten","math.pk.sale_prices","ela.pk.wordswithsub","math.pk.coordinate_plane_all_four_quadrants","ela.roots.form","math.pk.classifying_quadrilaterals","ela.pk.forming_and_using_the_perfect_verb_tenses","math.pk.dividing_fractions_and_mixed_numbers","ela.pk.prepositional_poem","math.pk.completing_division_sentences","ela.pk.writing_sentences_with_correlative","math.pk.fractions_and_mixed_numbers","ela.pk.synonyms_and_antonyms","math.pk.decimal_division_patterns_over_increasing_plac"];
const DW_T5_DAYS=[[0,1,2,3],[2,3,4,5],[4,5,6,7],[6,7,8,9],[8,9,10,11],[10,11,12,13],[12,13,14,15],[14,15,16,17],[16,17,18,19],[18,19,20,21],[20,21,22,23],[22,23,24,25],[26,27,28,29],[28,29,30,31],[30,31,32,33],[32,33,34,35],[34,35,36,37],[36,37,38,39],[38,39,40,13],[40,13,41,42],[41,42,43,44],[43,44,45,1],[45,1,46,47],[46,47,48,49],[48,49,50,51],[50,51,52,53],[52,53,54,55],[54,55,56,57],[56,57,26,58],[26,58,28,27],[28,27,30,29],[30,29,32,31],[32,31,34,33],[34,33,36,35],[59,27,60,61],[60,61,62,63],[62,63,64,65],[64,65,66,67],[66,67,68,69],[68,69,70,71],[70,71,72,73],[72,73,74,75],[74,75,76,77],[76,77,78,79],[78,79,80,81],[80,81,82,53],[82,53,83,84],[83,84,50,85],[50,85,86,58],[86,58,54,27],[54,27,59,61],[59,61,60,63],[60,63,62,65],[62,65,64,67],[64,67,66,69],[66,69,68,71],[87,88,10,89],[10,89,90,91],[90,91,68,92],[68,92,70,93],[70,93,72,94],[72,94,74,95],[74,95,96,97],[96,97,98,99],[98,99,100,101],[100,101,102,103],[102,103,104,105],[104,105,83,106],[83,106,107,108],[107,108,109,53],[109,53,110,111],[110,111,54,112],[54,112,87,58],[87,58,10,88],[10,88,90,89],[90,89,68,91],[113,114,115,7],[115,7,116,117],[116,117,118,119],[118,119,120,121],[120,121,122,73],[122,73,22,123],[22,123,124,125],[124,125,126,127],[126,127,128,129],[128,129,130,131],[130,131,132,133],[132,133,134,135],[134,135,136,137],[136,137,138,139],[138,139,54,53],[140,141,142,143],[142,143,144,145],[144,145,146,37],[146,37,147,67],[147,67,148,42],[148,42,149,44],[149,44,43,97],[43,97,150,151],[150,151,152,153],[152,153,130,154],[130,154,155,156],[155,156,157,158],[157,158,159,160],[159,160,161,162],[161,162,54,53],[54,53,140,58],[140,58,142,141],[142,141,144,143],[144,143,146,145],[146,145,147,37],[147,37,148,67],[26,163,2,164],[2,164,165,93],[165,93,166,73],[166,73,167,168],[167,168,169,170],[169,170,171,172],[171,172,173,174],[173,174,76,175],[76,175,176,177],[176,177,178,179],[178,179,180,181],[180,181,182,183],[182,183,184,108],[184,108,54,53],[54,53,26,185],[26,185,2,186],[2,186,165,58],[165,58,166,163],[166,163,167,164],[167,164,169,93],[26,91,187,145],[187,145,188,189],[188,189,190,42],[190,42,191,44],[191,44,192,1],[192,1,193,194],[193,194,195,196],[195,196,197,198],[197,198,199,105],[199,105,200,201],[200,201,180,202],[180,202,157,203],[157,203,54,158],[54,158,204,53],[204,53,26,85],[26,85,187,58],[187,58,188,91],[188,91,190,145],[190,145,191,189],[140,88,205,1],[205,1,206,207],[206,207,208,209],[208,209,210,121],[210,121,211,15],[211,15,212,170],[212,170,213,214],[213,214,215,216],[215,216,217,218],[217,218,219,220],[219,220,221,133],[221,133,222,223],[222,223,224,81],[224,81,225,162],[225,162,226,53],[26,227,228,229],[228,229,230,231],[230,231,232,233],[232,233,234,67],[234,67,235,236],[235,236,173,168],[173,168,237,170],[237,170,238,239],[238,239,240,241],[240,241,242,131],[26,243,244,245],[244,245,246,247],[246,247,248,249],[248,249,250,73]];
const DW_CH_IDS=["math.percent","g6.roots","math.equations.twovar","math.pk.volume_of_rectangular_prisms","ela.analogies","math.integers","g6.contextclue","math.coordinate","math.pk.volume_of_irregular_figures","ela.analogies.part","math.oporder","g6.spelling","math.pk.coordinate_plane_all_four_quadrants","math.frac.divwhole","ela.pk.correlative_conjunctions","math.pk.writing_numerical_expressions","g6.intensive","math.volume","math.pk.dividing_two_fractions","ela.pk.identifying_dependent_clauses","ela.roots","math.pk.multiplying_two_unit_fractions","ela.pk.simple_compound_and_complex_sentences","ela.roots.clues","math.pk.scaling_fractions_by_fractions","ela.pk.text_structures","math.pk.unit_prices","ela.pk.comparing_and_contrasting","math.pk.sale_prices","ela.register","math.pk.inequalities_with_multiplication","ela.pk.formal_writing","math.pk.scientific_notation","ela.pk.combining_sentences","math.pk.divisibility_rules","ela.pk.expanding_sentences","math.pk.multiplying_a_decimal_by_a_power_of_ten","ela.pk.reducing_sentences","math.pk.dividing_by_powers_of_ten","ela.pk.correcting_inappropriate_shifts_in_verb_tense","math.pk.division_with_decimal_quotients","ela.pk.commonly_confused_verbs_rise_raise_lie_lay_sit","math.probability","ela.pk.forming_and_using_the_perfect_verb_tenses","math.pk.creating_and_interpreting_line_plots","ela.pk.elements_of_poetry","math.pk.classifying_quadrilaterals","ela.fig.similemetaphor","math.pk.scalene_isosceles_and_equilateral_triangles","ela.fig.idiom","math.pk.area_between_two_rectangles_with_fractional_si","ela.connotation","ela.pk.perimeter_with_decimal_side_lengths","ela.shades","math.pk.greatest_and_least_products","ela.meaning","math.pk.multiplication_patterns_over_increasing_place_","ela.pk.facts_and_opinions","math.pk.reasonable_temperature_celsius","ela.pk.parts_of_speech","ela.pov","ela.purpose","ela.transitions"];
const DW_CH_DAYS=[[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[2,20,3,21,22],[7,23,8,24,25],[12,4,13,26,27],[17,9,18,28,29],[3,14,21,30,31],[8,19,24,32,33],[13,22,26,34,35],[18,25,28,36,37],[21,27,30,38,39],[24,29,32,40,41],[26,31,34,42,43],[28,33,36,44,45],[30,35,38,46,47],[32,37,40,48,49],[34,39,42,50,51],[36,41,44,52,53],[38,43,46,54,55],[40,45,48,56,57],[42,47,50,58,59],[44,49,52,0,60],[46,51,54,5,61],[48,53,56,10,62],[50,55,58,15,1],[52,57,0,2,6],[54,59,5,7,11],[56,60,10,12,16],[58,61,15,17,20],[0,62,2,3,23],[5,1,7,8,4],[10,6,12,13,9],[15,11,17,18,14],[2,16,3,21,19],[7,20,8,24,22],[12,23,13,26,25],[17,4,18,28,27],[3,9,21,30,29],[8,14,24,32,31],[13,19,26,34,33],[18,22,28,36,35],[21,25,30,38,37],[24,27,32,40,39],[26,29,34,42,41],[28,31,36,44,43],[30,33,38,46,45],[32,35,40,48,47],[34,37,42,50,49],[36,39,44,52,51],[38,41,46,54,53],[40,43,48,56,55],[42,45,50,58,57],[44,47,52,0,59],[46,49,54,5,60],[48,51,56,10,61],[50,53,58,15,62],[52,55,0,2,1],[54,57,5,7,6],[56,59,10,12,11],[58,60,15,17,16],[0,61,2,3,20],[5,62,7,8,23],[10,1,12,13,4],[15,6,17,18,9],[2,11,3,21,14],[7,16,8,24,19],[12,20,13,26,22],[17,23,18,28,25],[3,4,21,30,27],[8,9,24,32,29],[13,14,26,34,31],[18,19,28,36,33],[21,22,30,38,35],[24,25,32,40,37],[26,27,34,42,39],[28,29,36,44,41],[30,31,38,46,43],[32,33,40,48,45],[34,35,42,50,47],[36,37,44,52,49],[38,39,46,54,51],[40,41,48,56,53],[42,43,50,58,55],[44,45,52,0,57],[46,47,54,5,59],[48,49,56,10,60],[50,51,58,15,61],[52,53,0,2,62],[54,55,5,7,1],[56,57,10,12,6],[58,59,15,17,11],[0,60,2,3,16],[5,61,7,8,20],[10,62,12,13,23],[15,1,17,18,4],[2,6,3,21,9],[7,11,8,24,14],[12,16,13,26,19],[17,20,18,28,22],[3,23,21,30,25],[8,4,24,32,27],[13,9,26,34,29],[18,14,28,36,31],[21,19,30,38,33],[24,22,32,40,35],[26,25,34,42,37],[28,27,36,44,39],[30,29,38,46,41],[32,31,40,48,43],[34,33,42,50,45],[36,35,44,52,47],[38,37,46,54,49],[40,39,48,56,51],[42,41,50,58,53],[44,43,52,0,55],[46,45,54,5,57],[48,47,56,10,59],[50,49,58,15,60],[52,51,0,2,61],[54,53,5,7,62],[56,55,10,12,1],[58,57,15,17,6],[0,59,2,3,11],[5,60,7,8,16],[10,61,12,13,20],[15,62,17,18,23],[2,1,3,21,4],[7,6,8,24,9],[12,11,13,26,14],[17,16,18,28,19],[3,20,21,30,22],[8,23,24,32,25],[13,4,26,34,27],[18,9,28,36,29],[21,14,30,38,31],[24,19,32,40,33],[26,22,34,42,35],[28,25,36,44,37],[30,27,38,46,39],[32,29,40,48,41],[34,31,42,50,43],[36,33,44,52,45],[38,35,46,54,47],[40,37,48,56,49],[42,39,50,58,51],[44,41,52,0,53],[46,43,54,5,55],[48,45,56,10,57],[50,47,58,15,59],[52,49,0,2,60],[54,51,5,7,61],[56,53,10,12,62],[58,55,15,17,1],[0,57,2,3,6],[5,59,7,8,11],[10,60,12,13,16],[15,61,17,18,20],[2,62,3,21,23],[7,1,8,24,4],[12,6,13,26,9],[17,11,18,28,14],[3,16,21,30,19],[8,20,24,32,22],[13,23,26,34,25],[18,4,28,36,27],[21,9,30,38,29],[24,14,32,40,31],[26,19,34,42,33],[28,22,36,44,35],[30,25,38,46,37],[32,27,40,48,39],[34,29,42,50,41],[36,31,44,52,43],[38,33,46,54,45],[40,35,48,56,47],[42,37,50,58,49],[44,39,52,0,51],[46,41,54,5,53]];
const DW_T5_PACKET=["Beginning Fifth Grade Back to School","September in Fifth Grade","October in Fifth Grade","November in Fifth Grade","December in Fifth Grade","January in Fifth Grade","February in Fifth Grade","March in Fifth Grade","April in Fifth Grade","May in Fifth Grade","June in Fifth Grade"];
const DW_T5_BANDS=[12,34,56,76,91,112,132,151,166,176,180];
const DW_CH_WORDS=["analyze","approach","assess","assume","benefit","category","clarify","compare","complex","conclude","contrast","contribute","criteria","define","demonstrate","derive","determine","distinguish","distribute","effect","emphasize","estimate","evaluate","evidence","examine","explain","factor","feature","focus","formula","function","identify","illustrate","impact","indicate","infer","interpret","justify","method","occur","pattern","perspective","predict","principle","process","proportion","reason","relevant","represent","require","respond","result","sequence","significant","similar","solution","specific","structure","summarize","support","transfer","transform","valid","vary","achieve","adapt","adequate","alternative","apparent","approximate","argument","calculate","cause","circumstance","cite","combine","communicate","compose","concept","consistent","construct","context","create","data","develop","difference","dimension","element","establish","expand","explicit","express","generalize","hypothesis","imply","include","increase","influence","investigate","maintain","major","minor","modify","objective","observe","organize","participate","percent","period","possible","previous","primary","procedure","range","reduce","relationship","resource","response","role","select","source","strategy","sufficient","theory","tradition","unique","variable","verify","accurate","acquire","appropriate","capacity","challenge","coherent","consequence","constant","convert","decline","emerge","equivalent","exclude","generate","initial","interact","internal","logical","maximum","minimum","obtain","parallel","portion","potential","precise","priority","ratio","resolve","retain","stable","substitute","sustain","symbol","technical","trend","ultimate","visible","abstract","adjacent","aggregate","allocate","coordinate","deduce","deviate","integrate","interval","magnitude","negative","positive","quantify","sequence","spatial","synthesize","terminate","underlying"];

function dwPacketFor(day){for(let i=0;i<DW_T5_BANDS.length;i++)if(day<=DW_T5_BANDS[i])return DW_T5_PACKET[i];return DW_T5_PACKET[DW_T5_PACKET.length-1]}
function dwLabelOf(id){return (DW_SKILLS[id]&&DW_SKILLS[id][0])||id}

/* Rebuilds one day of the 5th-grade or Challenge track. Mirrors exactly what
   the build script produced, so the maps stay tiny. */
function dwTrackLesson(track, day, base, ENGN){
  const t=(subject,id,ei,count,seed,skill,extra)=>Object.assign(
    {subject,skill:skill||dwLabelOf(id),skillId:id,engine:ENGN[((ei%ENGN.length)+ENGN.length)%ENGN.length],count,seed}, extra||{});
  if(track==="5"){
    const row=DW_T5_DAYS[day-1]; if(!row) return null;
    const [ms,es,ms2,es2]=row.map(k=>DW_T5_IDS[k]);
    return Object.assign({},base,{track:"5",trackName:"5TH GRADE",
      mathSkill:dwLabelOf(ms),mathSkillId:ms,elaSkill:dwLabelOf(es),elaSkillId:es,
      title:`📘 Day ${day}: Fifth Grade Expedition`,sourcePacket:dwPacketFor(day),
      morning:[t("MATH",ms,day,4,50000+day*20),t("ELA",es,day+2,4,50001+day*20),
               t("MATH",ms2,day+4,4,50002+day*20),t("ELA",es2,day+6,4,50003+day*20)],
      exit:[t("MATH",ms,day+1,4,51000+day*20),t("ELA",es,day+3,4,51001+day*20),
            t("MATH",ms2,day+5,4,51002+day*20),t("ELA",es2,day+7,4,51003+day*20)]});
  }
  const row=DW_CH_DAYS[day-1]; if(!row) return null;
  const [ms,es,ms2,ms3,es2]=row.map(k=>DW_CH_IDS[k]);
  const word=DW_CH_WORDS[(day-1)%DW_CH_WORDS.length], number=37+day*7;
  return Object.assign({},base,{track:"challenge",trackName:"⭐ CHALLENGE",
    mathSkill:dwLabelOf(ms),mathSkillId:ms,elaSkill:dwLabelOf(es),elaSkillId:es,
    challengeWord:word,challengeNumber:number,
    title:`⭐ Day ${day}: Challenge Expedition`,sourcePacket:"Dragonswood Early–Mid 6th Grade Enrichment",
    morning:[t("MATH",ms,day,5,60000+day*30,`Number of the Day • ${dwLabelOf(ms)}`),
             t("ELA",es,day+2,5,60001+day*30,`Word of the Day • ${word} • ${dwLabelOf(es)}`,{wordOfDay:word}),
             t("MATH",ms2,day+4,6,60002+day*30,`Multi-step Challenge • ${dwLabelOf(ms2)}`)],
    exit:[t("MATH",ms,day+1,5,61000+day*30,`Number Reasoning • ${dwLabelOf(ms)}`),
          t("ELA",es2,day+3,5,61001+day*30,`Word Application • ${word} • ${dwLabelOf(es2)}`,{wordOfDay:word}),
          t("MATH",ms3,day+5,6,61002+day*30,`Independent Challenge • ${dwLabelOf(ms3)}`)]});
}
const DW_CURRIC_PLAN={
 "I-HUM-D1-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D1-C2-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D1-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D1-C4-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D10-C1-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D10-C2-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D10-C3-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D11-C1-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D11-C2-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D11-C3-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D12-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D12-C2-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D12-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D13-C1-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D13-C2-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D13-C3-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D14-C1-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D14-C2-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D14-C3-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D15-C1-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D15-C2-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D15-C3-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D15-C3-L2":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D16-C1-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D16-C2-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D16-C3-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D17-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D17-C2-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D17-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D18-C1-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D18-C2-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D18-C3-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D19-C1-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D19-C2-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D19-C3-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D2-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D2-C2-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D2-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D2-C4-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D20-C1-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D20-C2-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D20-C3-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D21-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D21-C2-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D21-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D22-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D22-C2-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D22-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D23-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D23-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D24-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D24-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D25-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D25-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D26-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D26-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D27-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D27-C2-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D27-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D28-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D28-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D29-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D29-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D3-C1-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D3-C2-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D3-C3-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D30-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D30-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D31-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D31-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D32-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D32-C2-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D32-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D33-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D33-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D34-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D34-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D35-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D35-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D36-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D36-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D37-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D37-C2-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D37-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D38-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D38-C2-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D38-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D38-C4-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D39-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D39-C2-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D39-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D39-C4-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D4-C1-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D4-C2-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D4-C3-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D40-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D40-C2-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D40-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D40-C4-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D5-C1-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D5-C2-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D5-C3-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D6-C1-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D6-C2-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D6-C3-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D7-C1-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D7-C2-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D7-C3-A":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D8-C1-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D8-C2-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D8-C3-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D9-C1-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D9-C2-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-HUM-D9-C3-L1":{"standards":["W4.1","W.4.5","W.4.9a","SL4.1","SL.4.2","RL.4.1","RL4.3","RL4.6","RL4.7","L.4.2","L4.3"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose B. Provide reasons that are supported by facts and details. C. Link opinion and reasons using words and phrases (e.g., for instance, in order to, in addition). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.supporting","ela.writing","ela.pk.expanding_sentences","ela.meaning","ela.pk.identifying_the_purpose_of_a_text","ela.character","ela.pov","ela.pk.text_structures","ela.capitalization","ela.commas","ela.dialogue","ela.shades","ela.transitions","ela.pk.combining_sentences"]},
 "I-Math-D1-C1-A":{"standards":[],"iCan":"","skills":[]},
 "I-Math-D1-C2-A":{"standards":[],"iCan":"","skills":[]},
 "I-Math-D1-C3-A":{"standards":[],"iCan":"","skills":[]},
 "I-Math-D10-C1-A":{"standards":["4.NBT.A.2"],"iCan":"I can read, write, compare, and show large numbers in different ways.","skills":["math.placevalue","math.write.multidigit","math.compare.whole","math.dec.expanded"]},
 "I-Math-D10-C2-A":{"standards":["4.NBT.A.2"],"iCan":"I can read, write, compare, and show large numbers in different ways.","skills":["math.placevalue","math.write.multidigit","math.compare.whole","math.dec.expanded"]},
 "I-Math-D10-C3-L1":{"standards":["4.NBT.A.2"],"iCan":"I can read, write, compare, and show large numbers in different ways.","skills":["math.placevalue","math.write.multidigit","math.compare.whole","math.dec.expanded"]},
 "I-Math-D11-C1-A":{"standards":["4.NBT.A.3"],"iCan":"I can round large numbers to any place value.","skills":["math.rounding","math.est.sums","math.est.differences"]},
 "I-Math-D11-C2-A":{"standards":["4.NBT.A.3"],"iCan":"I can round large numbers to any place value.","skills":["math.rounding","math.est.sums","math.est.differences"]},
 "I-Math-D11-C3-L1":{"standards":["4.NBT.A.3"],"iCan":"I can round large numbers to any place value.","skills":["math.rounding","math.est.sums","math.est.differences"]},
 "I-Math-D12-C1-A":{"standards":["4.NBT.A.3"],"iCan":"I can round large numbers to any place value.","skills":["math.rounding","math.est.sums","math.est.differences"]},
 "I-Math-D12-C2-A":{"standards":["4.NBT.A.3"],"iCan":"I can round large numbers to any place value.","skills":["math.rounding","math.est.sums","math.est.differences"]},
 "I-Math-D12-C3-L1":{"standards":["4.NBT.A.3"],"iCan":"I can round large numbers to any place value.","skills":["math.rounding","math.est.sums","math.est.differences"]},
 "I-Math-D13-C1-A":{"standards":["4.NBT.A.3"],"iCan":"I can round large numbers to any place value.","skills":["math.rounding","math.est.sums","math.est.differences"]},
 "I-Math-D13-C2-A":{"standards":["4.NBT.A.3"],"iCan":"I can round large numbers to any place value.","skills":["math.rounding","math.est.sums","math.est.differences"]},
 "I-Math-D13-C3-L1":{"standards":["4.NBT.A.3"],"iCan":"I can round large numbers to any place value.","skills":["math.rounding","math.est.sums","math.est.differences"]},
 "I-Math-D14-C1-A":{"standards":["4.NBT.A.3"],"iCan":"I can round large numbers to any place value.","skills":["math.rounding","math.est.sums","math.est.differences"]},
 "I-Math-D14-C2-A":{"standards":["4.NBT.A.3"],"iCan":"I can round large numbers to any place value.","skills":["math.rounding","math.est.sums","math.est.differences"]},
 "I-Math-D14-C3-A":{"standards":["4.NBT.A.3"],"iCan":"I can round large numbers to any place value.","skills":["math.rounding","math.est.sums","math.est.differences"]},
 "I-Math-D15-C1-A":{"standards":["4.NBT.4"],"iCan":"I can add and subtract large numbers accurately using the standard algorithm.","skills":["math.add.4","math.sub.4","math.add.multi","math.sub.multi"]},
 "I-Math-D15-C2-A":{"standards":["4.NBT.4"],"iCan":"I can add and subtract large numbers accurately using the standard algorithm.","skills":["math.add.4","math.sub.4","math.add.multi","math.sub.multi"]},
 "I-Math-D15-C3-L1":{"standards":["4.NBT.4"],"iCan":"I can add and subtract large numbers accurately using the standard algorithm.","skills":["math.add.4","math.sub.4","math.add.multi","math.sub.multi"]},
 "I-Math-D16-C1-A":{"standards":["4.NBT.4"],"iCan":"I can add and subtract large numbers accurately using the standard algorithm.","skills":["math.add.4","math.sub.4","math.add.multi","math.sub.multi"]},
 "I-Math-D16-C2-A":{"standards":["4.NBT.4"],"iCan":"I can add and subtract large numbers accurately using the standard algorithm.","skills":["math.add.4","math.sub.4","math.add.multi","math.sub.multi"]},
 "I-Math-D16-C3-L1":{"standards":["4.NBT.4"],"iCan":"I can add and subtract large numbers accurately using the standard algorithm.","skills":["math.add.4","math.sub.4","math.add.multi","math.sub.multi"]},
 "I-Math-D17-C1-A":{"standards":["4.NBT.4"],"iCan":"I can add and subtract large numbers accurately using the standard algorithm.","skills":["math.add.4","math.sub.4","math.add.multi","math.sub.multi"]},
 "I-Math-D17-C2-A":{"standards":["4.NBT.4"],"iCan":"I can add and subtract large numbers accurately using the standard algorithm.","skills":["math.add.4","math.sub.4","math.add.multi","math.sub.multi"]},
 "I-Math-D17-C3-L1":{"standards":["4.NBT.4"],"iCan":"I can add and subtract large numbers accurately using the standard algorithm.","skills":["math.add.4","math.sub.4","math.add.multi","math.sub.multi"]},
 "I-Math-D18-C1-A":{"standards":["4.NBT.4"],"iCan":"I can add and subtract large numbers accurately using the standard algorithm.","skills":["math.add.4","math.sub.4","math.add.multi","math.sub.multi"]},
 "I-Math-D18-C2-A":{"standards":["4.NBT.4"],"iCan":"I can add and subtract large numbers accurately using the standard algorithm.","skills":["math.add.4","math.sub.4","math.add.multi","math.sub.multi"]},
 "I-Math-D18-C3-L1":{"standards":["4.NBT.4"],"iCan":"I can add and subtract large numbers accurately using the standard algorithm.","skills":["math.add.4","math.sub.4","math.add.multi","math.sub.multi"]},
 "I-Math-D19-C1-A":{"standards":["4.NBT.4"],"iCan":"I can add and subtract large numbers accurately using the standard algorithm.","skills":["math.add.4","math.sub.4","math.add.multi","math.sub.multi"]},
 "I-Math-D19-C2-A":{"standards":["4.NBT.4"],"iCan":"I can add and subtract large numbers accurately using the standard algorithm.","skills":["math.add.4","math.sub.4","math.add.multi","math.sub.multi"]},
 "I-Math-D19-C3-A":{"standards":["4.NBT.4"],"iCan":"I can add and subtract large numbers accurately using the standard algorithm.","skills":["math.add.4","math.sub.4","math.add.multi","math.sub.multi"]},
 "I-Math-D2-C1-A":{"standards":[],"iCan":"","skills":[]},
 "I-Math-D2-C2-A":{"standards":[],"iCan":"","skills":[]},
 "I-Math-D2-C3-A":{"standards":[],"iCan":"","skills":[]},
 "I-Math-D20-C1-A":{"standards":["4.OA.A.3"],"iCan":"I can solve multi-step word problems using addition, subtraction, multiplication, and division. I can explain what a remainder means in a problem.","skills":["math.wordproblems","math.oporder","math.equations"]},
 "I-Math-D20-C2-A":{"standards":["4.OA.A.3"],"iCan":"I can solve multi-step word problems using addition, subtraction, multiplication, and division. I can explain what a remainder means in a problem.","skills":["math.wordproblems","math.oporder","math.equations"]},
 "I-Math-D20-C3-L1":{"standards":["4.OA.A.3"],"iCan":"I can solve multi-step word problems using addition, subtraction, multiplication, and division. I can explain what a remainder means in a problem.","skills":["math.wordproblems","math.oporder","math.equations"]},
 "I-Math-D21-C1-A":{"standards":["4.OA.A.3"],"iCan":"I can solve multi-step word problems using addition, subtraction, multiplication, and division. I can explain what a remainder means in a problem.","skills":["math.wordproblems","math.oporder","math.equations"]},
 "I-Math-D21-C2-A":{"standards":["4.OA.A.3"],"iCan":"I can solve multi-step word problems using addition, subtraction, multiplication, and division. I can explain what a remainder means in a problem.","skills":["math.wordproblems","math.oporder","math.equations"]},
 "I-Math-D21-C3-L1":{"standards":["4.OA.A.3"],"iCan":"I can solve multi-step word problems using addition, subtraction, multiplication, and division. I can explain what a remainder means in a problem.","skills":["math.wordproblems","math.oporder","math.equations"]},
 "I-Math-D22-C1-A":{"standards":["4.OA.A.3"],"iCan":"I can solve multi-step word problems using addition, subtraction, multiplication, and division. I can explain what a remainder means in a problem.","skills":["math.wordproblems","math.oporder","math.equations"]},
 "I-Math-D22-C2-A":{"standards":["4.OA.A.3"],"iCan":"I can solve multi-step word problems using addition, subtraction, multiplication, and division. I can explain what a remainder means in a problem.","skills":["math.wordproblems","math.oporder","math.equations"]},
 "I-Math-D22-C3-L1":{"standards":["4.OA.A.3"],"iCan":"I can solve multi-step word problems using addition, subtraction, multiplication, and division. I can explain what a remainder means in a problem.","skills":["math.wordproblems","math.oporder","math.equations"]},
 "I-Math-D23-C1-A":{"standards":["4.OA.A.3"],"iCan":"I can solve multi-step word problems using addition, subtraction, multiplication, and division. I can explain what a remainder means in a problem.","skills":["math.wordproblems","math.oporder","math.equations"]},
 "I-Math-D23-C2-A":{"standards":["4.OA.A.3"],"iCan":"I can solve multi-step word problems using addition, subtraction, multiplication, and division. I can explain what a remainder means in a problem.","skills":["math.wordproblems","math.oporder","math.equations"]},
 "I-Math-D23-C3-L1":{"standards":["4.OA.A.3"],"iCan":"I can solve multi-step word problems using addition, subtraction, multiplication, and division. I can explain what a remainder means in a problem.","skills":["math.wordproblems","math.oporder","math.equations"]},
 "I-Math-D24-C1-A":{"standards":["4.OA.A.3"],"iCan":"I can solve multi-step word problems using addition, subtraction, multiplication, and division. I can explain what a remainder means in a problem.","skills":["math.wordproblems","math.oporder","math.equations"]},
 "I-Math-D24-C2-A":{"standards":["4.OA.A.3"],"iCan":"I can solve multi-step word problems using addition, subtraction, multiplication, and division. I can explain what a remainder means in a problem.","skills":["math.wordproblems","math.oporder","math.equations"]},
 "I-Math-D24-C3-A":{"standards":["4.OA.A.3"],"iCan":"I can solve multi-step word problems using addition, subtraction, multiplication, and division. I can explain what a remainder means in a problem.","skills":["math.wordproblems","math.oporder","math.equations"]},
 "I-Math-D25-C1-A":{"standards":["4.G.1"],"iCan":"I can draw and identify points, lines, line segments, rays, angles, and parallel and perpendicular lines.","skills":["math.geom.lines","math.geom.parallel","math.angle.estimate"]},
 "I-Math-D25-C2-A":{"standards":["4.G.1"],"iCan":"I can draw and identify points, lines, line segments, rays, angles, and parallel and perpendicular lines.","skills":["math.geom.lines","math.geom.parallel","math.angle.estimate"]},
 "I-Math-D25-C3-L1":{"standards":["4.G.1"],"iCan":"I can draw and identify points, lines, line segments, rays, angles, and parallel and perpendicular lines.","skills":["math.geom.lines","math.geom.parallel","math.angle.estimate"]},
 "I-Math-D26-C1-A":{"standards":["4.G.1"],"iCan":"I can draw and identify points, lines, line segments, rays, angles, and parallel and perpendicular lines.","skills":["math.geom.lines","math.geom.parallel","math.angle.estimate"]},
 "I-Math-D26-C2-A":{"standards":["4.G.1"],"iCan":"I can draw and identify points, lines, line segments, rays, angles, and parallel and perpendicular lines.","skills":["math.geom.lines","math.geom.parallel","math.angle.estimate"]},
 "I-Math-D26-C3-L1":{"standards":["4.G.1"],"iCan":"I can draw and identify points, lines, line segments, rays, angles, and parallel and perpendicular lines.","skills":["math.geom.lines","math.geom.parallel","math.angle.estimate"]},
 "I-Math-D27-C1-A":{"standards":["4.G.1"],"iCan":"I can draw and identify points, lines, line segments, rays, angles, and parallel and perpendicular lines.","skills":["math.geom.lines","math.geom.parallel","math.angle.estimate"]},
 "I-Math-D27-C2-A":{"standards":["4.G.1"],"iCan":"I can draw and identify points, lines, line segments, rays, angles, and parallel and perpendicular lines.","skills":["math.geom.lines","math.geom.parallel","math.angle.estimate"]},
 "I-Math-D27-C3-L1":{"standards":["4.G.1"],"iCan":"I can draw and identify points, lines, line segments, rays, angles, and parallel and perpendicular lines.","skills":["math.geom.lines","math.geom.parallel","math.angle.estimate"]},
 "I-Math-D28-C1-A":{"standards":["4.G.1"],"iCan":"I can draw and identify points, lines, line segments, rays, angles, and parallel and perpendicular lines.","skills":["math.geom.lines","math.geom.parallel","math.angle.estimate"]},
 "I-Math-D28-C2-A":{"standards":["4.G.1"],"iCan":"I can draw and identify points, lines, line segments, rays, angles, and parallel and perpendicular lines.","skills":["math.geom.lines","math.geom.parallel","math.angle.estimate"]},
 "I-Math-D28-C3-L1":{"standards":["4.G.1"],"iCan":"I can draw and identify points, lines, line segments, rays, angles, and parallel and perpendicular lines.","skills":["math.geom.lines","math.geom.parallel","math.angle.estimate"]},
 "I-Math-D29-C1-A":{"standards":["4.G.2"],"iCan":"I can sort and classify shapes by their sides, angles, and lines.","skills":["math.geom.polygons","math.pk.classifying_quadrilaterals","math.pk.acute_right_and_obtuse_triangles"]},
 "I-Math-D29-C2-A":{"standards":["4.G.2"],"iCan":"I can sort and classify shapes by their sides, angles, and lines.","skills":["math.geom.polygons","math.pk.classifying_quadrilaterals","math.pk.acute_right_and_obtuse_triangles"]},
 "I-Math-D29-C3-L1":{"standards":["4.G.2"],"iCan":"I can sort and classify shapes by their sides, angles, and lines.","skills":["math.geom.polygons","math.pk.classifying_quadrilaterals","math.pk.acute_right_and_obtuse_triangles"]},
 "I-Math-D3-C1-A":{"standards":["4.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on its place in a number.","skills":["math.placevalue","math.pk.place_value_relationships","math.moreorless"]},
 "I-Math-D3-C2-A":{"standards":["4.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on its place in a number.","skills":["math.placevalue","math.pk.place_value_relationships","math.moreorless"]},
 "I-Math-D3-C3-L1":{"standards":["4.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on its place in a number.","skills":["math.placevalue","math.pk.place_value_relationships","math.moreorless"]},
 "I-Math-D30-C1-A":{"standards":["4.G.2"],"iCan":"I can sort and classify shapes by their sides, angles, and lines.","skills":["math.geom.polygons","math.pk.classifying_quadrilaterals","math.pk.acute_right_and_obtuse_triangles"]},
 "I-Math-D30-C2-A":{"standards":["4.G.2"],"iCan":"I can sort and classify shapes by their sides, angles, and lines.","skills":["math.geom.polygons","math.pk.classifying_quadrilaterals","math.pk.acute_right_and_obtuse_triangles"]},
 "I-Math-D30-C3-L1":{"standards":["4.G.2"],"iCan":"I can sort and classify shapes by their sides, angles, and lines.","skills":["math.geom.polygons","math.pk.classifying_quadrilaterals","math.pk.acute_right_and_obtuse_triangles"]},
 "I-Math-D31-C1-A":{"standards":["4.G.2"],"iCan":"I can sort and classify shapes by their sides, angles, and lines.","skills":["math.geom.polygons","math.pk.classifying_quadrilaterals","math.pk.acute_right_and_obtuse_triangles"]},
 "I-Math-D31-C2-A":{"standards":["4.G.2"],"iCan":"I can sort and classify shapes by their sides, angles, and lines.","skills":["math.geom.polygons","math.pk.classifying_quadrilaterals","math.pk.acute_right_and_obtuse_triangles"]},
 "I-Math-D31-C3-L1":{"standards":["4.G.2"],"iCan":"I can sort and classify shapes by their sides, angles, and lines.","skills":["math.geom.polygons","math.pk.classifying_quadrilaterals","math.pk.acute_right_and_obtuse_triangles"]},
 "I-Math-D32-C1-A":{"standards":["4.G.2"],"iCan":"I can sort and classify shapes by their sides, angles, and lines.","skills":["math.geom.polygons","math.pk.classifying_quadrilaterals","math.pk.acute_right_and_obtuse_triangles"]},
 "I-Math-D32-C2-A":{"standards":["4.G.2"],"iCan":"I can sort and classify shapes by their sides, angles, and lines.","skills":["math.geom.polygons","math.pk.classifying_quadrilaterals","math.pk.acute_right_and_obtuse_triangles"]},
 "I-Math-D32-C3-A":{"standards":["4.G.2"],"iCan":"I can sort and classify shapes by their sides, angles, and lines.","skills":["math.geom.polygons","math.pk.classifying_quadrilaterals","math.pk.acute_right_and_obtuse_triangles"]},
 "I-Math-D33-C1-A":{"standards":["4.G.3"],"iCan":"I can find and draw lines of symmetry in shapes.","skills":["math.symmetry","math.symmetry.count","math.symmetry.identify"]},
 "I-Math-D33-C2-A":{"standards":["4.G.3"],"iCan":"I can find and draw lines of symmetry in shapes.","skills":["math.symmetry","math.symmetry.count","math.symmetry.identify"]},
 "I-Math-D33-C3-L1":{"standards":["4.G.3"],"iCan":"I can find and draw lines of symmetry in shapes.","skills":["math.symmetry","math.symmetry.count","math.symmetry.identify"]},
 "I-Math-D34-C1-A":{"standards":["4.G.3"],"iCan":"I can find and draw lines of symmetry in shapes.","skills":["math.symmetry","math.symmetry.count","math.symmetry.identify"]},
 "I-Math-D34-C2-A":{"standards":["4.G.3"],"iCan":"I can find and draw lines of symmetry in shapes.","skills":["math.symmetry","math.symmetry.count","math.symmetry.identify"]},
 "I-Math-D34-C3-L1":{"standards":["4.G.3"],"iCan":"I can find and draw lines of symmetry in shapes.","skills":["math.symmetry","math.symmetry.count","math.symmetry.identify"]},
 "I-Math-D35-C1-A":{"standards":["4.G.3"],"iCan":"I can find and draw lines of symmetry in shapes.","skills":["math.symmetry","math.symmetry.count","math.symmetry.identify"]},
 "I-Math-D35-C2-A":{"standards":["4.G.3"],"iCan":"I can find and draw lines of symmetry in shapes.","skills":["math.symmetry","math.symmetry.count","math.symmetry.identify"]},
 "I-Math-D35-C3-A":{"standards":["4.G.3"],"iCan":"I can find and draw lines of symmetry in shapes.","skills":["math.symmetry","math.symmetry.count","math.symmetry.identify"]},
 "I-Math-D36-C1-A":{"standards":["4.MD.C.5"],"iCan":"I can understand what angles are and explain how angles are measured.","skills":["math.angle.estimate","math.angle.turns","math.angle.adjacent"]},
 "I-Math-D36-C2-A":{"standards":["4.MD.C.5"],"iCan":"I can understand what angles are and explain how angles are measured.","skills":["math.angle.estimate","math.angle.turns","math.angle.adjacent"]},
 "I-Math-D36-C3-L1":{"standards":["4.MD.C.5"],"iCan":"I can understand what angles are and explain how angles are measured.","skills":["math.angle.estimate","math.angle.turns","math.angle.adjacent"]},
 "I-Math-D37-C1-A":{"standards":["4.MD.C.5"],"iCan":"I can understand what angles are and explain how angles are measured.","skills":["math.angle.estimate","math.angle.turns","math.angle.adjacent"]},
 "I-Math-D37-C2-A":{"standards":["4.MD.C.5"],"iCan":"I can understand what angles are and explain how angles are measured.","skills":["math.angle.estimate","math.angle.turns","math.angle.adjacent"]},
 "I-Math-D37-C3-L1":{"standards":["4.MD.C.5"],"iCan":"I can understand what angles are and explain how angles are measured.","skills":["math.angle.estimate","math.angle.turns","math.angle.adjacent"]},
 "I-Math-D38-C1-A":{"standards":[],"iCan":"","skills":[]},
 "I-Math-D38-C2-A":{"standards":[],"iCan":"","skills":[]},
 "I-Math-D38-C3-A":{"standards":[],"iCan":"","skills":[]},
 "I-Math-D39-C1-A":{"standards":[],"iCan":"","skills":[]},
 "I-Math-D39-C2-A":{"standards":[],"iCan":"","skills":[]},
 "I-Math-D39-C3-A":{"standards":[],"iCan":"","skills":[]},
 "I-Math-D4-C1-A":{"standards":["4.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on its place in a number.","skills":["math.placevalue","math.pk.place_value_relationships","math.moreorless"]},
 "I-Math-D4-C2-A":{"standards":["4.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on its place in a number.","skills":["math.placevalue","math.pk.place_value_relationships","math.moreorless"]},
 "I-Math-D4-C3-L1":{"standards":["4.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on its place in a number.","skills":["math.placevalue","math.pk.place_value_relationships","math.moreorless"]},
 "I-Math-D40-C1-A":{"standards":[],"iCan":"","skills":[]},
 "I-Math-D5-C1-A":{"standards":["4.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on its place in a number.","skills":["math.placevalue","math.pk.place_value_relationships","math.moreorless"]},
 "I-Math-D5-C2-A":{"standards":["4.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on its place in a number.","skills":["math.placevalue","math.pk.place_value_relationships","math.moreorless"]},
 "I-Math-D5-C3-L1":{"standards":["4.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on its place in a number.","skills":["math.placevalue","math.pk.place_value_relationships","math.moreorless"]},
 "I-Math-D6-C1-A":{"standards":["4.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on its place in a number.","skills":["math.placevalue","math.pk.place_value_relationships","math.moreorless"]},
 "I-Math-D6-C2-A":{"standards":["4.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on its place in a number.","skills":["math.placevalue","math.pk.place_value_relationships","math.moreorless"]},
 "I-Math-D6-C3-A":{"standards":["4.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on its place in a number.","skills":["math.placevalue","math.pk.place_value_relationships","math.moreorless"]},
 "I-Math-D7-C1-A":{"standards":["4.NBT.A.2"],"iCan":"I can read, write, compare, and show large numbers in different ways.","skills":["math.placevalue","math.write.multidigit","math.compare.whole","math.dec.expanded"]},
 "I-Math-D7-C2-A":{"standards":["4.NBT.A.2"],"iCan":"I can read, write, compare, and show large numbers in different ways.","skills":["math.placevalue","math.write.multidigit","math.compare.whole","math.dec.expanded"]},
 "I-Math-D7-C3-L1":{"standards":["4.NBT.A.2"],"iCan":"I can read, write, compare, and show large numbers in different ways.","skills":["math.placevalue","math.write.multidigit","math.compare.whole","math.dec.expanded"]},
 "I-Math-D8-C1-A":{"standards":["4.NBT.A.2"],"iCan":"I can read, write, compare, and show large numbers in different ways.","skills":["math.placevalue","math.write.multidigit","math.compare.whole","math.dec.expanded"]},
 "I-Math-D8-C2-A":{"standards":["4.NBT.A.2"],"iCan":"I can read, write, compare, and show large numbers in different ways.","skills":["math.placevalue","math.write.multidigit","math.compare.whole","math.dec.expanded"]},
 "I-Math-D8-C3-L1":{"standards":["4.NBT.A.2"],"iCan":"I can read, write, compare, and show large numbers in different ways.","skills":["math.placevalue","math.write.multidigit","math.compare.whole","math.dec.expanded"]},
 "I-Math-D9-C1-A":{"standards":["4.NBT.A.2"],"iCan":"I can read, write, compare, and show large numbers in different ways.","skills":["math.placevalue","math.write.multidigit","math.compare.whole","math.dec.expanded"]},
 "I-Math-D9-C2-A":{"standards":["4.NBT.A.2"],"iCan":"I can read, write, compare, and show large numbers in different ways.","skills":["math.placevalue","math.write.multidigit","math.compare.whole","math.dec.expanded"]},
 "I-Math-D9-C3-L1":{"standards":["4.NBT.A.2"],"iCan":"I can read, write, compare, and show large numbers in different ways.","skills":["math.placevalue","math.write.multidigit","math.compare.whole","math.dec.expanded"]},
 "I-Science-D1-C1-A":{"standards":[],"iCan":"","skills":[]},
 "I-Science-D1-C2-A":{"standards":[],"iCan":"","skills":[]},
 "I-Science-D1-C3-A":{"standards":[],"iCan":"","skills":[]},
 "I-Science-D10-C1-A":{"standards":["4-PS3-2"],"iCan":"I can show how energy moves through sound, light, heat, and electricity.","skills":["sci.energy_transfer"]},
 "I-Science-D10-C2-A":{"standards":["4-PS3-2"],"iCan":"I can show how energy moves through sound, light, heat, and electricity.","skills":["sci.energy_transfer"]},
 "I-Science-D10-C3-L1":{"standards":["4-PS3-2"],"iCan":"I can show how energy moves through sound, light, heat, and electricity.","skills":["sci.energy_transfer"]},
 "I-Science-D11-C1-A":{"standards":["4-PS3-2"],"iCan":"I can show how energy moves through sound, light, heat, and electricity.","skills":["sci.energy_transfer"]},
 "I-Science-D11-C2-A":{"standards":["4-PS3-2"],"iCan":"I can show how energy moves through sound, light, heat, and electricity.","skills":["sci.energy_transfer"]},
 "I-Science-D11-C3-L1":{"standards":["4-PS3-2"],"iCan":"I can show how energy moves through sound, light, heat, and electricity.","skills":["sci.energy_transfer"]},
 "I-Science-D12-C1-A":{"standards":["4-PS3-2"],"iCan":"I can show how energy moves through sound, light, heat, and electricity.","skills":["sci.energy_transfer"]},
 "I-Science-D12-C2-A":{"standards":["4-PS3-2"],"iCan":"I can show how energy moves through sound, light, heat, and electricity.","skills":["sci.energy_transfer"]},
 "I-Science-D12-C3-L1":{"standards":["4-PS3-2"],"iCan":"I can show how energy moves through sound, light, heat, and electricity.","skills":["sci.energy_transfer"]},
 "I-Science-D13-C1-A":{"standards":["4-PS3-2"],"iCan":"I can show how energy moves through sound, light, heat, and electricity.","skills":["sci.energy_transfer"]},
 "I-Science-D13-C2-A":{"standards":["4-PS3-2"],"iCan":"I can show how energy moves through sound, light, heat, and electricity.","skills":["sci.energy_transfer"]},
 "I-Science-D13-C3-L1":{"standards":["4-PS3-2"],"iCan":"I can show how energy moves through sound, light, heat, and electricity.","skills":["sci.energy_transfer"]},
 "I-Science-D14-C1-A":{"standards":["4-PS3-2"],"iCan":"I can show how energy moves through sound, light, heat, and electricity.","skills":["sci.energy_transfer"]},
 "I-Science-D14-C2-A":{"standards":["4-PS3-2"],"iCan":"I can show how energy moves through sound, light, heat, and electricity.","skills":["sci.energy_transfer"]},
 "I-Science-D14-C3-L1":{"standards":["4-PS3-2"],"iCan":"I can show how energy moves through sound, light, heat, and electricity.","skills":["sci.energy_transfer"]},
 "I-Science-D15-C1-A":{"standards":["4-PS3-2"],"iCan":"I can show how energy moves through sound, light, heat, and electricity.","skills":["sci.energy_transfer"]},
 "I-Science-D15-C2-A":{"standards":["4-PS3-2"],"iCan":"I can show how energy moves through sound, light, heat, and electricity.","skills":["sci.energy_transfer"]},
 "I-Science-D15-C3-A":{"standards":["4-PS3-2"],"iCan":"I can show how energy moves through sound, light, heat, and electricity.","skills":["sci.energy_transfer"]},
 "I-Science-D16-C1-A":{"standards":["4-PS3-3","4-PS3-4"],"iCan":"I can predict what will happen when objects collide.","skills":["sci.collisions","sci.energy_conversion"]},
 "I-Science-D16-C2-A":{"standards":["4-PS3-3","4-PS3-4"],"iCan":"I can predict what will happen when objects collide.","skills":["sci.collisions","sci.energy_conversion"]},
 "I-Science-D16-C3-L1":{"standards":["4-PS3-3","4-PS3-4"],"iCan":"I can predict what will happen when objects collide.","skills":["sci.collisions","sci.energy_conversion"]},
 "I-Science-D17-C1-A":{"standards":["4-PS3-3"],"iCan":"I can predict what will happen when objects collide.","skills":["sci.collisions"]},
 "I-Science-D17-C2-A":{"standards":["4-PS3-3"],"iCan":"I can predict what will happen when objects collide.","skills":["sci.collisions"]},
 "I-Science-D17-C3-L1":{"standards":["4-PS3-3"],"iCan":"I can predict what will happen when objects collide.","skills":["sci.collisions"]},
 "I-Science-D18-C1-A":{"standards":["4-PS3-3"],"iCan":"I can predict what will happen when objects collide.","skills":["sci.collisions"]},
 "I-Science-D18-C2-A":{"standards":["4-PS3-3"],"iCan":"I can predict what will happen when objects collide.","skills":["sci.collisions"]},
 "I-Science-D18-C3-L1":{"standards":["4-PS3-3"],"iCan":"I can predict what will happen when objects collide.","skills":["sci.collisions"]},
 "I-Science-D19-C1-A":{"standards":["4-PS3-3"],"iCan":"I can predict what will happen when objects collide.","skills":["sci.collisions"]},
 "I-Science-D19-C2-A":{"standards":["4-PS3-3"],"iCan":"I can predict what will happen when objects collide.","skills":["sci.collisions"]},
 "I-Science-D19-C3-L1":{"standards":["4-PS3-3"],"iCan":"I can predict what will happen when objects collide.","skills":["sci.collisions"]},
 "I-Science-D2-C1-A":{"standards":[],"iCan":"","skills":[]},
 "I-Science-D2-C2-A":{"standards":[],"iCan":"","skills":[]},
 "I-Science-D2-C3-A":{"standards":[],"iCan":"","skills":[]},
 "I-Science-D20-C1-A":{"standards":["4-PS3-3"],"iCan":"I can predict what will happen when objects collide.","skills":["sci.collisions"]},
 "I-Science-D20-C2-A":{"standards":["4-PS3-3"],"iCan":"I can predict what will happen when objects collide.","skills":["sci.collisions"]},
 "I-Science-D20-C3-L1":{"standards":["4-PS3-3"],"iCan":"I can predict what will happen when objects collide.","skills":["sci.collisions"]},
 "I-Science-D21-C1-A":{"standards":["4-PS3-3"],"iCan":"I can predict what will happen when objects collide.","skills":["sci.collisions"]},
 "I-Science-D21-C2-A":{"standards":["4-PS3-3"],"iCan":"I can predict what will happen when objects collide.","skills":["sci.collisions"]},
 "I-Science-D21-C3-A":{"standards":["4-PS3-3"],"iCan":"I can predict what will happen when objects collide.","skills":["sci.collisions"]},
 "I-Science-D22-C1-A":{"standards":["4-ESS3-1"],"iCan":"I can explain where energy comes from and how using it affects the environment.","skills":["sci.energy_resources"]},
 "I-Science-D22-C2-A":{"standards":["4-ESS3-1"],"iCan":"I can explain where energy comes from and how using it affects the environment.","skills":["sci.energy_resources"]},
 "I-Science-D22-C3-L1":{"standards":["4-ESS3-1"],"iCan":"I can explain where energy comes from and how using it affects the environment.","skills":["sci.energy_resources"]},
 "I-Science-D23-C1-A":{"standards":["4-ESS3-1"],"iCan":"I can explain where energy comes from and how using it affects the environment.","skills":["sci.energy_resources"]},
 "I-Science-D23-C2-A":{"standards":["4-ESS3-1"],"iCan":"I can explain where energy comes from and how using it affects the environment.","skills":["sci.energy_resources"]},
 "I-Science-D23-C3-L1":{"standards":["4-ESS3-1"],"iCan":"I can explain where energy comes from and how using it affects the environment.","skills":["sci.energy_resources"]},
 "I-Science-D24-C1-A":{"standards":["4-ESS3-1"],"iCan":"I can explain where energy comes from and how using it affects the environment.","skills":["sci.energy_resources"]},
 "I-Science-D24-C2-A":{"standards":["4-ESS3-1"],"iCan":"I can explain where energy comes from and how using it affects the environment.","skills":["sci.energy_resources"]},
 "I-Science-D24-C3-L1":{"standards":["4-ESS3-1"],"iCan":"I can explain where energy comes from and how using it affects the environment.","skills":["sci.energy_resources"]},
 "I-Science-D25-C1-A":{"standards":["4-ESS3-1"],"iCan":"I can explain where energy comes from and how using it affects the environment.","skills":["sci.energy_resources"]},
 "I-Science-D25-C2-A":{"standards":["4-ESS3-1"],"iCan":"I can explain where energy comes from and how using it affects the environment.","skills":["sci.energy_resources"]},
 "I-Science-D25-C3-L1":{"standards":["4-ESS3-1"],"iCan":"I can explain where energy comes from and how using it affects the environment.","skills":["sci.energy_resources"]},
 "I-Science-D26-C1-A":{"standards":["4-ESS3-1"],"iCan":"I can explain where energy comes from and how using it affects the environment.","skills":["sci.energy_resources"]},
 "I-Science-D26-C2-A":{"standards":["4-ESS3-1"],"iCan":"I can explain where energy comes from and how using it affects the environment.","skills":["sci.energy_resources"]},
 "I-Science-D26-C3-L1":{"standards":["4-ESS3-1"],"iCan":"I can explain where energy comes from and how using it affects the environment.","skills":["sci.energy_resources"]},
 "I-Science-D27-C1-A":{"standards":["4-ESS3-1"],"iCan":"I can explain where energy comes from and how using it affects the environment.","skills":["sci.energy_resources"]},
 "I-Science-D27-C2-A":{"standards":["4-ESS3-1"],"iCan":"I can explain where energy comes from and how using it affects the environment.","skills":["sci.energy_resources"]},
 "I-Science-D27-C3-A":{"standards":["4-ESS3-1"],"iCan":"I can explain where energy comes from and how using it affects the environment.","skills":["sci.energy_resources"]},
 "I-Science-D28-C1-A":{"standards":["3-5 ETS1-1"],"iCan":"I can define a problem and identify goals and limits for solving it.","skills":["sci.design_problem"]},
 "I-Science-D28-C2-A":{"standards":["3-5 ETS1-1"],"iCan":"I can define a problem and identify goals and limits for solving it.","skills":["sci.design_problem"]},
 "I-Science-D28-C3-L1":{"standards":["3-5 ETS1-1"],"iCan":"I can define a problem and identify goals and limits for solving it.","skills":["sci.design_problem"]},
 "I-Science-D29-C1-A":{"standards":["3-5 ETS1-1"],"iCan":"I can define a problem and identify goals and limits for solving it.","skills":["sci.design_problem"]},
 "I-Science-D29-C2-A":{"standards":["3-5 ETS1-1"],"iCan":"I can define a problem and identify goals and limits for solving it.","skills":["sci.design_problem"]},
 "I-Science-D29-C3-L1":{"standards":["3-5 ETS1-1"],"iCan":"I can define a problem and identify goals and limits for solving it.","skills":["sci.design_problem"]},
 "I-Science-D3-C1-A":{"standards":["4-PS3-1"],"iCan":"I can explain how faster-moving objects have more energy.","skills":["sci.speed_energy"]},
 "I-Science-D3-C2-A":{"standards":["4-PS3-1"],"iCan":"I can explain how faster-moving objects have more energy.","skills":["sci.speed_energy"]},
 "I-Science-D3-C3-L1":{"standards":["4-PS3-1"],"iCan":"I can explain how faster-moving objects have more energy.","skills":["sci.speed_energy"]},
 "I-Science-D30-C1-A":{"standards":["3-5 ETS1-1"],"iCan":"I can define a problem and identify goals and limits for solving it.","skills":["sci.design_problem"]},
 "I-Science-D30-C2-A":{"standards":["3-5 ETS1-1"],"iCan":"I can define a problem and identify goals and limits for solving it.","skills":["sci.design_problem"]},
 "I-Science-D30-C3-L1":{"standards":["3-5 ETS1-1"],"iCan":"I can define a problem and identify goals and limits for solving it.","skills":["sci.design_problem"]},
 "I-Science-D31-C1-A":{"standards":["3-5 ETS1-2"],"iCan":"I can compare different solutions and choose the best one.","skills":["sci.compare_solutions"]},
 "I-Science-D31-C2-A":{"standards":["3-5 ETS1-2"],"iCan":"I can compare different solutions and choose the best one.","skills":["sci.compare_solutions"]},
 "I-Science-D31-C3-L1":{"standards":["3-5 ETS1-2"],"iCan":"I can compare different solutions and choose the best one.","skills":["sci.compare_solutions"]},
 "I-Science-D32-C1-A":{"standards":["3-5 ETS1-2"],"iCan":"I can compare different solutions and choose the best one.","skills":["sci.compare_solutions"]},
 "I-Science-D32-C2-A":{"standards":["3-5 ETS1-2"],"iCan":"I can compare different solutions and choose the best one.","skills":["sci.compare_solutions"]},
 "I-Science-D32-C3-L1":{"standards":["3-5 ETS1-2"],"iCan":"I can compare different solutions and choose the best one.","skills":["sci.compare_solutions"]},
 "I-Science-D33-C1-A":{"standards":["3-5 ETS1-2"],"iCan":"I can compare different solutions and choose the best one.","skills":["sci.compare_solutions"]},
 "I-Science-D33-C2-A":{"standards":["3-5 ETS1-2"],"iCan":"I can compare different solutions and choose the best one.","skills":["sci.compare_solutions"]},
 "I-Science-D33-C3-L1":{"standards":["3-5 ETS1-2"],"iCan":"I can compare different solutions and choose the best one.","skills":["sci.compare_solutions"]},
 "I-Science-D34-C1-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my design fairly and improve it using evidence.","skills":["sci.fair_test"]},
 "I-Science-D34-C2-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my design fairly and improve it using evidence.","skills":["sci.fair_test"]},
 "I-Science-D34-C3-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my design fairly and improve it using evidence.","skills":["sci.fair_test"]},
 "I-Science-D35-C1-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my design fairly and improve it using evidence.","skills":["sci.fair_test"]},
 "I-Science-D35-C2-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my design fairly and improve it using evidence.","skills":["sci.fair_test"]},
 "I-Science-D35-C3-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my design fairly and improve it using evidence.","skills":["sci.fair_test"]},
 "I-Science-D36-C1-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my design fairly and improve it using evidence.","skills":["sci.fair_test"]},
 "I-Science-D36-C2-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my design fairly and improve it using evidence.","skills":["sci.fair_test"]},
 "I-Science-D36-C3-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my design fairly and improve it using evidence.","skills":["sci.fair_test"]},
 "I-Science-D37-C1-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my design fairly and improve it using evidence.","skills":["sci.fair_test"]},
 "I-Science-D37-C2-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my design fairly and improve it using evidence.","skills":["sci.fair_test"]},
 "I-Science-D37-C3-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my design fairly and improve it using evidence.","skills":["sci.fair_test"]},
 "I-Science-D38-C1-A":{"standards":[],"iCan":"","skills":[]},
 "I-Science-D38-C2-A":{"standards":[],"iCan":"","skills":[]},
 "I-Science-D38-C3-A":{"standards":[],"iCan":"","skills":[]},
 "I-Science-D39-C1-A":{"standards":[],"iCan":"","skills":[]},
 "I-Science-D39-C2-A":{"standards":[],"iCan":"","skills":[]},
 "I-Science-D39-C3-A":{"standards":[],"iCan":"","skills":[]},
 "I-Science-D4-C1-A":{"standards":["4-PS3-1"],"iCan":"I can explain how faster-moving objects have more energy.","skills":["sci.speed_energy"]},
 "I-Science-D4-C2-A":{"standards":["4-PS3-1"],"iCan":"I can explain how faster-moving objects have more energy.","skills":["sci.speed_energy"]},
 "I-Science-D4-C3-L1":{"standards":["4-PS3-1"],"iCan":"I can explain how faster-moving objects have more energy.","skills":["sci.speed_energy"]},
 "I-Science-D40-C1-A":{"standards":[],"iCan":"","skills":[]},
 "I-Science-D40-C2-A":{"standards":[],"iCan":"","skills":[]},
 "I-Science-D40-C3-A":{"standards":[],"iCan":"","skills":[]},
 "I-Science-D5-C1-A":{"standards":["4-PS3-1"],"iCan":"I can explain how faster-moving objects have more energy.","skills":["sci.speed_energy"]},
 "I-Science-D5-C2-A":{"standards":["4-PS3-1"],"iCan":"I can explain how faster-moving objects have more energy.","skills":["sci.speed_energy"]},
 "I-Science-D5-C3-L1":{"standards":["4-PS3-1"],"iCan":"I can explain how faster-moving objects have more energy.","skills":["sci.speed_energy"]},
 "I-Science-D6-C1-A":{"standards":["4-PS3-1"],"iCan":"I can explain how faster-moving objects have more energy.","skills":["sci.speed_energy"]},
 "I-Science-D6-C2-A":{"standards":["4-PS3-1"],"iCan":"I can explain how faster-moving objects have more energy.","skills":["sci.speed_energy"]},
 "I-Science-D6-C3-L1":{"standards":["4-PS3-1"],"iCan":"I can explain how faster-moving objects have more energy.","skills":["sci.speed_energy"]},
 "I-Science-D7-C1-A":{"standards":["4-PS3-1"],"iCan":"I can explain how faster-moving objects have more energy.","skills":["sci.speed_energy"]},
 "I-Science-D7-C2-A":{"standards":["4-PS3-1"],"iCan":"I can explain how faster-moving objects have more energy.","skills":["sci.speed_energy"]},
 "I-Science-D7-C3-L1":{"standards":["4-PS3-1"],"iCan":"I can explain how faster-moving objects have more energy.","skills":["sci.speed_energy"]},
 "I-Science-D8-C1-A":{"standards":["4-PS3-1"],"iCan":"I can explain how faster-moving objects have more energy.","skills":["sci.speed_energy"]},
 "I-Science-D8-C2-A":{"standards":["4-PS3-1"],"iCan":"I can explain how faster-moving objects have more energy.","skills":["sci.speed_energy"]},
 "I-Science-D8-C3-A":{"standards":["4-PS3-1"],"iCan":"I can explain how faster-moving objects have more energy.","skills":["sci.speed_energy"]},
 "I-Science-D9-C1-A":{"standards":["4-PS3-2"],"iCan":"I can show how energy moves through sound, light, heat, and electricity.","skills":["sci.energy_transfer"]},
 "I-Science-D9-C2-A":{"standards":["4-PS3-2"],"iCan":"I can show how energy moves through sound, light, heat, and electricity.","skills":["sci.energy_transfer"]},
 "I-Science-D9-C3-L1":{"standards":["4-PS3-2"],"iCan":"I can show how energy moves through sound, light, heat, and electricity.","skills":["sci.energy_transfer"]},
 "K-HUM-D1-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D1-C2-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D1-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D1-C4-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D10-C1-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D10-C2-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D10-C3-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D11-C1-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D11-C2-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D11-C3-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D12-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D12-C2-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D12-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D13-C1-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D13-C2-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D13-C3-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D14-C1-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D14-C2-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D14-C3-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D15-C1-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D15-C2-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D15-C3-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D15-C3-L2":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D16-C1-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D16-C2-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D16-C3-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D17-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D17-C2-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D17-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D18-C1-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D18-C2-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D18-C3-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D19-C1-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D19-C2-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D19-C3-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D2-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D2-C2-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D2-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D2-C4-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D20-C1-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D20-C2-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D20-C3-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D21-C1-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D21-C2-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D21-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D22-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D22-C2-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D22-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D23-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D23-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D24-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D24-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D25-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D25-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D26-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D26-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D27-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D27-C2-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D27-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D28-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D28-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D29-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D29-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D3-C1-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D3-C2-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D3-C3-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D30-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D30-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D31-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D31-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D32-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D32-C2-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D32-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D33-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D33-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D34-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D34-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D35-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D35-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D36-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D36-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D37-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D37-C2-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D37-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D38-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D38-C2-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D38-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D38-C4-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D39-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D39-C2-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D39-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D39-C4-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D4-C1-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D4-C2-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D4-C3-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D40-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D40-C2-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D40-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D40-C4-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D5-C1-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D5-C2-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D5-C3-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D6-C1-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D6-C2-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D6-C3-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D7-C1-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D7-C2-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D7-C3-A":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D8-C1-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D8-C2-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D8-C3-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D9-C1-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D9-C2-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-HUM-D9-C3-L1":{"standards":["W.5.1","W.5.4","SL.5.1","RL.5.1","RL.5.3","RL.5.5","RL.5.7","L.5.2","L.5.3","L.5.4"],"iCan":"A. Introduce a topic or text clearly, state an opinion, and create an organizational structure in which related ideas are grouped to support the writer's purpose. B. Provide logically ordered reasons that are supported by facts and details. C. Link opinions and reasons using words, phrases, and clauses (e.g., consequently, specifically). D. Provide a concluding statement or section related to the opinion presented.","skills":["ela.opinion","ela.topicsentence","ela.writing","ela.meaning","ela.supporting","ela.pk.comparing_and_contrasting","ela.character","ela.pk.text_structures","ela.commas","ela.capitalization","ela.dialogue","ela.pk.combining_sentences","ela.pk.expanding_sentences","ela.pk.reducing_sentences","ela.roots","ela.affix"]},
 "K-Math-D1-C1-A":{"standards":[],"iCan":"","skills":[]},
 "K-Math-D1-C2-A":{"standards":[],"iCan":"","skills":[]},
 "K-Math-D1-C3-A":{"standards":[],"iCan":"","skills":[]},
 "K-Math-D10-C1-A":{"standards":["5.NBT.A.2"],"iCan":"I can explain patterns when multiplying and dividing by powers of 10.","skills":["math.pk.multiplying_a_decimal_by_a_power_of_ten","math.pk.dividing_by_powers_of_ten","math.pk.multiplication_patterns_over"]},
 "K-Math-D10-C2-A":{"standards":["5.NBT.A.2"],"iCan":"I can explain patterns when multiplying and dividing by powers of 10.","skills":["math.pk.multiplying_a_decimal_by_a_power_of_ten","math.pk.dividing_by_powers_of_ten","math.pk.multiplication_patterns_over"]},
 "K-Math-D10-C3-L1":{"standards":["5.NBT.A.2"],"iCan":"I can explain patterns when multiplying and dividing by powers of 10.","skills":["math.pk.multiplying_a_decimal_by_a_power_of_ten","math.pk.dividing_by_powers_of_ten","math.pk.multiplication_patterns_over"]},
 "K-Math-D11-C1-A":{"standards":["5.NBT.A.2"],"iCan":"I can explain patterns when multiplying and dividing by powers of 10.","skills":["math.pk.multiplying_a_decimal_by_a_power_of_ten","math.pk.dividing_by_powers_of_ten","math.pk.multiplication_patterns_over"]},
 "K-Math-D11-C2-A":{"standards":["5.NBT.A.2"],"iCan":"I can explain patterns when multiplying and dividing by powers of 10.","skills":["math.pk.multiplying_a_decimal_by_a_power_of_ten","math.pk.dividing_by_powers_of_ten","math.pk.multiplication_patterns_over"]},
 "K-Math-D11-C3-L1":{"standards":["5.NBT.A.2"],"iCan":"I can explain patterns when multiplying and dividing by powers of 10.","skills":["math.pk.multiplying_a_decimal_by_a_power_of_ten","math.pk.dividing_by_powers_of_ten","math.pk.multiplication_patterns_over"]},
 "K-Math-D12-C1-A":{"standards":["5.NBT.A.2"],"iCan":"I can explain patterns when multiplying and dividing by powers of 10.","skills":["math.pk.multiplying_a_decimal_by_a_power_of_ten","math.pk.dividing_by_powers_of_ten","math.pk.multiplication_patterns_over"]},
 "K-Math-D12-C2-A":{"standards":["5.NBT.A.2"],"iCan":"I can explain patterns when multiplying and dividing by powers of 10.","skills":["math.pk.multiplying_a_decimal_by_a_power_of_ten","math.pk.dividing_by_powers_of_ten","math.pk.multiplication_patterns_over"]},
 "K-Math-D12-C3-A":{"standards":["5.NBT.A.2"],"iCan":"I can explain patterns when multiplying and dividing by powers of 10.","skills":["math.pk.multiplying_a_decimal_by_a_power_of_ten","math.pk.dividing_by_powers_of_ten","math.pk.multiplication_patterns_over"]},
 "K-Math-D13-C1-A":{"standards":["5.NBT.A.3"],"iCan":"I can read, write, compare, and explain decimals to the thousandths place.","skills":["math.dec.compare","math.dec.order","math.pk.decimal_number_lines","math.dec.wordform"]},
 "K-Math-D13-C2-A":{"standards":["5.NBT.A.3"],"iCan":"I can read, write, compare, and explain decimals to the thousandths place.","skills":["math.dec.compare","math.dec.order","math.pk.decimal_number_lines","math.dec.wordform"]},
 "K-Math-D13-C3-L1":{"standards":["5.NBT.A.3"],"iCan":"I can read, write, compare, and explain decimals to the thousandths place.","skills":["math.dec.compare","math.dec.order","math.pk.decimal_number_lines","math.dec.wordform"]},
 "K-Math-D14-C1-A":{"standards":["5.NBT.A.3"],"iCan":"I can read, write, compare, and explain decimals to the thousandths place.","skills":["math.dec.compare","math.dec.order","math.pk.decimal_number_lines","math.dec.wordform"]},
 "K-Math-D14-C2-A":{"standards":["5.NBT.A.3"],"iCan":"I can read, write, compare, and explain decimals to the thousandths place.","skills":["math.dec.compare","math.dec.order","math.pk.decimal_number_lines","math.dec.wordform"]},
 "K-Math-D14-C3-L1":{"standards":["5.NBT.A.3"],"iCan":"I can read, write, compare, and explain decimals to the thousandths place.","skills":["math.dec.compare","math.dec.order","math.pk.decimal_number_lines","math.dec.wordform"]},
 "K-Math-D15-C1-A":{"standards":["5.NBT.A.3"],"iCan":"I can read, write, compare, and explain decimals to the thousandths place.","skills":["math.dec.compare","math.dec.order","math.pk.decimal_number_lines","math.dec.wordform"]},
 "K-Math-D15-C2-A":{"standards":["5.NBT.A.3"],"iCan":"I can read, write, compare, and explain decimals to the thousandths place.","skills":["math.dec.compare","math.dec.order","math.pk.decimal_number_lines","math.dec.wordform"]},
 "K-Math-D15-C3-L1":{"standards":["5.NBT.A.3"],"iCan":"I can read, write, compare, and explain decimals to the thousandths place.","skills":["math.dec.compare","math.dec.order","math.pk.decimal_number_lines","math.dec.wordform"]},
 "K-Math-D16-C1-A":{"standards":["5.NBT.A.3"],"iCan":"I can read, write, compare, and explain decimals to the thousandths place.","skills":["math.dec.compare","math.dec.order","math.pk.decimal_number_lines","math.dec.wordform"]},
 "K-Math-D16-C2-A":{"standards":["5.NBT.A.3"],"iCan":"I can read, write, compare, and explain decimals to the thousandths place.","skills":["math.dec.compare","math.dec.order","math.pk.decimal_number_lines","math.dec.wordform"]},
 "K-Math-D16-C3-L1":{"standards":["5.NBT.A.3"],"iCan":"I can read, write, compare, and explain decimals to the thousandths place.","skills":["math.dec.compare","math.dec.order","math.pk.decimal_number_lines","math.dec.wordform"]},
 "K-Math-D17-C1-A":{"standards":["5.NBT.A.3"],"iCan":"I can read, write, compare, and explain decimals to the thousandths place.","skills":["math.dec.compare","math.dec.order","math.pk.decimal_number_lines","math.dec.wordform"]},
 "K-Math-D17-C2-A":{"standards":["5.NBT.A.3"],"iCan":"I can read, write, compare, and explain decimals to the thousandths place.","skills":["math.dec.compare","math.dec.order","math.pk.decimal_number_lines","math.dec.wordform"]},
 "K-Math-D17-C3-L1":{"standards":["5.NBT.A.3"],"iCan":"I can read, write, compare, and explain decimals to the thousandths place.","skills":["math.dec.compare","math.dec.order","math.pk.decimal_number_lines","math.dec.wordform"]},
 "K-Math-D18-C1-A":{"standards":["5.NBT.A.3"],"iCan":"I can read, write, compare, and explain decimals to the thousandths place.","skills":["math.dec.compare","math.dec.order","math.pk.decimal_number_lines","math.dec.wordform"]},
 "K-Math-D18-C2-A":{"standards":["5.NBT.A.3"],"iCan":"I can read, write, compare, and explain decimals to the thousandths place.","skills":["math.dec.compare","math.dec.order","math.pk.decimal_number_lines","math.dec.wordform"]},
 "K-Math-D18-C3-L1":{"standards":["5.NBT.A.3"],"iCan":"I can read, write, compare, and explain decimals to the thousandths place.","skills":["math.dec.compare","math.dec.order","math.pk.decimal_number_lines","math.dec.wordform"]},
 "K-Math-D19-C1-A":{"standards":["5.NBT.A.3"],"iCan":"I can read, write, compare, and explain decimals to the thousandths place.","skills":["math.dec.compare","math.dec.order","math.pk.decimal_number_lines","math.dec.wordform"]},
 "K-Math-D19-C2-A":{"standards":["5.NBT.A.3"],"iCan":"I can read, write, compare, and explain decimals to the thousandths place.","skills":["math.dec.compare","math.dec.order","math.pk.decimal_number_lines","math.dec.wordform"]},
 "K-Math-D19-C3-A":{"standards":["5.NBT.A.3"],"iCan":"I can read, write, compare, and explain decimals to the thousandths place.","skills":["math.dec.compare","math.dec.order","math.pk.decimal_number_lines","math.dec.wordform"]},
 "K-Math-D2-C1-A":{"standards":[],"iCan":"","skills":[]},
 "K-Math-D2-C2-A":{"standards":[],"iCan":"","skills":[]},
 "K-Math-D2-C3-A":{"standards":[],"iCan":"","skills":[]},
 "K-Math-D20-C1-A":{"standards":["5.NBT.A.4"],"iCan":"I can round decimals to any place value.","skills":["math.rounding","math.pk.rounding_decimals"]},
 "K-Math-D20-C2-A":{"standards":["5.NBT.A.4"],"iCan":"I can round decimals to any place value.","skills":["math.rounding","math.pk.rounding_decimals"]},
 "K-Math-D20-C3-L1":{"standards":["5.NBT.A.4"],"iCan":"I can round decimals to any place value.","skills":["math.rounding","math.pk.rounding_decimals"]},
 "K-Math-D21-C1-A":{"standards":["5.NBT.A.4"],"iCan":"I can round decimals to any place value.","skills":["math.rounding","math.pk.rounding_decimals"]},
 "K-Math-D21-C2-A":{"standards":["5.NBT.A.4"],"iCan":"I can round decimals to any place value.","skills":["math.rounding","math.pk.rounding_decimals"]},
 "K-Math-D21-C3-L1":{"standards":["5.NBT.A.4"],"iCan":"I can round decimals to any place value.","skills":["math.rounding","math.pk.rounding_decimals"]},
 "K-Math-D22-C1-A":{"standards":["5.NBT.A.4"],"iCan":"I can round decimals to any place value.","skills":["math.rounding","math.pk.rounding_decimals"]},
 "K-Math-D22-C2-A":{"standards":["5.NBT.A.4"],"iCan":"I can round decimals to any place value.","skills":["math.rounding","math.pk.rounding_decimals"]},
 "K-Math-D22-C3-L1":{"standards":["5.NBT.A.4"],"iCan":"I can round decimals to any place value.","skills":["math.rounding","math.pk.rounding_decimals"]},
 "K-Math-D23-C1-A":{"standards":["5.NBT.A.4"],"iCan":"I can round decimals to any place value.","skills":["math.rounding","math.pk.rounding_decimals"]},
 "K-Math-D23-C2-A":{"standards":["5.NBT.A.4"],"iCan":"I can round decimals to any place value.","skills":["math.rounding","math.pk.rounding_decimals"]},
 "K-Math-D23-C3-L1":{"standards":["5.NBT.A.4"],"iCan":"I can round decimals to any place value.","skills":["math.rounding","math.pk.rounding_decimals"]},
 "K-Math-D24-C1-A":{"standards":["5.NBT.A.4"],"iCan":"I can round decimals to any place value.","skills":["math.rounding","math.pk.rounding_decimals"]},
 "K-Math-D24-C2-A":{"standards":["5.NBT.A.4"],"iCan":"I can round decimals to any place value.","skills":["math.rounding","math.pk.rounding_decimals"]},
 "K-Math-D24-C3-A":{"standards":["5.NBT.A.4"],"iCan":"I can round decimals to any place value.","skills":["math.rounding","math.pk.rounding_decimals"]},
 "K-Math-D25-C1-A":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D25-C2-A":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D25-C3-L1":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D26-C1-A":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D26-C2-A":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D26-C3-L1":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D27-C1-A":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D27-C2-A":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D27-C3-L1":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D28-C1-A":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D28-C2-A":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D28-C3-L1":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D29-C1-A":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D29-C2-A":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D29-C3-L1":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D3-C1-A":{"standards":["5.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on where it is in a number.","skills":["math.placevalue","math.pk.place_value_relationships"]},
 "K-Math-D3-C2-A":{"standards":["5.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on where it is in a number.","skills":["math.placevalue","math.pk.place_value_relationships"]},
 "K-Math-D3-C3-L1":{"standards":["5.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on where it is in a number.","skills":["math.placevalue","math.pk.place_value_relationships"]},
 "K-Math-D30-C1-A":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D30-C2-A":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D30-C3-L1":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D31-C1-A":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D31-C2-A":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D31-C3-L1":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D32-C1-A":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D32-C2-A":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D32-C3-L1":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D33-C1-A":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D33-C2-A":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D33-C3-L1":{"standards":["5.NBT.B.7"],"iCan":"I can add, subtract, multiply, and divide decimals and explain my thinking.","skills":["math.dec.add","math.dec.sub","math.pk.multiplying_a_decimal_by_a_one_digit","math.pk.division_with_decimal_quotients"]},
 "K-Math-D34-C1-A":{"standards":[],"iCan":"","skills":[]},
 "K-Math-D34-C2-A":{"standards":[],"iCan":"","skills":[]},
 "K-Math-D34-C3-A":{"standards":[],"iCan":"","skills":[]},
 "K-Math-D35-C1-A":{"standards":["5.G.A.3"],"iCan":"I can explain how shapes belong to categories and how those categories are related.","skills":["math.pk.classifying_quadrilaterals","math.geom.polygons","math.pk.parallel_sides_in_quadrilaterals"]},
 "K-Math-D35-C2-A":{"standards":["5.G.A.3"],"iCan":"I can explain how shapes belong to categories and how those categories are related.","skills":["math.pk.classifying_quadrilaterals","math.geom.polygons","math.pk.parallel_sides_in_quadrilaterals"]},
 "K-Math-D35-C3-L1":{"standards":["5.G.A.3"],"iCan":"I can explain how shapes belong to categories and how those categories are related.","skills":["math.pk.classifying_quadrilaterals","math.geom.polygons","math.pk.parallel_sides_in_quadrilaterals"]},
 "K-Math-D36-C1-A":{"standards":["5.G.A.3"],"iCan":"I can explain how shapes belong to categories and how those categories are related.","skills":["math.pk.classifying_quadrilaterals","math.geom.polygons","math.pk.parallel_sides_in_quadrilaterals"]},
 "K-Math-D36-C2-A":{"standards":["5.G.A.3"],"iCan":"I can explain how shapes belong to categories and how those categories are related.","skills":["math.pk.classifying_quadrilaterals","math.geom.polygons","math.pk.parallel_sides_in_quadrilaterals"]},
 "K-Math-D36-C3-L1":{"standards":["5.G.A.3"],"iCan":"I can explain how shapes belong to categories and how those categories are related.","skills":["math.pk.classifying_quadrilaterals","math.geom.polygons","math.pk.parallel_sides_in_quadrilaterals"]},
 "K-Math-D37-C1-A":{"standards":["5.G.A.3"],"iCan":"I can explain how shapes belong to categories and how those categories are related.","skills":["math.pk.classifying_quadrilaterals","math.geom.polygons","math.pk.parallel_sides_in_quadrilaterals"]},
 "K-Math-D37-C2-A":{"standards":["5.G.A.3"],"iCan":"I can explain how shapes belong to categories and how those categories are related.","skills":["math.pk.classifying_quadrilaterals","math.geom.polygons","math.pk.parallel_sides_in_quadrilaterals"]},
 "K-Math-D37-C3-L1":{"standards":["5.G.A.3"],"iCan":"I can explain how shapes belong to categories and how those categories are related.","skills":["math.pk.classifying_quadrilaterals","math.geom.polygons","math.pk.parallel_sides_in_quadrilaterals"]},
 "K-Math-D38-C1-A":{"standards":[],"iCan":"","skills":[]},
 "K-Math-D38-C2-A":{"standards":[],"iCan":"","skills":[]},
 "K-Math-D38-C3-A":{"standards":[],"iCan":"","skills":[]},
 "K-Math-D39-C1-A":{"standards":[],"iCan":"","skills":[]},
 "K-Math-D39-C2-A":{"standards":[],"iCan":"","skills":[]},
 "K-Math-D39-C3-A":{"standards":[],"iCan":"","skills":[]},
 "K-Math-D4-C1-A":{"standards":["5.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on where it is in a number.","skills":["math.placevalue","math.pk.place_value_relationships"]},
 "K-Math-D4-C2-A":{"standards":["5.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on where it is in a number.","skills":["math.placevalue","math.pk.place_value_relationships"]},
 "K-Math-D4-C3-L1":{"standards":["5.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on where it is in a number.","skills":["math.placevalue","math.pk.place_value_relationships"]},
 "K-Math-D40-C1-A":{"standards":[],"iCan":"","skills":[]},
 "K-Math-D40-C2-A":{"standards":[],"iCan":"","skills":[]},
 "K-Math-D40-C3-A":{"standards":[],"iCan":"","skills":[]},
 "K-Math-D5-C1-A":{"standards":["5.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on where it is in a number.","skills":["math.placevalue","math.pk.place_value_relationships"]},
 "K-Math-D5-C2-A":{"standards":["5.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on where it is in a number.","skills":["math.placevalue","math.pk.place_value_relationships"]},
 "K-Math-D5-C3-L1":{"standards":["5.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on where it is in a number.","skills":["math.placevalue","math.pk.place_value_relationships"]},
 "K-Math-D6-C1-A":{"standards":["5.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on where it is in a number.","skills":["math.placevalue","math.pk.place_value_relationships"]},
 "K-Math-D6-C2-A":{"standards":["5.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on where it is in a number.","skills":["math.placevalue","math.pk.place_value_relationships"]},
 "K-Math-D6-C3-L1":{"standards":["5.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on where it is in a number.","skills":["math.placevalue","math.pk.place_value_relationships"]},
 "K-Math-D7-C1-A":{"standards":["5.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on where it is in a number.","skills":["math.placevalue","math.pk.place_value_relationships"]},
 "K-Math-D7-C2-A":{"standards":["5.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on where it is in a number.","skills":["math.placevalue","math.pk.place_value_relationships"]},
 "K-Math-D7-C3-A":{"standards":["5.NBT.A.1"],"iCan":"I can explain how the value of a digit changes depending on where it is in a number.","skills":["math.placevalue","math.pk.place_value_relationships"]},
 "K-Math-D8-C1-A":{"standards":["5.NBT.A.2"],"iCan":"I can explain patterns when multiplying and dividing by powers of 10.","skills":["math.pk.multiplying_a_decimal_by_a_power_of_ten","math.pk.dividing_by_powers_of_ten","math.pk.multiplication_patterns_over"]},
 "K-Math-D8-C2-A":{"standards":["5.NBT.A.2"],"iCan":"I can explain patterns when multiplying and dividing by powers of 10.","skills":["math.pk.multiplying_a_decimal_by_a_power_of_ten","math.pk.dividing_by_powers_of_ten","math.pk.multiplication_patterns_over"]},
 "K-Math-D8-C3-L1":{"standards":["5.NBT.A.2"],"iCan":"I can explain patterns when multiplying and dividing by powers of 10.","skills":["math.pk.multiplying_a_decimal_by_a_power_of_ten","math.pk.dividing_by_powers_of_ten","math.pk.multiplication_patterns_over"]},
 "K-Math-D9-C1-A":{"standards":["5.NBT.A.2"],"iCan":"I can explain patterns when multiplying and dividing by powers of 10.","skills":["math.pk.multiplying_a_decimal_by_a_power_of_ten","math.pk.dividing_by_powers_of_ten","math.pk.multiplication_patterns_over"]},
 "K-Math-D9-C2-A":{"standards":["5.NBT.A.2"],"iCan":"I can explain patterns when multiplying and dividing by powers of 10.","skills":["math.pk.multiplying_a_decimal_by_a_power_of_ten","math.pk.dividing_by_powers_of_ten","math.pk.multiplication_patterns_over"]},
 "K-Math-D9-C3-L1":{"standards":["5.NBT.A.2"],"iCan":"I can explain patterns when multiplying and dividing by powers of 10.","skills":["math.pk.multiplying_a_decimal_by_a_power_of_ten","math.pk.dividing_by_powers_of_ten","math.pk.multiplication_patterns_over"]},
 "K-Science-D1-C1-A":{"standards":[],"iCan":"","skills":[]},
 "K-Science-D1-C2-A":{"standards":[],"iCan":"","skills":[]},
 "K-Science-D1-C3-A":{"standards":[],"iCan":"","skills":[]},
 "K-Science-D1-C4-A":{"standards":[],"iCan":"","skills":[]},
 "K-Science-D10-C1-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my designs fairly to see what works and what doesn't so I can make my model better.","skills":["sci.fair_test"]},
 "K-Science-D10-C2-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my designs fairly to see what works and what doesn't so I can make my model better.","skills":["sci.fair_test"]},
 "K-Science-D10-C3-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my designs fairly to see what works and what doesn't so I can make my model better.","skills":["sci.fair_test"]},
 "K-Science-D10-C4-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my designs fairly to see what works and what doesn't so I can make my model better.","skills":["sci.fair_test"]},
 "K-Science-D11-C1-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D11-C2-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D11-C3-L1":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D11-C4-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D12-C1-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D12-C2-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D12-C3-L1":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D12-C4-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D13-C1-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D13-C2-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D13-C3-L1":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D13-C4-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D14-C1-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D14-C2-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D14-C3-L1":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D14-C4-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D15-C1-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D15-C2-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D15-C3-L1":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D15-C4-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D16-C1-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D16-C2-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D16-C3-L1":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D16-C4-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D17-C1-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D17-C2-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D17-C3-L1":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D17-C4-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D18-C1-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D18-C2-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D18-C3-L1":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D18-C4-A":{"standards":["5-PS3-1"],"iCan":"I can use models to show that the energy in the food animals eat (which helps them grow, move, and stay warm) originally came from the sun.","skills":["sci.food_energy"]},
 "K-Science-D19-C1-A":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D19-C2-A":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D19-C3-L1":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D19-C4-A":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D2-C1-A":{"standards":[],"iCan":"","skills":[]},
 "K-Science-D2-C2-A":{"standards":[],"iCan":"","skills":[]},
 "K-Science-D2-C3-A":{"standards":[],"iCan":"","skills":[]},
 "K-Science-D2-C4-A":{"standards":[],"iCan":"","skills":[]},
 "K-Science-D20-C1-A":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D20-C2-A":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D20-C3-L1":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D20-C4-A":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D21-C1-A":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D21-C2-A":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D21-C3-L1":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D21-C4-A":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D22-C1-A":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D22-C2-A":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D22-C3-A":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D22-C4-A":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D23-C1-A":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D23-C2-A":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D23-C3-L1":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D23-C4-A":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D24-C1-A":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D24-C2-A":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D24-C3-A":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D24-C4-L1":{"standards":["5-LS1-1"],"iCan":"I can show that plants get the materials they need to grow mostly from the air and water.","skills":["sci.plant_materials"]},
 "K-Science-D25-C1-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D25-C2-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D25-C3-L1":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D25-C4-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D26-C1-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D26-C2-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D26-C3-L1":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D26-C4-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D27-C1-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D27-C2-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D27-C3-L1":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D27-C4-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D28-C1-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D28-C2-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D28-C3-L1":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D28-C4-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D29-C1-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D29-C2-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D29-C3-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D29-C4-L1":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D3-C1-A":{"standards":["3-5 ETS1-1"],"iCan":"I can define a simple design problem that includes what I need to succeed and what limits I have on materials, time, or cost.","skills":["sci.design_problem"]},
 "K-Science-D3-C2-A":{"standards":["3-5 ETS1-1"],"iCan":"I can define a simple design problem that includes what I need to succeed and what limits I have on materials, time, or cost.","skills":["sci.design_problem"]},
 "K-Science-D3-C3-L1":{"standards":["3-5 ETS1-1"],"iCan":"I can define a simple design problem that includes what I need to succeed and what limits I have on materials, time, or cost.","skills":["sci.design_problem"]},
 "K-Science-D3-C4-A":{"standards":["3-5 ETS1-1"],"iCan":"I can define a simple design problem that includes what I need to succeed and what limits I have on materials, time, or cost.","skills":["sci.design_problem"]},
 "K-Science-D30-C1-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D30-C2-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D30-C3-L1":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D30-C4-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D31-C1-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D31-C2-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D31-C3-L1":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D31-C4-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D32-C1-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D32-C2-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D32-C3-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D32-C4-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D33-C1-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D33-C2-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D33-C3-L1":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D33-C4-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D34-C1-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D34-C2-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D34-C3-L1":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D34-C4-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D35-C1-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D35-C2-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D35-C3-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D35-C4-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D36-C1-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D36-C2-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D36-C3-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D36-C4-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D37-C1-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D37-C2-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D37-C3-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D37-C4-A":{"standards":["5-LS2-1"],"iCan":"I can develop a model to show how matter moves between plants, animals, decomposers, and the environment.","skills":["sci.matter_movement"]},
 "K-Science-D38-C1-A":{"standards":[],"iCan":"","skills":[]},
 "K-Science-D38-C2-A":{"standards":[],"iCan":"","skills":[]},
 "K-Science-D38-C3-A":{"standards":[],"iCan":"","skills":[]},
 "K-Science-D39-C1-A":{"standards":[],"iCan":"","skills":[]},
 "K-Science-D39-C2-A":{"standards":[],"iCan":"","skills":[]},
 "K-Science-D39-C3-A":{"standards":[],"iCan":"","skills":[]},
 "K-Science-D4-C1-A":{"standards":["3-5 ETS1-1"],"iCan":"I can define a simple design problem that includes what I need to succeed and what limits I have on materials, time, or cost.","skills":["sci.design_problem"]},
 "K-Science-D4-C2-A":{"standards":["3-5 ETS1-1"],"iCan":"I can define a simple design problem that includes what I need to succeed and what limits I have on materials, time, or cost.","skills":["sci.design_problem"]},
 "K-Science-D4-C3-L1":{"standards":["3-5 ETS1-1"],"iCan":"I can define a simple design problem that includes what I need to succeed and what limits I have on materials, time, or cost.","skills":["sci.design_problem"]},
 "K-Science-D4-C4-A":{"standards":["3-5 ETS1-1"],"iCan":"I can define a simple design problem that includes what I need to succeed and what limits I have on materials, time, or cost.","skills":["sci.design_problem"]},
 "K-Science-D40-C1-A":{"standards":[],"iCan":"","skills":[]},
 "K-Science-D40-C2-A":{"standards":[],"iCan":"","skills":[]},
 "K-Science-D40-C3-A":{"standards":[],"iCan":"","skills":[]},
 "K-Science-D5-C1-A":{"standards":["3-5 ETS1-1","3-5 ETS1-2"],"iCan":"I can define a simple design problem that includes what I need to succeed and what limits I have on materials, time, or cost.","skills":["sci.design_problem","sci.compare_solutions"]},
 "K-Science-D5-C2-A":{"standards":["3-5 ETS1-1","3-5 ETS1-2"],"iCan":"I can define a simple design problem that includes what I need to succeed and what limits I have on materials, time, or cost.","skills":["sci.design_problem","sci.compare_solutions"]},
 "K-Science-D5-C3-L1":{"standards":["3-5 ETS1-1","3-5 ETS1-2"],"iCan":"I can define a simple design problem that includes what I need to succeed and what limits I have on materials, time, or cost.","skills":["sci.design_problem","sci.compare_solutions"]},
 "K-Science-D5-C4-A":{"standards":["3-5 ETS1-1","3-5 ETS1-2"],"iCan":"I can define a simple design problem that includes what I need to succeed and what limits I have on materials, time, or cost.","skills":["sci.design_problem","sci.compare_solutions"]},
 "K-Science-D6-C1-A":{"standards":["3-5 ETS1-2"],"iCan":"I can come up with and compare different solutions to a problem to see which one works best.","skills":["sci.compare_solutions"]},
 "K-Science-D6-C2-A":{"standards":["3-5 ETS1-2"],"iCan":"I can come up with and compare different solutions to a problem to see which one works best.","skills":["sci.compare_solutions"]},
 "K-Science-D6-C3-L1":{"standards":["3-5 ETS1-2"],"iCan":"I can come up with and compare different solutions to a problem to see which one works best.","skills":["sci.compare_solutions"]},
 "K-Science-D6-C4-A":{"standards":["3-5 ETS1-2"],"iCan":"I can come up with and compare different solutions to a problem to see which one works best.","skills":["sci.compare_solutions"]},
 "K-Science-D7-C1-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my designs fairly to see what works and what doesn't so I can make my model better.","skills":["sci.fair_test"]},
 "K-Science-D7-C2-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my designs fairly to see what works and what doesn't so I can make my model better.","skills":["sci.fair_test"]},
 "K-Science-D7-C3-L1":{"standards":["3-5 ETS1-3"],"iCan":"I can test my designs fairly to see what works and what doesn't so I can make my model better.","skills":["sci.fair_test"]},
 "K-Science-D7-C4-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my designs fairly to see what works and what doesn't so I can make my model better.","skills":["sci.fair_test"]},
 "K-Science-D8-C1-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my designs fairly to see what works and what doesn't so I can make my model better.","skills":["sci.fair_test"]},
 "K-Science-D8-C2-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my designs fairly to see what works and what doesn't so I can make my model better.","skills":["sci.fair_test"]},
 "K-Science-D8-C3-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my designs fairly to see what works and what doesn't so I can make my model better.","skills":["sci.fair_test"]},
 "K-Science-D8-C4-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my designs fairly to see what works and what doesn't so I can make my model better.","skills":["sci.fair_test"]},
 "K-Science-D9-C1-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my designs fairly to see what works and what doesn't so I can make my model better.","skills":["sci.fair_test"]},
 "K-Science-D9-C2-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my designs fairly to see what works and what doesn't so I can make my model better.","skills":["sci.fair_test"]},
 "K-Science-D9-C3-L1":{"standards":["3-5 ETS1-3"],"iCan":"I can test my designs fairly to see what works and what doesn't so I can make my model better.","skills":["sci.fair_test"]},
 "K-Science-D9-C4-A":{"standards":["3-5 ETS1-3"],"iCan":"I can test my designs fairly to see what works and what doesn't so I can make my model better.","skills":["sci.fair_test"]}
};
const DW_CURRIC_ITEMS=[{"id":"I-HUM-D1-C1-A","grade":"I","day":1,"subject":"HUM","strand":"Foundational Skills","requirement":"Welcome day: Getting to know you, routines, procedures, rules, set up journals, etc"},{"id":"I-HUM-D1-C2-A","grade":"I","day":1,"subject":"HUM","strand":"Reading","requirement":"Welcome day: Getting to know you, routines, procedures, rules, set up journals, etc"},{"id":"I-HUM-D1-C3-A","grade":"I","day":1,"subject":"HUM","strand":"Writing","requirement":"Welcome day: Getting to know you, routines, procedures, rules, set up journals, etc"},{"id":"I-HUM-D1-C4-A","grade":"I","day":1,"subject":"HUM","strand":"Social Studies and SEL","requirement":"Welcome day: Getting to know you, routines, procedures, rules, set up journals, etc"},{"id":"I-HUM-D2-C1-A","grade":"I","day":2,"subject":"HUM","strand":"Foundational Skills","requirement":"Flavor First Day"},{"id":"I-HUM-D2-C2-A","grade":"I","day":2,"subject":"HUM","strand":"Reading","requirement":"Flavor First Day"},{"id":"I-HUM-D2-C3-A","grade":"I","day":2,"subject":"HUM","strand":"Writing","requirement":"Flavor First Day"},{"id":"I-HUM-D2-C4-A","grade":"I","day":2,"subject":"HUM","strand":"Social Studies and SEL","requirement":"Flavor First Day"},{"id":"I-HUM-D3-C1-L1","grade":"I","day":3,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nform\n\nWord\nformat\n\nVideo\nMorphology 1 Q1 Lesson 1.1 format"},{"id":"I-HUM-D3-C2-L1","grade":"I","day":3,"subject":"HUM","strand":"Reading","requirement":"Meet the Characters\nVideo: Understanding a character through their thoughts, words, and actions\nI Q1 Reading Comprehension, Day 3 Character Introduction\n\nIn Class: Begin class novel study. Identify a character’s thoughts, words, and actions to draw conclusions about a character’s traits."},{"id":"I-HUM-D3-C3-L1","grade":"I","day":3,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nJournal Journeys\n\nVideo:\n\nIn Class:\n\nVideo:\nI Q1 Language and Writing, Day 3 Journal and capitalization\n-Capitalization Review\n-TAP\n-Journal Writing\n\nIn Class:\nMake an anchor chart with the students for TAP\nTask\nAudience\nPurpose"},{"id":"I-HUM-D4-C1-L1","grade":"I","day":4,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nform\n\nWord\nformation\n\nVideo\nMorphology 1 Q1 Lesson 1.2 formation"},{"id":"I-HUM-D4-C2-L1","grade":"I","day":4,"subject":"HUM","strand":"Reading","requirement":"Meet the Characters\nVideo: What motivates a character?\nI Q1 Reading Comprehension, Day 4 What Motivates a Character\n\nIn Class: Look for what motivates a character in the novel study."},{"id":"I-HUM-D4-C3-L1","grade":"I","day":4,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nJournal Journeys\n\nVideo:\nI Q1 Language and Writing, Day 4 Peer Review and capitalization\n-Capitalization Review\n-Peer Reviews using PQP\n\nIn Class:\nMake an anchor chart for PQP \nPraise “I like the way you..”\nQuestion: “I wonder why you…”\nPolish: “If I were you, I would…”"},{"id":"I-HUM-D5-C1-L1","grade":"I","day":5,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nform\n\nWord\nconform\n\nVideo\nMorphology 1 Q1 Lesson 1.3 conform"},{"id":"I-HUM-D5-C2-L1","grade":"I","day":5,"subject":"HUM","strand":"Reading","requirement":"Meet the Characters\nVideo: Setting and Events affect characters\nI Q1 Reading Comprehension, Day 5 Setting and events affect a character\n\nIn Class: Look for ways that the setting and events affect the characters in the novel study."},{"id":"I-HUM-D5-C3-L1","grade":"I","day":5,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nJournal Journeys\n\nVideo:\nI Q1 Language and Writing, Day 5 Journal and end marks\n-end mark review\n-TAP\n-Journal Writing\n\nIn Class:\nHave students edit their journal entry for capitalization and end marks."},{"id":"I-HUM-D6-C1-L1","grade":"I","day":6,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nform\n\nWord\ninform\n\nVideo\nMorphology 1 Q1 Lesson 1.4 inform"},{"id":"I-HUM-D6-C2-L1","grade":"I","day":6,"subject":"HUM","strand":"Reading","requirement":"Meet the Characters\nVideo: Review how to cite text to answer questions about character, setting, and events\nI Q1 Reading Comprehension, Day 6 Citing evidence\n\nIn Class: Practice citing text when answering questions about the novel study."},{"id":"I-HUM-D6-C3-L1","grade":"I","day":6,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nJournal Journeys\n\nVideo:\nI Q1 Language and Writing, Day 6 peer review and end marks\n-Capitalization Review\n-Peer Reviews using PQP\n\nIn Class:\nStudents should reflect and refine their journal writing based on their peer review."},{"id":"I-HUM-D7-C1-A","grade":"I","day":7,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills: Progress Monitor\n-Listen to students read"},{"id":"I-HUM-D7-C2-A","grade":"I","day":7,"subject":"HUM","strand":"Reading","requirement":"Fluency: Give students decodable texts read so far this year, and have students partner read to improve fluency."},{"id":"I-HUM-D7-C3-A","grade":"I","day":7,"subject":"HUM","strand":"Writing","requirement":"Cursive:\n\nProgress Monitoring Dictation\nWords: \nformat, formation, conform, inform\nSentences:\nBe sure to inform your teacher if you need extra help with your work.\nThe geese flew in a V-shaped formation as they traveled south."},{"id":"I-HUM-D8-C1-L1","grade":"I","day":8,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nport\n\nWord\nexports\n\nVideo\nMorphology 1 Q1 Lesson 2.1 exports"},{"id":"I-HUM-D8-C2-L1","grade":"I","day":8,"subject":"HUM","strand":"Reading","requirement":"Meaning Masters\nVideo: paraphrasing information from a text and a video clip\nI Q1 Reading Comprehension Day 8 paraphrase information in your own words\n\nIn Class: Practice paraphrasing parts of the novel study."},{"id":"I-HUM-D8-C3-L1","grade":"I","day":8,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nWould You Rather: Writing Edition\n\nVideo: \nI Q1 Language and Writing Day 8: commas in a series, opinion statements\n-Commas in a series\n-Opinion statements\n\nIn Class:\n-Review commas in a series and opinion statements. Play a few rounds of Would You Rather to practice orally forming opinion sentences."},{"id":"I-HUM-D9-C1-L1","grade":"I","day":9,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nport\n\nWord\ntransportation\n\nVideo\nMorphology 1 Q1 Lesson 2.2 transportation"},{"id":"I-HUM-D9-C2-L1","grade":"I","day":9,"subject":"HUM","strand":"Reading","requirement":"Meaning Masters\nVideo:\nCompare an illustration to a text.\nI Q1 Reading Comprehension Day 9 Comparing illustrations to text\n\nIn Class:\nHow do illustrations help us understand a text?"},{"id":"I-HUM-D9-C3-L1","grade":"I","day":9,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nWould You Rather: Writing Edition\n\nVideo: \nI Q1 Language and Writing Day 9: commas in a series, opinion statements\n-Commas in a series\n-Opinion sentences.\n\nIn Class:\n-Make an anchor chart of opinion sentence stems"},{"id":"I-HUM-D10-C1-L1","grade":"I","day":10,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nport\n\nWord\nportable\n\nVideo\nMorphology 1 Q1 Lesson 2.3 portable"},{"id":"I-HUM-D10-C2-L1","grade":"I","day":10,"subject":"HUM","strand":"Reading","requirement":"Meaning Masters\nVideo:\nCompare a text to a graphic novel\nI Q1 Reading Comprehension Day 10 Comparing text to a graphic novel\n\nIn Class:\nCan the format of a text help our understanding? \nStudents can try illustrating a comic strip based on the novel study."},{"id":"I-HUM-D10-C3-L1","grade":"I","day":10,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nWould You Rather: Writing Edition\n\nVideo: \n I Q1 Language and Writing Day10: commas in quotations, opinion evidence\n-Commas and quotation marks in dialogue and quotations\n-Evidence sentences using sentence stems\n\nIn Class:\n-Practice commas and quotations in dialogue writing and quotations\n-Make an anchor chart of evidence sentence stems"},{"id":"I-HUM-D11-C1-L1","grade":"I","day":11,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nport\n\nWord\nreporting\n\nVideo\nMorphology 1 Q1 Lesson 2.4 reporting"},{"id":"I-HUM-D11-C2-L1","grade":"I","day":11,"subject":"HUM","strand":"Reading","requirement":"Meaning Masters\nVideo:\nComparing a poem to a text\nI Q1 Reading Comprehension Day 11 Text and Poetry\n\nIn Class:\nWhen would a poem be more effective than a text? Students can turn a section of the novel study into a poem."},{"id":"I-HUM-D11-C3-L1","grade":"I","day":11,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nWould You Rather: Writing Edition\n\nVideo: \n I Q1 Language and Writing Day1 1: commas in quotations, opinion evidence\n-Commas and quotation marks in dialogue and quotations\n-Evidence sentences using sentence stems\n\nIn Class:\n-Practice commas and quotations in dialogue writing and quotations\n-Play a round of Would you Rather, and have students write their opinion supported with two supporting sentences."},{"id":"I-HUM-D12-C1-A","grade":"I","day":12,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills: Progress Monitor"},{"id":"I-HUM-D12-C2-A","grade":"I","day":12,"subject":"HUM","strand":"Reading","requirement":"Fluency: Give students decodable texts read so far this year, and have students partner read to improve fluency."},{"id":"I-HUM-D12-C3-A","grade":"I","day":12,"subject":"HUM","strand":"Writing","requirement":"Cursive:\n\nProgress Monitoring\nWords:\nSentences:"},{"id":"I-HUM-D13-C1-L1","grade":"I","day":13,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nscrib/script\n\nWord\ndescription\n\nVideo\nMorphology 1 Q1 Lesson 3.1 description"},{"id":"I-HUM-D13-C2-L1","grade":"I","day":13,"subject":"HUM","strand":"Reading","requirement":"Who’s Telling the Story?\nVideo:\nUnderstanding and identifying a narrator.\nI Q1 Reading Comprehension Point of View day 13 Meet the Narrator\n\nIn Class:\nNovel study: Who is the narrator in the novel? Is the narrator a character or someone from the outside?"},{"id":"I-HUM-D13-C3-L1","grade":"I","day":13,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nBuild It, Expand It, Prove It!\n\nVideo:\nI Q1 Build It Expand It Prove It Day 13: Simple sentences, opinion conclusions\n-Simple sentences\n-Subjects\n-Predicates\n-Conclusion Sentences\n\nIn Class:\n-Build silly sentences together by combining random subjects and predicates\n-Practice oral or written conclusion sentences"},{"id":"I-HUM-D14-C1-L1","grade":"I","day":14,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nscrib/script\n\nWord\nprescribe\n\nVideo\nMorphology 1 Q1 Lesson 3.2 prescribe"},{"id":"I-HUM-D14-C2-L1","grade":"I","day":14,"subject":"HUM","strand":"Reading","requirement":"Who’s Telling the Story?\nVideo:\nFirst or third person point of view\n I Q1 Reading Comprehension Point of View day 14 First or Third Person?\n\nIn Class:\nWhat point of view is the novel told in? How do you know? Look for the pronouns."},{"id":"I-HUM-D14-C3-L1","grade":"I","day":14,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nBuild It, Expand It, Prove It!\n\nVideo:\nI Q1 Build It Expand It Prove It Day 14: FANBOYS, opinion conclusions\n-Conjunctions\n-FANBOYS\n-Conclusion sentences\n\nIn Class\n-Make an anchor chart for FANBOYS\n-Continue to practice conclusion sentences, or analyze conclusion sentences in a mentor text."},{"id":"I-HUM-D15-C1-L1","grade":"I","day":15,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nscrib/script\n\nWord\nsubscription\n\nVideo\nMorphology 1 Q1 Lesson 3.3 subscription"},{"id":"I-HUM-D15-C2-L1","grade":"I","day":15,"subject":"HUM","strand":"Reading","requirement":"Who’s Telling the Story?\nVideo:\n I Q1 Reading Comprehension Point of View day 15 two stories, two point of view\n\nIn Class:\nHow would the novel be different if it were written from a different narrator’s point of view? How does narration affect a story?"},{"id":"I-HUM-D15-C3-L1","grade":"I","day":15,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nBuild It, Expand It, Prove It!\nStudents will need a copy of the graphic organizer during the video lesson.\nVideo:\n I Q1 Build It Expand It Prove It Day 15: compound sentences, opinion conclusions\n-Compound sentences\n-Opinion writing graphic organizer\n\nIn Class:\n-Review compound sentences and practice as needed.\n-Use extra time to complete the graphic organizer in class. \nOpinion Writing Graphic Organizer"},{"id":"I-HUM-D15-C3-L2","grade":"I","day":15,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nBuild It, Expand It, Prove It!\nStudents will need a copy of the graphic organizer during the video lesson.\nVideo:\n I Q1 Build It Expand It Prove It Day 15: compound sentences, opinion conclusions\n-Compound sentences\n-Opinion writing graphic organizer\n\nIn Class:\n-Review compound sentences and practice as needed.\n-Use extra time to complete the graphic organizer in class. \nOpinion Writing Graphic Organizer"},{"id":"I-HUM-D16-C1-L1","grade":"I","day":16,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nscrib/script\n\nWord\nmanuscript\n\nVideo\nMorphology 1 Q1 Lesson 3.4 manuscript"},{"id":"I-HUM-D16-C2-L1","grade":"I","day":16,"subject":"HUM","strand":"Reading","requirement":"Who’s Telling the Story?\nVideo:\nComparing point of view across texts. Why does point of view matter?\n I Q1 Reading Comprehension Point of View day 16 Point of View Dectective\n\nIn Class:\nWhy does point of view matter? Try rewriting a scene from the novel study in another point of view."},{"id":"I-HUM-D16-C3-L1","grade":"I","day":16,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nBuild It, Expand It, Prove It!\n\nVideo:\nI Q1 Build It Expand It Prove It Day 16: compound sentences, opinion conclusions\n-Compound sentences\n-Writing community, giving PQP feedback to peers\n\nIn Class:\n-Allow students time to reflect and refine their graphic organizers as needed."},{"id":"I-HUM-D17-C1-A","grade":"I","day":17,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills: Progress Monitor"},{"id":"I-HUM-D17-C2-A","grade":"I","day":17,"subject":"HUM","strand":"Reading","requirement":"Fluency: Give students decodable texts read so far this year, and have students partner read to improve fluency."},{"id":"I-HUM-D17-C3-A","grade":"I","day":17,"subject":"HUM","strand":"Writing","requirement":"Cursive:\n\nProgress Monitoring\nWords:\nSentences:"},{"id":"I-HUM-D18-C1-L1","grade":"I","day":18,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nspec/spect\n\nWord\ninspector \n\nVideo\nMorphology 1 Q1 Lesson 4.1 inspector"},{"id":"I-HUM-D18-C2-L1","grade":"I","day":18,"subject":"HUM","strand":"Reading","requirement":"Read Between the Lines\nVideo:\nIntroduction to inference\nI Q1 Reading Comprehension Day 18 Read between the lines: clues + thinking = inference\n\nIn Class:\nSelect a paragraph from the novel study and practice making an inference."},{"id":"I-HUM-D18-C3-L1","grade":"I","day":18,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nReady, Set, Publish!\n\nVideo:\nI Q1 Ready, Set, Publish Day 18 opinion rough draft\n-opinion paragraph rough draft\n-sentence editing\n\nIn Class\n-Provide time for rough draft writing. Teacher conferencing can start as soon as students are ready."},{"id":"I-HUM-D19-C1-L1","grade":"I","day":19,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nspec/spect\n\nWord\nspectator \n\nVideo\nMorphology 1 Q1 Lesson 4.2 spectator"},{"id":"I-HUM-D19-C2-L1","grade":"I","day":19,"subject":"HUM","strand":"Reading","requirement":"Read Between the Lines\nVideo:\nMaking an inference about a character\nQ1 Reading Comprehension Day 19 Read between the lines: Forming a Perspective\n\nIn Class:\nPractice making an inference about a character in the novel study."},{"id":"I-HUM-D19-C3-L1","grade":"I","day":19,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nReady, Set, Publish!\n\nVideo:\nI Q1 Ready, Set, Publish Day 19 Writing community\n-Sentence editing\n-Writing community\n\nIn Class\n-Continue to conference with students\n-Allow for time for students to reflect and refine their work based on the feedback they received in the writing community."},{"id":"I-HUM-D20-C1-L1","grade":"I","day":20,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nspec/spect\n\nWord\nrespect\n\nVideo\nMorphology 1 Q1 Lesson 4.3 respect"},{"id":"I-HUM-D20-C2-L1","grade":"I","day":20,"subject":"HUM","strand":"Reading","requirement":"Read Between the Lines\nVideo:\nCiting evidence to support an inference\nQ1 Reading Comprehension Day 20 Read between the lines: Supporting Conclusions\n\nIn Class:\nPractice finding evidence in a text to support an inference."},{"id":"I-HUM-D20-C3-L1","grade":"I","day":20,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nReady, Set, Publish!\n\nVideo:\n I Q1 Ready, Set, Publish Day 20 Writing community\n-Sentence editing\n-Final Copy\n\nIn Class\n-Allow time for students to publish their final copy of their opinion paragraph. Begin presentations as time allows"},{"id":"I-HUM-D21-C1-A","grade":"I","day":21,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nstruc/struct\n\nWord\nspectacular \n\nVideo"},{"id":"I-HUM-D21-C2-L1","grade":"I","day":21,"subject":"HUM","strand":"Reading","requirement":"Read Between the Lines\nVideo:\nUsing text evidence to support an inference\nQ1 Reading Comprehension Day 21 Read between the lines: Evidence Detective\n\nIn Class:\nPractice using text evidence when supporting an inference and use quotation marks."},{"id":"I-HUM-D21-C3-A","grade":"I","day":21,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nReady, Set, Publish!\n\nNo video today. Use the time for students to present and share their work."},{"id":"I-HUM-D22-C1-A","grade":"I","day":22,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills: Progress Monitor"},{"id":"I-HUM-D22-C2-A","grade":"I","day":22,"subject":"HUM","strand":"Reading","requirement":"Fluency: Give students decodable texts read so far this year, and have students partner read to improve fluency."},{"id":"I-HUM-D22-C3-A","grade":"I","day":22,"subject":"HUM","strand":"Writing","requirement":"Cursive:\n\nProgress Monitoring\nWords:\nSentences:"},{"id":"I-HUM-D23-C1-A","grade":"I","day":23,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nstruc/struct\n\nWord\ninstruct\n\nVideo"},{"id":"I-HUM-D23-C3-A","grade":"I","day":23,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"I-HUM-D24-C1-A","grade":"I","day":24,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nstruc/struct\n\nWord\nreconstruction\n\nVideo"},{"id":"I-HUM-D24-C3-A","grade":"I","day":24,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"I-HUM-D25-C1-A","grade":"I","day":25,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nstruc/struct\n\nWord\ndestructive\n\nVideo"},{"id":"I-HUM-D25-C3-A","grade":"I","day":25,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"I-HUM-D26-C1-A","grade":"I","day":26,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nstruc/struct\n\nWord\ninstrument\n\nVideo"},{"id":"I-HUM-D26-C3-A","grade":"I","day":26,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"I-HUM-D27-C1-A","grade":"I","day":27,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills: Progress Monitor"},{"id":"I-HUM-D27-C2-A","grade":"I","day":27,"subject":"HUM","strand":"Reading","requirement":"Fluency: Give students decodable texts read so far this year, and have students partner read to improve fluency."},{"id":"I-HUM-D27-C3-A","grade":"I","day":27,"subject":"HUM","strand":"Writing","requirement":"Cursive:\n\nProgress Monitoring\nWords:\nSentences:"},{"id":"I-HUM-D28-C1-A","grade":"I","day":28,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nflect/flex\n\nWord\ndeflect\n\nVideo"},{"id":"I-HUM-D28-C3-A","grade":"I","day":28,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"I-HUM-D29-C1-A","grade":"I","day":29,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nflect/flex\n\nWord\nreflex\n\nVideo"},{"id":"I-HUM-D29-C3-A","grade":"I","day":29,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"I-HUM-D30-C1-A","grade":"I","day":30,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nflect/flex\n\nWord\nflexibility\n\nVideo"},{"id":"I-HUM-D30-C3-A","grade":"I","day":30,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"I-HUM-D31-C1-A","grade":"I","day":31,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\nflect/flex\n\nWord\nreflective\n\nVideo"},{"id":"I-HUM-D31-C3-A","grade":"I","day":31,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"I-HUM-D32-C1-A","grade":"I","day":32,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills: Progress Monitor"},{"id":"I-HUM-D32-C2-A","grade":"I","day":32,"subject":"HUM","strand":"Reading","requirement":"Fluency: Give students decodable texts read so far this year, and have students partner read to improve fluency."},{"id":"I-HUM-D32-C3-A","grade":"I","day":32,"subject":"HUM","strand":"Writing","requirement":"Cursive:\n\nProgress Monitoring\nWords:\nSentences:"},{"id":"I-HUM-D33-C1-A","grade":"I","day":33,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\ndic/dict\n\nWord\ndictate\n\nVideo"},{"id":"I-HUM-D33-C3-A","grade":"I","day":33,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"I-HUM-D34-C1-A","grade":"I","day":34,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\ndic/dict\n\nWord\ncontradict\n\nVideo"},{"id":"I-HUM-D34-C3-A","grade":"I","day":34,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"I-HUM-D35-C1-A","grade":"I","day":35,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\ndic/dict\n\nWord\npredict\n\nVideo"},{"id":"I-HUM-D35-C3-A","grade":"I","day":35,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"I-HUM-D36-C1-A","grade":"I","day":36,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMophoeme\ndic/dict\n\nWord\ndictator\n\nVideo"},{"id":"I-HUM-D36-C3-A","grade":"I","day":36,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"I-HUM-D37-C1-A","grade":"I","day":37,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills: Progress Monitor"},{"id":"I-HUM-D37-C2-A","grade":"I","day":37,"subject":"HUM","strand":"Reading","requirement":"Fluency: Give students decodable texts read so far this year, and have students partner read to improve fluency."},{"id":"I-HUM-D37-C3-A","grade":"I","day":37,"subject":"HUM","strand":"Writing","requirement":"Cursive:\n\nProgress Monitoring\nWords:\nSentences:"},{"id":"I-HUM-D38-C1-A","grade":"I","day":38,"subject":"HUM","strand":"Foundational Skills","requirement":"Flavor Assessment"},{"id":"I-HUM-D38-C2-A","grade":"I","day":38,"subject":"HUM","strand":"Reading","requirement":"Flavor Assessment"},{"id":"I-HUM-D38-C3-A","grade":"I","day":38,"subject":"HUM","strand":"Writing","requirement":"Flavor Assessment"},{"id":"I-HUM-D38-C4-A","grade":"I","day":38,"subject":"HUM","strand":"Social Studies and SEL","requirement":"Flavor Assessment"},{"id":"I-HUM-D39-C1-A","grade":"I","day":39,"subject":"HUM","strand":"Foundational Skills","requirement":"Core Assessment"},{"id":"I-HUM-D39-C2-A","grade":"I","day":39,"subject":"HUM","strand":"Reading","requirement":"Core Assessment"},{"id":"I-HUM-D39-C3-A","grade":"I","day":39,"subject":"HUM","strand":"Writing","requirement":"Core Assessment"},{"id":"I-HUM-D39-C4-A","grade":"I","day":39,"subject":"HUM","strand":"Social Studies and SEL","requirement":"Core Assessment"},{"id":"I-HUM-D40-C1-A","grade":"I","day":40,"subject":"HUM","strand":"Foundational Skills","requirement":"Review, Reteach, and Extend"},{"id":"I-HUM-D40-C2-A","grade":"I","day":40,"subject":"HUM","strand":"Reading","requirement":"Review, Reteach, and Extend"},{"id":"I-HUM-D40-C3-A","grade":"I","day":40,"subject":"HUM","strand":"Writing","requirement":"Review, Reteach, and Extend"},{"id":"I-HUM-D40-C4-A","grade":"I","day":40,"subject":"HUM","strand":"Social Studies and SEL","requirement":"Review, Reteach, and Extend"},{"id":"K-HUM-D1-C1-A","grade":"K","day":1,"subject":"HUM","strand":"Foundational Skills","requirement":"Welcome day: Getting to know you, routines, procedures, rules, etc"},{"id":"K-HUM-D1-C2-A","grade":"K","day":1,"subject":"HUM","strand":"Reading","requirement":"Welcome day: Getting to know you, routines, procedures, rules, etc"},{"id":"K-HUM-D1-C3-A","grade":"K","day":1,"subject":"HUM","strand":"Writing","requirement":"Welcome day: Getting to know you, routines, procedures, rules, etc"},{"id":"K-HUM-D1-C4-A","grade":"K","day":1,"subject":"HUM","strand":"Social Studies and SEL","requirement":"Welcome day: Getting to know you, routines, procedures, rules, etc"},{"id":"K-HUM-D2-C1-A","grade":"K","day":2,"subject":"HUM","strand":"Foundational Skills","requirement":"Flavor First Day"},{"id":"K-HUM-D2-C2-A","grade":"K","day":2,"subject":"HUM","strand":"Reading","requirement":"Flavor First Day"},{"id":"K-HUM-D2-C3-A","grade":"K","day":2,"subject":"HUM","strand":"Writing","requirement":"Flavor First Day"},{"id":"K-HUM-D2-C4-A","grade":"K","day":2,"subject":"HUM","strand":"Social Studies and SEL","requirement":"Flavor First Day"},{"id":"K-HUM-D3-C1-L1","grade":"K","day":3,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\ncede/cess/ceed\n\nWord\nconceded\n\nVideo\nMorphology K Q1 Lesson 1.1 conceded"},{"id":"K-HUM-D3-C2-L1","grade":"K","day":3,"subject":"HUM","strand":"Reading","requirement":"Meet the Characters\nVideo: Some stories have more than one character and setting\nK Q1 Reading Comprehension, Day 3 character introduction\n\nIn class: Begin work on class novel. As the class reads the first chapters, identify the multiple characters and settings."},{"id":"K-HUM-D3-C3-L1","grade":"K","day":3,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nJournal Journeys\n\nVideo:\nK Q1 Language and Writing, Day 3 Journal and capitalization\n-Capitalization rules and practice\n-TAP\n-Journal writing\n\nIn Class:\nMake an anchor chart with the students for TAP\nTask\nAudience\nPurpose"},{"id":"K-HUM-D4-C1-L1","grade":"K","day":4,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\ncede/cess/ceed\n\nWord\nprocession\n\nVideo\nMorphology K Q1 Lesson 1.2 procession"},{"id":"K-HUM-D4-C2-L1","grade":"K","day":4,"subject":"HUM","strand":"Reading","requirement":"Meet the Characters\nVideo: Comparing two characters.\nK Q1 Reading Comprehension, Day 4 Comparing Characters\n\nIn Class: Compare and contrast two characters in the class novel study."},{"id":"K-HUM-D4-C3-L1","grade":"K","day":4,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nJournal Journeys\nVideo:\n K Q1 Language and Writing, Day 4 Peer Review and capitalization\n-Capitalization Review\n-Peer Reviews using PQP\n\nIn Class:\nMake an anchor chart for PQP \nPraise “I like the way you..”\nQuestion: “I wonder why you…”\nPolish: “If I were you, I would…”"},{"id":"K-HUM-D5-C1-L1","grade":"K","day":5,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\ncede/cess/ceed\n\nWord\npreceding\n\nVideo\nMorphology K Q1 Lesson 1.3 preceding"},{"id":"K-HUM-D5-C2-L1","grade":"K","day":5,"subject":"HUM","strand":"Reading","requirement":"Meet the Characters\nVideo: The setting and events affect the characters\nK Q1 Reading Comprehension, Day 5 Setting and Events\n\nIn Class: Look for evidence of ways the setting and events affect the characters in the novel study."},{"id":"K-HUM-D5-C3-L1","grade":"K","day":5,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nJournal Journeys\n\nVideo:\nK Q1 Language and Writing, Day 5 Journal and end marks\n-end mark review\n-TAP\n-Journal Writing\n\nIn Class:\nHave students edit their journal entry for capitalization and end marks."},{"id":"K-HUM-D6-C1-L1","grade":"K","day":6,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\ncede/cess/ceed\n\nWord\nrecess\n\nVideo\nMorphology K Q1 Lesson 1.4 recess"},{"id":"K-HUM-D6-C2-L1","grade":"K","day":6,"subject":"HUM","strand":"Reading","requirement":"Meet the Characters\nVideo: Review how to cite text to answer questions about character, setting, and events\nK Q1 Reading Comprehension, Day 6 Citing Evidence\n\nIn Class: Practice citing text when answering questions about the novel study."},{"id":"K-HUM-D6-C3-L1","grade":"K","day":6,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nJournal Journeys\n\nVideo:\nK Q1 Language and Writing, Day 6 peer review and end marks\n\nCapitalization Review\n-Peer Reviews using PQP\n\nIn Class:\nStudents should reflect and refine their journal writing based on their peer review."},{"id":"K-HUM-D7-C1-A","grade":"K","day":7,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills: Progress Monitor"},{"id":"K-HUM-D7-C2-A","grade":"K","day":7,"subject":"HUM","strand":"Reading","requirement":"Fluency: Give students decodable texts read so far this year, and have students partner read to improve fluency."},{"id":"K-HUM-D7-C3-A","grade":"K","day":7,"subject":"HUM","strand":"Writing","requirement":"Cursive:\n\nProgress Monitoring\nWords:\nSentences:"},{"id":"K-HUM-D8-C1-L1","grade":"K","day":8,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\ncred\n\nWord\ncredible\n\nVideo\nMorphology K Q1 Lesson 2.1 credible"},{"id":"K-HUM-D8-C2-L1","grade":"K","day":8,"subject":"HUM","strand":"Reading","requirement":"Meaning Masters\nVideo: \nCompare and contrast text and video, paraphrasing\nK Q1 Reading Comprehension, Day 8 text and video clip\n\nIn Class:\nPractice paraphrasing text during novel study."},{"id":"K-HUM-D8-C3-L1","grade":"K","day":8,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nWould You Rather: Writing Edition\nVideo:\nK Q1 Language and Writing Day 8: commas in a series, opinion statements\n-Commas in a series\n-Opinion statements\n\nIn Class:\n-Review commas in a series and opinion statements. Play a few rounds of Would You Rather to practice orally forming opinion sentences"},{"id":"K-HUM-D9-C1-L1","grade":"K","day":9,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\ncred\n\nWord\ndiscredit\n\nVideo\nMorphology K Q1 Lesson 2.2 discredit"},{"id":"K-HUM-D9-C2-L1","grade":"K","day":9,"subject":"HUM","strand":"Reading","requirement":"Meaning Masters\nVideo:\nArtistic choices in illustrations and mood of the text. \nK Q1 Reading Comprehension, Day 9 illustrations and artistic choices\n\nIn Class:\nHow do illustrations help us understand the mood of the text? Can you find examples in the novel study?"},{"id":"K-HUM-D9-C3-L1","grade":"K","day":9,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nWould You Rather: Writing Edition\n\nVideo:\nKQ1 Language and Writing Day 9: commas in a series, opinion statement\n-Commas in a series\n-Opinion sentences.\n\nIn Class:\n-Make an anchor chart of opinion sentence stems"},{"id":"K-HUM-D10-C1-L1","grade":"K","day":10,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\ncred\n\nWord\nincredible\n\nVideo\nMorphology K Q1 Lesson 2.3 incredible"},{"id":"K-HUM-D10-C2-L1","grade":"K","day":10,"subject":"HUM","strand":"Reading","requirement":"Meaning Masters\nVideo:\nText, scripts, and graphic novels\nK Q1 Reading Comprehension, Day 10 text, scripts, and graphic novels\n\nIn Class:\nStudents can write a script or sketch a comic strip from the novel study."},{"id":"K-HUM-D10-C3-L1","grade":"K","day":10,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nWould You Rather: Writing Edition\n\nVideo: \nK Q1 Language and Writing Day10: commas in quotations, opinion evidence\n-Commas and quotation marks in dialogue and quotations\n-Evidence sentences using sentence stems\n\nIn Class:\n-Practice commas and quotations in dialogue writing and quotations\n-Make an anchor chart of evidence sentence stems"},{"id":"K-HUM-D11-C1-L1","grade":"K","day":11,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\ncred\n\nWord\nincredulous\n\nVideo\nMorphology K Q1 Lesson 2.4 incredulous"},{"id":"K-HUM-D11-C2-L1","grade":"K","day":11,"subject":"HUM","strand":"Reading","requirement":"Meaning Masters\nVideo:\nCompare a poem to a text\nK Q1 Reading Comprehension, Day 11 Text and Poetry\n\nIn Class:\nHow would our novel study be different if it were a poem?"},{"id":"K-HUM-D11-C3-L1","grade":"K","day":11,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nWould You Rather: Writing Edition\n\nVideo: \nK Q1 Language and Writing Day1 1: commas in quotations, opinion evidence\n-Commas and quotation marks in dialogue and quotations\n-Evidence sentences using sentence stems\n\nIn Class:\n-Practice commas and quotations in dialogue writing and quotations\n-Play a round of Would you Rather, and have students write their opinion supported with two supporting sentences."},{"id":"K-HUM-D12-C1-A","grade":"K","day":12,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills: Progress Monitor"},{"id":"K-HUM-D12-C2-A","grade":"K","day":12,"subject":"HUM","strand":"Reading","requirement":"Fluency: Give students decodable texts read so far this year, and have students partner read to improve fluency."},{"id":"K-HUM-D12-C3-A","grade":"K","day":12,"subject":"HUM","strand":"Writing","requirement":"Cursive:\n\nProgress Monitoring\nWords:\nSentences:"},{"id":"K-HUM-D13-C1-L1","grade":"K","day":13,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\nfer\n\nWord\ndeferred\n\nVideo\nMorphology K Q1 Lesson3.1 deferred"},{"id":"K-HUM-D13-C2-L1","grade":"K","day":13,"subject":"HUM","strand":"Reading","requirement":"Piece by Piece: How parts build a story\nVideo:\nA poem builds a story through stanzas\nK Q1 Reading Comprehension, Day 13 Piece by Piece: How parts build a story\n\nIn Class:\nWhat story structure is our novel study: Linear, circular or parallel?"},{"id":"K-HUM-D13-C3-L1","grade":"K","day":13,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nBuild It, Expand It, Prove It!\n\nVideo:\nK Q1 Build It Expand It Prove It Day 13: Simple sentences, opinion conclusions\n-Simple sentences\n-Subjects\n-Predicates\n-Conclusion Sentences\n\nIn Class:\n-Build silly sentences together by combining random subjects and predicates\n-Practice oral or written conclusion sentences"},{"id":"K-HUM-D14-C1-L1","grade":"K","day":14,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\nfer\n\nWord\ntransfer\n\nVideo\nMorphology K Q1 Lesson 3.2 transfer"},{"id":"K-HUM-D14-C2-L1","grade":"K","day":14,"subject":"HUM","strand":"Reading","requirement":"Piece by Piece: How parts build a story\nVideo:\nA chapter book build a story through chapters\nK Q1 Reading Comprehension, Day 14 Piece by Piece: How parts build a story Chapters\n\nIn Class:\nHow can we see the story building in the novel study?"},{"id":"K-HUM-D14-C3-L1","grade":"K","day":14,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nBuild It, Expand It, Prove It!\n\nVideo:\nK Q1 Build It Expand It Prove It Day 14: FANBOYS, opinion conclusions\n-Conjunctions\n-FANBOYS\n-Conclusion sentences\n\nIn Class\n-Make an anchor chart for FANBOYS\n-Continue to practice conclusion sentences, or analyze conclusion sentences in a mentor text."},{"id":"K-HUM-D15-C1-L1","grade":"K","day":15,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\nfer\n\nWord\ninferences\n\nVideo\nMorphology K Q1 Lesson 3.3 inferences"},{"id":"K-HUM-D15-C2-L1","grade":"K","day":15,"subject":"HUM","strand":"Reading","requirement":"Piece by Piece: How parts build a story\nVideo:\nK Q1 Reading Comprehension, Day 15 Piece by Piece: from scene to stage\n\nIn Class:\nWould our class novel make a good movie? How would the scenes build the story so far?"},{"id":"K-HUM-D15-C3-L1","grade":"K","day":15,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nBuild It, Expand It, Prove It!\n\nStudents will need a copy of the graphic organizer during the video lesson.\nVideo:\nK Q1 Build It Expand It Prove It Day 15: compound sentences, opinion conclusions\n-Compound sentences\n-Opinion writing graphic organizer\n\nIn Class:\n-Review compound sentences and practice as needed.\n-Use extra time to complete the graphic organizer in class. \nOpinion Writing Graphic Organizer"},{"id":"K-HUM-D15-C3-L2","grade":"K","day":15,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nBuild It, Expand It, Prove It!\n\nStudents will need a copy of the graphic organizer during the video lesson.\nVideo:\nK Q1 Build It Expand It Prove It Day 15: compound sentences, opinion conclusions\n-Compound sentences\n-Opinion writing graphic organizer\n\nIn Class:\n-Review compound sentences and practice as needed.\n-Use extra time to complete the graphic organizer in class. \nOpinion Writing Graphic Organizer"},{"id":"K-HUM-D16-C1-L1","grade":"K","day":16,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\nfer\n\nWord\nsuffer\n\nVideo\nMorphology K Q1 Lesson 3.4 suffer"},{"id":"K-HUM-D16-C2-L1","grade":"K","day":16,"subject":"HUM","strand":"Reading","requirement":"Piece by Piece: How parts build a story\nVideo:\nAn author’s purpose for a text determines which story structure is used.\nK Q1 Reading Comprehension, Day 16 Piece by Piece: Putting the Pieces Together\n\nIn Class:\nWhat is the author’s purpose for the novel? How is the story structure used to meet the purpose?"},{"id":"K-HUM-D16-C3-L1","grade":"K","day":16,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nBuild It, Expand It, Prove It!\n\nVideo:\nK I Q1 Build It Expand It Prove It Day 16: compound sentences, writing community\n-Compound sentences\n-Writing community, giving PQP feedback to peers\n\nIn Class:\n-Allow students time to reflect and refine their graphic organizers as needed."},{"id":"K-HUM-D17-C1-A","grade":"K","day":17,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills: Progress Monitor"},{"id":"K-HUM-D17-C2-A","grade":"K","day":17,"subject":"HUM","strand":"Reading","requirement":"Fluency: Give students decodable texts read so far this year, and have students partner read to improve fluency."},{"id":"K-HUM-D17-C3-A","grade":"K","day":17,"subject":"HUM","strand":"Writing","requirement":"Cursive:\n\nProgress Monitoring\nWords:\nSentences:"},{"id":"K-HUM-D18-C1-L1","grade":"K","day":18,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\nject\n\nWord\nrejected\n\nVideo\nMorphology K Q1 Lesson 4.1 rejected"},{"id":"K-HUM-D18-C2-L1","grade":"K","day":18,"subject":"HUM","strand":"Reading","requirement":"Read Between the Lines\nVideo:\nIntroduction to Inferenceing, quoting the text explicitly.\nK Q1 Reading Comprehension Day 18 Read between the lines: clues + thinking = inference\n\nIn Class:\nPractice quote the text explicitly during the novel study"},{"id":"K-HUM-D18-C3-L1","grade":"K","day":18,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nReady, Set, Publish!\n\nVideo:\nK Q1 Ready, Set, Publish Day 18 opinion rough draft\n-opinion paragraph rough draft\n-sentence editing\n\nIn Class\n-Provide time for rough draft writing. Teacher conferencing can start as soon as students are ready."},{"id":"K-HUM-D19-C1-L1","grade":"K","day":19,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\nject\n\nWord\ninject\n\nVideo\nMorphology K Q1 Lesson 4.2 inject"},{"id":"K-HUM-D19-C2-L1","grade":"K","day":19,"subject":"HUM","strand":"Reading","requirement":"Read Between the Lines\nVideo:\nMake an inference about a character. Write an inference statement.\nK Q1 Reading Comprehension Day 19 Read between the lines:Reading Beyond the Words\n\nIn Class:\nMake an inference about a character in the novel study. Practice writing an inference statement that includes quotes from the text."},{"id":"K-HUM-D19-C3-L1","grade":"K","day":19,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nReady, Set, Publish!\n\nVideo:\nK Q1 Ready, Set, Publish Day 19 Writing community\n-Sentence editing\n-Writing community\n\nIn Class\n-Continue to conference with students\n-Allow for time for students to reflect and refine their work based on the feedback they received in the writing community."},{"id":"K-HUM-D20-C1-L1","grade":"K","day":20,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoemes\nject\n\nWord\nobjection\n\nVideo\nMorphology K Q1 Lesson 4.3 objection"},{"id":"K-HUM-D20-C2-L1","grade":"K","day":20,"subject":"HUM","strand":"Reading","requirement":"Read Between the Lines\nVideo:\nUse quotation marks to cite text evidence. \n K Q1 Reading Comprehension Day 20 Read between the lines: Quoting Like a Scholar\n\nIn Class:\nPractice using quotation marks to cite evidence when answering an inference question during the novel study."},{"id":"K-HUM-D20-C3-L1","grade":"K","day":20,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nReady, Set, Publish!\n\nVideo:\n K Q1 Ready, Set, Publish Day 20 Writing community\n-Sentence editing\n-Final Copy\n\nIn Class\n-Allow time for students to publish their final copy of their opinion paragraph. Begin presentations as time allows"},{"id":"K-HUM-D21-C1-L1","grade":"K","day":21,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\nject\n\nWord\nsubjectting\n\nVideo\nMorphology K Q1 Lesson 4.4 subjecting"},{"id":"K-HUM-D21-C2-L1","grade":"K","day":21,"subject":"HUM","strand":"Reading","requirement":"Read Between the Lines\nVideo:\nCite text evidence and support inferences with correctly quoted text.\nK Q1 Reading Comprehension Day 21 Read between the lines: Building Strong Interpretations\n\nIn Class:\nHave students write an inference to a question from the novel study with correct quotation."},{"id":"K-HUM-D21-C3-A","grade":"K","day":21,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up\n\nReady, Set, Publish!\n\nNo video today. Use the time for students to present and share their work."},{"id":"K-HUM-D22-C1-A","grade":"K","day":22,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills: Progress Monitor"},{"id":"K-HUM-D22-C2-A","grade":"K","day":22,"subject":"HUM","strand":"Reading","requirement":"Fluency: Give students decodable texts read so far this year, and have students partner read to improve fluency."},{"id":"K-HUM-D22-C3-A","grade":"K","day":22,"subject":"HUM","strand":"Writing","requirement":"Cursive:\n\nProgress Monitoring\nWords:\nSentences:"},{"id":"K-HUM-D23-C1-A","grade":"K","day":23,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\nleg\n\nWord\nlegally\n\nVideo"},{"id":"K-HUM-D23-C3-A","grade":"K","day":23,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"K-HUM-D24-C1-A","grade":"K","day":24,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\nleg\n\nWord\nillegal\n\nVideo"},{"id":"K-HUM-D24-C3-A","grade":"K","day":24,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"K-HUM-D25-C1-A","grade":"K","day":25,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\nleg\n\nWord\ndelegate\n\nVideo"},{"id":"K-HUM-D25-C3-A","grade":"K","day":25,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"K-HUM-D26-C1-A","grade":"K","day":26,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\nleg\n\nWord\nlegit\n\nVideo"},{"id":"K-HUM-D26-C3-A","grade":"K","day":26,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"K-HUM-D27-C1-A","grade":"K","day":27,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills: Progress Monitor"},{"id":"K-HUM-D27-C2-A","grade":"K","day":27,"subject":"HUM","strand":"Reading","requirement":"Fluency: Give students decodable texts read so far this year, and have students partner read to improve fluency."},{"id":"K-HUM-D27-C3-A","grade":"K","day":27,"subject":"HUM","strand":"Writing","requirement":"Cursive:\n\nProgress Monitoring\nWords:\nSentences:"},{"id":"K-HUM-D28-C1-A","grade":"K","day":28,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\npend/pence\n\nWord\npensive\n\nVideo"},{"id":"K-HUM-D28-C3-A","grade":"K","day":28,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"K-HUM-D29-C1-A","grade":"K","day":29,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\npend/pence\n\nWord\npendulum\n\nVideo"},{"id":"K-HUM-D29-C3-A","grade":"K","day":29,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"K-HUM-D30-C1-A","grade":"K","day":30,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\npend/pence\n\nWord\nsuspenseful\nVideo"},{"id":"K-HUM-D30-C3-A","grade":"K","day":30,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"K-HUM-D31-C1-A","grade":"K","day":31,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\npend/pence\n\nWord\nexpensive\n\nVideo"},{"id":"K-HUM-D31-C3-A","grade":"K","day":31,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"K-HUM-D32-C1-A","grade":"K","day":32,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills: Progress Monitor"},{"id":"K-HUM-D32-C2-A","grade":"K","day":32,"subject":"HUM","strand":"Reading","requirement":"Fluency: Give students decodable texts read so far this year, and have students partner read to improve fluency."},{"id":"K-HUM-D32-C3-A","grade":"K","day":32,"subject":"HUM","strand":"Writing","requirement":"Cursive:\n\nProgress Monitoring\nWords:\nSentences:"},{"id":"K-HUM-D33-C1-A","grade":"K","day":33,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\nvent\n\nWord\nadventure\n\nVideo"},{"id":"K-HUM-D33-C3-A","grade":"K","day":33,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"K-HUM-D34-C1-A","grade":"K","day":34,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\nvent\n\nWord\ninvention\n\nVideo"},{"id":"K-HUM-D34-C3-A","grade":"K","day":34,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"K-HUM-D35-C1-A","grade":"K","day":35,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\nvent\n\nWord\nprevent\n\nVideo"},{"id":"K-HUM-D35-C3-A","grade":"K","day":35,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"K-HUM-D36-C1-A","grade":"K","day":36,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills\nMorphoeme\nvent\n\nWord\nevent\n\nVideo"},{"id":"K-HUM-D36-C3-A","grade":"K","day":36,"subject":"HUM","strand":"Writing","requirement":"Cursive Warm Up"},{"id":"K-HUM-D37-C1-A","grade":"K","day":37,"subject":"HUM","strand":"Foundational Skills","requirement":"Foundational Skills: Progress Monitor"},{"id":"K-HUM-D37-C2-A","grade":"K","day":37,"subject":"HUM","strand":"Reading","requirement":"Fluency: Give students decodable texts read so far this year, and have students partner read to improve fluency."},{"id":"K-HUM-D37-C3-A","grade":"K","day":37,"subject":"HUM","strand":"Writing","requirement":"Cursive:\n\nProgress Monitoring\nWords:\nSentences:"},{"id":"K-HUM-D38-C1-A","grade":"K","day":38,"subject":"HUM","strand":"Foundational Skills","requirement":"Flavor Assessment"},{"id":"K-HUM-D38-C2-A","grade":"K","day":38,"subject":"HUM","strand":"Reading","requirement":"Flavor Assessment"},{"id":"K-HUM-D38-C3-A","grade":"K","day":38,"subject":"HUM","strand":"Writing","requirement":"Flavor Assessment"},{"id":"K-HUM-D38-C4-A","grade":"K","day":38,"subject":"HUM","strand":"Social Studies and SEL","requirement":"Flavor Assessment"},{"id":"K-HUM-D39-C1-A","grade":"K","day":39,"subject":"HUM","strand":"Foundational Skills","requirement":"Core Assessment"},{"id":"K-HUM-D39-C2-A","grade":"K","day":39,"subject":"HUM","strand":"Reading","requirement":"Core Assessment"},{"id":"K-HUM-D39-C3-A","grade":"K","day":39,"subject":"HUM","strand":"Writing","requirement":"Core Assessment"},{"id":"K-HUM-D39-C4-A","grade":"K","day":39,"subject":"HUM","strand":"Social Studies and SEL","requirement":"Core Assessment"},{"id":"K-HUM-D40-C1-A","grade":"K","day":40,"subject":"HUM","strand":"Foundational Skills","requirement":"Review, Reteach, and Extend"},{"id":"K-HUM-D40-C2-A","grade":"K","day":40,"subject":"HUM","strand":"Reading","requirement":"Review, Reteach, and Extend"},{"id":"K-HUM-D40-C3-A","grade":"K","day":40,"subject":"HUM","strand":"Writing","requirement":"Review, Reteach, and Extend"},{"id":"K-HUM-D40-C4-A","grade":"K","day":40,"subject":"HUM","strand":"Social Studies and SEL","requirement":"Review, Reteach, and Extend"},{"id":"I-Math-D1-C1-A","grade":"I","day":1,"subject":"Math","strand":"Foundational Skills","requirement":"Welcome"},{"id":"I-Math-D1-C2-A","grade":"I","day":1,"subject":"Math","strand":"Vocabulary","requirement":"math, expectations"},{"id":"I-Math-D1-C3-A","grade":"I","day":1,"subject":"Math","strand":"Core Math","requirement":"Welcome to Math"},{"id":"I-Math-D2-C1-A","grade":"I","day":2,"subject":"Math","strand":"Foundational Skills","requirement":"Flavor"},{"id":"I-Math-D2-C2-A","grade":"I","day":2,"subject":"Math","strand":"Vocabulary","requirement":"FLAVOR, explain"},{"id":"I-Math-D2-C3-A","grade":"I","day":2,"subject":"Math","strand":"Core Math","requirement":"FLAVOR Introduction"},{"id":"I-Math-D3-C1-A","grade":"I","day":3,"subject":"Math","strand":"Foundational Skills","requirement":"Number sense"},{"id":"I-Math-D3-C2-A","grade":"I","day":3,"subject":"Math","strand":"Vocabulary","requirement":"place value"},{"id":"I-Math-D3-C3-L1","grade":"I","day":3,"subject":"Math","strand":"Core Math","requirement":"Place Value Introduction STEM I Q1 Lesson 1 - Math - Place Value"},{"id":"I-Math-D4-C1-A","grade":"I","day":4,"subject":"Math","strand":"Foundational Skills","requirement":"Observation"},{"id":"I-Math-D4-C2-A","grade":"I","day":4,"subject":"Math","strand":"Vocabulary","requirement":"digit, value"},{"id":"I-Math-D4-C3-L1","grade":"I","day":4,"subject":"Math","strand":"Core Math","requirement":"Value of Digits STEM I Q1 Lesson 2-Value of Digits"},{"id":"I-Math-D5-C1-A","grade":"I","day":5,"subject":"Math","strand":"Foundational Skills","requirement":"Comparing"},{"id":"I-Math-D5-C2-A","grade":"I","day":5,"subject":"Math","strand":"Vocabulary","requirement":"ten times"},{"id":"I-Math-D5-C3-L1","grade":"I","day":5,"subject":"Math","strand":"Core Math","requirement":"Place Value Relationships STEM I Q1 Lesson 3-Math-Place Value Relationships"},{"id":"I-Math-D6-C1-A","grade":"I","day":6,"subject":"Math","strand":"Foundational Skills","requirement":"Reasoning"},{"id":"I-Math-D6-C2-A","grade":"I","day":6,"subject":"Math","strand":"Vocabulary","requirement":"expanded form"},{"id":"I-Math-D6-C3-A","grade":"I","day":6,"subject":"Math","strand":"Core Math","requirement":"Place Value Review"},{"id":"I-Math-D7-C1-A","grade":"I","day":7,"subject":"Math","strand":"Foundational Skills","requirement":"Number representation"},{"id":"I-Math-D7-C2-A","grade":"I","day":7,"subject":"Math","strand":"Vocabulary","requirement":"standard form"},{"id":"I-Math-D7-C3-L1","grade":"I","day":7,"subject":"Math","strand":"Core Math","requirement":"Read Large Numbers\n STEM I Q1 Lesson 4-Math-Reading Large Numbers"},{"id":"I-Math-D8-C1-A","grade":"I","day":8,"subject":"Math","strand":"Foundational Skills","requirement":"Communication"},{"id":"I-Math-D8-C2-A","grade":"I","day":8,"subject":"Math","strand":"Vocabulary","requirement":"word form"},{"id":"I-Math-D8-C3-L1","grade":"I","day":8,"subject":"Math","strand":"Core Math","requirement":"Write Large NumbersSTEM I Q1 Lesson 5-Math-Writing Large Numbers"},{"id":"I-Math-D9-C1-A","grade":"I","day":9,"subject":"Math","strand":"Foundational Skills","requirement":"Comparing"},{"id":"I-Math-D9-C2-A","grade":"I","day":9,"subject":"Math","strand":"Vocabulary","requirement":"greater than"},{"id":"I-Math-D9-C3-L1","grade":"I","day":9,"subject":"Math","strand":"Core Math","requirement":"Compare Numbers STEM I Q1 Lesson 3 - Math - Reading and Writing Whole Numbers"},{"id":"I-Math-D10-C1-A","grade":"I","day":10,"subject":"Math","strand":"Foundational Skills","requirement":"Reasoning"},{"id":"I-Math-D10-C2-A","grade":"I","day":10,"subject":"Math","strand":"Vocabulary","requirement":"less than, equal"},{"id":"I-Math-D10-C3-L1","grade":"I","day":10,"subject":"Math","strand":"Core Math","requirement":"Compare and Order Numbers STEM I Q1 Lesson 7-Math-Compare and Order Numbers"},{"id":"I-Math-D11-C1-A","grade":"I","day":11,"subject":"Math","strand":"Foundational Skills","requirement":"Estimation"},{"id":"I-Math-D11-C2-A","grade":"I","day":11,"subject":"Math","strand":"Vocabulary","requirement":"round"},{"id":"I-Math-D11-C3-L1","grade":"I","day":11,"subject":"Math","strand":"Core Math","requirement":"Rounding IntroductionSTEM I Q1 Lesson 4 - Math - Place Value and Rounding"},{"id":"I-Math-D12-C1-A","grade":"I","day":12,"subject":"Math","strand":"Foundational Skills","requirement":"Rounding Introduction"},{"id":"I-Math-D12-C2-A","grade":"I","day":12,"subject":"Math","strand":"Vocabulary","requirement":"nearest ten"},{"id":"I-Math-D12-C3-L1","grade":"I","day":12,"subject":"Math","strand":"Core Math","requirement":"Round to Tens STEM I Q1 Lesson 9-Math-Round to 10s"},{"id":"I-Math-D13-C1-A","grade":"I","day":13,"subject":"Math","strand":"Foundational Skills","requirement":"Number sense"},{"id":"I-Math-D13-C2-A","grade":"I","day":13,"subject":"Math","strand":"Vocabulary","requirement":"nearest hundred"},{"id":"I-Math-D13-C3-L1","grade":"I","day":13,"subject":"Math","strand":"Core Math","requirement":"Round to HundredsSTEM I Q1 Lesson 10-Math-Round to 100"},{"id":"I-Math-D14-C1-A","grade":"I","day":14,"subject":"Math","strand":"Foundational Skills","requirement":"Application"},{"id":"I-Math-D14-C2-A","grade":"I","day":14,"subject":"Math","strand":"Vocabulary","requirement":"benchmark"},{"id":"I-Math-D14-C3-A","grade":"I","day":14,"subject":"Math","strand":"Core Math","requirement":"Rounding Review"},{"id":"I-Math-D15-C1-A","grade":"I","day":15,"subject":"Math","strand":"Foundational Skills","requirement":"Computation"},{"id":"I-Math-D15-C2-A","grade":"I","day":15,"subject":"Math","strand":"Vocabulary","requirement":"addend, sum"},{"id":"I-Math-D15-C3-L1","grade":"I","day":15,"subject":"Math","strand":"Core Math","requirement":"Addition AlgorithmSTEM I Q1 Lesson 11 - Math - Multi-Digit Whole Numbers"},{"id":"I-Math-D16-C1-A","grade":"I","day":16,"subject":"Math","strand":"Foundational Skills","requirement":"Computation"},{"id":"I-Math-D16-C2-A","grade":"I","day":16,"subject":"Math","strand":"Vocabulary","requirement":"regroup"},{"id":"I-Math-D16-C3-L1","grade":"I","day":16,"subject":"Math","strand":"Core Math","requirement":"Multi-Digit AdditionSTEM I Q1 Lesson 12-Math-Multi-Digit Addition"},{"id":"I-Math-D17-C1-A","grade":"I","day":17,"subject":"Math","strand":"Foundational Skills","requirement":"Computation"},{"id":"I-Math-D17-C2-A","grade":"I","day":17,"subject":"Math","strand":"Vocabulary","requirement":"difference"},{"id":"I-Math-D17-C3-L1","grade":"I","day":17,"subject":"Math","strand":"Core Math","requirement":"Subtraction AlgorithmSTEM I Q1Lesson 13-Math-Subtraction Algorithm"},{"id":"I-Math-D18-C1-A","grade":"I","day":18,"subject":"Math","strand":"Foundational Skills","requirement":"Problem solving"},{"id":"I-Math-D18-C2-A","grade":"I","day":18,"subject":"Math","strand":"Vocabulary","requirement":"exchange"},{"id":"I-Math-D18-C3-L1","grade":"I","day":18,"subject":"Math","strand":"Core Math","requirement":"Add/Subtract PracticeSTEM I Q1 Lesson 14-Math-Add/Subtract Practice"},{"id":"I-Math-D19-C1-A","grade":"I","day":19,"subject":"Math","strand":"Foundational Skills","requirement":"Application"},{"id":"I-Math-D19-C2-A","grade":"I","day":19,"subject":"Math","strand":"Vocabulary","requirement":"algorithm"},{"id":"I-Math-D19-C3-A","grade":"I","day":19,"subject":"Math","strand":"Core Math","requirement":"Computation Review"},{"id":"I-Math-D20-C1-A","grade":"I","day":20,"subject":"Math","strand":"Foundational Skills","requirement":"Reading for math"},{"id":"I-Math-D20-C2-A","grade":"I","day":20,"subject":"Math","strand":"Vocabulary","requirement":"operation"},{"id":"I-Math-D20-C3-L1","grade":"I","day":20,"subject":"Math","strand":"Core Math","requirement":"Multi-Step Problems STEM I Q1 Lesson 15- Math - Multi-Step Word Problems"},{"id":"I-Math-D21-C1-A","grade":"I","day":21,"subject":"Math","strand":"Foundational Skills","requirement":"Critical thinking"},{"id":"I-Math-D21-C2-A","grade":"I","day":21,"subject":"Math","strand":"Vocabulary","requirement":"clue words"},{"id":"I-Math-D21-C3-L1","grade":"I","day":21,"subject":"Math","strand":"Core Math","requirement":"Solve Multi-Step Problems STEM I Q1 Lesson 16-Math-Solving Multistep Problems"},{"id":"I-Math-D22-C1-A","grade":"I","day":22,"subject":"Math","strand":"Foundational Skills","requirement":"Reasoning"},{"id":"I-Math-D22-C2-A","grade":"I","day":22,"subject":"Math","strand":"Vocabulary","requirement":"remainder"},{"id":"I-Math-D22-C3-L1","grade":"I","day":22,"subject":"Math","strand":"Core Math","requirement":"Division ProblemsSTEM I Q1 Lesson 17-Math-Division"},{"id":"I-Math-D23-C1-A","grade":"I","day":23,"subject":"Math","strand":"Foundational Skills","requirement":"Application"},{"id":"I-Math-D23-C2-A","grade":"I","day":23,"subject":"Math","strand":"Vocabulary","requirement":"strategy"},{"id":"I-Math-D23-C3-L1","grade":"I","day":23,"subject":"Math","strand":"Core Math","requirement":"Problem Solving Strategies STEM I Q1 Lesson18-Math-Problem Solving Strategies"},{"id":"I-Math-D24-C1-A","grade":"I","day":24,"subject":"Math","strand":"Foundational Skills","requirement":"Reflection"},{"id":"I-Math-D24-C2-A","grade":"I","day":24,"subject":"Math","strand":"Vocabulary","requirement":"explain"},{"id":"I-Math-D24-C3-A","grade":"I","day":24,"subject":"Math","strand":"Core Math","requirement":"Multi-Step Review"},{"id":"I-Math-D25-C1-A","grade":"I","day":25,"subject":"Math","strand":"Foundational Skills","requirement":"Geometry"},{"id":"I-Math-D25-C2-A","grade":"I","day":25,"subject":"Math","strand":"Vocabulary","requirement":"point, line"},{"id":"I-Math-D25-C3-L1","grade":"I","day":25,"subject":"Math","strand":"Core Math","requirement":"Points and Lines STEM I Q1 Lesson 19 - Math - Geometry"},{"id":"I-Math-D26-C1-A","grade":"I","day":26,"subject":"Math","strand":"Foundational Skills","requirement":"Geometry"},{"id":"I-Math-D26-C2-A","grade":"I","day":26,"subject":"Math","strand":"Vocabulary","requirement":"ray, segment"},{"id":"I-Math-D26-C3-L1","grade":"I","day":26,"subject":"Math","strand":"Core Math","requirement":"Rays and Segments STEM I Q1 Lesson 20-Math-Rays and Segments"},{"id":"I-Math-D27-C1-A","grade":"I","day":27,"subject":"Math","strand":"Foundational Skills","requirement":"Geometry"},{"id":"I-Math-D27-C2-A","grade":"I","day":27,"subject":"Math","strand":"Vocabulary","requirement":"parallel"},{"id":"I-Math-D27-C3-L1","grade":"I","day":27,"subject":"Math","strand":"Core Math","requirement":"Parallel Lines STEM I Q1 Lesson 21-Math-Parallel Lines"},{"id":"I-Math-D28-C1-A","grade":"I","day":28,"subject":"Math","strand":"Foundational Skills","requirement":"Geometry"},{"id":"I-Math-D28-C2-A","grade":"I","day":28,"subject":"Math","strand":"Vocabulary","requirement":"perpendicular"},{"id":"I-Math-D28-C3-L1","grade":"I","day":28,"subject":"Math","strand":"Core Math","requirement":"Perpendicular LinesSTEM I Q1 Lesson 22-Math-Perpendicular Lines"},{"id":"I-Math-D29-C1-A","grade":"I","day":29,"subject":"Math","strand":"Foundational Skills","requirement":"Classification"},{"id":"I-Math-D29-C2-A","grade":"I","day":29,"subject":"Math","strand":"Vocabulary","requirement":"polygon"},{"id":"I-Math-D29-C3-L1","grade":"I","day":29,"subject":"Math","strand":"Core Math","requirement":"Classify Shapes STEM I Q1 Lesson 23-Math-Classify Shapes"},{"id":"I-Math-D30-C1-A","grade":"I","day":30,"subject":"Math","strand":"Foundational Skills","requirement":"Observation"},{"id":"I-Math-D30-C2-A","grade":"I","day":30,"subject":"Math","strand":"Vocabulary","requirement":"quadrilateral"},{"id":"I-Math-D30-C3-L1","grade":"I","day":30,"subject":"Math","strand":"Core Math","requirement":"Shape AttributesSTEM I Q1 Lesson 24-Math-Shape Attributes"},{"id":"I-Math-D31-C1-A","grade":"I","day":31,"subject":"Math","strand":"Foundational Skills","requirement":"Analysis"},{"id":"I-Math-D31-C2-A","grade":"I","day":31,"subject":"Math","strand":"Vocabulary","requirement":"right triangle"},{"id":"I-Math-D31-C3-L1","grade":"I","day":31,"subject":"Math","strand":"Core Math","requirement":"Categories of ShapesSTEM I Q1 Lesson 25-Math-Categories of Shapes"},{"id":"I-Math-D32-C1-A","grade":"I","day":32,"subject":"Math","strand":"Foundational Skills","requirement":"Application"},{"id":"I-Math-D32-C2-A","grade":"I","day":32,"subject":"Math","strand":"Vocabulary","requirement":"angle"},{"id":"I-Math-D32-C3-A","grade":"I","day":32,"subject":"Math","strand":"Core Math","requirement":"Shape Review"},{"id":"I-Math-D33-C1-A","grade":"I","day":33,"subject":"Math","strand":"Foundational Skills","requirement":"Spatial reasoning"},{"id":"I-Math-D33-C2-A","grade":"I","day":33,"subject":"Math","strand":"Vocabulary","requirement":"symmetry"},{"id":"I-Math-D33-C3-L1","grade":"I","day":33,"subject":"Math","strand":"Core Math","requirement":"Introduction to SymmetrySTEM I Q1 Lesson 26 - Math - Lines of Symmetry"},{"id":"I-Math-D34-C1-A","grade":"I","day":34,"subject":"Math","strand":"Foundational Skills","requirement":"Observation"},{"id":"I-Math-D34-C2-A","grade":"I","day":34,"subject":"Math","strand":"Vocabulary","requirement":"line of symmetry"},{"id":"I-Math-D34-C3-L1","grade":"I","day":34,"subject":"Math","strand":"Core Math","requirement":"Symmetrical Figures STEM I Q1 Lesson 27-Math-Symmetry"},{"id":"I-Math-D35-C1-A","grade":"I","day":35,"subject":"Math","strand":"Foundational Skills","requirement":"Application"},{"id":"I-Math-D35-C2-A","grade":"I","day":35,"subject":"Math","strand":"Vocabulary","requirement":"matching halves"},{"id":"I-Math-D35-C3-A","grade":"I","day":35,"subject":"Math","strand":"Core Math","requirement":"Symmetry Review"},{"id":"I-Math-D36-C1-A","grade":"I","day":36,"subject":"Math","strand":"Foundational Skills","requirement":"Measurement"},{"id":"I-Math-D36-C2-A","grade":"I","day":36,"subject":"Math","strand":"Vocabulary","requirement":"acute angle"},{"id":"I-Math-D36-C3-L1","grade":"I","day":36,"subject":"Math","strand":"Core Math","requirement":"Understanding AnglesSTEM I Q1 Lesson 28- Math - What is an angle?"},{"id":"I-Math-D37-C1-A","grade":"I","day":37,"subject":"Math","strand":"Foundational Skills","requirement":"Measurement"},{"id":"I-Math-D37-C2-A","grade":"I","day":37,"subject":"Math","strand":"Vocabulary","requirement":"obtuse angle, right angle"},{"id":"I-Math-D37-C3-L1","grade":"I","day":37,"subject":"Math","strand":"Core Math","requirement":"Measuring and Comparing Angles STEM I Q1 Lesson 29-Math-Measuring Angles"},{"id":"I-Math-D38-C1-A","grade":"I","day":38,"subject":"Math","strand":"Foundational Skills","requirement":"Flavor Assessment"},{"id":"I-Math-D38-C2-A","grade":"I","day":38,"subject":"Math","strand":"Vocabulary","requirement":"all vocabulary"},{"id":"I-Math-D38-C3-A","grade":"I","day":38,"subject":"Math","strand":"Core Math","requirement":"FLAVOR Assessment"},{"id":"I-Math-D39-C1-A","grade":"I","day":39,"subject":"Math","strand":"Foundational Skills","requirement":"Core Assessment"},{"id":"I-Math-D39-C2-A","grade":"I","day":39,"subject":"Math","strand":"Vocabulary","requirement":"all vocabulary"},{"id":"I-Math-D39-C3-A","grade":"I","day":39,"subject":"Math","strand":"Core Math","requirement":"Core Assessment"},{"id":"I-Math-D40-C1-A","grade":"I","day":40,"subject":"Math","strand":"Foundational Skills","requirement":"Reflection, Review, Extension, Make-Up"},{"id":"K-Math-D1-C1-A","grade":"K","day":1,"subject":"Math","strand":"Foundational Skills","requirement":"Welcome to Math"},{"id":"K-Math-D1-C2-A","grade":"K","day":1,"subject":"Math","strand":"Vocabulary","requirement":"respect, routine"},{"id":"K-Math-D1-C3-A","grade":"K","day":1,"subject":"Math","strand":"Core Math","requirement":"Welcome to Math"},{"id":"K-Math-D2-C1-A","grade":"K","day":2,"subject":"Math","strand":"Foundational Skills","requirement":"FLAVOR Introduction"},{"id":"K-Math-D2-C2-A","grade":"K","day":2,"subject":"Math","strand":"Vocabulary","requirement":"FLAVOR, evidence"},{"id":"K-Math-D2-C3-A","grade":"K","day":2,"subject":"Math","strand":"Core Math","requirement":"Mathematical thinking"},{"id":"K-Math-D3-C1-A","grade":"K","day":3,"subject":"Math","strand":"Foundational Skills","requirement":"Number sense"},{"id":"K-Math-D3-C2-A","grade":"K","day":3,"subject":"Math","strand":"Vocabulary","requirement":"place value"},{"id":"K-Math-D3-C3-L1","grade":"K","day":3,"subject":"Math","strand":"Core Math","requirement":"Introduction to Place Value STEM K Q1 Lesson 1-Math-Power of Place Value"},{"id":"K-Math-D4-C1-A","grade":"K","day":4,"subject":"Math","strand":"Foundational Skills","requirement":"Reasoning"},{"id":"K-Math-D4-C2-A","grade":"K","day":4,"subject":"Math","strand":"Vocabulary","requirement":"digit, value"},{"id":"K-Math-D4-C3-L1","grade":"K","day":4,"subject":"Math","strand":"Core Math","requirement":"Powers of Ten Relationships STEM K Q1 Lesson 2-Math- Power of 10"},{"id":"K-Math-D5-C1-A","grade":"K","day":5,"subject":"Math","strand":"Foundational Skills","requirement":"Comparing"},{"id":"K-Math-D5-C2-A","grade":"K","day":5,"subject":"Math","strand":"Vocabulary","requirement":"ten times"},{"id":"K-Math-D5-C3-L1","grade":"K","day":5,"subject":"Math","strand":"Core Math","requirement":"Place Value PatternsSTEM K Q1 Lesson 3-Math-Place Value Patterns"},{"id":"K-Math-D6-C1-A","grade":"K","day":6,"subject":"Math","strand":"Foundational Skills","requirement":"Analysis"},{"id":"K-Math-D6-C2-A","grade":"K","day":6,"subject":"Math","strand":"Vocabulary","requirement":"one-tenth"},{"id":"K-Math-D6-C3-L1","grade":"K","day":6,"subject":"Math","strand":"Core Math","requirement":"Relationships Between Places STEM K Q1 Lesson 4-Math-Place Value Relationship"},{"id":"K-Math-D7-C1-A","grade":"K","day":7,"subject":"Math","strand":"Foundational Skills","requirement":"Reflection"},{"id":"K-Math-D7-C2-A","grade":"K","day":7,"subject":"Math","strand":"Vocabulary","requirement":"expanded form"},{"id":"K-Math-D7-C3-A","grade":"K","day":7,"subject":"Math","strand":"Core Math","requirement":"Place Value Review"},{"id":"K-Math-D8-C1-A","grade":"K","day":8,"subject":"Math","strand":"Foundational Skills","requirement":"Pattern recognition"},{"id":"K-Math-D8-C2-A","grade":"K","day":8,"subject":"Math","strand":"Vocabulary","requirement":"power of 10"},{"id":"K-Math-D8-C3-L1","grade":"K","day":8,"subject":"Math","strand":"Core Math","requirement":"Introduction to Powers of 10 STEM K Q1 Lesson 5-Math - Decimal Operations"},{"id":"K-Math-D9-C1-A","grade":"K","day":9,"subject":"Math","strand":"Foundational Skills","requirement":"Observation"},{"id":"K-Math-D9-C2-A","grade":"K","day":9,"subject":"Math","strand":"Vocabulary","requirement":"exponent"},{"id":"K-Math-D9-C3-L1","grade":"K","day":9,"subject":"Math","strand":"Core Math","requirement":"Multiplying by Powers of 10 STEM K Q1 Lesson 6-Math-Multiplying By 10"},{"id":"K-Math-D10-C1-A","grade":"K","day":10,"subject":"Math","strand":"Foundational Skills","requirement":"Analysis"},{"id":"K-Math-D10-C2-A","grade":"K","day":10,"subject":"Math","strand":"Vocabulary","requirement":"decimal point"},{"id":"K-Math-D10-C3-L1","grade":"K","day":10,"subject":"Math","strand":"Core Math","requirement":"Decimal Patterns STEM K Q1 Lesson 7-Math-Decimal Patterns"},{"id":"K-Math-D11-C1-A","grade":"K","day":11,"subject":"Math","strand":"Foundational Skills","requirement":"Application"},{"id":"K-Math-D11-C2-A","grade":"K","day":11,"subject":"Math","strand":"Vocabulary","requirement":"product"},{"id":"K-Math-D11-C3-L1","grade":"K","day":11,"subject":"Math","strand":"Core Math","requirement":"Dividing by Powers of 10 STEM K Q1 Lesson 8-Math-Powers of 10"},{"id":"K-Math-D12-C1-A","grade":"K","day":12,"subject":"Math","strand":"Foundational Skills","requirement":"Reflection"},{"id":"K-Math-D12-C2-A","grade":"K","day":12,"subject":"Math","strand":"Vocabulary","requirement":"pattern"},{"id":"K-Math-D12-C3-A","grade":"K","day":12,"subject":"Math","strand":"Core Math","requirement":"Powers of 10 Review"},{"id":"K-Math-D13-C1-A","grade":"K","day":13,"subject":"Math","strand":"Foundational Skills","requirement":"Number representation"},{"id":"K-Math-D13-C2-A","grade":"K","day":13,"subject":"Math","strand":"Vocabulary","requirement":"decimal"},{"id":"K-Math-D13-C3-L1","grade":"K","day":13,"subject":"Math","strand":"Core Math","requirement":"Read Decimals STEM K Q1 Lesson 3-Math-Reading and Writing Decimals"},{"id":"K-Math-D14-C1-A","grade":"K","day":14,"subject":"Math","strand":"Foundational Skills","requirement":"Communication"},{"id":"K-Math-D14-C2-A","grade":"K","day":14,"subject":"Math","strand":"Vocabulary","requirement":"thousandths"},{"id":"K-Math-D14-C3-L1","grade":"K","day":14,"subject":"Math","strand":"Core Math","requirement":"Write DecimalsSTEM K Q1 Lesson 10-Math-Writing Decimals"},{"id":"K-Math-D15-C1-A","grade":"K","day":15,"subject":"Math","strand":"Foundational Skills","requirement":"Representation"},{"id":"K-Math-D15-C2-A","grade":"K","day":15,"subject":"Math","strand":"Vocabulary","requirement":"standard form"},{"id":"K-Math-D15-C3-L1","grade":"K","day":15,"subject":"Math","strand":"Core Math","requirement":"Decimal Models STEM K Q1 Lesson 11-Math-Decimal Models"},{"id":"K-Math-D16-C1-A","grade":"K","day":16,"subject":"Math","strand":"Foundational Skills","requirement":"Reasoning"},{"id":"K-Math-D16-C2-A","grade":"K","day":16,"subject":"Math","strand":"Vocabulary","requirement":"expanded form"},{"id":"K-Math-D16-C3-L1","grade":"K","day":16,"subject":"Math","strand":"Core Math","requirement":"Expanded Decimal Form STEM K Q1 Lesson 12-Math-Expanded Form"},{"id":"K-Math-D17-C1-A","grade":"K","day":17,"subject":"Math","strand":"Foundational Skills","requirement":"Comparing"},{"id":"K-Math-D17-C2-A","grade":"K","day":17,"subject":"Math","strand":"Vocabulary","requirement":"greater than"},{"id":"K-Math-D17-C3-L1","grade":"K","day":17,"subject":"Math","strand":"Core Math","requirement":"Compare DecimalsSTEM K Q1 Lesson 13-Math-Expanded Form"},{"id":"K-Math-D18-C1-A","grade":"K","day":18,"subject":"Math","strand":"Foundational Skills","requirement":"Analysis"},{"id":"K-Math-D18-C2-A","grade":"K","day":18,"subject":"Math","strand":"Vocabulary","requirement":"less than, equal"},{"id":"K-Math-D18-C3-L1","grade":"K","day":18,"subject":"Math","strand":"Core Math","requirement":"Ordering Decimals STEM K Q1 Lesson 14-Math-Ordering Decimals"},{"id":"K-Math-D19-C1-A","grade":"K","day":19,"subject":"Math","strand":"Foundational Skills","requirement":"Reflection"},{"id":"K-Math-D19-C2-A","grade":"K","day":19,"subject":"Math","strand":"Vocabulary","requirement":"compare"},{"id":"K-Math-D19-C3-A","grade":"K","day":19,"subject":"Math","strand":"Core Math","requirement":"Decimal Review"},{"id":"K-Math-D20-C1-A","grade":"K","day":20,"subject":"Math","strand":"Foundational Skills","requirement":"Estimation"},{"id":"K-Math-D20-C2-A","grade":"K","day":20,"subject":"Math","strand":"Vocabulary","requirement":"round"},{"id":"K-Math-D20-C3-L1","grade":"K","day":20,"subject":"Math","strand":"Core Math","requirement":"Introduction to Rounding Decimals STEM K Q1 Lesson 15- Math-Rounding Decimals"},{"id":"K-Math-D21-C1-A","grade":"K","day":21,"subject":"Math","strand":"Foundational Skills","requirement":"Number sense"},{"id":"K-Math-D21-C2-A","grade":"K","day":21,"subject":"Math","strand":"Vocabulary","requirement":"nearest tenth"},{"id":"K-Math-D21-C3-L1","grade":"K","day":21,"subject":"Math","strand":"Core Math","requirement":"Round to Tenths STEM K Q1 Lesson 16-Math-Round to Tenths"},{"id":"K-Math-D22-C1-A","grade":"K","day":22,"subject":"Math","strand":"Foundational Skills","requirement":"Number sense"},{"id":"K-Math-D22-C2-A","grade":"K","day":22,"subject":"Math","strand":"Vocabulary","requirement":"nearest hundredth"},{"id":"K-Math-D22-C3-L1","grade":"K","day":22,"subject":"Math","strand":"Core Math","requirement":"Round to HundredthsSTEM K Q1 Lesson 17-Math-Round to Hundredths"},{"id":"K-Math-D23-C1-A","grade":"K","day":23,"subject":"Math","strand":"Foundational Skills","requirement":"Application"},{"id":"K-Math-D23-C2-A","grade":"K","day":23,"subject":"Math","strand":"Vocabulary","requirement":"benchmark"},{"id":"K-Math-D23-C3-L1","grade":"K","day":23,"subject":"Math","strand":"Core Math","requirement":"Round to Thousandth STEM K Q1 Lesson 18-Math-Round to Thousandths"},{"id":"K-Math-D24-C1-A","grade":"K","day":24,"subject":"Math","strand":"Foundational Skills","requirement":"Reflection"},{"id":"K-Math-D24-C2-A","grade":"K","day":24,"subject":"Math","strand":"Vocabulary","requirement":"estimate"},{"id":"K-Math-D24-C3-A","grade":"K","day":24,"subject":"Math","strand":"Core Math","requirement":"Decimal Rounding Review"},{"id":"K-Math-D25-C1-A","grade":"K","day":25,"subject":"Math","strand":"Foundational Skills","requirement":"Computation"},{"id":"K-Math-D25-C2-A","grade":"K","day":25,"subject":"Math","strand":"Vocabulary","requirement":"addend, sum"},{"id":"K-Math-D25-C3-L1","grade":"K","day":25,"subject":"Math","strand":"Core Math","requirement":"Add DecimalsSTEM K Q1 Lesson 5-Math-Add, subtract and divide decimals"},{"id":"K-Math-D26-C1-A","grade":"K","day":26,"subject":"Math","strand":"Foundational Skills","requirement":"Computation"},{"id":"K-Math-D26-C2-A","grade":"K","day":26,"subject":"Math","strand":"Vocabulary","requirement":"difference"},{"id":"K-Math-D26-C3-L1","grade":"K","day":26,"subject":"Math","strand":"Core Math","requirement":"Subtract DecimalsSEM K Q1 Lesson 20-Math-Subtracting Decimals"},{"id":"K-Math-D27-C1-A","grade":"K","day":27,"subject":"Math","strand":"Foundational Skills","requirement":"Reasoning"},{"id":"K-Math-D27-C2-A","grade":"K","day":27,"subject":"Math","strand":"Vocabulary","requirement":"operation"},{"id":"K-Math-D27-C3-L1","grade":"K","day":27,"subject":"Math","strand":"Core Math","requirement":"Decimal Addition & Subtraction STEM K Q1 Lesson 21-Math- Decimal Practice"},{"id":"K-Math-D28-C1-A","grade":"K","day":28,"subject":"Math","strand":"Foundational Skills","requirement":"Computation"},{"id":"K-Math-D28-C2-A","grade":"K","day":28,"subject":"Math","strand":"Vocabulary","requirement":"product"},{"id":"K-Math-D28-C3-L1","grade":"K","day":28,"subject":"Math","strand":"Core Math","requirement":"Multiply Decimals STEM K Q1 Lesson 22-Math-Multiply Decimals"},{"id":"K-Math-D29-C1-A","grade":"K","day":29,"subject":"Math","strand":"Foundational Skills","requirement":"Analysis"},{"id":"K-Math-D29-C2-A","grade":"K","day":29,"subject":"Math","strand":"Vocabulary","requirement":"factor"},{"id":"K-Math-D29-C3-L1","grade":"K","day":29,"subject":"Math","strand":"Core Math","requirement":"Decimal MultiplicationSTEM K Q1 Lesson 23-Math-Decimal Multiplication"},{"id":"K-Math-D30-C1-A","grade":"K","day":30,"subject":"Math","strand":"Foundational Skills","requirement":"Computation"},{"id":"K-Math-D30-C2-A","grade":"K","day":30,"subject":"Math","strand":"Vocabulary","requirement":"quotient"},{"id":"K-Math-D30-C3-L1","grade":"K","day":30,"subject":"Math","strand":"Core Math","requirement":"Divide DecimalsSTEM K Q1 Lesson 24-Math-Dividing Decimals"},{"id":"K-Math-D31-C1-A","grade":"K","day":31,"subject":"Math","strand":"Foundational Skills","requirement":"Problem Solving"},{"id":"K-Math-D31-C2-A","grade":"K","day":31,"subject":"Math","strand":"Vocabulary","requirement":"strategy"},{"id":"K-Math-D31-C3-L1","grade":"K","day":31,"subject":"Math","strand":"Core Math","requirement":"Decimal Division STEM KQ1 Lesson 25-Math-Dividing Decimals Practice"},{"id":"K-Math-D32-C1-A","grade":"K","day":32,"subject":"Math","strand":"Foundational Skills","requirement":"Application"},{"id":"K-Math-D32-C2-A","grade":"K","day":32,"subject":"Math","strand":"Vocabulary","requirement":"algorithm"},{"id":"K-Math-D32-C3-L1","grade":"K","day":32,"subject":"Math","strand":"Core Math","requirement":"Multi-Step Decimal Problems STEM K Q1 Lesson 26-Math-Multi-step Decimals"},{"id":"K-Math-D33-C1-A","grade":"K","day":33,"subject":"Math","strand":"Foundational Skills","requirement":"Reasoning"},{"id":"K-Math-D33-C2-A","grade":"K","day":33,"subject":"Math","strand":"Vocabulary","requirement":"justify"},{"id":"K-Math-D33-C3-L1","grade":"K","day":33,"subject":"Math","strand":"Core Math","requirement":"Explain Decimal Strategies STEM K Q1 Lesson 27-Math-Decimal Strategies"},{"id":"K-Math-D34-C1-A","grade":"K","day":34,"subject":"Math","strand":"Foundational Skills","requirement":"Reflection"},{"id":"K-Math-D34-C2-A","grade":"K","day":34,"subject":"Math","strand":"Vocabulary","requirement":"precision"},{"id":"K-Math-D34-C3-A","grade":"K","day":34,"subject":"Math","strand":"Core Math","requirement":"Decimal Operations Review"},{"id":"K-Math-D35-C1-A","grade":"K","day":35,"subject":"Math","strand":"Foundational Skills","requirement":"Classification"},{"id":"K-Math-D35-C2-A","grade":"K","day":35,"subject":"Math","strand":"Vocabulary","requirement":"attributes"},{"id":"K-Math-D35-C3-L1","grade":"K","day":35,"subject":"Math","strand":"Core Math","requirement":"Classifying ShapesSTEM K Q1 Lesson 28-Math-Geometrical Shapes"},{"id":"K-Math-D36-C1-A","grade":"K","day":36,"subject":"Math","strand":"Foundational Skills","requirement":"Geometry"},{"id":"K-Math-D36-C2-A","grade":"K","day":36,"subject":"Math","strand":"Vocabulary","requirement":"hierarchy"},{"id":"K-Math-D36-C3-L1","grade":"K","day":36,"subject":"Math","strand":"Core Math","requirement":"Shape RelationshipsSTEM K Q1 Lesson 29-Math-Shapes Relationship"},{"id":"K-Math-D37-C1-A","grade":"K","day":37,"subject":"Math","strand":"Foundational Skills","requirement":"Analysis"},{"id":"K-Math-D37-C2-A","grade":"K","day":37,"subject":"Math","strand":"Vocabulary","requirement":"quadrilateral, rectangle, square"},{"id":"K-Math-D37-C3-L1","grade":"K","day":37,"subject":"Math","strand":"Core Math","requirement":"Categories of Figures STEM K Q1 Lesson 30-Math-Categories of Shapes"},{"id":"K-Math-D38-C1-A","grade":"K","day":38,"subject":"Math","strand":"Foundational Skills","requirement":"Flavor Assessment"},{"id":"K-Math-D38-C2-A","grade":"K","day":38,"subject":"Math","strand":"Vocabulary","requirement":"all vocabulary"},{"id":"K-Math-D38-C3-A","grade":"K","day":38,"subject":"Math","strand":"Core Math","requirement":"Assessment"},{"id":"K-Math-D39-C1-A","grade":"K","day":39,"subject":"Math","strand":"Foundational Skills","requirement":"Core Assessment"},{"id":"K-Math-D39-C2-A","grade":"K","day":39,"subject":"Math","strand":"Vocabulary","requirement":"all vocabulary"},{"id":"K-Math-D39-C3-A","grade":"K","day":39,"subject":"Math","strand":"Core Math","requirement":"Core Assessment"},{"id":"K-Math-D40-C1-A","grade":"K","day":40,"subject":"Math","strand":"Foundational Skills","requirement":"Reflection, review, extension, make-up"},{"id":"K-Math-D40-C2-A","grade":"K","day":40,"subject":"Math","strand":"Vocabulary","requirement":"reflect, extend"},{"id":"K-Math-D40-C3-A","grade":"K","day":40,"subject":"Math","strand":"Core Math","requirement":"Review, Extension, Make-Up"},{"id":"I-Science-D1-C1-A","grade":"I","day":1,"subject":"Science","strand":"Foundational Skills","requirement":"Welcome to Science"},{"id":"I-Science-D1-C2-A","grade":"I","day":1,"subject":"Science","strand":"Vocabulary","requirement":"science, inquiry"},{"id":"I-Science-D1-C3-A","grade":"I","day":1,"subject":"Science","strand":"Core Science","requirement":"Welcome to Science"},{"id":"I-Science-D2-C1-A","grade":"I","day":2,"subject":"Science","strand":"Foundational Skills","requirement":"FLAVOR Introduction"},{"id":"I-Science-D2-C2-A","grade":"I","day":2,"subject":"Science","strand":"Vocabulary","requirement":"FLAVOR, evidence"},{"id":"I-Science-D2-C3-A","grade":"I","day":2,"subject":"Science","strand":"Core Science","requirement":"FLAVOR Introduction"},{"id":"I-Science-D3-C1-A","grade":"I","day":3,"subject":"Science","strand":"Foundational Skills","requirement":"Observation"},{"id":"I-Science-D3-C2-A","grade":"I","day":3,"subject":"Science","strand":"Vocabulary","requirement":"energy"},{"id":"I-Science-D3-C3-L1","grade":"I","day":3,"subject":"Science","strand":"Core Science","requirement":"What is energy? STEM I Q1 Lesson 1-Science-Speed and Energy"},{"id":"I-Science-D4-C1-A","grade":"I","day":4,"subject":"Science","strand":"Foundational Skills","requirement":"Measuring"},{"id":"I-Science-D4-C2-A","grade":"I","day":4,"subject":"Science","strand":"Vocabulary","requirement":"motion, speed"},{"id":"I-Science-D4-C3-L1","grade":"I","day":4,"subject":"Science","strand":"Core Science","requirement":"Motion and EnergySTEM I Q1 Lesson 2-Science-Motion and Energy"},{"id":"I-Science-D5-C1-A","grade":"I","day":5,"subject":"Science","strand":"Foundational Skills","requirement":"Data collection"},{"id":"I-Science-D5-C2-A","grade":"I","day":5,"subject":"Science","strand":"Vocabulary","requirement":"kinetic energy"},{"id":"I-Science-D5-C3-L1","grade":"I","day":5,"subject":"Science","strand":"Core Science","requirement":"Speed affects energySTEM I Q1 Lesson 3-Science-Speed and Energy"},{"id":"I-Science-D6-C1-A","grade":"I","day":6,"subject":"Science","strand":"Foundational Skills","requirement":"Analysis"},{"id":"I-Science-D6-C2-A","grade":"I","day":6,"subject":"Science","strand":"Vocabulary","requirement":"evidence"},{"id":"I-Science-D6-C3-L1","grade":"I","day":6,"subject":"Science","strand":"Core Science","requirement":"Comparing moving objects STEM I Q1 Lesson 4-Science-Comparing Two Objects"},{"id":"I-Science-D7-C1-A","grade":"I","day":7,"subject":"Science","strand":"Foundational Skills","requirement":"Communication"},{"id":"I-Science-D7-C2-A","grade":"I","day":7,"subject":"Science","strand":"Vocabulary","requirement":"explain"},{"id":"I-Science-D7-C3-L1","grade":"I","day":7,"subject":"Science","strand":"Core Science","requirement":"Energy in motionSTEM I Q1 Lesson 5-Science-Energy in Motion"},{"id":"I-Science-D8-C1-A","grade":"I","day":8,"subject":"Science","strand":"Foundational Skills","requirement":"Synthesis"},{"id":"I-Science-D8-C2-A","grade":"I","day":8,"subject":"Science","strand":"Vocabulary","requirement":"force"},{"id":"I-Science-D8-C3-A","grade":"I","day":8,"subject":"Science","strand":"Core Science","requirement":"Energy and motion review"},{"id":"I-Science-D9-C1-A","grade":"I","day":9,"subject":"Science","strand":"Foundational Skills","requirement":"Observation"},{"id":"I-Science-D9-C2-A","grade":"I","day":9,"subject":"Science","strand":"Vocabulary","requirement":"transfer"},{"id":"I-Science-D9-C3-L1","grade":"I","day":9,"subject":"Science","strand":"Core Science","requirement":"Introduction to energy transferSTEM I Q1 Lesson 6-Science- Energy Moving"},{"id":"I-Science-D10-C1-A","grade":"I","day":10,"subject":"Science","strand":"Foundational Skills","requirement":"Investigation"},{"id":"I-Science-D10-C2-A","grade":"I","day":10,"subject":"Science","strand":"Vocabulary","requirement":"sound energy"},{"id":"I-Science-D10-C3-L1","grade":"I","day":10,"subject":"Science","strand":"Core Science","requirement":"Sound transfers energySTEM I Q1 Lesson 7-Science-Sound Transfers Energy"},{"id":"I-Science-D11-C1-A","grade":"I","day":11,"subject":"Science","strand":"Foundational Skills","requirement":"Investigation"},{"id":"I-Science-D11-C2-A","grade":"I","day":11,"subject":"Science","strand":"Vocabulary","requirement":"light energy"},{"id":"I-Science-D11-C3-L1","grade":"I","day":11,"subject":"Science","strand":"Core Science","requirement":"Light transfers energySTEM I Q1 Lesson 8-Science-Light Transfers Energy"},{"id":"I-Science-D12-C1-A","grade":"I","day":12,"subject":"Science","strand":"Foundational Skills","requirement":"Investigation"},{"id":"I-Science-D12-C2-A","grade":"I","day":12,"subject":"Science","strand":"Vocabulary","requirement":"heat energy"},{"id":"I-Science-D12-C3-L1","grade":"I","day":12,"subject":"Science","strand":"Core Science","requirement":"Heat transfers energySTEM I Q1 Lesson 9-Science-Heat Transfers Energy"},{"id":"I-Science-D13-C1-A","grade":"I","day":13,"subject":"Science","strand":"Foundational Skills","requirement":"Observation"},{"id":"I-Science-D13-C2-A","grade":"I","day":13,"subject":"Science","strand":"Vocabulary","requirement":"electrical current"},{"id":"I-Science-D13-C3-L1","grade":"I","day":13,"subject":"Science","strand":"Core Science","requirement":"Electricity transfers energySTEM I Q1 Lesson10-Science-Electricity Transfers Energy"},{"id":"I-Science-D14-C1-A","grade":"I","day":14,"subject":"Science","strand":"Foundational Skills","requirement":"Data analysis"},{"id":"I-Science-D14-C2-A","grade":"I","day":14,"subject":"Science","strand":"Vocabulary","requirement":"conductor"},{"id":"I-Science-D14-C3-L1","grade":"I","day":14,"subject":"Science","strand":"Core Science","requirement":"Comparing energy transfer types STEM I Q1 Lesson 11-Science-Compare Energy Transfers"},{"id":"I-Science-D15-C1-A","grade":"I","day":15,"subject":"Science","strand":"Foundational Skills","requirement":"Reflection"},{"id":"I-Science-D15-C2-A","grade":"I","day":15,"subject":"Science","strand":"Vocabulary","requirement":"energy pathway"},{"id":"I-Science-D15-C3-A","grade":"I","day":15,"subject":"Science","strand":"Core Science","requirement":"Energy transfer review"},{"id":"I-Science-D16-C1-A","grade":"I","day":16,"subject":"Science","strand":"Foundational Skills","requirement":"Questioning"},{"id":"I-Science-D16-C2-A","grade":"I","day":16,"subject":"Science","strand":"Vocabulary","requirement":"collision"},{"id":"I-Science-D16-C3-L1","grade":"I","day":16,"subject":"Science","strand":"Core Science","requirement":"What happens when objects collide? STEM I Q1 Lesson 12-Science- Coliding Objects"},{"id":"I-Science-D17-C1-A","grade":"I","day":17,"subject":"Science","strand":"Foundational Skills","requirement":"Predicting"},{"id":"I-Science-D17-C2-A","grade":"I","day":17,"subject":"Science","strand":"Vocabulary","requirement":"impact"},{"id":"I-Science-D17-C3-L1","grade":"I","day":17,"subject":"Science","strand":"Core Science","requirement":"Predicting collision outcomes STEM I Q1 Lesson 13-Science-Predicting Collision Outcomes"},{"id":"I-Science-D18-C1-A","grade":"I","day":18,"subject":"Science","strand":"Foundational Skills","requirement":"Measuring"},{"id":"I-Science-D18-C2-A","grade":"I","day":18,"subject":"Science","strand":"Vocabulary","requirement":"momentum"},{"id":"I-Science-D18-C3-L1","grade":"I","day":18,"subject":"Science","strand":"Core Science","requirement":"Energy during collisions STEM I Q1 Lesson 14-Science-Energy During Collisions"},{"id":"I-Science-D19-C1-A","grade":"I","day":19,"subject":"Science","strand":"Foundational Skills","requirement":"Recording data"},{"id":"I-Science-D19-C2-A","grade":"I","day":19,"subject":"Science","strand":"Vocabulary","requirement":"transfer"},{"id":"I-Science-D19-C3-L1","grade":"I","day":19,"subject":"Science","strand":"Core Science","requirement":"Observing collision patterns STEM I Q1 Lesson 15-Science-Observing Collision Patterns"},{"id":"I-Science-D20-C1-A","grade":"I","day":20,"subject":"Science","strand":"Foundational Skills","requirement":"Cause and effect"},{"id":"I-Science-D20-C2-A","grade":"I","day":20,"subject":"Science","strand":"Vocabulary","requirement":"outcome"},{"id":"I-Science-D20-C3-L1","grade":"I","day":20,"subject":"Science","strand":"Core Science","requirement":"Energy changes in collisions STEM I Q1 Lesson 16-Science-Energy Changes in a Collision"},{"id":"I-Science-D21-C1-A","grade":"I","day":21,"subject":"Science","strand":"Foundational Skills","requirement":"Analysis"},{"id":"I-Science-D21-C2-A","grade":"I","day":21,"subject":"Science","strand":"Vocabulary","requirement":"evidence"},{"id":"I-Science-D21-C3-A","grade":"I","day":21,"subject":"Science","strand":"Core Science","requirement":"Collision review"},{"id":"I-Science-D22-C1-A","grade":"I","day":22,"subject":"Science","strand":"Foundational Skills","requirement":"Research"},{"id":"I-Science-D22-C2-A","grade":"I","day":22,"subject":"Science","strand":"Vocabulary","requirement":"natural resources"},{"id":"I-Science-D22-C3-L1","grade":"I","day":22,"subject":"Science","strand":"Core Science","requirement":"Sources of energySTEM I Q1 Lesson 17-Science- Speed Affects Energy"},{"id":"I-Science-D23-C1-A","grade":"I","day":23,"subject":"Science","strand":"Foundational Skills","requirement":"Research"},{"id":"I-Science-D23-C2-A","grade":"I","day":23,"subject":"Science","strand":"Vocabulary","requirement":"fossil fuels"},{"id":"I-Science-D23-C3-L1","grade":"I","day":23,"subject":"Science","strand":"Core Science","requirement":"Nonrenewable resources STEM I Q1 Lesson 18-Science-Nonrenewable Sources"},{"id":"I-Science-D24-C1-A","grade":"I","day":24,"subject":"Science","strand":"Foundational Skills","requirement":"Research"},{"id":"I-Science-D24-C2-A","grade":"I","day":24,"subject":"Science","strand":"Vocabulary","requirement":"renewable"},{"id":"I-Science-D24-C3-L1","grade":"I","day":24,"subject":"Science","strand":"Core Science","requirement":"Renewable resourcesSTEM I Q1 Lesson 19-Science-Renewable Sources"},{"id":"I-Science-D25-C1-A","grade":"I","day":25,"subject":"Science","strand":"Foundational Skills","requirement":"Analysis"},{"id":"I-Science-D25-C2-A","grade":"I","day":25,"subject":"Science","strand":"Vocabulary","requirement":"environment"},{"id":"I-Science-D25-C3-L1","grade":"I","day":25,"subject":"Science","strand":"Core Science","requirement":"Human use of resources STEM I Q1 Lesson 20-Science-Human Use of Resources"},{"id":"I-Science-D26-C1-A","grade":"I","day":26,"subject":"Science","strand":"Foundational Skills","requirement":"Communication"},{"id":"I-Science-D26-C2-A","grade":"I","day":26,"subject":"Science","strand":"Vocabulary","requirement":"conservation"},{"id":"I-Science-D26-C3-L1","grade":"I","day":26,"subject":"Science","strand":"Core Science","requirement":"Protecting resources STEM I Q1 Lesson 21-Science-Protecting Resources"},{"id":"I-Science-D27-C1-A","grade":"I","day":27,"subject":"Science","strand":"Foundational Skills","requirement":"Synthesis"},{"id":"I-Science-D27-C2-A","grade":"I","day":27,"subject":"Science","strand":"Vocabulary","requirement":"sustainability"},{"id":"I-Science-D27-C3-A","grade":"I","day":27,"subject":"Science","strand":"Core Science","requirement":"Energy resources review"},{"id":"I-Science-D28-C1-A","grade":"I","day":28,"subject":"Science","strand":"Foundational Skills","requirement":"Problem solving"},{"id":"I-Science-D28-C2-A","grade":"I","day":28,"subject":"Science","strand":"Vocabulary","requirement":"criteria"},{"id":"I-Science-D28-C3-L1","grade":"I","day":28,"subject":"Science","strand":"Core Science","requirement":"Engineering challenge introduction STEM I Q1 Lesson 22-Science-Engenieer Design"},{"id":"I-Science-D29-C1-A","grade":"I","day":29,"subject":"Science","strand":"Foundational Skills","requirement":"Planning"},{"id":"I-Science-D29-C2-A","grade":"I","day":29,"subject":"Science","strand":"Vocabulary","requirement":"constraints"},{"id":"I-Science-D29-C3-L1","grade":"I","day":29,"subject":"Science","strand":"Core Science","requirement":"Defining the problemSTEM I Q1 Lesson 23-Science-Define a Problem"},{"id":"I-Science-D30-C1-A","grade":"I","day":30,"subject":"Science","strand":"Foundational Skills","requirement":"Organization"},{"id":"I-Science-D30-C2-A","grade":"I","day":30,"subject":"Science","strand":"Vocabulary","requirement":"success criteria"},{"id":"I-Science-D30-C3-L1","grade":"I","day":30,"subject":"Science","strand":"Core Science","requirement":"Design requirementsSTEM I Q1 Lesson 24-Science-Design Requirement"},{"id":"I-Science-D31-C1-A","grade":"I","day":31,"subject":"Science","strand":"Foundational Skills","requirement":"Brainstorming"},{"id":"I-Science-D31-C2-A","grade":"I","day":31,"subject":"Science","strand":"Vocabulary","requirement":"solution"},{"id":"I-Science-D31-C3-L1","grade":"I","day":31,"subject":"Science","strand":"Core Science","requirement":"Generate multiple solutions STEM I Q1 Lesson 25-Math-Multiple Solutions"},{"id":"I-Science-D32-C1-A","grade":"I","day":32,"subject":"Science","strand":"Foundational Skills","requirement":"Evaluation"},{"id":"I-Science-D32-C2-A","grade":"I","day":32,"subject":"Science","strand":"Vocabulary","requirement":"prototype"},{"id":"I-Science-D32-C3-L1","grade":"I","day":32,"subject":"Science","strand":"Core Science","requirement":"Compare possible solutions STEM I Q1 Lesson 26-Science-Comparing Solutions"},{"id":"I-Science-D33-C1-A","grade":"I","day":33,"subject":"Science","strand":"Foundational Skills","requirement":"Decision making"},{"id":"I-Science-D33-C2-A","grade":"I","day":33,"subject":"Science","strand":"Vocabulary","requirement":"model"},{"id":"I-Science-D33-C3-L1","grade":"I","day":33,"subject":"Science","strand":"Core Science","requirement":"Select best solutionSTEM I Q1 Lesson 27-Science-Select Best Solution"},{"id":"I-Science-D34-C1-A","grade":"I","day":34,"subject":"Science","strand":"Foundational Skills","requirement":"Construction"},{"id":"I-Science-D34-C2-A","grade":"I","day":34,"subject":"Science","strand":"Vocabulary","requirement":"energy conversion"},{"id":"I-Science-D34-C3-A","grade":"I","day":34,"subject":"Science","strand":"Core Science","requirement":"Build prototype"},{"id":"I-Science-D35-C1-A","grade":"I","day":35,"subject":"Science","strand":"Foundational Skills","requirement":"Testing"},{"id":"I-Science-D35-C2-A","grade":"I","day":35,"subject":"Science","strand":"Vocabulary","requirement":"variables"},{"id":"I-Science-D35-C3-A","grade":"I","day":35,"subject":"Science","strand":"Core Science","requirement":"Fair testing procedures"},{"id":"I-Science-D36-C1-A","grade":"I","day":36,"subject":"Science","strand":"Foundational Skills","requirement":"Data analysis"},{"id":"I-Science-D36-C2-A","grade":"I","day":36,"subject":"Science","strand":"Vocabulary","requirement":"failure point"},{"id":"I-Science-D36-C3-A","grade":"I","day":36,"subject":"Science","strand":"Core Science","requirement":"Improve prototype"},{"id":"I-Science-D37-C1-A","grade":"I","day":37,"subject":"Science","strand":"Foundational Skills","requirement":"Communication"},{"id":"I-Science-D37-C2-A","grade":"I","day":37,"subject":"Science","strand":"Vocabulary","requirement":"refine"},{"id":"I-Science-D37-C3-A","grade":"I","day":37,"subject":"Science","strand":"Core Science","requirement":"Engineering showcase"},{"id":"I-Science-D38-C1-A","grade":"I","day":38,"subject":"Science","strand":"Foundational Skills","requirement":"Flavor Assessment"},{"id":"I-Science-D38-C2-A","grade":"I","day":38,"subject":"Science","strand":"Vocabulary","requirement":"all vocabulary"},{"id":"I-Science-D38-C3-A","grade":"I","day":38,"subject":"Science","strand":"Core Science","requirement":"FLAVOR Assessment"},{"id":"I-Science-D39-C1-A","grade":"I","day":39,"subject":"Science","strand":"Foundational Skills","requirement":"Core Assessment"},{"id":"I-Science-D39-C2-A","grade":"I","day":39,"subject":"Science","strand":"Vocabulary","requirement":"all vocabulary"},{"id":"I-Science-D39-C3-A","grade":"I","day":39,"subject":"Science","strand":"Core Science","requirement":"Core Assessment"},{"id":"I-Science-D40-C1-A","grade":"I","day":40,"subject":"Science","strand":"Foundational Skills","requirement":"Reflection, review, extension, make-up"},{"id":"I-Science-D40-C2-A","grade":"I","day":40,"subject":"Science","strand":"Vocabulary","requirement":"reflect, extend"},{"id":"I-Science-D40-C3-A","grade":"I","day":40,"subject":"Science","strand":"Core Science","requirement":"Review, Extension, Make-Up"},{"id":"K-Science-D1-C1-A","grade":"K","day":1,"subject":"Science","strand":"Foundational Skills","requirement":"Welcome to Math"},{"id":"K-Science-D1-C2-A","grade":"K","day":1,"subject":"Science","strand":"Vocabulary","requirement":"inquiry, observation, evidence, curiosity, engineer"},{"id":"K-Science-D1-C3-A","grade":"K","day":1,"subject":"Science","strand":"Core Science","requirement":"Course introduction; Science notebooks; Scientific expectations"},{"id":"K-Science-D1-C4-A","grade":"K","day":1,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Classroom procedures; Pre-assessment"},{"id":"K-Science-D2-C1-A","grade":"K","day":2,"subject":"Science","strand":"Foundational Skills","requirement":"Flavor Day: Engineering Challenge"},{"id":"K-Science-D2-C2-A","grade":"K","day":2,"subject":"Science","strand":"Vocabulary","requirement":"innovation, prototype, collaboration, creativity"},{"id":"K-Science-D2-C3-A","grade":"K","day":2,"subject":"Science","strand":"Core Science","requirement":"STEM tower challenge introducing engineering process"},{"id":"K-Science-D2-C4-A","grade":"K","day":2,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Exit ticket Student reflection"},{"id":"K-Science-D3-C1-A","grade":"K","day":3,"subject":"Science","strand":"Foundational Skills","requirement":"Asking Scientific Questions"},{"id":"K-Science-D3-C2-A","grade":"K","day":3,"subject":"Science","strand":"Vocabulary","requirement":"criteria, constraints, variables"},{"id":"K-Science-D3-C3-L1","grade":"K","day":3,"subject":"Science","strand":"Core Science","requirement":"Define design problems STEM K Q1 Lesson 1 -Science-Simple Designs"},{"id":"K-Science-D3-C4-A","grade":"K","day":3,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Exit ticket"},{"id":"K-Science-D4-C1-A","grade":"K","day":4,"subject":"Science","strand":"Foundational Skills","requirement":"Identifying Problems"},{"id":"K-Science-D4-C2-A","grade":"K","day":4,"subject":"Science","strand":"Vocabulary","requirement":"optimize, evaluate, redesign"},{"id":"K-Science-D4-C3-L1","grade":"K","day":4,"subject":"Science","strand":"Core Science","requirement":"Identify needs vs. wants; design challenge STEM K Q1 Lesson 2-Science-Needs vs. Wants"},{"id":"K-Science-D4-C4-A","grade":"K","day":4,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Design journal"},{"id":"K-Science-D5-C1-A","grade":"K","day":5,"subject":"Science","strand":"Foundational Skills","requirement":"Engineering Planning"},{"id":"K-Science-D5-C2-A","grade":"K","day":5,"subject":"Science","strand":"Vocabulary","requirement":"blueprint, prototype, efficiency"},{"id":"K-Science-D5-C3-L1","grade":"K","day":5,"subject":"Science","strand":"Core Science","requirement":"Sketch engineering solutions STEM K Q1 Lesson 4-Science-Sketching Engineer Solutions"},{"id":"K-Science-D5-C4-A","grade":"K","day":5,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Teacher conference"},{"id":"K-Science-D6-C1-A","grade":"K","day":6,"subject":"Science","strand":"Foundational Skills","requirement":"Comparing Solutions"},{"id":"K-Science-D6-C2-A","grade":"K","day":6,"subject":"Science","strand":"Vocabulary","requirement":"advantages, disadvantages, trade-offs"},{"id":"K-Science-D6-C3-L1","grade":"K","day":6,"subject":"Science","strand":"Core Science","requirement":"Compare multiple solutions STEM K Q1 Lesson 4-Science- Comparing Multiple Solutions"},{"id":"K-Science-D6-C4-A","grade":"K","day":6,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Rubric scoring"},{"id":"K-Science-D7-C1-A","grade":"K","day":7,"subject":"Science","strand":"Foundational Skills","requirement":"Fair Testing"},{"id":"K-Science-D7-C2-A","grade":"K","day":7,"subject":"Science","strand":"Vocabulary","requirement":"controlled variable, independent variable, dependent variable"},{"id":"K-Science-D7-C3-L1","grade":"K","day":7,"subject":"Science","strand":"Core Science","requirement":"Plan controlled investigations (STEM K Q1 Lesson 5-Science-Engineer Designs"},{"id":"K-Science-D7-C4-A","grade":"K","day":7,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Lab planning sheet"},{"id":"K-Science-D8-C1-A","grade":"K","day":8,"subject":"Science","strand":"Foundational Skills","requirement":"Lab planning sheet"},{"id":"K-Science-D8-C2-A","grade":"K","day":8,"subject":"Science","strand":"Vocabulary","requirement":"quantitative, qualitative, analyze"},{"id":"K-Science-D8-C3-A","grade":"K","day":8,"subject":"Science","strand":"Core Science","requirement":"Conduct engineering tests"},{"id":"K-Science-D8-C4-A","grade":"K","day":8,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Lab notebook"},{"id":"K-Science-D9-C1-A","grade":"K","day":9,"subject":"Science","strand":"Foundational Skills","requirement":"Improving Designs"},{"id":"K-Science-D9-C2-A","grade":"K","day":9,"subject":"Science","strand":"Vocabulary","requirement":"iteration, modification, optimization"},{"id":"K-Science-D9-C3-L1","grade":"K","day":9,"subject":"Science","strand":"Core Science","requirement":"Improve prototype from evidence STEM K Q1 Lesson 6-Science-Improve Prototype"},{"id":"K-Science-D9-C4-A","grade":"K","day":9,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Prototype revision"},{"id":"K-Science-D10-C1-A","grade":"K","day":10,"subject":"Science","strand":"Foundational Skills","requirement":"Engineering Review"},{"id":"K-Science-D10-C2-A","grade":"K","day":10,"subject":"Science","strand":"Vocabulary","requirement":"evidence-based reasoning"},{"id":"K-Science-D10-C3-A","grade":"K","day":10,"subject":"Science","strand":"Core Science","requirement":"Engineering Performance Task"},{"id":"K-Science-D10-C4-A","grade":"K","day":10,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Teacher-created assessment"},{"id":"K-Science-D11-C1-A","grade":"K","day":11,"subject":"Science","strand":"Foundational Skills","requirement":"Understanding Energy"},{"id":"K-Science-D11-C2-A","grade":"K","day":11,"subject":"Science","strand":"Vocabulary","requirement":"radiant energy, thermal energy, chemical energy"},{"id":"K-Science-D11-C3-L1","grade":"K","day":11,"subject":"Science","strand":"Core Science","requirement":"Forms of energy; Energy from the Sun ( STEM K Q1 Lesson 11 - Science - The Sun"},{"id":"K-Science-D11-C4-A","grade":"K","day":11,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Vocabulary quiz"},{"id":"K-Science-D12-C1-A","grade":"K","day":12,"subject":"Science","strand":"Foundational Skills","requirement":"Energy Transfer"},{"id":"K-Science-D12-C2-A","grade":"K","day":12,"subject":"Science","strand":"Vocabulary","requirement":"transfer, transformation, absorption"},{"id":"K-Science-D12-C3-L1","grade":"K","day":12,"subject":"Science","strand":"Core Science","requirement":"How sunlight becomes stored energy STEM K Q1 Lesson 8-Science-Sunlight as Stored Energy"},{"id":"K-Science-D12-C4-A","grade":"K","day":12,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Diagram labeling"},{"id":"K-Science-D13-C1-A","grade":"K","day":13,"subject":"Science","strand":"Foundational Skills","requirement":"Photosynthesis Introduction"},{"id":"K-Science-D13-C2-A","grade":"K","day":13,"subject":"Science","strand":"Vocabulary","requirement":"chlorophyll, glucose, photosynthesis"},{"id":"K-Science-D13-C3-L1","grade":"K","day":13,"subject":"Science","strand":"Core Science","requirement":"Plants capture solar energySTEM K Q1 Lesson 9-Science-Plants Capture Solar Energy"},{"id":"K-Science-D13-C4-A","grade":"K","day":13,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Interactive notebook"},{"id":"K-Science-D14-C1-A","grade":"K","day":14,"subject":"Science","strand":"Foundational Skills","requirement":"Food Chains"},{"id":"K-Science-D14-C2-A","grade":"K","day":14,"subject":"Science","strand":"Vocabulary","requirement":"producer, consumer, decomposer"},{"id":"K-Science-D14-C3-L1","grade":"K","day":14,"subject":"Science","strand":"Core Science","requirement":"Energy moves through food chain STEM K Q1 Lesson 10-Science- Energy Through the Food Chain"},{"id":"K-Science-D14-C4-A","grade":"K","day":14,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Food chain cards"},{"id":"K-Science-D15-C1-A","grade":"K","day":15,"subject":"Science","strand":"Foundational Skills","requirement":"Food Webs"},{"id":"K-Science-D15-C2-A","grade":"K","day":15,"subject":"Science","strand":"Vocabulary","requirement":"ecosystem, trophic level"},{"id":"K-Science-D15-C3-L1","grade":"K","day":15,"subject":"Science","strand":"Core Science","requirement":"Build food webs showing energy flowSTEM K Q1 Lesson 11-Science-Food Webs"},{"id":"K-Science-D15-C4-A","grade":"K","day":15,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Collaborative activity"},{"id":"K-Science-D16-C1-A","grade":"K","day":16,"subject":"Science","strand":"Foundational Skills","requirement":"Animal Energy"},{"id":"K-Science-D16-C2-A","grade":"K","day":16,"subject":"Science","strand":"Vocabulary","requirement":"metabolism, nutrients, cellular respiration"},{"id":"K-Science-D16-C3-L1","grade":"K","day":16,"subject":"Science","strand":"Core Science","requirement":"Animals use stored plant energy STEM K Q1 Lesson 12-Science- Animals Use Stored Energy"},{"id":"K-Science-D16-C4-A","grade":"K","day":16,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"writing"},{"id":"K-Science-D17-C1-A","grade":"K","day":17,"subject":"Science","strand":"Foundational Skills","requirement":"Modeling Energy Flow"},{"id":"K-Science-D17-C2-A","grade":"K","day":17,"subject":"Science","strand":"Vocabulary","requirement":"model, energy pathway"},{"id":"K-Science-D17-C3-L1","grade":"K","day":17,"subject":"Science","strand":"Core Science","requirement":"Build models showing energy transfer STEM K Q1 Lesson 13-Math-Build Energy Transfer Models"},{"id":"K-Science-D17-C4-A","grade":"K","day":17,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Model rubric"},{"id":"K-Science-D18-C1-A","grade":"K","day":18,"subject":"Science","strand":"Foundational Skills","requirement":"Scientific Argumentation"},{"id":"K-Science-D18-C2-A","grade":"K","day":18,"subject":"Science","strand":"Vocabulary","requirement":"claim, evidence, reasoning"},{"id":"K-Science-D18-C3-L1","grade":"K","day":18,"subject":"Science","strand":"Core Science","requirement":"Support claims about energy from the Sun STEM K Q1 Lesson 14_Science-Energy and the Sun"},{"id":"K-Science-D18-C4-A","grade":"K","day":18,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Assessment"},{"id":"K-Science-D19-C1-A","grade":"K","day":19,"subject":"Science","strand":"Foundational Skills","requirement":"Plant Structures"},{"id":"K-Science-D19-C2-A","grade":"K","day":19,"subject":"Science","strand":"Vocabulary","requirement":"roots, stems, leaves, vascular tissue"},{"id":"K-Science-D19-C3-L1","grade":"K","day":19,"subject":"Science","strand":"Core Science","requirement":"Plant structures and functions STEM K Q1 Lesson 2-Science-Plants Need Air"},{"id":"K-Science-D19-C4-A","grade":"K","day":19,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Labeling activity"},{"id":"K-Science-D20-C1-A","grade":"K","day":20,"subject":"Science","strand":"Foundational Skills","requirement":"Plant Needs"},{"id":"K-Science-D20-C2-A","grade":"K","day":20,"subject":"Science","strand":"Vocabulary","requirement":"nutrients, carbon dioxide, water vapor"},{"id":"K-Science-D20-C3-L1","grade":"K","day":20,"subject":"Science","strand":"Core Science","requirement":"Plants obtain materials from air and water STEM K Q1 Lesson 16-Science-Plants"},{"id":"K-Science-D20-C4-A","grade":"K","day":20,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Exit ticket"},{"id":"K-Science-D21-C1-A","grade":"K","day":21,"subject":"Science","strand":"Foundational Skills","requirement":"Photosynthesis Deep Dive"},{"id":"K-Science-D21-C2-A","grade":"K","day":21,"subject":"Science","strand":"Vocabulary","requirement":"stomata, oxygen, carbon dioxide"},{"id":"K-Science-D21-C3-L1","grade":"K","day":21,"subject":"Science","strand":"Core Science","requirement":"Explain plant growth processes STEM K Q1 Lesson 17-Science-Plant Growth Process"},{"id":"K-Science-D21-C4-A","grade":"K","day":21,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Foldable"},{"id":"K-Science-D22-C1-A","grade":"K","day":22,"subject":"Science","strand":"Foundational Skills","requirement":"Conducting Investigations"},{"id":"K-Science-D22-C2-A","grade":"K","day":22,"subject":"Science","strand":"Vocabulary","requirement":"hypothesis, observation, prediction"},{"id":"K-Science-D22-C3-A","grade":"K","day":22,"subject":"Science","strand":"Core Science","requirement":"Plant growth investigation review"},{"id":"K-Science-D22-C4-A","grade":"K","day":22,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Lab notebook"},{"id":"K-Science-D23-C1-A","grade":"K","day":23,"subject":"Science","strand":"Foundational Skills","requirement":"Data Analysis"},{"id":"K-Science-D23-C2-A","grade":"K","day":23,"subject":"Science","strand":"Vocabulary","requirement":"graph, trend, conclusion"},{"id":"K-Science-D23-C3-L1","grade":"K","day":23,"subject":"Science","strand":"Core Science","requirement":"Analyze plant growth data STEM K Q1 Lesson 18-Science-Plant Growth Analysis"},{"id":"K-Science-D23-C4-A","grade":"K","day":23,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Graphing assessment"},{"id":"K-Science-D24-C1-A","grade":"K","day":24,"subject":"Science","strand":"Foundational Skills","requirement":"Scientific Research"},{"id":"K-Science-D24-C2-A","grade":"K","day":24,"subject":"Science","strand":"Vocabulary","requirement":"justify, support, evidence"},{"id":"K-Science-D24-C3-A","grade":"K","day":24,"subject":"Science","strand":"Core Science","requirement":"Describe how plants obtain materials"},{"id":"K-Science-D24-C4-L1","grade":"K","day":24,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Writing \n5th Grade Informative Writing Rubric"},{"id":"K-Science-D25-C1-A","grade":"K","day":25,"subject":"Science","strand":"Foundational Skills","requirement":"Ecosystem Components"},{"id":"K-Science-D25-C2-A","grade":"K","day":25,"subject":"Science","strand":"Vocabulary","requirement":"ecosystem, habitat, organism"},{"id":"K-Science-D25-C3-L1","grade":"K","day":25,"subject":"Science","strand":"Core Science","requirement":"Ecosystem interactions STEM K Q1 Lesson 19-Science- Ecosystems"},{"id":"K-Science-D25-C4-A","grade":"K","day":25,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Vocabulary review"},{"id":"K-Science-D26-C1-A","grade":"K","day":26,"subject":"Science","strand":"Foundational Skills","requirement":"Matter Cycling"},{"id":"K-Science-D26-C2-A","grade":"K","day":26,"subject":"Science","strand":"Vocabulary","requirement":"matter, nutrient cycle"},{"id":"K-Science-D26-C3-L1","grade":"K","day":26,"subject":"Science","strand":"Core Science","requirement":"Matter moves through ecosystems STEM K Q1 Lesson 20-Science-Matter and Ecosystems"},{"id":"K-Science-D26-C4-A","grade":"K","day":26,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Diagram practice"},{"id":"K-Science-D27-C1-A","grade":"K","day":27,"subject":"Science","strand":"Foundational Skills","requirement":"Producers & Consumers"},{"id":"K-Science-D27-C2-A","grade":"K","day":27,"subject":"Science","strand":"Vocabulary","requirement":"herbivore, carnivore, omnivore"},{"id":"K-Science-D27-C3-L1","grade":"K","day":27,"subject":"Science","strand":"Core Science","requirement":"Roles in ecosystems STEM K Q1 Lesson 21-Science-Roles in Ecosystems"},{"id":"K-Science-D27-C4-A","grade":"K","day":27,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Card sort"},{"id":"K-Science-D28-C1-A","grade":"K","day":28,"subject":"Science","strand":"Foundational Skills","requirement":"Decomposers"},{"id":"K-Science-D28-C2-A","grade":"K","day":28,"subject":"Science","strand":"Vocabulary","requirement":"fungi, bacteria, decomposition"},{"id":"K-Science-D28-C3-L1","grade":"K","day":28,"subject":"Science","strand":"Core Science","requirement":"Recycling matter STEM K Q1 Lesson 22-Science-Recycling Matter"},{"id":"K-Science-D28-C4-A","grade":"K","day":28,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Observation journal"},{"id":"K-Science-D29-C1-A","grade":"K","day":29,"subject":"Science","strand":"Foundational Skills","requirement":"Building Models"},{"id":"K-Science-D29-C2-A","grade":"K","day":29,"subject":"Science","strand":"Vocabulary","requirement":"systems model, interactions"},{"id":"K-Science-D29-C3-A","grade":"K","day":29,"subject":"Science","strand":"Core Science","requirement":"Construct ecosystem models"},{"id":"K-Science-D29-C4-L1","grade":"K","day":29,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Model rubric 5th-Grade Ecosystem Project Rubric"},{"id":"K-Science-D30-C1-A","grade":"K","day":30,"subject":"Science","strand":"Foundational Skills","requirement":"Human Impact"},{"id":"K-Science-D30-C2-A","grade":"K","day":30,"subject":"Science","strand":"Vocabulary","requirement":"conservation, sustainability"},{"id":"K-Science-D30-C3-L1","grade":"K","day":30,"subject":"Science","strand":"Core Science","requirement":"Human influence on ecosystems STEM K Q1 Lesson 23-Science-Human Influence on Ecosystem"},{"id":"K-Science-D30-C4-A","grade":"K","day":30,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Discussion"},{"id":"K-Science-D31-C1-A","grade":"K","day":31,"subject":"Science","strand":"Foundational Skills","requirement":"Energy vs. Matter"},{"id":"K-Science-D31-C2-A","grade":"K","day":31,"subject":"Science","strand":"Vocabulary","requirement":"cycle, flow, transformation"},{"id":"K-Science-D31-C3-L1","grade":"K","day":31,"subject":"Science","strand":"Core Science","requirement":"Compare energy flow and matter cycling STEM K Q1 Lesson 24-Science-Compare Energy and Matter"},{"id":"K-Science-D31-C4-A","grade":"K","day":31,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Venn diagram"},{"id":"K-Science-D32-C1-A","grade":"K","day":32,"subject":"Science","strand":"Foundational Skills","requirement":"Ecosystem Investigation"},{"id":"K-Science-D32-C2-A","grade":"K","day":32,"subject":"Science","strand":"Vocabulary","requirement":"biodiversity, stability"},{"id":"K-Science-D32-C3-A","grade":"K","day":32,"subject":"Science","strand":"Core Science","requirement":"Analyze ecosystem changes"},{"id":"K-Science-D32-C4-A","grade":"K","day":32,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Lab report"},{"id":"K-Science-D33-C1-A","grade":"K","day":33,"subject":"Science","strand":"Foundational Skills","requirement":"Integrated Engineering Project"},{"id":"K-Science-D33-C2-A","grade":"K","day":33,"subject":"Science","strand":"Vocabulary","requirement":"innovation, solution, criteria, redesign"},{"id":"K-Science-D33-C3-L1","grade":"K","day":33,"subject":"Science","strand":"Core Science","requirement":"Apply engineering process to ecosystem or plant challenge (3-5 ETS1.1–1.3) STEM K Q1 Lesson 28-Science-Engineer Designs"},{"id":"K-Science-D33-C4-A","grade":"K","day":33,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Project workday"},{"id":"K-Science-D34-C1-A","grade":"K","day":34,"subject":"Science","strand":"Foundational Skills","requirement":"Integrated Engineering Project"},{"id":"K-Science-D34-C2-A","grade":"K","day":34,"subject":"Science","strand":"Vocabulary","requirement":"innovation, solution, criteria, redesign"},{"id":"K-Science-D34-C3-L1","grade":"K","day":34,"subject":"Science","strand":"Core Science","requirement":"Apply engineering process to ecosystem or plant challenge STEM K Q1 Lesson 26-Science-Engineering Process"},{"id":"K-Science-D34-C4-A","grade":"K","day":34,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Project workday"},{"id":"K-Science-D35-C1-A","grade":"K","day":35,"subject":"Science","strand":"Foundational Skills","requirement":"Science Performance Task"},{"id":"K-Science-D35-C2-A","grade":"K","day":35,"subject":"Science","strand":"Vocabulary","requirement":"synthesis, evaluation, justification"},{"id":"K-Science-D35-C3-A","grade":"K","day":35,"subject":"Science","strand":"Core Science","requirement":"Present engineering solution using evidence"},{"id":"K-Science-D35-C4-A","grade":"K","day":35,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Presentation rubric"},{"id":"K-Science-D36-C1-A","grade":"K","day":36,"subject":"Science","strand":"Foundational Skills","requirement":"Science Performance Task"},{"id":"K-Science-D36-C2-A","grade":"K","day":36,"subject":"Science","strand":"Vocabulary","requirement":"synthesis, evaluation, justification"},{"id":"K-Science-D36-C3-A","grade":"K","day":36,"subject":"Science","strand":"Core Science","requirement":"Present engineering solution using evidence"},{"id":"K-Science-D36-C4-A","grade":"K","day":36,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Presentation rubric"},{"id":"K-Science-D37-C1-A","grade":"K","day":37,"subject":"Science","strand":"Foundational Skills","requirement":"Project Redsign"},{"id":"K-Science-D37-C2-A","grade":"K","day":37,"subject":"Science","strand":"Vocabulary","requirement":"redesign"},{"id":"K-Science-D37-C3-A","grade":"K","day":37,"subject":"Science","strand":"Core Science","requirement":"Solution Discussion"},{"id":"K-Science-D37-C4-A","grade":"K","day":37,"subject":"Science","strand":"Teacher created,\nAnecdotal, Assessment/ Check point","requirement":"Lab notebook"},{"id":"K-Science-D38-C1-A","grade":"K","day":38,"subject":"Science","strand":"Foundational Skills","requirement":"Flavor Assessment"},{"id":"K-Science-D38-C2-A","grade":"K","day":38,"subject":"Science","strand":"Vocabulary","requirement":"all vocabulary"},{"id":"K-Science-D38-C3-A","grade":"K","day":38,"subject":"Science","strand":"Core Science","requirement":"Assessment"},{"id":"K-Science-D39-C1-A","grade":"K","day":39,"subject":"Science","strand":"Foundational Skills","requirement":"Core Assessment"},{"id":"K-Science-D39-C2-A","grade":"K","day":39,"subject":"Science","strand":"Vocabulary","requirement":"all vocabulary"},{"id":"K-Science-D39-C3-A","grade":"K","day":39,"subject":"Science","strand":"Core Science","requirement":"Core Assessment"},{"id":"K-Science-D40-C1-A","grade":"K","day":40,"subject":"Science","strand":"Foundational Skills","requirement":"Reflection, review, extension, make-up"},{"id":"K-Science-D40-C2-A","grade":"K","day":40,"subject":"Science","strand":"Vocabulary","requirement":"reflect, extend"},{"id":"K-Science-D40-C3-A","grade":"K","day":40,"subject":"Science","strand":"Core Science","requirement":"Review, Extension, Make-Up"}];
/* ==========================================================================
   CURRICULUM QUEST PRACTICE PLANNER
   Turns one curriculum mission into auto-graded practice on that mission's
   own standard. The standard comes from the pacing guide's day ranges, so a
   mission can never be given practice from a different lesson.
   ========================================================================== */

/* DW_CURRIC_PLAN maps every curriculum item id -> {standards, iCan, skills}.
   Emitted by curric-map.py from q1-curriculum-data.js. */

function dwCurricEntry(item){
  return (typeof DW_CURRIC_PLAN!=="undefined" && DW_CURRIC_PLAN[item.id]) || null;
}

/* Vocabulary strands list the day's terms directly in the requirement text. */
function dwLessonTerms(item){
  return String(item.requirement||"")
    .split(/[,\n]/).map(s=>s.trim())
    .filter(s=>s && s.length<30 && /^[a-z][a-z0-9 /'-]*$/i.test(s));
}

/* Morphology missions name the root and the target word. */
function dwMorphParts(item){
  const t=String(item.requirement||"");
  const root=(t.match(/M[o0]r?ph[o0]?eme\s*\n?\s*([^\n]+)/i)||[])[1];
  const word=(t.match(/Word\s*\n?\s*([^\n]+)/i)||[])[1];
  return {root:(root||"").trim(), word:(word||"").trim()};
}
function dwMorphLesson(item,parts){
  const rows=typeof window!=="undefined"&&window.DRAGONSWOOD_DATA?.morphology||[];
  return rows.find(m=>m.grade===item.grade&&String(m.word||"").toLowerCase()===String(parts.word||"").toLowerCase())||null;
}

/* Which strands should stay teacher-observed rather than becoming a quiz. */
function dwObservationOnly(item){
  const t=((item.requirement||"")+" "+(item.strand||"")).toLowerCase();
  return /progress monitor|fluency|partner read|listen to students|cursive:|dictation|anecdotal|check ?point|present and share/.test(t);
}

/* Teacher Verify is required only where a human has to judge the work. */
function dwNeedsTeacherVerify(item){
  if(item.subject==="Science") return true;
  if(/writing/i.test(item.strand||"")) return true;
  return dwObservationOnly(item);
}

/* Build N auto-graded questions for one curriculum mission. */
function dwCurricPractice(item, count){
  count = count || 6;
  if(dwObservationOnly(item)) return [];
  const entry=dwCurricEntry(item);
  const out=[], seen=new Set();
  const seedBase = hashNumSafe(item.id);

  const pushFrom=(skillId, params, n)=>{
    for(let k=0; k<n*14 && out.length<count; k++){
      const q = params
        ? dwQuestionWithParams(skillId, params, seedBase+k*9973, k)
        : dwQuestion(skillId, seedBase+k*9973, k, "", "");
      if(!q || q.source!=="registry") continue;
      const sig=(q.prompt+"|"+[...q.choices].sort().join("|")).toLowerCase();
      if(seen.has(sig)) continue;
      seen.add(sig); out.push(q);
    }
  };

  // 1. vocabulary strand -> ask about this lesson's own terms.
  //    An "all vocabulary" review day draws on every term taught so far.
  if(/vocabulary/i.test(item.strand||"")){
    const all=/all vocabulary|assessment/i.test(item.requirement||"");
    const terms=all ? dwAllTermsUpTo(item) : dwLessonTerms(item);
    if(terms.length) pushFrom("curric.vocab", {terms}, count);
  }
  // 2. morphology -> ask about this week's root and word
  const mp=dwMorphParts(item);
  if(mp.root){
    const ml=dwMorphLesson(item,mp);
    pushFrom("curric.morph", Object.assign({root:mp.root,word:mp.word},ml?{
      phonological:ml.phonological,orthographic:ml.orthographic,morphological:ml.morphological,
      syntactic:ml.syntactic,etymological:ml.etymological,application:ml.application
    }:{}), count);
  }

  // 3. HUM has no day ranges in the pacing guide, so pick skills from the
  //    mission's own topic rather than from every HUM standard at once.
  let skills=((entry&&entry.skills)||[]).filter(s=>dwSkillMatchesSubject(item,s));
  const topicSkills=dwTopicSkills(item);
  if(topicSkills.length) skills=topicSkills;
  for(const s of skills){ if(out.length>=count) break; pushFrom(s, null, Math.ceil(count/Math.max(1,skills.length))+2); }
  // top up from the first skill if we are short
  if(out.length<count && skills.length) pushFrom(skills[0], null, count);

  // Assessment / "all vocabulary" days sit past the last standard's day range.
  // Those get a cumulative review drawn from everything taught earlier in Q1.
  if(out.length<count){
    for(const s of dwCumulativeSkills(item)){ if(out.length>=count) break; pushFrom(s, null, 3); }
  }

  return out.slice(0,count);
}

function hashNumSafe(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return Math.abs(h>>>0)%100000}

/* Same as dwQuestion but lets the caller override the registry params, which
   is how a vocabulary or morphology mission passes in its own words. */
function dwQuestionWithParams(skillId, params, seed, i){
  const entry=DW_SKILLS[skillId];
  if(!entry) return null;
  const [label, family] = entry;
  const gen = MATH_GEN[family]||ELA_GEN[family]||WRITING_GEN[family]||SCI_GEN[family]||VOCAB_GEN[family]||MORPH_GEN[family];
  if(!gen) return null;
  for(let a=0;a<6;a++){
    try{
      const r=hashSeed(Number(seed||1)+i*37+a*7919);
      const q=gen(r, Object.assign({}, entry[2]||{}, params||{}), i+a);
      if(dwValidQuestion(q)&&(!window.DWGrading||window.DWGrading.assertQuestion(q,`${skillId} parameterized attempt ${a+1}`)))
        return Object.assign({},q,{skillId,label,source:"registry",family});
    }catch(err){}
  }
  return null;
}


/* Topic-based skill match, used where the standard alone is not specific
   enough to say what today's mission is actually about. */
const DW_TOPIC_RULES=[
  [/first or third person|point of view|who.?s telling/i, ["ela.pov"]],
  [/character/i,                    ["ela.character","ela.meaning"]],
  [/inference|between the lines/i,  ["ela.meaning","ela.supporting"]],
  [/compound sentence/i,             ["ela.sent.compound","ela.pk.combining_sentences"]],
  [/fanboys|coordinating conjunction/i, ["ela.conj.coordinating","ela.sent.compound"]],
  [/capitaliz/i,                    ["ela.capitalization"]],
  [/comma|quotation|dialogue|direct speech/i, ["ela.commas","ela.dialogue"]],
  [/peer review|revis|edit/i,       ["ela.editing","ela.usage"]],
  [/expand|combine|build it/i,      ["ela.pk.expanding_sentences","ela.pk.combining_sentences"]],
  [/opinion/i,                      ["ela.opinion","ela.topicsentence"]],
  [/topic sentence|paragraph/i,     ["ela.topicsentence","ela.supporting"]],
  [/transition/i,                   ["ela.transitions"]],
  [/prefix|suffix|affix/i,          ["ela.affix"]],
  [/root|greek|latin/i,             ["ela.roots"]],
  [/synonym|antonym/i,              ["ela.wordrel.mixed"]],
  [/context clue|meaning of words/i,["ela.meaning"]],
  [/theme|main idea|summar/i,       ["ela.pk.text_structures","ela.supporting"]],
  [/compare|contrast/i,             ["ela.pk.comparing_and_contrasting"]],
  [/genre|fiction|nonfiction/i,     ["ela.genres"]],
  [/narrator|narrative/i,           ["ela.pov"]],
  [/sentence|fragment|run.?on/i,    ["ela.sent.three"]],
];
const DW_MATH_TOPIC_RULES=[
 [/multi-digit addition|addition algorithm/i,["math.add.multi"]],
 [/subtraction algorithm|multi-digit subtraction/i,["math.sub.multi"]],
 [/add\/?subtract|addition\s*&\s*subtraction|computation review/i,["math.add.multi","math.sub.multi"]],
 [/multi-step|problem solving/i,["math.wordproblems"]],[/division problem/i,["math.div.basic"]],
 [/value of digits|place value relationship|place value introduction|place value review/i,["math.placevalue"]],
 [/read large numbers|write large numbers/i,["math.write.multidigit"]],
 [/compare and order numbers|compare numbers/i,["math.compare.whole"]],
 [/round to tens|round to hundreds|rounding introduction|rounding review/i,["math.rounding"]],
 [/points and lines|rays and segments/i,["math.geom.lines"]],[/parallel lines|perpendicular lines/i,["math.geom.parallel"]],
 [/classify shapes|shape attributes|categories of shapes|shape review|classifying shapes|shape relationships|categories of figures/i,["math.geom.polygons"]],
 [/symmetr/i,["math.symmetry"]],[/measuring and comparing angles/i,["math.angle.measure"]],
 [/understanding angles/i,["math.pk.acute_right_obtuse_and_straight_angles"]],
 [/expanded decimal form/i,["math.dec.expanded"]],[/read decimals|write decimals|decimal models/i,["math.dec.wordform"]],
 [/compare decimals/i,["math.dec.compare"]],[/ordering decimals/i,["math.dec.order"]],
 [/round to tenths|round to hundredths|round to thousandth|rounding decimals|decimal rounding review/i,["math.pk.rounding_decimals"]],
 [/add decimals/i,["math.dec.add"]],[/subtract decimals/i,["math.dec.sub"]],
 [/decimal addition\s*&\s*subtraction|decimal operations review/i,["math.dec.add","math.dec.sub"]],
 [/multiply decimals|decimal multiplication/i,["math.pk.multiplying_a_decimal_by_a_one_digit_number"]],
 [/divide decimals|decimal division/i,["math.pk.division_with_decimal_quotients"]],
 [/multi-step decimal|decimal strategies/i,["math.wordproblems"]],
 [/multiplying by powers? of 10/i,["math.pk.multiplying_a_decimal_by_a_power_of_ten"]],
 [/dividing by powers? of 10/i,["math.pk.dividing_by_powers_of_ten"]],
 [/powers? of 10|place value patterns|relationships between places/i,["math.pk.multiplication_patterns_over_increasing_place_"]]
];
function dwTopicSkills(item){
  const t=((item.resourceName||"")+" "+(item.requirement||"")).replace(/\n/g," ");
  if(item.subject==="Math")for(const [re,skills] of DW_MATH_TOPIC_RULES)if(re.test(t))return skills.filter(id=>DW_SKILLS[id]);
  if(item.subject!=="HUM")return [];
  const out=[];for(const [re,skills] of DW_TOPIC_RULES)if(re.test(t))for(const id of skills)if(DW_SKILLS[id]&&!out.includes(id))out.push(id);
  return out;
}

/* Never allow a mapped or cumulative fallback skill to cross subjects. */
function dwSkillMatchesSubject(item, skillId){
  const s=String(skillId||"");
  if(item.subject==="Math") return /^math\./.test(s);
  if(item.subject==="Science") return /^sci\./.test(s);
  if(item.subject==="HUM") return /^(ela|writing|vocab|morph|curric)\./.test(s);
  return false;
}


/* Every skill this grade and subject has covered up to and including this day. */
function dwCumulativeSkills(item){
  if(typeof DW_CURRIC_PLAN==="undefined") return [];
  const seen=[];
  for(const id in DW_CURRIC_PLAN){
    if(id.indexOf(item.grade+"-"+item.subject+"-")!==0) continue;
    const m=id.match(/-D(\d+)-/); if(!m || Number(m[1])>item.day) continue;
    for(const s of (DW_CURRIC_PLAN[id].skills||[])) if(dwSkillMatchesSubject(item,s)&&seen.indexOf(s)<0) seen.push(s);
  }
  if(/vocab/i.test(item.strand||"")||/vocabulary/i.test(item.requirement||"")) seen.unshift("curric.vocab");
  return seen;
}


/* Every vocabulary term this grade and subject has met up to this day. */
function dwAllTermsUpTo(item){
  if(typeof DW_CURRIC_ITEMS==="undefined") return Object.keys(DW_TERMS);
  const out=[];
  for(const x of DW_CURRIC_ITEMS){
    if(x.grade!==item.grade||x.subject!==item.subject||x.day>item.day) continue;
    if(!/vocabulary/i.test(x.strand||"")) continue;
    for(const t of dwLessonTerms(x)) if(out.indexOf(t)<0) out.push(t);
  }
  return out.length?out:Object.keys(DW_TERMS);
}

/* ------------------------------------------------------------------ dispatch */
function dwValidQuestion(q){
  if(!q||typeof q.prompt!=="string"||!q.prompt.trim())return false;
  if(q.answer==null||String(q.answer)==="")return false;
  if(!Array.isArray(q.choices)||q.choices.length<2)return false;
  const c=q.choices.map(String);
  if(new Set(c).size!==c.length)return false;
  return c.includes(String(q.answer));
}

/* Returns {prompt, answer, choices, acceptedAnswers, skillId, label, source}
   source: "registry" = generated from the stable skill registry
           "legacy"   = registry miss, old keyword generator used (should be 0) */
function dwQuestion(skillId, seed, i, subject, fallbackLabel){
  if(!DW_SKILLS[skillId]) skillId = dwSkillIdForLabel(fallbackLabel) || skillId;
  const entry = DW_SKILLS[skillId];
  if(entry){
    const [label, family, params] = entry;
    const gen = MATH_GEN[family] || ELA_GEN[family] || WRITING_GEN[family]
              || SCI_GEN[family] || VOCAB_GEN[family] || MORPH_GEN[family];
    if(gen){
      for(let attempt=0; attempt<6; attempt++){
        try{
          const r = hashSeed(Number(seed||1) + i*37 + attempt*7919);
          const q = gen(r, params||{}, i+attempt);
          if(dwValidQuestion(q))
            return Object.assign({}, q, {skillId, label, source:"registry", family});
        }catch(err){
          if(typeof console!=="undefined") console.error("Dragonswood generator error", family, skillId, err);
        }
      }
    }
  }
  const r = hashSeed(Number(seed||1) + i*37);
  const legacy = String(subject||"").toUpperCase()==="ELA"
    ? ELA_GEN.wordrel(r,{rel:"mixed"},i)
    : MATH_GEN.wordproblem(r,{},i);
  return Object.assign({}, legacy, {skillId:skillId||null, label:fallbackLabel||"Review", source:"legacy"});
}
