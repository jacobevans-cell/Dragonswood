import { eggEnergyCoach } from "./egg-energy.js?v=dragon-path-7";
import { essayMap, opinionEssayStructure } from "./opinion-essay.js?v=dragon-path-7";
import { geometryCoach } from "./geometry-lab.js?v=dragon-path-7";
import { powerChart } from "./powers-lab.js?v=dragon-path-7";
import { energyDiagram, strategyDiagram } from "./diagrams.js?v=dragon-path-7";
import { tenthsDiagram, placeValue } from "./decimal-lab.js?v=dragon-path-7";

const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const picture = (label, body, view = "0 0 440 180") =>
  `<svg class="diagram coach-diagram" role="img" aria-label="${esc(label)}" viewBox="${view}" xmlns="http://www.w3.org/2000/svg"><title>${esc(label)}</title>${body}</svg>`;
const flow = (items) =>
  `<ol class="coach-flow">${items.map(([title, detail]) => `<li><strong>${title}</strong><span>${detail}</span></li>`).join("")}</ol>`;
const table = (heads, rows, caption) =>
  `<div class="coach-table"><table><caption>${caption}</caption><thead><tr>${heads.map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
const stage = (heading, visual, explanation, tryIt) => ({
  heading,
  visual,
  explanation,
  tryIt,
});
const lesson = (title, ...steps) => ({ title, steps });
const chips = (items) =>
  `<div class="coach-chips">${items.map(([word, label]) => `<div><strong>${word}</strong><span>${label}</span></div>`).join("")}</div>`;
function numberLine(low, high, target, label) {
  const x = 40 + ((target - low) / (high - low)) * 360;
  return picture(
    label,
    `<path d="M40 90 H400 M40 78 V102 M220 78 V102 M400 78 V102" stroke="#6b578b" stroke-width="4"/><path d="M${x} 48 V81" stroke="#087f79" stroke-width="4"/><circle cx="${x}" cy="90" r="7" fill="#087f79"/><text x="40" y="130" text-anchor="middle">${low}</text><text x="220" y="130" text-anchor="middle">${(low + high) / 2}</text><text x="400" y="130" text-anchor="middle">${high}</text><text x="${x}" y="36" text-anchor="middle">${target}</text>`,
  );
}
function hundredBars() {
  return picture(
    "Two equal whole bars, each split into ten tenths. Four tenths are colored in the top bar and three in the bottom. Four tenths is forty hundredths.",
    [4, 3]
      .map(
        (n, row) =>
          Array.from(
            { length: 10 },
            (_, i) =>
              `<rect x="${36 + i * 36}" y="${27 + row * 68}" width="34" height="38" fill="${i < n ? (row === 0 ? "#685493" : "#087f79") : "#d7d1c6"}" stroke="#8c817b"/>`,
          ).join("") +
          `<text x="36" y="${86 + row * 68}">${row === 0 ? "0.4 = 0.40" : "0.3 = 0.30"}</text>`,
      )
      .join(""),
  );
}
const evidenceMethod = () =>
  lesson(
    "Connect a detail to an idea",
    stage(
      "A detail needs a reason",
      flow([
        ["What the text says", "“Nia checked the weather before packing.”"],
        ["What that shows", "She uses information to prepare."],
        [
          "Why it supports the idea",
          "Checking first helps her choose useful supplies.",
        ],
      ]),
      "This is a separate mini-example. An action is evidence; the explanation tells why it matters.",
      "Find the action in your supplied text. Which idea does it actually support?",
    ),
    stage(
      "Keep the connection visible",
      flow([
        ["Detail", "Name a specific action or quote."],
        ["Connection", "This suggests… because…"],
        ["Check", "Could someone point to the same detail in the text?"],
      ]),
      "Use the story’s words accurately. An inference goes beyond the words, but must fit what they say.",
      "Explain your connection in your own words. Do not add a fact the text never supplies.",
    ),
  );
const compareMethod = (focus) =>
  lesson(
    focus === "Both"
      ? "Build a supported similarity"
      : focus === "response"
        ? "Build your comparison"
        : `Find a difference: ${focus}`,
    stage(
      "Compare the same feature",
      table(
        ["Nia", "Both", "Tavi"],
        [["Checks a route map", "Prepare for a hike", "Checks the weather"]],
        "Mini-example: two ways to prepare",
      ),
      "Compare approaches with approaches, or goals with goals. The outside columns show differences; the middle names a shared feature.",
      focus === "Both"
        ? "Find a shared feature of Mira and Rowan. Which detail about each child supports it?"
        : focus === "response"
          ? "Use your three organizer columns to find one similarity and one difference."
          : `What does ${focus} do differently from the other character? Find a matching detail.`,
    ),
    stage(
      "Support both sides",
      flow([
        ["Comparison", "Both prepare, but they check different information."],
        ["Evidence", "Nia checks a map. Tavi checks the weather."],
        [
          "Explanation",
          "Their actions share a goal while using different information.",
        ],
      ]),
      "For your answer, return to Two Ways Across. In Grade 5, insert two saved quotations and explain each; in Grade 4, accurate details or quotations work.",
      "Have you explained what the evidence shows, as well as included it?",
    ),
  );
const divisionMethod = (regroup) =>
  lesson(
    regroup ? "Rebuild tenths into wholes" : "Share the units you can see",
    stage(
      "Try a different example: 3.6 ÷ 2",
      tenthsDiagram(36, 2, 2),
      "36 tenths shared into 2 groups gives 18 tenths per group. Every small block is still one tenth.",
      "Rename the amount in your question as tenths. How many equal groups do you need?",
    ),
    stage(
      "18 tenths is 1.8",
      placeValue(1, 8),
      "Ten of the tenths make 1 whole; 8 tenths remain. So 3.6 ÷ 2 = 1.8. Check: 2 × 1.8 = 3.6.",
      "Keep the unit attached to your count. Then put wholes and tenths in the correct columns.",
    ),
  );
const inverseMethod = () =>
  lesson(
    "Build the total back",
    stage(
      "Division and multiplication connect",
      flow([
        ["Total ÷ groups", "1.5 ÷ 3 = 0.5"],
        ["Amount in each group", "0.5 + 0.5 + 0.5"],
        ["Groups × each", "3 × 0.5 = 1.5"],
      ]),
      "A multiplication check rebuilds the original total. This example uses a different amount from your question.",
      "Which number is the original total? Which is the amount in each group?",
    ),
    stage(
      "Match the jobs of the numbers",
      chips([
        ["Quotient", "amount in each group"],
        ["× divisor", "number of groups"],
        ["= dividend", "original total"],
      ]),
      "The two factors may switch order. The product still needs to equal the dividend.",
      "Choose the equation that puts all three numbers in those roles.",
    ),
  );
const energyMethod = () =>
  lesson(
    "Trace the energy",
    stage(
      "Follow the three moments",
      energyDiagram(),
      "Before release, the raised egg and Earth have stored energy because of their positions. During the fall, more of that energy is energy of motion.",
      "Locate the moment named in your question: before release, falling, or landing.",
    ),
    stage(
      "Follow what changes",
      flow([
        ["Height", "Stored energy"],
        ["Motion", "The egg falls"],
        ["Landing", "Bending, squeezing, sound and heating"],
      ]),
      "When the egg stops, energy has not disappeared. It transfers to the device and surroundings.",
      "For an explanation, name the change you expect your chosen strategy to make.",
    ),
  );
const stoppingMethod = () =>
  lesson(
    "See a gentler stop",
    stage(
      "Compare stopping distances",
      picture(
        "Two objects approach a surface at the same speed. A hard stop takes a short distance. A compressing cushion gives a longer stopping distance.",
        `<path d="M35 72 H188 M35 126 H320" stroke="#685493" stroke-width="7"/><path d="M188 50 V95" stroke="#9d4f75" stroke-width="9"/><rect x="285" y="103" width="80" height="46" rx="12" fill="#8bc5b4"/><text x="35" y="40">Same speed before landing</text><text x="230" y="76">short stop</text><text x="35" y="165">longer stop as material compresses</text>`,
      ),
      "For the same incoming speed, increasing stopping time and distance can reduce the average force on the egg. The material must have room to compress.",
      "Look for an explanation of how the stopping process changes.",
    ),
    stage(
      "Watch where the energy goes",
      strategyDiagram("cushion"),
      "A cushion deforms as it stops the egg. Energy transfers into changing shape, sound and heating. A cushion is not a guarantee: it can flatten completely.",
      "Describe a mechanism, not just a material name or a promise that the egg will survive.",
    ),
  );
const caseMethod = (kind) =>
  lesson(
    kind === "notebook"
      ? "Map a record before it disappears"
      : kind === "cc1"
        ? "Find the strongest record"
        : kind === "cc2"
          ? "Test a contradiction"
          : "Separate proof from a guess",
    stage(
      "Practice with a different case",
      table(
        ["Time", "Verified record", "Claim"],
        [
          [
            "9:05",
            "Door camera shows Lee entering the art room.",
            "Lee says, ‘I stayed in the gym all morning.’",
          ],
        ],
        "Different practice case",
      ),
      "A dated camera record can be compared with a statement about the same time. A rumor about someone’s feelings is a different kind of information.",
      kind === "notebook"
        ? "In your notebook, connect each time with its source and the person’s claim."
        : "Compare a claim with a verified record from your current case.",
    ),
    stage(
      "Show the boundary of the evidence",
      flow([
        ["Record", "Lee entered at 9:05."],
        ["Contradiction", "Lee could not also be in the gym all morning."],
        ["Still unknown", "The record does not show why Lee entered."],
      ]),
      "A contradiction concerns facts that cannot both be true. An action does not automatically prove a motive.",
      kind === "conclusion"
        ? "Use two actual records, explain the contradiction, and identify what is still unproved."
        : "Use the actual report and your saved interview notes to choose or explain your answer.",
    ),
  );

function writingMethod(
  path,
  topicPrompt = "Your locked writing question",
  grade = 4,
) {
  const role = path.replace(/[12]$/, "");
  const positions = {
    opinion: [
      "State your position",
      "Our class should label shared supplies.",
      "What do you want the reader to believe about your chosen topic?",
    ],
    audience: [
      "Picture your reader",
      "Classmates who share a supply cupboard",
      "Which readers need your reasons and examples?",
    ],
    reason: [
      "Give a reason",
      "Labels help us find materials quickly.",
      "Explain why your opinion makes sense. Make reason 2 different from reason 1.",
    ],
    example: [
      "Make the reason concrete",
      "Yesterday the label helped us find the tape before our group started.",
      "Use a supplied situation, experience, or clearly labeled imagined example. Connect the detail to your reason.",
    ],
    ending: [
      "Bring your idea together",
      "A few clear labels could give our class more time to create.",
      "Restate your own position with a final thought. Avoid adding a new unsupported reason.",
    ],
    reflection: [
      "Notice what changed",
      "My example now shows a specific moment instead of saying ‘it helps.’",
      "Point to a change in your writing and explain why it helps the reader.",
    ],
  };
  const item = positions[role];
  if (role === "draft") {
    const structure = opinionEssayStructure(grade),
      target = structure.sentenceTarget;
    return lesson(
      "Build a three-paragraph opinion essay",
      stage(
        "Give each paragraph a job",
        essayMap(structure),
        "Keep one central opinion across the introduction, body, and conclusion. Develop both related reasons in the one body paragraph.",
        "Use your saved plan to begin the three paragraphs. Leave a blank line between them.",
      ),
      stage(
        "Turn support into explanation",
        flow([
          ["Reason", "Labels help us find materials quickly."],
          [
            "Imagined example",
            "Imagine your group finding tape at once because the drawer is clearly labeled.",
          ],
          [
            "Explain why it matters",
            "The group can spend more time creating because it spends less time searching.",
          ],
          ["Your locked question", esc(topicPrompt)],
        ]),
        "This example uses a different topic. Each supporting point in your essay needs a specific example and an explanation of how it supports your opinion.",
        "Write " +
          target.min +
          "–" +
          target.max +
          " complete sentences in each paragraph.",
      ),
    );
  }
  if (!item) return null;
  return lesson(
    item[0],
    stage(
      "See each part’s job",
      `<div class="paragraph-map">${[
        ["opinion", "Opinion", "What I believe"],
        ["reason", "Reason 1 + example", "Why, with a specific detail"],
        ["reason", "Reason 2 + example", "A different why, with support"],
        ["ending", "Closing", "Leave the opinion with the reader"],
      ]
        .map(
          ([key, name, job]) =>
            `<div class="${key === role || (role === "example" && key === "reason") || role === "draft" ? "spotlight" : ""}"><strong>${name}</strong><span>${job}</span></div>`,
        )
        .join("")}</div>`,
      role === "audience"
        ? "Your audience shapes which details you explain and the language you choose."
        : "A reason tells why; an example shows how. Keep your parts connected to one opinion.",
      item[2],
    ),
    stage(
      "Learn from a different topic",
      flow([
        [item[0], item[1]],
        ["Topic", "Labeling classroom supplies"],
        ["Your turn", esc(topicPrompt)],
      ]),
      "This example demonstrates the job of this part. Answer your locked writing question with your own position and support.",
      item[2],
    ),
  );
}
function scienceMethod(path) {
  if (path === "explanation") return energyMethod();
  if (path === "strategy")
    return lesson(
      "Match the design to the job",
      stage(
        "When will your design help?",
        flow([
          ["During the fall", "Air resistance can slow motion."],
          ["At landing", "Cushioning or crumpling can extend the stop."],
          [
            "Around the egg",
            "Suspension or a shell can change how force reaches it.",
          ],
        ]),
        "All five supplied strategy cards include a diagram, mechanism and a design question. Start with the change you want to investigate.",
        "Choose a proposed strategy you can explain, then use its diagram to think about the energy.",
      ),
      stage(
        "Inspect the egg’s space",
        strategyDiagram("suspend"),
        "In this suspension example, bands or string hold the egg away from the sides. There must be enough clearance for it to move without hitting the frame.",
        "For your chosen approach, what needs room to move, bend, compress or catch air?",
      ),
    );
  const ideas = {
    team: [
      ["Strategy", "The mechanism we will investigate"],
      ["Team name", "A short name we can recognize"],
      ["Teacher", "Confirms the actual group"],
    ],
    prediction: [
      ["If we…", "Describe a design feature"],
      ["Then…", "Predict a change in the fall or landing"],
      ["Because…", "Explain the science behind your prediction"],
    ],
    design: [
      ["Egg position", "Where it sits and what holds it"],
      ["Moving part", "What bends, stretches, compresses or catches air"],
      ["Clearance", "Space needed for that change"],
    ],
    testLog: [
      ["Before", "Height, design and one change"],
      ["Observe", "What actually happened"],
      ["Learn", "What the evidence suggests changing next"],
    ],
  };
  if (!ideas[path]) return null;
  return lesson(
    {
      team: "Build a clear team label",
      prediction: "Picture a cause and effect",
      design: "Explain your design’s parts",
      testLog: "Turn observations into evidence",
    }[path],
    stage(
      path === "testLog" ? "Keep a fair record" : "Connect the parts",
      flow(ideas[path]),
      path === "testLog"
        ? "Testing happens in later lessons. Record real observations when tests are authorized; do not invent a result today."
        : path === "team"
          ? "The team name is optional. It does not replace your strategy or individual science explanation."
          : "A prediction says what you expect; an observation records what actually happened. Keep these separate.",
      path === "team"
        ? "Choose a name that your group and teacher can identify."
        : "Use the supplied strategy diagram to make your notes specific.",
    ),
    stage(
      "An example mechanism",
      strategyDiagram("crumple"),
      "The folded zone below the egg holder is intended to bend on landing. Whether it bends usefully is something to test, not assume.",
      path === "testLog"
        ? "When testing begins, record whether the zone bent and whether the egg was damaged."
        : path === "team"
          ? "Your name can refer to the mechanism your group studies."
          : "Describe the relevant part of your own proposed design and what you expect it to do.",
    ),
  );
}
function morphologyMethod(grade) {
  return lesson(
    grade === 4 ? "Show flexibility in a scene" : "Build a suspenseful moment",
    stage(
      "Look → imagine → explain",
      `<figure class="coach-scene"><img src="/Dragonswood/learning-portal/public/assets/bridge-choices.png" alt="Two children safely consider a damaged bridge, a route sketch, a spare board and branches in the stream."><figcaption>Use a visible detail: the sketch, spare board, damaged plank or blocked stream.</figcaption></figure>${flow(
        grade === 4
          ? [
              ["Notice", "Something makes the first plan difficult."],
              ["Imagine", "A character considers another approach."],
              ["Explain", "Show how the character adapts."],
            ]
          : [
              ["Notice", "The repair’s outcome is uncertain."],
              ["Imagine", "A safe waiting moment."],
              ["Explain", "Show a small detail that builds uncertainty."],
            ],
      )}`,
      grade === 4
        ? "Flexibility means being able or willing to adjust. Show a change in thinking; do more than add the word to any sentence."
        : "Suspenseful describes a moment that makes us wonder what will happen. Uncertainty can create suspense while the children remain safely on the path.",
      "Choose a visible detail and develop your own moment from it.",
    ),
    stage(
      "Check the word’s shape and job",
      grade === 4
        ? chips([
            ["flexible", "able to adjust"],
            ["+ -ity", "a quality or state"],
            ["flexibility", "-ible becomes -ibility"],
          ])
        : chips([
            ["suspense", "uncertain anticipation"],
            ["+ -ful", "full of / characterized by"],
            ["suspenseful", "keep the e; one l"],
          ]),
      grade === 4
        ? "Different example: “Our team showed flexibility when rain changed our practice plan.” The team adjusts to a change."
        : "Different example: “The final seconds of the tied game were suspenseful.” The outcome is still unknown.",
      "Use today’s word meaningfully in your picture quickwrite. Reread the whole sentence to check that it makes sense.",
    ),
  );
}

/** Explicit response-to-skill routing; no generic fallback can hide a missing coach. */
export function coachFor(assignment, path, grade, topicPrompt) {
  if (![4, 5].includes(grade)) return null;
  const q = path.startsWith("answers.") ? path.slice(8) : null;
  if (assignment === "morning") {
    if (q === "d4") return evidenceMethod();
    if (q === "d1")
      return grade === 4
        ? lesson(
            "Line up and regroup",
            stage(
              "Each column has one unit",
              table(
                ["", "Hundreds", "Tens", "Ones"],
                [
                  ["", "2", "5", "8"],
                  ["+", "1", "6", "7"],
                ],
                "Different example: 258 + 167",
              ),
              "Start at the ones. 8 + 7 = 15 ones. Trade 10 ones for 1 ten; leave 5 ones.",
              "Line up the hundreds, tens and ones in your question.",
            ),
            stage(
              "Carry the value, not just a mark",
              flow([
                ["Ones", "15 ones → 1 ten + 5 ones"],
                ["Tens", "5 + 6 + 1 = 12 tens → 1 hundred + 2 tens"],
                ["Hundreds", "2 + 1 + 1 = 4 hundreds → 425"],
              ]),
              "Every regroup is an equal trade: 10 of a smaller unit makes 1 of the next larger unit.",
              "Check each column of your own sum, including any regrouped unit.",
            ),
          )
        : lesson(
            "Align decimal place values",
            stage(
              "Line up the decimal points",
              table(
                ["", "Ones", ".", "Tenths", "Hundredths"],
                [
                  ["", "2", ".", "4", "0"],
                  ["+", "1", ".", "3", "6"],
                ],
                "Different example: 2.4 + 1.36",
              ),
              "2.4 is also 2.40. A zero in the hundredths place helps you line up equal units.",
              "Write both numbers in your question with their place values aligned.",
            ),
            stage(
              "Add equal units",
              table(
                ["Ones", ".", "Tenths", "Hundredths"],
                [
                  ["2 + 1", ".", "4 + 3", "0 + 6"],
                  ["3", ".", "7", "6"],
                ],
                "2.40 + 1.36 = 3.76",
              ),
              "The decimal point stays between ones and tenths. Add from the smallest place; regroup if a column reaches 10.",
              "Use your own numbers. Does your sum fit a quick estimate?",
            ),
          );
    if (q === "d2")
      return grade === 4
        ? lesson(
            "Find the nearer hundred",
            stage(
              "Locate the halfway point",
              numberLine(
                2300,
                2400,
                2360,
                "2360 lies between 2300 and 2400, beyond the midpoint 2350.",
              ),
              "Different example: 2,360 lies past 2,350, the midpoint between 2,300 and 2,400.",
              "Which two hundreds surround the number in your question?",
            ),
            stage(
              "Compare the distances",
              chips([
                ["60", "from 2,300 to 2,360"],
                ["40", "from 2,360 to 2,400"],
                ["2,400", "the nearer hundred"],
              ]),
              "At the midpoint, round up to the next hundred. Otherwise choose the nearer hundred.",
              "Find your midpoint or use the tens digit to decide which hundred is nearer.",
            ),
          )
        : lesson(
            "Compare equal-size pieces",
            stage(
              "Make the units match",
              hundredBars(),
              "Different example: 0.4 = 0.40. Forty hundredths is greater than thirty hundredths. The wholes in both bars are the same size.",
              "Write the two decimals in your question with the same number of places.",
            ),
            stage(
              "Read from the largest place",
              chips([
                ["Ones", "compare first"],
                ["Tenths", "compare next if ones match"],
                ["Hundredths", "compare if tenths also match"],
              ]),
              "The first place where digits differ decides which number is greater. More written digits does not automatically mean a larger value.",
              "Which is the first place where your two numbers differ?",
            ),
          );
    if (q === "d3")
      return grade === 4
        ? lesson(
            "Check both sentence edges",
            stage(
              "A sentence has a beginning and an ending",
              `<div class="sentence-model"><mark>T</mark>avi opened the gate<mark>.</mark></div>${chips(
                [
                  ["Capital", "starts the sentence"],
                  ["Statement", "tells something"],
                  ["Period", "ends the statement"],
                ],
              )}`,
              "This example begins with a capital letter and finishes with the correct end mark.",
              "Inspect both edges of each answer option.",
            ),
            stage(
              "Keep the middle sensible",
              `<div class="sentence-model"><mark>Tavi</mark> opened the gate.</div>`,
              "A person’s name begins with a capital. Ordinary words in the middle of this sentence do not need extra capitals.",
              "Choose the option with a correct beginning, middle and ending.",
            ),
          )
        : lesson(
            "Make each list item visible",
            stage(
              "Separate the items",
              chips([
                ["pencils,", "item 1"],
                ["erasers,", "item 2"],
                ["and rulers.", "item 3"],
              ]),
              "Different example: We packed pencils, erasers, and rulers. Each comma separates one item from the next.",
              "Identify the three items in your question before choosing punctuation.",
            ),
            stage(
              "Keep the sentence together",
              `<div class="sentence-model">We packed <mark>pencils,</mark> <mark>erasers,</mark> and <mark>rulers.</mark></div>`,
              "Do not split ‘We packed’ with a comma. Keep an end mark after the final item.",
              "Read each option aloud in your head. Can you see exactly where each item ends?",
            ),
          );
  }
  if (assignment === "math") {
    if (grade === 5) {
      if (q === "m1" || q === "m2") {
        const multiply = q === "m1";
        return lesson(
          multiply
            ? "Make each digit worth ten times as much"
            : "Make each digit worth one tenth as much",
          stage(
            "Start with a different example: 1.8",
            powerChart("1.8"),
            "1.8 has 1 one and 8 tenths. The decimal point separates the ones from the tenths.",
            "Name the places of the digits in your own question.",
          ),
          stage(
            multiply ? "1.8 × 10 = 18" : "1.8 ÷ 10 = 0.18",
            powerChart(multiply ? "18" : "0.18", multiply ? 1 : -1),
            multiply
              ? "The 1 one becomes 1 ten, and the 8 tenths become 8 ones. Each digit takes one place to the left in the chart."
              : "The 1 one becomes 1 tenth, and the 8 tenths become 8 hundredths. Each digit takes one place to the right in the chart.",
            "Use the same place-value relationship with your own numbers. Then check whether the number got larger or smaller.",
          ),
        );
      }
      if (q === "m3")
        return lesson(
          "Follow every ×10 jump",
          stage(
            "Different pattern: 1.7 → 17 → 170",
            flow([
              ["Start", "1.7"],
              ["First ×10", "17"],
              ["Second ×10", "170"],
            ]),
            "Every arrow has the same job: multiply by 10. Two jumps multiply by 100 altogether.",
            "Find what one arrow does in your question. Apply that same change again.",
          ),
          stage(
            "A zero holds an empty place",
            powerChart("170", 1),
            "The 1 is in the hundreds place; the 7 is in the tens place. Write a zero in the empty ones place so the number is 170, not 17.",
            "Check the last number in your own pattern. Does it need a zero to hold a place?",
          ),
        );
      if (q === "m4")
        return lesson(
          "Build a power from tens",
          stage(
            "Count factors, not additions",
            chips([
              ["10¹", "one factor of 10"],
              ["10²", "10 × 10"],
              ["10³", "10 × 10 × 10"],
            ]),
            "The exponent is the small raised number. It counts factors of 10, so 10² is 100 and 10³ is 1,000.",
            "Connect the factor 100 in your question with its factors of 10.",
          ),
          stage(
            "See why two jumps work",
            flow([
              ["Different example", "1.6"],
              ["×10", "16"],
              ["×10 again", "160"],
            ]),
            "Multiplying by 10, then by 10 again, is multiplying by 10 × 10. The digits change value each time.",
            "Choose the statement that explains the size of the change.",
          ),
        );
    } else return geometryCoach(q);
  }

  if (assignment === "reading") {
    if (/^evidence\.\d+\.note$/.test(path) || path === "evidence-source")
      return evidenceMethod();
    if (/^evidence\.\d+\.category$/.test(path))
      return lesson(
        "Place the evidence where it belongs",
        stage(
          "Who does this detail describe?",
          chips([
            ["Mira", "a detail about Mira"],
            ["Both", "a detail about both children"],
            ["Rowan", "a detail about Rowan"],
          ]),
          "Reread the saved excerpt. Start with the person or people whose actions it describes.",
          "Choose the category that fits this excerpt, then explain the idea it supports.",
        ),
        stage(
          "Two details can support one similarity",
          flow([
            ["One detail", "An action by Mira"],
            ["Another detail", "An action by Rowan"],
            ["A shared idea", "Explain what those actions have in common"],
          ]),
          "A similarity can be supported by one detail about each child. You do not need every excerpt to name both children.",
          "Use your notes to connect the evidence to your comparison.",
        ),
      );
    if (
      path.startsWith("claims.") &&
      ["Mira", "Both", "Rowan"].includes(path.slice(7))
    )
      return compareMethod(path.slice(7));
    if (path === "response") return compareMethod("response");
  }
  if (assignment === "writing") return writingMethod(path, topicPrompt, grade);
  if (assignment === "science")
    return (
      eggEnergyCoach(path) ||
      (q === "s1"
        ? energyMethod()
        : q === "s2"
          ? stoppingMethod()
          : scienceMethod(path))
    );
  if (assignment === "morphology" && path === "response")
    return morphologyMethod(grade);
  if (
    assignment === "ccf" &&
    ["cc1", "cc2", "cc3", "notebook", "conclusion"].includes(q || path)
  )
    return caseMethod(q || path);
  return null;
}

export function visualCoach(
  assignment,
  path,
  grade,
  responseLabel = path,
  topicPrompt,
) {
  const model = coachFor(assignment, path, grade, topicPrompt);
  if (!model)
    throw new Error(
      `Missing visual coach: grade ${grade}, ${assignment}.${path}`,
    );
  const key = `${assignment}-${path.replaceAll(".", "-")}`;
  return `<details class="visual-coach" data-coach="${key}"><summary aria-label="Visual coach for ${esc(responseLabel)}"><span class="coach-symbol" aria-hidden="true">◈</span> Visual coach <span class="coach-summary-title">· ${esc(model.title)}</span></summary><div class="coach-body"><p class="coach-caption">Use the model, then make your own answer. Opening a coach does not change your work.</p>${model.steps.map((s, i) => `<section class="coach-step" ${i ? "hidden" : ""} data-coach-step="${i}"><h3>${s.heading}</h3>${s.visual}<p>${s.explanation}</p><p class="coach-try"><strong>Try it:</strong> ${s.tryIt}</p></section>`).join("")}<div class="coach-controls"><button type="button" class="btn small" data-coach-back disabled aria-label="Previous coaching step for ${esc(responseLabel)}">← Back</button><span class="coach-count" role="status">Step 1 of ${model.steps.length}</span><button type="button" class="btn small primary" data-coach-next aria-label="Next coaching step for ${esc(responseLabel)}">See an example →</button></div></div></details>`;
}
export function bindVisualCoaches(root) {
  root.querySelectorAll(".visual-coach[data-coach]").forEach((coach) => {
    let step = 0;
    const panels = [...coach.querySelectorAll("[data-coach-step]")];
    const back = coach.querySelector("[data-coach-back]"),
      next = coach.querySelector("[data-coach-next]");
    const show = () => {
      panels.forEach((panel, i) => {
        panel.hidden = i !== step;
      });
      back.disabled = step === 0;
      next.disabled = step === panels.length - 1;
      coach.querySelector(".coach-count").textContent =
        `Step ${step + 1} of ${panels.length}: ${panels[step].querySelector("h3").textContent}`;
    };
    back.addEventListener("click", () => {
      step = Math.max(0, step - 1);
      show();
    });
    next.addEventListener("click", () => {
      step = Math.min(panels.length - 1, step + 1);
      show();
    });
  });
}
