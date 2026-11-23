// Copies the DTB Legal Dictionary Study Module next to the Legal Authority Analyzer, reskinned to
// match it. The copy is gitignored: this repo is public and the dictionary text is not ours to publish.
// Run again whenever the Study Module changes:
//   node scripts/laa-sync-dictionary.mjs "<path to DTB_Legal_Dictionary_Study_Module.html>"
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const src = process.argv[2];
if (!src) { console.error('usage: node scripts/laa-sync-dictionary.mjs "<path to study module .html>"'); process.exit(1); }
const html = readFileSync(src, 'utf8');
// Fail loudly if the module stops looking like the thing this skin was written for.
for (const mark of ['</head>', '</body>', "KEY='dtb-study-v1'", '--surface2', 'nav button[aria-selected="true"]']) assert.ok(html.includes(mark), 'source is missing: ' + mark);

const skin = `<style id="laa-skin">
@media screen{
:root{--bg:#14141c;--surface:#1a1a24;--surface2:#14141c;--line:#303038;--text:#f8f8f8;--muted:#a0a0a8;--gold:#b08a2e;--gold2:#d4a843;--font:Inter,-apple-system,'Segoe UI',system-ui,sans-serif}
:root[data-theme="light"]{--bg:#ffffff;--surface:#f7f7f2;--surface2:#ffffff;--line:#dcdcd2;--text:#1a1a20;--muted:#5a5a62;--gold:#96700a;--gold2:#8a6508;--ok:#15662f;--bad:#b42318;--warn:#7a5200;--blue:#285870}
:root{color-scheme:dark}
:root[data-theme="light"]{color-scheme:light}
*{border-radius:0!important}
.st::before{border-radius:50%!important}
[data-theme="light"] .st-unseen{color:#5a5a62}
header{margin:0 0 12px}
main{margin:0}
nav button:hover,.btn:hover:not(:disabled){border-color:var(--gold)}
nav button[aria-selected="true"]{box-shadow:inset 0 -2px 0 var(--gold)}
.btn.primary{background:var(--gold);color:#1a1a20;font-weight:600}
button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,[tabindex]:focus-visible{outline-color:#e3c77a}
[data-theme="light"] :focus-visible{outline-color:#285870!important}
}
</style>
`;
const bridge = `<script id="laa-bridge">
(function(){
 var root=document.documentElement;
 function theme(t){root.setAttribute('data-theme',t==='light'?'light':'dark')}
 theme(new URLSearchParams(location.search).get('theme'));
 if(window.parent===window)return;
 window.addEventListener('message',function(e){if(e.source===window.parent&&e.data&&e.data.type==='laa-theme')theme(e.data.theme)});
 // Another open copy saved progress: pick it up so an idle copy cannot overwrite it later.
 window.addEventListener('storage',function(e){if(e.key==='dtb-study-v1'&&!document.hasFocus())location.reload()});
 window.parent.postMessage({type:'laa-dict-ready'},'*');
})();
</script>
`;
const at = html.lastIndexOf('</body>');
const out = (html.slice(0, at) + bridge + html.slice(at)).replace('</head>', () => skin + '</head>');
const dest = fileURLToPath(new URL('../tools/DTB_Legal_Dictionary_Study_Module.html', import.meta.url));
writeFileSync(dest, out);
console.log('wrote', dest, out.length, 'chars');
