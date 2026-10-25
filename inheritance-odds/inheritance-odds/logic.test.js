const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('./logic');

test('trait list is JSON-safe and has no functions', () => {
  const list = L.listTraits();
  assert.equal(list.length, 18);
  assert.ok(list.every(t => t.phen === undefined));
  assert.deepEqual(JSON.parse(JSON.stringify(list)), list);
});

test('cystic fibrosis: two carriers give 25% affected', () => {
  const { status, body } = L.crossHandler({ traitId: 'cf', p1: 'Nc', p2: 'Nc' });
  assert.equal(status, 200);
  assert.equal(body.cells.length, 4);
  assert.equal(body.pAffected, 0.25);
  assert.ok(body.outlook);
});

test('no affected child means no outlook text', () => {
  const { body } = L.crossHandler({ traitId: 'cf', p1: 'NN', p2: 'NN' });
  assert.equal(body.pAffected, 0);
  assert.equal(body.outlook, null);
});

test('Huntington: one affected parent gives 50%', () => {
  assert.equal(L.crossHandler({ traitId: 'hd', p1: 'NH', p2: 'NN' }).body.pAffected, 0.5);
});

test('ABO: A/O x B/O gives A, B, AB, O at 25% each', () => {
  const r = L.crossHandler({ traitId: 'abo', p1: 'AO', p2: 'BO' }).body.results;
  assert.deepEqual(Object.keys(r).sort(), ['Group A', 'Group AB', 'Group B', 'Group O']);
  assert.ok(Object.values(r).every(v => v.p === 0.25));
});

test('cross rejects unknown traits and bad genotypes', () => {
  assert.equal(L.crossHandler({ traitId: 'nope', p1: 'NN', p2: 'NN' }).status, 400);
  assert.equal(L.crossHandler({ traitId: 'cf', p1: 'toString', p2: 'NN' }).status, 400);
  assert.equal(L.crossHandler({ traitId: 'cf', p1: 'XX', p2: 'NN' }).status, 400);
  assert.equal(L.crossHandler({}).status, 400);
  assert.equal(L.crossHandler(undefined).status, 400);
});

test('height ranges', () => {
  const { status, body } = L.heightHandler({ parent1: 175, parent2: 162 });
  assert.equal(status, 200);
  assert.deepEqual(body.son, [167, 184]);
  assert.deepEqual(body.daughter, [154, 171]);
});

test('height rejects out-of-range and non-number input', () => {
  assert.equal(L.heightHandler({ parent1: 400, parent2: 160 }).status, 400);
  assert.equal(L.heightHandler({ parent1: '175', parent2: 160 }).status, 400);
  assert.equal(L.heightHandler({}).status, 400);
});

test('Rh: Rh-negative mother with Rh-positive father shows the risk text', () => {
  const { body } = L.rhHandler({ p1: 'DD', p2: 'dd', mother: 2 });
  assert.equal(body.pPositive, 1);
  assert.equal(body.paragraphs.length, 4);
  assert.match(body.paragraphs[0].b, /100%/);
});

test('Rh: Rh-positive mother, and two Rh-negative parents', () => {
  assert.equal(L.rhHandler({ p1: 'Dd', p2: 'dd', mother: 1 }).body.paragraphs.length, 1);
  const both = L.rhHandler({ p1: 'dd', p2: 'dd', mother: 1 }).body;
  assert.equal(both.pPositive, 0);
  assert.match(both.paragraphs[0].t, /Both parents are Rh-negative/);
});

test('Rh rejects a bad mother value', () => {
  assert.equal(L.rhHandler({ p1: 'DD', p2: 'dd', mother: 3 }).status, 400);
});

test('summary combines conditions as 1 - product of (1 - p)', () => {
  const { status, body } = L.summaryHandler({ items: [
    { traitId: 'cf', p1: 'Nc', p2: 'Nc' },
    { traitId: 'scd', p1: 'AS', p2: 'AS' }
  ] });
  assert.equal(status, 200);
  assert.equal(body.pAny, 1 - 0.75 * 0.75);
  assert.deepEqual(body.items.map(i => i.name), ['Cystic fibrosis', 'Sickle cell disease']);
});

test('summary rejects bad input', () => {
  assert.equal(L.summaryHandler({}).status, 400);
  assert.equal(L.summaryHandler({ items: [null] }).status, 400);
  assert.equal(L.summaryHandler({ items: [{ traitId: 'cf', p1: 'zz', p2: 'NN' }] }).status, 400);
});
