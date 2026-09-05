const CONTENT_END_PAGE = 365;

const chapterRows = [
  [1, "The Boy Who Lived", 10],
  [2, "The Vanishing Glass", 30],
  [3, "The Letters from No One", 46],
  [4, "The Keeper of the Keys", 66],
  [5, "Diagon Alley", 84],
  [6, "The Journey from Platform Nine and Three-Quarters", 114],
  [7, "The Sorting Hat", 144],
  [8, "The Potions Master", 164],
  [9, "The Midnight Duel", 180],
  [10, "Hallowe'en", 202],
  [11, "Quidditch", 220],
  [12, "The Mirror of Erised", 236],
  [13, "Nicolas Flamel", 260],
  [14, "Norbert the Norwegian Ridgeback", 276],
  [15, "The Forbidden Forest", 292],
  [16, "Through the Trapdoor", 314],
  [17, "The Man with Two Faces", 344]
];

export const HARRY_POTTER_META = {
  schemaVersion: 1,
  pages: 370,
  chapters: chapterRows.map((chapter, index, rows) => ({
    id: `harry-potter-1-chapter-${chapter[0]}`,
    number: chapter[0],
    title: chapter[1],
    startPage: chapter[2],
    endPage: rows[index + 1]?.[2] ? rows[index + 1][2] - 1 : CONTENT_END_PAGE,
    testId: `harry-potter-1-chapter-${chapter[0]}`
  }))
};
