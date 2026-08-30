(function () {
  "use strict";

  const spokenLessonNames = ["Learn & Listen", "First Conversation", "Read, Hear & Match", "Build & Type", "Speak & Respond", "Review & Chest"];
  const parseRows = text => text.trim().split("\n").map(row => row.split("|").map(value => value.trim()));
  const words = text => parseRows(text).map(([target, english, reading]) => ({ target, english, ...(reading ? { reading } : {}) }));
  const lines = text => parseRows(text).map(([speaker, target, english, reading]) => ({ speaker, target, english, ...(reading ? { reading } : {}) }));
  const unit = (title, subtitle, vocab, dialogue, tip, culture) => ({
    title,
    subtitle,
    objective: subtitle,
    tip,
    culture: culture || "Language choices can change with setting, relationship, and region.",
    lessonNames: spokenLessonNames,
    vocab: words(vocab),
    dialogue: lines(dialogue)
  });

  const arabic = {
    id: "arabic",
    name: "Arabic",
    nativeName: "العربية",
    sigil: "ع",
    bannerKicker: "أ · ب · ت · حَرَكَات · مِنَ اليَمِين",
    bannerGlyphs: ["ع", "أ", "ب", "ت", "؟", "ـ"],
    portalGreeting: "مرحبًا!",
    portalReading: "marḥaban · hello",
    portalOrbit: "حُرُوف · أَصْوَات · حِوَار",
    portalAction: "Hear the portal",
    speechLang: "ar-SA",
    modality: "spoken",
    direction: "rtl",
    readingLabel: "Transliteration",
    level: "A1-oriented technical preview · Modern Standard Arabic",
    accent: "#b96b2f",
    gradient: "linear-gradient(135deg, #2c296b 0%, #8b3f74 48%, #d78a3a 100%)",
    description: "Learn Modern Standard Arabic through its right-to-left script, useful greetings, listening, reading, typing, and early conversation.",
    units: [
      unit("Greetings Across the Portal", "Greet someone, show courtesy, and close a conversation", `
مرحبًا|hello|marḥaban
صباح الخير|good morning|ṣabāḥ al-khayr
مساء الخير|good evening|masāʼ al-khayr
إلى اللقاء|goodbye; until we meet|ilā al-liqāʼ
شكرًا|thank you|shukran
من فضلك|please|min faḍlik
نعم|yes|naʿam
لا|no|lā`, `
A|مرحبًا!|Hello!|marḥaban
B|مرحبًا! كيف حالك؟|Hello! How are you?|marḥaban, kayfa ḥāluka
A|أنا بخير، شكرًا.|I am well, thank you.|anā bi-khayr, shukran
B|إلى اللقاء.|Goodbye.|ilā al-liqāʼ`, "Arabic greetings vary by region. This path begins with widely understood Modern Standard Arabic."),

      unit("Names and Introductions", "Say your name and identify people at school", `
اسمي|my name is|ismī
ما اسمك؟|what is your name?|mā ismuka
أنا|I am; I|anā
أنتَ|you, addressing a boy or man|anta
أنتِ|you, addressing a girl or woman|anti
طالب|male student|ṭālib
طالبة|female student|ṭāliba
معلّم|male teacher|muʿallim
معلّمة|female teacher|muʿallima`, `
A|ما اسمك؟|What is your name?|mā ismuka
B|اسمي ليلى.|My name is Layla.|ismī Laylā
A|أنا طالب.|I am a student.|anā ṭālib
B|وأنا طالبة.|And I am a student.|wa-anā ṭāliba`, "Arabic marks grammatical gender in many nouns and pronouns. The paired forms here help learners notice that pattern."),

      unit("Unlock the Arabic Script", "Recognize how Arabic letters connect and move from right to left", `
حرف|letter|ḥarf
الأبجدية|alphabet|al-abjadiyya
صوت|sound|ṣawt
كلمة|word|kalima
جملة|sentence|jumla
يقرأ|he reads|yaqraʼ
يكتب|he writes|yaktub
من اليمين إلى اليسار|from right to left|min al-yamīn ilā al-yasār`, `
A|هذا حرف ب.|This is the letter bāʼ.|hādhā ḥarfu bāʼ
B|كيف يُنطق؟|How is it pronounced?|kayfa yunṭaq
A|يُنطق ب.|It is pronounced b.|yunṭaqu b
B|أكتب كلمة باب.|I write the word door.|aktubu kalimata bāb`, "Most Arabic letters change shape depending on their position in a word, but the underlying letter and sound remain connected."),

      unit("Numbers and Age", "Count from zero to ten and answer two number questions", `
صفر|zero|ṣifr
واحد|one|wāḥid
اثنان|two|ithnān
ثلاثة|three|thalātha
أربعة|four|arbaʿa
خمسة|five|khamsa
ستة|six|sitta
سبعة|seven|sabʿa
ثمانية|eight|thamāniya
تسعة|nine|tisʿa
عشرة|ten|ʿashara`, `
A|كم كتابًا؟|How many books?|kam kitāban
B|ثلاثة كتب.|Three books.|thalāthatu kutub
A|كم عمرك؟|How old are you?|kam ʿumruka
B|عمري عشر سنوات.|I am ten years old.|ʿumrī ʿashru sanawāt`, "Arabic number agreement becomes more detailed later. This unit focuses on recognizing and using small numbers in fixed beginner frames."),

      unit("Family and Friends", "Identify close family members and ask about a sibling", `
أم|mother|umm
أب|father|ab
أخ|brother|akh
أخت|sister|ukht
جدّ|grandfather|jadd
جدّة|grandmother|jadda
عائلة|family|ʿāʼila
صديق|male friend|ṣadīq
صديقة|female friend|ṣadīqa`, `
A|هذه أمي.|This is my mother.|hādhihi ummī
B|وهذا أبي.|And this is my father.|wa-hādhā abī
A|هل لديك أخ؟|Do you have a brother?|hal ladayka akh
B|نعم، لدي أخ.|Yes, I have a brother.|naʿam, ladayya akh`, "Possession is often expressed by attaching a short ending, as in أمي, my mother, and أبي, my father."),

      unit("Inside the Classroom", "Name school objects and ask a classroom question", `
مدرسة|school|madrasa
صفّ|classroom; class|ṣaff
كتاب|book|kitāb
قلم|pen|qalam
دفتر|notebook|daftar
حقيبة|bag|ḥaqība
معلّم|teacher|muʿallim
سؤال|question|suʼāl`, `
A|أين كتابي؟|Where is my book?|ayna kitābī
B|كتابك في الحقيبة.|Your book is in the bag.|kitābuka fī al-ḥaqība
A|لدي سؤال.|I have a question.|ladayya suʼāl
B|تفضّل.|Go ahead.|tafaḍḍal`, "The short word في means in. أين begins a practical question asking where something is."),

      unit("Food and Drinks", "Request food or water and say that something tastes good", `
ماء|water|māʼ
خبز|bread|khubz
تفاح|apples|tuffāḥ
حليب|milk|ḥalīb
أرز|rice|aruzz
دجاج|chicken|dajāj
جائع|hungry, masculine|jāʼiʿ
لذيذ|delicious, masculine|ladhīdh`, `
A|أريد ماءً، من فضلك.|I want water, please.|urīdu māʼan, min faḍlik
B|تفضّل.|Here you are.|tafaḍḍal
A|هل أنت جائع؟|Are you hungry?|hal anta jāʼiʿ
B|نعم، هذا الطعام لذيذ.|Yes, this food is delicious.|naʿam, hādhā al-ṭaʿāmu ladhīdh`, "Adjectives agree with nouns in gender and number. This unit uses common masculine dictionary forms before adding more patterns."),

      unit("Around the Home", "Name rooms and locate everyday objects", `
بيت|home; house|bayt
غرفة|room|ghurfa
مطبخ|kitchen|maṭbakh
حمّام|bathroom|ḥammām
باب|door|bāb
نافذة|window|nāfidha
طاولة|table|ṭāwila
كرسي|chair|kursī`, `
A|أين الحمّام؟|Where is the bathroom?|ayna al-ḥammām
B|الحمّام بجانب المطبخ.|The bathroom is beside the kitchen.|al-ḥammāmu bijānibi al-maṭbakh
A|أين الكتاب؟|Where is the book?|ayna al-kitāb
B|الكتاب على الطاولة.|The book is on the table.|al-kitābu ʿalā al-ṭāwila`, "Arabic commonly uses a preposition followed by a noun to describe location: في, in; على, on; and بجانب, beside."),

      unit("My Daily Routine", "Describe common morning and evening activities", `
أستيقظ|I wake up|astayqiẓ
أغسل وجهي|I wash my face|aghsilu wajhī
أتناول الفطور|I eat breakfast|atanāwalu al-fuṭūr
أذهب إلى المدرسة|I go to school|adhhabu ilā al-madrasa
أدرس|I study|adrus
ألعب|I play|alʿab
أتناول العشاء|I eat dinner|atanāwalu al-ʿashāʼ
أنام|I sleep|anām`, `
A|ماذا تفعل صباحًا؟|What do you do in the morning?|mādhā tafʿalu ṣabāḥan
B|أستيقظ وأتناول الفطور.|I wake up and eat breakfast.|astayqiẓu wa-atanāwalu al-fuṭūr
A|وماذا تفعل مساءً؟|And what do you do in the evening?|wa-mādhā tafʿalu masāʼan
B|أدرس ثم أنام.|I study and then sleep.|adrusu thumma anām`, "Arabic verbs change to show who is acting. These first-person forms begin with أ and let students describe their own routines."),

      unit("Days and Time", "Talk about days and ask the time", `
اليوم|today|al-yawm
غدًا|tomorrow|ghadan
أمس|yesterday|ams
الإثنين|Monday|al-ithnayn
الثلاثاء|Tuesday|al-thulāthāʼ
الأربعاء|Wednesday|al-arbiʿāʼ
الجمعة|Friday|al-jumʿa
كم الساعة؟|what time is it?|kam al-sāʿa`, `
A|ما اليوم؟|What day is it?|mā al-yawm
B|اليوم الثلاثاء.|Today is Tuesday.|al-yawmu al-thulāthāʼ
A|كم الساعة؟|What time is it?|kam al-sāʿa
B|الساعة التاسعة.|It is nine o'clock.|al-sāʿatu al-tāsiʿa`, "The names of several weekdays are connected to number roots. Clock hours use ordinal forms such as التاسعة, the ninth."),

      unit("Weather and Clothes", "Describe the weather and choose suitable clothing", `
الطقس|weather|al-ṭaqs
الشمس|the sun|al-shams
المطر|rain|al-maṭar
حارّ|hot|ḥārr
بارد|cold|bārid
قميص|shirt|qamīṣ
حذاء|shoe|ḥidhāʼ
معطف|coat|miʿṭaf`, `
A|كيف الطقس اليوم؟|How is the weather today?|kayfa al-ṭaqsu al-yawm
B|الجو بارد وممطر.|It is cold and rainy.|al-jawwu bāridun wa-mumṭir
A|أحتاج إلى معطف.|I need a coat.|aḥtāju ilā miʿṭaf
B|ارتدِ معطفك.|Put on your coat.|irtadi miʿṭafak`, "Weather expressions often use الجو, the air or atmosphere, followed by an adjective."),

      unit("Interests, Directions, and Help", "Share an interest and repair a conversation politely", `
أحبّ|I like; I love|uḥibb
أقرأ|I read|aqraʼ
أرسم|I draw|arsum
ألعب كرة القدم|I play soccer|alʿabu kurata al-qadam
الموسيقى|music|al-mūsīqā
اليسار|the left|al-yasār
اليمين|the right|al-yamīn
أعِد من فضلك|repeat, please|aʿid min faḍlik`, `
A|ماذا تحب أن تفعل؟|What do you like to do?|mādhā tuḥibbu an tafʿal
B|أحب أن أرسم.|I like to draw.|uḥibbu an arsum
A|عذرًا، أعِد من فضلك.|Excuse me, repeat please.|ʿudhran, aʿid min faḍlik
B|حسنًا، سأتكلم ببطء.|Okay, I will speak slowly.|ḥasanan, sa-atakallamu bi-buṭʼ`, "أعِد من فضلك is a useful repair phrase. Asking for repetition is a successful communication strategy, not a failure.")
    ]
  };

  const vietnamese = {
    id: "vietnamese",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    sigil: "Vi",
    bannerKicker: "Ă · Â · Đ · Ê · Ô · Ơ · Ư · DẤU THANH",
    bannerGlyphs: ["Đ", "Ă", "Ơ", "Ư", "Ễ", "ạ"],
    portalGreeting: "Xin chào!",
    portalReading: "Hello · tap to hear",
    portalOrbit: "ÂM · THANH ĐIỆU · HỘI THOẠI",
    portalAction: "Hear the portal",
    speechLang: "vi-VN",
    modality: "spoken",
    level: "A1-oriented technical preview · Tone-supported",
    accent: "#168b88",
    gradient: "linear-gradient(135deg, #173f6c 0%, #168b88 50%, #d89043 100%)",
    description: "Build practical Vietnamese through tone-aware listening, familiar letters, useful conversations, reading, typing, and speaking.",
    units: [
      unit("Greetings and Courtesy", "Greet someone, ask how they are, and say goodbye", `
xin chào|hello
chào buổi sáng|good morning
tạm biệt|goodbye
cảm ơn|thank you
làm ơn|please
vâng|yes, polite
dạ|yes; respectful response
không|no; not`, `
A|Xin chào!|Hello!
B|Chào bạn! Bạn khỏe không?|Hello! How are you?
A|Tôi khỏe, cảm ơn bạn.|I am well, thank you.
B|Tạm biệt!|Goodbye!`, "Vietnamese greetings and pronouns reflect age and relationship. Bạn is a useful neutral classroom starting point, not the only possible form."),

      unit("Names and New Friends", "Introduce yourself and identify people at school", `
tên|name
tôi|I; me
bạn|you; friend
học sinh|student
giáo viên|teacher
bạn bè|friends
tên bạn là gì?|what is your name?
rất vui được gặp bạn|nice to meet you`, `
A|Tên bạn là gì?|What is your name?
B|Tôi tên là Linh.|My name is Linh.
A|Tôi là học sinh.|I am a student.
B|Rất vui được gặp bạn.|Nice to meet you.`, "Vietnamese often uses relationship words as pronouns. Learners should listen for the form a speaker chooses in a real interaction."),

      unit("Letters and Six Tones", "Recognize Vietnamese spelling marks and tone names", `
chữ cái|letter
âm|sound
dấu thanh|tone mark
ngang|level tone
sắc|rising tone
huyền|falling tone
hỏi|dipping-rising tone
ngã|broken-rising tone
nặng|low constricted tone`, `
A|Đây là chữ gì?|What letter is this?
B|Đây là chữ đ.|This is the letter đ.
A|Từ này có dấu gì?|Which tone mark does this word have?
B|Từ này có dấu sắc.|This word has the sắc tone.`, "Tone is part of a Vietnamese word, not decoration. Keep the vowel quality and tone together when listening and speaking."),

      unit("Numbers and Age", "Count from zero to ten and answer number questions", `
không|zero
một|one
hai|two
ba|three
bốn|four
năm|five
sáu|six
bảy|seven
tám|eight
chín|nine
mười|ten`, `
A|Bạn bao nhiêu tuổi?|How old are you?
B|Tôi mười tuổi.|I am ten years old.
A|Có bao nhiêu quyển sách?|How many books are there?
B|Có ba quyển sách.|There are three books.`, "Vietnamese uses classifiers with many counted nouns. Quyển is a common classifier for books."),

      unit("Family and Relationships", "Identify family members and ask about a sibling", `
gia đình|family
mẹ|mother
bố|father, common in northern usage
ba|father, common in southern usage
anh trai|older brother
chị gái|older sister
em|younger sibling
ông|grandfather
bà|grandmother`, `
A|Đây là mẹ tôi.|This is my mother.
B|Đây là bố tôi.|This is my father.
A|Bạn có anh trai không?|Do you have an older brother?
B|Có, tôi có một anh trai.|Yes, I have one older brother.`, "Family vocabulary is also used to address people. Regional choices such as bố and ba are both legitimate."),

      unit("Inside the Classroom", "Name school objects and ask a classroom question", `
trường học|school
lớp học|classroom
giáo viên|teacher
học sinh|student
sách|book
bút chì|pencil
cặp sách|school bag
câu hỏi|question`, `
A|Quyển sách ở đâu?|Where is the book?
B|Nó ở trong cặp sách.|It is inside the school bag.
A|Thưa cô, em có câu hỏi.|Teacher, I have a question.
B|Em hỏi đi.|Go ahead and ask.`, "Classroom address terms change with the teacher and student. This dialogue models a common respectful teacher-student exchange."),

      unit("Food and Drinks", "Request water or food and describe taste", `
nước|water
cơm|cooked rice; meal
bánh mì|bread; Vietnamese sandwich
táo|apple
sữa|milk
thịt gà|chicken meat
đói|hungry
ngon|delicious`, `
A|Cho tôi xin nước.|Water, please.
B|Đây ạ.|Here it is.
A|Bạn có đói không?|Are you hungry?
B|Có, món này ngon.|Yes, this dish is delicious.`, "Dạ and ạ help show politeness and respect. Their use depends on the speakers and situation."),

      unit("Around the Home", "Name rooms and locate everyday objects", `
nhà|home; house
phòng|room
bếp|kitchen
nhà vệ sinh|bathroom
cửa|door
cửa sổ|window
bàn|table
ghế|chair`, `
A|Nhà vệ sinh ở đâu?|Where is the bathroom?
B|Ở bên cạnh bếp.|It is beside the kitchen.
A|Quyển sách ở đâu?|Where is the book?
B|Nó ở trên bàn.|It is on the table.`, "Vietnamese location phrases often combine ở, located at, with words such as trong, inside, trên, on, and bên cạnh, beside."),

      unit("My Daily Routine", "Describe common morning and evening activities", `
thức dậy|to wake up
rửa mặt|to wash one's face
ăn sáng|to eat breakfast
đi học|to go to school
học bài|to study a lesson
chơi|to play
ăn tối|to eat dinner
đi ngủ|to go to sleep`, `
A|Buổi sáng bạn làm gì?|What do you do in the morning?
B|Tôi thức dậy rồi ăn sáng.|I wake up and then eat breakfast.
A|Buổi tối bạn làm gì?|What do you do in the evening?
B|Tôi học bài rồi đi ngủ.|I study and then go to sleep.`, "Vietnamese verbs do not conjugate for person. Time words and particles help establish when an action occurs."),

      unit("Days and Time", "Talk about weekdays and ask the time", `
hôm nay|today
ngày mai|tomorrow
hôm qua|yesterday
thứ Hai|Monday
thứ Ba|Tuesday
thứ Tư|Wednesday
thứ Sáu|Friday
mấy giờ?|what time?`, `
A|Hôm nay là thứ mấy?|What day of the week is today?
B|Hôm nay là thứ Ba.|Today is Tuesday.
A|Bây giờ là mấy giờ?|What time is it now?
B|Bây giờ là chín giờ.|It is nine o'clock now.`, "Weekdays are usually numbered after thứ. Sunday is Chủ nhật, which follows a different pattern."),

      unit("Weather and Clothes", "Describe the weather and choose clothing", `
thời tiết|weather
nắng|sunny; sunshine
mưa|rain; rainy
nóng|hot
lạnh|cold
áo sơ mi|shirt
giày|shoes
áo khoác|coat; jacket`, `
A|Hôm nay thời tiết thế nào?|How is the weather today?
B|Trời lạnh và có mưa.|It is cold and rainy.
A|Tôi cần áo khoác.|I need a coat.
B|Bạn mặc áo khoác nhé.|Put on a coat, okay?`, "Trời can mean sky or weather in everyday weather expressions. The particle nhé softens a suggestion."),

      unit("Hobbies, Directions, and Help", "Share an interest and repair a conversation", `
thích|to like
đọc sách|to read books
vẽ|to draw
hát|to sing
bóng đá|soccer
bên trái|left side
bên phải|right side
xin nói lại|please say it again`, `
A|Bạn thích làm gì?|What do you like to do?
B|Tôi thích vẽ.|I like drawing.
A|Xin lỗi, xin nói lại.|Sorry, please say it again.
B|Được, tôi sẽ nói chậm hơn.|Okay, I will speak more slowly.`, "Asking someone to repeat or slow down is a real communication skill. It should appear early, not only after learners know many words.")
    ]
  };

  const navajo = {
    id: "navajo",
    name: "Diné Bizaad",
    nativeName: "Diné Bizaad · Navajo",
    sigil: "Ł",
    bannerKicker: "Á · Ą́ · É · Ł · ʼ · HIGH TONE · NASAL VOWELS",
    bannerGlyphs: ["Ł", "ʼ", "Á", "Ą́", "É", "Ǫ́"],
    portalGreeting: "Yáʼátʼééh!",
    portalReading: "It is good · hello",
    portalOrbit: "BIZAAD · HANEʼ · HAZHÓʼÓGO",
    portalAction: "Hear the portal",
    speechLang: "nv-US",
    modality: "spoken",
    audioMode: "reviewed-native-recording",
    audioPendingNote: "Exact openly licensed native-speaker recordings are packaged where available. Lines still marked pending require a complete reviewed recording from a fluent Diné speaker; English, stitched-word, and unrelated synthetic fallbacks are blocked.",
    level: "Beginner foundations · native-audio integration track",
    accent: "#a66733",
    gradient: "linear-gradient(135deg, #283f67 0%, #6d4b78 46%, #b9783e 100%)",
    description: "Begin Diné Bizaad through accurate writing, practical greetings, Arizona-centered vocabulary, cultural care, reading, typing, and conversation foundations.",
    units: [
      unit("Yáʼátʼééh: Greeting Well", "Use a greeting, thanks, yes or no, and a respectful farewell", `
Yáʼátʼééh|hello; literally, it is good
Yáʼátʼééh abíní|good morning
Ahéheeʼ|thank you; I am grateful
Hágoóneeʼ|okay; see you later
Aooʼ|yes; true
Dooda|no; not
haʼátʼíí|what
hazhóʼógo|carefully; in a good manner`, `
A|Yáʼátʼééh!|Hello!
B|Yáʼátʼééh!|Hello!
A|Ahéheeʼ.|Thank you.
B|Hágoóneeʼ.|See you later.`, "Yáʼátʼééh is used day or night and literally carries the idea that it is good.", "Diné Bizaad carries Diné history, relationships, and ways of knowing. Cultural meaning belongs beside vocabulary, not in a separate tourist-facts box."),

      unit("Names, People, and Language", "Introduce yourself and name the language respectfully", `
Shí éí Maya yinishyé.|My name is Maya.
Haash yinilyé?|What is your name?
Diné|the People; a Diné person
Diné bizaad|the Navajo language; the People's language
shí|I; me; mine
ní|you; yours
shikʼéí|my relatives; my family
shidinéʼé|my people`, `
A|Haash yinilyé?|What is your name?
B|Shí éí Maya yinishyé.|My name is Maya.
A|Diné bizaad bóhooshʼaah.|I am learning Diné Bizaad.
B|Yáʼátʼééh!|That is good!`, "Personal introductions can include family and clan relationships. This beginner exchange teaches only a name frame and does not imitate a full clan introduction."),

      unit("Hear and Write Diné Sounds", "Notice tone, nasal vowels, glottal stops, and the letter ł", `
á|high-tone a
ą|nasal a
ą́|high-tone nasal a
ł|voiceless lateral sound written ł
ʼ|glottal stop
chʼ|ejective ch sound
tłʼ|ejective lateral sound
Diné bizaad|the Navajo language`, `
A|Diné bizaad.|The Navajo language.
B|Á, ą́, ł, ʼ.|Four important written forms.
A|Diné bizaad yáʼátʼééh.|The Navajo language is good.
B|Aooʼ, yáʼátʼééh.|Yes, it is good.`, "Tone, vowel length, nasalization, and the glottal stop can distinguish words. Never discard the marks as optional decoration."),

      unit("Numbers One Through Ten", "Recognize and arrange the first ten counting numbers", `
tʼááłáʼí|one
naaki|two
tááʼ|three
dį́į́ʼ|four
ashdlaʼ|five
hastą́ą́|six
tsostsʼid|seven
tseebíí|eight
náhástʼéí|nine
neeznáá|ten`, `
A|Tʼááłáʼí, naaki, tááʼ.|One, two, three.
B|Dį́į́ʼ, ashdlaʼ.|Four, five.
A|Hastą́ą́, tsostsʼid.|Six, seven.
B|Tseebíí, náhástʼéí, neeznáá.|Eight, nine, ten.`, "Listen for long vowels, nasal vowels, high tone, and glottal stops while counting; spelling preserves those sound contrasts."),

      unit("Family Relationships", "Identify close relatives with first-person kinship terms", `
shimá|my mother
shizhéʼé|my father
shimasání|my maternal grandmother
shicheii|my maternal grandfather
shádí|my older sister
shinaaí|my older brother
shideezhí|my younger sister
shitsilí|my younger brother`, `
A|Díí shimá.|This is my mother.
B|Díí shizhéʼé.|This is my father.
A|Yáʼátʼééh, shimasání.|Hello, my maternal grandmother.
B|Ahéheeʼ, shicheii.|Thank you, my maternal grandfather.`, "Diné kinship terms are relational and specific. The shi- forms here mean my; they should not be taught as context-free labels for every speaker."),

      unit("Learning and Written Words", "Talk about learning and recognize common literacy words", `
Diné bizaad bóhooshʼaah.|I am learning Diné Bizaad.
ííníshtaʼ|I read; I study; I attend school
naaltsoos|paper or book
haneʼ|story; narration; history
haneʼ binaaltsoos|newspaper
bééhózin|it is known; knowledge of it
naalnish|I work
naashá|I walk around; I travel`, `
A|Diné bizaad bóhooshʼaah.|I am learning Diné Bizaad.
B|Yáʼátʼééh!|That is good!
A|Naaltsoos.|A book or paper.
B|Haneʼ binaaltsoos.|A newspaper.`, "Diné Bizaad verbs carry a great deal of information. Learn complete useful forms first before trying to detach an English-style infinitive."),

      unit("Food, Water, and Taste", "Name everyday foods and express a simple want or reaction", `
chʼiyáán|food; groceries
tó|water
bilasáana|apple
bááh dah díníilghaazh|frybread
dééh|tea
neeshchʼííʼ|piñon nut
hashkʼaan|yucca fruit; banana
shił łikan|it tastes good to me`, `
A|Chʼiyáán nisin.|I want food.
B|Tó nisin.|I want water.
A|Bilasáana ashą́.|I eat an apple.
B|Shił łikan.|It tastes good to me.`, "Food vocabulary connects to family, place, and season. This unit avoids treating one dish as a complete picture of Diné life."),

      unit("Animals Around Us", "Recognize eight common animal names", `
łééchąąʼí|dog
mósí|cat
łį́į́ʼ|horse
dibé|sheep
mąʼii|coyote
gah|rabbit
shash|bear
tsídii|bird; birds`, `
A|Díí łééchąąʼí.|This is a dog.
B|Díí mósí.|This is a cat.
A|Tsídii.|A bird.
B|Dibé dóó łį́į́ʼ.|A sheep and a horse.`, "Some animal terms also appear in stories and teachings. Vocabulary recognition does not grant permission to retell culturally specific narratives without guidance."),

      unit("Land, Water, and Weather", "Recognize words connected to Arizona land and changing weather", `
kéyah|land; country
nahasdzáán|earth; world
tó|water
tsé|rock; stone
łeezh|soil; dirt
níłchʼi|air; wind; breath
nahałtin|it is raining
níłtsą́|rainstorm
sháńdíín|sunlight; sunshine`, `
A|Nahałtin.|It is raining.
B|Níłchʼi.|Wind; air.
A|Sháńdíín.|Sunlight.
B|Kéyah nizhóní.|The land is beautiful.`, "Place-based vocabulary should build attention and responsibility toward land, not turn the Southwest into decorative scenery."),

      unit("Colors and Descriptions", "Notice common color and description words", `
łigai|white; it is white
łizhin|black; it is black
łichííʼ|red; it is red
łitso|yellow; it is yellow
dootłʼizh|blue or green; it is blue or green
nizhóní|beautiful
deesdoi|it is hot or warm
nantłʼah|it is difficult; hard
tʼóó ahayóí|many; much; a lot`, `
A|Díí łichííʼ.|This is red.
B|Díí dootłʼizh.|This is blue or green.
A|Kéyah nizhóní.|The land is beautiful.
B|Tʼóó ahayóí.|There are many; a lot.`, "Dootłʼizh spans a color area that English commonly divides into blue and green. Color categories do not map perfectly across languages."),

      unit("Today, Yesterday, Tomorrow", "Recognize beginner time words and a daily-learning statement", `
dííjį́|today; this day
adą́ą́dą́ą́ʼ|yesterday
yiskáago|tomorrow
abíní|morning
tłʼééʼ|night
tʼááʼákwííjį́|every day
nááhai|year
náádamóo|next week; next Sunday`, `
A|Dííjį́ ííníshtaʼ.|I study today.
B|Yiskáago.|Tomorrow.
A|Adą́ą́dą́ą́ʼ.|Yesterday.
B|Tʼááʼákwííjį́ Diné bizaad bóhooshʼaah.|Every day I am learning Diné Bizaad.`, "Time words often appear early in a sentence. Verb form and surrounding context add information that English may express with separate words."),

      unit("Conversation Readiness", "Combine greetings, names, learning, thanks, and clarification", `
Haash yinilyé?|What is your name?
Shí éí Maya yinishyé.|My name is Maya.
Diné bizaad bóhooshʼaah.|I am learning Diné Bizaad.
haʼátʼíí|what
háí|who
háádí|where
hazhóʼógo|carefully; in a good manner
Ahéheeʼ|thank you; I am grateful
Hágoóneeʼ|okay; see you later`, `
A|Yáʼátʼééh! Haash yinilyé?|Hello! What is your name?
B|Shí éí Maya yinishyé.|My name is Maya.
A|Diné bizaad bóhooshʼaah.|I am learning Diné Bizaad.
B|Yáʼátʼééh. Ahéheeʼ. Hágoóneeʼ.|That is good. Thank you. See you later.`, "This capstone is a functional beginner exchange. A fluent Diné educator must review pronunciation, phrasing, regional usage, and cultural notes before the path is labeled certified curriculum.")
    ]
  };

  const base = window.DRAGON_TONGUES_COURSES;
  window.DRAGON_TONGUES_COURSES = {
    spanish: base.spanish,
    french: base.french,
    japanese: base.japanese,
    korean: base.korean,
    icelandic: base.icelandic,
    somali: base.somali,
    russian: base.russian,
    mandarin: base.mandarin,
    arabic,
    vietnamese,
    navajo,
    asl: base.asl
  };
})();
