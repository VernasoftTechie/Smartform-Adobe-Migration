// Self-test: run against the real, committed ymmgrnnote.xml and assert the facts a human verified.
//   node tools/legacy_xml_to_snapshot.test.mjs
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extract, toMarkdown } from './legacy_xml_to_snapshot.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { model, nodes } = extract(path.join(root, 'docs/legacy_grab/ymmgrnnote.xml'), { globalDir: path.join(root, 'docs/global_data') });
const md = toMarkdown(model, nodes);
const count = (t) => nodes.filter((n) => n.type === t).length;

assert.equal(model.header.FORMNAME, 'YMMGRNNOTE');
assert.equal(model.source.sha256, '9D1F87A664ECFE9B3C936DC38E69922663B2970A696E751792A13429F5648E64');
assert.equal(count('PA'), 1);
assert.equal(count('WI'), 8);
assert.equal(model.interface.length, 28);
assert.equal(model.interface.filter((p) => !p.standard).length, 12);
assert.equal(model.codeNodes.length, 5);
assert.equal(model.conditions.length, 9);
assert.equal(model.graphics.length, 1);
assert.equal(model.graphics[0].name, 'DANOGATELOGONEW');
assert.deepEqual(model.styles, ['YGRNNOTE']);
assert.deepEqual(model.languages, ['E', 'F']);
assert.equal(model.styleInInventory.YGRNNOTE, false);
assert.equal(model.graphicInInventory.DANOGATELOGONEW, true);
assert.ok(nodes.some((n) => n.tabName === 'LT_MSEG' && n.workArea === 'WA_MSEG'));
assert.equal(nodes.filter((n) => n.constantFalse).length, 2);
assert.ok(md.includes('`ZABF_ISP_GET_MONTH_NAME`'));
assert.ok(md.includes('tables: `USR21`, `ADRP`'));
assert.ok(md.includes('tables: `T001`'));
assert.ok(!/\n\n\n\n/.test(md), 'no long blank runs');
console.log('legacy_xml_to_snapshot: all assertions passed');
