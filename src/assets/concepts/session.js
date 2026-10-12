// Concept 6 — "The Session": the transport (timecode + play), each spot's script as a multitrack, and the
// calculator's result drawn as a clip on a 0–60 second timeline.
(() => {
  const $ = (s, el = document) => el.querySelector(s);

  /* ---- Transport: the timecode runs while anything on the page is playing; ▶ plays the sample spot ---- */
  const tc = $("[data-timecode]");
  const tAudio = $("[data-transport-audio]");
  const tPlay = $("[data-transport-play]");
  const fmt = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60), fr = Math.floor((s % 1) * 30);
    return [h, m, sec, fr].map((n) => String(n).padStart(2, "0")).join(":");
  };
  let current = null;
  const tick = () => {
    if (current && !current.paused) { tc.textContent = fmt(current.currentTime); requestAnimationFrame(tick); }
  };
  document.addEventListener("play", (e) => {
    current = e.target;
    document.body.classList.toggle("is-rolling", current === tAudio);
    requestAnimationFrame(tick);
  }, true);
  document.addEventListener("pause", (e) => { if (e.target === tAudio) document.body.classList.remove("is-rolling"); }, true);
  document.addEventListener("ended", (e) => { if (e.target === tAudio) document.body.classList.remove("is-rolling"); }, true);
  if (tPlay && tAudio) tPlay.addEventListener("click", () => (tAudio.paused ? tAudio.play() : tAudio.pause()));

  // Quick-play buttons use their own audio element (in site.js); follow them too.
  const _play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { current = this; requestAnimationFrame(tick); return _play.apply(this, arguments); };

  /* ---- Spot script → multitrack: one lane per speaker, each line a clip in running order ---- */
  const mt = $("[data-multitrack]");
  if (mt) {
    const src = $("[data-script]", mt), lanesEl = $("[data-lanes]", mt);
    const palette = { SFX: "#5ad1f5", MUSIC: "#6ee7a8", ANNCR: "#ff8a3d", TAG: "#f5c84b" };
    const extra = ["#d78bff", "#ff7aa8", "#8e9bff", "#7ee0c3", "#ffb36b"];
    const lines = [...src.querySelectorAll("p")].map((p) => {
      const who = p.querySelector(":scope > strong:first-child");
      const name = who ? who.textContent.trim().toUpperCase() : "DIRECTION";
      const text = (who ? p.textContent.slice(who.textContent.length) : p.textContent).trim();
      return { name, text, words: Math.max(3, text.split(/\s+/).length) };
    });
    if (lines.length) {
      const order = [];
      lines.forEach((l) => { if (!order.includes(l.name)) order.push(l.name); });
      const color = (n) => palette[n] || (n === "DIRECTION" ? "#9a9ea6" : extra[order.indexOf(n) % extra.length]);
      const total = lines.reduce((a, l) => a + l.words, 0);
      let at = 0;
      lines.forEach((l, i) => { l.i = i; l.x = (at / total) * 100; l.w = (l.words / total) * 100; at += l.words; });
      const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
      lanesEl.innerHTML = order.map((n) => `
        <div class="mt-lane" style="--c:${color(n)}">
          <div class="mt-lane__hdr">${esc(n === "DIRECTION" ? "Notes" : n)}</div>
          <div class="mt-lane__body">${lines.filter((l) => l.name === n).map((l) =>
            `<button type="button" class="mt-clip" data-line="${l.i}" style="--x:${l.x.toFixed(2)}%;--w:${l.w.toFixed(2)}%" title="${esc(l.text)}"><span>${esc(l.text)}</span></button>`).join("")}
          </div>
        </div>`).join("") +
        `<div class="mt-read">${lines.map((l) => `<p data-line="${l.i}" style="--c:${color(l.name)}"><b>${esc(l.name === "DIRECTION" ? "" : l.name)}</b><span>${esc(l.text)}</span></p>`).join("")}</div>`;
      mt.classList.add("is-built");
      // Clicking a clip highlights that line in the script below
      lanesEl.addEventListener("click", (e) => {
        const c = e.target.closest(".mt-clip");
        if (!c) return;
        lanesEl.querySelectorAll(".is-open").forEach((x) => x.classList.remove("is-open"));
        lanesEl.querySelectorAll(`[data-line="${c.dataset.line}"]`).forEach((x) => x.classList.add("is-open"));
        lanesEl.querySelector(`.mt-read [data-line="${c.dataset.line}"]`).scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }

  /* ---- Calculator: draw the script length as a clip on a 0–60 s timeline ---- */
  const clip = $("[data-calc-clip]");
  const out = $("#wlength");
  if (clip && out) {
    const btn = $("#calculateScript");
    btn.addEventListener("click", () => requestAnimationFrame(() => {
      const secs = parseFloat(out.value) || 0;
      clip.style.setProperty("--w", Math.min(100, (secs / 60) * 100).toFixed(2) + "%");
      clip.classList.toggle("is-over", secs > 60);
      clip.querySelector("b").textContent = secs ? `Your script · ${secs.toFixed(1)}s` : "Your script";
    }));
  }
})();
