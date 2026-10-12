// Concept 3 — "Night Shift": the sky, moon, sun, stars and clock follow the hour of the night.
// Home page: the hour follows your scroll (6 PM at the top, 6 AM at the bottom). Other pages: a fixed hour.
(() => {
  const root = document.documentElement.style;
  const hourAttr = document.body.dataset.hour;
  const clock = document.querySelector("[data-clock]");
  const ampm = document.querySelector("[data-ampm]");

  // Sky colours through the night: [t, top, middle, horizon]
  const keys = [
    [0.00, "#2a3a7a", "#b8678a", "#f6ad6a"],
    [0.14, "#141d4d", "#3b2f6b", "#7a4a7a"],
    [0.32, "#0a0f2e", "#121a44", "#1d2758"],
    [0.50, "#05061a", "#0b1030", "#141c48"],
    [0.70, "#070a22", "#10173d", "#1e2654"],
    [0.86, "#1d2456", "#4f3c7c", "#c47d8c"],
    [1.00, "#6d8fcf", "#f0b6a6", "#ffd89a"],
  ];
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, f) => { const x = hex(a), y = hex(b); return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * f)).join(" ")})`; };
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  const paint = (t) => {
    t = Math.min(1, Math.max(0, t));
    let i = 0;
    while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
    const [t0, ...c0] = keys[i], [t1, ...c1] = keys[i + 1];
    const f = (t - t0) / (t1 - t0 || 1);
    root.setProperty("--sky-top", mix(c0[0], c1[0], f));
    root.setProperty("--sky-mid", mix(c0[1], c1[1], f));
    root.setProperty("--sky-low", mix(c0[2], c1[2], f));
    root.setProperty("--stars", (t < 0.5 ? smooth(0.04, 0.3, t) : 1 - smooth(0.78, 0.96, t)).toFixed(3));
    root.setProperty("--sun", smooth(0.84, 1, t).toFixed(3));
    // The moon arcs across the right-hand sky, clear of the headlines
    root.setProperty("--mx", (62 + t * 32).toFixed(2) + "%");
    root.setProperty("--my", (70 - Math.sin(Math.PI * t) * 58).toFixed(2) + "%");
    // Clock: 6:00 PM → 6:00 AM
    const mins = Math.round(18 * 60 + t * 720) % 1440, h24 = Math.floor(mins / 60), m = mins % 60;
    if (clock) {
      clock.textContent = `${h24 % 12 === 0 ? 12 : h24 % 12}:${String(m).padStart(2, "0")}`;
      ampm.textContent = h24 >= 12 ? "PM" : "AM";
    }
  };

  // Team: join each star to its nearest neighbours (a minimum spanning tree), leaving out long jumps,
  // so the voices form a handful of constellations.
  const lines = document.querySelector("[data-lines]");
  if (lines) {
    const stars = [...document.querySelectorAll(".constellation .star")].map((el) => ({
      x: parseFloat(el.style.getPropertyValue("--x")), y: parseFloat(el.style.getPropertyValue("--y")),
    }));
    const d = (a, b) => Math.hypot(a.x - b.x, (a.y - b.y) * 0.5);
    const inTree = new Set([0]), edges = [];
    while (inTree.size < stars.length) {
      let best = null;
      for (const i of inTree) for (let j = 0; j < stars.length; j++) {
        if (inTree.has(j)) continue;
        const dist = d(stars[i], stars[j]);
        if (!best || dist < best[2]) best = [i, j, dist];
      }
      inTree.add(best[1]);
      if (best[2] < 11) edges.push(best);
    }
    lines.innerHTML = edges.map(([i, j]) => `<line x1="${stars[i].x}" y1="${stars[i].y}" x2="${stars[j].x}" y2="${stars[j].y}"/>`).join("");
  }

  if (hourAttr === "scroll") {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        paint(max > 0 ? scrollY / max : 0);
      });
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    onScroll();
  } else {
    paint(parseFloat(hourAttr) || 0.5);
  }
})();
