// Checks the built site in dist/ (run `npm run build` first):
//   node scripts/check-dist.mjs links     every internal link and #fragment leads somewhere
//   node scripts/check-dist.mjs privacy   nothing is loaded from another site
//   node scripts/check-dist.mjs content   every page was built and says what it must
//   node scripts/check-dist.mjs all       all three
// starlight-links-validator checks the Markdown's links during the build; this
// also covers the sidebar, the header and anything a component writes.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = join(import.meta.dirname, '..', 'dist');
const SITE = 'https://docs.linuxlive.com';
const mode = process.argv[2];
const MODES = ['links', 'privacy', 'content'];
if (![...MODES, 'all'].includes(mode)) {
  console.error('usage: check-dist.mjs links|privacy|content|all');
  process.exit(2);
}
if (!existsSync(DIST)) {
  console.error('dist/ not found; run npm run build first');
  process.exit(1);
}

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
const files = walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const pageFor = (file) => '/' + relative(DIST, file).split(sep).join('/').replace(/index\.html$/, '').replace(/\.html$/, '');
const page = (p) => {
  const f = join(DIST, p, 'index.html');
  return existsSync(f) ? readFileSync(f, 'utf8') : '';
};

function links() {
  const problems = [];
  const idsByPage = new Map();
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8');
    idsByPage.set(pageFor(file), new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  const resolve = (pathname) => {
    const clean = decodeURIComponent(pathname);
    const asFile = join(DIST, clean);
    if (existsSync(asFile) && statSync(asFile).isFile()) return { page: null };
    if (existsSync(join(DIST, clean, 'index.html'))) return { page: clean.endsWith('/') ? clean : clean + '/' };
    // 404.html is the one page that is a file, not a folder; it links to itself.
    if (existsSync(join(DIST, clean.replace(/\/$/, '') + '.html'))) return { page: clean.replace(/\/$/, ''), file: true };
    return undefined;
  };
  let checked = 0;
  for (const file of htmlFiles) {
    const from = pageFor(file);
    const html = readFileSync(file, 'utf8');
    for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
      let url = m[1].replaceAll('&amp;', '&');
      if (url.startsWith(SITE)) url = url.slice(SITE.length) || '/';
      if (/^(https?:|mailto:|data:|javascript:|\/\/)/.test(url)) continue;
      if (url.startsWith('#')) url = from + url;
      if (!url.startsWith('/')) url = new URL(url, `http://x${from}`).pathname + (url.includes('#') ? url.slice(url.indexOf('#')) : '');
      const [pathAndQuery, hash] = url.split('#');
      const pathname = pathAndQuery.split('?')[0];
      checked++;
      const target = resolve(pathname);
      if (!target) { problems.push(`${from} -> ${url} (no such page or file)`); continue; }
      // Pages are folders (trailingSlash: 'always'); a link without the slash costs a redirect.
      if (target.page && !target.file && !pathname.endsWith('/') && pathname !== '') problems.push(`${from} -> ${url} (no trailing slash)`);
      if (hash && target.page && !idsByPage.get(target.page)?.has(decodeURIComponent(hash))) problems.push(`${from} -> ${url} (no element with id "${hash}")`);
    }
  }
  return { problems: [...new Set(problems)], ok: `${checked} internal links and fragments in ${htmlFiles.length} pages` };
}

// The same rule as linuxlive.com's own privacy check: no fonts, scripts, images
// or styles from anywhere else, so reading the docs tells no one else.
function privacy() {
  const problems = [];
  const SAME = /^https?:\/\/(docs\.)?linuxlive\.com(\/|$)/;
  const external = (url) => /^(https?:)?\/\//.test(url) && !SAME.test(url);
  for (const f of files.filter((x) => /\.(html|css|js|mjs|svg)$/.test(x))) {
    const text = readFileSync(f, 'utf8');
    const rel = relative(DIST, f);
    for (const bad of ['fonts.googleapis.com', 'fonts.gstatic.com', 'googletagmanager', 'google-analytics', 'plausible.io', 'cdn.jsdelivr', 'unpkg.com', 'cdnjs', 'gravatar.com', 'avatars.githubusercontent.com']) {
      if (text.includes(bad)) problems.push(`${rel} mentions ${bad}`);
    }
    const loads = [];
    for (const m of text.matchAll(/<(script|img|iframe|source|video|audio|embed)\b[^>]*\bsrc="([^"]+)"/g)) loads.push(m[2]);
    for (const m of text.matchAll(/\bsrcset="([^"]+)"/g)) loads.push(...m[1].split(',').map((s) => s.trim().split(/\s+/)[0]));
    for (const m of text.matchAll(/<link\b[^>]*>/g)) {
      const rel2 = (m[0].match(/\brel="([^"]+)"/) || [])[1] || '';
      const href = (m[0].match(/\bhref="([^"]+)"/) || [])[1] || '';
      if (!/\b(canonical|sitemap|alternate)\b/.test(rel2)) loads.push(href);
    }
    for (const m of text.matchAll(/url\(\s*['"]?([^'")]+)/g)) loads.push(m[1]);
    for (const m of text.matchAll(/\b(?:fetch|import)\(\s*['"`]([^'"`]+)/g)) loads.push(m[1]);
    for (const url of loads) if (external(url)) problems.push(`${rel} loads ${url}`);
  }
  if (!files.some((f) => /\.woff2$/.test(f))) problems.push('no self-hosted font files in the build');
  if (!existsSync(join(DIST, 'pagefind'))) problems.push('no pagefind/ index: search would not work');
  return { problems, ok: `${files.length} files, nothing loaded from another site` };
}

// Every page in the sidebar, and the words that show it covers what it is for.
const PAGES = {
  '': ['Build it for me', 'Build it in my GitHub', 'Download the kit'],
  'start/how-it-works': ['Secure Boot', 'BIOS', 'UEFI'],
  'start/first-distro': ['Workshop'],
  'start/ways-to-build': ['Build it for me', 'linuxlive-distro'],
  workshop: ['Base', 'Desktop', 'Apps', 'Look', 'Settings', 'Extras', 'Get it'],
  'workshop/base': ['Ubuntu', 'Fedora', 'ARM'],
  'workshop/desktop': ['GNOME', 'KDE Plasma', 'Cinnamon'],
  'workshop/apps': ['Flathub'],
  'workshop/look': ['Accent', 'Wallpaper', 'Logo', 'splash', 'watermark.png'],
  'workshop/settings': ['Language', 'Keyboard', 'Time zone', 'Computer name', 'Pin to the dock', 'Firefox', 'Kiosk', 'persistence'],
  'workshop/extras': ['Packages', 'first-boot', 'first-login', 'GitHub'],
  'workshop/get-it': ['id="download-the-kit"', 'id="build-it-in-my-github"', 'id="build-it-for-me"', '30 days'],
  'workshop/open-and-remix': ['kit', 'Remix'],
  'distros/my-distros': ['My distros'],
  'distros/build-page': ['build'],
  'distros/rebuilds-and-updates': ['rebuild'],
  'distros/library': ['Library', 'linuxlive-library'],
  spec: ['linuxlive.yaml', 'validate'],
  'spec/reference': ['schema_version', 'branding', 'splash', 'dock', 'kiosk', 'persistence', 'arches'],
  'spec/catalog': ['firefox', 'de_DE'],
  'spec/examples': ['testos'],
  'spec/boot-splash': ['Plymouth', 'watermark.png', 'Window.GetWidth'],
  'spec/dock': ['Nemo', 'Dolphin'],
  'spec/github-actions': ['build.yml'],
  'spec/building-locally': ['podman'],
  'help/build-checks': ['Secure Boot', 'BIOS'],
  'help/failed-builds': ['package'],
  'help/virtualbox': ['VirtualBox', 'EFI'],
  'help/usb-stick': ['sha256sum', 'Get-FileHash', 'Rufus'],
  'help/secure-boot': ['shim'],
  'help/installing': ['erase'],
  'help/known-limits': ['Fedora'],
  changelog: ['0.9.1', '0.9.0', '0.1.'],
};

function content() {
  const problems = [];
  for (const [p, words] of Object.entries(PAGES)) {
    const html = page(p);
    if (!html.includes('</html>')) { problems.push(`/${p}${p ? '/' : ''} was not built`); continue; }
    for (const w of words) if (!html.includes(w)) problems.push(`/${p}${p ? '/' : ''} lacks ${JSON.stringify(w)}`);
    // Light only, like linuxlive.com.
    if (html.includes('starlight-theme-select')) problems.push(`/${p}/ still has a theme picker`);
  }
  if (!readFileSync(join(DIST, '404.html'), 'utf8').includes('</html>')) problems.push('404.html was not built');
  const home = page('');
  if (!home.includes('href="https://linuxlive.com/workshop/"')) problems.push('the header does not link to the Workshop');
  // Screenshots named in a page must exist (Astro hashes imported images; plain ones live in public/shots/).
  for (const file of htmlFiles) {
    for (const m of readFileSync(file, 'utf8').matchAll(/<img\b[^>]*\balt="([^"]*)"/g)) {
      if (!m[1].trim()) problems.push(`${pageFor(file)} has an image without alt text`);
    }
  }
  return { problems, ok: `${Object.keys(PAGES).length} pages say what they must` };
}

const run = { links, privacy, content };
let failed = false;
for (const m of mode === 'all' ? MODES : [mode]) {
  const { problems, ok } = run[m]();
  if (problems.length) {
    failed = true;
    console.error(`${m.toUpperCase()} CHECK FAILED:\n- ${problems.join('\n- ')}`);
  } else console.log(`${m.toUpperCase()} CHECK OK: ${ok}`);
}
process.exit(failed ? 1 : 0);
