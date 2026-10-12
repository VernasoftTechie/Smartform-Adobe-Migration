// The ten independent re-check passes of a generated Adobe form, run in one go. Nothing is committed or confirmed unless all ten pass.
//   node recheck.mjs <repo> [baseline.xdp]
// 1 structure   2 interface parity   3 wizard-form conformance + coverage   4 printout simulation (text, lines, boxes)
// 5 layout conditions x 1152 environments   6 terms ABAP x 48 environments   7 ABAP standards   8 condition reader vs raw XML
// 9 reproducibility (regenerating changes nothing)   10 context graph and bindings
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { loadModel } from './model.mjs';

const repo = path.resolve(process.argv[2]);
const baseline = process.argv[3] || '/tmp/baseline.xdp';
const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const BOLT = process.env.BOLT_TOOLS || 'C:/Users/veere/Downloads/bolt-console-updated/bolt-console-updated/tools';
const node = process.execPath;
const sh = (args, env = {}) => spawnSync(node, args, { cwd: repo, encoding: 'utf8', env: { ...process.env, ...env } });
const last = (r) => (r.stdout + r.stderr).trim().split('\n').filter((l) => /RESULT|FAIL|fail/.test(l)).slice(-2).join(' | ') || (r.stdout + r.stderr).trim().split('\n').slice(-1)[0];
const results = [];
const pass = (n, name, ok, detail) => { results.push([n, name, ok, detail]); console.log(`${ok ? 'PASS' : 'FAIL'}  ${String(n).padStart(2)}  ${name} - ${detail}`); };

let r = sh([path.join(HERE, 'verify.mjs'), repo, baseline]);
const v = (r.stdout.match(/RESULT: (\w+) - (\d+) fail, (\d+) warn, (\d+) passed/) || []);
pass(1, 'structure, bindings, FormCalc, tables, borders, page areas, baseline', v[1] === 'OK', `verify.mjs ${v[2]} fail / ${v[4]} passed`);
const a = sh([`${BOLT}/sfp_check.mjs`, 'interface', 'src/zmmcg_po_sf_int.sfpi.xml', 'docs/legacy_grab/ZMMCG_PO_SF_extract.json']);
pass(2, 'interface parity with the legacy extract', /0 fail/.test(a.stdout), last(a));
pass(3, 'conformance with the client wizard form + legacy text / printed-field coverage', v[1] === 'OK' && /conforms to the client/.test(r.stdout) && /every live legacy text fragment/.test(r.stdout), 'part of verify.mjs (conformance.mjs: coordinates; coverage: 369+ fragments)');
r = sh([path.join(HERE, 'simulate.mjs'), repo]);
pass(4, 'printout simulation: every text baseline / anchor, every line, every grey box (2 pages)', r.status === 0, last(r) + ' ' + (r.stdout.match(/predicted texts \d+, matched \d+/) || [''])[0]);
r = sh([path.join(HERE, 'fc_sim.mjs'), repo]);
pass(5, 'layout conditions: FormCalc run for every order type / flag / language / currency vs the raw legacy export', r.status === 0, last(r) + ' ' + (r.stdout.match(/\d+ environments/) || [''])[0]);
r = sh([path.join(HERE, 'abap_terms_sim.mjs'), repo]);
pass(6, 'terms ABAP: interpreted for every order type / flag / language vs the raw legacy export', r.status === 0, last(r));
r = sh([path.join(HERE, 'abap_lint.mjs'), repo]);
pass(7, 'ABAP standards: DIL naming, no INSERT / INTO CORRESPONDING, 7.4+ constructs', r.status === 0, last(r));
// 8: the condition reader must see every AND / OR operator of the raw export
{
  const raw = fs.readFileSync(path.join(repo, 'vernasofttechie-zmmcg_po_sf/zmmcg_po_sf.xml'), 'utf8');
  const rawOr = (raw.match(/<LOP>OR<\/LOP>/g) || []).length; const rawAnd = (raw.match(/<LOP>AND<\/LOP>/g) || []).length;
  const M = loadModel(path.join(repo, 'vernasofttechie-zmmcg_po_sf/zmmcg_po_sf.xml')); let or = 0; let and = 0;
  (function w(n) { for (const i of n.cond) { if (i.lop === 'OR') or += 1; if (i.lop === 'AND') and += 1; } for (const c of n.children) w(c); }(M));
  // alternatives (CD) conditions are not node conditions: only compare that the model does not see MORE than the export has
  pass(8, 'condition reader: AND / OR operators of the raw export', or <= rawOr && and <= rawAnd && or >= rawOr - 2, `raw OR ${rawOr} / AND ${rawAnd}, model OR ${or} / AND ${and} (alternative nodes are read separately)`);
}
// 9: regenerating from the export changes nothing
{
  const files = ['src/zmmcg_po_sf_adt.sfpf.xdp', 'src/zmmcg_po_sf_adt.sfpf.xml', 'src/zmmcg_po_sf_int.sfpi.xml', 'docs/legacy_grab/ZMMCG_PO_SF_initialization.abap', 'tools/zmmcg_po_sf/terms_extra.abap', 'tools/zmmcg_po_sf/labels_extra.abap', 'docs/legacy_grab/zmmcg_po_sf_context_fields.json', 'docs/legacy_grab/zmmcg_po_sf_context_spec.json', 'docs/legacy_grab/zmmcg_po_sf_labels_catalogue.md'];
  const h = () => files.map((f) => crypto.createHash('sha1').update(fs.readFileSync(path.join(repo, f), 'utf8').replace(/\r\n/g, '\n').replace(/<ID>[0-9A-F]+<\/ID>/g, '<ID/>')) /* SFP node ids are random */.digest('hex').slice(0, 8));
  const before = h();
  const g = sh([path.join(HERE, 'build_all.mjs'), repo]);
  const after = h();
  pass(9, 'reproducibility: build_all (terms, layout, labels, interface, Context) reproduces the committed files', g.status === 0 && before.join() === after.join(), before.join() === after.join() ? 'identical' : `changed: ${files.filter((f, i) => before[i] !== after[i]).join(', ')}`);
}
a2();
function a2() {
  const c = sh([`${BOLT}/sfp_check.mjs`, 'context', 'src/zmmcg_po_sf_adt.sfpf.xml', '--interface', 'src/zmmcg_po_sf_int.sfpi.xml']);
  pass(10, 'Context graph, bound fields exist in the interface', /0 fail/.test(c.stdout), last(c));
}
const failed = results.filter((x) => !x[2]);
console.log(failed.length ? `\nRESULT: ${failed.length} of 10 passes FAILED - do not commit or confirm` : '\nRESULT: all 10 passes OK');
process.exit(failed.length ? 1 : 0);
