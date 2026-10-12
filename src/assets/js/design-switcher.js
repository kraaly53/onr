// Preview-only design switcher.
// Designs: After Hours (the main site) and the complete redesigns ("concepts", separate copies of the site under
// /concepts/<id>/ — picking one opens the same page in that concept).
// After Hours has four themes, A–D, shown as buttons beside it: they restyle the site in place; the choice is
// remembered and can be shared with ?design=b.
(() => {
  const box = document.querySelector("[data-dswitch]");
  if (!box) return;
  const root = document.documentElement;
  const themePicks = [...box.querySelectorAll("[data-design-pick]")];
  const conceptPicks = [...box.querySelectorAll("[data-concept-pick]")];
  const current = box.querySelector("[data-dswitch-current]");
  const toggle = box.querySelector("[data-dswitch-toggle]");
  const store = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
  const read = (k) => { try { return localStorage.getItem(k); } catch { return null; } };

  // Where are we? /concepts/dial/team.html → concept "dial", main path "/team.html"
  const m = location.pathname.match(/^\/concepts\/([^/]+)(\/.*)?$/);
  const concept = m ? m[1] : null;
  const mainPath = concept ? m[2] || "/" : location.pathname;

  // Pages every concept has; anything else (blog archives, search) falls back sensibly.
  const conceptPath = (p) => {
    if (p === "/" || p === "/index.html") return "/index.html";
    if (/^\/(services|work|team|calculator|contact|privacypolicy)\.html$/.test(p)) return p;
    if (/^\/(work|team)\/[\w-]+\.html$/.test(p)) return p;
    if (/^\/blog\/(page\/\d+\/)?$/.test(p)) return p;
    if (/^\/blog\/(category|tag|search|\d{4})\//.test(p)) return "/blog/";
    if (/^\/blog\/[\w-]+\/$/.test(p)) return p;
    return "/index.html";
  };

  const label = (txt) => (current.textContent = txt);
  const check = (list, id, attr) => list.forEach((b) => b.setAttribute("aria-checked", String(b.dataset[attr] === id)));

  const showTheme = (id) => check(themePicks, id, "designPick");

  const applyTheme = (id) => {
    root.dataset.design = id;
    store("design", id);
    showTheme(id);
    label(`After Hours · ${id.toUpperCase()}`);
    const url = new URL(location.href);
    url.searchParams.set("design", id);
    history.replaceState(null, "", url);
  };

  // From a concept, After Hours (or one of its themes) opens the same page on the main site.
  const toMain = (id) => { store("design", id); location.href = `${mainPath}?design=${id}`; };

  themePicks.forEach((b) =>
    b.addEventListener("click", () => (concept ? toMain(b.dataset.designPick) : applyTheme(b.dataset.designPick)))
  );
  conceptPicks.forEach((b) =>
    b.addEventListener("click", () => {
      const id = b.dataset.conceptPick;
      if (id === "main") { if (concept) toMain(read("design") || "a"); return; }
      if (id !== concept) location.href = `/concepts/${id}${conceptPath(mainPath)}`;
    })
  );

  if (concept) {
    check(conceptPicks, concept, "conceptPick");
    showTheme(read("design") || "a");
    label(conceptPicks.find((b) => b.dataset.conceptPick === concept)?.dataset.name || concept);
  } else {
    check(conceptPicks, "main", "conceptPick");
    applyTheme(root.dataset.design || themePicks[0]?.dataset.designPick || "a");
  }

  const setOpen = (open) => {
    box.classList.toggle("is-collapsed", !open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.title = open ? "Hide design options" : "Show design options";
    const hint = box.querySelector("[data-dswitch-hint]");
    if (hint) hint.textContent = toggle.title;
    store("designSwitcherOpen", open ? "1" : "0");
  };
  setOpen(read("designSwitcherOpen") !== "0");
  toggle.addEventListener("click", () => setOpen(box.classList.contains("is-collapsed")));

  box.querySelector("[data-dswitch-copy]").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    try { await navigator.clipboard.writeText(location.href); btn.textContent = "Link copied"; }
    catch { btn.textContent = location.href; }
    setTimeout(() => (btn.textContent = "Copy link to this design"), 2000);
  });
})();
