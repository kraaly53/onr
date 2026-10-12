// Concept 3 — "Night Shift": the sky, moon, sun, stars and clock follow the hour of the night.
// Home page: scrolling moves the hour forward (a full page of scrolling, either direction, is one night).
// Other pages: a fixed hour.
//
// Smoothness:
// - This file loads (not deferred) right after the sky, so the first frame is already painted correctly.
// - The hour you were at on the previous page is remembered; each page starts there and glides to its own hour,
//   so the moon travels along its arc between pages instead of jumping.
// - One animation loop eases the hour toward its target; only the sky layer's settings change each frame and the
//   moon/sun move with transforms, so the rest of the page isn't restyled.
(() => {
  const sky = document.querySelector(".sky");
  const body = document.body;
  if (!sky) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isScroll = body.dataset.hour === "scroll";
  const read = () => { try { return parseFloat(sessionStorage.getItem("nightHour")); } catch { return NaN; } };
  const write = (v) => { try { sessionStorage.setItem("nightHour", String(v)); } catch {} };

  // The hour runs 0 (6 PM dusk) → 1 (6 AM dawn). Time only ever moves forward: going to an earlier hour carries on
  // through a short "daytime" stretch (1 → 1.35: the sun fades, the sky warms back to dusk, the moon rises again)
  // and wraps round to the next evening.
  const DAY = 0.35, CYCLE = 1 + DAY;
  const wrap = (u) => ((u % CYCLE) + CYCLE) % CYCLE;

  // Sky colours through the night (and the daytime stretch back to dusk): [t, top, middle, horizon]
  const keys = [
    [0.00, "#2a3a7a", "#b8678a", "#f6ad6a"],
    [0.14, "#141d4d", "#3b2f6b", "#7a4a7a"],
    [0.32, "#0a0f2e", "#121a44", "#1d2758"],
    [0.50, "#05061a", "#0b1030", "#141c48"],
    [0.70, "#070a22", "#10173d", "#1e2654"],
    [0.86, "#1d2456", "#4f3c7c", "#c47d8c"],
    [1.00, "#6d8fcf", "#f0b6a6", "#ffd89a"],
    [1.12, "#7da0d8", "#e9c2b4", "#ffe0a8"],
    [1.35, "#2a3a7a", "#b8678a", "#f6ad6a"],
  ].map(([t, ...c]) => [t, ...c.map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)))]);
  const mix = (x, y, f) => `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * f)).join(" ")})`;
  const smooth = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };

  let clock, ampm, lastClock = "";
  const paint = (u) => {
    const t = wrap(u);
    let i = 0;
    while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
    const [t0, ...a] = keys[i], [t1, ...b] = keys[i + 1];
    const f = (t - t0) / (t1 - t0 || 1);
    const s = sky.style;
    s.setProperty("--sky-top", mix(a[0], b[0], f));
    s.setProperty("--sky-mid", mix(a[1], b[1], f));
    s.setProperty("--sky-low", mix(a[2], b[2], f));
    let stars, sun, moon, mx, my, mins;
    if (t <= 1) {
      // Night: stars come out and fade, the moon arcs across the right-hand sky (clear of the headlines)
      stars = t < 0.5 ? smooth(0.04, 0.3, t) : 1 - smooth(0.78, 0.96, t);
      sun = smooth(0.84, 1, t);
      moon = 1 - sun;
      mx = 62 + t * 32; my = 70 - Math.sin(Math.PI * t) * 58;
      mins = 18 * 60 + t * 720;                  // 6:00 PM → 6:00 AM
    } else {
      // Daytime stretch: the sun fades, the moon fades back in where it rises at dusk
      const d = (t - 1) / DAY;
      stars = 0; sun = 1 - smooth(0, 0.8, d); moon = smooth(0.35, 1, d);
      mx = 62; my = 70;
      mins = 6 * 60 + d * 720;                   // 6:00 AM → 6:00 PM
    }
    s.setProperty("--stars", stars.toFixed(3));
    s.setProperty("--sun", sun.toFixed(3));
    s.setProperty("--moonv", moon.toFixed(3));
    s.setProperty("--mx", mx.toFixed(2) + "vw");
    s.setProperty("--my", my.toFixed(2) + "vh");
    clock = clock || document.querySelector("[data-clock]");
    ampm = ampm || document.querySelector("[data-ampm]");
    if (clock) {
      const m = Math.round(mins) % 1440, h = Math.floor(m / 60), mm = m % 60;
      const txt = `${h % 12 === 0 ? 12 : h % 12}:${String(mm).padStart(2, "0")}`;
      if (txt !== lastClock) { clock.textContent = txt; ampm.textContent = h >= 12 ? "PM" : "AM"; lastClock = txt; }
    }
  };

  const scrollHour = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    return max > 0 ? Math.min(1, scrollY / max) : 0;
  };
  let target = isScroll ? 0 : parseFloat(body.dataset.hour) || 0.5;
  const prev = read();
  let t = !reduce && !isNaN(prev) ? prev : target;
  paint(t);

  // Two kinds of motion:
  // - glide: page to page — eases in and out over 1–1.8 s (longer for bigger jumps through the night)
  // - follow: scrolling on the home page — eases toward the scroll position each frame
  let raf = 0, mode = null, from = 0, startAt = 0, dur = 0;
  const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const tick = (now) => {
    if (mode === "glide") {
      const p = Math.min(1, (now - startAt) / dur);
      t = from + (target - from) * easeInOut(p);
      paint(t);
      if (p < 1) { raf = requestAnimationFrame(tick); return; }
      t = wrap(target);
    } else {
      const d = target - t;
      if (Math.abs(d) > 0.0004) { t += d * 0.14; paint(t); raf = requestAnimationFrame(tick); return; }
      t = target; paint(t);
    }
    raf = 0; mode = null;
  };
  const go = (to, how) => {
    target = to;
    if (reduce) { t = target; paint(t); return; }
    if (how === "glide") {
      from = wrap(t);
      if (Math.abs(to - from) < 0.0004) { t = from; return; }
      if (to < from) target = to + CYCLE;          // never run backwards: carry on through the day to this hour
      startAt = performance.now(); dur = Math.min(3000, 1000 + 1000 * (target - from)); mode = "glide";
    } else {
      mode = "follow";                              // the hour keeps counting up; paint() wraps it
    }
    if (!raf) raf = requestAnimationFrame(tick);
  };
  addEventListener("pagehide", () => write(wrap(t)));
  addEventListener("pageshow", (e) => { if (e.persisted && !isScroll) go(target, "glide"); });

  const start = () => {
    if (isScroll) {
      go(scrollHour(), "glide");
      // Any scrolling — down or up — moves time forward: one full page of scrolling is one night.
      // Scrolling takes over from an arrival glide straight away, carrying on from the hour on screen.
      let lastY = scrollY, travel = null;
      addEventListener("scroll", () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        const dy = Math.abs(scrollY - lastY);
        lastY = scrollY;
        if (!dy || max <= 0) return;
        if (mode !== "follow" || travel === null) travel = t;
        travel += dy / max;
        go(travel, "follow");
      }, { passive: true });
    } else {
      go(target, "glide");
    }

    // Team: join each star to its nearest neighbours (a minimum spanning tree), leaving out long jumps,
    // so the voices form a handful of constellations.
    const lines = document.querySelector("[data-lines]");
    if (lines) {
      const stars = [...document.querySelectorAll(".constellation .star")].map((el) => ({
        x: parseFloat(el.style.getPropertyValue("--x")), y: parseFloat(el.style.getPropertyValue("--y")),
      }));
      const dist = (a, b) => Math.hypot(a.x - b.x, (a.y - b.y) * 0.5);
      const inTree = new Set([0]), edges = [];
      while (stars.length && inTree.size < stars.length) {
        let best = null;
        for (const i of inTree) for (let j = 0; j < stars.length; j++) {
          if (inTree.has(j)) continue;
          const dd = dist(stars[i], stars[j]);
          if (!best || dd < best[2]) best = [i, j, dd];
        }
        inTree.add(best[1]);
        if (best[2] < 11) edges.push(best);
      }
      lines.innerHTML = edges.map(([i, j]) => `<line x1="${stars[i].x}" y1="${stars[i].y}" x2="${stars[j].x}" y2="${stars[j].y}"/>`).join("");
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
