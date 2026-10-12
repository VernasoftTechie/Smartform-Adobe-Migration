// Independent check of the generated terms ABAP (terms_extra.abap): a small interpreter for the generated statements
// (IF / ELSEIF, COND string / COND #, VALUE #, APPEND, string templates) runs the code for every order type / flag / language and
// compares GV_TERMS_TITLE and GT_TERMS with what the LEGACY export prints (own reader of the raw XML).
//   node abap_terms_sim.mjs <repo>      exit 1 on any difference
import fs from 'node:fs';
import path from 'node:path';
import { parseXml } from '../xmlmini.mjs';

const repo = process.argv[2];
const src = fs.readFileSync(new URL('./terms_extra.abap', import.meta.url), 'utf8');

// ---------------------------------------------------------------- tokenizer
function tokenize(text) {
  const T = []; let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === '*' && (i === 0 || text[i - 1] === '\n')) { while (i < text.length && text[i] !== '\n') i += 1; continue; }
    if (c === '"') { while (i < text.length && text[i] !== '\n') i += 1; continue; }
    if (/\s/.test(c)) { i += 1; continue; }
    if (c === '|') { let j = i + 1; let s = ''; while (text[j] !== '|') { if (text[j] === '\\') { s += text[j + 1]; j += 2; } else { s += text[j]; j += 1; } } T.push({ t: 'str', v: s }); i = j + 1; continue; }
    if (c === "'") { let j = i + 1; let s = ''; while (!(text[j] === "'" && text[j + 1] !== "'")) { if (text[j] === "'") { s += "'"; j += 2; } else { s += text[j]; j += 1; } } T.push({ t: 'lit', v: s }); i = j + 1; continue; }
    if (/[A-Za-z_]/.test(c)) { let j = i; while (/[A-Za-z0-9_\-]/.test(text[j] ?? '') || (text[j] === '=' && text[j + 1] === '>') || (text[j] === '>' && text[j - 1] === '=')) j += 1; T.push({ t: 'w', v: text.slice(i, j) }); i = j; continue; }
    if (text.startsWith('&&', i)) { T.push({ t: 'p', v: '&&' }); i += 2; continue; }
    if (text.startsWith('<>', i)) { T.push({ t: 'p', v: '<>' }); i += 2; continue; }
    if (text.startsWith('||', i)) { T.push({ t: 'str', v: '' }); i += 2; continue; }
    T.push({ t: 'p', v: c }); i += 1;
  }
  return T;
}
const T = tokenize(src);

// ---------------------------------------------------------------- interpreter
function run(env) {
  let p = 0; const V = { ...env, abap_true: 'X', abap_false: '', lv_fr: '' }; const terms = []; let title = '';
  const peek = () => T[p]; const eat = () => T[p++]; const isW = (w) => peek()?.t === 'w' && peek().v.toUpperCase() === w;
  function expr(exec) { // string expression: template, newline, identifier, COND string( ... ), chained with &&
    let s = primary(exec);
    while (peek()?.v === '&&' && peek().t === 'p') { eat(); s += primary(exec); }
    return s;
  }
  function primary(exec) {
    const t = eat();
    if (t.t === 'str') return t.v;
    if (t.t === 'w') {
      if (t.v === 'cl_abap_char_utilities=>newline') return '\n';
      if (t.v.toUpperCase() === 'COND') { // COND string( / COND #(
        eat(); eat(); // type token and '('
        let result = ''; let done = false;
        while (!(peek().t === 'p' && peek().v === ')')) {
          if (isW('WHEN')) { eat(); const c = cond(); const take = c && !done; eat(); // THEN
            const v = expr(exec && take); if (take) { result = v; done = true; } }
          else if (isW('ELSE')) { eat(); const v = expr(exec && !done); if (!done) result = v; }
          else throw new Error(`COND: unexpected ${peek().v}`);
        }
        eat(); return result;
      }
      return V[t.v] ?? '';
    }
    throw new Error(`primary ${t.v}`);
  }
  // conditions
  function cmpTerm() {
    if (peek().v === '(' && peek().t === 'p') { eat(); const r = cond(); eat(); return r; }
    const a = operand(); const op = eat().v; const b = operand();
    const x = String(a).trim(); const y = String(b).trim();
    return op === '=' ? x === y : (op === '<>' ? x !== y : (() => { throw new Error(`op ${op}`); })());
  }
  const operand = () => { const t = eat(); return t.t === 'lit' ? t.v : (t.t === 'w' ? (V[t.v] ?? '') : t.v); };
  function condAnd() { let a = cmpTerm(); while (isW('AND')) { eat(); const b = cmpTerm(); a = a && b; } return a; }
  function cond() { let a = condAnd(); while (isW('OR')) { eat(); const b = condAnd(); a = a || b; } return a; }
  function boolCond() { // COND #( WHEN c THEN abap_true ... ELSE abap_false ) for lv_fr
    eat(); eat(); eat(); // COND # (
    let r = ''; let done = false;
    while (!(peek().t === 'p' && peek().v === ')')) {
      if (isW('WHEN')) { eat(); const c = cond(); eat(); const v = operand(); if (c && !done) { r = v; done = true; } }
      else if (isW('ELSE')) { eat(); const v = operand(); if (!done) r = v; }
      else throw new Error('boolCond');
    }
    eat(); return r === 'abap_true' || r === 'X' ? 'X' : '';
  }
  // statements
  function skipBlock() { let depth = 0; while (p < T.length) { if (isW('IF') && peek().t === 'w') { depth += 1; } if (isW('ENDIF')) { if (depth === 0) return; depth -= 1; } if (depth === 0 && (isW('ELSEIF') || isW('ELSE'))) return; p += 1; } }
  function stmts(exec) {
    while (p < T.length && !isW('ENDIF') && !isW('ELSEIF') && !isW('ELSE')) stmt(exec);
  }
  function stmt(exec) {
    if (isW('CLEAR')) { while (!(peek().t === 'p' && peek().v === '.')) p += 1; eat(); if (exec) { terms.length = 0; title = ''; } return; }
    if (isW('IF')) {
      eat(); let taken = false; let c = cond(); eat(); // '.'
      let run1 = exec && c; if (run1) taken = true;
      if (run1) stmts(true); else skipStmts();
      while (isW('ELSEIF')) { eat(); const c2 = cond(); eat(); const r = exec && !taken && c2; if (r) { taken = true; stmts(true); } else skipStmts(); }
      if (isW('ELSE')) { eat(); eat(); if (exec && !taken) stmts(true); else skipStmts(); }
      eat(); eat(); // ENDIF .
      return;
    }
    if (isW('APPEND')) {
      eat(); eat(); eat(); eat(); eat(); eat(); // APPEND VALUE # ( slno =
      const slno = expr(exec); eat(); eat(); // 'text' '='
      const text = expr(exec); eat(); eat(); eat(); eat(); // ')' TO gt_terms '.'
      if (exec) terms.push([slno, text]);
      return;
    }
    const target = eat().v; eat(); // name '='
    if (isW('COND') && T[p + 1]?.v === '#') { const r = boolCond(); eat(); if (exec) V[target] = r; return; }
    const v = expr(exec); eat(); // '.'
    if (exec) { if (target === 'gv_terms_title') title = v; else V[target] = v; }
  }
  function skipStmts() { // skip to the matching ELSEIF / ELSE / ENDIF at this nesting level
    let depth = 0;
    while (p < T.length) {
      if (T[p].t === 'w' && T[p].v.toUpperCase() === 'IF') depth += 1;
      else if (T[p].t === 'w' && T[p].v.toUpperCase() === 'ENDIF') { if (depth === 0) return; depth -= 1; }
      else if (depth === 0 && T[p].t === 'w' && ['ELSEIF', 'ELSE'].includes(T[p].v.toUpperCase()) && T[p - 1]?.v === '.') return;
      p += 1;
    }
  }
  stmts(true);
  return { title, terms };
}

// ---------------------------------------------------------------- legacy expectation (raw XML, own reader)
const rx = parseXml(fs.readFileSync(path.join(repo, 'vernasofttechie-zmmcg_po_sf/zmmcg_po_sf.xml'), 'utf8'));
const K1 = (e, n) => e?.children.find((c) => c.name === n); const KS = (e, n) => (e ? e.children.filter((c) => c.name === n) : []); const TX = (e, n) => (K1(e, n)?.text ?? '').trim();
function conds(n) {
  const c = K1(K1(n, 'sf:COND'), 'sf:CONDITION'); if (!c) return [];
  const list = []; let pending = '';
  for (const i of KS(K1(c, 'COND'), 'item')) { const cop = TX(i, 'COP'); if (!cop) { if (TX(i, 'LOP')) pending = TX(i, 'LOP'); continue; } list.push({ lop: pending, op1: TX(i, 'OP1'), cop, op2: TX(i, 'OP2') }); pending = ''; }
  return list;
}
const evalC = (items, get) => {
  const groups = [[]]; items.forEach((i, ix) => { if (ix && i.lop === 'OR') groups.push([]); groups[groups.length - 1].push(i); });
  const val = (o) => (/^'.*'$/.test(o) ? o.slice(1, -1) : (/^\d+$/.test(o) ? o : get(o)));
  return groups.some((g) => g.every((i) => { const a = String(val(i.op1)).trim(); const b = String(val(i.op2)).trim(); return { EQ: a === b, NE: a !== b }[i.cop]; }));
};
const tree = (function f(e) { if (e.name === 'sf:PAGETREE') return e; for (const c of e.children) { const r = f(c); if (r) return r; } return null; })(rx);
const nodes = [];
(function walk(n, anc) {
  const here = [...anc, { c: conds(n), n }];
  nodes.push({ n, path: here, obj: K1(n, 'sf:OBJ')?.children[0] });
  const obj = K1(n, 'sf:OBJ')?.children[0];
  const proc = obj && K1(K1(obj, 'sf:PROC_CTRL'), 'sf:NODE');
  if (proc) for (const s of KS(K1(proc, 'sf:SUCC'), 'sf:item')) walk(K1(s, 'sf:NODE'), here);
  for (const s of KS(K1(n, 'sf:SUCC'), 'sf:item')) walk(K1(s, 'sf:NODE'), here);
}(K1(tree, 'sf:NODE') ?? tree.children[0], []));
const nm = (o) => TX(K1(o, 'NAME'), 'INAME');
const kidsOf = (n) => { const obj = K1(n, 'sf:OBJ')?.children[0]; const proc = obj && K1(K1(obj, 'sf:PROC_CTRL'), 'sf:NODE'); return [...(proc ? KS(K1(proc, 'sf:SUCC'), 'sf:item') : []), ...KS(K1(n, 'sf:SUCC'), 'sf:item')].map((s) => K1(s, 'sf:NODE')); };
const cleanTags = (s) => s.replace(/<\(>/g, '').replace(/<\)>/g, '').replace(/<\/>/g, '').replace(/<[A-Z]\d>/g, '');
function paragraphs(lines) { const ps = []; for (const { fmt, line } of lines) { if (/^\/\*/.test(fmt) || /^\/:/.test(fmt)) continue; if (ps.length && (fmt === ' ' || fmt === '')) ps[ps.length - 1] += ` ${line.trim()}`; else ps.push(line); } return ps.map((x) => cleanTags(x).trim()).filter((x) => x !== '').join('\n'); }
function textNode(n, french, get) { // text of one TEXT node for the language (include texts: the standard text value)
  const o = K1(n, 'sf:OBJ').children[0];
  if (TX(o, 'TTYPE') === 'I') return get('GV_TERM1_ZPOS');
  const lines = (l) => KS(K1(o, 'T_TEXT'), 'item').filter((i) => TX(i, 'SPRAS') === l).map((i) => ({ fmt: K1(i, 'TDFORMAT')?.text ?? '', line: K1(i, 'TDLINE')?.text ?? '' }));
  const E = lines('E').length ? lines('E') : KS(K1(o, 'TEXT'), 'item').map((i) => ({ fmt: K1(i, 'TDFORMAT')?.text ?? '', line: K1(i, 'TDLINE')?.text ?? '' }));
  return paragraphs(french && lines('F').length ? lines('F') : E);
}
function liveText(cellNode, french, get) { // the last live text node of a cell (the legacy prints the node whose condition holds)
  let res = '';
  for (const t of kidsOf(cellNode)) { const o = K1(t, 'sf:OBJ')?.children[0]; if (o?.name !== 'sf:TEXT') continue; if (conds(t).length && !evalC(conds(t), get)) continue; res = textNode(t, french, get); }
  return res;
}
function expected(env) {
  const get = (n) => ({ V_BSART: env.v_bsart, V_FLAG: env.v_flag, 'SY-LANGU': env.gv_langu, GV_TERM1_ZPOS: env.gv_term1_zpos })[n.toUpperCase()] ?? '';
  const french = env.v_bsart === 'ZPOL' || env.v_bsart === 'ZPOS' || (env.v_bsart !== 'ZPOI' && env.gv_langu === 'F');
  const out = { title: '', terms: [] };
  for (const { n, obj } of nodes) {
    if (obj?.name !== 'sf:SECTION' || !['OTHER_PO', 'SERVCE_PO'].includes(nm(obj))) continue;
    if (!evalC(conds(n), get) && conds(n).length) continue;
    // footer event (third event) -> folder sections
    const evs = kidsOf(n).filter((k) => TX(k, 'NODETYPE') === 'EV'); const foot = evs[2]; if (!foot) continue;
    for (const f of kidsOf(foot)) {
      const fo = K1(f, 'sf:OBJ')?.children[0]; if (fo?.name !== 'sf:SECTION' || TX(fo, 'SECTTYPE') !== 'F') continue;
      if (conds(f).length && !evalC(conds(f), get)) continue;
      for (const row of kidsOf(f)) {
        if (TX(row, 'NODETYPE') !== 'SE') continue;
        const ro = K1(row, 'sf:OBJ')?.children[0]; if (conds(row).length && !evalC(conds(row), get)) continue;
        const cells = kidsOf(row).filter((k) => TX(k, 'NODETYPE') === 'SE');
        if (cells.length === 1) out.title = liveText(cells[0], french, get);
        else out.terms.push([liveText(cells[1], french, get), liveText(cells[3], french, get)]);
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------- run
const TYPES = ['ZPOC', 'ZPOR', 'ZPOT', 'ZPOI', 'ZPOL', 'ZPOS', 'YCAP', 'YRAW', 'ZIMP', 'ZLOC', 'ZPIC', 'ZZZZ'];
let n = 0; const bad = [];
for (const v_bsart of TYPES) for (const v_flag of ['X', 'Y']) for (const gv_langu of ['E', 'F']) {
  n += 1;
  const env = { v_bsart, v_flag, gv_langu, gv_term1_zpos: '<STANDARD TEXT>' };
  const a = run(env); const e = expected(env);
  const norm = (s) => String(s).replace(/\s+/g, ' ').trim();
  if (norm(a.title) !== norm(e.title)) bad.push(`${v_bsart}/${v_flag}/${gv_langu}: title "${norm(a.title).slice(0, 50)}" expected "${norm(e.title).slice(0, 50)}"`);
  if (a.terms.length !== e.terms.length) bad.push(`${v_bsart}/${v_flag}/${gv_langu}: ${a.terms.length} terms, legacy prints ${e.terms.length}`);
  else a.terms.forEach((t, i) => { if (norm(t[0]) !== norm(e.terms[i][0]) || t[1] !== e.terms[i][1]) bad.push(`${v_bsart}/${v_flag}/${gv_langu}: term ${i + 1} differs: "${norm(t[1]).slice(0, 40)}" vs "${norm(e.terms[i][1]).slice(0, 40)}"`); });
}
console.log(`${n} environments (order type x flag x language), generated ABAP vs legacy export`);
for (const b of bad.slice(0, 30)) console.log('DIFF', b);
console.log(bad.length ? `RESULT: ${bad.length} difference(s)` : 'RESULT: OK - the terms ABAP produces exactly the terms the legacy form prints');
process.exit(bad.length ? 1 : 0);
