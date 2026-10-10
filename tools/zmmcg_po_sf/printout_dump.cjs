// Reads text items (cm from the top-left), vector lines/rectangles of a legacy printout PDF. npm i pdfjs-dist@3.11.174; node printout_dump.cjs in.pdf out.json
const fs = require('fs');
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
const CM = 28.3465; // pt per cm
(async () => {
  const data = new Uint8Array(fs.readFileSync(process.argv[2]));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  const out = { pages: [] };
  for (let p = 1; p <= doc.numPages; p += 1) {
    const page = await doc.getPage(p);
    const H = page.view[3];
    const tc = await page.getTextContent();
    const texts = tc.items.filter((i) => i.str.trim()).map((i) => ({
      s: i.str, x: +(i.transform[4] / CM).toFixed(2), yTop: +((H - i.transform[5] - i.height) / CM).toFixed(2), yBase: +((H - i.transform[5]) / CM).toFixed(2),
      size: +Math.hypot(i.transform[0], i.transform[1]).toFixed(1), w: +(i.width / CM).toFixed(2), font: i.fontName,
    }));
    const ops = await page.getOperatorList();
    const OPS = pdfjs.OPS;
    const shapes = [];
    let lw = 1; let fill = null; let stroke = null;
    const rgb = (a) => (a ? a.join(',') : null);
    for (let i = 0; i < ops.fnArray.length; i += 1) {
      const fn = ops.fnArray[i]; const a = ops.argsArray[i];
      if (fn === OPS.setLineWidth) lw = a[0];
      else if (fn === OPS.setFillRGBColor) fill = [a[0], a[1], a[2]];
      else if (fn === OPS.setStrokeRGBColor) stroke = [a[0], a[1], a[2]];
      else if (fn === OPS.constructPath) {
        const [subOps, coords] = a; let ci = 0; const pts = [];
        const segs = [];
        for (const so of subOps) {
          if (so === OPS.moveTo) { segs.push(['m', coords[ci], coords[ci + 1]]); ci += 2; }
          else if (so === OPS.lineTo) { segs.push(['l', coords[ci], coords[ci + 1]]); ci += 2; }
          else if (so === OPS.rectangle) { segs.push(['r', coords[ci], coords[ci + 1], coords[ci + 2], coords[ci + 3]]); ci += 4; }
          else if (so === OPS.curveTo) ci += 6; else if (so === OPS.curveTo2 || so === OPS.curveTo3) ci += 4;
        }
        // look ahead for paint op
        let paint = null; for (let j = i + 1; j < ops.fnArray.length && j < i + 3; j += 1) { const f2 = ops.fnArray[j]; if (f2 === OPS.stroke || f2 === OPS.fill || f2 === OPS.eoFill || f2 === OPS.fillStroke || f2 === OPS.closeStroke || f2 === OPS.endPath) { paint = f2; break; } }
        shapes.push({ segs, paint: paint === OPS.stroke || paint === OPS.closeStroke ? 'S' : (paint === OPS.fill || paint === OPS.eoFill ? 'F' : (paint === OPS.fillStroke ? 'FS' : 'n')), lw, fill: rgb(fill), stroke: rgb(stroke) });
      }
    }
    out.pages.push({ page: p, H, texts, shapes });
  }
  fs.writeFileSync(process.argv[3], JSON.stringify(out));
  console.log('ok', out.pages.map((p) => `${p.texts.length} texts ${p.shapes.length} shapes`).join(' | '));
})().catch((e) => { console.error(e); process.exit(1); });
