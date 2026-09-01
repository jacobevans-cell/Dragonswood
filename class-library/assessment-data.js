import { WITCHES_META } from "./books/witches/meta.js?v=5";
import { BRIDGE_META } from "./books/bridge-to-terabithia/meta.js?v=1";
import { HOLES_META } from "./books/holes/meta.js?v=1";
import { PERCY1_META } from "./books/percy-jackson-1/meta.js?v=1";
import { PERCY2_META } from "./books/percy-jackson-2/meta.js?v=1";
import { PERCY3_META } from "./books/percy-jackson-3/meta.js?v=1";
import { KEEPER1_META } from "./books/keeper-1/meta.js?v=1";
import { KEEPER2_META } from "./books/keeper-2/meta.js?v=1";
import { KEEPER3_META } from "./books/keeper-3/meta.js?v=1";
import { KEEPER4_META } from "./books/keeper-4/meta.js?v=1";
import { GENERATED_TESTS } from "./assessment-tests.generated.js?v=20260901-1";

export const CHAPTER_MAPS = {
  "witches": {
    editionPages: WITCHES_META.pages,
    verified: true,
    chapters: WITCHES_META.chapters
  },
  "bridge-to-terabithia": {
    editionPages: BRIDGE_META.pages,
    verified: true,
    chapters: BRIDGE_META.chapters
  },
  "holes": {
    editionPages: HOLES_META.pages,
    verified: true,
    chapters: HOLES_META.chapters
  },
  "percy-jackson-1": {
    editionPages: PERCY1_META.pages,
    verified: true,
    chapters: PERCY1_META.chapters
  },
  "percy-jackson-2": {
    editionPages: PERCY2_META.pages,
    verified: true,
    chapters: PERCY2_META.chapters
  },
  "percy-jackson-3": {
    editionPages: PERCY3_META.pages,
    verified: true,
    chapters: PERCY3_META.chapters
  },
  "keeper-1": {
    editionPages: KEEPER1_META.pages,
    verified: true,
    chapters: KEEPER1_META.chapters
  },
  "keeper-2": {
    editionPages: KEEPER2_META.pages,
    verified: true,
    chapters: KEEPER2_META.chapters
  },
  "keeper-3": {
    editionPages: KEEPER3_META.pages,
    verified: true,
    chapters: KEEPER3_META.chapters
  },
  "keeper-4": {
    editionPages: KEEPER4_META.pages,
    verified: true,
    chapters: KEEPER4_META.chapters
  },
  "charlie": {
    editionPages: 89,
    verified: true,
    chapters: [
      [1, "Here Comes Charlie", 4],
      [2, "Mr Willy Wonka's Factory", 7],
      [3, "Mr Wonka and the Indian Prince", 10],
      [4, "The Secret Workers", 12],
      [5, "The Golden Tickets", 14],
      [6, "The First Two Finders", 16],
      [7, "Charlie's Birthday", 19],
      [8, "Two More Golden Tickets Found", 21],
      [9, "Grandpa Joe Takes a Gamble", 23],
      [10, "The Family Begins to Starve", 25],
      [11, "The Miracle", 28],
      [12, "What It Said on the Golden Ticket", 30],
      [13, "The Big Day Arrives", 33],
      [14, "Mr Willy Wonka", 35],
      [15, "The Chocolate Room", 38],
      [16, "The Oompa-Loompas", 41],
      [17, "Augustus Gloop Goes up the Pipe", 43],
      [18, "Down the Chocolate River", 48],
      [19, "The Inventing Room", 52],
      [20, "The Great Gum Machine", 54],
      [21, "Good-bye Violet", 56],
      [22, "Along the Corridor", 61],
      [23, "Square Sweets That Look Round", 64],
      [24, "Veruca in the Nut Room", 66],
      [25, "The Great Glass Lift", 71],
      [26, "The Television-Chocolate Room", 74],
      [27, "Mike Teavee Is Sent by Television", 77],
      [28, "Only Charlie Left", 83],
      [29, "The Other Children Go Home", 85],
      [30, "Charlie's Chocolate Factory", 87]
    ].map((chapter, index, rows) => ({
      id: `charlie-chapter-${chapter[0]}`,
      number: chapter[0], title: chapter[1], startPage: chapter[2],
      endPage: (rows[index + 1]?.[2] || 90) - 1,
      testId: `charlie-chapter-${chapter[0]}`
    }))
  },
  "matilda": {
    editionPages: 233,
    verified: true,
    chapters: [
      [1, "The Reader of Books", 1],
      [2, "Mr Wormwood, the Great Car Dealer", 18],
      [3, "The Hat and the Superglue", 26],
      [4, "The Ghost", 34],
      [5, "Arithmetic", 45],
      [6, "The Platinum-Blond Man", 52],
      [7, "Miss Honey", 62],
      [8, "The Trunchbull", 78],
      [9, "The Parents", 86],
      [10, "Throwing the Hammer", 97],
      [11, "Bruce Bogtrotter and the Cake", 112],
      [12, "Lavender", 129],
      [13, "The Weekly Test", 136],
      [14, "The First Miracle", 153],
      [15, "The Second Miracle", 165],
      [16, "Miss Honey's Cottage", 172],
      [17, "Miss Honey's Story", 188],
      [18, "The Names", 201],
      [19, "The Practice", 205],
      [20, "The Third Miracle", 210],
      [21, "A New Home", 221]
    ].map((chapter, index, rows) => ({
      id: `matilda-chapter-${chapter[0]}`,
      number: chapter[0],
      title: chapter[1],
      startPage: chapter[2],
      endPage: (rows[index + 1]?.[2] || 234) - 1,
      testId: `matilda-chapter-${chapter[0]}`
    }))
  },
  "percy-jackson-1": {
    editionPages: PERCY1_META.pages,
    verified: true,
    chapters: PERCY1_META.chapters
  }
};

const LEGACY_STARTER_TESTS = {
  "matilda-chapter-1": {
    id: "matilda-chapter-1",
    bookId: "matilda",
    chapterNumber: 1,
    chapterTitle: "The Reader of Books",
    title: "Chapter 1 Check",
    status: "published",
    passingPercent: 80,
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        prompt: "How do Matilda's parents respond to her unusual intelligence?",
        choices: [
          "They mostly ignore or criticize it",
          "They hire a private teacher immediately",
          "They ask her to teach her brother",
          "They tell the whole neighborhood proudly"
        ],
        correctIndex: 0,
        explanation: "Mr and Mrs Wormwood do not value Matilda's gifts and often treat her unfairly."
      },
      {
        id: "q2",
        type: "multiple-choice",
        prompt: "Where does Matilda go by herself while her mother is away playing bingo?",
        choices: ["The village library", "Her father's garage", "The school playground", "A neighbor's house"],
        correctIndex: 0,
        explanation: "Matilda walks to the village library and spends the afternoons reading there."
      },
      {
        id: "q3",
        type: "multiple-choice",
        prompt: "Who helps Matilda choose books at the library?",
        choices: ["Miss Honey", "Mrs Phelps", "Mrs Wormwood", "Lavender"],
        correctIndex: 1,
        explanation: "Mrs Phelps is the librarian who welcomes Matilda and helps her find books."
      },
      {
        id: "q4",
        type: "multiple-choice",
        prompt: "Which adult novel does Mrs Phelps first give Matilda to try?",
        choices: ["Great Expectations", "The Secret Garden", "Treasure Island", "Jane Eyre"],
        correctIndex: 0,
        explanation: "After Matilda finishes the children's books, Mrs Phelps suggests Great Expectations by Charles Dickens."
      },
      {
        id: "q5",
        type: "multiple-choice",
        prompt: "What new option does Mrs Phelps explain to Matilda?",
        choices: [
          "She can borrow books and read them at home",
          "She can work at the library on Saturdays",
          "She can keep every book she finishes",
          "She can skip school to visit the library"
        ],
        correctIndex: 0,
        explanation: "Mrs Phelps explains that Matilda may borrow books with a library card and take them home."
      }
    ]
  },
  "percy-jackson-1-chapter-1": {
    id: "percy-jackson-1-chapter-1",
    bookId: "percy-jackson-1",
    chapterNumber: 1,
    chapterTitle: "I Accidentally Vaporize My Maths Teacher",
    title: "Chapter 1 Check",
    status: "published",
    passingPercent: 80,
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        prompt: "Where is Percy when the chapter's main strange event begins?",
        choices: [
          "On a school field trip at the Metropolitan Museum of Art",
          "At home during a thunderstorm",
          "At a summer camp by the ocean",
          "On a bus traveling to school"
        ],
        correctIndex: 0,
        explanation: "Percy is visiting the Metropolitan Museum of Art with his class from Yancy Academy."
      },
      {
        id: "q2",
        type: "multiple-choice",
        prompt: "What ordinary classroom object becomes Percy's weapon?",
        choices: ["A ruler", "A pen", "A notebook", "A pair of scissors"],
        correctIndex: 1,
        explanation: "The pen Mr. Brunner gives Percy changes into a sword."
      },
      {
        id: "q3",
        type: "multiple-choice",
        prompt: "Why does Percy become angry with Nancy Bobofit?",
        choices: [
          "She damages a museum display",
          "She lies to a teacher about him",
          "She picks on Grover",
          "She takes Percy's lunch"
        ],
        correctIndex: 2,
        explanation: "Percy reacts when Nancy is bullying and teasing Grover."
      },
      {
        id: "q4",
        type: "multiple-choice",
        prompt: "What is Mrs. Dodds revealed to be?",
        choices: ["A Fury", "A centaur", "A sea nymph", "An oracle"],
        correctIndex: 0,
        explanation: "Mrs. Dodds transforms into a winged monster called a Fury."
      },
      {
        id: "q5",
        type: "multiple-choice",
        prompt: "What makes Percy doubt his memory after the encounter?",
        choices: [
          "The museum suddenly closes",
          "His classmates say the field trip happened last year",
          "Everyone acts as if Mrs. Dodds never existed",
          "Mr. Brunner takes away the sword"
        ],
        correctIndex: 2,
        explanation: "The adults and students behave as though Mrs. Dodds was never their teacher."
      }
    ]
  }
};

export const STARTER_TESTS = {
  ...LEGACY_STARTER_TESTS,
  ...GENERATED_TESTS
};
