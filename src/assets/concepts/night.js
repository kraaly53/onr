// Concept 3 — "Night Shift": one night across the whole site.
//
// The sky: each page sits at an hour of the night, in menu order — Home is dusk (6 PM) … Contact is first light
// (~5 AM). Moving between pages, the sky colours, stars and clock glide on from the previous page's hour. Time only
// runs forward: going back to an earlier page carries on through dawn and the day to that hour the next evening.
//
// The moon: it comes to rest beside the last word of each page's title and lights the title up. On a first visit
// to Home it starts in the evening sky above the title, then floats over to "Inc."; on every other page it floats
// from wherever it was on the previous page. It stays with the title as you scroll, and waits just below the menu
// bar once the title has scrolled away.
//
// Smoothness: this file runs before the first paint (not deferred, placed right after the header), so the first
// frame is already right; motion is eased in and out; only the sky layer changes per frame, and the moon moves by
// transform.
(() => {
  const sky = document.querySelector(".sky");
  const body = document.body;
  if (!sky) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const num = (v, d) => { const n = parseFloat(v); return isNaN(n) ? d : n; };
  const pageHour = num(body.dataset.hour, 0.5);
  const scrollSpan = num(body.dataset.scrollSpan, 0);
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch {} },
  };
  const smooth = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
  const ease = (p) => (1 - Math.cos(Math.PI * p)) / 2;   // gentle sine ease in and out

  /* ------------------------------------------------------------------ the sky and clock (the hour) */

  // 0 → 1 is the night (6 PM → 6 AM); 1 → CYCLE is the day, back round to dusk.
  const DAY = 1, CYCLE = 1 + DAY;
  const wrap = (u) => ((u % CYCLE) + CYCLE) % CYCLE;
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

  let clock, ampm, lastClock = "", pinned = false, moonEl = null, beam = null;
  const paintHour = (u) => {
    const t = wrap(u);
    let i = 0;
    while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
    const [t0, ...a] = keys[i], [t1, ...b] = keys[i + 1];
    const f = (t - t0) / (t1 - t0 || 1);
    const s = sky.style;
    s.setProperty("--sky-top", mix(a[0], b[0], f));
    s.setProperty("--sky-mid", mix(a[1], b[1], f));
    s.setProperty("--sky-low", mix(a[2], b[2], f));
    let stars, sun, moon, mins;
    if (t <= 1) {
      stars = t < 0.5 ? smooth(0.04, 0.3, t) : 1 - smooth(0.8, 0.98, t);
      sun = smooth(0.84, 1, t);
      moon = 1 - 0.6 * sun;                        // pales at first light but stays in the sky
      mins = 18 * 60 + t * 720;                    // 6:00 PM → 6:00 AM
    } else {
      const d = t - 1;
      stars = 0;
      sun = 1 - smooth(0, 0.8, d);
      moon = d < 0.6 ? 0.4 - 0.15 * smooth(0, 0.6, d) : 0.25 + 0.75 * smooth(0.6, 1, d);
      mins = 6 * 60 + d * 720;                     // 6:00 AM → 6:00 PM
    }
    s.setProperty("--stars", stars.toFixed(3));
    s.setProperty("--sun", sun.toFixed(3));
    s.setProperty("--moonv", moon.toFixed(3));
    if (pinned) { moonEl.style.setProperty("--moonv", moon.toFixed(3)); beam.style.setProperty("--moonv", moon.toFixed(3)); }
    clock = clock || document.querySelector("[data-clock]");
    ampm = ampm || document.querySelector("[data-ampm]");
    if (clock) {
      const m = Math.round(mins) % 1440, h = Math.floor(m / 60), mm = m % 60;
      const txt = `${h % 12 === 0 ? 12 : h % 12}:${String(mm).padStart(2, "0")}`;
      if (txt !== lastClock) { clock.textContent = txt; ampm.textContent = h >= 12 ? "PM" : "AM"; lastClock = txt; }
    }
  };

  let hour = num(store.get("nightHour"), NaN);
  if (reduce || isNaN(hour)) hour = pageHour;
  paintHour(hour);

  let hourAnim = 0;
  const hourTo = (to, durMs, done) => {
    let dest = to;
    while (dest < hour - 0.0003) dest += CYCLE;    // never run backwards: carry on through the day
    cancelAnimationFrame(hourAnim);
    if (reduce || Math.abs(dest - hour) < 0.0003) { hour = dest; paintHour(hour); if (done) done(); return; }
    const from = hour, start = performance.now();
    const dur = durMs || Math.min(4000, 1000 + 1700 * (dest - from));
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      hour = from + (dest - from) * ease(p);
      paintHour(hour);
      if (p < 1) hourAnim = requestAnimationFrame(step);
      else if (done) done();
    };
    hourAnim = requestAnimationFrame(step);
  };

  /* ------------------------------------------------------------------ the moon */

  moonEl = sky.querySelector(".moon");
  beam = document.createElement("div");      // soft pool of moonlight behind the title's last word
  beam.className = "moonbeam";
  sky.appendChild(beam);
  const radius = () => (moonEl ? moonEl.offsetWidth / 2 : 30);
  const REST_SCALE = 1.3;                          // the moon grows a little as it settles beside the title
  const barBottom = () => { const b = document.querySelector(".top"); return b ? b.getBoundingClientRect().bottom : 70; };

  // Home's opening spot: up in the evening sky, top left, above the title
  const homeSpot = () => ({ x: Math.max(radius() + 8, innerWidth * 0.1), y: barBottom() + radius() + 6 + Math.max(14, innerHeight * 0.03) });

  // The last word of the page title (works with the coloured <span> inside titles)
  let title = null, word = null;
  const findWord = () => {
    title = document.querySelector("main h1");
    if (!title) return;
    const walk = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
    let last = null;
    while (walk.nextNode()) if (walk.currentNode.textContent.trim()) last = walk.currentNode;
    if (!last) return;
    const txt = last.textContent, end = txt.replace(/\s+$/, "").length, start = txt.slice(0, end).search(/\S+$/);
    word = document.createRange();
    word.setStart(last, start);
    word.setEnd(last, end);
  };

  // Where the moon rests: just after the last word, a little above its middle. If there isn't room beside the
  // word (titles run to the edge on phones) it rests just above the title, lined up with the end of the word, so
  // it never covers a letter. It never rises behind the menu bar.
  const restingSpot = (clampToBar = true) => {
    if (!word) return homeSpot();
    const rects = word.getClientRects();
    const r = rects[rects.length - 1] || word.getBoundingClientRect();
    const rad = radius() * REST_SCALE, gap = 14;
    let x, y;
    // would the moon beside the word touch any letters of the title (e.g. the line above on a phone)?
    const touchesTitle = (cx, cy) => {
      // check against the lines of text themselves (not the boxes of the elements around them)
      const walk = document.createTreeWalker(title, NodeFilter.SHOW_TEXT), rg = document.createRange();
      while (walk.nextNode()) {
        rg.selectNodeContents(walk.currentNode);
        for (const q of rg.getClientRects()) {
          // a text box is taller than its letters (accents and descender room), so only its middle counts
          if (cx + rad > q.left && cx - rad < q.right && cy + rad > q.top + q.height * 0.22 && cy - rad < q.bottom - q.height * 0.26) return true;
        }
      }
      return false;
    };
    const multiLine = title.getBoundingClientRect().height > r.height * 1.6;
    const bx = r.right + gap + rad * 0.85;
    const roomBeside = r.right + gap + rad * 2 <= innerWidth - gap;
    // beside the word: try a little above its middle, then a little lower if that would touch the line above
    const by = [r.top + r.height * (multiLine ? 0.5 : 0.3), r.top + r.height * 0.62].find((cy) => roomBeside && !touchesTitle(bx, cy));
    if (by !== undefined) {
      x = bx;
      y = by;
    } else {
      // above the title — and above the small label over it, if there is one
      const t = title.getBoundingClientRect();
      const label = title.previousElementSibling;
      const top = label && /stamp-time|eyebrow/.test(label.className) ? label.getBoundingClientRect().top : t.top;
      x = Math.min(r.right - rad * 0.5, innerWidth - rad - gap);
      y = top - rad - 8;
    }
    if (clampToBar) y = Math.max(y, barBottom() + rad + 6);
    return { x, y, r };
  };

  let pos = null, settled = false, lit = false;
  let scale = 1;
  const sizeMoon = (k) => { scale = k; sky.style.setProperty("--ms", k.toFixed(3)); };
  const placeMoon = (p) => {
    pos = p;
    sky.style.setProperty("--mx", p.x.toFixed(1) + "px");
    sky.style.setProperty("--my", p.y.toFixed(1) + "px");
  };
  const placeBeam = (spot) => {
    if (!spot.r) return;
    const { r } = spot;
    sky.style.setProperty("--bx", (r.left + r.width / 2).toFixed(1) + "px");
    sky.style.setProperty("--by", (r.top + r.height / 2).toFixed(1) + "px");
    sky.style.setProperty("--bw", (r.width * 2.4 + 120).toFixed(0) + "px");
    sky.style.setProperty("--bh", (r.height * 2.2 + 60).toFixed(0) + "px");
  };
  const light = (on) => {
    if (on === lit || !title) return;
    lit = on;
    title.classList.toggle("is-moonlit", on);
    beam.classList.toggle("is-on", on);
  };

  // Start: where the moon was on the previous page, or Home's opening spot on a first visit.
  const saved = (() => { try { return JSON.parse(store.get("nightMoon") || "null"); } catch { return null; } })();
  placeMoon(saved && !reduce ? { x: saved.fx * innerWidth, y: saved.fy * innerHeight } : homeSpot());
  sizeMoon(saved && !reduce && saved.s ? saved.s : 1);

  let moonAnim = 0;
  const floatToTitle = (delay) => {
    const from = { ...pos }, startAt = performance.now() + delay;
    const first = restingSpot();
    const dist = Math.hypot(first.x - from.x, first.y - from.y);
    const fromScale = scale;
    if (reduce || dist < 2) { placeMoon(first); placeBeam(first); sizeMoon(REST_SCALE); settled = true; light(true); pinToPage(); return; }
    const dur = Math.min(2200, 1100 + dist * 1.1);
    const lift = Math.min(70, dist * 0.18);        // a soft rising curve rather than a straight line
    const step = (now) => {
      if (now < startAt) { moonAnim = requestAnimationFrame(step); return; }
      const p = Math.min(1, (now - startAt) / dur), e = ease(p);
      const to = restingSpot();                    // the title can move (fonts, scrolling) while we travel
      placeMoon({ x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e - Math.sin(Math.PI * p) * lift });
      sizeMoon(fromScale + (REST_SCALE - fromScale) * e);
      placeBeam(to);
      if (p > 0.7) light(true);
      if (p < 1) { moonAnim = requestAnimationFrame(step); return; }
      settled = true;
      pinToPage();
    };
    moonAnim = requestAnimationFrame(step);
  };

  // Once it's arrived, the moon is pinned to the page beside the title, so it scrolls with the title exactly
  // (the browser moves it — no lag) and goes off screen with it. Resizing or late-loading fonts re-place it.
  const pinToPage = () => {
    if (pinned || !moonEl) return;
    pinned = true;
    for (const el of [moonEl, beam]) {
      el.setAttribute("aria-hidden", "true");
      el.classList.add("is-pinned");
      el.style.setProperty("--moonv", sky.style.getPropertyValue("--moonv"));
      document.body.appendChild(el);
    }
    moonEl.style.setProperty("--ms", scale.toFixed(3));
    placePinned();
  };
  const placePinned = () => {
    const spot = restingSpot(false), sx = scrollX, sy = scrollY;
    moonEl.style.setProperty("--mx", (spot.x + sx).toFixed(1) + "px");
    moonEl.style.setProperty("--my", (spot.y + sy).toFixed(1) + "px");
    if (spot.r) {
      const { r } = spot;
      beam.style.setProperty("--bx", (r.left + r.width / 2 + sx).toFixed(1) + "px");
      beam.style.setProperty("--by", (r.top + r.height / 2 + sy).toFixed(1) + "px");
      beam.style.setProperty("--bw", (r.width * 2.4 + 120).toFixed(0) + "px");
      beam.style.setProperty("--bh", (r.height * 2.2 + 60).toFixed(0) + "px");
    }
  };
  let follow = 0;
  const reattach = () => {
    if (!pinned) return;
    cancelAnimationFrame(follow);
    follow = requestAnimationFrame(placePinned);
  };
  addEventListener("resize", reattach);

  addEventListener("pagehide", () => {
    store.set("nightHour", String(wrap(hour)));
    // remember where the moon is on screen, kept inside the window so the next page can float it in from there
    let x = pos ? pos.x : innerWidth / 2, y = pos ? pos.y : innerHeight / 3;
    if (pinned) { const b = moonEl.getBoundingClientRect(); x = b.left + b.width / 2; y = b.top + b.height / 2; }
    const rad = radius() * scale;
    x = Math.min(Math.max(x, rad), innerWidth - rad);
    y = Math.min(Math.max(y, barBottom() + rad), innerHeight - rad);
    store.set("nightMoon", JSON.stringify({ fx: x / innerWidth, fy: y / innerHeight, s: scale }));
  });

  /* ------------------------------------------------------------------ start */

  const start = () => {
    findWord();
    let arrived = false;
    hourTo(pageHour, 0, () => (arrived = true));
    // First visit to Home: let the moon sit in its opening spot for a moment before it floats to the title
    floatToTitle(!saved ? 700 : 0);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(reattach);
    addEventListener("load", reattach);

    // Home: scrolling (either direction) moves the evening on a little — forward only, up to scrollSpan.
    if (scrollSpan > 0) {
      let lastY = scrollY, nudge = 0;
      addEventListener("scroll", () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        const dy = Math.abs(scrollY - lastY);
        lastY = scrollY;
        if (!arrived || !dy || max <= 0 || nudge >= scrollSpan) return;   // let the arrival finish first
        nudge = Math.min(scrollSpan, nudge + (dy / max) * scrollSpan);
        hourTo(pageHour + nudge, 500);
      }, { passive: true });
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
