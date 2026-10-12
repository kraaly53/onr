// Concept 1 — "The Dial": needle sweep between pages, the tuning knob, and the voice dial on the Team page.
(() => {
  const pos = (f) => ((f - 87.5) / 21) * 100 + "%";
  const here = parseFloat(document.body.dataset.freq);
  const read = (k) => { try { return sessionStorage.getItem(k); } catch { return null; } };
  const write = (k, v) => { try { sessionStorage.setItem(k, v); } catch {} };

  // Needle sweeps from the last station you were on to this one.
  const needle = document.querySelector("[data-needle]");
  const dial = document.querySelector(".dial");
  const from = parseFloat(read("dialFrom"));
  if (needle && !isNaN(from) && from !== here && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    needle.style.transition = "none";
    needle.style.setProperty("--pos", pos(from));
    needle.getBoundingClientRect();
    requestAnimationFrame(() => {
      needle.style.transition = "";
      needle.style.setProperty("--pos", pos(here));
      dial.classList.add("is-tuning");
      setTimeout(() => dial.classList.remove("is-tuning"), 600);
    });
  }
  addEventListener("pagehide", () => write("dialFrom", String(here)));

  // On small screens the dial scrolls sideways: bring this station into view.
  if (dial && dial.scrollWidth > dial.clientWidth) {
    const cur = dial.querySelector('[aria-current="page"]');
    if (cur) dial.scrollLeft = cur.getBoundingClientRect().left - dial.getBoundingClientRect().left - dial.clientWidth / 2 + cur.offsetWidth / 2;
  }

  // The knob turns, then tunes to the next station.
  const knob = document.querySelector(".knob");
  if (knob) knob.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    knob.classList.add("is-turning");
    setTimeout(() => (location.href = knob.href), 260);
  });

  // Team: the voice dial — whichever voice is under the needle is "tuned in".
  const vd = document.querySelector("[data-voicedial]");
  if (vd) {
    const track = vd.querySelector("[data-vd-track]");
    const freqOut = vd.querySelector("[data-vd-freq]");
    const nameOut = vd.querySelector("[data-vd-name]");
    const cards = () => [...track.querySelectorAll(".vcard")].filter((c) => !c.hidden);
    let tuned = null;
    const update = () => {
      const mid = track.getBoundingClientRect().left + track.clientWidth / 2;
      let best = null, dist = Infinity;
      for (const c of cards()) {
        const r = c.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - mid);
        if (d < dist) { dist = d; best = c; }
      }
      if (best === tuned) return;
      tuned?.classList.remove("is-tuned");
      tuned = best;
      if (!best) { freqOut.textContent = "--.-"; nameOut.textContent = ""; return; }
      best.classList.add("is-tuned");
      freqOut.textContent = best.dataset.freq;
      nameOut.textContent = best.dataset.label;
    };
    let raf = 0;
    track.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    vd.querySelectorAll("[data-vd-step]").forEach((b) => b.addEventListener("click", () => {
      const list = cards(), i = list.indexOf(tuned) + +b.dataset.vdStep;
      const target = list[Math.max(0, Math.min(list.length - 1, i))];
      target?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }));
    // Re-tune after searching
    vd.querySelector("[data-team-search]")?.addEventListener("input", () => {
      requestAnimationFrame(() => { track.scrollLeft = 0; tuned = null; update(); });
    });
    // Arrow keys on the dial
    track.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      vd.querySelector(`[data-vd-step="${e.key === "ArrowRight" ? 1 : -1}"]`).click();
    });
    update();
  }
})();
