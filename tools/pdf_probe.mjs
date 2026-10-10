#!/usr/bin/env node
// Probe a legacy output PDF: text with position / font size, painted rectangles and lines (strategy S08 section 18).
//
//   npm i pdfjs-dist@3.11.174 @napi-rs/canvas@0.1.53        (once, in any folder; run the script from that folder)
//   node tools/pdf_probe.mjs <file.pdf> [--text] [--gfx] [--json out.json]
//
// text rows : page, x (mm), baseline y (mm from the top), width (mm), font size (pt), string
// gfx rows  : page, operation, fill, stroke, line width (mm), rectangles "x y w h" or segments "(x1,y1)-(x2,y2)" in mm
// Compare with the layout: positions to 0.1 mm, frames and boxes, grey fills, fonts, number notation.
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(`${process.cwd()}/`);
const nc = require('@napi-rs/canvas');
globalThis.DOMMatrix = nc.DOMMatrix;
globalThis.Path2D = nc.Path2D;
globalThis.ImageData = nc.ImageData;
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--') && a.toLowerCase().endsWith('.pdf'));
if (!file) { console.error('usage: node tools/pdf_probe.mjs <file.pdf> [--text] [--gfx] [--json out.json]'); process.exit(2); }
const wantText = args.includes('--text') || !args.includes('--gfx');
const wantGfx = args.includes('--gfx') || !args.includes('--text');
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;
const mm = (v) => +(v * 25.4 / 72).toFixed(2);
const OPS = Object.fromEntries(Object.entries(pdfjs.OPS).map(([k, v]) => [v, k]));

const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(file)), verbosity: 0 }).promise;
const out = { pages: [] };
for (let pn = 1; pn <= doc.numPages; pn++) {
  const page = await doc.getPage(pn);
  const H = page.view[3];
  const pg = { page: pn, widthMm: mm(page.view[2]), heightMm: mm(H), text: [], gfx: [] };
  if (wantText) {
    const tc = await page.getTextContent();
    pg.text = tc.items.filter((t) => t.str.trim()).map((t) => ({ x: mm(t.transform[4]), y: mm(H - t.transform[5]), w: mm(t.width), size: +Math.abs(t.transform[3]).toFixed(1), font: t.fontName, s: t.str }));
  }
  if (wantGfx) {
    const ol = await page.getOperatorList();
    let fill = null; let stroke = null; let lw = 1; let cur = [];
    const stack = [];
    for (let i = 0; i < ol.fnArray.length; i++) {
      const n = OPS[ol.fnArray[i]]; const a = ol.argsArray[i];
      if (n === 'setFillRGBColor') fill = a.join(',');
      else if (n === 'setStrokeRGBColor') stroke = a.join(',');
      else if (n === 'setLineWidth') lw = a[0];
      else if (n === 'save') stack.push({ fill, stroke, lw });
      else if (n === 'restore') { const s = stack.pop(); if (s) ({ fill, stroke, lw } = s); }
      else if (n === 'constructPath') {
        let ci = 0; const co = a[1];
        for (const o of a[0]) {
          const on = OPS[o];
          if (on === 'rectangle') { const [x, y, w, h] = co.slice(ci, ci + 4); ci += 4; cur.push({ t: 'rect', x: mm(x), y: mm(H - y - h), w: mm(w), h: mm(h) }); }
          else if (on === 'moveTo') { const [x, y] = co.slice(ci, ci + 2); ci += 2; cur.push({ t: 'm', x: mm(x), y: mm(H - y) }); }
          else if (on === 'lineTo') { const [x, y] = co.slice(ci, ci + 2); ci += 2; cur.push({ t: 'l', x: mm(x), y: mm(H - y) }); }
          else if (on === 'curveTo') ci += 6; else if (on === 'curveTo2' || on === 'curveTo3') ci += 4;
        }
      } else if (['stroke', 'closeStroke', 'fill', 'eoFill', 'fillStroke', 'eoFillStroke', 'closeFillStroke'].includes(n)) {
        const segs = [];
        for (let k = 0; k + 1 < cur.length; k++) if (cur[k].t === 'm' && cur[k + 1].t === 'l') segs.push([cur[k].x, cur[k].y, cur[k + 1].x, cur[k + 1].y]);
        pg.gfx.push({ op: n, fill, stroke, lw: +(lw * 25.4 / 72).toFixed(2), rects: cur.filter((p) => p.t === 'rect').map((r) => [r.x, r.y, r.w, r.h]), segs });
        cur = [];
      } else if (n === 'endPath') cur = [];
    }
  }
  out.pages.push(pg);
  console.log(`=== page ${pn} (${pg.widthMm} x ${pg.heightMm} mm)`);
  for (const t of pg.text) console.log(`T ${String(t.x).padStart(7)} ${String(t.y).padStart(7)} w${String(t.w).padStart(6)} ${String(t.size).padStart(4)}pt ${t.font} ${t.s}`);
  for (const g of pg.gfx) console.log(`G ${g.op} fill=${g.fill} stroke=${g.stroke} lw=${g.lw} ${g.rects.map((r) => `rect ${r.join(' ')}`).join('; ')} ${g.segs.map((s) => `(${s[0]},${s[1]})-(${s[2]},${s[3]})`).join('; ')}`.trim());
}
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(out));
