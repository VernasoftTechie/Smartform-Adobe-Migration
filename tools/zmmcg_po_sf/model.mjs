// Legacy Smart Form XML -> model with everything the layout needs (conditions, line/cell positions, line types,
// borders, E/F texts). Pure functions.
import fs from 'node:fs';
import { parseXml } from '../xmlmini.mjs';

const k = (e, n) => (e ? e.children.filter((c) => c.name === n) : []);
const k1 = (e, n) => k(e, n)[0];
const t = (e, n) => (k1(e, n)?.text ?? '').trim();
const raw = (e, n) => k1(e, n)?.text ?? '';
const OPS = { EQ: '=', NE: '<>', GT: '>', LT: '<', GE: '>=', LE: '<=' };

function condItems(condEl) {
  const c = condEl && k1(condEl, 'sf:CONDITION');
  return k(k1(c, 'COND'), 'item').map((i) => ({ lop: t(i, 'LOP'), op1: t(i, 'OP1'), cop: OPS[t(i, 'COP')] ?? t(i, 'COP'), op2: t(i, 'OP2') })).filter((i) => i.cop);
}
const unq = (s) => (/^'.*'$/.test(s) ? s.slice(1, -1) : s);

function borders(c) {
  return k(k1(c, 'BORDERS'), 'item').map((i) => ({
    l: parseFloat(t(i, 'LLEFT')) > 0, t: parseFloat(t(i, 'LTOP')) > 0, r: parseFloat(t(i, 'LRIGHT')) > 0, b: parseFloat(t(i, 'LBOTTOM')) > 0,
    fill: (() => { const f = k1(i, 'FILLCOLOR'); return f && t(f, 'USED') ? [t(f, 'RED'), t(f, 'GREEN'), t(f, 'BLUE')].map(Number) : null; })(),
  }));
}

export function loadModel(xmlPath) {
  const root = parseXml(fs.readFileSync(xmlPath, 'utf8'));
  const succ = (e) => k(k1(e, 'sf:SUCC'), 'sf:item').map((i) => k1(i, 'sf:NODE'));
  function build(n) {
    const holder = k1(n, 'sf:OBJ');
    const o = holder?.children[0];
    const out = { type: t(n, 'NODETYPE'), kind: o?.name.replace('sf:', ''), name: o ? t(k1(o, 'NAME'), 'INAME') : '', cond: condItems(k1(n, 'sf:COND')), children: [] };
    const oa = k1(k1(n, 'sf:OUTATTR'), 'sf:OUTATTR');
    if (oa) out.out = { lineNr: t(oa, 'T_LINENR'), cellNr: t(oa, 'T_CELLNR'), lineType: t(oa, 'T_LINETYPE') };
    if (o) {
      out.caption = t(o, 'CAPTION');
      if (out.kind === 'TEXT') {
        out.ttype = t(o, 'TTYPE');
        const tt = { E: [], F: [] };
        for (const i of k(k1(o, 'T_TEXT'), 'item')) { const s = t(i, 'SPRAS'); if (tt[s]) tt[s].push({ fmt: raw(i, 'TDFORMAT'), line: raw(i, 'TDLINE') }); }
        const master = k(k1(o, 'TEXT'), 'item').map((i) => ({ fmt: raw(i, 'TDFORMAT'), line: raw(i, 'TDLINE') }));
        if (!tt.E.length) tt.E = master;
        out.text = tt;
        if (out.ttype === 'I') { const tk = k1(o, 'TKEY'); out.include = { object: t(tk, 'OBJECT'), name: t(tk, 'NAME'), id: t(tk, 'ID'), lang: t(tk, 'LANG') }; }
      }
      if (out.kind === 'SECTION') {
        out.sect = { type: t(o, 'SECTTYPE'), tab: t(o, 'TABNAME'), wa: t(o, 'TABHEADER'), width: parseFloat(t(o, 'WIDTH')) || null, left: parseFloat(t(o, 'LEFT')) || 0, top: parseFloat(t(o, 'TOP')) || 0 };
        out.cells = k(k1(o, 'CELLS'), 'item').map((c) => ({ line: t(c, 'NAME'), col: parseInt(t(c, 'COLUMNNR'), 10), w: parseFloat(t(c, 'CWIDTH')), b: borders(c)[0] ?? { l: false, t: false, r: false, b: false, fill: null } }));
        // template line heights (STATLINES), mm per line number (1-based index - 1)
        out.lineH = [];
        for (const i of k(k1(o, 'STATLINES'), 'item')) {
          const f = (t(i, 'U_LHEIGHT') === 'CM' ? 10 : 1) * (parseFloat(t(i, 'LHEIGHT')) || 0);
          for (let n2 = parseInt(t(i, 'LINEFROM'), 10); n2 <= parseInt(t(i, 'LINETO'), 10); n2 += 1) out.lineH[n2 - 1] = f;
        }
        out.lineOrder =k(k1(o, 'DYNLINES'), 'item').map((i) => t(i, 'NAME'));
      }
      if (out.kind === 'WINDOW') out.wtype = t(o, 'WTYPE');
      if (out.kind === 'CODE') out.codeLines = k(k1(o, 'CODE'), 'item').map((i) => i.text);
    }
    if (oa && out.kind === 'WINDOW') {
      out.win = { left: parseFloat(t(oa, 'WLEFT')), top: parseFloat(t(oa, 'WTOP')), w: parseFloat(t(oa, 'WWIDTH')), h: parseFloat(t(oa, 'WHEIGHT')) };
      const b = k1(oa, 'BORDER');
      out.win.border = ['LEFTATTR', 'TOPATTR', 'RIGHTATTR', 'BOTTOMATTR'].map((x) => parseFloat(t(k1(b, x), 'THICKNESS')) > 0);
    }
    if (o) { const pc = k1(o, 'sf:PROC_CTRL'); const rc = pc && k1(pc, 'sf:NODE'); if (rc) for (const c of succ(rc)) out.children.push(build(c)); }
    for (const c of succ(n)) out.children.push(build(c));
    return out;
  }
  const page = k1(root, 'sf:PAGETREE') ?? (function find(e) { if (e.name === 'sf:PAGETREE') return e; for (const c of e.children) { const r = find(c); if (r) return r; } }(root));
  return build(k1(page, 'sf:NODE') ?? page.children[0]);
}

// ---- conditions ------------------------------------------------------------------------
// tri-state evaluation of constant sub-expressions: 'F' when the whole condition can never hold ("1 = 2", "2 = 3")
export function isDead(items) {
  if (!items.length) return false;
  const lit = (i) => {
    if (/^\d+$/.test(i.op1) && /^\d+$/.test(i.op2)) { const a = +i.op1; const b = +i.op2; return ({ '=': a === b, '<>': a !== b, '>': a > b, '<': a < b, '>=': a >= b, '<=': a <= b })[i.cop]; }
    return undefined;
  };
  // split into OR groups of AND terms
  const groups = [[]];
  items.forEach((i, ix) => { if (ix && i.lop === 'OR') groups.push([]); groups[groups.length - 1].push(i); });
  return groups.every((g) => g.some((i) => lit(i) === false));
}
export const liveItems = (items) => items.filter((i) => !(/^\d+$/.test(i.op1) && /^\d+$/.test(i.op2)));

// cumulative condition of a node = ancestors' + own (all AND-ed)
export function walkLive(node, fn, acc = [], path = []) {
  const own = node.cond;
  const here = [...acc, ...(own.length ? [own] : [])];
  if (own.length && isDead(own)) return; // permanently disabled branch
  fn(node, here, path);
  for (const c of node.children) walkLive(c, fn, here, [...path, node]);
}

export { unq };
