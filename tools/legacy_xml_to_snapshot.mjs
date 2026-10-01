#!/usr/bin/env node
// Legacy XML -> snapshot.
//
// Reads the Smart Form XML that SMARTFORMS > Utilities > Download produces
// (root <sf:SMARTFORM>) and writes the evidence Bolt needs for design, so nobody
// re-types it by hand: header facts, exact interface contract, global data and
// coding, pages/windows with geometry, the full node tree (tables, templates,
// texts, code, graphics, conditions), every text line per language, styles and
// graphics used, embedded logic with database/FM references, and a list of what
// the XML does NOT contain.
//
// Everything is READ from the XML. Nothing is inferred beyond what is written
// there; unknown node kinds are printed with their raw type code, never guessed.
//
//   node tools/legacy_xml_to_snapshot.mjs <form.xml> [--out <dir>] [--global <docs/global_data>]
//   -> <out>/<FORM>_extract.md   and   <out>/<FORM>_extract.json
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { parseXml, kid, kids, val } from './xmlmini.mjs';

// ---------- small helpers --------------------------------------------------------
const trimBlank = (a) => {
  let i = 0;
  let j = a.length;
  while (i < j && !a[i].trim()) i++;
  while (j > i && !a[j - 1].trim()) j--;
  return a.slice(i, j);
};
const clean = (s) => (s ?? '').replace(/\s+/g, ' ').trim();
const esc = (s) => clean(s).replace(/\|/g, '\\|');
const nodeKids = (n) => {
  const s = kid(n, 'sf:SUCC');
  return s ? kids(s, 'sf:item').map((i) => kid(i, 'sf:NODE')).filter(Boolean) : [];
};
const objOf = (n) => kid(kid(n, 'sf:OBJ') ?? { children: [] }, 'sf:OBJ') ?? (kid(n, 'sf:OBJ')?.children[0]);
const iname = (o) => val(kid(o, 'NAME'), 'INAME');
const scalars = (el) => Object.fromEntries((el?.children ?? []).filter((c) => !c.children.length && c.text.trim()).map((c) => [c.name, c.text.trim()]));
const unitVal = (o, key) => {
  const v = val(o, key);
  return v ? `${v} ${val(o, 'U_' + key) || ''}`.trim() : '';
};

const NODE_LABEL = {
  RP: 'form root', PA: 'page', WI: 'window', RC: 'window content', SE: 'section', EV: 'event', TI: 'text',
  GR: 'graphic', CO: 'program lines', AL: 'alternative', LO: 'loop', CM: 'command', ST: 'complex section',
};
// The section kind is identified by its own internal-name prefix (what SMARTFORMS assigns), not by a guessed code letter.
function sectionKind(name, sectType) {
  if (/^%TABLE/i.test(name)) return 'table';
  if (/^%TEMPLATE/i.test(name)) return 'template';
  if (/^%ROW/i.test(name)) return 'table line';
  if (/^%CELL/i.test(name)) return 'table column';
  if (/^%FOLDER/i.test(name)) return 'folder';
  if (/^%LOOP/i.test(name)) return 'loop';
  return `section (type ${sectType || '?'})`;
}

function conditionText(condEl) {
  const c = condEl && kid(condEl, 'sf:CONDITION');
  const items = kids(kid(c, 'COND'), 'item');
  if (!items.length) return '';
  const OPS = { EQ: '=', NE: '<>', GT: '>', LT: '<', GE: '>=', LE: '<=' };
  return items.map((i) => {
    const link = val(i, 'LOP');
    const cop = val(i, 'COP');
    const expr = cop ? `${val(i, 'OP1')} ${OPS[cop] ?? cop} ${val(i, 'OP2')}`.trim() : '';
    return `${link ? link + ' ' : ''}${expr}`.trim();
  }).filter(Boolean).join(' ');
}

// ---------- walk the page tree ------------------------------------------------------
function buildNode(n, ctx) {
  const type = val(n, 'NODETYPE');
  const holder = kid(n, 'sf:OBJ');
  const o = holder?.children[0];
  const out = { type, label: NODE_LABEL[type] ?? `node type ${type}`, children: [] };
  if (o) {
    out.objKind = o.name.replace('sf:', '');
    out.name = iname(o);
    out.caption = val(o, 'CAPTION');
  }
  const cond = conditionText(kid(n, 'sf:COND'));
  if (cond) {
    out.condition = cond;
    if (/\b1\s*=\s*2\b/.test(cond)) out.constantFalse = true;
  }
  const oa = kid(kid(n, 'sf:OUTATTR'), 'sf:OUTATTR');
  if (oa) {
    const ss = val(oa, 'STDSTYLE');
    if (ss) { out.outStyle = ss; ctx.styles.add(ss); }
    const geo = { left: unitVal(oa, 'WLEFT'), top: unitVal(oa, 'WTOP'), width: unitVal(oa, 'WWIDTH'), height: unitVal(oa, 'WHEIGHT') };
    if (Object.values(geo).some(Boolean)) out.geometry = geo;
    const borders = ['LEFTATTR', 'TOPATTR', 'RIGHTATTR', 'BOTTOMATTR']
      .filter((b) => parseFloat(val(kid(kid(oa, 'BORDER'), b), 'THICKNESS') || '0') > 0)
      .map((b) => b.replace('ATTR', '').toLowerCase());
    if (borders.length) out.borders = borders;
  }
  if (o?.name === 'sf:WINDOW') out.windowType = val(o, 'WTYPE');
  if (o?.name === 'sf:SECTION') {
    out.sectKind = sectionKind(out.name, val(o, 'SECTTYPE'));
    const s = scalars(o);
    if (s.TABNAME) out.tabName = s.TABNAME;
    if (s.TABHEADER) out.workArea = s.TABHEADER;
    if (s.WIDTH) out.width = `${s.WIDTH} ${s.U_WIDTH ?? ''}`.trim();
    if (kid(o, 'CELLS')) {
      // CELLS lists every column of every line type (%LTYPE1, %LTYPE2, ...) - keep them apart.
      out.columns = {};
      for (const c of kids(kid(o, 'CELLS'), 'item')) (out.columns[val(c, 'NAME') || '?'] ??= []).push(unitVal(c, 'CWIDTH'));
    }
    if (kid(o, 'PATTERN')) out.patternFrame = unitVal(kid(o, 'PATTERN'), 'FRAME');
  }
  if (o?.name === 'sf:EVENT') out.eventType = ({ H: 'header', B: 'main area', F: 'footer' })[val(o, 'EVTYPE')] ?? val(o, 'EVTYPE');
  if (o?.name === 'sf:TEXT') {
    const style = val(o, 'STYLE_NAME');
    if (style) { out.style = style; ctx.styles.add(style); }
    // Prefer the per-language table when present, otherwise the inline lines.
    const per = {};
    for (const t of kids(kid(o, 'T_TEXT'), 'item')) {
      const lang = val(t, 'SPRAS') || '?';
      (per[lang] ??= []).push({ fmt: val(t, 'TDFORMAT'), line: val(t, 'TDLINE') });
    }
    if (!Object.keys(per).length) {
      per[ctx.masterLang || '?'] = kids(kid(o, 'TEXT'), 'item').map((t) => ({ fmt: val(t, 'TDFORMAT'), line: val(t, 'TDLINE') }));
    }
    out.text = per;
    for (const lang of Object.keys(per)) ctx.languages.add(lang);
    for (const l of Object.values(per).flat()) {
      for (const m of l.line.matchAll(/&([^&\s][^&]*?)&/g)) ctx.fields.set(m[1].trim(), (ctx.fields.get(m[1].trim()) ?? 0) + 1);
      if (l.fmt && l.fmt !== '=' && l.fmt !== '/*') ctx.paraFormats.add(l.fmt);
      for (const m of l.line.matchAll(/<([A-Z0-9]{1,2})>/g)) ctx.charFormats.add(m[1]);
    }
    const inc = val(o, 'TXTYPE');
    if (inc && inc !== 'F') out.textSource = inc;
  }
  if (o?.name === 'sf:GRAPHIC') {
    const k = scalars(kid(o, 'GKEYBDS'));
    out.graphic = { object: k.OBJECT, name: k.NAME, id: k.ID, btype: k.BTYPE, resolution: val(o, 'RESOLUTION') };
    ctx.graphics.push(out.graphic);
  }
  if (o?.name === 'sf:CODE') {
    out.params = kids(kid(o, 'PLIST'), 'item').filter((p) => val(p, 'OPD')).map((p) => ({ name: val(p, 'OPD'), dir: val(p, 'OUTIN') === 'I' ? 'input' : val(p, 'OUTIN') === 'O' ? 'output' : val(p, 'OUTIN') }));
    out.code = trimBlank(kids(kid(o, 'CODE'), 'item').map((i) => i.text.replace(/\s+$/, '')));
    ctx.codeNodes.push({ name: out.name, caption: out.caption, params: out.params, code: out.code });
  }
  // A window keeps its content under WINDOW/PROC_CTRL; every other node under its own SUCC.
  const pc = o && kid(o, 'sf:PROC_CTRL');
  if (pc) for (const c of kids(pc, 'sf:NODE')) out.children.push(buildNode(c, ctx));
  for (const c of nodeKids(n)) out.children.push(buildNode(c, ctx));
  return out;
}

// ---------- ABAP evidence scan (plain text, no parsing claims) --------------------------
function scanCode(lines) {
  const ev = { selects: [], tables: [], fms: [], performs: [], memory: [], breakpoints: 0, commented: 0, calls: [] };
  // Join physical lines into statements (up to the closing period) so a multi-line SELECT is read whole.
  let stmt = '';
  for (const raw of lines) {
    const t = raw.trim();
    if (!t || t.startsWith('*') || t.startsWith('"')) continue;
    stmt += (stmt ? ' ' : '') + t;
    if (/\.\s*(".*)?$/.test(stmt)) {
      if (/^SELECT\b/i.test(stmt)) {
        ev.selects.push(stmt.replace(/\s+/g, ' '));
        for (const m of stmt.matchAll(/\b(?:FROM|JOIN)\s+([A-Za-z0-9_/]+)/gi)) ev.tables.push(m[1].toUpperCase());
      }
      stmt = '';
    }
  }
  for (const raw of lines) {
    const l = raw.trim();
    if (!l) continue;
    if (l.startsWith('*') || l.startsWith('"')) { ev.commented++; continue; }
    const u = l.toUpperCase();
    const fm = l.match(/CALL\s+FUNCTION\s+'([^']+)'/i);
    if (fm) ev.fms.push(fm[1].toUpperCase());
    const me = l.match(/(?:CALL\s+METHOD|=>)\s*([A-Z0-9_\/]+)/i);
    if (me && /^[YZ]C?L_/i.test(me[1])) ev.calls.push(me[1].toUpperCase());
    if (/\bPERFORM\b/.test(u)) ev.performs.push(l);
    if (/(IMPORT|EXPORT|FREE)\b.*\bMEMORY\b/.test(u)) ev.memory.push(l);
    if (/\bBREAK-POINT\b|\bBREAK\s+[A-Z0-9_]+/.test(u)) ev.breakpoints++;
  }
  return ev;
}

function flatten(node, acc = []) { acc.push(node); node.children.forEach((c) => flatten(c, acc)); return acc; }

// ---------- rendering ------------------------------------------------------------------
function renderTree(node, depth, lines) {
  if (node.type === 'RC' || node.type === 'RP') { node.children.forEach((c) => renderTree(c, depth, lines)); return; }
  const pad = '  '.repeat(depth);
  let head = `${pad}- **${node.sectKind ?? node.label}** \`${node.name || ''}\``;
  if (node.caption && node.caption !== node.name) head += ` "${clean(node.caption)}"`;
  if (node.eventType) head = `${pad}- **event: ${node.eventType}**`;
  const bits = [];
  if (node.tabName) bits.push(`table \`${node.tabName}\`${node.workArea ? ` into \`${node.workArea}\`` : ''}`);
  if (node.width) bits.push(`width ${node.width}`);
  if (node.columns && Object.keys(node.columns).length) bits.push(`line type(s) ${Object.entries(node.columns).map(([k, v]) => `${k}: ${v.join(' / ')}`).join('; ')}`);
  if (node.condition) bits.push(`**only if** ${node.condition}${node.constantFalse ? ' (contains the constant `1 = 2`: branch may be permanently disabled - confirm with the owner)' : ''}`);
  if (node.geometry) bits.push(`at left ${node.geometry.left}, top ${node.geometry.top}, ${node.geometry.width} x ${node.geometry.height}`);
  if (node.outStyle) bits.push(`style \`${node.outStyle}\``);
  if (node.borders) bits.push(`borders ${node.borders.join('+')}`);
  if (node.graphic) bits.push(`graphic ${node.graphic.object}/${node.graphic.name}/${node.graphic.id} (${node.graphic.btype ?? '?'}, res ${node.graphic.resolution})`);
  if (node.type === 'CO') bits.push(`${node.code.filter((l) => l.trim()).length} lines`);
  if (node.textSource) bits.push(`text source ${node.textSource}`);
  lines.push(head + (bits.length ? ' - ' + bits.join('; ') : ''));
  if (node.text) {
    const langs = Object.keys(node.text);
    const primary = node.text[langs[0]].filter((l) => l.fmt !== '/*');
    for (const l of primary) lines.push(`${pad}  - \`${l.fmt || ' '}\` ${clean(l.line)}`);
    if (langs.length > 1) lines.push(`${pad}  - (also in: ${langs.slice(1).join(', ')})`);
  }
  node.children.forEach((c) => renderTree(c, depth + 1, lines));
}

export function extract(xmlPath, opts = {}) {
  const buf = fs.readFileSync(xmlPath);
  const root = parseXml(buf.toString('utf8'));
  if (!root || root.name !== 'sf:SMARTFORM') throw new Error(`${xmlPath}: not a Smart Form download (root is ${root?.name})`);
  const H = kid(root, 'HEADER');
  const ctx = { styles: new Set(), languages: new Set(), fields: new Map(), paraFormats: new Set(), charFormats: new Set(), graphics: [], codeNodes: [], masterLang: val(H, 'MASTERLANG') };

  const varheader = kid(kid(root, 'sf:VARHEADER'), 'sf:item');
  const tree = buildNode(kid(kid(varheader, 'sf:PAGETREE'), 'sf:NODE'), ctx);
  if (val(varheader, 'STDSTYLE')) ctx.formStyle = val(varheader, 'STDSTYLE');

  const iface = kids(kid(root, 'INTERFACE'), 'item').map((i) => ({
    io: val(i, 'IOTYPE'), name: val(i, 'NAME'), typing: val(i, 'TYPING'), type: val(i, 'TYPENAME'),
    optional: !!val(i, 'OPTIONAL'), byValue: !!val(i, 'BYVALUE'), standard: !!val(i, 'STANDARD'), default: val(i, 'DEFAULTVAL'),
  }));
  const gdata = kids(kid(root, 'GDATA'), 'item').map((i) => ({ name: val(i, 'NAME'), typing: val(i, 'TYPING'), type: val(i, 'TYPENAME') }));
  const gtypes = kids(kid(root, 'GTYPES'), 'item').map((i) => i.text.trim()).filter(Boolean);
  const gplist = kids(kid(root, 'GPLIST'), 'item').filter((i) => val(i, 'OPD')).map((i) => ({ name: val(i, 'OPD'), dir: val(i, 'OUTIN') }));
  const gcoding = trimBlank(kids(kid(root, 'GCODING'), 'item').map((i) => i.text.replace(/\s+$/, '')));
  const globalScan = scanCode(gcoding);
  const nodes = flatten(tree);

  const model = {
    source: { file: path.basename(xmlPath), bytes: buf.length, sha256: crypto.createHash('sha256').update(buf).digest('hex').toUpperCase() },
    header: scalars(H),
    pageFormat: val(varheader, 'PAGEFORMAT'), formStyle: ctx.formStyle,
    interface: iface, globalTypes: gtypes, globalData: gdata, globalParams: gplist, globalCoding: gcoding,
    tree, styles: [...ctx.styles].sort(), languages: [...ctx.languages].sort(),
    fields: Object.fromEntries([...ctx.fields].sort()), paragraphFormats: [...ctx.paraFormats].sort(), characterFormats: [...ctx.charFormats].sort(),
    graphics: ctx.graphics, codeNodes: ctx.codeNodes.map((c) => ({ ...c, evidence: scanCode(c.code) })), globalEvidence: globalScan,
  };
  model.conditions = [...new Set(nodes.map((n) => n.condition).filter(Boolean))];
  model.pages = nodes.filter((n) => n.type === 'PA').map((p) => ({ name: p.name, caption: p.caption }));

  // Cross-check styles/graphics against the global inventories when present.
  const g = opts.globalDir;
  const readIf = (p) => (p && fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);
  const gStyles = readIf(g && path.join(g, 'styles', 'global_smartstyles.txt'));
  const gLogos = readIf(g && path.join(g, 'logos', 'global_logos.txt'));
  model.styleInInventory = Object.fromEntries(model.styles.map((s) => [s, gStyles ? new RegExp(`(^|[^A-Z0-9_])${s}([^A-Z0-9_]|$)`, 'im').test(gStyles) : null]));
  model.graphicInInventory = Object.fromEntries(model.graphics.map((x) => [x.name, gLogos ? gLogos.toUpperCase().includes(String(x.name).toUpperCase()) : null]));
  return { model, nodes };
}

export function toMarkdown(m, nodes) {
  const L = [];
  const f = m.header.FORMNAME;
  L.push(`# ${f} - Legacy Smart Form extract (from XML)`, '');
  L.push(`Generated by \`tools/legacy_xml_to_snapshot.mjs\` from \`${m.source.file}\` (SHA-256 \`${m.source.sha256}\`, ${m.source.bytes.toLocaleString('en-US')} bytes). Every fact below is read from the XML; nothing is inferred. See section 10 for what the XML does not contain.`, '');

  L.push('## 1. Form facts', '', '| Fact | Value |', '|---|---|');
  const rows = [['Form / caption', `\`${f}\` / ${m.header.CAPTION}`], ['Package', m.header.DEVCLASS], ['Master language', m.header.MASTERLANG],
    ['Language vector', m.header.LANGVECTOR], ['Languages with text', m.languages.join(', ') || '(none)'], ['Version', m.header.VERSION],
    ['Created', `${m.header.FIRSTUSER} ${m.header.FIRSTDATE}`], ['Last changed', `${m.header.LASTUSER} ${m.header.LASTDATE} ${m.header.LASTTIME}`],
    ['Page format', m.pageFormat], ['Form-level style', m.formStyle], ['Pages', m.pages.map((p) => `\`${p.name}\``).join(', ')]];
  rows.forEach(([k, v]) => v && L.push(`| ${k} | ${esc(v)} |`));
  L.push('');

  L.push('## 2. Interface contract', '', 'Standard SAP parameters are marked; the rest is the form\'s own contract.', '',
    '| Direction | Name | Typing | Type | Flags / default |', '|---|---|---|---|---|');
  const DIR = { I: 'Import', E: 'Export', T: 'Table', C: 'Changing', X: 'Exception' };
  for (const p of [...m.interface].sort((a, b) => Number(a.standard) - Number(b.standard) || 'IECTX'.indexOf(a.io) - 'IECTX'.indexOf(b.io))) {
    const flags = [p.optional && 'optional', p.byValue && 'by value', p.standard && 'standard', p.default && `default ${p.default}`].filter(Boolean).join(', ');
    L.push(`| ${DIR[p.io] ?? p.io} | \`${p.name}\` | ${p.typing || '-'} | ${p.type ? '`' + p.type + '`' : '-'} | ${flags} |`);
  }
  L.push('');

  L.push('## 3. Global definitions and initialization', '');
  if (m.globalTypes.length) L.push('Types:', '', '```abap', ...m.globalTypes, '```', '');
  if (m.globalData.length) { L.push('Global data:', '', '| Name | Typing | Type |', '|---|---|---|'); m.globalData.forEach((d) => L.push(`| \`${d.name}\` | ${d.typing} | \`${d.type}\` |`)); L.push(''); }
  if (m.globalParams.length) L.push(`Initialization coding parameters: ${m.globalParams.map((p) => `\`${p.name}\` (${p.dir === 'I' ? 'in' : p.dir === 'O' ? 'out' : p.dir})`).join(', ')}`, '');
  if (m.globalCoding.some((l) => l.trim())) L.push('Initialization coding:', '', '```abap', ...m.globalCoding, '```', '');

  L.push('## 4. Pages, windows and layout tree', '', '| Window | Caption | Kind | Position (left, top) | Size |', '|---|---|---|---|---|');
  const WKIND = { M: 'main', T: 'secondary (text)', G: 'graphic' };
  nodes.filter((n) => n.type === 'WI').forEach((w) => {
    const g = w.geometry ?? {};
    L.push(`| \`${w.name}\` | ${esc(w.caption)} | ${WKIND[w.windowType] ?? w.windowType} | ${g.left || '-'}, ${g.top || '-'} | ${g.width || '-'} x ${g.height || '-'} |`);
  });
  L.push('', 'Node tree (conditions shown inline; text lines show paragraph format and content):', '');
  renderTree(m.tree, 0, L);
  L.push('');

  L.push('## 5. Conditions (distinct)', '');
  if (m.conditions.length) m.conditions.forEach((c) => L.push(`- ${c}`)); else L.push('(none)');
  L.push('');

  L.push('## 6. Styles and formats', '');
  L.push(`SmartStyle(s) referenced: ${m.styles.map((s) => `\`${s}\``).join(', ') || '(none)'}`);
  for (const [s, inv] of Object.entries(m.styleInInventory)) L.push(`- \`${s}\`: ${inv === null ? 'global inventory not supplied' : inv ? 'present in global_smartstyles.txt' : '**NOT in global_smartstyles.txt** (definition XML needed)'}`);
  L.push('', `Paragraph formats used: ${m.paragraphFormats.map((x) => `\`${x}\``).join(', ') || '(none)'}`, `Character formats used: ${m.characterFormats.map((x) => `\`${x}\``).join(', ') || '(none)'}`, '');

  L.push('## 7. Graphics', '');
  if (!m.graphics.length) L.push('No graphic node.');
  m.graphics.forEach((x) => {
    const inv = m.graphicInInventory[x.name];
    L.push(`- \`${x.object}/${x.name}/${x.id}\` type ${x.btype ?? '?'}, resolution ${x.resolution}: ${inv === null ? 'global inventory not supplied' : inv ? 'present in global_logos.txt' : '**NOT in global_logos.txt**'}`);
  });
  L.push('');

  L.push('## 8. Data fields printed by the form', '', 'Fields referenced as `&FIELD&` in text nodes (count of uses):', '');
  const fe = Object.entries(m.fields);
  if (fe.length) L.push(fe.map(([k, v]) => `\`${k}\`${v > 1 ? ` x${v}` : ''}`).join(', ')); else L.push('(none)');
  L.push('');

  L.push('## 9. Embedded logic and hard-coded values', '');
  const all = [{ name: 'GLOBAL INITIALIZATION', caption: '', evidence: m.globalEvidence, code: m.globalCoding, params: m.globalParams }, ...m.codeNodes];
  let dep = 0;
  for (const c of all) {
    const e = c.evidence ?? scanCode(c.code);
    const real = c.code.filter((l) => l.trim() && !l.trim().startsWith('*')).length;
    if (!real) continue;
    dep++;
    L.push(`### DEP-${String(dep).padStart(2, '0')} \`${c.name}\`${c.caption ? ' - ' + clean(c.caption) : ''}`, '');
    if (c.params?.length) L.push(`Parameters: ${c.params.map((p) => `\`${p.name}\` (${p.dir === 'I' ? 'in' : p.dir === 'O' ? 'out' : p.dir})`).join(', ')}`);
    L.push(`${real} active line(s), ${e.commented} commented line(s)${e.breakpoints ? `, **${e.breakpoints} BREAK-POINT statement(s)**` : ''}.`);
    if (e.selects.length) L.push('', `Database reads (tables: ${[...new Set(e.tables)].map((t) => `\`${t}\``).join(', ')}):`, ...e.selects.map((s) => `- \`${s}\``));
    if (e.fms.length) L.push('', `Function modules called: ${[...new Set(e.fms)].map((x) => `\`${x}\``).join(', ')}`);
    if (e.calls.length) L.push('', `Custom classes called: ${[...new Set(e.calls)].map((x) => `\`${x}\``).join(', ')}`);
    if (e.memory.length) L.push('', 'Memory (IMPORT/EXPORT/FREE):', ...e.memory.map((s) => `- \`${s}\``));
    if (e.performs.length) L.push('', 'PERFORM statements:', ...e.performs.map((s) => `- \`${s}\``));
    L.push('', '```abap', ...c.code, '```', '');
  }
  if (!dep) L.push('No program-line nodes or initialization coding.', '');

  L.push('## 10. Not present in this XML (must come from elsewhere)', '');
  L.push('- Driver program, NACE/output determination and volume: taken from `ZSF2AF_R_LEGACY_GRAB` (sections 3-4 of its snapshot), not from the form XML.');
  const missingStyles = Object.entries(m.styleInInventory).filter(([, v]) => v !== true).map(([s]) => s);
  L.push(`- SmartStyle definitions (paragraph/character format properties): ${m.styles.length ? 'the style XML for ' + m.styles.map((s) => `\`${s}\``).join(', ') + ' is a separate download (SMARTSTYLES > Utilities > Download)' : 'no style referenced'}.`);
  if (missingStyles.length) L.push(`- Styles not in the global inventory: ${missingStyles.map((s) => `\`${s}\``).join(', ')}.`);
  if (m.graphics.length) L.push('- Graphic binaries and sizing/crop: only the SE78 key is in the XML.');
  L.push('- Live document data, print/PDF for visual comparison, business-owner sign-off.');
  L.push('');
  return L.join('\n');
}

// ---------- CLI -----------------------------------------------------------------------
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const arg = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
  const file = args.find((a) => !a.startsWith('--') && a !== arg('--out') && a !== arg('--global'));
  if (!file) { console.error('usage: node tools/legacy_xml_to_snapshot.mjs <form.xml> [--out <dir>] [--global <docs/global_data>]'); process.exit(2); }
  const outDir = arg('--out') ?? path.dirname(file);
  const { model, nodes } = extract(file, { globalDir: arg('--global') });
  fs.mkdirSync(outDir, { recursive: true });
  const base = path.join(outDir, `${model.header.FORMNAME}_extract`);
  fs.writeFileSync(`${base}.md`, toMarkdown(model, nodes), 'utf8');
  fs.writeFileSync(`${base}.json`, JSON.stringify(model, null, 2), 'utf8');
  console.log(`${model.header.FORMNAME}: ${nodes.length} nodes, ${model.interface.length} interface params, ${model.codeNodes.length} code node(s) -> ${base}.md / .json`);
}
