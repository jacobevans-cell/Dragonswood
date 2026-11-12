// A single random cycle is a derangement: each participant gives once,
// receives once, and never draws themself.
export function drawRecipients(ids, randomInt, previous = {}) {
  const unique = [...new Set(ids)];
  if (unique.length !== ids.length || unique.length < 2) throw new Error('At least two different students must opt in.');
  if (typeof randomInt !== 'function') throw new TypeError('A secure random source is required.');
  let result;
  for (let attempt = 0; attempt < 64; attempt++) {
    const recipients = [...unique];
    for (let i = recipients.length - 1; i > 0; i--) {
      const j = randomInt(i);
      if (!Number.isInteger(j) || j < 0 || j >= i) throw new Error('Invalid random selection.');
      [recipients[i], recipients[j]] = [recipients[j], recipients[i]];
    }
    result = Object.fromEntries(unique.map((id, i) => [id, recipients[i]]));
    if (unique.length === 2 || unique.some(id => previous[id] !== result[id])) return result;
  }
  return result;
}

export function secureRandomInt(maxExclusive) {
  if (!Number.isSafeInteger(maxExclusive) || maxExclusive < 1) throw new RangeError('Invalid range.');
  const range = 0x100000000;
  const cutoff = range - (range % maxExclusive);
  const values = new Uint32Array(1);
  do { crypto.getRandomValues(values); } while (values[0] >= cutoff);
  return values[0] % maxExclusive;
}

export function recipientLabel(profile = {}) {
  const fullName = String(profile.name || profile.displayName || '').trim().split(/\s+/);
  const first = String(profile.firstName || fullName[0] || '').trim().split(/\s+/)[0];
  const last = String(profile.lastName || (fullName.length > 1 ? fullName.at(-1) : '')).trim();
  return (first + (last ? ` ${last[0]}.` : '')).trim() || 'Classmate';
}

