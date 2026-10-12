// Concept 5 — "Bento": numbers that count up as they come into view, and the Gold / Silver price toggle.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Count-up stats (1998, 50,000). The real number is in the page; this only animates towards it.
  const stats = document.querySelectorAll("[data-count]");
  if (stats.length && "IntersectionObserver" in window && !reduce) {
    const run = (el) => {
      const end = +el.dataset.count, plain = "plain" in el.dataset, start = plain ? Math.max(0, end - 60) : 0;
      const t0 = performance.now(), dur = 1400;
      const fmt = (n) => (plain ? String(n) : n.toLocaleString("en-US"));
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(start + (end - start) * e));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { io.unobserve(e.target); run(e.target); }
    }), { threshold: 0.6 });
    stats.forEach((el) => io.observe(el));
  }

  // Services: Gold / Silver package toggle
  const seg = document.querySelector("[data-seg]");
  const tiers = document.querySelector("[data-tiers]");
  if (seg && tiers) {
    seg.addEventListener("click", (e) => {
      const b = e.target.closest("[data-tier]");
      if (!b) return;
      seg.querySelectorAll("[data-tier]").forEach((x) => {
        x.classList.toggle("is-on", x === b);
        x.setAttribute("aria-pressed", String(x === b));
      });
      tiers.dataset.show = b.dataset.tier;
    });
  }
})();
