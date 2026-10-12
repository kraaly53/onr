# Overnight Radio — website

The website for [overnightradio.com](https://overnightradio.com): a commercial production house in London, Ontario
offering radio commercial writing, voice overs and production.

This is a **redesign** of the original site. The pages, wording, addresses (URLs) and features are the same as
before; the look is new. The blog, which used to run on WordPress, is now part of this site as plain pages.

- **What it is:** a static website — the finished site is only HTML, CSS and JavaScript. No database, no PHP,
  no WordPress, nothing on the server to update or patch.
- **How it's made:** [Eleventy](https://www.11ty.dev/) (a free build tool) turns simple text files into the
  finished pages. Announcers, spots and blog posts are each **one small text file**, so updating the site
  means editing a file — not hand-editing HTML.

---

## Contents

1. [Quick start](#1-quick-start)
2. [How the project is organised](#2-how-the-project-is-organised)
3. [Pages and their addresses](#3-pages-and-their-addresses)
4. [Updating content](#4-updating-content)
   - [Team / announcers](#41-team--announcers) · [Our Work spots](#42-our-work-spots) ·
     [Blog posts](#43-blog-posts) · [Prices](#44-prices) · [Testimonials](#45-testimonials) ·
     [Contact details, social links and menu](#46-contact-details-social-links-and-menu) ·
     [Page wording](#47-page-wording) · [Script Calculator speeds](#48-script-calculator-read-speeds)
5. [Ways to edit](#5-ways-to-edit) — GitHub website, Pages CMS, Claude Code, your own computer
6. [What the site does (features)](#6-what-the-site-does-features)
7. [Design guide](#7-design-guide)
8. [Building and hosting](#8-building-and-hosting)
9. [Before launch — checklist](#9-before-launch--checklist)
10. [Changes from the old site](#10-changes-from-the-old-site)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Quick start

You need [Node.js](https://nodejs.org/) version 18 or newer (check with `node -v`).

```bash
npm install        # once, after downloading the project
npm start          # preview at http://localhost:8080 — the page reloads as you save changes
npm run build      # makes the finished website in the _site/ folder
```

`_site/` is what gets put on the web. It is rebuilt every time, so never edit files inside it — edit the files
in `src/` instead.

---

## 2. How the project is organised

```
overnightradio/
├── README.md                 ← this guide
├── CLAUDE.md                 ← short instructions for Claude Code (AI assistant)
├── .pages.yml                ← settings for the Pages CMS editor (see section 5)
├── eleventy.config.js        ← build settings: collections, blog pagination, filters
├── package.json              ← the build tool and the npm commands
└── src/                      ← EVERYTHING YOU EDIT LIVES HERE
    ├── _data/
    │   ├── site.json         ← phone, email, address, social links, menu, BBB seal, form settings
    │   ├── pricing.json      ← monthly package prices (Services page)
    │   └── testimonials.json ← client quotes (Our Work page)
    ├── team/                 ← one .md file per announcer / producer
    ├── work/                 ← one .md file per sample spot
    ├── blog/
    │   ├── posts/            ← one .md file per blog post
    │   ├── index.njk         ← blog listing (5 posts per page)
    │   ├── archive.njk       ← category, tag and month pages
    │   ├── search.njk        ← blog search page
    │   ├── search-index.njk  ← builds /blog/search.json for the search
    │   └── feed.njk          ← RSS feed (/blog/feed.xml)
    ├── index.njk             ← Home
    ├── services.njk          ← Our Services
    ├── work.njk              ← Our Work
    ├── team.njk              ← Team
    ├── calculator.njk        ← Script Calculator
    ├── contact.njk           ← Contact
    ├── privacypolicy.md      ← Privacy Policy
    ├── _includes/            ← shared layouts and pieces
    │   ├── base.njk          ← header, menu, footer — wraps every page
    │   ├── announcer.njk     ← layout of each announcer's personal page
    │   ├── spot.njk          ← layout of each Our Work spot page
    │   ├── post.njk          ← layout of each blog post
    │   ├── player.njk        ← the audio player
    │   ├── page-head.njk     ← the dark heading band at the top of inner pages
    │   ├── post-card.njk, blog-pager.njk, blog-sidebar.njk ← blog pieces
    │   ├── mark.njk          ← the logo (radio tower + rings), drawn in code
    │   └── icons.njk         ← small icons (play, arrows, social)
    ├── assets/
    │   ├── css/site.css      ← all layout and styling; design A
    │   ├── css/designs/      ← designs B, C, D and the switcher's styles (preview only)
    │   └── js/
    │       ├── site.js       ← menu, audio player, team quick-play & search, work filter, contact form
    │       ├── calculator.js ← Script Calculator
    │       └── blog-search.js← blog search
    ├── images/               ← photos & thumbnails  (to be copied in before launch — see section 9)
    ├── audio/                ← voice samples & spots (to be copied in before launch)
    └── sample/               ← the "Sample" spot audio (to be copied in before launch)
```

**File types:** `.md` files are content (a header between `---` lines, then text). `.njk` files are page
templates — HTML with a few `{{ placeholders }}`. `.json` files are lists of settings.

---

## 3. Pages and their addresses

All addresses are the same as the old site, so existing links and Google results keep working.

| Page | Address | Made from |
|---|---|---|
| Home | `/` and `/index.html` | `src/index.njk` |
| Our Services | `/services.html` | `src/services.njk` + `_data/pricing.json` |
| Our Work | `/work.html` | `src/work.njk` + files in `src/work/` + `_data/testimonials.json` |
| A spot | `/work/quiznos.html` | `src/work/quiznos.md` |
| Script Calculator | `/calculator.html` | `src/calculator.njk` |
| Team | `/team.html` | `src/team.njk` + files in `src/team/` |
| An announcer | `/team/allison.html` | `src/team/allison.md` |
| Contact | `/contact.html` | `src/contact.njk` |
| Privacy Policy | `/privacypolicy.html` | `src/privacypolicy.md` |
| Blog | `/blog/`, `/blog/page/2/` … | `src/blog/index.njk` |
| A blog post | `/blog/keep-your-ads-fresh/` | `src/blog/posts/keep-your-ads-fresh.md` |
| Blog category | `/blog/category/general/` | made automatically |
| Blog tag | `/blog/tag/radio-scripts/` | made automatically |
| Blog month | `/blog/2024/11/` | made automatically |
| Blog search | `/blog/search/?s=words` | `src/blog/search.njk` |
| RSS feed | `/blog/feed.xml` | `src/blog/feed.njk` |

**The rule for content files:** the file name becomes the address. `src/team/jordan.md` becomes
`/team/jordan.html`; `src/blog/posts/my-new-post.md` becomes `/blog/my-new-post/`. Use lowercase letters,
numbers and hyphens only in file names, and **don't rename existing files** — that changes their address
and breaks old links.

---

## 4. Updating content

Every content file looks like this: settings between two `---` lines, then the main text.

```markdown
---
setting: "value"
---
The main text goes here.
```

Keep the quote marks around text values, and keep the indentation and `---` lines exactly as they are.

### 4.1 Team / announcers

Each person is one file in `src/team/`. Example — `src/team/allison.md`:

```markdown
---
name: "Allison"
cardName: "Allison"
role: "Announcer"
group: talent
roster: roster
order: 3
photo: "/images/announcers/allison.jpg"
sampleLabel: "Announcer Sample"
sampleMp3: "/audio/allison.mp3"
sampleOgg: "/audio/allison.ogg"
seoTitle: "Allison - Female Voice Over Artist & Announcer | Overnight Radio Inc."
seoDescription: "Allison’s smooth, caring read can convey your message in a sensitive, friendly manner."
---
Allison’s smooth, caring read can convey your message in a sensitive, friendly manner.
```

| Setting | What it does |
|---|---|
| `name` | Name shown big on their personal page. |
| `cardName` | Name under their photo on the Team page. Optional — uses `name` if left out. |
| `role` | Small label above their name, e.g. `Announcer`, `Production`, `Child Announcer`, `Non-roster, extra units apply`. |
| `group` | `talent` (the Talent grid) or `production` (the large Production Team cards at the top). |
| `summary` | Production Team only: the short blurb shown on the Team page card. |
| `roster` | `roster` or `non-roster`. Non-roster people get a "Non-roster" label on the Team page. |
| `order` | Position on the Team page. Lower numbers come first. Numbers don't need to be consecutive (use 25, 26, 27… or 25.5 to squeeze someone in). |
| `photo` | Their photo. Square works best (it's cropped to a square), at least 600×600 pixels, JPG. |
| `cardPhoto` | Optional different photo for the Team page card (used by the two co-founders). |
| `sampleLabel` | Label above the audio player, e.g. `Announcer Sample` or `Production Sample`. |
| `sampleMp3` | Their voice sample, MP3. Required. |
| `sampleOgg` | The same sample as OGG. Optional — older browsers only; can be left as `""`. |
| `seoTitle` | Title in the browser tab and Google results. |
| `seoDescription` | One-sentence description for Google results. |
| *(text below `---`)* | Their bio. Separate paragraphs with a blank line. |

**Add a new announcer**
1. Copy any announcer file (e.g. `allison.md`) to a new name, e.g. `jordan.md`.
2. Change the settings and bio.
3. Add their photo to `src/images/announcers/jordan.jpg` and sample to `src/audio/jordan.mp3`, and point
   `photo` and `sampleMp3` at them.
4. They appear on the Team page and get their own page at `/team/jordan.html` automatically. The
   Previous/Next links between announcer pages update too.

**Update a bio or sample** — edit the text, or replace the audio file with a new one of the same name.
(Browsers may cache old audio; giving the new file a new name, e.g. `jordan-2026.mp3`, avoids that.)

**Remove someone** — delete their file (and optionally their photo and audio). Their page disappears.

**Reorder** — change `order` numbers.

### 4.2 Our Work spots

Each sample spot is one file in `src/work/`. Example — `src/work/quiznos.md`:

```markdown
---
title: "Quiznos"
category: Creative
order: 13
thumb: "/images/thumbnails/quiznos.jpg"
spotMp3: "/audio/quiznos.mp3"
spotOgg: "/audio/quiznos.ogg"
seoTitle: "Quiznos - Creative Voice Over Scripts | Overnight Radio Inc."
seoDescription: "Quiznos Creative Voice spot radio ad audio example from Overnight Radio."
---
**SFX**: restaurant ambience, elegant music in...

**V1**: (snooty waitor)
Hello, I'm your waitor Surge, would you like to hear za specials?

**Anncr**: The new Angus Double Steak and Cheese Sandwich is now on the menu!
```

- `category` must be one of `Hardsell`, `Medium`, `Softsell`, `Creative`, `Sample` — these are the filter
  buttons on the Our Work page and set the card's colour.
- `order` is the position on the Our Work page.
- `thumb` is kept from the old site but **not shown** — the new cards are designed in code, so new spots
  don't need an image.
- The script goes below `---`. Start each line with the speaker in bold (`**SFX**:`, `**V1**:`, `**Anncr**:`,
  `**Tag**:`) — the site lines the speaker labels up in a column. Lines without a speaker (like
  `(upbeat music in)`) are fine. End a line with two spaces to keep the next line in the same block.
- A spot with no script (like `sample.md`) just shows the player.

### 4.3 Blog posts

Each post is one file in `src/blog/posts/`. Example — `src/blog/posts/keep-your-ads-fresh.md`:

```markdown
---
title: "Keep your Ads Fresh!"
date: 2022-05-24
author: "Overnight Radio"
categories: ["General"]
keywords: ["radio ads", "scripts"]
description: "One or two sentences for Google."
---
Imagine seeing the same social media post day, after day, after day...

Next paragraph after a blank line.
```

| Setting | What it does |
|---|---|
| `title` | The post title. |
| `date` | `YYYY-MM-DD`. Posts are listed newest first by this date. |
| `author` | Shown as "By …". Usually `Overnight Radio`. |
| `categories` | One or more of `Commercials`, `General`, `Music` — or a new one (it gets its own page automatically). Written as a list: `["Commercials", "General"]`. |
| `keywords` | The post's tags, shown at the bottom of the post; each gets a `/blog/tag/…/` page. Can be `[]`. (Named `keywords` rather than `tags` because Eleventy reserves `tags` for itself.) |
| `description` | Short summary for Google and link previews. |
| *(text below `---`)* | The post. See formatting below. |

**Formatting in posts (and bios and scripts)** — this is [Markdown](https://commonmark.org/help/):

| You type | You get |
|---|---|
| blank line between paragraphs | separate paragraphs |
| `**bold**` | **bold** |
| `*italic*` | *italic* |
| `[link text](https://example.com)` | a link (plain web addresses also become links on their own) |
| `1. item` on separate lines | a numbered list |
| `- item` on separate lines | a bullet list |
| `## Heading` | a sub-heading |
| `\#hashtag` at the start of a line | a literal `#hashtag` (without the `\`, a line starting with `#` becomes a heading) |

**Add a post:** create a new file in `src/blog/posts/` with a short, lowercase, hyphenated name (that's its
address), copy the header from another post, change it, and write the text. Everything else updates
automatically: the listing and its pages, Newer/Older buttons, category/tag/month pages and counts, search,
the RSS feed, and the "Newer post / Older post" links on neighbouring posts.

**Posts per page:** 5. To change it, edit the number in **both** `eleventy.config.js` (`POSTS_PER_PAGE`) and
`src/blog/index.njk` (`size:`) — each has a comment pointing to the other.

**Delete a post:** delete its file. Its address will stop working, so prefer this only for mistakes.

### 4.4 Prices

`src/_data/pricing.json` holds the six monthly packages (Small/Medium/Large Market × Gold/Silver):
monthly price, units per month and price per unit. The "Per Spot" pricing (`$175`, `$75`, `$300`, `$35 per
revision`) is written directly in `src/services.njk`.

### 4.5 Testimonials

`src/_data/testimonials.json` — each quote has `quote`, `name` (can be `""`) and optional
`"featured": true` (shown larger).

### 4.6 Contact details, social links and menu

`src/_data/site.json`:

| Setting | Used for |
|---|---|
| `name`, `legalName`, `city`, `phone`, `phoneHref`, `email` | Footer, contact page, links. `phoneHref` is the dialable form, e.g. `tel:+15196600742`. |
| `url` | The live address — used in the RSS feed. |
| `social` | Footer and contact page icons. `icon` must be one of `x`, `facebook`, `youtube`, `linkedin` (icons live in `_includes/icons.njk`). |
| `nav` | The main menu, in order. |
| `bbbUrl`, `bbbImage` | Better Business Bureau seal in the footer. |
| `assetBase` | Where photos/audio load from — see section 9. |
| `contactEndpoint`, `contactFormId` | Where the contact form sends messages — see section 6 and 9. |
| `designSwitcher`, `designs` | The preview-only design switcher and its list of designs — see section 7. |

### 4.7 Page wording

The wording of Home, Services, Our Work, Team (intro), Calculator and Contact is in their `.njk` files in
`src/`. Edit the text between the tags; leave the `class="…"` parts and `{{ … }}` / `{% … %}` parts alone.
Page titles and Google descriptions are the `seoTitle` / `seoDescription` lines at the top of each file.
The Privacy Policy is plain Markdown in `src/privacypolicy.md`.

### 4.8 Script Calculator read speeds

The top of `src/assets/js/calculator.js` sets words per minute for Slow (150), Normal (180) and Fast (240)
reads. Change those numbers only — the rest of the file is the counting logic, carried over unchanged from the
original calculator.

---

## 5. Ways to edit

Once the project is on GitHub, any change saved to the main branch is rebuilt and published by the host
(see section 8) within a minute or two.

### A. On github.com (no setup)
Open a file in the repository, click the pencil icon, edit, and **Commit changes**. To add a file, use
**Add file → Create new file** in the right folder (e.g. `src/blog/posts/`). To add photos or audio, open the
folder (`src/images/announcers/` or `src/audio/`) and use **Add file → Upload files**.

### B. Pages CMS (recommended for the owner — forms instead of files)
[Pages CMS](https://pagescms.org) is a free editor that sits on top of the GitHub repository.
1. Go to [app.pagescms.org](https://app.pagescms.org) and sign in with GitHub.
2. Choose this repository.
3. You get sections for **Blog posts**, **Team (announcers)**, **Our Work (spots)**, **Pricing**,
   **Testimonials** and **Contact details & menu**, each with a form and photo/audio upload.
4. Saving makes a normal commit, so the site updates the same way.

Its settings are in `.pages.yml`. If a field is added to a content file, add it there too so it shows in
the form. The config hasn't been tested against the live repository yet — check it the first time it's
connected.

### C. Claude Code (AI assistant)
Open the project in Claude Code and ask in plain English, for example:
- "Add this as a new blog post: …" (paste the text; optionally give a title, date and category)
- "Add a new announcer called Jordan — here's the bio; the photo and sample are in Downloads"
- "Update Mike's bio to …" / "Move Sarah to the top of the Talent list" / "Mark Patrick as roster"
- "Change the Large Market Gold price to $2500"

Claude follows `CLAUDE.md` and this README, previews the change, and can commit and push it when asked.

### D. On your own computer
Clone the repository, run `npm install` then `npm start`, edit files in `src/` and watch the preview at
http://localhost:8080, then commit and push.

---

## 6. What the site does (features)

| Feature | Where | How it works |
|---|---|---|
| Menu | every page | `_includes/base.njk`; on narrow screens (under 960px) it becomes a ☰ button (`site.js`). The current page is highlighted. |
| Audio player | announcer & spot pages | `_includes/player.njk` + `site.js`. Play/pause, waveform progress bar you can click or drag, arrow keys to skip 5 s, time display. Without JavaScript the browser's own player shows. Only one sound plays at a time. |
| Quick-play | Team page | Play button on each photo plays that voice sample without leaving the page. |
| Find a voice | Team page | Search box filters the Talent grid by name. |
| Previous / Next | announcer pages, blog posts | Move to the neighbouring announcer (Team page order) or post (by date). |
| Style filter | Our Work page | Show All / Hardsell / Medium / Softsell / Creative / Sample (`site.js`). |
| Script Calculator | Calculator page | Converts numbers, prices, phone numbers, emails and web addresses into spoken words, counts words, and estimates length at the chosen read speed (`calculator.js`). |
| Contact form | Contact page | Name, email, message, plus a hidden spam trap. Sends to `contactEndpoint` in `site.json`. **Currently still uses the old WordPress contact form — must be replaced before WordPress is removed (section 9).** |
| Blog listing | `/blog/` | 5 posts per page, newest first, with a preview and "Continue reading". **Newer posts / Older posts** buttons and "Page X of Y". |
| Blog archives | category, tag, month pages | Same layout and paging, made automatically from the posts' settings. Sidebar lists categories and months with post counts. |
| Blog search | sidebar on every blog page | Goes to `/blog/search/?s=…`, which searches titles and full text of every post using `/blog/search.json` (built with the site). Old WordPress search links (`/blog/?s=…`) are redirected there. |
| RSS feed | `/blog/feed.xml` | Full posts, for feed readers. |
| Reduced motion | everywhere | Visitors who turn on "reduce motion" on their device see no animation. |
| Design switcher | every page (preview only) | Switches between designs A–D; see section 7. Turned off with `"designSwitcher": false`. |

---

## 7. Design guide

### Design versions (being reviewed)

The site currently has **four switchable designs** sharing the same content. A small **Design** panel in the
bottom-left corner of every page switches between them; the choice is remembered as you move between pages.
Click **Design** to tuck the panel away.

| | Name | Look | Stylesheet |
|---|---|---|---|
| **A** | After Hours | Midnight navy from the logo, warm paper, amber "on-air" accent; modern grotesque type. The original redesign. | `assets/css/site.css` |
| **B** | Rate Card | Editorial print: newsprint, black ink, tomato red, big serif headlines (Instrument Serif), hairline rules, square corners, drop caps on blog posts. | `assets/css/designs/b.css` |
| **C** | Golden Hour | Warm 1970s AM radio: chocolate, cream, mustard and burnt orange; soft retro serif (Fraunces); sunset stripes, a striped sun behind the logo, chunky offset shadows, sepia photos. | `assets/css/designs/c.css` |
| **D** | Signal | Loud and modern: black, off-white and signal lime; wide capitals (Unbounded); graph-paper grid, scrolling ticker, highlighter headlines, lime-duotone photos on hover, giant outlined footer wordmark. | `assets/css/designs/d.css` |

**Sharing a specific design:** add `?design=a`, `b`, `c` or `d` to any address, e.g.
`/team.html?design=c` — or use **Copy link to this design** in the panel.

**How it works:** `site.css` is design A and holds every page's layout. Each colour, font and corner radius is a
named setting at the top of `site.css` (`:root`). Designs B–D re-set those settings and restyle specific parts,
and everything they change is scoped to `[data-design="b"]` (etc.), so they never affect each other. A short
script in `_includes/base.njk` applies the saved design before the page appears (no flash). Some designs use
decorative extras that are hidden in the others: `.deco-stripes` (C) and `.deco-ticker` (D) in the page markup.
Version A as it was before the other designs were added is saved in git as the tag `design-a-after-hours`.

**Adding another design:** add an entry to `designs` in `src/_data/site.json` (e.g. `{"id": "e", "name": "…",
"note": "…"}`), create `src/assets/css/designs/e.css` with rules starting `:root[data-design="e"]` /
`[data-design="e"]`, and add any new Google Fonts to the second font link in `_includes/base.njk`.

**Choosing the final design (before launch):**
1. Set `"designSwitcher": false` in `src/_data/site.json`. This removes the panel, the extra fonts and the extra
   stylesheets, and the site shows design A.
2. If the chosen design is **not** A: copy the chosen file's settings into `:root` of `site.css` and its other rules
   to the end of `site.css` with the `[data-design="x"]` prefixes removed; add its fonts to the first font link
   in `base.njk`. Then delete `src/assets/css/designs/`, `_includes/design-switcher.njk` and
   `assets/js/design-switcher.js`, and the `designs` list in `site.json`.
3. Check every page, then update this section to describe the one remaining design.

### Design A details (current default)

- **Colours:** midnight navy (`--night` #0a1426) for headers, footer and dark sections; the logo blue
  (`--navy` #1e3f74); warm paper (`--paper` #f6f2ea) for reading sections; amber (`--amber` #ffb23f) for
  buttons, highlights and the play button; a small red "on air" dot (`--red`).
- **Fonts** (Google Fonts, loaded in `base.njk`): *Bricolage Grotesque* for headings, *Inter* for text,
  *JetBrains Mono* for small labels.
- **Logo:** drawn in code in `_includes/mark.njk` — a circle, a radio tower, signal arcs and an amber
  dot. On Home and Services it sits in a badge with "OVERNIGHT RADIO INC. · LONDON, ONTARIO · SINCE 1998"
  slowly circling it, and signal rings radiating outward. On inner pages it sits in the centre of the signal
  rings at the top of the page (partly off the edge, by design).
- **Highlighted words:** in page headings, wrap a word in `<strong>` to show it in the accent colour, e.g.
  `heading: "Meet the <strong>Team</strong>"`. (Each design styles this its own way — amber, red italic,
  mustard italic or a lime highlighter.)
- **Phones:** every page is checked at 375px wide with no sideways scrolling, in all four designs.

---

## 8. Building and hosting

The site works on any host that serves static files. Settings for any of them:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output / publish folder | `_site` |
| Node version | 18 or newer |

Recommended: **Netlify** or **Cloudflare Pages** — connect the GitHub repository and they rebuild and publish
automatically on every commit (including edits from Pages CMS). Netlify also offers a built-in form service that
can replace the WordPress contact form. GitHub Pages also works (it needs a small GitHub Actions workflow to run
the build).

**Redirects to set up on the host** (old addresses that changed):

| Old address | Send to |
|---|---|
| `/blog/feed/` | `/blog/feed.xml` |
| `/blog/author/production/` and `/blog/author/onr_admin/` | `/blog/` |

---

## 9. Before launch — checklist

- [ ] **Pick the final design** and turn off the switcher (section 7, "Choosing the final design").
- [ ] **Move photos and audio into the project.** During the preview they load from the live server
      (`"assetBase": "https://overnightradio.com"` in `site.json`). Copy these folders/files from the current
      server into `src/`: `images/`, `audio/`, `sample/`, `favicon.ico`, `apple-touch-icon*.png`,
      `icon-*.png`. Then set `"assetBase": ""`.
- [ ] **Replace the contact form's destination.** It currently posts to WordPress's Contact Form 7
      (`contactEndpoint` in `site.json`, handled in `site.js`). Pick a replacement — Netlify Forms (if hosting
      on Netlify), Formspree, or a plain email link — and update the form in `src/contact.njk` and the
      handler in `src/assets/js/site.js`. Test that a message arrives.
- [ ] **Decide on "Musical Tags"** (`/tags.html`). It's still on the old server but hidden from the menu; it
      hasn't been rebuilt. Rebuild it, or redirect it to `/services.html`.
- [ ] **Set up the redirects** in section 8.
- [ ] **Analytics (optional).** The old Google Analytics code (Universal Analytics) stopped working in 2023
      and was removed. Add Google Analytics 4 or another tool to `_includes/base.njk` if wanted.
- [ ] **Add a 404 page (optional)** — `src/404.njk` with `permalink: /404.html`; most hosts use it automatically.
- [ ] Connect Pages CMS and check each form works (section 5B).
- [ ] Point the domain at the new host; check a few old links (an announcer, a spot, a blog post, a blog tag).
- [ ] Only then shut down WordPress.

---

## 10. Changes from the old site

Kept the same: all pages, wording, addresses, prices, team members, spots, scripts, testimonials, the
Script Calculator's rules, social links and the BBB seal.

Changed or added:
- New look (section 7) and a custom audio player.
- Team page: quick-play button on each photo and a "Find a voice" search; Previous/Next between announcers.
- Our Work: designed cards instead of the old thumbnail images; the filter no longer needs the MixItUp plugin.
- Blog moved off WordPress: 32 posts migrated with their dates, categories, tags and addresses; 5 per page
  with Newer/Older buttons; search and RSS rebuilt. Featured images (old logo versions) were not carried over.
- Fixed: the Island Cleaners spot page was titled "Euro Collision" on the old site.
- Removed: the phone number from the header (still in the footer and contact page); jQuery, Bootstrap and the
  old analytics code.
- Not carried over: blog author pages, WordPress's unused shop/cart pages, the `/videos/` page (already
  missing on the old site), Musical Tags (see checklist).

---

## 11. Troubleshooting

| Problem | Fix |
|---|---|
| The build fails after editing a content file | Usually the header: check both `---` lines are there, text values are in "quotes", lists look like `["One", "Two"]`, and dates are `YYYY-MM-DD`. The error message names the file. |
| A new announcer or post doesn't appear | Check the file is in the right folder and ends in `.md`. |
| A photo or sample doesn't load | Check the path in the file matches the real file name exactly (capital letters matter) and starts with `/`. |
| Old audio still plays after replacing a file | The browser cached it — give the new file a different name. |
| Stray old pages appear in the local preview | Stop the preview, delete the `_site` folder, and run `npm start` again. |
| A line in a post turned into a big heading | It started with `#`. Put `\` before it: `\#hashtag`. |
