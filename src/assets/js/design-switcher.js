// Preview-only design switcher. The chosen design is stored per browser and can be shared with ?design=b.
(() => {
  const root = document.documentElement;
  const box = document.querySelector("[data-dswitch]");
  if (!box) return;
  const picks = [...box.querySelectorAll("[data-design-pick]")];
  const current = box.querySelector("[data-dswitch-current]");
  const toggle = box.querySelector("[data-dswitch-toggle]");
  const store = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
  const read = (k) => { try { return localStorage.getItem(k); } catch { return null; } };

  const apply = (id) => {
    root.dataset.design = id;
    store("design", id);
    picks.forEach((b) => b.setAttribute("aria-checked", String(b.dataset.designPick === id)));
    const name = picks.find((b) => b.dataset.designPick === id)?.querySelector("strong").textContent || "";
    current.textContent = `${id.toUpperCase()} · ${name}`;
    const url = new URL(location.href);
    url.searchParams.set("design", id);
    history.replaceState(null, "", url);
  };

  picks.forEach((b) => b.addEventListener("click", () => apply(b.dataset.designPick)));
  apply(root.dataset.design);

  const setOpen = (open) => {
    box.classList.toggle("is-collapsed", !open);
    toggle.setAttribute("aria-expanded", String(open));
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
