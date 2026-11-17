// Self-test for the pure core of tools/Legal_Authority_Analyzer.html (citation parser, mode
// detection, markdown renderer, checklist/frontmatter helpers). Run: node scripts/laa-selftest.mjs
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('../tools/Legal_Authority_Analyzer.html', import.meta.url), 'utf8');
const core = html.match(/<script id="laa-core">([\s\S]*?)<\/script>/)[1];
const cfg = JSON.parse(html.match(/<script id="laa-config" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const C = new Function(core + '; return { parseCitations, detectMode, termItems, renderMarkdown, extractChecklist, setFrontmatterField, checklistFromCites };')();
const parse = t => C.parseCitations(t, cfg.positiveLawTitles);

// Statutes at Large: govinfo for vol >= 65, Library of Congress before
let c = parse('Public Law 114-105, 129 Stat. 2219');
assert.equal(c.length, 2);
assert.ok(c.find(x => x.type === 'stat').links[0].url.endsWith('STATUTE-129/pdf/STATUTE-129-Pg2219.pdf'));
assert.ok(c.find(x => x.type === 'pl').links[0].url.endsWith('PLAW-114publ105'));
c = parse('40 Stat. 1143 (Revenue Act 1918, §1307)');
assert.equal(c.length, 1);
assert.ok(c[0].links[0].url.includes('loc.gov') && !c[0].links.some(l => l.url.includes('STATUTE-40')));

// Public Law before the 104th Congress has no govinfo PLAW link; ordinal suffix is correct
c = parse('Pub. L. No. 101-73');
assert.equal(c[0].cite, 'Pub. L. No. 101-73');
assert.ok(!c[0].links.some(l => l.url.includes('PLAW-')));
assert.ok(c[0].links.some(l => l.url.endsWith('/101st-congress')));
assert.ok(parse('P.L. 112-240')[0].links.some(l => l.url.endsWith('/112th-congress')));

// U.S.C. / IRC dedupe, subsections, positive-law flag
c = parse('26 U.S.C. § 6402 and IRC § 6402');
assert.equal(c.length, 1);
assert.equal(c[0].positiveLaw, false);
assert.equal(parse('IRC § 3401(a)')[0].cite, '26 U.S.C. § 3401(a)');
assert.equal(parse('18 USC 1001')[0].positiveLaw, true);
assert.ok(parse('26 U.S.C. § 7701(a)(26)')[0].links[0].url.includes('title26-section7701&'));

// CFR section vs part; U.S. Reports not confused with U.S.C.
assert.ok(parse('26 CFR 1.61-1')[0].links[0].url.endsWith('/title-26/section-1.61-1'));
assert.ok(parse('26 C.F.R. Part 301')[0].links[0].url.endsWith('/title-26/part-301'));
c = parse('United States v. Welden, 377 U.S. 95 (1964); 42 U.S.C. § 1983');
assert.deepEqual(c.map(x => x.type).sort(), ['usc', 'usrep']);

// Mode detection
assert.equal(C.detectMode('jurat, affiant', parse('jurat, affiant')), 'etymology');
const s = '40 Stat. 1143 (Revenue Act 1918, §1307)';
assert.equal(C.detectMode(s, parse(s)), 'statute');
const t = 'person, individual, 26 U.S.C. § 7701';
assert.equal(C.detectMode(t, parse(t)), 'termInStatute');
assert.deepEqual(C.termItems(t), ['person', 'individual']);

// Renderer escapes model output before adding markup
const r = C.renderMarkdown('# T\n<img src=x onerror=alert(1)>\n[x](javascript:alert(1)) [ok](https://a.gov/b)\n| a | b |\n|---|---|\n| 1 | 2 |');
assert.ok(!r.includes('<img') && r.includes('&lt;img'));
assert.ok(!r.includes('href="javascript'));
assert.ok(r.includes('href="https://a.gov/b"') && r.includes('<table>'));

// Checklist + frontmatter
const md = '---\nmode: x\nverified_by_operator: false\n---\n## Verification Checklist\n- [ ] Check A\n- [x] Check B';
assert.deepEqual(C.extractChecklist(md).map(i => i.text), ['Check A', 'Check B']);
assert.ok(C.setFrontmatterField(md, 'verified_by_operator', 'true').includes('verified_by_operator: true\n---'));
assert.equal(C.checklistFromCites(parse('129 Stat. 2219')).length, 1);

console.log('laa-selftest: all checks passed');
