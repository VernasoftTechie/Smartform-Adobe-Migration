// Minimal dependency-free XML reader for SAP Smart Form / SmartStyle downloads.
// Produces { name, attrs, children[], text } trees. Namespaces are kept in the tag name (sf:NODE).
const ENT = { '&lt;': '<', '&gt;': '>', '&amp;': '&', '&quot;': '"', '&apos;': "'" };
const dec = (s) => s.replace(/&(lt|gt|amp|quot|apos);|&#(\d+);|&#x([0-9a-fA-F]+);/g, (m, n, d, h) =>
  n ? ENT[m] : String.fromCodePoint(d ? Number(d) : parseInt(h, 16)));

export function parseXml(src) {
  const root = { name: '#root', attrs: {}, children: [], text: '' };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!\[CDATA\[([\s\S]*?)\]\]>|<(\/?)([A-Za-z_][\w:.-]*)((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>|([^<]+)/g;
  let m;
  while ((m = re.exec(src))) {
    const top = stack[stack.length - 1];
    if (m[1] !== undefined) top.text += m[1];
    else if (m[3]) {
      if (m[2]) { if (stack.length > 1) stack.pop(); continue; }
      const attrs = {};
      for (const a of m[4].matchAll(/([\w:.-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) attrs[a[1]] = dec(a[3] ?? a[4]);
      const el = { name: m[3], attrs, children: [], text: '' };
      top.children.push(el);
      if (!m[5]) stack.push(el);
    } else if (m[6] !== undefined) top.text += dec(m[6]);
  }
  return root.children[0];
}
export const kids = (el, name) => (el ? el.children.filter((c) => c.name === name) : []);
export const kid = (el, name) => kids(el, name)[0];
export const val = (el, name) => (kid(el, name)?.text ?? '').trim();
