// Schema-based verification for wizard-style layouts (S08 section 16). node verify.mjs <repo> <baseline.xdp>
import fs from 'node:fs';
import path from 'node:path';
import { parseXml } from '../xmlmini.mjs';
import { loadModel, walkLive, isDead } from './model.mjs';
import { conformance } from './conformance.mjs';

const repo = process.argv[2];
const baselineFile = process.argv[3];
const xdpText = fs.readFileSync(path.join(repo, 'src/zmmcg_po_sf_adt.sfpf.xdp'), 'utf8');
const ctxText = fs.readFileSync(path.join(repo, 'src/zmmcg_po_sf_adt.sfpf.xml'), 'utf8');
const intText = fs.readFileSync(path.join(repo, 'src/zmmcg_po_sf_int.sfpi.xml'), 'utf8');
const res = [];
const ok = (m) => res.push(['PASS', m]);
const bad = (m) => res.push(['FAIL', m]);
const warn = (m) => res.push(['WARN', m]);
const check = (c, pass, fail) => (c ? ok(pass) : bad(fail));

// ---- Context names (flat) + loops
const nodes = [...ctxText.matchAll(/<cls:(CL_FP_\w+) id="(o\d+)">([\s\S]*?)<\/cls:\1>/g)].map((m) => ({ cls: m[1], id: m[2], body: m[3] }));
const get = (b, tag) => (b.match(new RegExp(`<${tag}>([^<]*)</${tag}>`)) || [])[1];
const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
const href = (b, tag) => (b.match(new RegExp(`<${tag} href="#(o\\d+)"`)) || [])[1];
const ctxTop = new Set(); const ctxLoops = new Map();
for (const n of nodes) {
  if (n.cls === 'CL_FP_DATA') {
    const parent = byId[href(n.body, 'PARENT')];
    const name = get(n.body, 'NAME');
    if (parent && parent.cls === 'CL_FP_CONTEXT') ctxTop.add(name);
  }
  if (n.cls === 'CL_FP_LOOP') ctxLoops.set(get(n.body, 'NAME'), new Set());
}
for (const n of nodes) if (n.cls === 'CL_FP_DATA') { const p = byId[href(n.body, 'PARENT')]; const gp = p && byId[href(p.body, 'PARENT')]; if (p && p.cls === 'CL_FP_LOOP_DATA' && gp) ctxLoops.get(get(gp.body, 'NAME'))?.add(get(n.body, 'NAME')); }
check(![...ctxTop].some((n) => /-/.test(n)), `Context: ${ctxTop.size} flat scalar nodes (no hyphen names), ${ctxLoops.size} loops`, 'Context has hyphenated names');
check(nodes.filter((n) => n.cls === 'CL_FP_STRUCTURE').length === 0, 'Context has no CL_FP_STRUCTURE nodes (flat, as the wizard)', 'Context still contains CL_FP_STRUCTURE nodes');

// ---- interface symbols for the Context fields
const ifaceNames = new Set([...intText.matchAll(/<NAME>([^<]*)<\/NAME>/g)].map((m) => m[1].toUpperCase()));
const fieldsOfCtx = [...nodes.filter((n) => n.cls === 'CL_FP_DATA').map((n) => get(n.body, 'FIELD'))].filter(Boolean);
const missingIface = fieldsOfCtx.filter((f) => { const root = f.split('-')[0]; return !ifaceNames.has(root.toUpperCase()); });
check(!missingIface.length, 'every Context field belongs to a declared interface symbol', `Context fields without interface symbol: ${missingIface.join(', ')}`);

// ---- XDP template
const m0 = /<template[\s\S]*?<\/template>/.exec(xdpText);
const tpl = m0[0];
const root = parseXml(tpl.replace(/<\?[\s\S]*?\?>/g, ''));
const walk = (e, fn, p = []) => { fn(e, p); for (const c of e.children) walk(c, fn, [...p, e]); };
const all = []; walk(root, (e, p) => all.push({ e, p }));
const ofName = (n) => all.filter((x) => x.e.name === n);
check(!/<(subform|field|draw)[^>]*presence="hidden"/.test(tpl), 'no object starts hidden (default visible, hide on ready)', 'objects with presence="hidden" found in the template');
// binds
const ctxTable = (p) => { for (let i = p.length - 1; i >= 0; i -= 1) { const b = p[i].children.find((c) => c.name === 'bind'); const r = b?.attrs.ref; if (r && /^\$record\.([A-Z0-9_]+)$/.test(r) && ctxLoops.has(r.slice(8))) return r.slice(8); } return null; };
let nb = 0; let badBinds = [];
for (const { e, p } of ofName('bind')) {
  if (e.attrs.match !== 'dataRef') continue;
  nb += 1;
  const r = e.attrs.ref;
  let m;
  if ((m = /^\$record\.([A-Z0-9_]+)$/.exec(r))) { if (!ctxTop.has(m[1]) && !ctxLoops.has(m[1])) badBinds.push(r); } else if (r === '$.DATA[*]') { /* row of a table */ } else if ((m = /^\$\.([A-Z0-9_]+)$/.exec(r))) {
    const t = ctxTable(p); if (!t || !ctxLoops.get(t).has(m[1])) badBinds.push(`${r} (in ${t})`);
  } else badBinds.push(r);
}
check(!badBinds.length, `${nb} data binds all resolve to Context nodes / table columns`, `unresolved binds: ${badBinds.join(', ')}`);
// connect parity
const connects = ofName('connect').map((x) => x.e.attrs);
check(connects.every((c) => c.connection === 'ZMMCG_PO_SF_ADT' && c.usage === 'importOnly'), `${connects.length} connect elements use the form connection`, 'connect elements inconsistent');
// FormCalc references
const scripts = ofName('script').map((x) => ({ s: x.e.text, p: x.p }));
const refs = new Set(); for (const { s } of scripts) for (const m of s.matchAll(/\$record\.([A-Z0-9_]+)(\.DATA|\.value)/g)) refs.add(m[1]);
const missRef = [...refs].filter((r) => !ctxTop.has(r) && !ctxLoops.has(r));
check(!missRef.length, `${scripts.length} FormCalc scripts reference ${refs.size} Context fields, all exist`, `FormCalc references to unknown fields: ${missRef.join(', ')}`);
// FormCalc syntax sanity
let synBad = [];
for (const { s } of scripts) {
  const code = s.replace(/"(\\.|[^"\\])*"/g, '""');
  const cnt = (re) => (code.match(re) || []).length;
  const ifs = cnt(/\bif\b/g); const endifs = cnt(/\bendif\b/g);
  const fors = cnt(/\bfor\b/g); const endfors = cnt(/\bendfor\b/g);
  const op = cnt(/\(/g); const cl = cnt(/\)/g);
  const thens = cnt(/\bthen\b/g);
  if (ifs !== endifs || fors !== endfors || op !== cl || ifs !== thens) synBad.push(s.slice(0, 70));
}
check(!synBad.length, 'FormCalc blocks balanced (if/then/endif, for/endfor, parentheses)', `unbalanced FormCalc: ${synBad.join(' | ')}`);
// ready events: formcalc, default visible hide only
const readies = ofName('event').filter((x) => x.e.attrs.activity === 'ready');
check(readies.length > 0 && readies.every((x) => /\$\.presence = "hidden"/.test(x.e.children[0].text)), `${readies.length} ready events, each only hides (default visible)`, 'a ready event does something other than hide');
// tables: leader + header repeat
const tables = ofName('subform').filter((x) => x.e.attrs.layout === 'table');
let leadBad = [];
for (const { e } of tables) { const ov = e.children.find((c) => c.name === 'overflow'); if (ov) { const hr = e.children.find((c) => c.name === 'subform' && c.attrs.name === ov.attrs.leader); const oc = hr?.children.find((c) => c.name === 'occur'); if (!hr || oc?.attrs.max !== '-1') leadBad.push(e.attrs.name); } }
const leaderTables = tables.filter((x) => x.e.children.some((c) => c.name === 'overflow')).map((x) => x.e.attrs.name);
check(!leadBad.length && leaderTables.length === 3, `overflow leader on the table subform with a repeating header row: ${leaderTables.join(', ')}`, `leader problems: ${leadBad.join(', ')}; tables with leader: ${leaderTables.length}`);
// column widths vs cells
let cwBad = [];
for (const { e } of tables) { const cw = (e.attrs.columnWidths || '').split(' ').map((v) => parseFloat(v)); const row = e.children.find((c) => c.name === 'subform' && c.attrs.layout === 'row'); const cells = row.children.filter((c) => ['field', 'draw'].includes(c.name)).map((c) => parseFloat(c.attrs.w)); if (cw.length !== cells.length || cw.some((v, i) => Math.abs(v - cells[i]) > 0.01)) cwBad.push(e.attrs.name); }
check(!cwBad.length, `${tables.length} table subforms: columnWidths equal the cell widths of their rows`, `column width mismatch: ${cwBad.join(', ')}`);
// borders: 4 edges always, in clockwise order is by construction
const borders = ofName('border').filter((x) => ['field', 'draw', 'subform'].includes(x.p.at(-1)?.name));
check(borders.every((b) => b.e.children.filter((c) => c.name === 'edge').length === 4), `${borders.length} borders carry exactly 4 edges (top,right,bottom,left)`, 'a border has != 4 edges');
// pages
const pa = ofName('pageArea');
const geo = pa.map((x) => { const ca = x.e.children.find((c) => c.name === 'contentArea').attrs; return [x.e.attrs.id, parseFloat(ca.x), parseFloat(ca.y), parseFloat(ca.w), parseFloat(ca.h)]; });
check(geo.every(([, x, y, w, h]) => x + w <= 210.01 && y + h <= 297.01), `content areas inside A4: ${geo.map((g) => `${g[0]} x${g[1]} y${g[2]} w${g[3]} h${g[4]}`).join('; ')}`, 'content area outside the page');
const occ = pa.map((x) => x.e.children.find((c) => c.name === 'occur').attrs);
check(occ[0].min === '1' && occ[0].max === '1' && occ[1].min === '0' && occ[1].max === '-1', 'Page1 occur 1/1, Page2 occur 0/-1', 'page occurrence wrong');
// root structure
const dataSub = root.children.find((c) => c.name === 'subform');
check(dataSub.attrs.name === 'data' && dataSub.attrs.layout === 'tb', 'root subform data layout tb', 'root subform wrong');
// position children inside parents
let outside = [];
walk(root, (e) => { if (e.name === 'subform' && e.attrs.layout === 'position') { const W = parseFloat(e.attrs.w); const H = parseFloat(e.attrs.h); for (const c of e.children) if (['field', 'draw', 'subform'].includes(c.name) && c.attrs.x != null) { const x = parseFloat(c.attrs.x); const y = parseFloat(c.attrs.y); const w2 = parseFloat(c.attrs.w); const h2 = parseFloat(c.attrs.h ?? c.attrs.minH ?? 0); if (x + w2 > W + 0.05 || y + h2 > H + 0.05 || x < -0.01 || y < -0.01) outside.push(`${e.attrs.name}>${c.attrs.name}`); } } });
check(!outside.length, 'positioned children lie inside their parent subform', `positioned children outside parent: ${outside.slice(0, 8).join(', ')}`);

// ---- legacy coverage: every live static text appears in the layout (E and F wording)
const M = loadModel(path.join(repo, 'vernasofttechie-zmmcg_po_sf/zmmcg_po_sf.xml'));
const hay = tpl.replace(/&#10;/g, '\n').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\\"/g, '"').replace(/\\u000a/g, '\n');
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const nh = norm(hay);
const cleanTags = (s) => s.replace(/<\(>/g, '').replace(/<\)>/g, '').replace(/<\/>/g, '').replace(/<[A-Z]\d>/g, '');
let total = 0; const missing = [];
walkLive(M, (n) => {
  if (n.kind !== 'TEXT' || n.ttype === 'I') return;
  for (const lang of ['E', 'F']) {
    const lines = n.text[lang]; if (!lines.length) continue;
    const ps = []; for (const { fmt, line } of lines) { if (/^\/[*:]/.test(fmt)) continue; if (ps.length && (fmt === ' ' || fmt === '')) ps[ps.length - 1] += ` ${line.trim()}`; else ps.push(line); }
    for (const p of ps) {
      const s = cleanTags(p);
      for (const piece of s.split(/&[A-Za-z_][A-Za-z0-9_-]*(?:\([A-Za-z]+\))?&/)) { const t = norm(piece); if (t.length >= 2) { total += 1; if (!nh.includes(t) && !nh.includes(t.replace(/'/g, "'"))) missing.push(`${n.name}[${lang}]: "${t.slice(0, 60)}"`); } }
    }
  }
});
check(!missing.length, `every live legacy text fragment (English and French) is in the layout (${total} fragments checked)`, `legacy text missing in the layout (${missing.length}): ${missing.slice(0, 12).join(' | ')}`);

// ---- every legacy printed token is bound (deliberately replaced ones listed)
const REPLACED = new Set(['LV_MENGE', 'LV_UNITPRICE1', 'LV_TOTAL1', 'WA_EKPO-MATNR', 'WA_EKPO-MEINS', 'WA_EKPO-TXZ01', 'WA_EKPO-NETPR', 'WA_EKPO-NETWR', 'MATDESC', 'V_SLNO', 'WA_ESLL-SRVPOS', 'WA_ESLL-MEINS', 'WA_ESLL-KTEXT1', 'G_TXZ01', 'V_DIS', 'V_FRG', 'V_OTH', 'V_SUB', 'V_TOTAL', 'V_TOTALI', 'V_TOTAL1', 'LV_VAT', 'LV_CA', 'V_KWERT', 'V2_KWERT', 'V1_KWERT', 'LV_OTH', 'SUB_TOTAL', 'LV_KWERT1', 'LV_NAVS1', 'G_CURR_DATE', 'LS_ADRC1-TDLINE', 'LS_LINE-TDLINE']);
const printed = new Set();
walkLive(M, (n) => { if (n.kind === 'TEXT' && n.ttype !== 'I') for (const lang of ['E', 'F']) for (const { line } of n.text[lang]) for (const m of cleanTags(line).matchAll(/&([A-Za-z_][A-Za-z0-9_-]*)(\([A-Za-z]+\))?&/g)) printed.add(m[1].toUpperCase()); });
const flatNames = new Set([...ctxTop].map((x) => x.toUpperCase()));
const unbound = [...printed].filter((p) => !REPLACED.has(p) && !flatNames.has(p.replace(/-/g, '_')) && !(p === 'LV_LIFNR' && flatNames.has('GV_LIFNR_OUT')));
check(!unbound.length, `every legacy printed field is bound or deliberately replaced (${printed.size} symbols; ${[...printed].filter((p) => REPLACED.has(p)).length} replaced by the prepared GT_*/GS_* values)`, `printed fields without binding: ${unbound.join(', ')}`);

// ---- conformance with the client's wizard-generated form of this Smart Form (reproduces the legacy printout), see conformance.mjs
{
  const ref = fs.readFileSync(path.join(repo, 'docs/legacy_grab/wizard_reference/ZMMCG_PO_SF_F.XDP'), 'utf8').replace(/\r/g, '');
  const diffs = conformance(ref, tpl);
  check(!diffs.length, 'conforms to the client\'s wizard form of this Smart Form: page areas, watermark, logo, title baseline, plant address, last changed, grids, item table, totals block, words row, terms', `differs from the wizard form: ${diffs.join(' | ')}`);
  check(!/name="MAIN_FRAME"/.test(tpl), 'no window frame drawn (printout and wizard form have none)', 'a window frame was drawn');
  const zero = /name="_?ROW24"[\s\S]{0,700}/.exec(tpl)?.[0] ?? '';
  check(zero !== '' && !/<border>/.test(zero), 'a legacy row without printable text prints no border', 'zero-height row carries a border or ROW24 not found');
}

// ---- baseline: nothing outside <template> / datasets changed
if (baselineFile) {
  const strip = (s) => s.replace(/<template[\s\S]*?<\/template>/, '<T/>').replace(/<xfa:datasets[\s\S]*?<\/xfa:datasets>/, '<D/>').replace(/\r\n/g, '\n');
  check(strip(xdpText) === strip(fs.readFileSync(baselineFile, 'utf8')), 'nothing outside <template> and the data description differs from the client baseline', 'content outside <template>/datasets differs from the client baseline');
}
// dd vs Context
const dd = /<dd:dataDescription[\s\S]*?<\/dd:dataDescription>/.exec(xdpText)?.[0] ?? '';
const ddNames = new Set([...dd.matchAll(/<([A-Z0-9_]+)[ \/>]/g)].map((m) => m[1]));
const notInDd = [...ctxTop, ...ctxLoops.keys()].filter((n) => !ddNames.has(n));
check(!notInDd.length, 'data description lists every Context node', `data description misses: ${notInDd.join(', ')}`);

let fails = 0;
for (const [lvl, m] of res) { console.log(`${lvl.padEnd(4)}  ${m}`); if (lvl === 'FAIL') fails += 1; }
console.log(`\nRESULT: ${fails ? 'FAIL' : 'OK'} - ${res.filter((r) => r[0] === 'FAIL').length} fail, ${res.filter((r) => r[0] === 'WARN').length} warn, ${res.filter((r) => r[0] === 'PASS').length} passed`);
process.exit(fails ? 1 : 0);
