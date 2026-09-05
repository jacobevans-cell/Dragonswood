const CONTENT_END_PAGE = 236;

const chapterRows = [
  [1, "Go Cruising With Explosives", 6],
  [2, "I Meet Some Fishy Relatives", 20],
  [3, "I Get a Sneak Peek At My Death", 30],
  [4, "We Burn a Metal Shroud", 42],
  [5, "I Drive My Dog Into a Tree", 52],
  [6, "My Cookies Get Scorched", 59],
  [7, "My Maths Teacher Gives Me a Lift", 71],
  [8, "I Take The Worst Bath Ever", 82],
  [9, "Two Snakes Save My Life", 90],
  [10, "I Buy Some New Friends", 104],
  [11, "We Break a Bridge", 114],
  [12, "Rachel Makes a Bad Deal", 122],
  [13, "A Titan Brings Me a Present", 135],
  [14, "Pigs Fly", 144],
  [15, "Chiron Throws a Party", 159],
  [16, "We Get Help From a Thief", 171],
  [17, "I Sit On The Hot Seat", 184],
  [18, "My Parents Go Commando", 194],
  [19, "We Trash The Eternal City", 199],
  [20, "We Win Fabulous Prizes", 210],
  [21, "Blackjack Gets Jacked", 220],
  [22, "I Am Dumped", 224],
  [23, "We Say Goodbye, Sort of", 232]
];

export const PERCY5_META = {
  schemaVersion: 1,
  pages: 244,
  chapters: chapterRows.map((chapter, index, rows) => ({
    id: `percy-jackson-5-chapter-${chapter[0]}`,
    number: chapter[0],
    title: chapter[1],
    startPage: chapter[2],
    endPage: rows[index + 1]?.[2] ? rows[index + 1][2] - 1 : CONTENT_END_PAGE,
    testId: `percy-jackson-5-chapter-${chapter[0]}`
  }))
};
