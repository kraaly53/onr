# Overnight Radio website — notes for Claude

Read `README.md` first: it documents every content file, setting and feature. Keep it accurate — if you add,
change or remove a feature, setting, content field or workflow, update `README.md` (and `.pages.yml` if a
content field changed) in the same change.

- Static site built with Eleventy 3. Edit only files in `src/`; `_site/` is generated.
- Preview: `npm start` (http://localhost:8080). Build: `npm run build`.
- Keep URLs stable: don't rename files in `src/team/`, `src/work/` or `src/blog/posts/`.
- Four switchable designs (A–D) are under review — see README section 7. Layout/markup changes must work in all
  four; check them with `?design=a|b|c|d`. Design-specific styling goes in `src/assets/css/designs/<id>.css`.
- Five complete-redesign concepts (Dial, Script, Night Shift, Bento, Session) live under `src/concepts/` and share the same content
  collections — see README section 7. Content-file changes need no concept work; a new page or feature on the main
  site should be mirrored in each concept (or noted in the README) while they're under review.
- Keep the site's wording as written by the owner; don't rewrite copy unless asked.

Common requests:
- **New blog post from pasted text:** create `src/blog/posts/<short-hyphenated-slug>.md` with `title`, `date`
  (today unless given), `author: "Overnight Radio"`, `categories` (Commercials / General / Music, best fit),
  `keywords` (reuse existing tags where they fit), and a one-sentence `description`. Keep the author's text;
  only convert it to Markdown (blank line between paragraphs; escape a leading `#` as `\#`).
- **New / updated announcer:** one file in `src/team/` (copy an existing one). Photo → `src/images/announcers/`,
  sample → `src/audio/`. Set `order` for position.
- After changes: build, check the page in the preview, and show the result before committing or pushing.
