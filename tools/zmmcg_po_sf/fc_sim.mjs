// Independent check of the layout CONDITIONS: runs every generated FormCalc script (computed texts and the "ready" hide events) with a
// small FormCalc interpreter for every combination of order type / flag / language / currency / header text / Inco terms and compares
// the visible computed texts with what the LEGACY export says should print (conditions read from the export by a second, independent
// reader of the raw XML - not the model used by the generator).
//   node fc_sim.mjs <repo>        exit 1 on any difference
import fs from 'node:fs';
import path from 'node:path';
import { parseXml } from '../xmlmini.mjs';

const repo = process.argv[2];
const xdp = parseXml(fs.readFileSync(path.join(repo, 'src/zmmcg_po_sf_adt.sfpf.xdp'), 'utf8'));
const tpl = xdp.children.find((c) => c.name === 'template');

// ================================================================ FormCalc interpreter (the subset the generator writes)
function tokenize(src) {
  const toks = []; let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i += 1; continue; }
    if (c === '"') { let j = i + 1; let s = ''; while (j < src.length && src[j] !== '"') { if (src[j] === '\\') { const n = src[j + 1]; if (n === 'u') { s += String.fromCharCode(parseInt(src.slice(j + 2, j + 6), 16)); j += 6; continue; } s += n; j += 2; continue; } s += src[j]; j += 1; } toks.push({ t: 's', v: s }); i = j + 1; continue; }
    if (/[0-9]/.test(c)) { let j = i; while (/[0-9.]/.test(src[j] ?? '')) j += 1; toks.push({ t: 'n', v: parseFloat(src.slice(i, j)) }); i = j; continue; }
    if (/[A-Za-z_$]/.test(c)) { let j = i; while (/[A-Za-z0-9_.$]/.test(src[j] ?? '')) j += 1; toks.push({ t: 'w', v: src.slice(i, j) }); i = j; continue; }
    toks.push({ t: 'p', v: c }); i += 1;
  }
  return toks;
}
function run(script, env, self) {
  const T = tokenize(script); let p = 0; const vars = {}; let out = null; let hidden = false;
  const peek = () => T[p]; const eat = () => T[p++];
  const isW = (v) => peek()?.t === 'w' && peek().v.toLowerCase() === v;
  function primary() {
    const t = eat();
    if (t.t === 's') return t.v; if (t.t === 'n') return t.v;
    if (t.t === 'p' && t.v === '(') { const v = or(); eat(); return v; }
    if (t.t === 'w') {
      const lw = t.v.toLowerCase();
      if (lw === 'not') return !primary();
      if (peek()?.v === '(' && ['concat', 'rtrim', 'ltrim'].includes(lw)) { eat(); const a = []; if (peek().v !== ')') { a.push(or()); while (peek().v === ',') { eat(); a.push(or()); } } eat(); return lw === 'concat' ? a.join('') : (lw === 'rtrim' ? String(a[0]).replace(/\s+$/, '') : String(a[0]).replace(/^\s+/, '')); }
      const m = /^\$record\.([A-Z0-9_]+)\.value$/.exec(t.v); if (m) return env.val(m[1]);
      if (t.v in vars) return vars[t.v];
      throw new Error(`unknown identifier ${t.v}`);
    }
    throw new Error('primary');
  }
  const cmp = () => { let a = primary(); const o = peek(); if (o?.t === 'w' && ['eq', 'ne', 'gt', 'lt', 'ge', 'le'].includes(o.v.toLowerCase())) { eat(); const b = primary(); const x = String(a).trim(); const y = String(b).trim(); const r = { eq: x === y, ne: x !== y, gt: x > y, lt: x < y, ge: x >= y, le: x <= y }[o.v.toLowerCase()]; return r; } return a; };
  const and = () => { let a = cmp(); while (isW('and')) { eat(); const b = cmp(); a = a && b; } return a; };
  const or = () => { let a = and(); while (isW('or')) { eat(); const b = and(); a = a || b; } return a; };
  function block(exec) {
    while (p < T.length && !isW('endif') && !isW('else')) stmt(exec);
  }
  function stmt(exec) {
    if (isW('var')) { eat(); const n = eat().v; eat(); const v = or(); if (exec) vars[n] = v; return; }
    if (isW('if')) {
      eat(); const c = or(); eat(); // 'then'
      if (!isW('then') && T[p - 1]?.v?.toLowerCase() !== 'then') { /* then consumed above */ }
      block(exec && !!c);
      if (isW('else')) { eat(); block(exec && !c); }
      eat(); // endif
      return;
    }
    const t = eat();
    if (t.t === 'w' && t.v === '$') { eat(); const v = or(); if (exec) out = v; return; }
    if (t.t === 'w' && t.v === '$.presence') { eat(); const v = or(); if (exec && v === 'hidden') hidden = true; return; }
    if (t.t === 'w') { eat(); const v = or(); if (exec) vars[t.v] = v; return; }
    throw new Error(`statement ${t.v}`);
  }
  // 'then' keyword handling: the 'if' branch above consumes the keyword via eat()
  while (p < T.length) stmt(true);
  return { out, hidden };
}

// ================================================================ collect the layout items
const items = []; // { kind: 'calc'|'static', script|text, hiders: [script...], name }
function walk(e, hiders) {
  let h = hiders;
  if (e.name === 'subform') {
    const ev = e.children.find((c) => c.name === 'event' && c.attrs.activity === 'ready');
    if (ev) { const sc = ev.children.find((c) => c.name === 'script'); if (sc) h = [...hiders, sc.text]; }
  }
  if (e.name === 'field') {
    const calc = e.children.find((c) => c.name === 'calculate');
    if (calc) items.push({ kind: 'calc', script: calc.children.find((c) => c.name === 'script').text, hiders: h, name: e.attrs.name });
  } else if (e.name === 'draw') {
    const t = e.children.find((c) => c.name === 'value')?.children.find((c) => c.name === 'text');
    if (t && t.text.trim() !== '') items.push({ kind: 'static', text: t.text, hiders: h, name: e.attrs.name });
  }
  for (const c of e.children) if (!['event', 'calculate'].includes(c.name)) walk(c, h);
}
walk(tpl.children.find((c) => c.name === 'subform'), []);

// ================================================================ independent legacy expectation (raw XML, own reader)
const raw = fs.readFileSync(path.join(repo, 'vernasofttechie-zmmcg_po_sf/zmmcg_po_sf.xml'), 'utf8');
const rx = parseXml(raw);
const K1 = (e, n) => e?.children.find((c) => c.name === n); const KS = (e, n) => (e ? e.children.filter((c) => c.name === n) : []); const TX = (e, n) => (K1(e, n)?.text ?? '').trim();
function conds(nodeEl) { // the node's own condition: [[{lop,op1,cop,op2}]...] - the operator item comes BEFORE the operand it joins
  const c = K1(K1(nodeEl, 'sf:COND'), 'sf:CONDITION'); if (!c) return [];
  const items2 = []; let pending = '';
  for (const i of KS(K1(c, 'COND'), 'item')) { const cop = TX(i, 'COP'); if (!cop) { if (TX(i, 'LOP')) pending = TX(i, 'LOP'); continue; } items2.push({ lop: pending, op1: TX(i, 'OP1'), cop, op2: TX(i, 'OP2') }); pending = ''; }
  return items2;
}
const tree = (function find(e) { if (e.name === 'sf:PAGETREE') return e; for (const c of e.children) { const r = find(c); if (r) return r; } return null; })(rx);
const expectations = []; // { conds: [items...], E: [lines], F: [lines], kind }
function nodeObj(n) { return K1(K1(n, 'sf:OBJ'), 'sf:SECTION') ?? K1(K1(n, 'sf:OBJ'), 'sf:TEXT') ?? K1(n, 'sf:OBJ')?.children[0]; }
function collect(n, anc, inTerms) {
  const own = conds(n); const here = own.length ? [...anc, own] : anc;
  const obj = K1(n, 'sf:OBJ')?.children[0];
  let terms = inTerms;
  if (obj?.name === 'sf:SECTION' && TX(obj, 'SECTTYPE') === 'F') terms = true;
  if (obj?.name === 'sf:TEXT' && !terms && TX(obj, 'TTYPE') !== 'I') {
    const lines = (lang) => KS(K1(obj, 'T_TEXT'), 'item').filter((i) => TX(i, 'SPRAS') === lang).map((i) => ({ fmt: K1(i, 'TDFORMAT')?.text ?? '', line: K1(i, 'TDLINE')?.text ?? '' }));
    const master = KS(K1(obj, 'TEXT'), 'item').map((i) => ({ fmt: K1(i, 'TDFORMAT')?.text ?? '', line: K1(i, 'TDLINE')?.text ?? '' }));
    const E = lines('E').length ? lines('E') : master; const F = lines('F');
    expectations.push({ conds: here, E, F, name: TX(K1(obj, 'NAME'), 'INAME') });
  }
  const proc = obj && K1(K1(obj, 'sf:PROC_CTRL'), 'sf:NODE');
  if (proc) for (const s of KS(K1(proc, 'sf:SUCC'), 'sf:item')) collect(K1(s, 'sf:NODE'), here, terms);
  // an alternative (node type CD): its own condition; the TRUE branch needs it, the FALSE branch needs its negation
  const isCD = TX(n, 'NODETYPE') === 'CD';
  const cdItems = isCD ? KS(K1(obj, 'COND'), 'item').reduce((acc, i) => { const cop = TX(i, 'COP'); if (!cop) { acc.pending = TX(i, 'LOP'); return acc; } acc.list.push({ lop: acc.pending, op1: TX(i, 'OP1'), cop, op2: TX(i, 'OP2') }); acc.pending = ''; return acc; }, { list: [], pending: '' }).list : [];
  for (const s of KS(K1(n, 'sf:SUCC'), 'sf:item')) {
    const ch = K1(s, 'sf:NODE'); let h2 = here;
    if (isCD && TX(ch, 'NODETYPE') === 'EV') { const cap = TX(K1(K1(ch, 'sf:OBJ')?.children[0], 'CAPTION') ? K1(ch, 'sf:OBJ').children[0] : ch, 'CAPTION'); h2 = [...here, { neg: cap === 'FALSE', items: cdItems }]; }
    collect(ch, h2, terms);
  }
}
collect(K1(tree, 'sf:NODE') ?? tree.children[0], [], false);

function evalItems(items2, get) {
  if (!Array.isArray(items2)) { const r = evalItems(items2.items, get); return items2.neg ? !r : r; }
  const live = items2.filter((i) => !(/^\d+$/.test(i.op1) && /^\d+$/.test(i.op2) && ((i.cop === 'EQ') === (i.op1 === i.op2)) === false && false));
  const groups = [[]]; items2.forEach((i, ix) => { if (ix && i.lop === 'OR') groups.push([]); groups[groups.length - 1].push(i); });
  const one = (i) => {
    const val = (o) => (/^'.*'$/.test(o) ? o.slice(1, -1) : (/^\d+$/.test(o) ? o : get(o)));
    const a = String(val(i.op1)).trim(); const b = String(val(i.op2)).trim();
    return { EQ: a === b, NE: a !== b, GT: a > b, LT: a < b, GE: a >= b, LE: a <= b }[i.cop];
  };
  return groups.some((g) => g.every(one));
}
const cleanTags = (s) => s.replace(/<\(>/g, '').replace(/<\)>/g, '').replace(/<\/>/g, '').replace(/<[A-Z]\d>/g, '');
function expectedText(lines, get) {
  const ps = [];
  for (const { fmt, line } of lines) { if (/^\/\*/.test(fmt) || /^\/:/.test(fmt)) continue; if (ps.length && (fmt === ' ' || fmt === '')) ps[ps.length - 1] += ` ${line.trim()}`; else ps.push(line); }
  return ps.map((p) => cleanTags(p).replace(/&([A-Za-z_][A-Za-z0-9_-]*)(\(([A-Za-z]+)\))?&/g, (m, nm, x, fmt) => { const v = get(nm); return fmt && fmt.toUpperCase() === 'C' ? String(v).trim() : v; })).join('\n');
}
const TOKMAP = { LV_LIFNR: 'GV_LIFNR_OUT' };

// ================================================================ run all environments
const TYPES = ['ZPOC', 'ZPOR', 'ZPOT', 'ZPOI', 'ZPOL', 'ZPOS', 'YCAP', 'YRAW', 'ZIMP', 'ZLOC', 'ZPIC', 'ZZZZ'];
let envs = 0; const bad = [];
const seen = new Set(); const agg = new Map();
const note = (k, text, envs2) => { const key2 = `${k}|${text}`; const a = agg.get(key2) ?? { k, text, first: envs2, n: 0 }; a.n += 1; agg.set(key2, a); };
for (const bsart of TYPES) for (const flag of ['X', 'Y']) for (const langu of ['E', 'F']) for (const waers of ['XAF', 'USD']) for (const potext of ['', 'X']) for (const inco of [['', ''], ['FOB', ''], ['', 'Douala']]) for (const lvflag of ['Y', 'N']) {
  envs += 1;
  const base = { V_BSART: bsart, V_FLAG: flag, GV_LANGU: langu, V_WAERS: waers, V_POTEXT: potext, GV_INCO1: inco[0], GV_INCO2: inco[1], LV_FLAG: lvflag };
  const placeholder = (n) => `<${(TOKMAP[n.toUpperCase()] ?? n).toUpperCase().replace(/-/g, '_')}>`;
  const lget = (n) => { const u = n.toUpperCase(); if (u === 'SY-LANGU') return langu; return u in base ? base[u] : `<${u.replace(/-/g, '_')}>`; };
  const env = { val: (n) => (n in base ? base[n] : `<${n}>`) };
  // actual: every visible computed / static text of the layout
  const actual = new Set();
  for (const it of items) {
    if (it.hiders.some((h) => run(h, env).hidden)) continue;
    const t = it.kind === 'calc' ? run(it.script, env).out : it.text;
    if (t !== null && String(t).trim() !== '') actual.add(String(t).replace(/\r/g, '').trim());
  }
  // expected: every live text of the legacy export (terms are prepared by the Initialization and not in the layout)
  const fr = bsart === 'ZPOL' || bsart === 'ZPOS' || (bsart !== 'ZPOI' && langu === 'F');
  const exp = new Set();
  for (const x of expectations) {
    if (!x.conds.every((c) => evalItems(c, lget))) continue;
    const lines = fr && x.F.length ? x.F : x.E;
    const t = expectedText(lines, (nm) => lget(TOKMAP[nm.toUpperCase()] ?? nm));
    if (t.trim() !== '') exp.add(t.trim());
  }
  const key = (s) => s.replace(/\s+/g, ' ').trim();
  const A = new Set([...actual].map(key)); const E2 = new Set([...exp].map(key));
  // only labels / headings (texts without a data token) are compared: tokens print through different, equivalent paths (prepared values)
  const noTok = (s) => !/<[A-Z0-9_]+>/.test(s);
  for (const e of E2) if (noTok(e) && !A.has(e) && !seen.has(`m${bsart}${flag}${langu}${e}`)) { seen.add(`m${bsart}${flag}${langu}${e}`); bad.push(`MISSING ${bsart}/${flag}/${langu}/${waers}/pot=${potext}/inco=${inco.join('+')}: legacy prints "${e.slice(0, 60)}" - layout does not`); }
  for (const a of A) if (noTok(a) && !E2.has(a) && !seen.has(`x${bsart}${flag}${langu}${a}`)) { seen.add(`x${bsart}${flag}${langu}${a}`); bad.push(`EXTRA ${bsart}/${flag}/${langu}/${waers}/pot=${potext}/inco=${inco.join('+')}: layout prints "${a.slice(0, 60)}" - legacy does not`); }
}
console.log(`${envs} environments, ${items.length} layout text items, ${expectations.length} legacy text nodes (terms excluded)`);
for (const b of bad.slice(0, 40)) console.log(b);
console.log(bad.length ? `RESULT: ${bad.length} difference(s)` : 'RESULT: OK - every live legacy label / heading prints, nothing else, in every environment');
process.exit(bad.length ? 1 : 0);
