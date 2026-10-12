// Coverage check of the S12 conversion map (docs/legacy_grab/zmmcg_po_sf_conversion_map.md) against the raw legacy export and the generated files.
//   node conv_map_check.mjs <repo>
// 1 every structural legacy node (pages, windows, alternatives, graphics, program lines, templates, tables, table lines, sections, folders) is named in a map row
//   (a range `TERMS1…TERMS11` covers the numbered names), 2 every row has a pattern id (P01-P26) and a status (built / dead / proposal / open),
// 3 every `xdp:NAME` the map claims exists in the layout, 4 every live program-lines node is in the Initialization ("legacy node NAME") and no dead one is,
// 5 every row with status "dead" names only nodes that the model reads as permanently disabled (1 = 2 / 2 = 3) or inside such a node.
import fs from 'node:fs';
import path from 'node:path';
import { loadModel, isDead } from './model.mjs';

const repo = path.resolve(process.argv[2]);
const mapFile = path.join(repo, 'docs/legacy_grab/zmmcg_po_sf_conversion_map.md');
const mapAll = fs.readFileSync(mapFile, 'utf8');
const map = mapAll.split('\n## Decisions')[0]; // the row table only
const xdp = fs.readFileSync(path.join(repo, 'src/zmmcg_po_sf_adt.sfpf.xdp'), 'utf8');
const init = fs.readFileSync(path.join(repo, 'docs/legacy_grab/ZMMCG_PO_SF_initialization.abap'), 'utf8');
const M = loadModel(path.join(repo, 'vernasofttechie-zmmcg_po_sf/zmmcg_po_sf.xml'));
const res = []; const check = (c, pass, fail) => res.push([c ? 'PASS' : 'FAIL', c ? pass : fail]);

// ---- structural nodes of the legacy tree, with "dead" = the node or an ancestor is permanently disabled
const nodes = [];
(function walk(n, dead, page, win, idx) {
  const own = n.cond?.length && isDead(n.cond);
  const d = dead || !!own;
  let name = n.name;
  if (n.type === 'WI' && !name) name = `${page}/WINDOW${idx}`;
  const structural = ['PA', 'WI', 'CD', 'GR', 'CO'].includes(n.type) || (n.type === 'SE' && n.sect && !/^%CELL/.test(n.name || '%CELL'));
  if (structural && name) nodes.push({ type: n.type, name, dead: d });
  let wi = 0;
  for (const c of n.children) { if (c.type === 'WI') wi += 1; walk(c, d, n.type === 'PA' ? n.name : page, win, c.type === 'WI' ? wi : idx); }
}(M, false, '', '', 0));
// a CD (alternative) is dead when both its branches are: the model puts the dead condition on the node itself, so the walk above is enough
const names = [...new Set(nodes.map((x) => x.name))];

// ---- map rows and tokens
const rows = map.split('\n').filter((l) => /^\|/.test(l) && !/^\|[\s-|]+$/.test(l) && !/^\| Legacy node/.test(l));
const expand = (tok) => {
  const m = /^(.*?)(\d+)…(.*?)(\d+)$/.exec(tok);
  if (!m || m[1] !== m[3]) return [tok];
  const out = []; for (let i = +m[2]; i <= +m[4]; i += 1) out.push(`${m[1]}${i}`); return out;
};
const rowTokens = rows.map((r) => ({ row: r, toks: [...r.matchAll(/`([^`]+)`/g)].map((x) => x[1]).flatMap(expand) }));
const covered = new Set(rowTokens.flatMap((r) => r.toks));
const missing = names.filter((n) => !covered.has(n));
check(!missing.length, `every one of the ${names.length} structural legacy nodes is named in the conversion map (${rows.length} rows)`, `nodes without a map row: ${missing.join(', ')}`);

const noPattern = rows.filter((r) => !/\bP(0[1-9]|1\d|2[0-6])\b/.test(r));
check(!noPattern.length, 'every row carries a pattern id P01-P26', `rows without pattern id: ${noPattern.map((r) => r.slice(0, 60)).join(' / ')}`);
const noStatus = rows.filter((r) => !/\|\s*(built|dead|proposal|open)\b/i.test(r));
check(!noStatus.length, 'every row has a status (built / dead / proposal / open)', `rows without status: ${noStatus.map((r) => r.slice(0, 60)).join(' / ')}`);

const claimed = [...new Set(rowTokens.flatMap((r) => r.toks).filter((t) => /^xdp:/.test(t)).map((t) => t.slice(4)))];
const noObj = claimed.filter((n) => !new RegExp(` name="${n.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&')}"`).test(xdp));
check(!noObj.length, `all ${claimed.length} layout objects the map names exist in the XDP`, `layout objects named in the map but not in the XDP: ${noObj.join(', ')}`);

const co = nodes.filter((x) => x.type === 'CO');
const liveMissing = co.filter((x) => !x.dead && !init.includes(`legacy node ${x.name}`)).map((x) => x.name);
const deadPresent = co.filter((x) => x.dead && init.includes(`legacy node ${x.name} `)).map((x) => x.name);
check(!liveMissing.length, `all ${co.filter((x) => !x.dead).length} live program-lines nodes are carried into the Initialization`, `live program lines missing in the Initialization: ${liveMissing.join(', ')}`);
check(!deadPresent.length, `${co.filter((x) => x.dead).length} dead program-lines nodes are not rebuilt`, `dead program lines present in the Initialization: ${deadPresent.join(', ')}`);

// rows marked dead may only name dead nodes
const deadSet = new Set(nodes.filter((x) => x.dead).map((x) => x.name));
const wrongDead = rowTokens.filter((r) => /\|\s*dead\b/i.test(r.row)).flatMap((r) => r.toks.filter((t) => names.includes(t) && !deadSet.has(t)));
check(!wrongDead.length, 'rows marked dead name only permanently disabled nodes', `rows marked dead name live nodes: ${wrongDead.join(', ')}`);
const liveDead = rowTokens.filter((r) => !/\|\s*dead\b/i.test(r.row)).flatMap((r) => r.toks.filter((t) => deadSet.has(t) && names.includes(t) && !/\|\s*dead\b/i.test(r.row)));
check(!liveDead.length, 'permanently disabled nodes are not mapped as built', `disabled nodes in non-dead rows: ${[...new Set(liveDead)].join(', ')}`);

let fails = 0;
for (const [l, m] of res) { console.log(`${l.padEnd(4)}  ${m}`); if (l === 'FAIL') fails += 1; }
console.log(`\nRESULT: ${fails ? 'FAIL' : 'OK'} - ${fails} fail, ${res.length - fails} passed`);
process.exit(fails ? 1 : 0);
