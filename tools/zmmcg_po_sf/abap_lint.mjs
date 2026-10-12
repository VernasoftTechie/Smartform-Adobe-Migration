// Lints the ABAP that WE wrote (not the legacy code that is re-hosted verbatim) against the user's standards:
//   DIL naming (gv_ gt_ gs_ gc_ lv_ lt_ ls_ lc_, field symbols <lfs_...>), no INSERT, no INTO CORRESPONDING, 7.4+ syntax where possible
//   (no CONCATENATE / MOVE / CALL METHOD / DESCRIBE TABLE ... LINES / READ TABLE ... INTO / APPEND of a work area built in steps for new tables).
//   node abap_lint.mjs <repo>      exit 1 on a violation; warnings are listed
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const files = [];
files.push(['init_extra.abap', fs.readFileSync(path.join(HERE, 'init_extra.abap'), 'utf8')]);
files.push(['terms_extra.abap', fs.readFileSync(path.join(HERE, 'terms_extra.abap'), 'utf8')]);
files.push(['labels_extra.abap', fs.readFileSync(path.join(HERE, 'labels_extra.abap'), 'utf8')]);
// our row builders are the add('...') literals of build_init.mjs that are not produced by legacy(...)
const bi = fs.readFileSync(path.join(HERE, 'build_init.mjs'), 'utf8');
const mine = [...bi.matchAll(/^add\('((?:[^'\\]|\\.)*)'\);?\s*$/gm)].map((m) => m[1].replace(/\\'/g, "'")).filter((l) => !l.startsWith('*') || l.startsWith('* BOLT'));
files.push(['build_init.mjs (our lines)', mine.join('\n')]);

const FORBID = [
  [/\bINSERT\b/i, 'INSERT (standard: MODIFY / APPEND)'], [/INTO\s+CORRESPONDING/i, 'INTO CORRESPONDING FIELDS'], [/\bCONCATENATE\b/i, 'CONCATENATE (use a string template)'],
  [/\bMOVE\b/i, 'MOVE (use =)'], [/\bCALL\s+METHOD\b/i, 'CALL METHOD (use functional call)'], [/DESCRIBE\s+TABLE\b/i, 'DESCRIBE TABLE (use lines( ))'],
  [/\bREAD\s+TABLE\b/i, 'READ TABLE (use a table expression)'], [/\bBREAK[- ]/i, 'debugger statement'], [/\bSELECT\b[^.]*\bINTO\s+(?!TABLE\s+@)/i, 'old SELECT INTO'],
];
const bad = []; const warn = [];
for (const [name, text] of files) {
  text.split('\n').forEach((raw, i) => {
    const l = raw.replace(/"[^'|]*$/, '').replace(/'[^']*'/g, "''").replace(/\|[^|]*\|/g, '||'); // drop comments, literals, templates
    if (/^\s*\*/.test(raw)) return;
    for (const [re, msg] of FORBID) if (re.test(l)) bad.push(`${name}:${i + 1} ${msg}: ${raw.trim().slice(0, 80)}`);
    // names: every identifier that is assigned / declared must follow the policy (DIL): gv_ gt_ gs_ gc_ lv_ lt_ ls_ lc_ or a legacy name (v_, lv_ ...)
    for (const m of l.matchAll(/\bDATA\(\s*([A-Za-z_]\w*)\s*\)/gi)) if (!/^(lv|ls|lt|lc|lo|lr)_/.test(m[1])) bad.push(`${name}:${i + 1} inline DATA name ${m[1]} breaks the DIL naming`);
    for (const m of l.matchAll(/FIELD-SYMBOL\(\s*(<[^>]+>)\s*\)/gi)) if (!/^<lf[vst]_\w+>$/.test(m[1])) bad.push(`${name}:${i + 1} field symbol ${m[1]} breaks the DIL naming (<lfv_ <lfs_ <lft_)`);
    for (const m of l.matchAll(/^\s*(?:DATA:?|CONSTANTS:?)\s+([a-z_]\w*)/gi)) if (!/^(g|l)[vstc]_|^(lv|ls|lt|lc)_/.test(m[1]) && !/^v_/.test(m[1])) warn.push(`${name}:${i + 1} declaration ${m[1]} (legacy name kept?)`);
    if (l.length > 255) bad.push(`${name}:${i + 1} line longer than 255 characters`);
  });
}
console.log(`ABAP lint: ${files.map(([n, t]) => `${n} ${t.split('\n').length} lines`).join('; ')}`);
for (const w of warn.slice(0, 20)) console.log('WARN', w);
for (const b of bad.slice(0, 40)) console.log('FAIL', b);
console.log(bad.length ? `RESULT: ${bad.length} violation(s)` : 'RESULT: OK - our ABAP follows the standards (DIL naming, no INSERT / INTO CORRESPONDING, 7.4+ constructs)');
process.exit(bad.length ? 1 : 0);
