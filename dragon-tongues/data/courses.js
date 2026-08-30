(function () {
  "use strict";

  const spokenLessonNames = ["Learn & Listen", "First Conversation", "Read, Hear & Match", "Build & Type", "Speak & Respond", "Review & Chest"];
  const aslLessonNames = ["Watch & Learn", "First Signed Exchange", "Recognize", "Build & Fingerspell", "Sign & Respond", "Review & Chest"];
  const aslChart = "assets/asl-alphabet-gallaudet.png";

  const words = rows => rows.map(([target, english, reading]) => ({ target, english, ...(reading ? { reading } : {}) }));
  const lines = rows => rows.map(([speaker, target, english, reading]) => ({ speaker, target, english, ...(reading ? { reading } : {}) }));
  const unit = (title, subtitle, vocab, dialogue, options = {}) => ({
    title,
    subtitle,
    objective: options.objective || subtitle,
    tip: options.tip || "Notice the pattern, imitate the model, and use it in context.",
    culture: options.culture || "Language choices can change with setting, relationship, and region.",
    lessonNames: options.visual ? aslLessonNames : spokenLessonNames,
    vocab: words(vocab),
    dialogue: lines(dialogue),
    ...(options.videoRequired ? { dialogueRequiresVideo: true } : {})
  });

  window.DRAGON_TONGUES_COURSES = {
    spanish: {
      id: "spanish",
      name: "Spanish",
      nativeName: "Español",
      sigil: "Ñ",
      bannerKicker: "¿ ¡ · Ñ · Á É Í Ó Ú",
      bannerGlyphs: ["¿", "¡", "Ñ", "á", "rr", "…"],
      portalGreeting: "¡Hola!",
      portalReading: "Hello · tap to hear",
      portalOrbit: "AMÉRICAS · EUROPA · ÁFRICA",
      portalAction: "Hear the portal",
      speechLang: "es-ES",
      modality: "spoken",
      level: "A1-oriented technical preview",
      accent: "#d94d58",
      gradient: "linear-gradient(135deg, #4b2d7f 0%, #b83f67 48%, #e9823e 100%)",
      description: "Build useful beginner Spanish through listening, conversation, reading, typing, and speaking.",
      units: [
        unit("Greetings at the Castle Gate", "Meet someone and exchange polite greetings", [
          ["hola", "hello"], ["buenos días", "good morning"], ["buenas tardes", "good afternoon"], ["buenas noches", "good evening / good night"],
          ["adiós", "goodbye"], ["por favor", "please"], ["gracias", "thank you"], ["¿cómo estás?", "how are you?"], ["bien", "well / good"], ["me llamo…", "my name is…"]
        ], [
          ["A", "¡Hola! Buenos días.", "Hello! Good morning."], ["B", "Hola. ¿Cómo estás?", "Hello. How are you?"],
          ["A", "Bien, gracias. Me llamo Ana.", "Good, thank you. My name is Ana."], ["B", "Me llamo Luis. Adiós.", "My name is Luis. Goodbye."]
        ], { tip: "Use buenos días before noon, buenas tardes later in the day, and buenas noches in the evening." }),

        unit("Friends and Family", "Identify people and talk about relationships", [
          ["yo", "I"], ["tú", "you"], ["él", "he"], ["ella", "she"], ["familia", "family"], ["madre", "mother"],
          ["padre", "father"], ["hermano", "brother"], ["hermana", "sister"], ["amigo / amiga", "friend"]
        ], [
          ["A", "¿Quién es ella?", "Who is she?"], ["B", "Ella es mi hermana.", "She is my sister."],
          ["A", "¿Es tu amiga?", "Is she your friend?"], ["B", "Sí, es mi hermana y mi amiga.", "Yes, she is my sister and my friend."]
        ], { tip: "Spanish often marks gender in family and friend words: hermano/hermana and amigo/amiga." }),

        unit("Numbers and Colors", "Count small groups and describe basic colors", [
          ["cero", "zero"], ["uno", "one"], ["dos", "two"], ["tres", "three"], ["cuatro", "four"], ["cinco", "five"],
          ["rojo", "red"], ["azul", "blue"], ["verde", "green"], ["amarillo", "yellow"]
        ], [
          ["A", "¿Cuántos libros hay?", "How many books are there?"], ["B", "Hay tres libros.", "There are three books."],
          ["A", "¿De qué color?", "What color?"], ["B", "Dos son azules y uno es rojo.", "Two are blue and one is red."]
        ], { tip: "Color endings can change to match a noun, but azul and verde keep the same basic form for gender." }),

        unit("Inside the Classroom", "Use common school objects and classroom language", [
          ["escuela", "school"], ["clase", "class"], ["maestro / maestra", "teacher"], ["estudiante", "student"], ["libro", "book"],
          ["lápiz", "pencil"], ["papel", "paper"], ["mochila", "backpack"], ["pregunta", "question"], ["respuesta", "answer"]
        ], [
          ["A", "Necesito un lápiz y papel.", "I need a pencil and paper."], ["B", "El lápiz está en la mochila.", "The pencil is in the backpack."],
          ["A", "Tengo una pregunta.", "I have a question."], ["B", "La maestra tiene la respuesta.", "The teacher has the answer."]
        ], { tip: "Un and una mean “a/an.” Their form matches the grammatical gender of the noun." }),

        unit("Food and Drinks", "Ask for food and say what you like", [
          ["agua", "water"], ["pan", "bread"], ["manzana", "apple"], ["leche", "milk"], ["arroz", "rice"], ["pollo", "chicken"],
          ["comer", "to eat"], ["beber", "to drink"], ["quiero…", "I want…"], ["me gusta…", "I like…"]
        ], [
          ["A", "Quiero agua y una manzana, por favor.", "I want water and an apple, please."], ["B", "¿Te gusta el pan?", "Do you like bread?"],
          ["A", "Sí, me gusta el pan.", "Yes, I like bread."], ["B", "Aquí tienes. Buen provecho.", "Here you are. Enjoy your meal."]
        ], { tip: "Use quiero for a direct beginner request and por favor to make it polite." }),

        unit("Around the Home", "Name rooms, furniture, and locations", [
          ["casa", "house / home"], ["habitación", "bedroom / room"], ["cocina", "kitchen"], ["baño", "bathroom"], ["mesa", "table"],
          ["silla", "chair"], ["puerta", "door"], ["ventana", "window"], ["aquí", "here"], ["allí", "there"]
        ], [
          ["A", "¿Dónde está el baño?", "Where is the bathroom?"], ["B", "Está allí, junto a la habitación.", "It is there, next to the bedroom."],
          ["A", "¿Y la cocina?", "And the kitchen?"], ["B", "La cocina está aquí.", "The kitchen is here."]
        ], { tip: "¿Dónde está…? is a useful frame for asking where one place or object is." }),

        unit("My Daily Routine", "Describe common activities during the day", [
          ["despertarse", "to wake up"], ["levantarse", "to get up"], ["desayunar", "to eat breakfast"], ["ir", "to go"], ["estudiar", "to study"],
          ["jugar", "to play"], ["cenar", "to eat dinner"], ["dormir", "to sleep"], ["por la mañana", "in the morning"], ["por la tarde", "in the afternoon"]
        ], [
          ["A", "¿Qué haces por la mañana?", "What do you do in the morning?"], ["B", "Me levanto, desayuno y voy a la escuela.", "I get up, eat breakfast, and go to school."],
          ["A", "¿Y por la tarde?", "And in the afternoon?"], ["B", "Estudio y juego.", "I study and play."]
        ], { tip: "Many dictionary verbs end in -ar, -er, or -ir. Conversation uses a changed form such as estudio or juego." }),

        unit("Days and Time", "Talk about days, today, tomorrow, and schedules", [
          ["hoy", "today"], ["mañana", "tomorrow"], ["ayer", "yesterday"], ["lunes", "Monday"], ["martes", "Tuesday"],
          ["miércoles", "Wednesday"], ["jueves", "Thursday"], ["viernes", "Friday"], ["¿qué hora es?", "what time is it?"], ["a las…", "at… o’clock"]
        ], [
          ["A", "¿Qué día es hoy?", "What day is today?"], ["B", "Hoy es martes.", "Today is Tuesday."],
          ["A", "¿A qué hora es la clase?", "What time is class?"], ["B", "La clase es a las nueve.", "Class is at nine."]
        ], { tip: "Days of the week are normally lowercase in Spanish." }),

        unit("Weather and Clothes", "Describe the weather and choose clothing", [
          ["sol", "sun"], ["lluvia", "rain"], ["hace calor", "it is hot"], ["hace frío", "it is cold"], ["camisa", "shirt"],
          ["pantalones", "pants"], ["zapatos", "shoes"], ["abrigo", "coat"], ["llevar", "to wear / carry"], ["necesito…", "I need…"]
        ], [
          ["A", "¿Qué tiempo hace?", "What is the weather like?"], ["B", "Hace frío y hay lluvia.", "It is cold and rainy."],
          ["A", "Necesito un abrigo.", "I need a coat."], ["B", "Sí, lleva el abrigo y los zapatos.", "Yes, wear the coat and shoes."]
        ], { tip: "Spanish often uses hace with weather: hace frío and hace calor." }),

        unit("Hobbies and Sports", "Share interests and favorite activities", [
          ["jugar", "to play"], ["leer", "to read"], ["dibujar", "to draw"], ["cantar", "to sing"], ["bailar", "to dance"],
          ["fútbol", "soccer"], ["voleibol", "volleyball"], ["música", "music"], ["divertido", "fun"], ["favorito / favorita", "favorite"]
        ], [
          ["A", "¿Qué te gusta hacer?", "What do you like to do?"], ["B", "Me gusta jugar al voleibol.", "I like to play volleyball."],
          ["A", "¿Cuál es tu deporte favorito?", "What is your favorite sport?"], ["B", "El voleibol. Es divertido.", "Volleyball. It is fun."]
        ], { tip: "After me gusta, use an infinitive such as leer, cantar, or jugar." }),

        unit("Directions and Places", "Ask where places are and follow simple directions", [
          ["izquierda", "left"], ["derecha", "right"], ["todo recto", "straight ahead"], ["cerca", "near"], ["lejos", "far"],
          ["¿dónde está…?", "where is…?"], ["calle", "street"], ["autobús", "bus"], ["parque", "park"], ["biblioteca", "library"]
        ], [
          ["A", "¿Dónde está la biblioteca?", "Where is the library?"], ["B", "Todo recto y después a la derecha.", "Straight ahead and then to the right."],
          ["A", "¿Está lejos?", "Is it far?"], ["B", "No, está cerca del parque.", "No, it is near the park."]
        ], { tip: "Use está for the location of a place or object." }),

        unit("Feelings and Help", "Express needs, feelings, and requests for clarification", [
          ["feliz", "happy"], ["triste", "sad"], ["cansado / cansada", "tired"], ["emocionado / emocionada", "excited"], ["enfermo / enferma", "sick"],
          ["ayuda", "help"], ["entiendo", "I understand"], ["no entiendo", "I do not understand"], ["más despacio", "more slowly"], ["¿puedes repetir?", "can you repeat?"]
        ], [
          ["A", "No entiendo. ¿Puedes repetir más despacio?", "I do not understand. Can you repeat more slowly?"], ["B", "Sí, claro.", "Yes, of course."],
          ["A", "Gracias por la ayuda.", "Thank you for the help."], ["B", "De nada. ¿Estás bien?", "You’re welcome. Are you okay?"]
        ], { tip: "No entiendo and ¿puedes repetir? are powerful phrases that keep a real conversation going." })
      ]
    },

    french: {
      id: "french",
      name: "French",
      nativeName: "Français",
      sigil: "É",
      bannerKicker: "« » · É È Ê · Ç · Œ",
      bannerGlyphs: ["«", "»", "É", "ç", "œ", "…"],
      portalGreeting: "Bonjour !",
      portalReading: "Hello · tap to hear",
      portalOrbit: "EUROPE · AFRIQUE · AMÉRIQUES",
      portalAction: "Hear the portal",
      speechLang: "fr-FR",
      modality: "spoken",
      level: "A1-oriented technical preview",
      accent: "#496fd2",
      gradient: "linear-gradient(135deg, #183c88 0%, #496fd2 52%, #78448f 100%)",
      description: "Build useful beginner French through listening, conversation, reading, typing, and speaking.",
      units: [
        unit("Greetings at the Castle Gate", "Meet someone and exchange polite greetings", [
          ["bonjour", "hello / good morning"], ["bonsoir", "good evening"], ["au revoir", "goodbye"], ["s’il vous plaît", "please"], ["merci", "thank you"],
          ["comment ça va ?", "how are you?"], ["ça va bien", "I am well"], ["oui", "yes"], ["non", "no"], ["je m’appelle…", "my name is…"]
        ], [
          ["A", "Bonjour ! Comment ça va ?", "Hello! How are you?"], ["B", "Ça va bien, merci. Et toi ?", "I am well, thank you. And you?"],
          ["A", "Très bien. Je m’appelle Ana.", "Very well. My name is Ana."], ["B", "Je m’appelle Léo. Au revoir !", "My name is Léo. Goodbye!"]
        ], { tip: "Bonjour works through much of the day; switch to bonsoir in the evening." }),

        unit("Friends and Family", "Identify people and talk about relationships", [
          ["je", "I"], ["tu", "you"], ["il", "he"], ["elle", "she"], ["famille", "family"], ["mère", "mother"], ["père", "father"],
          ["frère", "brother"], ["sœur", "sister"], ["ami / amie", "friend"]
        ], [
          ["A", "Qui est-elle ?", "Who is she?"], ["B", "Elle est ma sœur.", "She is my sister."],
          ["A", "C’est ton amie ?", "Is she your friend?"], ["B", "Oui, c’est ma sœur et mon amie.", "Yes, she is my sister and my friend."]
        ], { tip: "Mon, ma, and mes mean “my” and change with the noun that follows." }),

        unit("Numbers and Colors", "Count small groups and describe basic colors", [
          ["zéro", "zero"], ["un", "one"], ["deux", "two"], ["trois", "three"], ["quatre", "four"], ["cinq", "five"],
          ["rouge", "red"], ["bleu", "blue"], ["vert", "green"], ["jaune", "yellow"]
        ], [
          ["A", "Combien de livres ?", "How many books?"], ["B", "Il y a trois livres.", "There are three books."],
          ["A", "De quelle couleur ?", "What color?"], ["B", "Deux sont bleus et un est rouge.", "Two are blue and one is red."]
        ], { tip: "Many French color words change spelling to agree with plural or feminine nouns." }),

        unit("Inside the Classroom", "Use common school objects and classroom language", [
          ["école", "school"], ["classe", "class / classroom"], ["professeur", "teacher"], ["élève", "student"], ["livre", "book"], ["crayon", "pencil"],
          ["papier", "paper"], ["sac à dos", "backpack"], ["question", "question"], ["réponse", "answer"]
        ], [
          ["A", "J’ai besoin d’un crayon et de papier.", "I need a pencil and paper."], ["B", "Le crayon est dans le sac à dos.", "The pencil is in the backpack."],
          ["A", "J’ai une question.", "I have a question."], ["B", "Le professeur a la réponse.", "The teacher has the answer."]
        ], { tip: "J’ai means “I have.” Use j’ai besoin de for “I need.”" }),

        unit("Food and Drinks", "Ask for food and say what you like", [
          ["eau", "water"], ["pain", "bread"], ["pomme", "apple"], ["lait", "milk"], ["riz", "rice"], ["poulet", "chicken"],
          ["manger", "to eat"], ["boire", "to drink"], ["je voudrais…", "I would like…"], ["j’aime…", "I like…"]
        ], [
          ["A", "Je voudrais de l’eau et une pomme, s’il vous plaît.", "I would like water and an apple, please."], ["B", "Tu aimes le pain ?", "Do you like bread?"],
          ["A", "Oui, j’aime le pain.", "Yes, I like bread."], ["B", "Voilà. Bon appétit !", "Here you are. Enjoy your meal!"]
        ], { tip: "Je voudrais is a polite, useful frame for ordering or requesting." }),

        unit("Around the Home", "Name rooms, furniture, and locations", [
          ["maison", "house / home"], ["chambre", "bedroom"], ["cuisine", "kitchen"], ["salle de bains", "bathroom"], ["table", "table"],
          ["chaise", "chair"], ["porte", "door"], ["fenêtre", "window"], ["ici", "here"], ["là-bas", "over there"]
        ], [
          ["A", "Où est la salle de bains ?", "Where is the bathroom?"], ["B", "Elle est là-bas, à côté de la chambre.", "It is over there, next to the bedroom."],
          ["A", "Et la cuisine ?", "And the kitchen?"], ["B", "La cuisine est ici.", "The kitchen is here."]
        ], { tip: "Où est…? asks where one place or object is." }),

        unit("My Daily Routine", "Describe common activities during the day", [
          ["se réveiller", "to wake up"], ["se lever", "to get up"], ["prendre le petit déjeuner", "to eat breakfast"], ["aller", "to go"], ["étudier", "to study"],
          ["jouer", "to play"], ["dîner", "to eat dinner"], ["dormir", "to sleep"], ["le matin", "in the morning"], ["l’après-midi", "in the afternoon"]
        ], [
          ["A", "Qu’est-ce que tu fais le matin ?", "What do you do in the morning?"], ["B", "Je me lève, je mange et je vais à l’école.", "I get up, eat, and go to school."],
          ["A", "Et l’après-midi ?", "And in the afternoon?"], ["B", "J’étudie et je joue.", "I study and play."]
        ], { tip: "French normally includes a subject word such as je or tu before a verb." }),

        unit("Days and Time", "Talk about days, today, tomorrow, and schedules", [
          ["aujourd’hui", "today"], ["demain", "tomorrow"], ["hier", "yesterday"], ["lundi", "Monday"], ["mardi", "Tuesday"],
          ["mercredi", "Wednesday"], ["jeudi", "Thursday"], ["vendredi", "Friday"], ["quelle heure est-il ?", "what time is it?"], ["à… heures", "at… o’clock"]
        ], [
          ["A", "Quel jour sommes-nous ?", "What day is it?"], ["B", "Nous sommes mardi.", "It is Tuesday."],
          ["A", "À quelle heure est le cours ?", "What time is class?"], ["B", "Le cours est à neuf heures.", "Class is at nine."]
        ], { tip: "French days and months are normally lowercase." }),

        unit("Weather and Clothes", "Describe the weather and choose clothing", [
          ["soleil", "sun"], ["pluie", "rain"], ["il fait chaud", "it is hot"], ["il fait froid", "it is cold"], ["chemise", "shirt"],
          ["pantalon", "pants"], ["chaussures", "shoes"], ["manteau", "coat"], ["porter", "to wear / carry"], ["j’ai besoin de…", "I need…"]
        ], [
          ["A", "Quel temps fait-il ?", "What is the weather like?"], ["B", "Il fait froid et il pleut.", "It is cold and raining."],
          ["A", "J’ai besoin d’un manteau.", "I need a coat."], ["B", "Oui, porte le manteau et les chaussures.", "Yes, wear the coat and shoes."]
        ], { tip: "French uses il fait in common weather descriptions such as il fait chaud." }),

        unit("Hobbies and Sports", "Share interests and favorite activities", [
          ["jouer", "to play"], ["lire", "to read"], ["dessiner", "to draw"], ["chanter", "to sing"], ["danser", "to dance"],
          ["football", "soccer"], ["volley-ball", "volleyball"], ["musique", "music"], ["amusant", "fun"], ["préféré / préférée", "favorite"]
        ], [
          ["A", "Qu’est-ce que tu aimes faire ?", "What do you like to do?"], ["B", "J’aime jouer au volley-ball.", "I like to play volleyball."],
          ["A", "Quel est ton sport préféré ?", "What is your favorite sport?"], ["B", "Le volley-ball. C’est amusant.", "Volleyball. It is fun."]
        ], { tip: "Use jouer à for sports and games, but jouer de for musical instruments." }),

        unit("Directions and Places", "Ask where places are and follow simple directions", [
          ["gauche", "left"], ["droite", "right"], ["tout droit", "straight ahead"], ["près", "near"], ["loin", "far"], ["où est…?", "where is…?"],
          ["rue", "street"], ["bus", "bus"], ["parc", "park"], ["bibliothèque", "library"]
        ], [
          ["A", "Où est la bibliothèque ?", "Where is the library?"], ["B", "Tout droit, puis à droite.", "Straight ahead, then to the right."],
          ["A", "C’est loin ?", "Is it far?"], ["B", "Non, c’est près du parc.", "No, it is near the park."]
        ], { tip: "À gauche and à droite mean “to/on the left” and “to/on the right.”" }),

        unit("Feelings and Help", "Express needs, feelings, and requests for clarification", [
          ["content / contente", "happy"], ["triste", "sad"], ["fatigué / fatiguée", "tired"], ["enthousiaste", "excited"], ["malade", "sick"],
          ["aide", "help"], ["je comprends", "I understand"], ["je ne comprends pas", "I do not understand"], ["plus lentement", "more slowly"], ["pouvez-vous répéter ?", "can you repeat?"]
        ], [
          ["A", "Je ne comprends pas. Pouvez-vous répéter plus lentement ?", "I do not understand. Can you repeat more slowly?"], ["B", "Oui, bien sûr.", "Yes, of course."],
          ["A", "Merci pour votre aide.", "Thank you for your help."], ["B", "De rien. Ça va ?", "You’re welcome. Are you okay?"]
        ], { tip: "Je ne comprends pas and pouvez-vous répéter keep a real conversation moving." })
      ]
    },

    japanese: {
      id: "japanese",
      name: "Japanese",
      nativeName: "日本語",
      sigil: "あ",
      bannerKicker: "ひらがな · カタカナ · 漢字",
      bannerGlyphs: ["あ", "ア", "語", "日", "々", "。"],
      portalGreeting: "こんにちは",
      portalReading: "konnichiwa · hello",
      portalOrbit: "ひらがな · カタカナ · 漢字",
      portalAction: "Hear the portal",
      speechLang: "ja-JP",
      modality: "spoken",
      readingLabel: "Romaji",
      level: "A1-oriented technical preview / Kana-supported",
      accent: "#b6414f",
      gradient: "linear-gradient(135deg, #202b50 0%, #74384e 48%, #d9654c 100%)",
      description: "Build beginner Japanese with audio, kana, optional romaji support, conversation, and typing.",
      units: [
        unit("Greetings at the Castle Gate", "Meet someone and exchange polite greetings", [
          ["こんにちは", "hello", "konnichiwa"], ["おはようございます", "good morning", "ohayō gozaimasu"], ["こんばんは", "good evening", "konbanwa"],
          ["さようなら", "goodbye", "sayōnara"], ["おねがいします", "please", "onegaishimasu"], ["ありがとうございます", "thank you", "arigatō gozaimasu"],
          ["はい", "yes", "hai"], ["いいえ", "no", "iie"], ["おげんきですか", "how are you?", "ogenki desu ka"], ["わたしは…です", "I am…", "watashi wa… desu"]
        ], [
          ["A", "こんにちは。おげんきですか。", "Hello. How are you?", "konnichiwa. ogenki desu ka"], ["B", "はい、げんきです。ありがとうございます。", "Yes, I am well. Thank you.", "hai, genki desu. arigatō gozaimasu"],
          ["A", "わたしはアナです。", "I am Ana.", "watashi wa Ana desu"], ["B", "わたしはレオです。さようなら。", "I am Leo. Goodbye.", "watashi wa Reo desu. sayōnara"]
        ], { tip: "The topic particle は is written ha but pronounced wa in わたしは…です." }),

        unit("Friends and Family", "Identify people and talk about relationships", [
          ["わたし", "I / me", "watashi"], ["ともだち", "friend", "tomodachi"], ["かぞく", "family", "kazoku"], ["おかあさん", "mother", "okāsan"],
          ["おとうさん", "father", "otōsan"], ["おにいさん", "older brother", "onīsan"], ["おねえさん", "older sister", "onēsan"], ["おとうと", "younger brother", "otōto"],
          ["いもうと", "younger sister", "imōto"], ["だれ", "who", "dare"]
        ], [
          ["A", "だれですか。", "Who is it?", "dare desu ka"], ["B", "わたしのおねえさんです。", "She is my older sister.", "watashi no onēsan desu"],
          ["A", "ともだちですか。", "Is she your friend?", "tomodachi desu ka"], ["B", "はい、ともだちです。", "Yes, she is my friend.", "hai, tomodachi desu"]
        ], { tip: "The particle の links nouns and often shows possession: わたしの means “my.”" }),

        unit("Numbers and Colors", "Count small groups and describe basic colors", [
          ["ゼロ", "zero", "zero"], ["いち", "one", "ichi"], ["に", "two", "ni"], ["さん", "three", "san"], ["よん", "four", "yon"], ["ご", "five", "go"],
          ["あか", "red", "aka"], ["あお", "blue", "ao"], ["みどり", "green", "midori"], ["きいろ", "yellow", "kiiro"]
        ], [
          ["A", "ほんはなんさつですか。", "How many books are there?", "hon wa nan-satsu desu ka"], ["B", "さんさつです。", "There are three.", "san-satsu desu"],
          ["A", "なにいろですか。", "What color is it?", "nani-iro desu ka"], ["B", "あおです。", "It is blue.", "ao desu"]
        ], { tip: "Japanese uses counters for different object types. This course introduces them gradually." }),

        unit("Inside the Classroom", "Use common school objects and classroom language", [
          ["がっこう", "school", "gakkō"], ["きょうしつ", "classroom", "kyōshitsu"], ["せんせい", "teacher", "sensei"], ["がくせい", "student", "gakusei"],
          ["ほん", "book", "hon"], ["えんぴつ", "pencil", "enpitsu"], ["かみ", "paper", "kami"], ["かばん", "bag", "kaban"], ["しつもん", "question", "shitsumon"], ["こたえ", "answer", "kotae"]
        ], [
          ["A", "えんぴつはどこですか。", "Where is the pencil?", "enpitsu wa doko desu ka"], ["B", "かばんのなかです。", "It is inside the bag.", "kaban no naka desu"],
          ["A", "しつもんがあります。", "I have a question.", "shitsumon ga arimasu"], ["B", "はい、どうぞ。", "Yes, go ahead.", "hai, dōzo"]
        ], { tip: "どこですか asks “where is it?” and あります is used for nonliving things." }),

        unit("Food and Drinks", "Ask for food and say what you like", [
          ["みず", "water", "mizu"], ["パン", "bread", "pan"], ["りんご", "apple", "ringo"], ["ぎゅうにゅう", "milk", "gyūnyū"], ["ごはん", "rice / meal", "gohan"],
          ["とりにく", "chicken", "toriniku"], ["たべる", "to eat", "taberu"], ["のむ", "to drink", "nomu"], ["ください", "please give me", "kudasai"], ["すきです", "I like it", "suki desu"]
        ], [
          ["A", "みずとりんごをください。", "Water and an apple, please.", "mizu to ringo o kudasai"], ["B", "パンはすきですか。", "Do you like bread?", "pan wa suki desu ka"],
          ["A", "はい、すきです。", "Yes, I like it.", "hai, suki desu"], ["B", "どうぞ。", "Here you are.", "dōzo"]
        ], { tip: "Use noun + をください for a clear, polite beginner request." }),

        unit("Around the Home", "Name rooms, furniture, and locations", [
          ["いえ", "house / home", "ie"], ["へや", "room", "heya"], ["だいどころ", "kitchen", "daidokoro"], ["おふろ", "bath / bathroom", "ofuro"],
          ["つくえ", "desk", "tsukue"], ["いす", "chair", "isu"], ["ドア", "door", "doa"], ["まど", "window", "mado"], ["ここ", "here", "koko"], ["そこ", "there", "soko"]
        ], [
          ["A", "おふろはどこですか。", "Where is the bathroom?", "ofuro wa doko desu ka"], ["B", "そこです。へやのとなりです。", "It is there, next to the room.", "soko desu. heya no tonari desu"],
          ["A", "だいどころは？", "And the kitchen?", "daidokoro wa"], ["B", "ここです。", "It is here.", "koko desu"]
        ], { tip: "ここ means here, そこ means near the listener, and あそこ means over there." }),

        unit("My Daily Routine", "Describe common activities during the day", [
          ["おきる", "to wake up / get up", "okiru"], ["あさごはん", "breakfast", "asagohan"], ["いく", "to go", "iku"], ["べんきょうする", "to study", "benkyō suru"],
          ["あそぶ", "to play", "asobu"], ["ばんごはん", "dinner", "bangohan"], ["ねる", "to sleep", "neru"], ["あさ", "morning", "asa"], ["ひる", "daytime / noon", "hiru"], ["よる", "night", "yoru"]
        ], [
          ["A", "あさ、なにをしますか。", "What do you do in the morning?", "asa, nani o shimasu ka"], ["B", "おきて、あさごはんをたべます。", "I get up and eat breakfast.", "okite, asagohan o tabemasu"],
          ["A", "よるは？", "What about at night?", "yoru wa"], ["B", "べんきょうして、ねます。", "I study and sleep.", "benkyō shite, nemasu"]
        ], { tip: "Polite present-tense verbs often end in ます, such as たべます and ねます." }),

        unit("Days and Time", "Talk about days, today, tomorrow, and schedules", [
          ["きょう", "today", "kyō"], ["あした", "tomorrow", "ashita"], ["きのう", "yesterday", "kinō"], ["げつようび", "Monday", "getsuyōbi"], ["かようび", "Tuesday", "kayōbi"],
          ["すいようび", "Wednesday", "suiyōbi"], ["もくようび", "Thursday", "mokuyōbi"], ["きんようび", "Friday", "kin’yōbi"], ["なんじですか", "what time is it?", "nanji desu ka"], ["…じ", "…o’clock", "…ji"]
        ], [
          ["A", "きょうはなんようびですか。", "What day is today?", "kyō wa nan-yōbi desu ka"], ["B", "かようびです。", "It is Tuesday.", "kayōbi desu"],
          ["A", "じゅぎょうはなんじですか。", "What time is class?", "jugyō wa nanji desu ka"], ["B", "くじです。", "It is at nine.", "kuji desu"]
        ], { tip: "曜日 (yōbi) appears in every weekday name and means “day of the week.”" }),

        unit("Weather and Clothes", "Describe the weather and choose clothing", [
          ["はれ", "sunny / clear", "hare"], ["あめ", "rain", "ame"], ["あつい", "hot", "atsui"], ["さむい", "cold", "samui"], ["シャツ", "shirt", "shatsu"],
          ["ズボン", "pants", "zubon"], ["くつ", "shoes", "kutsu"], ["コート", "coat", "kōto"], ["きる", "to wear", "kiru"], ["ひつようです", "is needed", "hitsuyō desu"]
        ], [
          ["A", "てんきはどうですか。", "How is the weather?", "tenki wa dō desu ka"], ["B", "さむくて、あめです。", "It is cold and rainy.", "samukute, ame desu"],
          ["A", "コートがひつようです。", "A coat is needed.", "kōto ga hitsuyō desu"], ["B", "はい、コートをきます。", "Yes, I will wear a coat.", "hai, kōto o kimasu"]
        ], { tip: "Japanese has different “wear” verbs depending on the item; this unit begins with きる for upper-body clothing." }),

        unit("Hobbies and Sports", "Share interests and favorite activities", [
          ["スポーツ", "sports", "supōtsu"], ["サッカー", "soccer", "sakkā"], ["バレーボール", "volleyball", "barēbōru"], ["どくしょ", "reading", "dokusho"],
          ["えをかく", "to draw a picture", "e o kaku"], ["うたう", "to sing", "utau"], ["おどる", "to dance", "odoru"], ["おんがく", "music", "ongaku"], ["たのしい", "fun", "tanoshii"], ["いちばんすき", "favorite / like best", "ichiban suki"]
        ], [
          ["A", "なにがすきですか。", "What do you like?", "nani ga suki desu ka"], ["B", "バレーボールがすきです。", "I like volleyball.", "barēbōru ga suki desu"],
          ["A", "いちばんすきなスポーツは？", "What is your favorite sport?", "ichiban suki na supōtsu wa"], ["B", "バレーボールです。たのしいです。", "Volleyball. It is fun.", "barēbōru desu. tanoshii desu"]
        ], { tip: "すき is grammatically closer to “liked/pleasing,” so the liked item is commonly marked with が." }),

        unit("Directions and Places", "Ask where places are and follow simple directions", [
          ["ひだり", "left", "hidari"], ["みぎ", "right", "migi"], ["まっすぐ", "straight ahead", "massugu"], ["ちかい", "near", "chikai"], ["とおい", "far", "tōi"],
          ["どこですか", "where is it?", "doko desu ka"], ["みち", "road / way", "michi"], ["バス", "bus", "basu"], ["こうえん", "park", "kōen"], ["としょかん", "library", "toshokan"]
        ], [
          ["A", "としょかんはどこですか。", "Where is the library?", "toshokan wa doko desu ka"], ["B", "まっすぐいって、みぎです。", "Go straight, then it is on the right.", "massugu itte, migi desu"],
          ["A", "とおいですか。", "Is it far?", "tōi desu ka"], ["B", "いいえ、こうえんのちかくです。", "No, it is near the park.", "iie, kōen no chikaku desu"]
        ], { tip: "The て-form, as in いって, connects actions and is useful for directions." }),

        unit("Feelings and Help", "Express needs, feelings, and requests for clarification", [
          ["うれしい", "happy", "ureshii"], ["かなしい", "sad", "kanashii"], ["つかれました", "I am tired", "tsukaremashita"], ["わくわくします", "I am excited", "wakuwaku shimasu"],
          ["びょうき", "sick / illness", "byōki"], ["たすけてください", "please help", "tasukete kudasai"], ["わかります", "I understand", "wakarimasu"], ["わかりません", "I do not understand", "wakarimasen"],
          ["ゆっくり", "slowly", "yukkuri"], ["もういちどおねがいします", "one more time, please", "mō ichido onegaishimasu"]
        ], [
          ["A", "わかりません。ゆっくりおねがいします。", "I do not understand. Slowly, please.", "wakarimasen. yukkuri onegaishimasu"], ["B", "はい、もういちどいいます。", "Yes, I will say it one more time.", "hai, mō ichido iimasu"],
          ["A", "ありがとうございます。", "Thank you.", "arigatō gozaimasu"], ["B", "だいじょうぶですか。", "Are you okay?", "daijōbu desu ka"]
        ], { tip: "わかりません and もういちどおねがいします are essential conversation-repair phrases." })
      ]
    },

    asl: {
      id: "asl",
      name: "ASL",
      nativeName: "American Sign Language",
      sigil: "ASL",
      bannerKicker: "HANDSHAPE · MOVEMENT · SPACE · FACE",
      bannerGlyphs: ["↗", "↺", "↔", "◌", "⌁", "•"],
      portalGreeting: "HELLO",
      portalReading: "A visual greeting",
      portalOrbit: "HANDSHAPE · MOVEMENT · SPACE · FACE",
      portalAction: "Watch the portal",
      speechLang: null,
      modality: "visual",
      level: "Foundations / Video-ready",
      accent: "#168c87",
      gradient: "linear-gradient(135deg, #4a2b78 0%, #247184 50%, #20a982 100%)",
      description: "Build responsible ASL foundations, fingerspelling, visual attention, Deaf culture, and video-ready conversation skills.",
      visualAsset: aslChart,
      visualAssetAlt: "American Sign Language fingerspelling alphabet chart",
      visualCredit: "Public-domain ASL fingerspelling chart via Wikimedia Commons",
      units: [
        unit("ASL Is a Visual Language", "Understand how ASL communicates through the hands, face, body, and space", [
          ["ASL", "American Sign Language"], ["handshape", "the form made by the hand"], ["location", "where a sign is produced"], ["movement", "how a sign travels"],
          ["palm orientation", "the direction the palm faces"], ["non-manual signals", "facial and body grammar"], ["visual attention", "looking toward the signer"], ["signing space", "the space used to organize meaning"]
        ], [
          ["A", "HELLO", "Hello."], ["B", "HELLO. MY NAME [fingerspell]", "Hello. My name is [fingerspelled]."],
          ["A", "YOUR NAME WHAT?", "What is your name?"], ["B", "MEET-YOU NICE", "Nice to meet you."]
        ], { visual: true, videoRequired: true, tip: "Text gloss shows meaning only. Learn complete signs from a qualified native signer on video or in person.", culture: "ASL is a complete natural language and is not English placed on the hands." }),

        unit("Fingerspelling A–M", "Recognize and produce the first half of the manual alphabet", "ABCDEFGHIJKLM".split("").map(letter => [letter, `letter ${letter}`]), [
          ["A", "A-N-A", "A-N-A"], ["B", "M-A-X", "M-A-X"], ["A", "NAME AGAIN PLEASE", "Please spell the name again."]
        ], { visual: true, videoRequired: true, tip: "Keep the hand comfortably still and let each letter become clear before moving on." }),

        unit("Fingerspelling N–Z", "Recognize and produce the second half of the manual alphabet", "NOPQRSTUVWXYZ".split("").map(letter => [letter, `letter ${letter}`]), [
          ["A", "R-O-S-E", "R-O-S-E"], ["B", "T-Y", "T-Y"], ["A", "NAME AGAIN PLEASE", "Please spell the name again."]
        ], { visual: true, videoRequired: true, tip: "J and Z include movement; they cannot be learned accurately from a still handshape alone." }),

        unit("Fingerspelling Names", "Blend letters smoothly and ask for repetition", [
          ["name", "a person’s name"], ["spell", "produce a word with the manual alphabet"], ["again", "repeat"], ["slow", "reduce signing speed"],
          ["double letter", "a repeated letter within a word"], ["clarity", "readable handshape and movement"], ["rhythm", "the flow between letters"], ["fingerspelled loan sign", "a conventionalized form derived from spelling"]
        ], [
          ["A", "YOUR NAME WHAT?", "What is your name?"], ["B", "MY NAME J-A-C-O-B", "My name is J-A-C-O-B."],
          ["A", "AGAIN SLOW PLEASE", "Again slowly, please."], ["B", "J-A-C-O-B", "J-A-C-O-B."]
        ], { visual: true, videoRequired: true, tip: "Read the whole movement pattern rather than trying to freeze every letter." }),

        unit("Numbers 0–20", "Recognize beginner number forms and use them in context", Array.from({ length: 21 }, (_, number) => [String(number), `number ${number}`]), [
          ["A", "AGE YOU WHAT?", "How old are you?"], ["B", "ME 10", "I am ten."], ["A", "CLASS STUDENTS HOW-MANY?", "How many students are in the class?"], ["B", "20", "Twenty."]
        ], { visual: true, videoRequired: true, tip: "Palm orientation changes across number ranges and contexts; learn numbers from moving video, not a single still image." }),

        unit("The Five Parameters", "Analyze how changes in form can change a sign’s meaning", [
          ["handshape", "which hand form is used"], ["location", "where the sign is made"], ["movement", "how the hand moves"], ["palm orientation", "which way the palm faces"],
          ["non-manual marker", "facial or body grammar"], ["dominant hand", "the hand that leads most one-handed signs"], ["two-handed sign", "a sign using both hands"], ["minimal pair", "two signs differing in one important parameter"]
        ], [
          ["A", "SIGN SAME?", "Are the signs the same?"], ["B", "NO. LOCATION DIFFERENT.", "No. The location is different."],
          ["A", "MOVEMENT SAME?", "Is the movement the same?"], ["B", "YES. HANDSHAPE DIFFERENT.", "Yes. The handshape is different."]
        ], { visual: true, videoRequired: true, tip: "Observe all five parameters together before trying to reproduce a sign." }),

        unit("Facial Grammar", "Notice questions, emphasis, and emotion through non-manual signals", [
          ["yes/no question", "question often marked by raised brows and body position"], ["WH-question", "question often marked by furrowed brows"], ["topic marking", "facial and body cues establishing a topic"],
          ["negation", "head and facial cues contributing to “not/no”"], ["intensity", "degree shown through movement and face"], ["eye gaze", "where the signer looks"], ["mouth morpheme", "mouth movement that adds grammatical information"], ["body shift", "using body position for roles or contrast"]
        ], [
          ["A", "YOU READY?", "Are you ready?"], ["B", "YES READY", "Yes, I’m ready."], ["A", "YOU GO WHERE?", "Where are you going?"], ["B", "SCHOOL", "To school."]
        ], { visual: true, videoRequired: true, tip: "A correct hand movement with the wrong facial grammar can produce an incomplete or different message." }),

        unit("Deaf Culture and Community", "Use respectful cultural knowledge and communication practices", [
          ["Deaf", "a cultural and linguistic identity"], ["deaf", "an audiological description in some contexts"], ["Deaf community", "a community connected through language and culture"],
          ["name sign", "a community-given sign used for a person"], ["interpreter", "a professional supporting communication access"], ["captioning", "text access to spoken content"], ["visual alert", "a light or visual notification"], ["language access", "meaningful access in an appropriate language"]
        ], [
          ["A", "YOU ASL LEARN WHY?", "Why are you learning ASL?"], ["B", "COMMUNICATE RESPECT LEARN", "To communicate and learn respectfully."],
          ["A", "NAME-SIGN HAVE?", "Do you have a name sign?"], ["B", "NOT-YET", "Not yet."]
        ], { visual: true, videoRequired: true, tip: "Do not invent your own name sign; name signs are normally given within the Deaf community.", culture: "Capital-D Deaf commonly refers to cultural and linguistic identity, while usage varies by person." }),

        unit("Getting Visual Attention", "Use respectful strategies before beginning a signed interaction", [
          ["eye contact", "shared visual attention"], ["light shoulder tap", "a common respectful attention strategy"], ["wave", "a visible movement within the person’s sightline"],
          ["light signal", "briefly changing room lighting in a group setting"], ["table vibration", "a situational attention signal"], ["sightline", "the area a person can see"], ["turn-taking", "managing who signs next"], ["visual noise", "movement that competes for attention"]
        ], [
          ["A", "[wave in sightline]", "Get the person’s attention within their sightline."], ["B", "[looks toward signer]", "The person establishes visual attention."],
          ["A", "HELLO. QUESTION HAVE.", "Hello. I have a question."], ["B", "YES GO-AHEAD", "Yes, go ahead."]
        ], { visual: true, videoRequired: true, tip: "Get visual attention first; do not begin important signing while the other person is looking away." }),

        unit("Using Signing Space", "Track people, objects, and locations through visual space", [
          ["referent", "a person or thing being discussed"], ["indexing", "pointing to a person, object, or established location"], ["locus", "a location assigned in signing space"],
          ["agreement", "movement connecting grammatical participants"], ["role shift", "body and gaze changes showing another perspective"], ["spatial verb", "a verb whose movement uses location"], ["perspective", "the viewpoint used to organize space"], ["consistency", "maintaining established locations clearly"]
        ], [
          ["A", "GIRL IX-a, BOY IX-b", "The girl is established at location A and the boy at B."], ["B", "IX-a GIVE IX-b BOOK", "The girl gives the boy a book."],
          ["A", "WHO BOOK HAVE NOW?", "Who has the book now?"], ["B", "BOY IX-b", "The boy at location B."]
        ], { visual: true, videoRequired: true, tip: "Once a referent is placed in signing space, keep that location consistent." }),

        unit("Classifier Foundations", "Recognize how handshapes can represent categories, movement, and location", [
          ["classifier", "a meaningful handshape representing a category or entity"], ["entity classifier", "represents an object or person as a whole"], ["handling classifier", "shows how an object is handled"],
          ["descriptive classifier", "shows shape, size, or arrangement"], ["path movement", "shows how an entity moves"], ["location", "shows where entities are placed"], ["orientation", "shows how an entity is positioned"], ["scale", "shows relative size or distance"]
        ], [
          ["A", "CAR CL:3 MOVE-FORWARD", "A vehicle moves forward."], ["B", "CAR CL:3 STOP", "The vehicle stops."],
          ["A", "PERSON CL:1 APPROACH", "A person approaches."], ["B", "PERSON CL:1 STAND-NEXT-TO CAR", "The person stands next to the car."]
        ], { visual: true, videoRequired: true, tip: "Classifier gloss cannot teach the required handshape, movement, or perspective; use native-signer video." }),

        unit("Conversation Readiness", "Combine visual attention, fingerspelling, questions, and clarification", [
          ["HELLO", "greeting gloss"], ["MY NAME", "self-introduction gloss"], ["YOUR NAME WHAT?", "ask someone’s name"], ["NICE MEET-YOU", "express pleasure at meeting"],
          ["AGAIN PLEASE", "ask for repetition"], ["SLOW PLEASE", "ask for slower signing"], ["UNDERSTAND", "show understanding"], ["NOT-UNDERSTAND", "show lack of understanding"], ["THANK-YOU", "express thanks"], ["GOODBYE", "close the interaction"]
        ], [
          ["A", "HELLO. MY NAME J-A-C-O-B. YOUR NAME WHAT?", "Hello. My name is J-A-C-O-B. What is your name?"], ["B", "MY NAME M-A-R-Y.", "My name is M-A-R-Y."],
          ["A", "AGAIN SLOW PLEASE.", "Again slowly, please."], ["B", "M-A-R-Y. NICE MEET-YOU.", "M-A-R-Y. Nice to meet you."], ["A", "NICE MEET-YOU. GOODBYE.", "Nice to meet you. Goodbye."]
        ], { visual: true, videoRequired: true, tip: "This capstone is a script blueprint. Full release requires native-signer demonstrations and receptive-video questions." })
      ]
    }
  };
})();
