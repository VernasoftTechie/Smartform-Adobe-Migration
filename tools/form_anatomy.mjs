#!/usr/bin/env node
// Anatomy of an Adobe form layout (XDP, or the SFPF xml that embeds it): page structure, the subform tree with layout / geometry / binding /
// occurrence / pagination rules / events, per container the number of fields and draws, the distinct fonts, data references and scripts.
// The output is Markdown (for docs/reference_forms/anatomy/).   node tools/form_anatomy.mjs <form.xdp|SFPF.XML> [--depth N] [--out file.md]
import fs from 'node:fs';
import { parseXml } from './xmlmini.mjs';

const file = process.argv[2];
if (!file) { console.error('usage: node tools/form_anatomy.mjs <form.xdp|SFPF.XML> [--depth N] [--out file.md]'); process.exit(2); }
const argv = process.argv.slice(3);
const depthMax = argv.includes('--depth') ? +argv[argv.indexOf('--depth') + 1] : 7;
let text = fs.readFileSync(file, 'utf8');
if (/<LAYOUT>/.test(text) && !/<template/.test(text)) text = Buffer.from(/<LAYOUT>([\s\S]*?)<\/LAYOUT>/.exec(text)[1].replace(/\s+/g, ''), 'base64').toString('utf8');
const root = parseXml(text);
const tpl = root.children.find((c) => c.name === 'template');

const L = [];
const kid = (e, n) => e.children.find((c) => c.name === n);
const kids = (e, n) => e.children.filter((c) => c.name === n);
const geo = (e) => ['x', 'y', 'w', 'h', 'minH', 'maxH'].filter((k) => e.attrs[k]).map((k) => `${k}=${e.attrs[k]}`).join(' ');
const counts = (e) => { let f = 0; let d = 0; let s = 0; (function w(x) { for (const c of x.children) { if (c.name === 'field') f += 1; else if (c.name === 'draw') d += 1; else if (c.name === 'subform') s += 1; if (c.name !== 'field' && c.name !== 'draw') w(c); } }(e)); return { f, d, s }; };
const rules = (e) => {
  const out = [];
  const oc = kid(e, 'occur'); if (oc) out.push(`occur ${oc.attrs.min ?? ''}..${oc.attrs.max ?? ''}${oc.attrs.initial ? ` init ${oc.attrs.initial}` : ''}`);
  const b = kid(e, 'bind'); if (b && b.attrs.ref) out.push(`bind ${b.attrs.ref}`);
  const ov = kid(e, 'overflow'); if (ov) out.push(`overflow ${Object.entries(ov.attrs).map(([k, v]) => `${k}=${v}`).join(' ')}`);
  const br = kid(e, 'break'); if (br) out.push(`break ${Object.entries(br.attrs).map(([k, v]) => `${k}=${v}`).join(' ')}`);
  const kp = kid(e, 'keep'); if (kp) out.push(`keep ${Object.entries(kp.attrs).map(([k, v]) => `${k}=${v}`).join(' ')}`);
  const as = kid(e, 'assist'); if (as?.attrs.role) out.push(`role ${as.attrs.role}`);
  for (const ev of kids(e, 'event')) { const sc = kid(ev, 'script'); out.push(`event ${ev.attrs.activity}${ev.attrs.ref ? '@' + ev.attrs.ref : ''}${sc ? ` [${(sc.attrs.contentType || '').split('/')[1] || 'script'}${sc.attrs.runAt ? ' ' + sc.attrs.runAt : ''}: ${sc.text.trim().replace(/\s+/g, ' ').slice(0, 70)}]` : ''}`); }
  if (e.attrs.presence) out.push(`presence=${e.attrs.presence}`);
  if (e.attrs.colSpan) out.push(`colSpan=${e.attrs.colSpan}`);
  const m = kid(e, 'margin'); if (m && e.name === 'subform' && (m.attrs.topInset || m.attrs.leftInset)) out.push(`margin ${m.attrs.topInset || 0}/${m.attrs.rightInset || 0}/${m.attrs.bottomInset || 0}/${m.attrs.leftInset || 0}`);
  return out.join('; ');
};

function walk(e, depth) {
  const pad = '  '.repeat(depth);
  for (const c of e.children) {
    if (c.name === 'subform' || c.name === 'subformSet' || c.name === 'exclGroup') {
      const n = counts(c);
      L.push(`${pad}- **${c.name}** \`${c.attrs.name ?? ''}\` ${c.attrs.layout ? `layout=${c.attrs.layout} ` : ''}${c.attrs.columnWidths ? `cols=[${c.attrs.columnWidths}] ` : ''}${c.attrs.relation ? `relation=${c.attrs.relation} ` : ''}${geo(c)} — ${n.f} fields, ${n.d} draws, ${n.s} subforms${rules(c) ? `; ${rules(c)}` : ''}`);
      if (depth + 1 <= depthMax) walk(c, depth + 1);
    }
  }
}

const top = tpl.children.find((c) => c.name === 'subform');
L.push(`# Anatomy of ${file.split(/[\\/]/).pop()}`, '');
const ps = top ? kid(top, 'pageSet') : null;
L.push('## Page structure', '');
if (ps) {
  for (const pa of kids(ps, 'pageArea')) {
    L.push(`- **pageArea** \`${pa.attrs.id}\` ${kids(pa, 'contentArea').map((c) => `content[${c.attrs.x},${c.attrs.y} ${c.attrs.w}×${c.attrs.h}]`).join(' ')} medium ${kid(pa, 'medium')?.attrs.stock ?? ''} ${kid(pa, 'medium')?.attrs.orientation ?? ''}; occur ${JSON.stringify(kid(pa, 'occur')?.attrs ?? {})}; own objects: ${pa.children.filter((c) => ['field', 'draw'].includes(c.name)).map((c) => c.attrs.name).join(', ') || 'none'}`);
  }
  if (ps.attrs.relation) L.push(`- pageSet relation=${ps.attrs.relation}`);
  for (const pa of kids(ps, 'pageArea')) {
    if (pa.children.some((c) => c.name === 'subform')) { L.push('', `### Master-page content of pageArea \`${pa.attrs.id}\` (repeats on every page that uses it)`, ''); walk(pa, 0); }
  }
}
L.push(`- root subform layout=${top?.attrs.layout} ${geo(top)}`, '', '## Subform tree', '');
if (top) walk(top, 0);

// data references and scripts
const refs = new Set(); const fonts = {}; const scripts = []; const pictures = new Set(); const ui = {};
(function w(e) {
  for (const c of e.children) {
    if (c.name === 'bind' && c.attrs.ref) refs.add(c.attrs.ref);
    if (c.name === 'font') fonts[`${c.attrs.typeface || ''} ${c.attrs.size || ''}${c.attrs.weight ? ' ' + c.attrs.weight : ''}`] = (fonts[`${c.attrs.typeface || ''} ${c.attrs.size || ''}${c.attrs.weight ? ' ' + c.attrs.weight : ''}`] || 0) + 1;
    if (c.name === 'script') scripts.push(c.text.trim());
    if (c.name === 'picture') pictures.add(c.text.trim());
    if (c.name === 'ui') for (const u of c.children) ui[u.name] = (ui[u.name] || 0) + 1;
    w(c);
  }
}(tpl));
L.push('', '## Data bindings (distinct)', '', [...refs].slice(0, 120).map((r) => `\`${r}\``).join(', ') + (refs.size > 120 ? ` … (${refs.size} in all)` : ''));
L.push('', '## Fonts (face size weight: count)', '', Object.entries(fonts).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => `${k.trim()}: ${v}`).join('; '));
L.push('', '## UI element types', '', Object.entries(ui).map(([k, v]) => `${k} ${v}`).join(', '));
if (pictures.size) L.push('', '## Picture clauses', '', [...pictures].map((p) => `\`${p}\``).join(', '));
if (scripts.length) { L.push('', `## Scripts (${scripts.length})`, ''); const seen = new Set(); for (const s of scripts) { const k = s.replace(/\s+/g, ' ').slice(0, 90); if (seen.has(k) || seen.size >= 25) continue; seen.add(k); L.push('```', s.split('\n').slice(0, 12).join('\n').slice(0, 700), '```'); } }
const outi = argv.indexOf('--out');
const md = L.join('\n') + '\n';
if (outi >= 0) fs.writeFileSync(argv[outi + 1], md); else process.stdout.write(md);
