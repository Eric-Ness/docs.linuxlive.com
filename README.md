# docs.linuxlive.com

The documentation for [linuxlive.com](https://linuxlive.com) and the
[linuxlive](https://github.com/Eric-Ness/linuxlive) pipeline, published at
https://docs.linuxlive.com. It is an [Astro](https://astro.build) site using
[Starlight](https://starlight.astro.build), with Starlight's built-in Pagefind
search, in linuxlive.com's look: light only, IBM Plex and Newsreader, all
self-hosted.

It replaces the pipeline's GitHub wiki, whose pages now point here.

## Sources

Every page follows the code it describes. When one of these changes, update
the page that describes it, and do not document behaviour the sources do not
state:

| Pages | Source of truth |
|---|---|
| `workshop/` | linuxlive-site: `src/pages/workshop.astro`, `src/scripts/wizard.js`, `src/lib/kit.js` (limits and messages) |
| `distros/`, `start/` | linuxlive-site: `src/pages/me.astro`, `build.astro`, `library/`, `learn.astro`, `src/worker/`; linuxlive-library; linuxlive-builds |
| `spec/`, `changelog.md` | linuxlive: `README.md`, `linuxlive/data/spec.schema.json`, `linuxlive/data/catalog.yaml`, `examples/`, `.github/workflows/build.yml` |
| `help/` | linuxlive: the verifier and `scripts/boottest.py`; linuxlive-site: `learn.astro` |

A new linuxlive release usually means: a line in `changelog.md`, new fields in
`spec/reference.md` (and `spec/catalog.md` if the catalog moved), and the
Workshop pages if the Workshop gained a field.

## Layout

| Path | Contents |
|---|---|
| `src/content/docs/` | The pages, in Markdown. Folders match the sidebar: `start/`, `workshop/`, `distros/`, `spec/`, `help/`, plus `index.mdx` and `changelog.md` |
| `src/assets/shots/` | Screenshots of linuxlive.com, made by `npm run screenshots` |
| `src/styles/theme.css` | linuxlive.com's colours and fonts on Starlight |
| `src/components/` | Overrides: light only (no theme picker) and the header's links back to linuxlive.com |
| `astro.config.mjs` | Site config and the sidebar |
| `scripts/check-dist.mjs` | Checks on `dist/`: links, privacy, content |
| `scripts/screenshots.mjs` | Fills in the Workshop in a headless Chrome or Edge and saves each step |
| `wrangler.jsonc` | Cloudflare Workers static assets config, publishing `dist/` |

## Build and check

Needs Node 22 (22.19 or later) and npm.

```sh
npm ci                 # install the pinned versions
npm run dev            # live-reloading server at http://localhost:4321
npm run build          # build to dist/; fails on a broken link in the Markdown (starlight-links-validator)
npm run check          # build, then every check below
npm run check:links    # every internal link and #fragment in dist/, sidebar and header included
npm run check:privacy  # nothing loads from another site: fonts, scripts, images, styles
npm run check:content  # every page was built and covers what it is for; images have alt text
npm run screenshots    # retake src/assets/shots/ from https://linuxlive.com (BASE=... for another)
```

## Deploy (Cloudflare Workers Builds)

A Worker with static assets, built by Cloudflare from GitHub, like
docs.satellitedata.net.

1. In Cloudflare, open **Workers & Pages**, then **Create**, then **Import a
   repository**, and pick `Eric-Ness/docs.linuxlive.com`.
2. Set the Worker name `docs-linuxlive-com` (it must match `name` in
   `wrangler.jsonc`), production branch `main`, build command `npm run build`,
   deploy command `npx wrangler deploy`.
3. **Deploy**. Wrangler publishes only `dist/`, with `dist/404.html` for
   unknown paths.
4. Open the Worker, then **Settings**, then **Domains & Routes**, then **Add**,
   then **Custom domain**: `docs.linuxlive.com`. Cloudflare adds the DNS record,
   since linuxlive.com's zone is in the same account.

From then on a push to `main` rebuilds and publishes the site. Cloudflare reads
`.node-version` (22) for the build. No secrets are needed.
