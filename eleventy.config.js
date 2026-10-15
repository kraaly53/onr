import fs from "node:fs";
import { HtmlBasePlugin } from "@11ty/eleventy";

const site = JSON.parse(fs.readFileSync("./src/_data/site.json", "utf8"));
const byOrder = (a, b) => (a.data.order ?? 999) - (b.data.order ?? 999);
const POSTS_PER_PAGE = 5; // keep in sync with pagination.size in src/blog/index.njk
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const slug = (s) => String(s).toLowerCase().trim().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Split a list of posts into pages of POSTS_PER_PAGE, for one archive (a category, tag or month).
function archivePages(kind, name, base, posts) {
  const pages = [];
  for (let i = 0; i < posts.length; i += POSTS_PER_PAGE) pages.push(posts.slice(i, i + POSTS_PER_PAGE));
  return pages.map((chunk, n) => ({
    kind, name, posts: chunk, total: posts.length,
    pageNumber: n + 1, totalPages: pages.length,
    url: n === 0 ? base : `${base}page/${n + 1}/`,
    newer: n === 0 ? null : n === 1 ? base : `${base}page/${n}/`,
    older: n === pages.length - 1 ? null : `${base}page/${n + 2}/`,
  }));
}

export default function (eleventyConfig) {
  // Links in the finished HTML are rewritten for the folder the site is published in (PATH_PREFIX, e.g. "/testing/onr/").
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy("src/.htaccess"); // caching rules for the web server
  // Photos, audio and thumbnails live here once they're moved into the repo.
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/audio");
  eleventyConfig.addPassthroughCopy("src/sample");

  // Prefix media paths with site.assetBase (the live site during the preview; "" once media is in the repo).
  eleventyConfig.amendLibrary("md", (md) => md.set({ linkify: true, typographer: false }));

  eleventyConfig.addFilter("slug", slug);
  eleventyConfig.addFilter("readableDate", (d) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
  );
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString());
  eleventyConfig.addFilter("rfcDate", (d) => new Date(d).toUTCString());
  eleventyConfig.addFilter("excerpt", (html, words = 55) => {
    const text = String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const parts = text.split(" ");
    return parts.length <= words ? text : parts.slice(0, words).join(" ").replace(/[,;:.…]+$/, "") + "…";
  });
  eleventyConfig.addFilter("plain", (html) => String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());

  eleventyConfig.addFilter("asset", (path) => (path ? site.assetBase.replace(/\/$/, "") + path : ""));

  eleventyConfig.addCollection("team", (api) => api.getFilteredByGlob("src/team/*.md").sort(byOrder));
  eleventyConfig.addCollection("production", (api) =>
    api.getFilteredByGlob("src/team/*.md").filter((p) => p.data.group === "production").sort(byOrder)
  );
  eleventyConfig.addCollection("talent", (api) =>
    api.getFilteredByGlob("src/team/*.md").filter((p) => p.data.group !== "production").sort(byOrder)
  );
  eleventyConfig.addCollection("spots", (api) => api.getFilteredByGlob("src/work/*.md").sort(byOrder));

  // Cache-busting: every build adds ?v=<build time> to the site's own CSS and JS links, so browsers and the
  // hosting's cache fetch fresh copies after each deploy instead of reusing old ones.
  const buildVersion = Date.now().toString(36);
  eleventyConfig.addTransform("asset-version", (content, outputPath) => {
    if (!outputPath || !outputPath.endsWith(".html")) return content;
    return content.replace(/((?:href|src)=")([^"?#]*\/assets\/[^"?#]+\.(?:css|js))(")/g, `$1$2?v=${buildVersion}$3`);
  });

  // ---- Blog ----
  const posts = (api) => api.getFilteredByGlob("src/blog/posts/*.md").sort((a, b) => b.date - a.date);
  eleventyConfig.addCollection("posts", posts);

  // Category, tag and month archives at the same addresses WordPress used.
  eleventyConfig.addCollection("blogArchives", (api) => {
    const all = posts(api);
    const groups = { category: new Map(), tag: new Map(), month: new Map() };
    const add = (kind, key, name, base, post) => {
      if (!groups[kind].has(key)) groups[kind].set(key, { name, base, posts: [] });
      groups[kind].get(key).posts.push(post);
    };
    for (const p of all) {
      for (const c of p.data.categories || []) add("category", slug(c), c, `/blog/category/${slug(c)}/`, p);
      for (const t of p.data.keywords || []) add("tag", slug(t), t, `/blog/tag/${slug(t)}/`, p);
      const d = p.date, y = d.getUTCFullYear(), m = String(d.getUTCMonth() + 1).padStart(2, "0");
      add("month", `${y}-${m}`, `${MONTHS[d.getUTCMonth()]} ${y}`, `/blog/${y}/${m}/`, p);
    }
    return Object.entries(groups).flatMap(([kind, map]) =>
      [...map.values()].flatMap((g) => archivePages(kind, g.name, g.base, g.posts))
    );
  });

  // Sidebar lists: categories and months with post counts.
  eleventyConfig.addCollection("blogCategories", (api) => {
    const counts = new Map();
    for (const p of posts(api)) for (const c of p.data.categories || []) counts.set(c, (counts.get(c) || 0) + 1);
    return [...counts].sort((a, b) => a[0].localeCompare(b[0])).map(([name, count]) => ({ name, count, url: `/blog/category/${slug(name)}/` }));
  });
  eleventyConfig.addCollection("blogMonths", (api) => {
    const months = new Map();
    for (const p of posts(api)) {
      const d = p.date, y = d.getUTCFullYear(), m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const k = `${y}/${m}`;
      if (!months.has(k)) months.set(k, { name: `${MONTHS[d.getUTCMonth()]} ${y}`, url: `/blog/${k}/`, count: 0 });
      months.get(k).count++;
    }
    return [...months.values()];
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    // "/" locally; the deploy workflow sets PATH_PREFIX to the folder on the web server.
    pathPrefix: process.env.PATH_PREFIX || "/",
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
