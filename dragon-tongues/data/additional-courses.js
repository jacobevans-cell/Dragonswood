(function () {
  "use strict";

  const spokenLessonNames = ["Learn & Listen", "First Conversation", "Read, Hear & Match", "Build & Type", "Speak & Respond", "Review & Chest"];
  const parseRows = text => text.trim().split("\n").map(row => row.split("|").map(value => value.trim()));
  const words = text => parseRows(text).map(([target, english, reading]) => ({ target, english, ...(reading ? { reading } : {}) }));
  const lines = text => parseRows(text).map(([speaker, target, english, reading]) => ({ speaker, target, english, ...(reading ? { reading } : {}) }));
  const unit = (title, subtitle, vocab, dialogue, tip) => ({
    title,
    subtitle,
    objective: subtitle,
    tip,
    culture: "Language choices can change with setting, relationship, and region.",
    lessonNames: spokenLessonNames,
    vocab: words(vocab),
    dialogue: lines(dialogue)
  });

  const korean = {
    id: "korean",
    name: "Korean",
    nativeName: "한국어",
    sigil: "한",
    bannerKicker: "한글 · 자음 · 모음 · 받침",
    bannerGlyphs: ["한", "글", "ㄱ", "ㅏ", "ㅇ", "。"],
    portalGreeting: "안녕하세요!",
    portalReading: "annyeonghaseyo · hello",
    portalOrbit: "한글 · 소리 · 대화",
    portalAction: "Hear the portal",
    speechLang: "ko-KR",
    modality: "spoken",
    readingLabel: "Romanization",
    level: "A1-oriented technical preview / Hangul-supported",
    accent: "#5579d9",
    gradient: "linear-gradient(135deg, #25265e 0%, #536fd0 50%, #b74f91 100%)",
    description: "Build practical Korean through Hangul, listening, polite conversation, reading, typing, and speaking.",
    units: [
      unit("Greetings at the Castle Gate", "Greet someone and introduce yourself politely", `
안녕하세요|hello|annyeonghaseyo
좋은 아침이에요|good morning|joeun achimieyo
안녕히 가세요|goodbye, to someone leaving|annyeonghi gaseyo
안녕히 계세요|goodbye, to someone staying|annyeonghi gyeseyo
감사합니다|thank you|gamsahamnida
죄송합니다|I am sorry|joesonghamnida
네|yes|ne
이름이 뭐예요?|what is your name?|ireumi mwoyeyo`, `
A|안녕하세요!|Hello!|annyeonghaseyo
B|안녕하세요. 이름이 뭐예요?|Hello. What is your name?|annyeonghaseyo. ireumi mwoyeyo
A|저는 민지예요.|I am Minji.|jeoneun Minjiyeyo
B|저는 준이에요. 반가워요.|I am Jun. Nice to meet you.|jeoneun Junieyo. bangawoyo`, "Korean has speech levels. These beginner exchanges use the polite -요 or formal -습니다 style."),

      unit("Unlock Hangul", "Recognize the building blocks of the Korean alphabet", `
한글|Hangul, the Korean alphabet|hangeul
자음|consonant|jaeum
모음|vowel|moeum
글자|letter or character|geulja
음절|syllable|eumjeol
소리|sound|sori
받침|final consonant|batchim
읽다|to read|iktta`, `
A|이 글자는 뭐예요?|What is this letter?|i geuljaneun mwoyeyo
B|한글이에요.|It is Hangul.|hangeurieyo
A|어떻게 읽어요?|How do you read it?|eotteoke ilgeoyo
B|가라고 읽어요.|It is read ga.|garago ilgeoyo`, "Hangul letters combine into square syllable blocks; read each block from its initial consonant through its vowel and final consonant."),

      unit("Friends and Family", "Identify people and describe close relationships", `
저|I, polite|jeo
가족|family|gajok
어머니|mother|eomeoni
아버지|father|abeoji
언니|older sister, used by a woman|eonni
형|older brother, used by a man|hyeong
동생|younger sibling|dongsaeng
친구|friend|chingu`, `
A|이분은 누구예요?|Who is this person?|ibuneun nuguyeyo
B|제 어머니예요.|This is my mother.|je eomeoniyeyo
A|저 사람은 친구예요?|Is that person your friend?|jeo sarameun chinguyeyo
B|네, 제 친구예요.|Yes, that is my friend.|ne, je chinguyeyo`, "Korean family terms can depend on the speaker's gender and the relative's age; this unit introduces the distinction without treating terms as interchangeable."),

      unit("Numbers and Age", "Count, ask how many, and give a simple age", `
영|zero|yeong
하나|one, native Korean|hana
둘|two, native Korean|dul
셋|three, native Korean|set
넷|four, native Korean|net
열|ten, native Korean|yeol
몇|how many|myeot
살|years old counter|sal`, `
A|몇 살이에요?|How old are you?|myeot sarieyo
B|열 살이에요.|I am ten years old.|yeol sarieyo
A|사과가 몇 개예요?|How many apples are there?|sagwaga myeot gaeyeyo
B|세 개예요.|There are three.|se gaeyeyo`, "Korean uses native and Sino-Korean number systems in different contexts. Ages commonly use native Korean numbers with 살."),

      unit("Inside the Classroom", "Use school objects and ask a classroom question", `
학교|school|hakgyo
교실|classroom|gyosil
선생님|teacher|seonsaengnim
학생|student|haksaeng
책|book|chaek
연필|pencil|yeonpil
가방|bag|gabang
질문|question|jilmun`, `
A|책이 어디에 있어요?|Where is the book?|chaegi eodie isseoyo
B|가방 안에 있어요.|It is inside the bag.|gabang ane isseoyo
A|선생님, 질문이 있어요.|Teacher, I have a question.|seonsaengnim, jilmuni isseoyo
B|네, 말해 보세요.|Yes, go ahead.|ne, malhae boseyo`, "The location particle 에 often follows a place; 있어요 expresses that something exists or is located there."),

      unit("Food and Drinks", "Request food and say what tastes good", `
물|water|mul
밥|cooked rice or meal|bap
빵|bread|ppang
사과|apple|sagwa
우유|milk|uyu
김치|kimchi|gimchi
먹다|to eat|meoktta
주세요|please give me|juseyo`, `
A|물 주세요.|Water, please.|mul juseyo
B|네, 여기 있어요.|Yes, here it is.|ne, yeogi isseoyo
A|김치가 맛있어요.|The kimchi is delicious.|gimchiga masisseoyo
B|밥도 드세요.|Please have some rice too.|bapdo deuseyo`, "Noun + 주세요 is a useful polite request. 드세요 is an honorific invitation to eat."),

      unit("Around the Home", "Name rooms and locate everyday objects", `
집|home or house|jip
방|room|bang
부엌|kitchen|bueok
화장실|bathroom|hwajangsil
문|door|mun
창문|window|changmun
여기|here|yeogi
저기|over there|jeogi`, `
A|화장실이 어디예요?|Where is the bathroom?|hwajangsiri eodiyeyo
B|저기 문 옆이에요.|It is over there beside the door.|jeogi mun yeopieyo
A|부엌은 어디예요?|Where is the kitchen?|bueogeun eodiyeyo
B|여기예요.|It is here.|yeogiyeyo`, "어디예요? is a flexible beginner frame for asking where a place or thing is."),

      unit("My Daily Routine", "Describe a simple morning and evening routine", `
일어나다|to get up|ireonada
씻다|to wash|ssittta
아침을 먹다|to eat breakfast|achimeul meoktta
학교에 가다|to go to school|hakgyoe gada
공부하다|to study|gongbuhada
놀다|to play|nolda
저녁을 먹다|to eat dinner|jeonyeogeul meoktta
자다|to sleep|jada`, `
A|아침에 뭐 해요?|What do you do in the morning?|achime mwo haeyo
B|일어나서 아침을 먹어요.|I get up and eat breakfast.|ireonaseo achimeul meogeoyo
A|저녁에는 뭐 해요?|What do you do in the evening?|jeonyeogeneun mwo haeyo
B|공부하고 자요.|I study and sleep.|gongbuhago jayo`, "The endings -아서/-어서 and -고 can link actions in a routine."),

      unit("Days and Time", "Talk about weekdays and ask the time", `
오늘|today|oneul
내일|tomorrow|naeil
어제|yesterday|eoje
월요일|Monday|woryoil
화요일|Tuesday|hwayoil
수요일|Wednesday|suyoil
금요일|Friday|geumyoil
몇 시예요?|what time is it?|myeot siyeyo`, `
A|오늘은 무슨 요일이에요?|What day is today?|oneureun museun yoirieyo
B|오늘은 화요일이에요.|Today is Tuesday.|oneureun hwayoirieyo
A|수업은 몇 시예요?|What time is class?|sueobeun myeot siyeyo
B|아홉 시예요.|It is at nine.|ahop siyeyo`, "요일 means day of the week. Clock hours generally use native Korean numbers."),

      unit("Weather and Clothes", "Describe the weather and choose clothing", `
날씨|weather|nalssi
비|rain|bi
더워요|it is hot|deowoyo
추워요|it is cold|chuwoyo
셔츠|shirt|syeocheu
바지|pants|baji
신발|shoes|sinbal
코트|coat|koteu`, `
A|오늘 날씨가 어때요?|How is the weather today?|oneul nalssiga eottaeyo
B|비가 오고 추워요.|It is raining and cold.|biga ogo chuwoyo
A|코트가 필요해요.|I need a coat.|koteuga piryohaeyo
B|네, 코트를 입으세요.|Yes, put on a coat.|ne, koteureul ibeuseyo`, "Korean uses different wearing verbs for different items; 입다 is used for garments worn on the body."),

      unit("Hobbies and Favorites", "Share activities you like and ask a favorite", `
좋아하다|to like|joahada
읽다|to read|iktta
그리다|to draw|geurida
노래하다|to sing|noraehada
춤추다|to dance|chumchuda
축구|soccer|chukgu
음악|music|eumak
재미있어요|it is fun|jaemiisseoyo`, `
A|뭐 하는 것을 좋아해요?|What do you like to do?|mwo haneun geoseul joahaeyo
B|음악을 듣는 것을 좋아해요.|I like listening to music.|eumageul deutneun geoseul joahaeyo
A|축구도 좋아해요?|Do you like soccer too?|chukgudo joahaeyo
B|네, 재미있어요.|Yes, it is fun.|ne, jaemiisseoyo`, "좋아하다 takes the liked thing as an object; beginner speech also often uses noun + 이/가 좋아요."),

      unit("Directions and Help", "Follow directions and repair a conversation", `
왼쪽|left|oenjjok
오른쪽|right|oreunjjok
똑바로|straight ahead|ttokbaro
가까워요|it is near|gakkawoyo
멀어요|it is far|meoreoyo
어디예요?|where is it?|eodiyeyo
도와주세요|please help me|dowajuseyo
다시 말해 주세요|please say it again|dasi malhae juseyo`, `
A|도서관이 어디예요?|Where is the library?|doseogwani eodiyeyo
B|똑바로 가서 오른쪽으로 가세요.|Go straight and then right.|ttokbaro gaseo oreunjjogeuro gaseyo
A|죄송해요. 다시 말해 주세요.|Sorry. Please say it again.|joesonghaeyo. dasi malhae juseyo
B|네, 천천히 말할게요.|Yes, I will speak slowly.|ne, cheoncheonhi malhalgeyo`, "다시 말해 주세요 keeps a real conversation going when you miss something." )
    ]
  };

  const icelandic = {
    id: "icelandic",
    name: "Icelandic",
    nativeName: "Íslenska",
    sigil: "Þ",
    bannerKicker: "Þ · Ð · Æ · Ö · HLJÓÐ",
    bannerGlyphs: ["Þ", "Ð", "Æ", "Ö", "á", "…"],
    portalGreeting: "Góðan dag!",
    portalReading: "Good day · tap to hear",
    portalOrbit: "HLJÓÐ · ORÐ · SAMTAL",
    portalAction: "Hear the portal",
    speechLang: "is-IS",
    modality: "spoken",
    level: "A1-oriented technical preview",
    accent: "#2787a8",
    gradient: "linear-gradient(135deg, #163456 0%, #2384a3 48%, #55b88f 100%)",
    description: "Build practical beginner Icelandic through its sounds, everyday conversation, reading, typing, and speaking.",
    units: [
      unit("Greetings by the Hearth", "Greet someone and introduce yourself", `
halló|hello
góðan dag|good day
gott kvöld|good evening
bless|goodbye
takk|thank you
vinsamlegast|please
já|yes
hvað heitir þú?|what is your name?`, `
A|Góðan dag!|Good day!
B|Góðan dag. Hvað heitir þú?|Good day. What is your name?
A|Ég heiti Anna.|My name is Anna.
B|Ég heiti Jón. Gaman að kynnast þér.|My name is Jón. Nice to meet you.`, "Góðan dag is a useful daytime greeting. Bless is a common informal goodbye."),

      unit("Icelandic Sounds", "Recognize distinctive letters and sound-focused words", `
stafur|letter
orð|word
setning|sentence
hljóð|sound
lesa|to read
skrifa|to write
þ|letter thorn
ð|letter eth`, `
A|Hvaða stafur er þetta?|Which letter is this?
B|Þetta er þ.|This is thorn.
A|Hvernig les maður orðið?|How does one read the word?
B|Hlustaðu og lestu með mér.|Listen and read with me.`, "Þ and ð are different letters. Learn them by sound and position rather than replacing both with English th."),

      unit("Friends and Family", "Identify people and family relationships", `
ég|I
þú|you
fjölskylda|family
mamma|mother
pabbi|father
bróðir|brother
systir|sister
vinur / vinkona|male friend / female friend`, `
A|Hver er hún?|Who is she?
B|Hún er systir mín.|She is my sister.
A|Er hún vinkona þín?|Is she your friend?
B|Já, hún er systir mín og vinkona.|Yes, she is my sister and friend.`, "Possessives can follow a noun, as in systir mín. Their form changes with grammatical gender and case."),

      unit("Numbers and Age", "Count small groups and state an age", `
núll|zero
einn|one
tveir|two
þrír|three
fjórir|four
fimm|five
tíu|ten
hvað margir?|how many?`, `
A|Hvað ertu gamall?|How old are you? said to a male
B|Ég er tíu ára.|I am ten years old.
A|Hvað eru margar bækur?|How many books are there?
B|Það eru þrjár bækur.|There are three books.`, "Icelandic numbers and adjectives change with gender and case. Learn counted nouns as complete phrases."),

      unit("Inside the Classroom", "Use school words and ask a question", `
skóli|school
kennslustofa|classroom
kennari|teacher
nemandi|student
bók|book
blýantur|pencil
taska|bag
spurning|question`, `
A|Hvar er bókin?|Where is the book?
B|Hún er í töskunni.|It is in the bag.
A|Ég er með spurningu.|I have a question.
B|Já, gjörðu svo vel.|Yes, go ahead.`, "Location phrases can change a noun's ending; learn í töskunni as a useful complete chunk."),

      unit("Food and Drinks", "Request food and say what you like", `
vatn|water
brauð|bread
epli|apple
mjólk|milk
hrísgrjón|rice
kjúklingur|chicken
borða|to eat
drekka|to drink`, `
A|Mig langar í vatn, takk.|I would like water, please.
B|Viltu líka epli?|Would you also like an apple?
A|Já, mér finnst epli góð.|Yes, I like apples.
B|Gjörðu svo vel.|Here you are.`, "Mig langar í is a natural way to say you would like something; gjörðu svo vel can mean here you are."),

      unit("Around the Home", "Name rooms and locate everyday objects", `
heimili|home
herbergi|room
eldhús|kitchen
baðherbergi|bathroom
borð|table
stóll|chair
hurð|door
gluggi|window`, `
A|Hvar er baðherbergið?|Where is the bathroom?
B|Það er við hliðina á herberginu.|It is beside the room.
A|Og hvar er eldhúsið?|And where is the kitchen?
B|Það er hér.|It is here.`, "The ending -ið can act like English the on some neuter nouns, as in baðherbergið."),

      unit("My Daily Routine", "Describe common morning and evening activities", `
vakna|to wake up
fara á fætur|to get up
borða morgunmat|to eat breakfast
fara í skólann|to go to school
læra|to study or learn
leika|to play
borða kvöldmat|to eat dinner
sofa|to sleep`, `
A|Hvað gerir þú á morgnana?|What do you do in the mornings?
B|Ég fer á fætur og borða morgunmat.|I get up and eat breakfast.
A|Hvað gerir þú á kvöldin?|What do you do in the evenings?
B|Ég læri og fer svo að sofa.|I study and then go to sleep.`, "Á morgnana and á kvöldin describe habitual times of day."),

      unit("Days and Time", "Talk about weekdays and schedules", `
í dag|today
á morgun|tomorrow
í gær|yesterday
mánudagur|Monday
þriðjudagur|Tuesday
miðvikudagur|Wednesday
föstudagur|Friday
hvað er klukkan?|what time is it?`, `
A|Hvaða dagur er í dag?|What day is today?
B|Í dag er þriðjudagur.|Today is Tuesday.
A|Hvenær byrjar tíminn?|When does the class begin?
B|Hann byrjar klukkan níu.|It begins at nine.`, "Use klukkan before a clock time. Weekday endings may change inside longer phrases."),

      unit("Weather and Clothes", "Describe weather and choose clothing", `
sól|sun
rigning|rain
heitt|hot or warm
kalt|cold
skyrta|shirt
buxur|pants
skór|shoes
úlpa|coat or jacket`, `
A|Hvernig er veðrið?|How is the weather?
B|Það er kalt og rigning.|It is cold and rainy.
A|Ég þarf úlpu.|I need a coat.
B|Já, farðu í úlpuna.|Yes, put on the coat.`, "Weather commonly uses the impersonal frame það er followed by a description."),

      unit("Hobbies and Favorites", "Share interests and favorite activities", `
lesa|to read
teikna|to draw
syngja|to sing
dansa|to dance
spila|to play
fótbolti|soccer
tónlist|music
skemmtilegt|fun`, `
A|Hvað finnst þér gaman að gera?|What do you enjoy doing?
B|Mér finnst gaman að lesa.|I enjoy reading.
A|Finnst þér fótbolti skemmtilegur?|Do you find soccer fun?
B|Já, mjög skemmtilegur.|Yes, very fun.`, "Mér finnst gaman að + verb is a useful frame for activities you enjoy."),

      unit("Directions and Help", "Follow directions and ask for clarification", `
vinstri|left
hægri|right
beint áfram|straight ahead
nálægt|near
langt|far
hvar er…?|where is…?
hjálp|help
geturðu endurtekið?|can you repeat?`, `
A|Hvar er bókasafnið?|Where is the library?
B|Farðu beint áfram og síðan til hægri.|Go straight and then right.
A|Geturðu endurtekið hægar?|Can you repeat more slowly?
B|Já, auðvitað.|Yes, of course.`, "Geturðu endurtekið? is a practical conversation-repair phrase." )
    ]
  };

  const somali = {
    id: "somali",
    name: "Somali",
    nativeName: "Af Soomaali",
    sigil: "X",
    bannerKicker: "C · X · Q · DH · KH",
    bannerGlyphs: ["C", "X", "Q", "DH", "KH", "…"],
    portalGreeting: "Salaan!",
    portalReading: "Hello · tap to hear",
    portalOrbit: "COD · ERAY · WADA HADAL",
    portalAction: "Hear the portal",
    speechLang: "so-SO",
    modality: "spoken",
    level: "A1-oriented technical preview",
    accent: "#b47a28",
    gradient: "linear-gradient(135deg, #184f58 0%, #168a83 48%, #d49b3c 100%)",
    description: "Build practical beginner Somali through sound-aware spelling, everyday conversation, reading, typing, and speaking.",
    units: [
      unit("Greetings at the Meeting Place", "Greet someone and introduce yourself", `
salaan|hello
subax wanaagsan|good morning
galab wanaagsan|good afternoon
nabad gelyo|goodbye
fadlan|please
mahadsanid|thank you
haa|yes
magacaa?|what is your name?`, `
A|Salaan!|Hello!
B|Salaan. Magacaa?|Hello. What is your name?
A|Magacaygu waa Ayaan.|My name is Ayaan.
B|Magacaygu waa Cali. Waan ku faraxsanahay.|My name is Cali. I am pleased to meet you.`, "Somali greetings can vary by region and relationship. These forms are widely useful and polite."),

      unit("Somali Sounds and Spelling", "Notice distinctive letters and build sound awareness", `
xaraf|letter
eray|word
weedh|sentence
cod|voice or sound
shaqal|vowel
shibbane|consonant
akhri|read
qor|write`, `
A|Eraygan akhri.|Read this word.
B|Haa, waan akhrinayaa.|Yes, I am reading it.
A|Sidee loo qoraa?|How is it written?
B|Si tartiib ah ayaan u qorayaa.|I am writing it slowly.`, "Somali uses a Latin alphabet, but C, X, and Q do not sound like their most common English values. Learn them through audio models."),

      unit("Friends and Family", "Identify people and family relationships", `
aniga|I or me
adiga|you
qoys|family
hooyo|mother
aabbe|father
walaal|sibling
saaxiib|friend
qof|person`, `
A|Qofkani waa kuma?|Who is this person?
B|Waa hooyaday.|She is my mother.
A|Kani ma saaxiibkaa baa?|Is this your friend?
B|Haa, waa saaxiibkay.|Yes, this is my friend.`, "Possession is often attached to the noun, as in hooyaday, my mother, and saaxiibkay, my friend."),

      unit("Numbers and Age", "Count small groups and ask an age", `
eber|zero
kow|one
laba|two
saddex|three
afar|four
shan|five
toban|ten
imisa?|how many?`, `
A|Immisa jir baad tahay?|How old are you?
B|Waxaan ahay toban jir.|I am ten years old.
A|Immisa buug ayaa jira?|How many books are there?
B|Saddex buug ayaa jira.|There are three books.`, "Jir follows a number when stating age. Somali number forms can interact with the nouns they count."),

      unit("Inside the Classroom", "Use school objects and classroom language", `
dugsi|school
fasal|classroom
macallin|teacher
arday|student
buug|book
qalin|pen or pencil
boorso|bag
su'aal|question`, `
A|Buuggu xaggee buu yaal?|Where is the book?
B|Boorsada ayuu ku jiraa.|It is in the bag.
A|Macallin, su'aal ayaan qabaa.|Teacher, I have a question.
B|Haa, weydii.|Yes, ask.`, "Somali focus and subject markers carry important grammar; begin by learning these classroom sentences as complete patterns."),

      unit("Food and Drinks", "Request food and say what you like", `
biyo|water
rooti|bread
tufaax|apple
caano|milk
bariis|rice
digaag|chicken
cun|eat
cab|drink`, `
A|Biyo ayaan rabaa, fadlan.|I would like water, please.
B|Tufaax ma rabtaa?|Would you like an apple?
A|Haa, tufaaxa waan jeclahay.|Yes, I like apples.
B|Waa kuwan.|Here they are.`, "Waxaan rabaa or … ayaan rabaa expresses I want. Fadlan makes the request polite."),

      unit("Around the Home", "Name rooms and locate everyday objects", `
guri|home or house
qol|room
jiko|kitchen
musqul|bathroom
miis|table
kursi|chair
albaab|door
daaqad|window`, `
A|Musqushu xaggee bay ku taallaa?|Where is the bathroom?
B|Waxay ku taallaa albaabka agtiisa.|It is beside the door.
A|Jikadu xaggee bay ku taallaa?|Where is the kitchen?
B|Halkan ayay ku taallaa.|It is here.`, "Xaggee … ku taallaa? is a useful location question for places and objects."),

      unit("My Daily Routine", "Describe common activities during the day", `
kac|wake up or get up
quraac|breakfast
tag|go
baro|learn or study
ciyaar|play
casho|dinner
seexo|sleep
habeen|night`, `
A|Subaxdii maxaad samaysaa?|What do you do in the morning?
B|Waan kacaa oo quraacdaa.|I get up and eat breakfast.
A|Habeenkii maxaad samaysaa?|What do you do at night?
B|Waan bartaa dabadeedna waan seexdaa.|I study and then sleep.`, "The particle oo can connect actions; repeated waan helps mark affirmative first-person statements."),

      unit("Days and Time", "Talk about weekdays and ask the time", `
maanta|today
berri|tomorrow
shalay|yesterday
Isniin|Monday
Talaado|Tuesday
Arbaco|Wednesday
Jimco|Friday
saacaddu waa imisa?|what time is it?`, `
A|Maanta waa maalintee?|What day is today?
B|Maanta waa Talaado.|Today is Tuesday.
A|Fasalku saacaddu imisa ayuu bilaabmaa?|What time does class begin?
B|Wuxuu bilaabmaa sagaalka.|It begins at nine.`, "Somali weekday names are commonly capitalized. Saacad refers to a clock or hour."),

      unit("Weather and Clothes", "Describe weather and choose clothing", `
qorrax|sun
roob|rain
kulul|hot
qabow|cold
shaati|shirt
surwaal|pants
kabo|shoes
jaakad|jacket or coat`, `
A|Cimiladu sidee tahay?|How is the weather?
B|Waa qabow, roobna wuu da'ayaa.|It is cold, and rain is falling.
A|Jaakad ayaan u baahanahay.|I need a jacket.
B|Haa, jaakadda xidho.|Yes, wear the jacket.`, "Xidho is a common imperative meaning put on or wear. Pronunciation and vocabulary may vary regionally."),

      unit("Hobbies and Favorites", "Share interests and favorite activities", `
akhri|read
sawir|draw or picture
hees|song or sing
qoob-ka-ciyaar|dance
ciyaar|play
kubbadda cagta|soccer
muusig|music
xiiso leh|interesting or fun`, `
A|Maxaad jeceshahay inaad samayso?|What do you like to do?
B|Waxaan jeclahay inaan akhriyo.|I like to read.
A|Kubbadda cagta ma jeceshahay?|Do you like soccer?
B|Haa, waa xiiso leh.|Yes, it is fun.`, "Waxaan jeclahay inaan + verb is a useful frame for saying what you like to do."),

      unit("Directions and Help", "Follow directions and repair a conversation", `
bidix|left
midig|right
toos|straight
dhow|near
fog|far
xaggee ku taal…?|where is…?
caawimo|help
ku celi|repeat it`, `
A|Maktabaddu xaggee ku taallaa?|Where is the library?
B|Toos u soco, dabadeed midig u leexo.|Go straight, then turn right.
A|Ma fahmin. Fadlan ku celi.|I did not understand. Please repeat.
B|Haa, si tartiib ah ayaan u sheegayaa.|Yes, I will say it slowly.`, "Ma fahmin and fadlan ku celi are essential conversation-repair phrases." )
    ]
  };

  const russian = {
    id: "russian",
    name: "Russian",
    nativeName: "Русский",
    sigil: "Я",
    bannerKicker: "А · Б · В · Ё · Я",
    bannerGlyphs: ["А", "Б", "Я", "Ё", "Ж", "…"],
    portalGreeting: "Здравствуйте!",
    portalReading: "zdravstvuyte · hello",
    portalOrbit: "БУКВЫ · ЗВУКИ · ДИАЛОГ",
    portalAction: "Hear the portal",
    speechLang: "ru-RU",
    modality: "spoken",
    readingLabel: "Transliteration",
    level: "A1-oriented technical preview / Cyrillic-supported",
    accent: "#b6415f",
    gradient: "linear-gradient(135deg, #26335e 0%, #813d72 48%, #c94e58 100%)",
    description: "Build practical Russian through Cyrillic, listening, conversation, optional transliteration, typing, and speaking.",
    units: [
      unit("Greetings at the Castle Gate", "Greet someone and introduce yourself", `
здравствуйте|hello, formal|zdravstvuyte
привет|hi, informal|privet
доброе утро|good morning|dobroye utro
добрый вечер|good evening|dobryy vecher
до свидания|goodbye|do svidaniya
пожалуйста|please or you are welcome|pozhaluysta
спасибо|thank you|spasibo
как вас зовут?|what is your name?|kak vas zovut`, `
A|Здравствуйте!|Hello!|zdravstvuyte
B|Здравствуйте. Как вас зовут?|Hello. What is your name?|zdravstvuyte. kak vas zovut
A|Меня зовут Анна.|My name is Anna.|menya zovut Anna
B|Меня зовут Иван. Очень приятно.|My name is Ivan. Nice to meet you.|menya zovut Ivan. ochen priyatno`, "Use здравствуйте and вас in polite or unfamiliar settings; привет and тебя belong to informal conversation."),

      unit("Unlock Cyrillic", "Recognize the alphabet and connect letters to sounds", `
алфавит|alphabet|alfavit
буква|letter|bukva
слово|word|slovo
фраза|phrase|fraza
звук|sound|zvuk
читать|to read|chitat
писать|to write|pisat
кириллица|Cyrillic script|kirillitsa`, `
A|Какая это буква?|Which letter is this?|kakaya eto bukva
B|Это буква Я.|It is the letter Ya.|eto bukva Ya
A|Как читается это слово?|How is this word read?|kak chitayetsya eto slovo
B|Послушайте и повторите.|Listen and repeat.|poslushayte i povtorite`, "Some Cyrillic letters resemble Latin letters but represent different sounds. Learn by sound, not shape alone."),

      unit("Friends and Family", "Identify people and family relationships", `
я|I|ya
ты|you, informal|ty
семья|family|semya
мама|mother|mama
папа|father|papa
брат|brother|brat
сестра|sister|sestra
друг / подруга|male friend / female friend|drug / podruga`, `
A|Кто она?|Who is she?|kto ona
B|Она моя сестра.|She is my sister.|ona moya sestra
A|Она твоя подруга?|Is she your friend?|ona tvoya podruga
B|Да, она моя сестра и подруга.|Yes, she is my sister and friend.|da, ona moya sestra i podruga`, "Russian possessives change to agree with a noun: мой друг, моя сестра."),

      unit("Numbers and Age", "Count and state a simple age", `
ноль|zero|nol
один|one|odin
два|two|dva
три|three|tri
четыре|four|chetyre
пять|five|pyat
десять|ten|desyat
сколько?|how many?|skolko`, `
A|Сколько тебе лет?|How old are you?|skolko tebe let
B|Мне десять лет.|I am ten years old.|mne desyat let
A|Сколько здесь книг?|How many books are here?|skolko zdes knig
B|Здесь три книги.|There are three books here.|zdes tri knigi`, "Russian changes the noun after a number. Learn number-plus-noun phrases together."),

      unit("Inside the Classroom", "Use school objects and ask a question", `
школа|school|shkola
класс|classroom|klass
учитель|teacher|uchitel
ученик|student|uchenik
книга|book|kniga
карандаш|pencil|karandash
рюкзак|backpack|ryukzak
вопрос|question|vopros`, `
A|Где книга?|Where is the book?|gde kniga
B|Она в рюкзаке.|It is in the backpack.|ona v ryukzake
A|У меня есть вопрос.|I have a question.|u menya yest vopros
B|Да, спрашивайте.|Yes, go ahead and ask.|da, sprashivayte`, "У меня есть literally means at me there is and is the common pattern for I have."),

      unit("Food and Drinks", "Request food and say what you like", `
вода|water|voda
хлеб|bread|khleb
яблоко|apple|yabloko
молоко|milk|moloko
рис|rice|ris
курица|chicken|kuritsa
есть|to eat|yest
пить|to drink|pit`, `
A|Я хочу воды, пожалуйста.|I would like water, please.|ya khochu vody, pozhaluysta
B|Хотите яблоко?|Would you like an apple?|khotite yabloko
A|Да, я люблю яблоки.|Yes, I like apples.|da, ya lyublyu yabloki
B|Вот, пожалуйста.|Here you are.|vot, pozhaluysta`, "Я хочу means I want. Food words can change ending after verbs and quantities."),

      unit("Around the Home", "Name rooms and locate everyday objects", `
дом|house or home|dom
комната|room|komnata
кухня|kitchen|kukhnya
ванная|bathroom|vannaya
стол|table|stol
стул|chair|stul
дверь|door|dver
окно|window|okno`, `
A|Где ванная?|Where is the bathroom?|gde vannaya
B|Она рядом с комнатой.|It is next to the room.|ona ryadom s komnatoy
A|А где кухня?|And where is the kitchen?|a gde kukhnya
B|Кухня здесь.|The kitchen is here.|kukhnya zdes`, "Где? means where? Russian usually omits the present-tense verb to be in simple location statements."),

      unit("My Daily Routine", "Describe common activities during the day", `
просыпаться|to wake up|prosypatsya
вставать|to get up|vstavat
завтракать|to eat breakfast|zavtrakat
идти в школу|to go to school|idti v shkolu
учиться|to study|uchitsya
играть|to play|igrat
ужинать|to eat dinner|uzhinat
спать|to sleep|spat`, `
A|Что ты делаешь утром?|What do you do in the morning?|chto ty delayesh utrom
B|Я встаю и завтракаю.|I get up and eat breakfast.|ya vstayu i zavtrakayu
A|А вечером?|And in the evening?|a vecherom
B|Я учусь, а потом сплю.|I study and then sleep.|ya uchus, a potom splyu`, "Russian verbs change with the subject. Notice я встаю and ты делаешь."),

      unit("Days and Time", "Talk about weekdays and schedules", `
сегодня|today|segodnya
завтра|tomorrow|zavtra
вчера|yesterday|vchera
понедельник|Monday|ponedelnik
вторник|Tuesday|vtornik
среда|Wednesday|sreda
пятница|Friday|pyatnitsa
который час?|what time is it?|kotoryy chas`, `
A|Какой сегодня день?|What day is today?|kakoy segodnya den
B|Сегодня вторник.|Today is Tuesday.|segodnya vtornik
A|Во сколько начинается урок?|What time does the lesson begin?|vo skolko nachinayetsya urok
B|В девять часов.|At nine o'clock.|v devyat chasov`, "Во сколько? asks at what time. Time phrases change number endings."),

      unit("Weather and Clothes", "Describe weather and choose clothing", `
солнце|sun|solntse
дождь|rain|dozhd
жарко|it is hot|zharko
холодно|it is cold|kholodno
рубашка|shirt|rubashka
брюки|pants|bryuki
ботинки|shoes or boots|botinki
пальто|coat|palto`, `
A|Какая сегодня погода?|What is the weather today?|kakaya segodnya pogoda
B|Холодно и идёт дождь.|It is cold and raining.|kholodno i idyot dozhd
A|Мне нужно пальто.|I need a coat.|mne nuzhno palto
B|Да, надень пальто.|Yes, put on a coat.|da, naden palto`, "Russian often uses impersonal adverbs жарко and холодно for weather and physical sensation."),

      unit("Hobbies and Favorites", "Share interests and favorite activities", `
читать|to read|chitat
рисовать|to draw|risovat
петь|to sing|pet
танцевать|to dance|tantsevat
играть|to play|igrat
футбол|soccer|futbol
музыка|music|muzyka
интересно|interesting or fun|interesno`, `
A|Что ты любишь делать?|What do you like to do?|chto ty lyubish delat
B|Я люблю читать.|I like to read.|ya lyublyu chitat
A|Ты любишь футбол?|Do you like soccer?|ty lyubish futbol
B|Да, это интересно.|Yes, it is fun.|da, eto interesno`, "After любить, an activity stays in the infinitive: люблю читать."),

      unit("Directions and Help", "Follow directions and repair a conversation", `
налево|to the left|nalevo
направо|to the right|napravo
прямо|straight ahead|pryamo
близко|near|blizko
далеко|far|daleko
где…?|where is…?|gde
помогите|please help|pomogite
повторите, пожалуйста|please repeat|povtorite, pozhaluysta`, `
A|Где библиотека?|Where is the library?|gde biblioteka
B|Идите прямо, потом направо.|Go straight, then right.|idite pryamo, potom napravo
A|Я не понимаю. Повторите, пожалуйста.|I do not understand. Please repeat.|ya ne ponimayu. povtorite, pozhaluysta
B|Хорошо, я скажу медленнее.|Okay, I will speak more slowly.|khorosho, ya skazhu medlenneye`, "Я не понимаю and повторите, пожалуйста are essential conversation-repair phrases." )
    ]
  };

  const mandarin = {
    id: "mandarin",
    name: "Mandarin",
    nativeName: "普通话",
    sigil: "汉",
    bannerKicker: "汉字 · 拼音 · 声调",
    bannerGlyphs: ["汉", "字", "ā", "á", "ǎ", "à"],
    portalGreeting: "你好！",
    portalReading: "nǐ hǎo · hello",
    portalOrbit: "汉字 · 拼音 · 声调",
    portalAction: "Hear the portal",
    speechLang: "zh-CN",
    modality: "spoken",
    readingLabel: "Pinyin",
    level: "A1-oriented technical preview / Pinyin-supported",
    accent: "#29866f",
    gradient: "linear-gradient(135deg, #173f47 0%, #25856c 46%, #bd5b3d 100%)",
    description: "Build practical Mandarin through tones, simplified characters, optional pinyin, conversation, typing, and speaking.",
    units: [
      unit("Greetings at the Castle Gate", "Greet someone and introduce yourself", `
你好|hello|nǐ hǎo
早上好|good morning|zǎoshang hǎo
晚上好|good evening|wǎnshang hǎo
再见|goodbye|zàijiàn
请|please|qǐng
谢谢|thank you|xièxie
对不起|I am sorry|duìbuqǐ
你叫什么名字？|what is your name?|nǐ jiào shénme míngzi`, `
A|你好！|Hello!|nǐ hǎo
B|你好。你叫什么名字？|Hello. What is your name?|nǐ hǎo. nǐ jiào shénme míngzi
A|我叫安娜。|My name is Anna.|wǒ jiào Ānnà
B|我叫李明。很高兴认识你。|My name is Li Ming. Nice to meet you.|wǒ jiào Lǐ Míng. hěn gāoxìng rènshi nǐ`, "Mandarin meaning depends on tone. Treat the tone marks in pinyin as part of the word, not decoration."),

      unit("Pinyin and Tones", "Connect syllables, tone contours, and characters", `
拼音|pinyin|pīnyīn
声调|tone|shēngdiào
汉字|Chinese character|hànzì
音节|syllable|yīnjié
一声|first tone|yī shēng
二声|second tone|èr shēng
三声|third tone|sān shēng
四声|fourth tone|sì shēng`, `
A|这个字怎么读？|How is this character read?|zhège zì zěnme dú
B|读“妈”，第一声。|It is read mā, first tone.|dú mā, dì-yī shēng
A|请再读一遍。|Please read it once more.|qǐng zài dú yí biàn
B|妈。|Mā.|mā`, "Practice tones in complete syllables and short phrases; real connected speech changes some tone shapes."),

      unit("Friends and Family", "Identify people and family relationships", `
我|I or me|wǒ
你|you|nǐ
家|family or home|jiā
妈妈|mother|māma
爸爸|father|bàba
哥哥|older brother|gēge
姐姐|older sister|jiějie
朋友|friend|péngyou`, `
A|她是谁？|Who is she?|tā shì shéi
B|她是我姐姐。|She is my older sister.|tā shì wǒ jiějie
A|她也是你的朋友吗？|Is she also your friend?|tā yě shì nǐ de péngyou ma
B|是，她也是我的朋友。|Yes, she is also my friend.|shì, tā yě shì wǒ de péngyou`, "的 often links a possessor to a noun, but it is commonly omitted with close family terms after a pronoun."),

      unit("Numbers and Age", "Count and ask a simple age", `
零|zero|líng
一|one|yī
二|two|èr
三|three|sān
四|four|sì
五|five|wǔ
十|ten|shí
几|how many, small number|jǐ`, `
A|你几岁？|How old are you?|nǐ jǐ suì
B|我十岁。|I am ten years old.|wǒ shí suì
A|这里有几本书？|How many books are here?|zhèlǐ yǒu jǐ běn shū
B|有三本书。|There are three books.|yǒu sān běn shū`, "Mandarin uses measure words between numbers and nouns; 本 is used for bound books."),

      unit("Inside the Classroom", "Use school objects and ask a question", `
学校|school|xuéxiào
教室|classroom|jiàoshì
老师|teacher|lǎoshī
学生|student|xuésheng
书|book|shū
铅笔|pencil|qiānbǐ
书包|schoolbag|shūbāo
问题|question|wèntí`, `
A|书在哪里？|Where is the book?|shū zài nǎlǐ
B|在书包里。|It is in the schoolbag.|zài shūbāo lǐ
A|老师，我有一个问题。|Teacher, I have a question.|lǎoshī, wǒ yǒu yí ge wèntí
B|好，请问吧。|Okay, please ask.|hǎo, qǐng wèn ba`, "在 + place expresses location. 个 is a general measure word, but learn more specific measure words with their nouns."),

      unit("Food and Drinks", "Request food and say what you like", `
水|water|shuǐ
米饭|cooked rice|mǐfàn
面包|bread|miànbāo
苹果|apple|píngguǒ
牛奶|milk|niúnǎi
鸡肉|chicken meat|jīròu
吃|to eat|chī
喝|to drink|hē`, `
A|我要一杯水，谢谢。|I would like a glass of water, thank you.|wǒ yào yì bēi shuǐ, xièxie
B|你要苹果吗？|Would you like an apple?|nǐ yào píngguǒ ma
A|要，我喜欢苹果。|Yes, I like apples.|yào, wǒ xǐhuan píngguǒ
B|给你。|Here you are.|gěi nǐ`, "我要 is a direct useful request. Add 请 or 谢谢 and use an appropriate measure word such as 杯 for cups or glasses."),

      unit("Around the Home", "Name rooms and locate everyday objects", `
家|home|jiā
房间|room|fángjiān
厨房|kitchen|chúfáng
洗手间|bathroom|xǐshǒujiān
桌子|table|zhuōzi
椅子|chair|yǐzi
门|door|mén
窗户|window|chuānghu`, `
A|洗手间在哪里？|Where is the bathroom?|xǐshǒujiān zài nǎlǐ
B|在那个房间旁边。|It is beside that room.|zài nàge fángjiān pángbiān
A|厨房呢？|What about the kitchen?|chúfáng ne
B|厨房在这里。|The kitchen is here.|chúfáng zài zhèlǐ`, "呢 can keep the same topic or question going: 厨房呢? means What about the kitchen?"),

      unit("My Daily Routine", "Describe common morning and evening activities", `
起床|to get up|qǐchuáng
洗脸|to wash one's face|xǐliǎn
吃早饭|to eat breakfast|chī zǎofàn
去学校|to go to school|qù xuéxiào
学习|to study|xuéxí
玩|to play|wán
吃晚饭|to eat dinner|chī wǎnfàn
睡觉|to sleep|shuìjiào`, `
A|你早上做什么？|What do you do in the morning?|nǐ zǎoshang zuò shénme
B|我起床，然后吃早饭。|I get up and then eat breakfast.|wǒ qǐchuáng, ránhòu chī zǎofàn
A|你晚上呢？|What about you in the evening?|nǐ wǎnshang ne
B|我学习，然后睡觉。|I study and then sleep.|wǒ xuéxí, ránhòu shuìjiào`, "Mandarin verbs do not conjugate for person. Time words and particles help establish when an action happens."),

      unit("Days and Time", "Talk about weekdays and schedules", `
今天|today|jīntiān
明天|tomorrow|míngtiān
昨天|yesterday|zuótiān
星期一|Monday|xīngqīyī
星期二|Tuesday|xīngqī'èr
星期三|Wednesday|xīngqīsān
星期五|Friday|xīngqīwǔ
几点？|what time?|jǐ diǎn`, `
A|今天星期几？|What day of the week is today?|jīntiān xīngqī jǐ
B|今天星期二。|Today is Tuesday.|jīntiān xīngqī'èr
A|几点上课？|What time does class begin?|jǐ diǎn shàngkè
B|九点上课。|Class begins at nine.|jiǔ diǎn shàngkè`, "Weekdays use 星期 plus a number. 点 marks a clock hour."),

      unit("Weather and Clothes", "Describe weather and choose clothing", `
太阳|sun|tàiyáng
下雨|to rain|xiàyǔ
热|hot|rè
冷|cold|lěng
衬衫|shirt|chènshān
裤子|pants|kùzi
鞋|shoes|xié
外套|coat or jacket|wàitào`, `
A|今天天气怎么样？|How is the weather today?|jīntiān tiānqì zěnmeyàng
B|很冷，还下雨。|It is cold and also raining.|hěn lěng, hái xiàyǔ
A|我需要一件外套。|I need a coat.|wǒ xūyào yí jiàn wàitào
B|对，穿上外套吧。|Right, put on the coat.|duì, chuān shàng wàitào ba`, "件 is a measure word for many garments; 穿 means to wear or put on clothing."),

      unit("Hobbies and Favorites", "Share interests and favorite activities", `
读书|to read books|dúshū
画画|to draw|huàhuà
唱歌|to sing|chànggē
跳舞|to dance|tiàowǔ
踢足球|to play soccer|tī zúqiú
音乐|music|yīnyuè
有意思|interesting or fun|yǒuyìsi
最喜欢|like best or favorite|zuì xǐhuan`, `
A|你喜欢做什么？|What do you like to do?|nǐ xǐhuan zuò shénme
B|我喜欢画画。|I like drawing.|wǒ xǐhuan huàhuà
A|你最喜欢什么运动？|What sport do you like best?|nǐ zuì xǐhuan shénme yùndòng
B|我最喜欢踢足球。|I like playing soccer best.|wǒ zuì xǐhuan tī zúqiú`, "喜欢 can be followed by a noun or an activity verb phrase."),

      unit("Directions and Help", "Follow directions and repair a conversation", `
左边|left side|zuǒbian
右边|right side|yòubian
一直走|go straight|yìzhí zǒu
近|near|jìn
远|far|yuǎn
在哪里？|where is it?|zài nǎlǐ
请帮忙|please help|qǐng bāngmáng
请再说一遍|please say it again|qǐng zài shuō yí biàn`, `
A|图书馆在哪里？|Where is the library?|túshūguǎn zài nǎlǐ
B|一直走，然后向右转。|Go straight, then turn right.|yìzhí zǒu, ránhòu xiàng yòu zhuǎn
A|我没听懂。请再说一遍。|I did not understand what I heard. Please say it again.|wǒ méi tīngdǒng. qǐng zài shuō yí biàn
B|好，我说慢一点。|Okay, I will speak a little more slowly.|hǎo, wǒ shuō màn yìdiǎn`, "请再说一遍 and 我没听懂 are practical conversation-repair phrases." )
    ]
  };

  const base = window.DRAGON_TONGUES_COURSES;
  window.DRAGON_TONGUES_COURSES = {
    spanish: base.spanish,
    french: base.french,
    japanese: base.japanese,
    korean,
    icelandic,
    somali,
    russian,
    mandarin,
    asl: base.asl
  };
})();
