// Conformance of the generated layout with the client's wizard-generated form of this Smart Form
// (docs/legacy_grab/wizard_reference/ZMMCG_PO_SF_F.XDP). That form reproduces the legacy printout (ZPOS sample);
// positions are compared as absolute page coordinates in mm, tolerance 0.15 mm unless stated.
// Returns a list of differences (empty = conforms).

const HDR_X = 7.5; // x offset of the page-1 content area

function el(txt, name, from = 0) {
  const m = new RegExp(`<(field|draw|subform)([^>]*?) name="${name}"([^>]*)>`).exec(txt.slice(from));
  if (!m) return null;
  const attrs = `${m[2]} ${m[3]}`;
  const g = (k) => { const x = new RegExp(`(?:^| )${k}="([^"]*)"`).exec(attrs); return x ? parseFloat(x[1]) : undefined; };
  const chunk = txt.slice(from + m.index, from + m.index + 1500);
  const mg = /<margin bottomInset="([\d.]+)mm" leftInset="([\d.]+)mm" rightInset="([\d.]+)mm" topInset="([\d.]+)mm"/.exec(chunk);
  return { x: g('x'), y: g('y'), w: g('w'), h: g('h'), minH: g('minH'), idx: from + m.index, chunk, m: mg ? { b: +mg[1], l: +mg[2], r: +mg[3], t: +mg[4] } : null, align: /hAlign="(\w+)"/.exec(chunk)?.[1] };
}
const near = (a, b, tol = 0.15) => a !== undefined && b !== undefined && Math.abs(a - b) <= tol;
const hh = (e) => e?.h ?? e?.minH ?? 0;

function pageAreas(txt) {
  const out = {};
  for (const m of txt.matchAll(/<pageArea id="(Page\d)"[^>]*>\s*<contentArea h="([\d.]+)mm"(?: name="[^"]*")? w="([\d.]+)mm" x="([\d.]+)mm" y="([\d.]+)mm"/g)) out[m[1]] = m.slice(2).map(Number);
  return out;
}

export function conformance(ref, mine) {
  const bad = [];
  // page areas (h, w, x, y)
  const A = pageAreas(ref); const B = pageAreas(mine);
  for (const id of ['Page1', 'Page2']) if (!A[id] || !B[id] || A[id].some((v, i) => !near(v, B[id][i], 0.01))) bad.push(`content area ${id}: wizard ${A[id]} generated ${B[id]}`);
  // watermark
  const wr = [...ref.matchAll(/name="WATER_MARK" w="180mm" x="([\d.]+)mm" y="([\d.]+)mm"/g)];
  const wm = [...mine.matchAll(/<field h="6mm" name="WATER_MARK" w="180mm" x="([\d.]+)mm" y="([\d.]+)mm"/g)];
  for (let i = 0; i < 2; i++) if (!wr[i] || !wm[i] || !near(+wr[i][1], +wm[i][1]) || !near(+wr[i][2], +wm[i][2])) bad.push(`watermark page ${i + 1}: wizard ${wr[i]?.slice(1)} generated ${wm[i]?.slice(1)}`);
  // logo
  { const R = el(ref, 'LOGO'); const M = el(mine, 'LOGO');
    if (!(near(R.x + HDR_X, M.x) && near(R.y, M.y) && near(R.w, M.w, 0.1) && near(R.h, M.h, 0.1))) bad.push(`logo: wizard ${R.x + HDR_X}/${R.y} ${R.w}x${R.h} generated ${M.x}/${M.y} ${M.w}x${M.h}`); }
  // title and PO number: same centre, same top (first baseline = top + 0.717 em), 18 pt bold
  for (const [rn, mn] of [['FORM_TITLE', 'HEADING'], ['V_EBELN', 'V_EBELN']]) {
    const R = el(ref, rn); const M = el(mine, mn);
    if (!(near(R.x + R.w / 2, M.x + M.w / 2) && near(R.y, M.y, 0.05))) bad.push(`${mn}: wizard centre ${R.x + R.w / 2} top ${R.y} generated centre ${M.x + M.w / 2} top ${M.y}`);
    if (!/size="18pt" typeface="Arial" weight="bold"/.test(M.chunk)) bad.push(`${mn}: font is not 18 pt bold`);
  }
  // plant address
  { const R = el(ref, 'COMPANY'); const M = el(mine, 'DELVRY_ADD'); const Rl = el(ref, 'LINE'); const Ml = el(mine, 'LINE');
    if (!(near(R.x, M.x) && near(R.y, M.y) && near(Rl.h, Ml.h, 0.01))) bad.push(`address: wizard ${R.x}/${R.y} line ${Rl.h} generated ${M.x}/${M.y} line ${Ml.h}`); }
  // last changed: absolute text origin
  { const R = el(ref, 'LV_VAR4'); const M = el(mine, 'PO_LAST_CHANGED'); const c = el(mine, 'LAST_CHANGED', M.idx);
    if (!(near(R.x, M.x + c.m.l) && near(R.y, M.y + c.m.t))) bad.push(`last changed: wizard ${R.x}/${R.y} generated ${M.x + c.m.l}/${M.y + c.m.t}`); }
  // grids
  { const sup = el(mine, 'SUPPLIER_ADD'); const det = el(mine, 'PO_DETAIL');
    [...ref.matchAll(/<draw h="4\.692mm" w="40mm" x="0mm" y="([\d.]+)mm"/g)].forEach((m, i) => {
      const c = el(mine, `TEMPLATE4_R${i + 1}C1`);
      if (!c || !near(sup.y + c.y, +m[1], 0.12) || !near(c.w, 40, 0.01) || c.m?.t !== 1.122 || c.m?.l !== 0.7) bad.push(`supplier row ${i + 1}: wizard y ${m[1]} generated ${c && sup.y + c.y} margin ${JSON.stringify(c?.m)}`);
    });
    [...ref.matchAll(/<draw h="4\.692mm" w="32mm" x="103\.8mm" y="([\d.]+)mm"/g)].forEach((m, i) => {
      const c = el(mine, `TEMPLATE2_R${i + 1}C1`);
      if (!c || !near(det.y + c.y, +m[1], 0.12) || !near(det.x, 103.8, 0.01) || !near(c.w, 32, 0.01)) bad.push(`detail row ${i + 1}: wizard y ${m[1]} generated ${c && det.y + c.y}`);
    });
    const last = el(mine, 'TEMPLATE2_R10C2');
    if (!near(det.y + last.y + last.h, 129.0, 0.1) || last.m.t !== 1.092 || last.m.l !== 0.35) bad.push(`detail last row ends ${det.y + last.y + last.h} margin ${JSON.stringify(last.m)}`); }
  // item table
  { const cw = (t, n) => new RegExp(`columnWidths="([^"]*)" layout="table" name="${n}"`).exec(t)?.[1];
    // the sample is a service order: compare with the service table (the goods table has its own widths in the export)
    if (cw(ref, 'IT_EKPO') !== cw(mine, 'GT_SERVICE')) bad.push(`table columnWidths wizard ${cw(ref, 'IT_EKPO')} generated ${cw(mine, 'GT_SERVICE')}`);
    const H1 = el(mine, 'H1', mine.indexOf('name="GT_SERVICE"'));
    if (!/<draw h="7\.6mm" w="11\.3mm">/.test(ref) || H1.h !== 7.6 || H1.m.t !== 1.122 || H1.m.l !== 0.3) bad.push('table heading cell (h 7.6, margin 1.122 / 0.3)');
    const map = [['V_SLNO', 'SLNO'], ['MATNR', 'SRVPOS'], ['TXZ01', 'DESCR'], ['MENGE', 'MENGE'], ['MEINS', 'MEINS'], ['UNITPRICE1', 'UNITPR'], ['TOTAL1', 'TOTAL']];
    for (const [rn, mn] of map) {
      const R = el(ref, rn, ref.indexOf('name="IT_EKPO"')); const M = el(mine, mn, mine.indexOf('name="GT_SERVICE"'));
      if (!(near(R.h, hh(M), 0.01) && R.m.t === M.m.t && R.m.l === M.m.l && R.m.r === M.m.r)) bad.push(`item cell ${mn}: wizard h ${R.h} ${JSON.stringify(R.m)} generated h ${hh(M)} ${JSON.stringify(M.m)}`);
      if (R.align !== M.align) bad.push(`item cell ${mn}: alignment wizard ${R.align} generated ${M.align}`);
    } }
  // totals block (sum of row heights), words row, terms
  { const seq = ['_ROW5', '_ROW6', '_ROW8', '_ROW9', 'OTHER_CHARGES', '_ROW11', '_ROW12', '_ROW13', '_CA', '_ROW14'].map((n) => {
      const at = mine.indexOf(`name="${n}"`); const seg = mine.slice(at, mine.indexOf('layout="table"', at + 10));
      return Math.max(hh(el(seg, 'C1')), hh(el(seg, 'C2')), hh(el(seg, 'C3')));
    });
    const sum = seq.reduce((a, v) => a + v, 0);
    if (!near(sum, 39.3, 0.3)) bad.push(`totals block height wizard 39.3 generated ${sum.toFixed(2)} (${seq.join('/')})`);
    const w1 = el(ref, 'AMOUNT_ROW'); const w2 = el(mine, 'WORDS');
    if (!near(w1.h, hh(w2), 0.01) || w2.m.t !== 1.122 || w2.m.l !== 0.7) bad.push('words row (h 4.2, margin 1.122 / 0.7)');
    const th = el(mine, 'C1', mine.indexOf('name="TERMS_SERVCE_PO_1_1"')); const rh = el(ref, 'TERMS_TITLE');
    if (!(near(th.h, rh.h, 0.01) && th.m.t === 4.422 && th.m.l === 1.18)) bad.push(`terms heading h ${th.h} ${JSON.stringify(th.m)} (wizard ${rh.h})`);
    const at = mine.indexOf('name="TERMS_SERVCE_PO_1_2"');
    const tn = el(mine, 'C2', at); const tt = el(mine, 'C4', at); const rn = el(ref, 'SLNO', ref.indexOf('name="TERMS"')); const rtx = el(ref, 'TEXT', ref.indexOf('name="TERMS"'));
    if (!(tn.m.t === rn.m.t && tn.m.l === rn.m.l && tt.m.t === rtx.m.t && tt.m.l === rtx.m.l && tt.m.r === rtx.m.r && /textIndent="0\.353mm"/.test(tt.chunk) && /lineHeight="3\.39mm"/.test(tt.chunk))) bad.push('terms cells (margins, hanging indent, line height 3.39)'); }
  return bad;
}
