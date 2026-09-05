const chapterRows = [
  [1, "I Battle the Cheerleading Squad", 6],
  [2, "The Underworld Sends Me a Prank Call", 16],
  [3, "We Play Tag with Scorpions", 31],
  [4, "Annabeth Breaks the Rules", 43],
  [5, "Nico Buys Happy Meals for the Dead", 55],
  [6, "We Meet the God with Two Faces", 63],
  [7, "Tyson Leads a Jailbreak", 71],
  [8, "We Visit the Demon Dude Ranch", 80],
  [9, "I Scoop Poop", 96],
  [10, "We Play the Game Show of Death", 104],
  [11, "I Set Myself on Fire", 118],
  [12, "I Take a Permanent Vacation", 130],
  [13, "We Hire a New Guide", 142],
  [14, "My Brother Duels Me to the Death", 156],
  [15, "We Steal Some Slightly Used Wings", 167],
  [16, "I Open a Coffin", 179],
  [17, "The Lost God Speaks", 189],
  [18, "Grover Causes a Stampede", 196],
  [19, "The Council Gets Cloven", 207],
  [20, "My Birthday Party Takes a Dark Turn", 214]
];

export const PERCY4_META = {
  schemaVersion: 1,
  pages: 222,
  chapters: chapterRows.map((chapter, index, rows) => ({
    id: `percy-jackson-4-chapter-${chapter[0]}`,
    number: chapter[0],
    title: chapter[1],
    startPage: chapter[2],
    endPage: (rows[index + 1]?.[2] || 223) - 1,
    testId: `percy-jackson-4-chapter-${chapter[0]}`
  }))
};
