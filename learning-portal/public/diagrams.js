const svg = (label, body, view = "0 0 600 225") =>
  `<svg class="diagram" role="img" aria-label="${label}" viewBox="${view}" xmlns="http://www.w3.org/2000/svg"><title>${label}</title>${body}</svg>`;
const rayMarker = (id) =>
  `<defs><marker id="${id}" viewBox="0 0 4 4" refX="3" refY="2" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L4 2 L0 4 Z" fill="#5a4582"/></marker></defs>`;
export function angles(value = 60) {
  const rad = (value * Math.PI) / 180,
    x = 130 + 105 * Math.cos(rad),
    y = 160 - 105 * Math.sin(rad);
  return svg(
    `An adjustable angle measuring ${value} degrees. The vertex is where the two rays meet.`,
    `${rayMarker("explorer-ray")}<path d="M130 160 H245 M130 160 L${x} ${y}" stroke="#665094" stroke-width="6" fill="none" marker-end="url(#explorer-ray)"/><circle cx="130" cy="160" r="6" fill="#3b294c"/><text x="70" y="204">vertex</text><text x="310" y="85" style="font-size:32px">${value}°</text><text x="310" y="122">${value < 90 ? "Acute · less than 90°" : value === 90 ? "Right · exactly 90°" : "Obtuse · between 90° and 180°"}</text><text x="310" y="166">Moving a ray changes the angle.</text>`,
  );
}
export function angleGallery() {
  return svg(
    "Angle A is 45 degrees, B is 90 degrees, and C is 120 degrees. Below are two parallel horizontal lines.",
    `${rayMarker("gallery-ray")}<g fill="none" stroke="#5a4582" stroke-width="5"><path d="M45 100 H155 M45 100 L115 30" marker-end="url(#gallery-ray)"/><path d="M240 100 H340 M240 100 V25" marker-end="url(#gallery-ray)"/><path d="M240 80 H260 V100" stroke-width="2"/><path d="M440 100 H550 M440 100 L400 30" marker-end="url(#gallery-ray)"/><path d="M70 166 H220 M70 193 H220" marker-start="url(#gallery-ray)" marker-end="url(#gallery-ray)"/></g><text x="40" y="135">A · 45°</text><text x="237" y="135">B · 90°</text><text x="440" y="135">C · 120°</text><text x="265" y="185">Line gallery: parallel lines</text>`,
  );
}
export function energyDiagram() {
  return svg(
    "Before: stored energy because of height. During: energy of motion as gravity pulls down. Landing: energy transfers to bending, compression, sound, and heating.",
    `<g fill="#f5d095" stroke="#8f673d" stroke-width="2"><ellipse cx="90" cy="70" rx="18" ry="24"/><ellipse cx="295" cy="95" rx="18" ry="24"/><ellipse cx="500" cy="125" rx="18" ry="24"/></g><g stroke="#36736e" stroke-width="4" fill="none"><path d="M145 80 H230 l-12 -8 m12 8 l-12 8"/><path d="M350 105 H435 l-12 -8 m12 8 l-12 8"/><path d="M295 20 V55 l-8 -10 m8 10 l8 -10"/><path d="M453 150 L465 140 L477 150 L489 140 L501 150 L513 140 L525 150 L537 140 L549 150"/></g><path d="M40 151 H145 M245 151 H345" stroke="#6d6666" stroke-width="3"/><text x="45" y="190">1. Before</text><text x="247" y="190">2. Falling</text><text x="453" y="190">3. Landing</text><text x="30" y="215">Stored energy</text><text x="226" y="215">Energy of motion</text><text x="421" y="215">Energy transfers</text><text x="320" y="40">gravity</text>`,
    "0 0 610 240",
  );
}
export function strategyDiagram(id) {
  const egg =
    '<ellipse cx="100" cy="100" rx="11" ry="15" fill="#e8ba74" stroke="#745233" stroke-width="2"/>';
  const drawings = {
    air: '<path d="M40 40 Q100 -12 160 40 Z" fill="#a79ace" stroke="#67537e" stroke-width="3"/><path d="M40 40 L100 92 L160 40 M100 16 V92" stroke="#67537e" fill="none" stroke-width="2"/><path d="M25 80 V50 m-6 8 l6 -8 l6 8 M175 80 V50 m-6 8 l6 -8 l6 8" stroke="#287a76" fill="none" stroke-width="3"/>',
    cushion:
      '<rect x="45" y="60" width="110" height="70" fill="#a8d7c2" stroke="#417e69" stroke-width="3" rx="15"/><ellipse cx="100" cy="96" rx="30" ry="25" fill="#eff0df"/><path d="M60 119 Q100 107 140 119" stroke="#417e69" fill="none" stroke-width="3"/>',
    crumple:
      '<path d="M50 128 L65 113 L80 128 L95 113 L110 128 L125 113 L140 128 L150 113 M55 80 H145 V112 H55 Z" fill="none" stroke="#a3784b" stroke-width="5"/>',
    suspend:
      '<rect x="30" y="20" width="140" height="112" rx="5" fill="none" stroke="#5a4b76" stroke-width="5"/><path d="M30 25 L100 100 L170 25 M30 127 L100 100 L170 127" stroke="#3b908b" stroke-width="2"/>',
    shell:
      '<path d="M50 127 L30 74 L60 25 H140 L170 74 L150 127 Z M30 74 H170 M60 25 L100 74 L140 25 M50 127 L100 74 L150 127" fill="none" stroke="#625485" stroke-width="4"/>',
  };
  return svg(
    `Example ${id === "air" ? "parachute slowing a fall" : id === "cushion" ? "egg surrounded by a compressing cushion" : id === "crumple" ? "folded crumple zone below an egg holder" : id === "suspend" ? "egg suspended with room inside a frame" : "outer cage around an egg"}. Illustration only, not a guaranteed solution.`,
    drawings[id] + egg,
    "0 0 200 145",
  );
}
