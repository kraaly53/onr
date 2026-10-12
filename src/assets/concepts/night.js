// Concept 3 — "Night Shift": one night across the whole site.
//
// Each page sits at an hour of the night, in menu order: Home is dusk (6 PM) … Contact is first light (~5 AM).
// Moving between pages, the sky, stars, clock and moon glide from the hour you were at to the new page's hour —
// the moon travels left → right across the sky on an arc that always stays fully on screen.
// Time only runs forward: going back to an earlier page carries on through dawn and a short daytime stretch, while
// the moon drifts back across the sky as a pale daytime moon, ready to rise again at dusk.
// On Home, scrolling nudges the evening on a little (forward only), up to the page's scroll span.
//
// Smoothness: this file runs before the first paint (not deferred, placed right after the header), each page starts at the previous page's hour,
// motion is eased in and out, only the sky layer's settings change per frame, and the moon/sun move by transform.
(() => {
  const sky = document.querySelector(".sky");
  const body = document.body;
  if (!sky) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const num = (v, d) => { const n = parseFloat(v); return isNaN(n) ? d : n; };
  const pageHour = num(body.dataset.hour, 0.5);
  const scrollSpan = num(body.dataset.scrollSpan, 0);
  const read = () => { try { return parseFloat(sessionStorage.getItem("nightHour")); } catch { return NaN; } };
  const write = (v) => { try { sessionStorage.setItem("nightHour", String(v)); } catch {} };

  // 0 → 1 is the night (6 PM → 6 AM); 1 → CYCLE is the daytime stretch back round to dusk.
  // The day is as long as the night, so the pale moon drifts back across the sky at the same easy pace.
  const DAY = 1, CYCLE = 1 + DAY;
  const wrap = (u) => ((u % CYCLE) + CYCLE) % CYCLE;

  // Sky colours: [hour, top, middle, horizon]
  const keys = [
    [0.00, "#2a3a7a", "#b8678a", "#f6ad6a"],
    [0.14, "#141d4d", "#3b2f6b", "#7a4a7a"],
    [0.32, "#0a0f2e", "#121a44", "#1d2758"],
    [0.50, "#05061a", "#0b1030", "#141c48"],
    [0.70, "#070a22", "#10173d", "#1e2654"],
    [0.86, "#1d2456", "#4f3c7c", "#c47d8c"],
    [1.00, "#6d8fcf", "#f0b6a6", "#ffd89a"],
    [1.25, "#7da0d8", "#e9c2b4", "#ffe0a8"],
    [1.75, "#7da0d8", "#e9c2b4", "#ffe0a8"],
    [2.00, "#2a3a7a", "#b8678a", "#f6ad6a"],
  ].map(([t, ...c]) => [t, ...c.map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)))]);
  const mix = (x, y, f) => `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * f)).join(" ")})`;
  const smooth = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
  // Steady drift with a short, soft start and finish (so the moon turns round gently at dawn and dusk)
  const drift = (p, a = 0.15) => {
    const v = 1 / (1 - a);
    if (p < a) return (v * p * p) / (2 * a);
    if (p < 1 - a) return v * (a / 2 + (p - a));
    return 1 - (v * (1 - p) * (1 - p)) / (2 * a);
  };

  // The moon's path: a shallow arc in the clear strip just below the menu bar (above the page headings),
  // never nearer than 10% to either side. Heights are measured from the real header, so it works on phones too.
  const LEFT = 10, RIGHT = 90;
  let HIGH = 0, LOW = 0;                           // px from the top of the window
  const measure = () => {
    const bar = document.querySelector(".top");
    const moonEl = sky.querySelector(".moon");
    const below = bar ? bar.getBoundingClientRect().height : 70;
    const r = moonEl ? moonEl.offsetWidth / 2 : 30;
    HIGH = below + r + 6;
    LOW = HIGH + Math.max(14, innerHeight * 0.03);
  };

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
      stars = t < 0.5 ? smooth(0.04, 0.3, t) : 1 - smooth(0.8, 0.98, t);
      sun = smooth(0.84, 1, t);
      moon = 1 - 0.6 * sun;                        // pales at first light but stays in the sky
      mx = LEFT + (RIGHT - LEFT) * t;
      my = LOW - Math.sin(Math.PI * t) * (LOW - HIGH);
      mins = 18 * 60 + t * 720;                    // 6:00 PM → 6:00 AM
    } else {
      // Daytime: the sun sets again; the pale moon drifts back across a slightly lower path to its rising spot
      const d = (t - 1) / DAY;
      stars = 0;
      sun = 1 - smooth(0, 0.8, d);
      moon = d < 0.6 ? 0.4 - 0.15 * smooth(0, 0.6, d) : 0.25 + 0.75 * smooth(0.6, 1, d);
      mx = RIGHT - (RIGHT - LEFT) * drift(d);
      my = LOW - Math.sin(Math.PI * d) * (LOW - HIGH) * 0.3;
      mins = 6 * 60 + d * 720;                     // 6:00 AM → 6:00 PM
    }
    s.setProperty("--stars", stars.toFixed(3));
    s.setProperty("--sun", sun.toFixed(3));
    s.setProperty("--moonv", moon.toFixed(3));
    s.setProperty("--mx", mx.toFixed(2) + "vw");
    s.setProperty("--my", my.toFixed(1) + "px");

    clock = clock || document.querySelector("[data-clock]");
    ampm = ampm || document.querySelector("[data-ampm]");
    if (clock) {
      const m = Math.round(mins) % 1440, h = Math.floor(m / 60), mm = m % 60;
      const txt = `${h % 12 === 0 ? 12 : h % 12}:${String(mm).padStart(2, "0")}`;
      if (txt !== lastClock) { clock.textContent = txt; ampm.textContent = h >= 12 ? "PM" : "AM"; lastClock = txt; }
    }
  };

  measure();
  addEventListener("resize", () => { measure(); paint(t); });

  // Start where the last page left off.
  const prev = read();
  let t = !reduce && !isNaN(prev) ? prev : pageHour;
  paint(t);

  // Motion: "glide" between pages (eased in and out); "follow" eases toward a moving target (Home scrolling).
  let target = t, raf = 0, mode = null, from = 0, startAt = 0, dur = 0, afterGlide = null;
  const easeInOut = (p) => (1 - Math.cos(Math.PI * p)) / 2;   // gentle sine ease in and out
  const tick = (now) => {
    if (mode === "glide") {
      const p = Math.min(1, (now - startAt) / dur);
      t = from + (target - from) * easeInOut(p);
      paint(t);
      if (p < 1) { raf = requestAnimationFrame(tick); return; }
      raf = 0; mode = null;
      if (afterGlide) afterGlide();
      return;
    }
    const d = target - t;
    if (Math.abs(d) > 0.0003) { t += d * 0.12; paint(t); raf = requestAnimationFrame(tick); return; }
    t = target; paint(t); raf = 0; mode = null;
  };
  // Glide forward to an hour; returns the (unwrapped) value we'll arrive at.
  const glideTo = (hour) => {
    from = t;
    let dest = hour;
    while (dest < from - 0.0003) dest += CYCLE;    // never run backwards: carry on through the day
    target = dest;
    if (reduce || Math.abs(dest - from) < 0.0003) { t = dest; paint(t); if (afterGlide) afterGlide(); return dest; }
    // ~1.25 s to the next page; longer trips (e.g. back through the day) take longer, up to ~4 s
    dur = Math.min(4000, 1000 + 1700 * (dest - from));
    startAt = performance.now(); mode = "glide";
    if (!raf) raf = requestAnimationFrame(tick);
    return dest;
  };
  const followTo = (to) => {
    target = to;
    if (reduce) { t = to; paint(t); return; }
    mode = "follow";
    if (!raf) raf = requestAnimationFrame(tick);
  };

  addEventListener("pagehide", () => write(wrap(t)));
  addEventListener("pageshow", (e) => { if (e.persisted) glideTo(pageHour); });

  const start = () => {
    // Home: scrolling (either direction) moves the evening on a little — forward only, up to scrollSpan.
    let nudge = 0, base = 0;
    if (scrollSpan > 0) {
      afterGlide = () => { if (nudge > 0) followTo(base + nudge); };
      let lastY = scrollY;
      addEventListener("scroll", () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        const dy = Math.abs(scrollY - lastY);
        lastY = scrollY;
        if (!dy || max <= 0 || nudge >= scrollSpan) return;
        nudge = Math.min(scrollSpan, nudge + (dy / max) * scrollSpan);
        if (mode !== "glide") followTo(base + nudge);
      }, { passive: true });
    }
    base = glideTo(pageHour);

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
