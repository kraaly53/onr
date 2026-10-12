// Blog search: reads ?s= and searches a small JSON index of every post (built with the site).
(() => {
  const q = (new URLSearchParams(location.search).get("s") || "").trim();
  const input = document.querySelector('.blogside input[name="s"]');
  if (input) input.value = q;
  const summary = document.querySelector("[data-search-summary]");
  const out = document.querySelector("[data-search-results]");
  if (!q) return;

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  summary.textContent = "Searching…";

  fetch("/blog/search.json")
    .then((r) => r.json())
    .then((posts) => {
      const words = q.toLowerCase().split(/\s+/).filter(Boolean);
      const hits = posts
        .map((p) => {
          const title = p.title.toLowerCase(), text = p.text.toLowerCase();
          if (!words.every((w) => title.includes(w) || text.includes(w))) return null;
          return { p, score: words.reduce((s, w) => s + (title.includes(w) ? 5 : 0) + text.split(w).length - 1, 0) };
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score)
        .map((h) => h.p);

      summary.textContent = hits.length
        ? `${hits.length} post${hits.length === 1 ? "" : "s"} found for “${q}”`
        : `Nothing found for “${q}”. Try a different word.`;
      out.innerHTML = hits
        .map((p) => `
        <article class="postcard">
          <p class="postmeta"><span>${esc(p.date)}</span>${p.categories.map((c) => `<span class="tag">${esc(c)}</span>`).join("")}</p>
          <h2 class="postcard__title"><a href="${esc(p.url)}">${esc(p.title)}</a></h2>
          <p class="postcard__excerpt">${esc(p.excerpt)}</p>
          <a class="textlink" href="${esc(p.url)}">Continue reading <svg aria-hidden="true"><use href="#i-arrow-right"/></svg></a>
        </article>`)
        .join("");
    })
    .catch(() => (summary.textContent = "Search isn’t available right now. Please try again."));
})();
