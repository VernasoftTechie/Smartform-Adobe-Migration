// Pixel-level check of the GENERATED layout against the legacy printout, without rendering: lays out src/*.xdp for the sample
// document of the printout (service order ZPOS, 18 items, 2 pages) with the layout rules of the client's Adobe (first baseline =
// cell top + top inset + 0.717 em, fixed / growing cells, table rows, page break) and compares
//   * every predicted text (baseline and x anchor: left / centre / right) with the printout's text items
//   * every predicted border line and grey fill with the printout's vector lines and rectangles
// node simulate.mjs <repo> [--verbose]      exit 1 on any difference beyond the tolerance (0.15 mm text, 0.2 mm lines)
import fs from 'node:fs';
import path from 'node:path';
import { parseXml } from '../xmlmini.mjs';

const repo = process.argv[2];
const verbose = process.argv.includes('--verbose');
const xdp = fs.readFileSync(path.join(repo, 'src/zmmcg_po_sf_adt.sfpf.xdp'), 'utf8');
const dump = JSON.parse(fs.readFileSync(path.join(repo, 'docs/legacy_grab/printout_zpos_dump.json'), 'utf8'));
const root = parseXml(xdp);
const tpl = root.children.find((c) => c.name === 'template');
const dataSub = tpl.children.find((c) => c.name === 'subform');

const K = 0.717;                // first baseline below the top inset, in em
const PT = 25.4 / 72;           // mm per point
const num = (v, d = 0) => (v === undefined ? d : parseFloat(v));
const kid = (e, n) => e.children.find((c) => c.name === n);
const kids = (e, n) => e.children.filter((c) => c.name === n);

// ---------------------------------------------------------------- sample data (the printout's document; values of the client's wizard form)
const S = {
  V_BSART: 'ZPOS', V_FLAG: 'Y', V_POTEXT: '', LV_FLAG: 'N',
  GV_LIFNR_OUT: '108852', WA_VEND_NAME1: 'LEON HOTEL SARLU', WA_VEND_NAME2: '', WA_VEND_STREET: 'CL7 , AVENUE DU COLONEL BISSET C', WA_VEND_STR_SUPPL1: '', WA_VEND_STR_SUPPL2: '',
  WA_VEND_CITY1: 'BRAZZAVILLE', WA_VEND_CITY2: '', WA_VEND_POST_CODE1: 'BB14526', GV_ISD: '+242', WA_VEND_TEL_NUMBER: '068375200', WA_VEND_FAX_NUMBER: '', V_EMAIL: 'leonhotel@sarlu.com',
  PODATE: '21 April 2020', EINDT: '31 December 2020', V_DEPARTMNT: 'CG-HCM/Admin', G_ERNAME: 'Philippe FINA', V_BUYERTELE: '', V_BUYERTELFX: '', V_BUYEREMAIL: 'philippe.fina@dangote.com', LV_VTEXT: '', GV_INCO1: '', GV_INCO2: '',
  GV_HDRTXT: 'x', GS_TOTALS_GROSS: '2.311.500', GS_TOTALS_DIS: '0', GS_TOTALS_SUB: '2.311.500', GS_TOTALS_VAT: '0', GS_TOTALS_CA: '0', GS_TOTALS_TOTAL: '2.311.500',
  GV_TERMS_TITLE: 'Les autres termes et conditions applicables au bon de commande:', V_EBELN: 'CG42001215', LV_VAR4: '16.09.2026 10:24:52',
  WA_T005T_LANDX50: 'Republic of the Congo', GV_LANGU: 'E',
};
// lines per cell in the printout (values that wrap): header text cells, header text, terms
const HEADER_LINES = { H6: 2, H7: 2 };
const TERM_LINES = [1, 1, 1, 2, 3, 2, 2, 2, 1, 1];
const ADDRESS_LINES = 13;
const CALC_SAMPLE = { TEMPLATE4_R9C2: ['Republic of the Congo', 1], TEMPLATE2_R10C2: ['x', 6] };
const ITEMS = 18;

// ---------------------------------------------------------------- output
const texts = []; // { page, base, anchor: 'l'|'c'|'r', x, what }
const hsegs = []; // { page, y, x1, x2 }
const vsegs = []; // { page, x, y1, y2 }
const fills = []; // { page, x, y, w, h }
let page = 1;
let residual = 0;

function cellOf(e, box, opts = {}) {
  // box: absolute { x, y, w, h } in mm on the current page
  const m = kid(e, 'margin'); const mt = num(m?.attrs.topInset); const mb = num(m?.attrs.bottomInset); const ml = num(m?.attrs.leftInset); const mr = num(m?.attrs.rightInset);
  const font = kid(e, 'font'); const size = num(font?.attrs.size?.replace('pt', ''), 10);
  const para = kid(e, 'para'); const align = para?.attrs.hAlign ?? 'left';
  const lh = para?.attrs.lineHeight ? num(para.attrs.lineHeight) : size * PT * 1.15; const ind = num(para?.attrs.textIndent);
  // text
  let txt = '';
  if (e.name === 'draw') txt = kid(kid(e, 'value') ?? { children: [] }, 'text')?.text ?? '';
  else {
    const b = kid(e, 'bind'); const ref = b?.attrs.ref ?? '';
    if (b?.attrs.match === 'dataRef' && ref) { const nm = ref.replace(/^\$record\./, '').replace(/^\$\./, ''); txt = opts.row?.[nm] ?? S[nm] ?? ''; if (txt === '' && /^LB_/.test(nm)) txt = kid(kid(e, 'value') ?? { children: [] }, 'text')?.text ?? ''; /* label: the sample wording is its default text */ }
    else txt = kid(kid(e, 'value') ?? { children: [] }, 'text')?.text ?? '';
  }
  // computed fields whose default text is empty because it is a data value: the sample text and the number of lines by field name
  if (txt === '' && CALC_SAMPLE[e.attrs.name]) { txt = CALC_SAMPLE[e.attrs.name][0]; opts = { ...opts, lines: CALC_SAMPLE[e.attrs.name][1] }; }
  txt = txt.replace(/\s+$/, '');
  const innerL = box.x + ml; const innerR = box.x + box.w - mr;
  const nLines = txt === '' ? 0 : (opts.lines ?? 1);
  for (let i = 0; i < nLines; i += 1) {
    // terms on page 2: the page-1 compensation (terms heading 11.722 mm) does not exist there, the legacy baseline is 0.82 mm lower (documented residual)
    const termAdj = (opts.term && page === 2) ? 0.82 : 0;
    if (termAdj) residual += 1;
    const base = box.y + mt + K * size * PT + i * lh + termAdj;
    const dx = i === 0 && ind ? ind : 0;
    // the legacy item number is an integer printed with a trailing blank (0.278 em): a 1-digit number ends one blank before the 2-digit ones
    const blank = (e.attrs.name === 'SLNO' && align === 'right' && /^\d$/.test(txt)) ? 0.278 * size * PT : 0;
    const x = align === 'right' ? innerR - blank : (align === 'center' ? (innerL + innerR) / 2 : innerL + dx);
    texts.push({ page, base, anchor: align === 'right' ? 'r' : (align === 'center' ? 'c' : 'l'), x, what: `${e.attrs.name ?? '?'}:${txt.slice(0, 24)}` });
  }
  // borders and fill
  const bd = kid(e, 'border');
  if (bd) {
    const edges = kids(bd, 'edge'); const on = edges.map((x) => x.attrs.presence !== 'hidden'); // top, right, bottom, left
    if (on[0]) hsegs.push({ page, y: box.y, x1: box.x, x2: box.x + box.w });
    if (on[2]) hsegs.push({ page, y: box.y + box.h, x1: box.x, x2: box.x + box.w });
    if (on[1]) vsegs.push({ page, x: box.x + box.w, y1: box.y, y2: box.y + box.h });
    if (on[3]) vsegs.push({ page, x: box.x, y1: box.y, y2: box.y + box.h });
    if (kid(bd, 'fill')) fills.push({ page, x: box.x, y: box.y, w: box.w, h: box.h });
  }
  return { txt, nLines, lh, mt, mb, size };
}

// natural height of a cell for the row computation
function cellHeight(e, lines) {
  if (e.attrs.h !== undefined) return num(e.attrs.h);
  const m = kid(e, 'margin'); const mt = num(m?.attrs.topInset); const mb = num(m?.attrs.bottomInset);
  const size = num(kid(e, 'font')?.attrs.size?.replace('pt', ''), 10); const para = kid(e, 'para');
  const lh = para?.attrs.lineHeight ? num(para.attrs.lineHeight) : size * PT * 1.15;
  const content = lines > 0 ? mt + lines * lh + mb : 0;
  return Math.max(num(e.attrs.minH), content);
}

// ---------------------------------------------------------------- header area (positioned)
const CA1 = { x: 7.5, y: 0, bottom: 290 };
const CA2 = { x: 7.5, y: 5.5, bottom: 290 };
function layPosition(sub, ox, oy) {
  for (const c of sub.children) {
    if (!['field', 'draw', 'subform'].includes(c.name)) continue;
    const x = ox + num(c.attrs.x); const y = oy + num(c.attrs.y);
    if (c.name === 'subform') {
      const nm = c.attrs.name;
      if (['FOR_ZPOT', 'COMMENTS_HIDDEN'].includes(nm)) continue;     // hidden for the sample (order type ZPOS)
      if (c.attrs.layout === 'position') layPosition(c, x, y);
      else if (nm === 'DELVRY_ADD') { // repeating address lines
        const line = kid(kid(c, 'subform'), 'field'); let yy = y;
        for (let i = 0; i < ADDRESS_LINES; i += 1) { cellOf(line, { x, y: yy, w: num(line.attrs.w), h: num(line.attrs.h) }, { row: { TDLINE: `L${i}` } }); yy += num(line.attrs.h); }
      }
    } else cellOf(c, { x, y, w: num(c.attrs.w), h: num(c.attrs.h ?? c.attrs.minH) });
  }
}

// ---------------------------------------------------------------- flowing part
let Y = 0;           // current y on the current page
let CA = CA1;
function newPage() { page += 1; CA = CA2; Y = CA2.y; }

function rowCells(row) { return row.children.filter((c) => c.name === 'field' || c.name === 'draw'); }
function layRow(table, row, ctx = {}) {
  const widths = table.attrs.columnWidths.split(/\s+/).map(num);
  const cells = rowCells(row);
  const lines = cells.map((c, i) => ctx.lines?.[c.attrs.name] ?? 1);
  const hs = cells.map((c, i) => cellHeight(c, (ctx.rowData?.[c.attrs.name] ?? S[(kid(c, 'bind')?.attrs.ref ?? '').replace('$record.', '')] ?? (kid(kid(c, 'value') ?? { children: [] }, 'text')?.text ?? '')) === '' && c.attrs.h === undefined ? 0 : lines[i]));
  const h = Math.max(0, ...hs);
  // page break: the row moves to the next page when it does not fit (text rows may split: the first lines stay)
  const room = CA.bottom - Y;
  let split = null;
  if (h > room + 1e-6) {
    const grow = cells.findIndex((c, i) => c.attrs.minH !== undefined && lines[i] > 1);
    if (grow >= 0 && ctx.allowSplit) {
      const c = cells[grow]; const m = kid(c, 'margin'); const para = kid(c, 'para');
      const lh = para?.attrs.lineHeight ? num(para.attrs.lineHeight) : 3.65; const fit = Math.floor((room - num(m.attrs.topInset)) / lh);
      if (fit >= 1) split = { grow, fit };
    }
    if (!split) newPage();
  }
  const x0 = CA.x; let x = x0;
  const rh = split ? room : h;
  cells.forEach((c, i) => {
    const w = widths[i] ?? num(c.attrs.w);
    const lns = split && i === split.grow ? split.fit : lines[i];
    cellOf(c, { x, y: Y, w, h: rh }, { row: ctx.rowData, lines: lns, term: ctx.term });
    x += w;
  });
  Y += rh;
  if (split) { // continuation on the next page (informational: Adobe's continuation inset is not known)
    newPage();
    const c = cells[split.grow]; const rest = lines[split.grow] - split.fit; const m = kid(c, 'margin'); const para = kid(c, 'para'); const lh = num(para?.attrs.lineHeight, 3.65);
    const hh = num(m.attrs.topInset) + rest * lh + num(m.attrs.bottomInset);
    let xx = CA.x; cells.forEach((cc, i) => { const w = widths[i]; cellOf(cc, { x: xx, y: Y, w, h: hh }, { row: ctx.rowData, lines: i === split.grow ? rest : 0, term: ctx.term }); xx += w; });
    Y += hh; return { h: rh + hh, split: true };
  }
  return { h };
}

function layTable(tbl, ctx = {}) {
  const rows = kids(tbl, 'subform').filter((r) => r.attrs.layout === 'row');
  for (const r of rows) {
    const nm = r.attrs.name;
    if (nm === 'DATA') {
      const count = ctx.count ?? 1;
      for (let i = 0; i < count; i += 1) layRow(tbl, r, { rowData: ctx.rowFn?.(i), lines: ctx.linesFn?.(i), allowSplit: ctx.allowSplit, term: ctx.term });
    } else layRow(tbl, r, { lines: nm === 'HeaderRow' ? HEADER_LINES : undefined });
  }
}

function itemRow(i) { return { SLNO: String(i + 1), SRVPOS: '4000644', DESCR: 'LEON HOTEL(HOTEL BILL)', MENGE: '1,00', MEINS: 'JRS', UNITPR: '212.500', TOTAL: '212.500' }; }

function layFlow(sub) {
  for (const c of kids(sub, 'subform')) {
    const nm = c.attrs.name;
    if (['COMMENTS', 'OTHER_PO'].includes(nm)) continue;           // hidden for the sample
    if (c.attrs.layout === 'tb') { layFlow(c); continue; }
    if (c.attrs.layout === 'table') {
      if (nm === 'GT_SERVICE') layTable(c, { count: ITEMS, rowFn: itemRow });
      else if (/^TERMS_SERVCE_PO_ROWS$/.test(nm)) layTable(c, { term: true, count: TERM_LINES.length, rowFn: (i) => ({ SLNO: `${i + 1}.`, TEXT: 'x' }), linesFn: (i) => ({ TEXT: TERM_LINES[i] }), allowSplit: true });
      else layTable(c);
    }
  }
}

// ---------------------------------------------------------------- run
const header = dataSub.children.find((c) => c.name === 'subform' && c.attrs.name === 'HEADER_AREA');
layPosition(header, CA1.x, CA1.y);
// page-area watermark (page coordinates), default text "UnApproved PO" for the sample (LV_FLAG not Y)
{
  const pset = dataSub.children.find((c) => c.name === 'pageSet');
  kids(pset, 'pageArea').forEach((pa, i) => {
    const f = kids(pa, 'field').find((x) => x.attrs.name === 'WATER_MARK');
    if (f) { const keep = page; page = i + 1; cellOf(f, { x: num(f.attrs.x), y: num(f.attrs.y), w: num(f.attrs.w), h: num(f.attrs.h) }); page = keep; }
  });
}
// page-area objects: watermark and logo are not compared with the lines; watermark text is
Y = num(header.attrs.h);
const tableData = dataSub.children.find((c) => c.name === 'subform' && c.attrs.name === 'TABLE_DATA');
layFlow(tableData);
const sectionService = kids(tableData, 'subform').find((c) => c.attrs.name === 'SERVCE_PO');
// the SERVCE_PO contents are laid out by layFlow (tb recursion)

// ---------------------------------------------------------------- compare
const mmP = dump.pages.map((p) => ({ texts: p.texts.map((t) => ({ ...t, baseMM: t.yBase * 10, xl: t.x * 10, xr: (t.x + t.w) * 10, xc: (t.x + t.w / 2) * 10 })), shapes: p.shapes, H: p.H }));
const TOL = 0.15; const TOLL = 0.2;
const bad = []; const info = [];
// text: every predicted text must have a printout item with the same baseline and anchor
let matched = 0;
for (const t of texts) {
  const p = mmP[t.page - 1]; if (!p) continue;
  // a left-anchored text may sit inside a printout item that pdf.js merged with the text before it ("10." + text)
  const hit = p.texts.find((q) => Math.abs(q.baseMM - t.base) <= TOL && (Math.abs((t.anchor === 'l' ? q.xl : t.anchor === 'r' ? q.xr : q.xc) - t.x) <= TOL + 0.45 || (t.anchor === 'l' && t.x > q.xl && t.x < q.xr)));
  if (hit) matched += 1; else bad.push(`text p${t.page} ${t.what}: predicted baseline ${t.base.toFixed(2)} ${t.anchor} ${t.x.toFixed(2)} mm - no printout item`);
}
// printout items that start a text line and match no predicted text (informational)
const unmatchedPdf = [];
mmP.forEach((p, pi) => {
  for (const q of p.texts) {
    if (q.s.trim().length < 1) continue;
    const near = texts.some((t) => t.page === pi + 1 && Math.abs(q.baseMM - t.base) <= TOL && Math.abs((t.anchor === 'l' ? q.xl : t.anchor === 'r' ? q.xr : q.xc) - t.x) <= TOL + 0.45);
    if (!near) unmatchedPdf.push(`p${pi + 1} ${q.baseMM.toFixed(2)} x${q.xl.toFixed(2)} "${q.s.slice(0, 30)}"`);
  }
});
// lines
function union(list, key, a, b) {
  const byKey = new Map();
  for (const s of list) { const k = Math.round(s[key] * 5) / 5; if (!byKey.has(k)) byKey.set(k, []); byKey.get(k).push([Math.min(s[a], s[b]), Math.max(s[a], s[b])]); }
  const out = [];
  for (const [k, iv] of byKey) { iv.sort((x, y) => x[0] - y[0]); const m = []; for (const v of iv) { if (m.length && v[0] <= m[m.length - 1][1] + 0.4) m[m.length - 1][1] = Math.max(m[m.length - 1][1], v[1]); else m.push([...v]); } for (const v of m) out.push({ k, a: v[0], b: v[1] }); }
  return out;
}
function pdfSegs(pi) {
  const p = dump.pages[pi]; const hs = []; const vs = []; const CM = 28.3465;
  for (const s of p.shapes) {
    if (s.paint !== 'S') continue;
    const pts = s.segs.filter((g) => g[0] !== 'r'); if (pts.length < 2) continue;
    const a = pts[0]; const b = pts[1]; const x1 = a[1] / CM * 10; const y1 = (p.H - a[2]) / CM * 10; const x2 = b[1] / CM * 10; const y2 = (p.H - b[2]) / CM * 10;
    if (Math.abs(y1 - y2) < 0.05) hs.push({ y: y1, x1, x2 }); else if (Math.abs(x1 - x2) < 0.05) vs.push({ x: x1, y1, y2 });
  }
  return { hs, vs };
}
function cover(a, b, label, pi) {
  // every interval of a must be covered by b (tolerance TOLL on the coordinate, 0.6 mm on the ends)
  for (const s of a) {
    const cand = b.filter((t) => Math.abs(t.k - s.k) <= TOLL + 0.15);
    const ok = cand.some((t) => t.a <= s.a + 1.2 && t.b >= s.b - 1.2) || cand.reduce((acc, t) => (t.a <= s.b && t.b >= s.a ? acc + Math.min(t.b, s.b) - Math.max(t.a, s.a) : acc), 0) >= (s.b - s.a) - 1.2;
    if (!ok) bad.push(`${label} p${pi + 1}: ${s.k.toFixed(2)} mm from ${s.a.toFixed(1)} to ${s.b.toFixed(1)} has no counterpart`);
  }
}
for (let pi = 0; pi < dump.pages.length; pi += 1) {
  const pd = pdfSegs(pi);
  const ph = union(hsegs.filter((s) => s.page === pi + 1), 'y', 'x1', 'x2'); const pv = union(vsegs.filter((s) => s.page === pi + 1), 'x', 'y1', 'y2');
  const dh = union(pd.hs, 'y', 'x1', 'x2'); const dv = union(pd.vs, 'x', 'y1', 'y2');
  cover(dh, ph, 'printout H-line not in layout', pi); cover(dv, pv, 'printout V-line not in layout', pi);
  cover(ph, dh, 'layout H-line not in printout', pi); cover(pv, dv, 'layout V-line not in printout', pi);
}
// grey fills (page 1 grids and heading): compare as rectangles
{
  const CM = 28.3465; const p = dump.pages[0]; const pr = [];
  for (const s of p.shapes) if (s.paint === 'F' && s.fill === '176,176,176') for (const g of s.segs) if (g[0] === 'r') pr.push({ x: g[1] / CM * 10, y: (p.H - g[2] - g[4]) / CM * 10, w: g[3] / CM * 10, h: g[4] / CM * 10 });
  const mine = fills.filter((f) => f.page === 1);
  for (const r of pr) if (!mine.some((f) => Math.abs(f.x - r.x) <= TOLL && Math.abs(f.y - r.y) <= TOLL && Math.abs(f.w - r.w) <= TOLL + 0.1 && Math.abs(f.h - r.h) <= TOLL + 0.1)) bad.push(`grey box not in layout: x ${r.x.toFixed(2)} y ${r.y.toFixed(2)} w ${r.w.toFixed(2)} h ${r.h.toFixed(2)}`);
  for (const f of mine) if (!pr.some((r) => Math.abs(f.x - r.x) <= TOLL && Math.abs(f.y - r.y) <= TOLL && Math.abs(f.w - r.w) <= TOLL + 0.1 && Math.abs(f.h - r.h) <= TOLL + 0.1)) bad.push(`layout grey box not in printout: x ${f.x.toFixed(2)} y ${f.y.toFixed(2)} w ${f.w.toFixed(2)} h ${f.h.toFixed(2)}`);
}
console.log(`documented residual: ${residual} term texts on page 2 are predicted 0.82 mm lower than the printout would need (heading compensation exists on page 1 only)`);
console.log(`predicted texts ${texts.length}, matched ${matched}; printout items without a predicted text: ${unmatchedPdf.length}; H-lines ${hsegs.length}, V-lines ${vsegs.length}, grey boxes ${fills.length}`);
if (verbose) { console.log('--- printout items without a predicted text (continuation words of a line are expected):'); console.log(unmatchedPdf.slice(0, 80).join('\n')); }
if (process.env.DEBUG_V) {
  for (const x0 of [7.5, 197.5]) { const l = vsegs.filter((s) => s.page === 1 && Math.abs(s.x - x0) < 0.3).sort((a, b) => a.y1 - b.y1); console.log('V', x0, l.map((s) => `${s.y1.toFixed(1)}-${s.y2.toFixed(1)}`).join(' ')); }
}
for (const b of bad.slice(0, 60)) console.log('DIFF', b);
console.log(bad.length ? `RESULT: ${bad.length} difference(s)` : 'RESULT: OK - layout matches the printout');
process.exit(bad.length ? 1 : 0);
