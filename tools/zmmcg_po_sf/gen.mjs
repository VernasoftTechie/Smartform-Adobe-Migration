// ZMMCG_PO_SF_ADT layout generator - wizard-proven constructs (S08): flat $record binds, FormCalc calculate,
// default-visible + ready hide, XFA table layout with overflow leader, page-area watermark/logo/frame.
// All texts, conditions, widths and borders come from the legacy export (model.mjs).
//   node gen.mjs <repo>      writes src/zmmcg_po_sf_adt.sfpf.xdp (template + dataDescription) and docs/legacy_grab/zmmcg_po_sf_context_fields.json
import fs from 'node:fs';
import path from 'node:path';
import { loadModel, walkLive, isDead, liveItems } from './model.mjs';

const repo = process.argv[2];
const SCR = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const M = loadModel(path.join(repo, 'vernasofttechie-zmmcg_po_sf/zmmcg_po_sf.xml'));
const CONN = 'ZMMCG_PO_SF_ADT';
const mm = (cm) => `${Math.round(cm * 100) / 10}mm`; // cm -> mm string
const mmn = (v) => `${Math.round(v * 1000) / 1000}mm`;

// ------------------------------------------------------------------ used context fields
const USED = new Map();   // flat -> { field: 'WA_VEND-NAME1' }
const TABLES = new Map(); // table -> Set(columns)
const flatOf = (n) => n.toUpperCase().replace(/-/g, '_');
function useField(name) {
  const up = name.toUpperCase();
  const flat = flatOf(up);
  if (!USED.has(flat)) USED.set(flat, { field: up });
  return flat;
}
const useCol = (tbl, col) => { if (!TABLES.has(tbl)) TABLES.set(tbl, new Set()); TABLES.get(tbl).add(col); };
const rec = (flat) => `$record.${flat}.value`;

// ------------------------------------------------------------------ FormCalc helpers
const fcStr = (s) => `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
const X = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const FCOP = { '=': 'eq', '<>': 'ne', '>': 'gt', '<': 'lt', '>=': 'ge', '<=': 'le' };
function operand(o, ctx) {
  if (/^'.*'$/.test(o)) { const v = o.slice(1, -1); return fcStr(v.trim() === '' ? '' : v); }
  if (/^\d+$/.test(o)) return o;
  // legacy SY-LANGU in a condition is the LOGON language (the legacy printout shows English country / month
  // names on a French document); the print language `lg` only drives the static-text variants (see slot)
  if (o.toUpperCase() === 'SY-LANGU') return rec(useField('GV_LANGU'));
  const flat = useField(o);
  return rec(flat);
}
function fcCondOne(items, ctx) {
  const parts = [];
  items.forEach((i, ix) => {
    const blank = /^'\s*'$/.test(i.op2);
    let a = operand(i.op1, ctx);
    if (blank && a.startsWith('$record')) a = `Rtrim(${a})`;
    const e = `${a} ${FCOP[i.cop]} ${operand(i.op2, ctx)}`;
    parts.push((ix ? ` ${i.lop === 'OR' ? 'or' : 'and'} ` : '') + e);
  });
  return `(${parts.join('')})`;
}
// cumulative conditions (array of item arrays, AND-ed); constant true/false items dropped
function fcCond(condArrays, ctx) {
  const xs = condArrays.map((c) => liveItems(c)).filter((c) => c.length);
  if (!xs.length) return '';
  return xs.map((c) => fcCondOne(c, ctx)).join(' and ');
}
// text lines -> FormCalc expression
// legacy symbol -> field the Initialization prepared (output conversion)
const TOKMAP = { LV_LIFNR: 'GV_LIFNR_OUT' };
const TOKEN = /&([A-Za-z_][A-Za-z0-9_-]*)(\(([A-Za-z]+)\))?&/g;
function cleanTags(s) { return s.replace(/<\(>/g, '').replace(/<\)>/g, '').replace(/<\/>/g, '').replace(/<[A-Z]\d>/g, ''); }
function paragraphs(lines) {
  const ps = [];
  for (const { fmt, line } of lines) {
    if (/^\/\*/.test(fmt) || /^\/:/.test(fmt)) continue;
    if (ps.length && (fmt === ' ' || fmt === '')) ps[ps.length - 1] += ` ${line.trim()}`;
    else ps.push(line);
  }
  return ps;
}
function fcText(lines, ctx, opt = {}) {
  let ps = paragraphs(lines);
  if (opt.trim) ps = ps.map((p) => p.trim()).filter((p) => p !== ''); // heading: the wizard form has no blank lines, the vertical space is in the margin
  if (!ps.length || ps.every((p) => !p.trim())) return { expr: '""', tokens: 0, literal: '' };
  const pieces = [];
  let tokens = 0;
  ps.forEach((p, pi) => {
    if (pi) pieces.push('"\\u000a"');
    const s = cleanTags(p);
    let last = 0; let m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(s))) {
      if (m.index > last) pieces.push(fcStr(s.slice(last, m.index)));
      const flat = useField(TOKMAP[m[1].toUpperCase()] ?? m[1]);
      tokens++;
      pieces.push(m[3] && m[3].toUpperCase() === 'C' ? `Rtrim(Ltrim(${rec(flat)}))` : rec(flat));
      last = m.index + m[0].length;
    }
    if (last < s.length) pieces.push(fcStr(s.slice(last)));
  });
  const literal = tokens === 0 ? ps.map(cleanTags).join('\n') : null;
  return { expr: pieces.length === 1 ? pieces[0] : `Concat(${pieces.join(', ')})`, tokens, literal };
}

// ------------------------------------------------------------------ slots: several legacy text nodes at one position
const PRE_LG = `var s = $record.V_BSART.value
var lg = "E"
if (s eq "ZPOL" or s eq "ZPOS" or (s ne "ZPOI" and $record.GV_LANGU.value eq "F")) then lg = "F" endif`;
function slot(nodes, opt = {}) {
  // nodes: [{node, conds}] -> { kind:'static'|'bind'|'calc', text?, ref?, script? }
  const live = nodes.filter((x) => x.node.kind === 'TEXT');
  if (!live.length) return { kind: 'empty' };
  const ctx = {};
  const variants = live.map(({ node, conds }) => {
    const c = fcCond(conds, ctx);
    let E; let F;
    if (node.ttype === 'I') {
      E = { expr: includeRef(node), tokens: 1, literal: null }; F = E;
    } else {
      E = fcText(node.text.E, ctx, opt);
      F = node.text.F.length ? fcText(node.text.F, ctx, opt) : E;
    }
    return { c, E, F, node };
  });
  // static single variant without condition and without tokens: plain text (E == F)
  if (variants.length === 1 && !variants[0].c && variants[0].E.literal !== null && variants[0].E.expr === variants[0].F.expr) return { kind: 'static', text: variants[0].E.literal, hasLine: paragraphs(variants[0].node.text.E).length > 0 };
  // single variant, no condition, single bound field and no literal text: direct bind
  if (variants.length === 1 && !variants[0].c && variants[0].E.expr.startsWith('$record.') && variants[0].E.expr === variants[0].F.expr && /^\$record\.[A-Z0-9_]+\.value$/.test(variants[0].E.expr)) {
    return { kind: 'bind', ref: variants[0].E.expr.replace(/^\$record\./, '').replace(/\.value$/, '') };
  }
  let body = '$ = ""\n';
  for (const v of variants) {
    const assign = v.E.expr === v.F.expr ? `$ = ${v.E.expr}` : `if (lg eq "F") then $ = ${v.F.expr} else $ = ${v.E.expr} endif`;
    body += v.c ? `if (${v.c}) then\n  ${assign}\nendif\n` : `${assign}\n`;
    if (v.E.expr !== v.F.expr || v.c.includes('lg')) ctx.lg = true;
  }
  const needS = ctx.lg;
  if (needS) { useField('V_BSART'); useField('GV_LANGU'); }
  const script = (needS ? `${PRE_LG}\n` : '') + body.trimEnd();
  return { kind: 'calc', script };
}
function includeRef(node) {
  const o = node.include;
  if (o.object === 'EKKO' && o.id === 'F01') return rec(useField('GV_HDRTXT'));
  if (o.name === 'ZMMCG_PO_TEXT') return rec(useField('GV_TERM1_ZPOS'));
  throw new Error(`unmapped include text ${o.object}/${o.name}/${o.id}`);
}

// ------------------------------------------------------------------ XML writer
const out = [];
let ind = 0;
const w = (s) => out.push(`${'  '.repeat(ind)}${s}`);
const open = (s) => { w(s); ind += 1; };
const close = (s) => { ind -= 1; w(s); };

const FONT = {
  reg: '<font size="9pt" typeface="Arial"/>',
  bold: '<font size="9pt" typeface="Arial" weight="bold"/>',
  big: '<font size="11pt" typeface="Arial" weight="bold"/>',
  title: '<font size="18pt" typeface="Arial" weight="bold"/>', // measured on the legacy printout (the wizard form has 28 pt)
};
// Margins / paragraphs of the client's wizard-generated form of THIS Smart Form (docs/legacy_grab/wizard_reference/ZMMCG_PO_SF_F.XDP),
// which reproduces the legacy printout: the first baseline of a line is at  top + topInset + 0.717 em  (9 pt: 2.28 mm), so a
// one-line cell whose legacy baseline is 3.40 mm below its top needs topInset 1.122 mm. Single-line cells have a FIXED height.
const mg = (t, b, l, r) => `<margin bottomInset="${b}mm" leftInset="${l}mm" rightInset="${r}mm" topInset="${t}mm"/>`;
const K_BASE = 0.717;                       // em: first baseline below the top inset (Arial)
const MARG = {
  grid: mg(1.122, 0, 0.7, 0),               // label and value cells of the grids, words row, closing rows (right inset 0: "Date de Bon de Cde." fills its cell)
  gridLast: mg(1.092, 0, 0.35, 0),          // multi-line value of the last PO_DETAIL row (header text)
  gridLastLbl: mg(1.092, 0, 0.7, 0),
  hdr: mg(1.122, 0, 0.3, 0.3),              // table heading cells
  cell: mg(1.122, 0, 0.7, 0),
  desc: mg(1.122, 0, 0.7, 0),
  center: mg(1.122, 0, 0, 0),
  slno: mg(1.122, 0, 0, 1.18),
  qty: mg(1.122, 0, 0, 0),
  price: mg(1.122, 0, 0, 1.28),
  totLbl: mg(1.022, 0, 0, 0.3),             // totals label (9 pt): baseline 3.30 mm below the row top
  totVal: mg(1.022, 0, 0, 1.18),
  bigLbl: mg(0.47, 0, 0, 0.3),              // 11 pt bold totals: baseline 0.717 em = 2.78 mm below the inset
  bigVal: mg(0.47, 0, 0, 1.38),
  termNo: mg(0.3, 0.51, 0.7, 0),            // terms: rows grow with their text; 0.3 + 3.39 + 0.51 = 4.2 mm per one-line row
  termTxt: '<margin bottomInset="0.51mm" leftInset="0.353mm" rightInset="0.8mm" topInset="0.3mm"/>',
  termHead: mg(4.422, 0, 1.18, 0),
};
const para = (h, lh, indent) => `<para hAlign="${h}"${lh ? ` lineHeight="${lh}"` : ''}${indent ? ` textIndent="${indent}"` : ''} vAlign="top"/>`;
const E1 = '<edge thickness="0.75pt"/>';
const E0 = '<edge presence="hidden"/>';
function border(b) {
  if (!b) return '';
  const edges = [b.t, b.r, b.b, b.l].map((on) => (on ? E1 : E0)).join('');
  const fill = b.fill ? `<fill><color value="${b.fill.join(',')}"/></fill>` : '';
  return `<border>${edges}${fill}</border>`;
}
const noB = { t: false, r: false, b: false, l: false, fill: null };
const bAll = { t: true, r: true, b: true, l: true, fill: null };
const GREY = [176, 176, 176];

const bindXml = (ref) => `<bind match="dataRef" ref="${ref}"/><connect connection="${CONN}" ref="$.${ref.replace(/^\$record\./, '').replace(/^\$\./, '')}" usage="importOnly"/>`;
const readyEvt = (script) => `<event activity="ready" name="event__ready" ref="$form"><script contentType="application/x-formcalc">${X(script)}</script></event>`;
const calc = (script) => `<calculate><script contentType="application/x-formcalc">${X(script)}</script></calculate><bind match="none"/>`;

const UI = (spec) => (spec.single ? '<ui><textEdit/></ui>' : '<ui><textEdit multiLine="1"><border presence="hidden"/><margin/></textEdit></ui>');
const textual = (c) => c.kind === 'calc' || c.kind === 'bind' || (c.kind === 'static' && c.text.trim() !== '');
// one visual cell. spec: { name, w (mm number) | x/y/h for position, content (slot), font, margin, para, b (border obj), minH, h }
function cellXml(spec) {
  const { kind } = spec.content;
  const attrs = [];
  const dim = `${spec.minH != null ? `minH="${mmn(spec.minH)}"` : ''}${spec.h != null ? `h="${mmn(spec.h)}"` : ''}`;
  const geo = spec.pos ? `x="${mmn(spec.pos.x)}" y="${mmn(spec.pos.y)}" w="${mmn(spec.w)}"` : `w="${mmn(spec.w)}"`;
  const common = `${spec.font}${spec.margin}${spec.para}${border(spec.b)}`;
  if (kind === 'static' || kind === 'empty') {
    const txt = kind === 'static' ? X(spec.content.text).replace(/\n/g, '&#10;') : '';
    w(`<draw ${dim} name="${spec.name}" ${geo}><ui><textEdit/></ui><value><text>${txt}</text></value>${common}</draw>`);
  } else if (kind === 'bind') {
    const col = spec.content.ref;
    w(`<field ${dim} name="${spec.name}" ${geo}>${UI(spec)}${common}${bindXml(`${spec.relative ? '$.' : '$record.'}${col}`)}</field>`);
  } else {
    w(`<field ${dim} name="${spec.name}" ${geo}>${UI(spec)}${common}${calc(spec.content.script)}</field>`);
  }
}

// ------------------------------------------------------------------ helpers over the legacy tree
function find(n, pred) { if (pred(n)) return n; for (const c of n.children) { const r = find(c, pred); if (r) return r; } return null; }
const byName = (name) => find(M, (n) => n.name === name);
const pages = M.children;
const page1 = pages[0];
const win = (name) => page1.children.find((c) => c.name === name);
function liveTexts(node, baseConds = []) {
  const res = [];
  walkLive(node, (n, here) => { if (n.kind === 'TEXT') res.push({ node: n, conds: here.slice(baseConds.length) }); });
  return res;
}
// text nodes below `node`, grouped by (lineNr, cellNr) - for templates; conditions relative to `node`
function templateSlots(tmpl) {
  const slots = new Map();
  for (const ch of tmpl.children) {
    if (ch.kind !== 'TEXT') continue;
    if (ch.cond.length && isDead(ch.cond)) continue;
    const key = `${parseInt(ch.out.lineNr, 10)}:${parseInt(ch.out.cellNr, 10)}`;
    if (!slots.has(key)) slots.set(key, []);
    slots.get(key).push({ node: ch, conds: ch.cond.length ? [ch.cond] : [] });
  }
  return slots;
}
const colWidthsOf = (sect) => {
  const cols = new Map();
  for (const c of sect.cells) if (!cols.has(c.col)) cols.set(c.col, c.w);
  return [...cols.keys()].sort((a, b) => a - b).map((k2) => cols.get(k2));
};
// line types in order of first appearance, each -> [cell,...]
function lineTypes(sect) {
  const m = new Map();
  for (const c of sect.cells) { if (!m.has(c.line)) m.set(c.line, []); m.get(c.line).push(c); }
  return m;
}
const fitL = (rowH, top) => `${Math.round((rowH - top) * 1000) / 1000}mm`; // line height that makes one line exactly rowH high
const ROW_PITCH = 4.692; // 13 grid rows = 61.0 mm on the printout (the export rounds to 4.70); wizard form: 4.692
const LAST_ROW = 21.769;  // last PO_DETAIL row (export 21.70): ends at 129.0 mm = 12.90 cm on the printout
const ROW_TXT = 4.2;      // one-line text row / words row (printout 4.2 mm)
const ROW_DATA = 4.183;   // item row (printout and wizard form 4.183 mm)
const ROW_BLANK = 3.4;    // blank text line (printout 3.4 mm)
const ROW_BIG = 4.35;     // 11 pt totals row (printout 4.3 / 4.4 alternating)
const CA1 = { x: 7.5, y: 9.3 }; // set below from the page-1 windows (mm)

// ------------------------------------------------------------------ geometry from the export
const live1 = page1.children.filter((c) => !c.cond.length || !isDead(c.cond));
const WIN = Object.fromEntries(live1.map((x) => [x.name, x.win]));
const p1 = { x0: Math.min(...live1.map((x) => x.win.left)), y0: Math.min(...live1.map((x) => x.win.top)), x1: Math.max(...live1.map((x) => x.win.left + x.win.w)), y1: Math.max(...live1.map((x) => x.win.top + x.win.h)) };
const mainWin = WIN.TABLE_DATA;
const p2win = pages[1].children.find((c) => c.win && c.win.h > 20).win;
const toMM = (cm) => Math.round(cm * 1000) / 100;
// page-1 content area of the client's wizard form of this Smart Form: the whole body (x 7.5, y 0, 202 x 290 mm); every header
// object then has the absolute coordinates of the legacy windows (x - 7.5 mm)
const CA1x = toMM(p1.x0); const CA1y = 0;
const CA1w = 202; const CA1h = 290;
const HDR_H = toMM(mainWin.top) - CA1y;
const relX = (cm) => toMM(cm) - CA1x;
const relY = (cm) => toMM(cm) - CA1y;

// ================================================================== build
const TBL_W = toMM(mainWin.w); // 190mm

function posSub(name, x, y, wd, h, body, extra = '') {
  open(`<subform h="${mmn(h)}" layout="position" name="${name}" w="${mmn(wd)}" x="${mmn(x)}" y="${mmn(y)}">`);
  body();
  if (extra) w(extra);
  w('<bind match="none"/>');
  close('</subform>');
}

// ---- grid window (SUPPLIER_ADD / PO_DETAIL): template sections as position grids
function gridSection(sect, name, x, y, cond, opts = {}) {
  const slots = templateSlots(sect);
  const widths = colWidthsOf(sect).map(toMM);
  const lts = [...lineTypes(sect).entries()];
  const nRows = Math.max(...[...slots.keys()].map((k2) => parseInt(k2.split(':')[0], 10)));
  const xs = widths.reduce((a, v) => { a.push(a.length ? a[a.length - 1] + widths[a.length - 1] : 0); return a; }, []);
  const total = widths.reduce((a, v) => a + v, 0);
  // row heights = the template's STATLINES of the export (4.70 mm, last row of PO_DETAIL 21.70 mm)
  const rowHs = Array.from({ length: nRows }, (_, i) => ((sect.lineH?.[i] ?? 0) > 10 ? LAST_ROW : ROW_PITCH));
  const rowY = rowHs.map((_, i) => rowHs.slice(0, i).reduce((a, v) => a + v, 0));
  const gridH = rowHs.reduce((a, v) => a + v, 0);
  const ctx = {};
  const hide = cond ? readyEvt(`if (not (${fcCond([cond], ctx)})) then $.presence = "hidden" endif`) : '';
  open(`<subform h="${mmn(gridH)}" layout="position" name="${name}" w="${mmn(total)}" x="${mmn(x)}" y="${mmn(y)}">`);
  for (let r = 1; r <= nRows; r += 1) {
    const cells = lts[r - 1]?.[1] ?? lts[lts.length - 1][1];
    const rowH = rowHs[r - 1];
    for (let c = 1; c <= widths.length; c += 1) {
      const cd = cells.find((q) => q.col === c);
      const content = slot(slots.get(`${r}:${c}`) ?? []);
      const isLabel = c === 1;
      const lastRow = rowH === LAST_ROW;
      const b = { ...(cd?.b ?? noB), fill: cd?.b.fill ?? null };
      cellXml({
        name: `${name}_R${r}C${c}`, w: widths[c - 1], h: rowH, pos: { x: xs[c - 1], y: rowY[r - 1] },
        content, font: isLabel ? FONT.bold : FONT.reg,
        margin: lastRow ? (isLabel ? MARG.gridLastLbl : MARG.gridLast) : MARG.grid, para: para('left', lastRow && !isLabel ? '3.4mm' : undefined), b, single: !lastRow,
      });
    }
  }
  if (hide) w(hide);
  w('<bind match="none"/>');
  close('</subform>');
}

function header() {
  open(`<subform h="${mmn(HDR_H)}" layout="position" name="HEADER_AREA" w="${mmn(CA1w)}">`);
  // ---- PO_HEADING (TEMPLATE3: line 1 title by order type, line 3 PO number)
  {
    // Legacy printout and the client's wizard form: both lines are 18 pt bold, centred on the template width (14.10 cm) from the
    // window left (1.87 cm); their baselines sit on the tops of template lines 1 and 3 (1.60 cm and 1.60 + 8.0 + 5.0 = 2.90 cm), i.e.
    // above the window top. First baseline = cell top + 0.717 em, so the cells are placed at baseline - 0.717 x 18 pt (11.445 / 24.445
    // mm in the wizard form) directly in the header area.
    const wd = WIN.PO_HEADING; const t3 = byName('%TEMPLATE3');
    const slots = templateSlots(t3);
    const drop = K_BASE * 18 * 25.4 / 72; // mm
    const tw = 141.0;
    const lh = t3.lineH; // 8.00 / 5.00 / 7.88 mm in the export
    for (const [r, nm] of [[1, 'HEADING'], [3, 'V_EBELN']]) {
      const base = toMM(wd.top) + lh.slice(0, r - 1).reduce((a2, v) => a2 + v, 0);
      const content = slot(slots.get(`${r}:1`) ?? []);
      cellXml({ name: nm, w: tw, h: 7, pos: { x: relX(wd.left), y: Math.round((base - drop - CA1y) * 1000) / 1000 }, content, font: FONT.title, margin: mg(0, 0, 0, 0), para: para('center'), b: null, single: true });
    }
  }
  // ---- DELVRY_ADD: plant address, one line per row of LT_ADRC (wizard form: repeating subform of 4.183 mm lines, no frame)
  {
    const wd = WIN.DELVRY_ADD;
    useCol('LT_ADRC', 'TDLINE');
    open(`<subform layout="tb" name="DELVRY_ADD" w="${mmn(toMM(wd.w) - 0.7)}" x="${mmn(relX(wd.left) + 0.7)}" y="${mmn(relY(wd.top) + 1.122)}">`);
    w(bindXml('$record.LT_ADRC'));
    open(`<subform layout="tb" name="DATA" w="${mmn(toMM(wd.w) - 0.7)}">`);
    w('<occur max="-1" min="0"/>');
    w(bindXml('$.DATA[*]').replace(/ref="$.DATA[*]" usage/, 'ref="$.DATA" usage'));
    cellXml({ name: 'LINE', w: toMM(wd.w) - 0.7, h: ROW_DATA, content: { kind: 'bind', ref: 'TDLINE' }, relative: true, font: FONT.reg, margin: mg(0, 0, 0, 0), para: para('left'), b: null, single: true });
    close('</subform>');
    close('</subform>');
  }
  // ---- SUPPLIER_ADD: FOR_ZPOT (stock transfer) and TEMPLATE4 (all other types)
  {
    const wd = WIN.SUPPLIER_ADD;
    const sec = win('SUPPLIER_ADD').children.filter((c) => c.kind === 'SECTION');
    const zpot = sec.find((c) => c.name === 'FOR_ZPOT'); const t4 = sec.find((c) => c.name === '%TEMPLATE4');
    const rows = 13; const gridH = rows * ROW_PITCH;
    open(`<subform h="${mmn(gridH)}" layout="position" name="SUPPLIER_ADD" w="${mmn(toMM(wd.w))}" x="${mmn(relX(wd.left))}" y="${mmn(relY(wd.top))}">`);
    gridSection(zpot, 'FOR_ZPOT', 0, 0, zpot.cond);
    gridSection(t4, 'TEMPLATE4', 0, 0, t4.cond);
    w('<bind match="none"/>');
    close('</subform>');
  }
  // ---- PO_LAST_CHANGED (wizard form: x 1.9 / y 37.522 = window position + 0.7 / 1.122 mm, 4.2 mm high)
  {
    const wd = WIN.PO_LAST_CHANGED;
    const tx = liveTexts(win('PO_LAST_CHANGED'))[0];
    const content = slot([tx]);
    open(`<subform h="${mmn(toMM(wd.h))}" layout="position" name="PO_LAST_CHANGED" w="${mmn(toMM(wd.w))}" x="${mmn(relX(wd.left))}" y="${mmn(relY(wd.top))}">`);
    cellXml({ name: 'LAST_CHANGED', w: toMM(wd.w), h: 4.2 + 1.122, pos: { x: 0, y: 0 }, content, font: FONT.reg, margin: MARG.grid, para: para('left'), b: null, single: true });
    w('<bind match="none"/>');
    close('</subform>');
  }
  // ---- PO_DETAIL (TEMPLATE2); last row (Additional Comments) fills the space down to the table
  {
    const wd = WIN.PO_DETAIL; const t2 = byName('%TEMPLATE2');
    // line heights of TEMPLATE2 in the export: 9 x 4.70 mm and the last line (header text) 21.70 mm (legacy printout: ends 12.90 cm)
    const gridH = t2.lineH.reduce((a, v) => a + v, 0);
    open(`<subform h="${mmn(gridH)}" layout="position" name="PO_DETAIL" w="${mmn(toMM(wd.w))}" x="${mmn(relX(wd.left))}" y="${mmn(relY(wd.top))}">`);
    gridSection(t2, 'TEMPLATE2', 0, 0, null);
    w('<bind match="none"/>');
    close('</subform>');
  }
  w('<bind match="none"/>');
  close('</subform>');
}

// ---- tables ------------------------------------------------------------------------------
function tableOpen(name, widthsMm) { open(`<subform columnWidths="${widthsMm.map(mmn).join(' ')}" layout="table" name="${name}">`); }
function rowOpen(name, kind, extra = '') { open(`<subform layout="row" name="${name}">`); w(`<assist role="${kind}"/>`); if (extra) w(extra); }

// one-row table made of a legacy section row (R) with cells from its line type
function sectionRow(tblName, rowSect, tableSect, opts = {}) {
  const lts = lineTypes(tableSect);
  const lt = rowSect.out?.lineType;
  const cells = lts.get(lt);
  if (!cells) throw new Error(`line type ${lt} not found for ${rowSect.name}`);
  const widths = cells.map((c) => toMM(c.w));
  const colSects = rowSect.children.filter((c) => c.kind === 'SECTION');
  const rowConds = rowSect.cond.length ? [rowSect.cond] : [];
  const ctx = {};
  const contents = cells.map((cd, i) => {
    const cs = colSects[i];
    const nodes = cs ? liveTexts(cs).map((tx) => ({ node: tx.node, conds: tx.conds })) : [];
    return nodes.length ? slot(nodes) : { kind: 'empty' };
  });
  const rowTextual = contents.some(textual);
  tableOpen(tblName, widths);
  rowOpen('Row1', 'TR');
  cells.forEach((cd, i) => {
    const content = contents[i];
    const isVal = opts.valueCol === i;
    // text row: grows with its text; the line height is fitted so that ONE line is exactly ROW_TXT high (inset 1.122 + line 3.078)
    const dim = textual(content) ? { minH: opts.minH ?? ROW_TXT } : (content.kind === 'static' && content.hasLine ? { h: ROW_BLANK } : (rowTextual ? { minH: 0 } : { h: 0 }));
    cellXml({
      name: `C${i + 1}`, w: widths[i], ...dim, content,
      font: opts.font ?? FONT.reg, margin: opts.margin ?? MARG.cell, para: para(isVal || opts.rightCols?.includes(i) ? 'right' : 'left', textual(content) ? fitL(dim.minH, 1.122) : undefined), b: dim.h === 0 ? null : cd.b, // a legacy row without printable text has no height and prints no border
    });
  });
  w('<bind match="none"/>');
  close('</subform>');
  const cond = fcCond(rowConds, ctx);
  if (cond) w(readyEvt(`if (not (${cond})) then $.presence = "hidden" endif`));
  w('<bind match="none"/>');
  close('</subform>');
}

// ---- main flow
function eventRows(tableSect, evType) {
  const ev = tableSect.children.find((c) => c.kind === 'EVENT' && c.evType === evType);
  return ev;
}
function buildItemTable(tblNode, kind) {
  const goods = kind === 'goods';
  const tableName = goods ? 'IT_EKPO' : 'IT_ESLL';
  const gtName = goods ? 'GT_GOODS' : 'GT_SERVICE';
  const lts = lineTypes(tblNode);
  const hdr = lts.get('HEADER'); const itm = lts.get('ITEM');
  const widths = hdr.map((c) => toMM(c.w));
  const evs = tblNode.children.filter((c) => c.type === 'EV');
  const headRow = evs[0].children.find((c) => c.kind === 'SECTION' && !(c.cond.length && isDead(c.cond)));
  const footEv = evs[2];
  tableOpen(gtName, widths);
  // header row (repeats on every page)
  rowOpen('HeaderRow', 'TH', '');
  const colSects = headRow.children.filter((c) => c.kind === 'SECTION');
  hdr.forEach((cd, i) => {
    const nodes = liveTexts(colSects[i]).map((tx) => ({ node: tx.node, conds: tx.conds }));
    const content = slot(nodes);
    cellXml({ name: `H${i + 1}`, w: widths[i], h: 7.6, content, font: FONT.bold, margin: MARG.hdr, para: para('center', '3.4mm'), b: { ...cd.b, fill: GREY } });
  });
  w('<occur max="-1"/>');
  w('<bind match="none"/>');
  close('</subform>');
  // data row
  // columns: legacy alignments (wizard form: item no. right, code / quantity / unit centred, description left, prices right)
  const colSpec = (c3) => [['SLNO', 'right', MARG.slno], [c3, 'center', MARG.center], ['DESCR', 'left', MARG.desc], ['MENGE', 'center', MARG.qty], ['MEINS', 'center', MARG.center], [goods ? 'NETPR' : 'UNITPR', 'right', MARG.price], [goods ? 'NETWR' : 'TOTAL', 'right', MARG.price]];
  const cols = colSpec(goods ? 'MATNR' : 'SRVPOS');
  rowOpen('DATA', 'TR');
  cols.forEach(([col, al, marg], i) => {
    useCol(gtName, col);
    // fixed 4.183 mm like the wizard form; only the description may grow (long texts wrap as in the legacy): line height fitted to one line = 4.183
    const grow = col === 'DESCR';
    cellXml({ name: col, w: widths[i], ...(grow ? { minH: ROW_DATA } : { h: ROW_DATA }), content: { kind: 'bind', ref: col }, relative: true, font: FONT.reg, margin: marg, para: para(al, grow ? fitL(ROW_DATA, 1.122) : undefined), b: itm[i].b, single: !grow });
  });
  w('<occur max="-1" min="0"/>');
  w(bindXml('$.DATA[*]').replace(/ref="\$\.DATA\[\*\]" usage/, 'ref="$.DATA" usage'));
  close('</subform>');
  w('<overflow leader="HeaderRow"/>');
  w(bindXml(`$record.${gtName}`));
  close('</subform>');
  return { footEv, lts };
}

const TOT = { goods: { DISCOUNT: 'DIS', FRGHT: 'FRG', OTHER: 'OTH', SUB_TOTAL: 'SUB', VAT: 'VAT', CA: 'CA', TOTAL: 'TOTAL' }, service: { '%ROW8': 'GROSS', '%ROW9': 'DIS', '%ROW12': 'SUB', '%ROW13': 'VAT', '%CA': 'CA', '%ROW14': 'TOTAL' } };
const BIG = new Set(['SUB_TOTAL', 'VAT', 'CA', 'TOTAL', '%ROW12', '%ROW13', '%CA', '%ROW14']);

function termsFolder(folder, tableSect, uniq) {
  const lts = lineTypes(tableSect);
  const rows = folder.children.filter((c) => c.kind === 'SECTION' && !(c.cond.length && isDead(c.cond)));
  const ctx = {};
  const cnd = fcCond(folder.cond.length ? [folder.cond] : [], ctx);
  open(`<subform layout="tb" name="${uniq}" w="${mmn(TBL_W)}">`);
  rows.forEach((r, ri) => {
    const lt = r.out.lineType;
    const cells = lts.get(lt);
    const widths = cells.map((c) => toMM(c.w));
    const colSects = r.children.filter((c) => c.kind === 'SECTION');
    tableOpen(`${uniq}_${ri + 1}`, widths);
    rowOpen('Row1', 'TR');
    cells.forEach((cd, i) => {
      const nodes = colSects[i] ? liveTexts(colSects[i]).map((tx) => ({ node: tx.node, conds: tx.conds })) : [];
      const head = lt === 'PO_HEADER';
      const content = nodes.length ? slot(nodes, { trim: head }) : { kind: 'empty' };
      // wizard form: heading = one 11.722 mm field (bold, top inset 4.422, left 1.18); term rows grow with their text, number 5.5 mm cell
      // (0.3 top), text cell hanging indent 0.353 + 0.353, line height 3.39; 0.3 + 3.39 + 0.51 = 4.2 mm per one-line row (printout)
      if (head) { cellXml({ name: `C${i + 1}`, w: widths[i], h: 11.722, content, font: FONT.bold, margin: MARG.termHead, para: para('left'), b: cd.b, single: true }); return; }
      const isNo = i === 1; const isTxt = i === 3;
      cellXml({ name: `C${i + 1}`, w: widths[i], ...(content.kind === 'empty' ? { minH: 0 } : { minH: ROW_TXT }), content, font: FONT.reg, margin: isNo ? MARG.termNo : (isTxt ? MARG.termTxt : MARG.cell), para: isTxt ? para('left', '3.39mm', '0.353mm') : para('left'), b: cd.b, single: isNo });
    });
    w('<bind match="none"/>');
    close('</subform>');
    w('<bind match="none"/>');
    close('</subform>');
  });
  if (cnd) w(readyEvt(`if (not (${cnd})) then $.presence = "hidden" endif`));
  w('<bind match="none"/>');
  close('</subform>');
}

function buildSection(tblNode, kind) {
  const goods = kind === 'goods';
  const contName = goods ? 'OTHER_PO' : 'SERVCE_PO';
  const ctx = {};
  const cnd = fcCond([tblNode.cond], ctx);
  open(`<subform layout="tb" name="${contName}" w="${mmn(TBL_W)}">`);
  const { footEv, lts } = buildItemTable(tblNode, kind);
  let fi = 0;
  for (const r of footEv.children) {
    if (r.cond.length && isDead(r.cond)) continue;
    if (r.kind === 'SECTION' && r.sect.type === 'F') { termsFolder(r, tblNode, `TERMS_${contName}_${++fi}`); continue; }
    if (r.kind !== 'SECTION') continue;
    const nm = r.name;
    const totField = TOT[kind][nm];
    const big = BIG.has(nm);
    const isWords = r.out.lineType === 'TRMS';
    if (!totField && !isWords) {
      // spacer / empty / signature / closing rows
      sectionRow(`${nm.replace(/[^A-Za-z0-9_]/g, '_')}`, r, tblNode, {});
      continue;
    }
    if (isWords) {
      const lt = lts.get('TRMS')[0];
      const nodes = r.children.filter((c) => c.kind === 'SECTION').flatMap((cs) => liveTexts(cs).map((tx) => ({ node: tx.node, conds: tx.conds })));
      tableOpen(nm.replace(/[^A-Za-z0-9_]/g, '_'), [toMM(lt.w)]);
      rowOpen('Row1', 'TR');
      cellXml({ name: 'WORDS', w: toMM(lt.w), minH: ROW_TXT, content: slot(nodes), font: FONT.reg, margin: MARG.grid, para: para('left', fitL(ROW_TXT, 1.122)), b: lt.b });
      w('<bind match="none"/>');
      close('</subform>');
      w('<bind match="none"/>');
      close('</subform>');
      continue;
    }
    // totals row: label cell from the legacy text, value cell from GS_TOTALS_*
    const cells = lts.get(r.out.lineType);
    const widths = cells.map((c) => toMM(c.w));
    const colSects = r.children.filter((c) => c.kind === 'SECTION');
    tableOpen(nm.replace(/[^A-Za-z0-9_]/g, '_'), widths);
    rowOpen('Row1', 'TR');
    cells.forEach((cd, i) => {
      let content = { kind: 'empty' };
      if (i === 1) { const nodes = liveTexts(colSects[i]).map((tx) => ({ node: tx.node, conds: tx.conds })); content = slot(nodes); }
      if (i === 2) { const flat = useField(`GS_TOTALS-${totField}`); content = { kind: 'bind', ref: flat }; }
      const label = i === 1;
      cellXml({
        name: `C${i + 1}`, w: widths[i], ...(content.kind === 'empty' ? { minH: 0 } : { h: big ? ROW_BIG : ROW_TXT }), content, single: true,
        font: big ? FONT.big : FONT.reg, margin: big ? (i === 2 ? MARG.bigVal : MARG.bigLbl) : (i === 2 ? MARG.totVal : MARG.totLbl),
        para: para('right'), b: cd.b, // legacy: labels and values are right aligned (labels end at 16.55 cm)
      });
    });
    w('<bind match="none"/>');
    close('</subform>');
    w('<bind match="none"/>');
    close('</subform>');
  }
  if (cnd) w(readyEvt(`if (not (${cnd})) then $.presence = "hidden" endif`));
  w('<bind match="none"/>');
  close('</subform>');
}

function commentsBlock() {
  const tbl = byName('%TABLE2');
  const ctx = {};
  const cnd = fcCond([tbl.cond], ctx);
  const lts = lineTypes(tbl);
  const evs = tbl.children.filter((c) => c.type === 'EV');
  open(`<subform layout="tb" name="COMMENTS" w="${mmn(TBL_W)}">`);
  useCol('LT_LINES', 'TDLINE');
  const l1 = lts.get('%LTYPE1')[0]; const l2 = lts.get('%LTYPE2')[0]; const l3 = lts.get('%LTYPE3')[0];
  const headRow = evs[0].children.find((c) => c.kind === 'SECTION');
  const headNodes = liveTexts(headRow).map((tx) => ({ node: tx.node, conds: tx.conds }));
  tableOpen('LT_LINES', [toMM(l1.w)]);
  rowOpen('HeaderRow', 'TH');
  cellXml({ name: 'HEAD', w: toMM(l1.w), minH: ROW_TXT, content: slot(headNodes), font: FONT.bold, margin: MARG.grid, para: para('left', fitL(ROW_TXT, 1.122)), b: l1.b });
  w('<occur max="-1"/>');
  w('<bind match="none"/>');
  close('</subform>');
  rowOpen('DATA', 'TR');
  cellXml({ name: 'TDLINE', w: toMM(l2.w), minH: ROW_DATA, content: { kind: 'bind', ref: 'TDLINE' }, relative: true, font: FONT.reg, margin: MARG.cell, para: para('left', fitL(ROW_DATA, 1.122)), b: l2.b });
  w('<occur max="-1" min="0"/>');
  w(bindXml('$.DATA[*]').replace(/ref="\$\.DATA\[\*\]" usage/, 'ref="$.DATA" usage'));
  close('</subform>');
  w('<overflow leader="HeaderRow"/>');
  w(bindXml('$record.LT_LINES'));
  close('</subform>');
  tableOpen('COMMENTS_END', [toMM(l3.w)]);
  rowOpen('Row1', 'TR');
  cellXml({ name: 'C1', w: toMM(l3.w), h: ROW_BLANK, content: { kind: 'empty' }, font: FONT.reg, margin: mg(0, 0, 0.7, 0), para: para('left'), b: l3.b });
  w('<bind match="none"/>');
  close('</subform>');
  w('<bind match="none"/>');
  close('</subform>');
  if (cnd) w(readyEvt(`if (not (${cnd})) then $.presence = "hidden" endif`));
  w('<bind match="none"/>');
  close('</subform>');
}

// ---- page areas
const LOGO_PNG = fs.readFileSync(path.join(repo, 'docs/global_data/logos/DANGOTE_LOGO_WHITE.wizard.png.b64'), 'utf8').trim();
function pageArea(id, first, ca, wm) {
  open(`<pageArea id="${id}" name="${id}">`);
  w(`<contentArea h="${mmn(ca.h)}" name="CA${first ? 1 : 2}" w="${mmn(ca.w)}" x="${mmn(ca.x)}" y="${mmn(ca.y)}"/>`);
  w('<medium long="297mm" short="210mm" stock="a4"/>');
  // no window frame: the legacy printout draws no frame for the main window (or for DELVRY_ADD) although the export
  // flags it; the outer lines of the items / totals / terms block are the left and right edges of the rows
  // WATER_MARK
  const useLV = useField('LV_FLAG');
  w(`<field h="6mm" name="WATER_MARK" w="${mmn(toMM(wm.w))}" x="${mmn(toMM(wm.left))}" y="${mmn(toMM(wm.top) + 1.4)}"><ui><textEdit multiLine="1"><border presence="hidden"/><margin/></textEdit></ui><font size="12pt" typeface="Courier New"><fill><color value="176,176,176"/></fill></font><margin bottomInset="0mm" leftInset="0mm" rightInset="0mm" topInset="0mm"/><para hAlign="center" vAlign="top"/><calculate><script contentType="application/x-formcalc">${X(`if (${rec(useLV)} eq "Y") then $ = "Approved PO" else $ = "UnApproved PO" endif`)}</script></calculate><bind match="none"/></field>`);
  if (first) {
    const lg = win('LOGO').win;
    if (LOGO_PNG) w(`<draw h="16.8mm" name="LOGO" w="29.6mm" x="${mmn(toMM(lg.left) + 0.1)}" y="${mmn(toMM(lg.top) + 0.1)}"><value><image aspect="fit" contentType="image/png">${LOGO_PNG}</image></value></draw>`);
  }
  w(first ? '<occur max="1" min="1"/>' : '<occur max="-1" min="0"/>');
  close('</pageArea>');
}

// ================================================================== assemble
open('<pageSet>');
const wm1 = WIN.WATER_MARK; const wm2 = pages[1].children.find((c) => c.win && c.win.h < 6).win;
pageArea('Page1', true, { x: CA1x, y: CA1y, w: CA1w, h: CA1h }, wm1);
pageArea('Page2', false, { x: toMM(p2win.left), y: toMM(p2win.top), w: toMM(p2win.w), h: toMM(p2win.h) }, wm2);
close('</pageSet>');
header();
open(`<subform layout="tb" name="TABLE_DATA" w="${mmn(TBL_W)}">`);
commentsBlock();
const tables = M.children[0].children.find((c) => c.name === 'TABLE_DATA');
const goodsT = byName('OTHER_PO'); const servT = byName('SERVCE_PO');
buildSection(goodsT, 'goods');
buildSection(servT, 'service');
w('<bind match="none"/>');
close('</subform>');


// ---- patch the client's baseline: only pageSet + body (everything outside <template> kept; dataDescription generated)
const file = path.join(repo, 'src/zmmcg_po_sf_adt.sfpf.xdp');
const baseline = fs.readFileSync(process.env.BASELINE || '/tmp/baseline.xdp', 'utf8');
const NL = baseline.includes('\r\n') ? '\r\n' : '\n';
const body = out.join(NL).replace(/^\s+/, '');
const re = /<pageSet>[\s\S]*?<\/pageSet>\s*<subform h="10\.5in" w="8in"\/>/;
if (!re.test(baseline)) throw new Error('baseline structure not as expected');
let xdp = baseline.replace(re, () => body);
// data description (flat names; tables with DATA)
const ddLines = ['<xfa:datasets xmlns:xfa="http://www.xfa.org/schema/xfa-data/1.0/">', '<xfa:data xfa:dataNode="dataGroup"/>', '<dd:dataDescription xmlns:dd="http://ns.adobe.com/data-description/" dd:name="data">', '<data>'];
for (const flat of [...USED.keys()].sort()) ddLines.push(`<${flat}/>`);
for (const [tb, cols] of TABLES) { ddLines.push(`<${tb} dd:minOccur="0">`, '<DATA dd:maxOccur="-1">'); for (const c of [...cols]) ddLines.push(`<${c}/>`); ddLines.push('</DATA>', `</${tb}>`); }
ddLines.push('</data>', '</dd:dataDescription>', '</xfa:datasets>');
xdp = xdp.replace(/<xfa:datasets[\s\S]*?<\/xfa:datasets>/, () => ddLines.join(NL));
fs.writeFileSync(file, xdp, 'utf8');
fs.writeFileSync(path.join(repo, 'docs/legacy_grab/zmmcg_po_sf_context_fields.json'), JSON.stringify({ flat: Object.fromEntries(USED), tables: Object.fromEntries([...TABLES].map(([k2, v]) => [k2, [...v]])) }, null, 1));
console.log(`layout written: ${out.length} lines; ${USED.size} flat fields, ${TABLES.size} tables`);
