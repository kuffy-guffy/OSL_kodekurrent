// logic.js: all calculations and input checks, kept free of Express so they can be tested alone.
// Each handler takes the request body and returns { status, body }.
const { T, OUT } = require('./traits');

const pct = x => Math.round(x * 1000) / 10 + '%';
const byId = id => T.find(t => t.id === id);
const isGeno = (t, g) => typeof g === 'string' && Object.hasOwn(t.geno, g);
const ok = body => ({ status: 200, body });
const bad = msg => ({ status: 400, body: { error: msg } });

// Punnett square for one gene: four equally likely combinations.
function cross(t, a, b) {
  const ix = x => t.alleles.indexOf(x), cells = [], tot = {};
  for (const y of b) for (const x of a) {
    const g = [x, y].sort((p, q) => ix(p) - ix(q)).join('');
    const [label, tone] = t.phen(g);
    cells.push({ g, tone });
    (tot[label] = tot[label] || { p: 0, tone }).p += 0.25;
  }
  return { cells, tot };
}

const pAffected = tot =>
  Object.values(tot).filter(v => v.tone === 'hi').reduce((s, v) => s + v.p, 0);

// GET /api/traits: the trait list without the phen() functions (functions cannot travel as JSON).
const listTraits = () => T.map(({ phen, ...rest }) => rest);

// POST /api/cross  { traitId, p1, p2 }
function crossHandler({ traitId, p1, p2 } = {}) {
  const t = byId(traitId);
  if (!t) return bad('Unknown trait');
  if (!isGeno(t, p1) || !isGeno(t, p2)) return bad('Invalid genotype');
  const { cells, tot } = cross(t, p1, p2);
  const p = pAffected(tot);
  return ok({ cells, results: tot, pAffected: p, outlook: p > 0 ? OUT[t.id] || null : null });
}

// POST /api/height  { parent1, parent2 }  (numbers, in cm)
function heightHandler({ parent1, parent2 } = {}) {
  const valid = h => typeof h === 'number' && Number.isFinite(h) && h >= 120 && h <= 230;
  if (!valid(parent1) || !valid(parent2)) return bad('Heights must be numbers between 120 and 230 cm');
  const r = c => [Math.round(c - 8.5), Math.round(c + 8.5)];
  return ok({ son: r((parent1 + parent2 + 13) / 2), daughter: r((parent1 + parent2 - 13) / 2) });
}

// POST /api/rh  { p1, p2, mother }  (mother is 1 or 2)
function rhHandler({ p1, p2, mother } = {}) {
  const t = byId('rh');
  if (!isGeno(t, p1) || !isGeno(t, p2) || (mother !== 1 && mother !== 2)) return bad('Invalid input');
  const mom = mother === 1 ? p1 : p2;
  const dd = s => [...s].filter(x => x === 'd').length / 2;
  const pos = 1 - dd(p1) * dd(p2);
  let paragraphs;
  if (mom !== 'dd')
    paragraphs = [{ t: 'The mother is Rh-positive, so Rh incompatibility cannot happen in her pregnancies.' }];
  else if (pos === 0)
    paragraphs = [{ t: 'Both parents are Rh-negative, so every child will be Rh-negative. No incompatibility.' }];
  else paragraphs = [
    { b: 'Chance each baby is Rh-positive: ' + pct(pos) + '.',
      t: 'An Rh-positive baby can lead an Rh-negative mother to make antibodies (sensitisation).' },
    { t: 'First pregnancy: the baby is usually unharmed. The mother’s risk of becoming sensitised is about 1%, mostly around birth.' },
    { t: 'Without anti-D injections, roughly 12 to 16% of Rh-negative mothers become sensitised after an Rh-positive birth. With anti-D (given around 28 weeks and after birth), this falls to about 0.1 to 2%.' },
    { t: 'If sensitised, a later Rh-positive baby can develop haemolytic disease, from mild jaundice to severe anaemia. Most affected babies survive with specialist monitoring and treatment. It is not true that only the first child survives: with routine anti-D care, later babies are usually healthy.' }
  ];
  return ok({ pPositive: pos, paragraphs });
}

// POST /api/summary  { items: [{ traitId, p1, p2 }, ...] }
// Chance of at least one condition: 1 - product of (1 - p), treating the genes as independent.
function summaryHandler({ items } = {}) {
  if (!Array.isArray(items) || items.length > 50) return bad('items must be a list of up to 50 traits');
  let none = 1;
  const out = [];
  for (const it of items) {
    const { traitId, p1, p2 } = it || {};
    const t = byId(traitId);
    if (!t || !isGeno(t, p1) || !isGeno(t, p2)) return bad('Invalid item in list');
    const p = pAffected(cross(t, p1, p2).tot);
    none *= 1 - p;
    out.push({ traitId, name: t.name, p });
  }
  return ok({ pAny: 1 - none, items: out });
}

module.exports = { pct, cross, listTraits, crossHandler, heightHandler, rhHandler, summaryHandler };
