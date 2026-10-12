// One command that regenerates every generated file of the ZMMCG_PO_SF ticket from the legacy export and the client's empty SFP baseline:
//   terms ABAP -> layout + labels ABAP + Context spec -> interface (types, globals, Initialization) -> Context (SFP shapes)
//   node build_all.mjs <repo>            (the client's empty baseline is taken from git commit 3130234)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repo = path.resolve(process.argv[2]);
const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const BOLT = process.env.BOLT_TOOLS || 'C:/Users/veere/Downloads/bolt-console-updated/bolt-console-updated/tools';
const BASE = '3130234';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'zmmcg-'));
const run = (args, env = {}) => {
  const r = spawnSync(process.execPath, args, { cwd: repo, encoding: 'utf8', env: { ...process.env, ...env } });
  if (r.status !== 0) { console.error(`FAILED: node ${args.join(' ')}\n${r.stdout}\n${r.stderr}`); process.exit(1); }
  return r.stdout.trim().split('\n').slice(-1)[0];
};
const git = (a) => spawnSync('git', ['-C', repo, ...a], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).stdout;

fs.writeFileSync(path.join(tmp, 'baseline.xdp'), git(['show', `${BASE}:src/zmmcg_po_sf_adt.sfpf.xdp`]));
console.log('terms   ', run([path.join(HERE, 'terms_gen.mjs'), repo]));
console.log('layout  ', run([path.join(HERE, 'gen.mjs'), repo], { BASELINE: path.join(tmp, 'baseline.xdp') }));
console.log('interface', run([path.join(HERE, 'finalize_interface.mjs'), repo], { SCRATCH_OUT: tmp }));
const ctx = path.join(repo, 'src/zmmcg_po_sf_adt.sfpf.xml');
fs.writeFileSync(ctx, git(['show', `${BASE}:src/zmmcg_po_sf_adt.sfpf.xml`]));
console.log('context ', run([`${BOLT}/sfp_context.mjs`, 'build', '--spec', 'docs/legacy_grab/zmmcg_po_sf_context_spec.json', '--form', 'src/zmmcg_po_sf_adt.sfpf.xml']));
console.log('context ', run([path.join(HERE, 'ctx_post.mjs'), 'src/zmmcg_po_sf_adt.sfpf.xml']));
