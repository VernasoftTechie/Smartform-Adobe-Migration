#!/usr/bin/env node
// Summarises a reference Adobe form (XDP, optionally with its SFPF xml) so it can be registered in docs/reference_forms/ and mined for
// constructs: layout types, tables, scripts, events, page areas, fonts, borders, images, barcodes, keep rules, data bindings.
//   node tools/ref_form_probe.mjs <form.xdp> [--json out.json]
import fs from 'node:fs';
import { parseXml } from './xmlmini.mjs';

const file = process.argv[2];
if (!file) { console.error('usage: node tools/ref_form_probe.mjs <form.xdp> [--json out.json]'); process.exit(2); }
const root = parseXml(fs.readFileSync(file, 'utf8'));
const tpl = root.children.find((c) => c.name === 'template');
if (!tpl) { console.error('no <template> in the file'); process.exit(2); }

const count = (m, k, n = 1) => { m[k] = (m[k] || 0) + n; };
const S = { subforms: {}, objects: {}, events: {}, scripts: { formcalc: 0, javascript: 0, lines: 0 }, tables: [], pageAreas: [], fonts: {}, sizes: {}, borders: { four: 0, partial: 0, filled: 0 }, binds: { dataRef: 0, none: 0, global: 0 }, features: {}, ui: {}, images: 0, margins: {}, lineHeights: {}, namesDup: [] };
const names = {};
function walk(e, depth = 0) {
  switch (e.name) {
    case 'subform': count(S.subforms, e.attrs.layout || 'default (position/tb inherits)'); if (e.attrs.name) names[e.attrs.name] = (names[e.attrs.name] || 0) + 1;
      if (e.attrs.layout === 'table') S.tables.push({ name: e.attrs.name, columnWidths: e.attrs.columnWidths, rows: e.children.filter((c) => c.name === 'subform').map((c) => `${c.attrs.name || ''}:${c.children.find((x) => x.name === 'assist')?.attrs.role || ''}`) });
      break;
    case 'field': case 'draw': case 'exclGroup': count(S.objects, e.name); break;
    case 'pageArea': S.pageAreas.push({ id: e.attrs.id, content: e.children.filter((c) => c.name === 'contentArea').map((c) => `${c.attrs.x},${c.attrs.y} ${c.attrs.w}x${c.attrs.h}`), occur: e.children.find((c) => c.name === 'occur')?.attrs, objects: e.children.filter((c) => ['field', 'draw'].includes(c.name)).length }); break;
    case 'event': count(S.events, `${e.attrs.activity}${e.attrs.ref ? `@${e.attrs.ref}` : ''}`); break;
    case 'script': { const k = /javascript/i.test(e.attrs.contentType || '') ? 'javascript' : 'formcalc'; S.scripts[k] += 1; S.scripts.lines += (e.text.match(/\n/g) || []).length + 1; break; }
    case 'font': count(S.fonts, `${e.attrs.typeface || '?'}${e.attrs.weight ? ' ' + e.attrs.weight : ''}`); count(S.sizes, e.attrs.size || '?'); break;
    case 'border': { const edges = e.children.filter((c) => c.name === 'edge'); const on = edges.filter((x) => x.attrs.presence !== 'hidden').length; if (on === 4) S.borders.four += 1; else if (on > 0) S.borders.partial += 1; if (e.children.some((c) => c.name === 'fill')) S.borders.filled += 1; break; }
    case 'bind': if (e.attrs.match === 'none') S.binds.none += 1; else if (e.attrs.match === 'dataRef') S.binds.dataRef += 1; else if (e.attrs.match === 'global') S.binds.global += 1; break;
    case 'margin': count(S.margins, `${e.attrs.topInset || 0}/${e.attrs.bottomInset || 0}/${e.attrs.leftInset || 0}/${e.attrs.rightInset || 0}`); break;
    case 'para': if (e.attrs.lineHeight) count(S.lineHeights, e.attrs.lineHeight); break;
    case 'keep': count(S.features, `keep ${Object.entries(e.attrs).map(([k, v]) => `${k}=${v}`).join(' ')}`); break;
    case 'overflow': count(S.features, `overflow ${Object.entries(e.attrs).map(([k, v]) => `${k}=${v}`).join(' ')}`); break;
    case 'break': count(S.features, `break ${Object.entries(e.attrs).map(([k, v]) => `${k}=${v}`).join(' ')}`); break;
    case 'occur': if (e.attrs.max === '-1' || +e.attrs.max > 1) count(S.features, 'repeating (occur max > 1)'); break;
    case 'image': S.images += 1; break;
    case 'barcode': count(S.features, `barcode ${e.attrs.type}`); break;
    case 'imageEdit': case 'numericEdit': case 'dateTimeEdit': case 'textEdit': case 'checkButton': case 'choiceList': case 'barcode ': count(S.ui, e.name); break;
    case 'picture': case 'format': case 'validate': case 'calculate': count(S.features, e.name); break;
    case 'assist': count(S.features, `assist ${e.attrs.role || ''}`); break;
    default: break;
  }
  for (const c of e.children) walk(c, depth + 1);
}
walk(tpl);
S.namesDup = Object.entries(names).filter(([, n]) => n > 1).map(([k, n]) => `${k} x${n}`);
const top = (m, n = 8) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k} (${v})`).join(', ');
const out = [];
out.push(`FORM ${file}`);
out.push(`objects: ${top(S.objects)}; images ${S.images}`);
out.push(`subform layouts: ${top(S.subforms)}`);
out.push(`page areas: ${S.pageAreas.map((p) => `${p.id} content[${p.content}] occur ${JSON.stringify(p.occur)} objects ${p.objects}`).join(' | ') || 'none'}`);
out.push(`tables (layout=table): ${S.tables.length}${S.tables.map((t) => `\n   ${t.name} [${t.columnWidths}] rows: ${t.rows.join(', ')}`).join('')}`);
out.push(`scripts: formcalc ${S.scripts.formcalc}, javascript ${S.scripts.javascript}, ${S.scripts.lines} lines; events: ${top(S.events)}`);
out.push(`bindings: dataRef ${S.binds.dataRef}, none ${S.binds.none}, global ${S.binds.global}`);
out.push(`fonts: ${top(S.fonts)}; sizes: ${top(S.sizes)}`);
out.push(`borders: 4-edge ${S.borders.four}, partial ${S.borders.partial}, filled ${S.borders.filled}`);
out.push(`margins top/bottom/left/right: ${top(S.margins, 6)}; line heights: ${top(S.lineHeights, 6)}`);
out.push(`features: ${top(S.features, 20)}`);
out.push(`duplicate object names: ${S.namesDup.slice(0, 10).join(', ') || 'none'}`);
const complexity = (S.tables.length > 2 || S.scripts.formcalc + S.scripts.javascript > 40 || Object.keys(S.features).some((k) => /barcode|break/.test(k))) ? 'C (complex)' : (S.tables.length || S.scripts.formcalc + S.scripts.javascript > 10 ? 'B (medium)' : 'A (simple)');
out.push(`suggested complexity class (rulebook section 3): ${complexity}`);
console.log(out.join('\n'));
const jo = process.argv.indexOf('--json'); if (jo > 0) fs.writeFileSync(process.argv[jo + 1], JSON.stringify(S, null, 1));
