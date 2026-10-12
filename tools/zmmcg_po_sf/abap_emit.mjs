// ABAP emission helpers shared by gen.mjs (labels as data): legacy conditions -> ABAP conditions, legacy text lines -> string templates.
// Style: ABAP 7.4+ (COND, string templates), DIL names, lines below 255 characters.
import { liveItems } from './model.mjs';

const TOKMAP = { LV_LIFNR: 'GV_LIFNR_OUT' };
const abapName = (n) => (TOKMAP[n.toUpperCase()] ?? n).toLowerCase();
export const operand = (o) => (/^'.*'$/.test(o) ? `'${o.slice(1, -1).replace(/'/g, "''")}'` : (/^\d+$/.test(o) ? o : (o.toUpperCase() === 'SY-LANGU' ? 'gv_langu' : abapName(o))));

function condOne(items) {
  const parts = [];
  items.forEach((i, ix) => parts.push((ix ? ` ${i.lop === 'OR' ? 'OR' : 'AND'} ` : '') + `${operand(i.op1)} ${i.cop} ${operand(i.op2)}`));
  return parts.join('');
}
// array of condition arrays (AND-ed); constant true / false items dropped; '' when unconditional
export function abapCond(condArrays) {
  const xs = condArrays.map((c) => liveItems(c)).filter((c) => c.length);
  return xs.length ? xs.map((c) => (xs.length > 1 ? `( ${condOne(c)} )` : condOne(c))).join(' AND ') : '';
}

const cleanTags = (s) => s.replace(/<\(>/g, '').replace(/<\)>/g, '').replace(/<\/>/g, '').replace(/<[A-Z]\d>/g, '');
export function paragraphs(lines) {
  const ps = [];
  for (const { fmt, line } of lines) {
    if (/^\/\*/.test(fmt) || /^\/:/.test(fmt)) continue;
    if (ps.length && (fmt === ' ' || fmt === '')) ps[ps.length - 1] += ` ${line.trim()}`;
    else ps.push(line);
  }
  return ps;
}
const TOKEN = /&([A-Za-z_][A-Za-z0-9_-]*)(\(([A-Za-z]+)\))?&/g;
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\{/g, '\\{').replace(/\}/g, '\\}');

// legacy lines -> { toks: [ '|text{ var }|', 'cl_abap_char_utilities=>newline', ... ], tokens: [names] }
export function templateOf(lines, opt = {}) {
  let ps = paragraphs(lines).map((p) => cleanTags(p));
  if (opt.trim) ps = ps.map((p) => p.trim()).filter((p) => p !== '');
  const toks = []; const tokens = [];
  ps.forEach((p, pi) => {
    if (pi) toks.push('cl_abap_char_utilities=>newline');
    let last = 0; let buf = ''; let m;
    TOKEN.lastIndex = 0;
    const flush = () => { for (let i = 0; i < buf.length; i += 70) toks.push(`|${buf.slice(i, i + 70)}|`); buf = ''; };
    // build template pieces of at most ~70 literal characters; tokens are placed inside a template of their own
    while ((m = TOKEN.exec(p))) {
      if (m.index > last) buf += esc(p.slice(last, m.index));
      flush();
      const nm = abapName(m[1]); tokens.push(m[1].toUpperCase());
      toks.push(m[3] && m[3].toUpperCase() === 'C' ? `|{ condense( ${nm} ) }|` : `|{ ${nm} }|`);
      last = m.index + m[0].length;
    }
    if (last < p.length) { buf += esc(p.slice(last)); flush(); }
  });
  return { toks: toks.length ? toks : ['||'], tokens, text: ps.join('\n') };
}
export const chain = (toks, col) => toks.map((t, i) => (i ? `${' '.repeat(col)}&& ${t}` : t));
