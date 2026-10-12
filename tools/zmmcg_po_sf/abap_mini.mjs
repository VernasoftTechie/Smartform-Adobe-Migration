// A small ABAP interpreter for the statements WE generate (terms_extra.abap, labels_extra.abap): IF / ELSEIF / ELSE / ENDIF, assignments,
// COND string( ... ) / COND #( ... ), string templates with { var } and { condense( var ) }, && chains, APPEND VALUE #( slno = .. text = .. ) TO gt_terms,
// CLEAR. Variables are case-insensitive; an unknown variable evaluates to the placeholder <NAME> so that data tokens stay visible in the result.
//   import { runAbap } from './abap_mini.mjs';   runAbap(sourceText, { v_bsart: 'ZPOS', ... }) -> { vars, terms, title }

function tokenize(text) {
  const T = []; let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === '*' && (i === 0 || text[i - 1] === '\n')) { while (i < text.length && text[i] !== '\n') i += 1; continue; }
    if (c === '"') { while (i < text.length && text[i] !== '\n') i += 1; continue; }
    if (/\s/.test(c)) { i += 1; continue; }
    if (c === '|') { // string template
      let j = i + 1; const parts = []; let lit = '';
      while (text[j] !== '|') {
        if (text[j] === '\\') { lit += text[j + 1]; j += 2; continue; }
        if (text[j] === '{') { if (lit) { parts.push({ lit }); lit = ''; } const e = text.indexOf('}', j); parts.push({ expr: text.slice(j + 1, e).trim() }); j = e + 1; continue; }
        lit += text[j]; j += 1;
      }
      if (lit) parts.push({ lit });
      T.push({ t: 'tpl', parts }); i = j + 1; continue;
    }
    if (c === "'") { let j = i + 1; let s = ''; while (!(text[j] === "'" && text[j + 1] !== "'")) { if (text[j] === "'") { s += "'"; j += 2; } else { s += text[j]; j += 1; } } T.push({ t: 'lit', v: s }); i = j + 1; continue; }
    if (/[A-Za-z_]/.test(c)) { let j = i; while (/[A-Za-z0-9_-]/.test(text[j] ?? '') || (text[j] === '=' && text[j + 1] === '>') || (text[j] === '>' && text[j - 1] === '=')) j += 1; T.push({ t: 'w', v: text.slice(i, j) }); i = j; continue; }
    if (text.startsWith('&&', i)) { T.push({ t: 'p', v: '&&' }); i += 2; continue; }
    if (text.startsWith('<>', i)) { T.push({ t: 'p', v: '<>' }); i += 2; continue; }
    T.push({ t: 'p', v: c }); i += 1;
  }
  return T;
}

export function runAbap(src, env) {
  const T = tokenize(src);
  let p = 0; const V = {}; for (const [k, v] of Object.entries(env)) V[k.toLowerCase()] = v; V.abap_true = 'X'; V.abap_false = '';
  const terms = []; let title = '';
  const get = (n) => { const k = n.toLowerCase(); return k in V ? V[k] : `<${n.toUpperCase()}>`; };
  const peek = () => T[p]; const eat = () => T[p++]; const isW = (w) => peek()?.t === 'w' && peek().v.toUpperCase() === w;
  const evalExpr = (e) => { const m = /^condense\(\s*([A-Za-z0-9_-]+)\s*\)$/i.exec(e); return m ? String(get(m[1])).replace(/\s+/g, ' ').trim() : String(get(e)); };
  function expr(exec) { let s = primary(exec); while (peek()?.v === '&&' && peek().t === 'p') { eat(); s += primary(exec); } return s; }
  function primary(exec) {
    const t = eat();
    if (t.t === 'tpl') return t.parts.map((x) => (x.lit !== undefined ? x.lit : evalExpr(x.expr))).join('');
    if (t.t === 'w') {
      if (t.v === 'cl_abap_char_utilities=>newline') return '\n';
      if (t.v.toUpperCase() === 'COND') {
        eat(); eat(); let result = ''; let done = false;
        while (!(peek().t === 'p' && peek().v === ')')) {
          if (isW('WHEN')) { eat(); const c = cond(); const take = c && !done; eat(); const v = expr(exec && take); if (take) { result = v; done = true; } } else if (isW('ELSE')) { eat(); const v = expr(exec && !done); if (!done) result = v; } else throw new Error(`COND: unexpected ${peek().v}`);
        }
        eat(); return result;
      }
      return String(get(t.v));
    }
    throw new Error(`primary ${t.v}`);
  }
  const operand = () => { const t = eat(); return t.t === 'lit' ? t.v : (t.t === 'w' ? (t.v.toLowerCase() === 'abap_true' ? 'X' : (t.v in V || t.v.toLowerCase() in V ? get(t.v) : `<${t.v.toUpperCase()}>`)) : t.v); };
  function cmpTerm() {
    if (peek().v === '(' && peek().t === 'p') { eat(); const r = cond(); eat(); return r; }
    const a = operand(); const op = eat().v; const b = operand(); const x = String(a).trim(); const y = String(b).trim();
    if (op === '=') return x === y; if (op === '<>') return x !== y;
    throw new Error(`operator ${op}`);
  }
  const condAnd = () => { let a = cmpTerm(); while (isW('AND')) { eat(); const b = cmpTerm(); a = a && b; } return a; };
  function cond() { let a = condAnd(); while (isW('OR')) { eat(); const b = condAnd(); a = a || b; } return a; }
  function boolCond() {
    eat(); eat(); eat(); let r = ''; let done = false;
    while (!(peek().t === 'p' && peek().v === ')')) {
      if (isW('WHEN')) { eat(); const c = cond(); eat(); const v = operand(); if (c && !done) { r = v; done = true; } } else if (isW('ELSE')) { eat(); const v = operand(); if (!done) r = v; } else throw new Error('boolCond');
    }
    eat(); return r === 'X' ? 'X' : '';
  }
  function skipStmts() {
    let depth = 0;
    while (p < T.length) {
      if (T[p].t === 'w' && T[p].v.toUpperCase() === 'IF') depth += 1;
      else if (T[p].t === 'w' && T[p].v.toUpperCase() === 'ENDIF') { if (depth === 0) return; depth -= 1; } else if (depth === 0 && T[p].t === 'w' && ['ELSEIF', 'ELSE'].includes(T[p].v.toUpperCase()) && T[p - 1]?.v === '.') return;
      p += 1;
    }
  }
  function stmts(exec) { while (p < T.length && !isW('ENDIF') && !isW('ELSEIF') && !isW('ELSE')) stmt(exec); }
  function stmt(exec) {
    if (isW('CLEAR')) { while (!(peek().t === 'p' && peek().v === '.')) p += 1; eat(); if (exec) { terms.length = 0; title = ''; } return; }
    if (isW('IF')) {
      eat(); let taken = false; const c = cond(); eat(); const r1 = exec && c; if (r1) taken = true;
      if (r1) stmts(true); else skipStmts();
      while (isW('ELSEIF')) { eat(); const c2 = cond(); eat(); const r = exec && !taken && c2; if (r) { taken = true; stmts(true); } else skipStmts(); }
      if (isW('ELSE')) { eat(); eat(); if (exec && !taken) stmts(true); else skipStmts(); }
      eat(); eat(); return;
    }
    if (isW('APPEND')) {
      eat(); eat(); eat(); eat(); eat(); eat(); const slno = expr(exec); eat(); eat(); const text = expr(exec); eat(); eat(); eat(); eat();
      if (exec) terms.push([slno, text]); return;
    }
    const target = eat().v; eat();
    if (isW('COND') && T[p + 1]?.v === '#') { const r = boolCond(); eat(); if (exec) V[target.toLowerCase()] = r; return; }
    const v = expr(exec); eat();
    if (exec) { if (target.toLowerCase() === 'gv_terms_title') title = v; else V[target.toLowerCase()] = v; }
  }
  stmts(true);
  return { vars: V, terms, title };
}
