# Overnight Radio website — instructions for AI coding assistants

These instructions are for any AI coding assistant working in this repository (ChatGPT Codex, Claude Code, etc.).
`CLAUDE.md` just points here, so there is one set of instructions.

## Start here

Read `README.md` first: it documents every content file, setting, feature, design and the deploy. Keep it accurate —
if you add, change or remove a feature, setting, content field or workflow, update `README.md` (and `.pages.yml` if
a content field changed) in the same change.

The site is the website for Overnight Radio Inc. (overnightradio.com), a radio commercial production house. It's a
redesign of the original site: same pages, wording and URLs, new look. Two people work on it: the developer and the
site owner (the client), who is not technical and will ask for changes in plain English.

## The project

- Static site built with **Eleventy 3** (Node 18+). Edit only files in `src/`; `_site/` is generated — never edit it.
- Install: `npm install`. Preview: `npm start` (http://localhost:8080, reloads on save). Build: `npm run build`.
- Content is plain files: announcers in `src/team/*.md`, spots in `src/work/*.md`, blog posts in
  `src/blog/posts/*.md`, prices/testimonials/contact details/menu in `src/_data/*.json`.
- There are no tests; check changes by building and looking at the pages.

## Rules

- **Keep the owner's wording.** Don't rewrite, "improve" or shorten site copy unless asked. When adding pasted text,
  only convert it to Markdown.
- **Keep URLs stable.** Don't rename files in `src/team/`, `src/work/` or `src/blog/posts/` — the file name is the
  page address and old links/Google results depend on it.
- **One design: After Hours (A).** The owner chose it in October 2026. All layout and styling is in
  `src/*.njk`, `src/_includes/` and `src/assets/css/site.css`. The other designs from the review (themes B–D and
  the Dial, Script, Night Shift, Bento and Session concepts) are archived on the `archive/design-review` branch —
  don't merge that branch into `main`, and don't bring archived designs back unless asked (README section 7).
- **Links must work in a sub-folder.** The test site lives at `/testing/onr/`; the build rewrites links in HTML
  automatically (`PATH_PREFIX`), but JavaScript must not hard-code root paths like `"/team.html"` — work out the
  base folder from the script's own address the way `src/assets/js/blog-search.js` does.
- **Fonts are self-hosted** in `src/assets/fonts/` — don't add Google Fonts (or other third-party) links.
- **Photos and audio** currently load from the live overnightradio.com (`assetBase` in `src/_data/site.json`).
  New photos go in `src/images/announcers/`, new audio in `src/audio/`.
- Match the surrounding code's style; keep changes small and focused.

## Common requests

- **New blog post from pasted text:** create `src/blog/posts/<short-hyphenated-slug>.md` with `title`, `date`
  (today unless given, `YYYY-MM-DD`), `author: "Overnight Radio"`, `categories` (Commercials / General / Music,
  best fit), `keywords` (reuse existing tags where they fit) and a one-sentence `description`. Keep the author's
  text; blank line between paragraphs; escape a line-starting `#` as `\#`. The listing (5 per page), archives,
  search and RSS update automatically.
- **New or updated announcer:** one file in `src/team/` (copy an existing one; README section 4.1 explains every
  field). Photo → `src/images/announcers/`, sample → `src/audio/`. `order` sets the position on the Team page.
- **Prices / testimonials / phone / email / menu:** `src/_data/pricing.json`, `testimonials.json`, `site.json`.
- **Page wording:** the page's `.njk` file in `src/`.

## Before you finish

1. `npm run build` — it must finish without errors.
2. Look at the changed pages, at desktop and phone width.
3. Update `README.md` if anything it documents changed.
4. Explain the change in plain English, then commit.

## Deploying

The repository is `github.com/kraaly53/onr`. **Every push to `main` builds the site and uploads it** by FTP to the
test site at https://www.ordinaryspoon.com/testing/onr/ (`.github/workflows/deploy.yml`, about 3–6 minutes; the
run's last step checks the pages load). So:

- Work on a branch / pull request; merging to `main` is what publishes. Don't push straight to `main` unless asked.
- Never print, log or commit the FTP secrets (`FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`). The repository is
  public, and so are its Actions logs.
- On the server the FTP login starts inside `public_html`, so the upload path is `/ordinaryspoon.com/testing/onr`
  — don't add `/public_html` to it.
- The hosting caches for up to an hour; CSS/JS links carry a `?v=<build>` version and `src/.htaccess` turns off
  caching for pages. If something looks stale after a deploy, add `?v=1` to the address.

## Open items before going live on overnightradio.com (README section 9)

- Replace the contact form's destination — it still posts to the old WordPress install.
- Copy photos/audio into the repo and set `assetBase` to `""`.
- Point the deploy at the overnightradio.com web folder with `PATH_PREFIX` `/`, and set up the redirects in README
  section 8.
