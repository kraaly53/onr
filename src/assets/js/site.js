(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* Mobile nav */
  const toggle = $(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      document.body.classList.toggle("nav-open", !open);
    });
  }

  /* Only one sound at a time across the page */
  const stopOthers = (except) => {
    $$("audio").forEach((a) => a !== except && !a.paused && a.pause());
  };
  document.addEventListener("play", (e) => stopOthers(e.target), true);

  const fmt = (t) => {
    if (!isFinite(t)) return "–:––";
    const m = Math.floor(t / 60), s = Math.floor(t % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  /* Custom player: enhances a native <audio controls>; without JS the native controls show. */
  $$("[data-player]").forEach((el) => {
    const audio = $("audio", el);
    const btn = $(".player__btn", el);
    const track = $("[data-track]", el);
    const fill = $("[data-fill]", el);
    const cur = $("[data-cur]", el);
    const dur = $("[data-dur]", el);
    el.classList.add("is-enhanced");
    audio.removeAttribute("controls");

    btn.addEventListener("click", () => (audio.paused ? audio.play() : audio.pause()));
    audio.addEventListener("play", () => el.classList.add("is-playing"));
    audio.addEventListener("pause", () => el.classList.remove("is-playing"));
    audio.addEventListener("ended", () => el.classList.remove("is-playing"));
    const showDur = () => (dur.textContent = fmt(audio.duration));
    audio.addEventListener("loadedmetadata", showDur);
    audio.addEventListener("durationchange", showDur);
    if (audio.readyState >= 1) showDur();
    audio.addEventListener("timeupdate", () => {
      const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      fill.style.setProperty("--p", pct + "%");
      cur.textContent = fmt(audio.currentTime);
      track.setAttribute("aria-valuenow", Math.round(pct));
    });
    const seek = (clientX) => {
      const r = track.getBoundingClientRect();
      const pct = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      if (audio.duration) audio.currentTime = pct * audio.duration;
    };
    track.addEventListener("pointerdown", (e) => {
      seek(e.clientX);
      track.setPointerCapture(e.pointerId);
      const move = (ev) => seek(ev.clientX);
      track.addEventListener("pointermove", move);
      track.addEventListener("pointerup", () => track.removeEventListener("pointermove", move), { once: true });
    });
    track.addEventListener("keydown", (e) => {
      if (!audio.duration) return;
      if (e.key === "ArrowRight") audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
      if (e.key === "ArrowLeft") audio.currentTime = Math.max(0, audio.currentTime - 5);
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); btn.click(); }
    });
  });

  /* Team: quick-play a voice sample from the grid */
  const quick = new Audio();
  quick.preload = "none";
  let quickBtn = null;
  const resetQuick = () => { quickBtn && quickBtn.closest(".voice").classList.remove("is-playing"); quickBtn = null; };
  quick.addEventListener("ended", resetQuick);
  quick.addEventListener("pause", resetQuick);
  $$("[data-quickplay]").forEach((b) => {
    b.addEventListener("click", () => {
      if (quickBtn === b) { quick.pause(); return; }
      quick.pause();
      quick.src = b.dataset.quickplay;
      quick.play();
      quickBtn = b;
      b.closest(".voice").classList.add("is-playing");
    });
  });

  /* Team: find a voice by name */
  const search = $("[data-team-search]");
  if (search) {
    const items = $$("[data-talent] .voice");
    const empty = $("[data-team-empty]");
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      let shown = 0;
      items.forEach((li) => {
        const hit = !q || li.dataset.name.includes(q);
        li.hidden = !hit;
        shown += hit;
      });
      empty.hidden = shown > 0;
    });
  }

  /* Work: filter by style (replaces the old MixItUp plugin) */
  const filters = $("[data-filters]");
  if (filters) {
    const spots = $$("[data-spots] .spot");
    filters.addEventListener("click", (e) => {
      const b = e.target.closest("[data-filter]");
      if (!b) return;
      $$("[data-filter]", filters).forEach((x) => {
        x.classList.toggle("is-active", x === b);
        x.setAttribute("aria-pressed", String(x === b));
      });
      const f = b.dataset.filter;
      spots.forEach((s) => (s.hidden = f !== "all" && s.dataset.category !== f));
    });
  }

  /* Contact form → Contact Form 7 REST endpoint on the existing WordPress install */
  const form = $("[data-contact]");
  if (form) {
    const status = $("[data-status]", form);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      data.append("_wpcf7_unit_tag", form.dataset.unitTag);
      const btn = $("button[type=submit]", form);
      btn.disabled = true;
      status.hidden = false;
      status.className = "form__status";
      status.textContent = "Sending…";
      try {
        const res = await fetch(form.action, { method: "POST", body: data });
        const json = await res.json();
        const ok = json.status === "mail_sent";
        status.classList.add(ok ? "is-ok" : "is-err");
        status.textContent = ok ? "Message sent." : "Something is not working. Please try again.";
        if (ok) form.reset();
      } catch {
        status.classList.add("is-err");
        status.textContent = "Something is not working. Please try again.";
      } finally {
        btn.disabled = false;
      }
    });
  }
})();
