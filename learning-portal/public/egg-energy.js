const egg = (y) =>
  `<ellipse class="energy-egg" cx="160" cy="${y}" rx="19" ry="27" fill="#fff7df" stroke="#80613e" stroke-width="3"/>`;
export const ENERGY_STAGES = [
  {
    id: "held",
    label: "Held up",
    letter: "B",
    term: "Stored energy from height",
    text: "An adult holds the egg above the landing surface. The egg is still, but the egg and Earth have stored energy because of their positions. Gravity pulls toward Earth even before release.",
  },
  {
    id: "falling",
    label: "Falling",
    letter: "C",
    term: "Energy of motion",
    text: "After release, gravity pulls the egg downward. As the egg loses height, stored energy changes into energy of motion, called kinetic energy.",
  },
  {
    id: "landing",
    label: "Landing",
    letter: "A",
    term: "Energy transfers",
    text: "When the egg meets the surface, energy of motion transfers to the egg, the surface and the surroundings. Materials can change shape; there can be sound and a little heating. Energy does not disappear. A sudden stop can crack the egg.",
  },
];
export const VIDEO_ENERGY_EXAMPLES = [
  {
    id: "book",
    title: "The raised book",
    idea: "In the video, a book held above the floor has stored energy because of its height. When released, it falls and gains energy of motion.",
    connection:
      "Our raised egg follows the same pattern: stored energy from height changes into kinetic energy during the fall.",
  },
  {
    id: "friction",
    title: "The box and friction",
    idea: "In the video, friction between a moving box and the floor changes some energy of motion into thermal energy (warming). Energy has not disappeared.",
    connection:
      "When our egg lands, energy can transfer to the egg, the surface and the surroundings. It can change materials' shape, produce sound and cause a little warming.",
  },
  {
    id: "pendulum",
    title: "The swinging pendulum",
    idea: "The video's simple pendulum model is briefly still at a high point and moves fastest at the bottom. Stored energy changes into motion on the way down; motion changes back into stored energy on the way up. The model sets aside friction and air resistance.",
    connection:
      "Like the downward swing, our falling egg loses height and gains energy of motion. A real egg's landing also transfers energy to its surroundings.",
  },
];
export function videoEnergyPicture(id) {
  const e = VIDEO_ENERGY_EXAMPLES.find((e) => e.id === id);
  if (!e) throw Error("Unknown video energy example");
  const body =
    id === "book"
      ? `<rect x="65" y="31" width="64" height="22" rx="3" fill="#6e598e"/><path d="M105 64 V104 l-8 -10 m8 10 l8 -10" stroke="#287e72" stroke-width="4" fill="none"/><rect x="68" y="128" width="64" height="22" rx="3" fill="#6e598e"/><path d="M30 168 H318" stroke="#80613e" stroke-width="4"/><text x="157" y="47">Held up: stored energy</text><text x="157" y="144">Falling: motion energy</text>`
      : id === "friction"
        ? `<rect x="28" y="53" width="72" height="57" fill="#ba8654"/><path d="M118 80 H178 l-11 -8 m11 8 l-11 8" stroke="#287e72" stroke-width="4" fill="none"/><path d="M20 114 H325" stroke="#80613e" stroke-width="4"/><path d="M228 104 Q212 86 228 66 T228 31 M257 104 Q241 86 257 66 T257 31 M286 104 Q270 86 286 66 T286 31" stroke="#b87543" stroke-width="3" fill="none"/><text x="20" y="144">Moving box</text><text x="213" y="144">Warming</text><text x="20" y="182">Friction changes energy's form.</text>`
        : `<circle cx="175" cy="22" r="5" fill="#332b43"/><path d="M175 22 L58 83 M175 22 V157 M175 22 L292 83" stroke="#6e598e" stroke-width="3"/><path d="M59 100 Q175 227 291 100" stroke="#287e72" stroke-width="3" stroke-dasharray="5 5" fill="none"/><circle cx="58" cy="83" r="15" fill="#80629e"/><circle cx="175" cy="157" r="15" fill="#287e72"/><circle cx="292" cy="83" r="15" fill="#80629e"/><text x="23" y="53">High</text><text x="281" y="53">High</text><text x="112" y="200">Low: fastest motion</text>`;
  return `<svg class="diagram" role="img" aria-label="${e.title}: ${e.idea}" viewBox="0 0 360 220" xmlns="http://www.w3.org/2000/svg"><title>${e.title}: ${e.idea}</title><rect width="360" height="220" rx="14" fill="#f3eddf"/>${body}</svg>`;
}
export function videoEnergyConnections() {
  return `<div class="notice"><strong>Energy cannot be created or destroyed.</strong> It can change form or transfer between objects and their surroundings. When an object stops moving, ask where its energy went.</div><div class="video-energy-examples">${VIDEO_ENERGY_EXAMPLES.map((e) => `<article><h3>${e.title}</h3>${videoEnergyPicture(e.id)}<p>${e.idea}</p><p><strong>Connect it to the egg:</strong> ${e.connection}</p></article>`).join("")}</div><p class="small muted">These are our diagrams of examples from the video. They show ideas, not measured energy amounts.</p>`;
}
export function eggStagePicture(id) {
  const s = ENERGY_STAGES.find((s) => s.id === id);
  if (!s) throw new Error("Unknown egg stage.");
  const body =
    id === "held"
      ? `${egg(66)}<path d="M72 62 H125 Q132 62 132 72 V87 Q153 104 177 88" fill="none" stroke="#a97653" stroke-width="13" stroke-linecap="round"/><path d="M224 63 V164 M217 63 H231 M217 164 H231" stroke="#5b4a80" stroke-width="3"/><text x="236" y="122">height</text>`
      : id === "falling"
        ? `<path d="M150 27 V52 M171 35 V60" stroke="#b097cb" stroke-width="4"/>${egg(109)}<path d="M225 65 V127 l-10 -14 m10 14 l10 -14" fill="none" stroke="#287e72" stroke-width="5"/><text x="237" y="101">gravity</text>`
        : `${egg(156)}<path d="M107 166 L91 153 M213 166 L230 151 M110 189 L94 201 M211 189 L229 201" stroke="#aa7140" stroke-width="4"/><path d="M125 181 Q145 194 160 185 Q178 195 197 181" fill="none" stroke="#6e598e" stroke-width="4"/><text x="21" y="140">contact</text><path d="M67 147 L131 178" stroke="#6e598e" stroke-width="2"/>`;
  return `<svg class="diagram egg-stage egg-stage-${id}" role="img" aria-label="${s.label}: ${s.text}" viewBox="0 0 340 240" xmlns="http://www.w3.org/2000/svg"><title>${s.label}: ${s.text}</title><rect width="340" height="240" rx="14" fill="#f3eddf"/><path d="M30 187 H310" stroke="#6e598e" stroke-width="5"/>${body}<text x="170" y="226" text-anchor="middle" fill="#332b43" font-size="18">${s.label}</text></svg>`;
}
export function eggStageGallery(order = ["landing", "held", "falling"]) {
  return `<div class="egg-stages">${order
    .map((id) => {
      const s = ENERGY_STAGES.find((s) => s.id === id);
      return `<figure><figcaption><strong>Picture ${s.letter} · ${s.label}</strong></figcaption>${eggStagePicture(id)}</figure>`;
    })
    .join("")}</div>`;
}
export function bindEggEnergy(root) {
  const output = root.querySelector("#egg-energy-model");
  if (!output) return;
  root.querySelectorAll("[data-egg-stage]").forEach((button) =>
    button.addEventListener("click", () => {
      const stage = ENERGY_STAGES.find((s) => s.id === button.dataset.eggStage);
      if (!stage) return;
      root
        .querySelectorAll("[data-egg-stage]")
        .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      output.innerHTML = eggStagePicture(stage.id);
      root.querySelector("#egg-energy-caption").textContent =
        stage.term + ": " + stage.text;
    }),
  );
}
export function eggEnergyCoach(path) {
  const videoExample = {
    "answers.s-energy-motion": "friction",
    "answers.s-energy-height": "book",
    "answers.s-video-conservation": "friction",
    "answers.s-video-pendulum": "pendulum",
  }[path];
  if (videoExample) {
    const e = VIDEO_ENERGY_EXAMPLES.find((e) => e.id === videoExample);
    return {
      title: "Connect the video to the egg",
      steps: [
        {
          title: e.title,
          visual: videoEnergyPicture(e.id),
          explanation: e.idea,
          tryIt:
            "Name the starting energy form. Then ask what changed or where energy transferred.",
        },
        {
          title: "Follow the energy into our egg model",
          visual: eggStagePicture(
            videoExample === "friction" ? "landing" : "falling",
          ),
          explanation: e.connection + " Energy cannot be created or destroyed.",
          tryIt:
            "Compare the examples. A change in motion does not mean energy appeared from nowhere or vanished.",
        },
      ],
    };
  }
  const sequence = path.startsWith("answers.s-sequence-");
  if (
    ![
      "answers.s-energy-motion",
      "answers.s-energy-height",
      "prediction",
      "explanation",
    ].includes(path) &&
    !sequence
  )
    return null;
  return {
    title: sequence
      ? "Put the moments in order"
      : path === "prediction"
        ? "Predict with the energy story"
        : "See the energy change",
    steps: [
      {
        title: "Look at what the egg is doing",
        visual: eggStageGallery(),
        explanation:
          "Picture B shows the egg held above the surface. Picture C shows motion after release. Picture A shows contact during landing.",
        tryIt: sequence
          ? "Find the starting moment, then what happens next, then the landing. Choose a picture for each position."
          : "Find the picture that matches the moment in your question. A still egg can have stored energy from height.",
      },
      {
        title: "Connect height, motion and landing",
        visual: `<ol class="coach-flow"><li><strong>Held up</strong> · Stored energy from height.</li><li><strong>Falling</strong> · Gravity pulls downward; energy of motion increases.</li><li><strong>Landing</strong> · Energy transfers to the egg, surface and surroundings.</li></ol>`,
        explanation:
          "Gravity is a pull; energy is not a force. Energy cannot be created or destroyed. It can transfer or change form. The video's raised book, box with friction and pendulum help us explain these changes.",
        tryIt:
          path === "prediction"
            ? "Use 'I predict… because…'. Connect one video example to the fall or landing. Explain where energy goes when motion stops. A prediction does not claim a test already happened."
            : "Use the picture and its science meaning together. No formula or physical test is needed.",
      },
    ],
  };
}
